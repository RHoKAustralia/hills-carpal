import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '../../../src/common/model';

import ClientRepository from '../../../src/server/api/clients/client-repository';
import DatabaseManager from '../../../src/server/api/database/database-manager';
import { requireFacilitatorPermissions } from '../../../src/server/api/authz';

const databaseManager = new DatabaseManager();
const clientRepository = new ClientRepository(databaseManager);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, body } = req;

  const connection = await databaseManager.createConnection();
  try {
    if (await requireFacilitatorPermissions(req, res, connection)) {
      switch (method) {
        case 'GET':
          const inactive =
            typeof req.query.inactive !== 'undefined'
              ? req.query.inactive === 'true'
                ? true
                : false
              : undefined;

          const clients = await clientRepository.list(connection, inactive);
          res.status(200).json(clients);

          break;
        case 'POST':
          const client: Client = {
            ...body,
            preferredDriverGender: body.preferredDriverGender || 'any',
            preferredCarType: body.preferredCarType || 'All',
          };

          const result = await clientRepository.create(client, connection);

          res.status(200).json({
            ...body,
            id: result,
          });

          break;

        // case 'PUT':
        //   // Update or create data in your database
        //   res.status(200).json({ id, name: name || `User ${id}` });
        //   break;
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
