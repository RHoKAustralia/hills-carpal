import { NextApiRequest, NextApiResponse } from 'next';
import _ from 'lodash';

import RideRepository from '../../../src/server/api/rides/ride-repository';
import DatabaseManager from '../../../src/server/api/database/database-manager';
import {
  decodeJwt,
  requireDriverPermissions,
} from '../../../src/server/api/jwt';
import { CarType, Gender } from '../../../src/common/model';

const databaseManager = new DatabaseManager();
const rideRepository = new RideRepository(databaseManager);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  const connection = await databaseManager.createConnection();

  try {
    const jwt = await decodeJwt(req);

    if (requireDriverPermissions(jwt, req, res)) {
      switch (method) {
        case 'GET':
          const rides = await rideRepository.list(
            {
              filters: {
                fromNow: true,
                status: 'OPEN',
                carType: ['All' as CarType].concat(
                  jwt.carType ? [jwt.carType as CarType] : []
                ),
                gender: ['any' as Gender].concat(
                  jwt.driverGender ? [jwt.driverGender as Gender] : []
                ),
              },
              sort: ['pickupTimeAndDateInUTC'],
              sortDirection: 'asc',
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
