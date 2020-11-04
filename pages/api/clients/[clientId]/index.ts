import { NextApiRequest, NextApiResponse } from 'next';

import ClientRepository from '../../../../src/api/clients/client-repository';
import DatabaseManager from '../../../../src/api/database/database-manager';
import { Client } from '../../../../src/model';
import { requireFacilitatorPermissions } from '../../../../src/auth/jwt';

const databaseManager = new DatabaseManager();
const clientRepository = new ClientRepository(databaseManager);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, body } = req;

  const connection = databaseManager.createConnection();
  try {
    if (requireFacilitatorPermissions(req, res)) {
      switch (method) {
        case 'PUT':
          await clientRepository.update(
            parseInt(req.query.clientId as string),
            body as Client,
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
