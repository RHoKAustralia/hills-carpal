import { NextApiRequest, NextApiResponse } from 'next';

import ImageRepository from '../../../../../src/api/clients/image-repository';
import busboyParse from '../../../../../src/api/clients/busboy-parse';
import DatabaseManager from '../../../../../src/api/database/database-manager';

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
        const busboyResult = await busboyParse(req);
        const content = busboyResult.chunk.toString('base64');

        const image = await imageRepository.upload(
          content,
          busboyResult.contentType,
          req.query.clientId as string,
          connection
        );

        console.log(image);

        res.status(200).send(image);
        break;
    }
  } catch (e) {
    console.error(e);
    res.status(500).send({ status: 'Error', message: 'Could not parse form' });
  } finally {
    databaseManager.closeConnection(connection);
  }

  // try {
  //   console.log(req.body);

  //   const form = new formidable.IncomingForm();
  //   form.uploadDir = './';
  //   form.keepExtensions = true;
  //   form.parse(req, (err, fields, files) => {
  //     if (err) {
  //       console.error(err);
  //       res.status(500).send({ message: 'Could not parse form' });
  //     } else {
  //       console.log(err, fields, files);

  //       imageRepository.upload()

  //       res.status(200).end();
  //     }
  //   });
  // } catch (e) {
  //   console.error(e);
  //   res.status(500).end();
  // }
};
