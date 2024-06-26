import { NextApiRequest, NextApiResponse } from 'next';
import _ from 'lodash';

import RideRepository, {
  validSortLookup,
} from '../../../src/server/api/rides/ride-repository';
import DatabaseManager from '../../../src/server/api/database/database-manager';
import { requireFacilitatorPermissions } from '../../../src/server/api/authz';

const databaseManager = new DatabaseManager();
const rideRepository = new RideRepository(databaseManager);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  const connection = await databaseManager.createConnection();

  try {
    if (await requireFacilitatorPermissions(req, res, connection)) {
      switch (method) {
        case 'GET':
          const {
            page,
            pageSize,
            sort = 'pickupTimeAndDate',
            facilitatorEmail,
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
              res.status(400).json({
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
            facilitatorEmail as string,
            parsedPageSize,
            page && !_.isArray(page) && Number.parseInt(page)
          );
          const countPromise = rideRepository.countForFacilitator(
            connection,
            facilitatorEmail as string
          );
          const [rides, count] = await Promise.all([
            ridesPromise,
            countPromise,
          ]);

          res.status(200).json({ rides, count });
          break;
        default:
          res.setHeader('Allow', ['GET']);
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
