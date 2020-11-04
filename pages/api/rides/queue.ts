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

      try {
        const rides = await rideRepository.listForDriver(
          parsed.driverId as string,
          'CONFIRMED',
          connection
        );
        res.status(200).json(rides);
      } catch (e) {
        res.status(500).json({ status: 'Error' });
      } finally {
        databaseManager.closeConnection(connection);
      }
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};
