import { NextApiRequest, NextApiResponse } from 'next';

import FacilitatorRepository from '../../../src/server/api/facilitator-repository';
import DatabaseManager from '../../../src/server/api/database/database-manager';
import { Facilitator } from '../../../src/common/model';
import { requireFacilitatorPermissions } from '../../../src/server/api/authz';

const databaseManager = new DatabaseManager();
const facilitatorRepository = new FacilitatorRepository(databaseManager);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, body } = req;

  const connection = await databaseManager.createConnection();
  try {
    if (await requireFacilitatorPermissions(req, res, connection)) {
      switch (method) {
        case 'PUT':
          const facilitator: Facilitator = body;

          await facilitatorRepository.update(
            parseInt(req.query.facilitatorId as string),
            facilitator,
            connection
          );
          res.status(200).json(body);

          break;
        case 'DELETE':
          await facilitatorRepository.delete(
            parseInt(req.query.facilitatorId as string),
            connection
          );
          res.status(200).json(body);

          break;
        default:
          res.setHeader('Allow', ['PUT', 'DELETE']);
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
