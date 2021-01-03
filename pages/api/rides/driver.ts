import { NextApiRequest, NextApiResponse } from 'next';
import _ from 'lodash';

import RideRepository, {
  validSortLookup,
} from '../../../src/server/api/rides/ride-repository';
import DatabaseManager from '../../../src/server/api/database/database-manager';
import { decodeJwt, requireDriverPermissions } from '../../../src/server/api/jwt';
import { CarType, Gender } from '../../../src/common/model';

const databaseManager = new DatabaseManager();
const rideRepository = new RideRepository(databaseManager);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { query, method } = req;
  const connection = databaseManager.createConnection();

  try {
    const jwt = decodeJwt(req);

    if (requireDriverPermissions(jwt, req, res)) {
      switch (method) {
        case 'GET':
          const rides = await rideRepository.list(
            {
              fromNow: true,
              status: 'OPEN',
              driverRestrictions: {
                carType: ['All' as CarType].concat(
                  jwt.carType ? [jwt.carType as CarType] : []
                ),
                gender: ['any' as Gender].concat(
                  jwt.driverGender ? [jwt.driverGender as Gender] : []
                ),
              },
            },
            connection
          );

          res.status(200).json({ rides });
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
    databaseManager.closeConnection(connection);
  }
};
