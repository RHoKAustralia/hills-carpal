import { NextApiRequest, NextApiResponse } from 'next';

import RideRepository from '../../../src/server/api/rides/ride-repository';
import DatabaseManager from '../../../src/server/api/database/database-manager';
import {
  verifyJwt,
  requireDriverPermissions,
} from '../../../src/server/api/authz';

const databaseManager = new DatabaseManager();
const rideRepository = new RideRepository(databaseManager);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case 'GET':
      const connection = await databaseManager.createConnection();

      try {
        const jwt = await verifyJwt(req);

        if (await requireDriverPermissions(req, res, connection, jwt)) {
          const rides = await rideRepository.listForDriver(
            jwt.userId,
            'CONFIRMED',
            connection
          );
          res.status(200).json(rides);
        }
      } catch (e) {
        console.error(e);
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
