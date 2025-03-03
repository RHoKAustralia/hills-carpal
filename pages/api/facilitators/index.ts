import { NextApiRequest, NextApiResponse } from 'next';
import { Facilitator } from '../../../src/common/model';

import FacilitatorRepository from '../../../src/server/api/facilitator-repository';
import DatabaseManager from '../../../src/server/api/database/database-manager';
import { requireFacilitatorPermissions } from '../../../src/server/api/authz';

const databaseManager = new DatabaseManager();
const facilitatorRepository = new FacilitatorRepository(databaseManager);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, body } = req;

  const connection = await databaseManager.createConnection();
  try {
    if (await requireFacilitatorPermissions(req, res, connection)) {
      switch (method) {
        case 'GET':
          const facilitators = await facilitatorRepository.list(connection);
          res.status(200).json(facilitators);

          break;
        case 'POST':
          const facilitator: Facilitator = body;

          const result = await facilitatorRepository.create(
            facilitator,
            connection
          );

          res.status(200).json({
            ...body,
            id: result,
          });

          break;

        default:
          res.setHeader('Allow', ['GET', 'POST', 'PUT']);
          res.status(405).end(`Method ${method} Not Allowed`);
      }
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'Error' });
  } finally {
    await connection.end();
  }
};
