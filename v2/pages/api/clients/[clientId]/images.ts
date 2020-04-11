import { NextApiRequest, NextApiResponse } from 'next';

import ImageRepository from '../../../../src/api/clients/image-repository';
import DatabaseManager from '../../../../src/api/database/database-manager';

const databaseManager = new DatabaseManager();
const imageRepository = new ImageRepository(databaseManager);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, body } = req;

  const connection = databaseManager.createConnection();
  try {
    switch (method) {
      case 'GET':
        const images = await imageRepository.list(
          connection,
          req.query.clientId as string
        );
        res.status(200).json(images);

        break;
      case 'POST':
      // await imageRepository.create(body, connection);
      // res.status(200).json(body);

      // break;

      // case 'PUT':
      //   // Update or create data in your database
      //   res.status(200).json({ id, name: name || `User ${id}` });
      //   break;
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'Error' });
  } finally {
    databaseManager.closeConnection(connection);
  }
};
