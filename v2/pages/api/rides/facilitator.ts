import { NextApiRequest, NextApiResponse } from 'next';
import _ from 'lodash';

import RideRepository, {
  validSortLookup,
} from '../../../src/api/rides/ride-repository';
import DatabaseManager from '../../../src/api/database/database-manager';
import { requireFacilitatorPermissions } from '../../../src/auth/jwt';

const databaseManager = new DatabaseManager();
const rideRepository = new RideRepository(databaseManager);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { query, method } = req;
  const connection = databaseManager.createConnection();

  try {
    if (requireFacilitatorPermissions(req, res)) {
      switch (method) {
        case 'GET':
          // page=${state.page}&pageSize=${state.pageSize}&${state.sorted}&${state.filtered}
          const { page, pageSize, sort, filtered, sortDirection } = req.query;

          let sortArray: string[] | undefined;
          if (sort) {
            sortArray = _.isArray(sort) ? sort : [sort];
            const validSort = _.every(
              sortArray,
              (sort) => validSortLookup[sort]
            );

            if (!validSort) {
              res.status(400).send({
                message: 'Invalid sort',
              });
              return;
            }
          }

          const rides = await rideRepository.listForFacilitator(
            connection,
            sortArray,
            sortDirection && sortDirection === 'asc' ? 'asc' : 'desc'
          );
          res.status(200).json({ rides });
          break;
        // case 'PUT':
        //   // Update or create data in your database
        //   res.status(200).json({ id, name: name || `User ${id}` });
        //   break;
        default:
          res.setHeader('Allow', ['GET']);
          res.status(405).end(`Method ${method} Not Allowed`);
      }
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'Error' });
  } finally {
    databaseManager.closeConnection(connection);
  }
};
