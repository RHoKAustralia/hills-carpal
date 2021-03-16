import { NextApiRequest, NextApiResponse } from 'next';
import _ from 'lodash';
import moment from 'moment';

import RideRepository from '../../../../src/server/api/rides/ride-repository';
import DatabaseManager from '../../../../src/server/api/database/database-manager';
import {
  decodeJwt,
  requireDriverPermissions,
  requireFacilitatorPermissions,
} from '../../../../src/server/api/jwt';
import notifyCancelled from '../../../../src/server/notifications/notify-cancelled';
import { RideInput } from '../../../../src/common/model';

const databaseManager = new DatabaseManager();
const rideRepository = new RideRepository(databaseManager);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  const connection = databaseManager.createConnection();

  try {
    switch (method) {
      case 'PUT':
        if (await requireFacilitatorPermissions(req, res)) {
          const existingRide = await rideRepository.get(
            Number.parseInt(req.query.id as string),
            connection
          );

          const input = req.body as RideInput;

          // If the ride is being reopened, it needs to be in the future
          if (
            existingRide.status === 'CANCELLED' &&
            (input.status === 'OPEN' || input.status === 'CONFIRMED') &&
            moment(input.pickupTimeAndDate).isBefore(moment.now())
          ) {
            res.status(409).json({
              status: 'Error',
              message: 'Cannot open a cancelled ride after the ride date',
            });
            return;
          }

          const updatedRide = await rideRepository.update(
            Number.parseInt(req.query.id as string),
            req.body,
            connection
          );

          if (
            updatedRide.status === 'CANCELLED' &&
            existingRide.status !== 'CANCELLED' &&
            updatedRide.driver.id
          ) {
            // Ride has just been cancelled - notify the driver
            notifyCancelled(updatedRide);
          }

          res.status(200).json(updatedRide);
        }
        break;
      case 'GET':
        const claims = await decodeJwt(req);
        if (requireDriverPermissions(claims, req, res)) {
          const ride = await rideRepository.get(
            Number.parseInt(req.query.id as string),
            connection
          );
          res.status(200).json(ride);
        }
        break;
      default:
        res.setHeader('Allow', ['PUT', 'GET']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'Error' });
  } finally {
    databaseManager.closeConnection(connection);
  }
};
