import { NextApiRequest, NextApiResponse } from 'next';
import _ from 'lodash';

import RideRepository, {
  validSortLookup,
} from '../../../src/api/rides/ride-repository';
import DatabaseManager from '../../../src/api/database/database-manager';
import { requireFacilitatorPermissions } from '../../../src/auth/jwt';

const databaseManager = new DatabaseManager();
const rideRepository = new RideRepository(databaseManager);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  const connection = databaseManager.createConnection();

  try {
    if (requireFacilitatorPermissions(req, res)) {
      switch (method) {
        case 'POST':
          const newRide = await rideRepository.create(req.body, connection);
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
