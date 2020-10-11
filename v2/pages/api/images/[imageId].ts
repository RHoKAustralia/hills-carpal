import { NextApiRequest, NextApiResponse } from 'next';

import ImageRepository from '../../../src/api/clients/image-repository';
import DatabaseManager from '../../../src/api/database/database-manager';
import {
  requireDriverPermissions,
  decodeJwt,
  requireFacilitatorPermissions,
} from '../../../src/auth/jwt';

const databaseManager = new DatabaseManager();
const imageRepository = new ImageRepository(databaseManager);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, body } = req;

  const connection = databaseManager.createConnection();
  try {
    switch (method) {
      case 'GET':
        const claims = decodeJwt(req);
        if (requireDriverPermissions(claims, req, res)) {
          const image = await imageRepository.get(
            connection,
            req.query.imageId as string
          );

          const binaryContent = new Buffer(image.content, 'base64');
          res.setHeader('Content-Type', image.mimeType);
          res.status(200);
          res.end(binaryContent, 'binary');
        }

        break;
      case 'PUT':
        if (requireFacilitatorPermissions(req, res)) {
          await imageRepository.update(
            req.query.imageId as string,
            req.body,
            connection
          );

          res.status(200).send(req.body);
        }

        break;
      case 'DELETE':
        if (requireFacilitatorPermissions(req, res)) {
          await imageRepository.delete(req.query.imageId as string, connection);

          res.status(200).send({
            status: 'OK',
          });
        }

        break;
      default:
        res.setHeader('Allow', ['GET', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'Error' });
  } finally {
    databaseManager.closeConnection(connection);
  }
};
