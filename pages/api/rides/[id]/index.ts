import { NextApiRequest, NextApiResponse } from 'next';
import _ from 'lodash';
import moment from 'moment';

import RideRepository from '../../../../src/server/api/rides/ride-repository';
import DatabaseManager from '../../../../src/server/api/database/database-manager';
import {
  verifyJwt,
  requireDriverPermissions,
  requireFacilitatorPermissions,
} from '../../../../src/server/api/authz';
import notifyCancelled from '../../../../src/server/notifications/notify-cancelled';
import { Ride, RideInput } from '../../../../src/common/model';

const databaseManager = new DatabaseManager();
const rideRepository = new RideRepository(databaseManager);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  const connection = await databaseManager.createConnection();

  try {
    switch (method) {
      case 'PUT':
        if (await requireFacilitatorPermissions(req, res, connection)) {
          const existingRide = await rideRepository.get(
            Number.parseInt(req.query.id as string),
            connection
          );

          const input = req.body as Partial<RideInput>;

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

          // Can't make edits to a ride that's been accepted or completed
          // (because a user is expecting to drive the ride, or because it's beyond changing)
          if (
            rideShouldBeImmutable(existingRide) &&
            isRideChanged(input, existingRide)
          ) {
            res.status(401).json({
              status: 'Error',
              message: 'Cannot edit details of confirmed or ended ride',
            });
            return;
          }

          if (input.status === 'OPEN') {
            input.driver = undefined;
          }

          const updatedRide = await rideRepository.update(
            Number.parseInt(req.query.id as string),
            input,
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
        const claims = await verifyJwt(req);
        if (requireDriverPermissions(req, res, connection, claims)) {
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
    await connection.end();
  }
};

function isRideChanged(input: Partial<RideInput>, existingRide: Ride) {
  return (
    input.clientId !== existingRide.client.id ||
    input.description !== existingRide.description ||
    input.locationFrom.id !== existingRide.locationFrom.id ||
    input.locationTo.id !== existingRide.locationTo.id ||
    input.pickupTimeAndDate !== existingRide.pickupTimeAndDate
  );
}

function rideShouldBeImmutable(existingRide: Ride) {
  return existingRide.status === 'CONFIRMED' || existingRide.status === 'ENDED';
}
