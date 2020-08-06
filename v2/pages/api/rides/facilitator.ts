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
          const {
            page,
            pageSize,
            sort = 'pickupTimeAndDate',
            // filtered,
            sortDirection = 'desc',
          } = req.query;

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

          const parsedPageSize =
            pageSize && !_.isArray(pageSize) && Number.parseInt(pageSize);
          const ridesPromise = rideRepository.listForFacilitator(
            connection,
            sortArray,
            sortDirection && sortDirection === 'asc' ? 'asc' : 'desc',
            parsedPageSize,
            page && !_.isArray(page) && Number.parseInt(page)
          );
          const countPromise = rideRepository.countForFacilitator(connection);
          const [rides, count] = await Promise.all([
            ridesPromise,
            countPromise,
          ]);

          res
            .status(200)
            .json({ rides, pages: Math.ceil(count / parsedPageSize) });
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
