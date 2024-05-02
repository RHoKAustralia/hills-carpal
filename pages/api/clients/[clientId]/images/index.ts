import { NextApiRequest, NextApiResponse } from 'next';

import ImageRepository from '../../../../../src/server/api/clients/image-repository';
import DatabaseManager from '../../../../../src/server/api/database/database-manager';
import {
  verifyJwt,
  requireDriverPermissions,
  requireFacilitatorPermissions,
} from '../../../../../src/server/api/authz';

const databaseManager = new DatabaseManager();
const imageRepository = new ImageRepository(databaseManager);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  const connection = await databaseManager.createConnection();
  try {
    switch (method) {
      case 'GET':
        const claims = await verifyJwt(req);
        if (requireDriverPermissions(req, res, connection, claims)) {
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
    await connection.end();
  }
};
