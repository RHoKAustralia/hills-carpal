import { NextApiRequest, NextApiResponse } from 'next';

import RideRepository from '../../../src/api/rides/ride-repository';
import DatabaseManager from '../../../src/api/database/database-manager';
import { requireFacilitatorPermissions } from '../../../src/auth/jwt';

const databaseManager = new DatabaseManager();
const rideRepository = new RideRepository(databaseManager);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { query, method } = req;
  const connection = databaseManager.createConnection();

  try {
    if (requireFacilitatorPermissions(req, res)) {
      switch (method) {
        case 'GET':
          const rides = await rideRepository.listForFacilitator(connection);
          res.status(200).json(rides);
          break;
        // case 'PUT':
        //   // Update or create data in your database
        //   res.status(200).json({ id, name: name || `User ${id}` });
        //   break;
        default:
          res.setHeader('Allow', ['GET']);
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
