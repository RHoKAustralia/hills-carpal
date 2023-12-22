import { NextApiRequest, NextApiResponse } from 'next';

import RideRepository from '../../../src/server/api/rides/ride-repository';
import DatabaseManager from '../../../src/server/api/database/database-manager';
import {
  decodeJwt,
  requireDriverPermissions,
} from '../../../src/server/api/jwt';

const databaseManager = new DatabaseManager();
const rideRepository = new RideRepository(databaseManager);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case 'GET':
      const connection = await databaseManager.createConnection();

      try {
        const jwt = await decodeJwt(req);

        if (requireDriverPermissions(jwt, req, res)) {
          const rides = await rideRepository.listForDriver(
            jwt.userId,
            'CONFIRMED',
            connection
          );
          res.status(200).json(rides);
        }
      } catch (e) {
        res.status(500).json({ status: 'Error' });
      } finally {
        await connection.end();
      }
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};
