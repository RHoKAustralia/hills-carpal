import { NextApiRequest, NextApiResponse } from 'next';

import DriverRepository from '../../../src/server/api/driver-repository';
import DatabaseManager from '../../../src/server/api/database/database-manager';
import { Driver } from '../../../src/common/model';
import { requireFacilitatorPermissions } from '../../../src/server/api/jwt';

const databaseManager = new DatabaseManager();
const driverRepository = new DriverRepository(databaseManager);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, body } = req;

  const connection = await databaseManager.createConnection();
  try {
    if (await requireFacilitatorPermissions(req, res)) {
      switch (method) {
        case 'PUT':
          const driver: Driver = body;

          await driverRepository.update(
            parseInt(req.query.driverId as string),
            driver,
            connection
          );
          res.status(200).json(body);

          break;
        case 'DELETE':
          await driverRepository.delete(
            parseInt(req.query.driverId as string),
            connection
          );
          res.status(200).json(body);

          break;
        default:
          res.setHeader('Allow', ['PUT', 'DELETE']);
          res.status(405).end(`Method ${method} Not Allowed`);
      }
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'Error' });
  } finally {
    await connection.end();
  }
};
