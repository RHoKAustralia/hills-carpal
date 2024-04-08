import { NextApiRequest, NextApiResponse } from 'next';
import { Driver } from '../../../src/common/model';

import DriverRepository from '../../../src/server/api/rides/driver-repository';
import DatabaseManager from '../../../src/server/api/database/database-manager';
import { requireFacilitatorPermissions } from '../../../src/server/api/jwt';

const databaseManager = new DatabaseManager();
const driverRepository = new DriverRepository(databaseManager);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, body } = req;

  const connection = await databaseManager.createConnection();
  try {
    if (await requireFacilitatorPermissions(req, res)) {
      switch (method) {
        case 'GET':
          // const inactive =
          //   typeof req.query.inactive !== 'undefined'
          //     ? req.query.inactive === 'true'
          //       ? true
          //       : false
          //     : undefined;

          const drivers = await driverRepository.list(connection);
          res.status(200).json(drivers);

          break;
        case 'POST':
          const driver: Driver = body;

          const result = await driverRepository.create(driver, connection);

          res.status(200).json({
            ...body,
            id: result,
          });

          break;

        default:
          res.setHeader('Allow', ['GET', 'POST', 'PUT']);
          res.status(405).end(`Method ${method} Not Allowed`);
      }
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'Error' });
  } finally {
    await await connection.end();
  }
};
