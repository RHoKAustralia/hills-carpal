import { NextApiRequest, NextApiResponse } from 'next';

import RideRepository from '../../../src/api/rides/ride-repository';
import DatabaseManager from '../../../src/api/database/database-manager';

const databaseManager = new DatabaseManager();
const rideRepository = new RideRepository(databaseManager);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { query, method } = req;

  const parsed = {
    driverId: query.driverId,
  };

  switch (method) {
    case 'GET':
      const connection = databaseManager.createConnection();
      const rides = await rideRepository.listForDriver(
        parsed.driverId as string,
        connection
      );
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
};
