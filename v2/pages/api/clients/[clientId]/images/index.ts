import { NextApiRequest, NextApiResponse } from 'next';

import ImageRepository from '../../../../../src/api/clients/image-repository';
import DatabaseManager from '../../../../../src/api/database/database-manager';
import { requireFacilitatorPermissions } from '../../../../../src/auth/jwt';

const databaseManager = new DatabaseManager();
const imageRepository = new ImageRepository(databaseManager);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, body } = req;

  const connection = databaseManager.createConnection();
  try {
    switch (method) {
      case 'GET':
        if (requireFacilitatorPermissions(req, res)) {
          const images = await imageRepository.list(
            connection,
            req.query.clientId as string
          );
          res.status(200).json(images);
        }

        break;
      default:
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'Error' });
  } finally {
    databaseManager.closeConnection(connection);
  }
};
