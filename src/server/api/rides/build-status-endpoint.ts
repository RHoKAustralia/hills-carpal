import { NextApiRequest, NextApiResponse } from 'next';
import _ from 'lodash';

import RideRepository from './ride-repository';
import DatabaseManager from '../database/database-manager';
import { requireDriverPermissions, decodeJwt } from '../jwt';
import { Ride, RideStatus } from '../../../common/model';
import notifyDeclined from '../../notifications/notify-declined';
import isRideInPast from '../../../common/util';
import notifyAvailableRide from '../../notifications/notify-available-ride';
import notifyOffered from '../../notifications/notify-offered';

const databaseManager = new DatabaseManager();
const rideRepository = new RideRepository(databaseManager);

export default (statusToChangeTo: RideStatus) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    const { method } = req;
    const connection = await databaseManager.createConnection();
    await databaseManager.query(
      'SET TRANSACTION ISOLATION LEVEL READ COMMITTED',
      connection
    );
    await connection.beginTransaction();

    try {
      const jwt = await decodeJwt(req);

      if (requireDriverPermissions(jwt, req, res)) {
        switch (method) {
          case 'PUT':
            const id = Number.parseInt(req.query.id as string);

            const oldRide = await rideRepository.get(id, connection, true);

            if (acceptingOrDecliningRideInPast(statusToChangeTo, oldRide)) {
              res
                .status(400)
                .json({ message: 'Cannot change status of ride in past' });
              return;
            }

            if (confirmingClosedRide(statusToChangeTo, oldRide)) {
              res.status(400).json({
                message: "Cannot confirm ride that isn't currently open",
              });
              return;
            }

            await rideRepository.setStatus(
              id,
              statusToChangeTo,
              statusToChangeTo !== 'OPEN' ? jwt.userId : null,
              statusToChangeTo !== 'OPEN' ? jwt.name : null,
              connection
            );

            const newRide = await rideRepository.get(id, connection);

            if (statusToChangeTo === 'OPEN') {
              await notifyDeclined(oldRide);
              await notifyAvailableRide(oldRide, 'declined');
            } else if (statusToChangeTo === 'CONFIRMED') {
              await notifyOffered(newRide);
            }

            await connection.commit();
            res.status(200).json(newRide);
            break;
          default:
            res.setHeader('Allow', ['PUT']);
            res.status(405).end(`Method ${method} Not Allowed`);
        }
      }
    } catch (e) {
      console.error(e);

      await connection.rollback();
      res.status(500).json({ status: 'Error' });
    } finally {
      await connection.end();
    }
  };

function endingRideInFuture(statusToChangeTo: RideStatus, oldRide: Ride) {
  return statusToChangeTo === 'ENDED' && !isRideInPast(oldRide);
}

function acceptingOrDecliningRideInPast(
  statusToChangeTo: RideStatus,
  oldRide: Ride
) {
  return (
    (statusToChangeTo === 'CONFIRMED' ||
      statusToChangeTo === 'CANCELLED' ||
      statusToChangeTo === 'OPEN') &&
    isRideInPast(oldRide)
  );
}

function confirmingClosedRide(statusToChangeTo: RideStatus, oldRide: Ride) {
  return statusToChangeTo === 'CONFIRMED' && oldRide.status !== 'OPEN';
}
