import { NextApiRequest, NextApiResponse } from 'next';

import ImageRepository from '../../../../../src/server/api/clients/image-repository';
import DatabaseManager from '../../../../../src/server/api/database/database-manager';
import {
  decodeJwt,
  requireDriverPermissions,
  requireFacilitatorPermissions,
} from '../../../../../src/server/api/jwt';

const databaseManager = new DatabaseManager();
const imageRepository = new ImageRepository(databaseManager);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  const connection = await databaseManager.createConnection();
  try {
    switch (method) {
      case 'GET':
        const claims = await decodeJwt(req);
        if (requireDriverPermissions(claims, req, res)) {
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
