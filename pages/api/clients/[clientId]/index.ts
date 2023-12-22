import { NextApiRequest, NextApiResponse } from 'next';

import ClientRepository from '../../../../src/server/api/clients/client-repository';
import DatabaseManager from '../../../../src/server/api/database/database-manager';
import { Client } from '../../../../src/common/model';
import { requireFacilitatorPermissions } from '../../../../src/server/api/jwt';

const databaseManager = new DatabaseManager();
const clientRepository = new ClientRepository(databaseManager);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, body } = req;

  const connection = await databaseManager.createConnection();
  try {
    if (await requireFacilitatorPermissions(req, res)) {
      switch (method) {
        case 'PUT':
          const client: Client = {
            ...body,
            preferredDriverGender: body.preferredDriverGender || 'any',
            preferredCarType: body.preferredCarType || 'All',
          };

          await clientRepository.update(
            parseInt(req.query.clientId as string),
            client,
            connection
          );
          res.status(200).json(body);

          break;
        case 'DELETE':
          await clientRepository.delete(
            parseInt(req.query.clientId as string),
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
    databaseManager.closeConnection(connection);
  }
};
