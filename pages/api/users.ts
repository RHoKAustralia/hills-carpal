import { NextApiRequest, NextApiResponse } from 'next';
import { requireFacilitatorPermissions } from '../../src/server/api/jwt';
import { getUsers } from '../../src/server/auth/api-auth0';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, body } = req;

  try {
    if (await requireFacilitatorPermissions(req, res)) {
      switch (method) {
        case 'GET':
          const users = await getUsers();
          res.status(200).json(users);

          break;
        default:
          res.setHeader('Allow', ['GET', 'POST', 'PUT']);
          res.status(405).end(`Method ${method} Not Allowed`);
      }
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'Error' });
  }
};
