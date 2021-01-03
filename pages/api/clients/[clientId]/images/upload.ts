import { NextApiRequest, NextApiResponse } from 'next';

import ImageRepository from '../../../../../src/server/api/clients/image-repository';
import busboyParse from '../../../../../src/server/api/clients/busboy-parse';
import DatabaseManager from '../../../../../src/server/api/database/database-manager';
import {
  hasRole,
  decodeJwt,
  requireFacilitatorPermissions,
} from '../../../../../src/server/api/jwt';

export const config = {
  api: {
    bodyParser: false,
  },
};

const databaseManager = new DatabaseManager();
const imageRepository = new ImageRepository(databaseManager);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, body } = req;
  const connection = databaseManager.createConnection();
  try {
    switch (method) {
      case 'POST':
        if (requireFacilitatorPermissions(req, res)) {
          const busboyResult = await busboyParse(req);
          const content = busboyResult.chunk.toString('base64');

          const image = await imageRepository.upload(
            content,
            busboyResult.contentType,
            req.query.clientId as string,
            connection
          );

          res.status(200).send(image);
        }
        break;
    }
  } catch (e) {
    console.error(e);
    res.status(500).send({ status: 'Error', message: 'Could not parse form' });
  } finally {
    databaseManager.closeConnection(connection);
  }
};
