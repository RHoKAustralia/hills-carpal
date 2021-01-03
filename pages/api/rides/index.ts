import { NextApiRequest, NextApiResponse } from 'next';
import _ from 'lodash';

import RideRepository from '../../../src/server/api/rides/ride-repository';
import DatabaseManager from '../../../src/server/api/database/database-manager';
import {
  requireFacilitatorPermissions,
  decodeJwt,
} from '../../../src/server/api/jwt';
import { RideInput } from '../../../src/common/model';
import notifyNewRides from '../../../src/server/notifications/notify-new-ride';

const databaseManager = new DatabaseManager();
const rideRepository = new RideRepository(databaseManager);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  const connection = databaseManager.createConnection();

  const claims = decodeJwt(req);

  try {
    if (requireFacilitatorPermissions(req, res, claims)) {
      switch (method) {
        case 'POST':
          const rideInput: RideInput = {
            ...req.body,
            facilitatorEmail: claims.email,
            status: 'OPEN',
          };

          const rideId = await rideRepository.create(rideInput, connection);
          const newRide = await rideRepository.get(rideId, connection);

          await notifyNewRides(newRide);

          res.status(200).json(newRide);
          break;
        default:
          res.setHeader('Allow', ['POST']);
          res.status(405).end(`Method ${method} Not Allowed`);
      }
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'Error' });
  } finally {
    databaseManager.closeConnection(connection);
  }
};
