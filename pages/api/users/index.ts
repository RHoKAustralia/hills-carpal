import { NextApiRequest, NextApiResponse } from 'next';
import { requireFacilitatorPermissions } from '../../../src/server/api/authz';
import { getUsers } from '../../../src/server/auth/api-auth0';
import DatabaseManager from '../../../src/server/api/database/database-manager';

const databaseManager = new DatabaseManager();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, body } = req;

  const connection = await databaseManager.createConnection();

  try {
    if (await requireFacilitatorPermissions(req, res, connection)) {
      switch (method) {
        case 'GET':
          const users = await getUsers();
          res.status(200).json(users);

          break;
        default:
          res.setHeader('Allow', ['GET']);
          res.status(405).end(`Method ${method} Not Allowed`);
      }
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'Error' });
  }
};
