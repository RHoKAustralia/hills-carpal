import { NextApiRequest, NextApiResponse } from 'next';
import _, { isUndefined } from 'lodash';

import RideRepository from '../../../src/server/api/rides/ride-repository';
import DatabaseManager from '../../../src/server/api/database/database-manager';
import {
  verifyJwt,
  requireDriverPermissions,
} from '../../../src/server/api/authz';
import { CarType, GenderPreference } from '../../../src/common/model';
import DriverRepository from '../../../src/server/api/driver-repository';

const databaseManager = new DatabaseManager();
const rideRepository = new RideRepository(databaseManager);
const driverRepository = new DriverRepository(databaseManager);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  const connection = await databaseManager.createConnection();

  try {
    const jwt = await verifyJwt(req);

    if (requireDriverPermissions(req, res, connection, jwt)) {
      switch (method) {
        case 'GET':
          const driver = await driverRepository.getByAuth0Id(
            jwt.userId,
            connection
          );
          const hasSuv = driver?.hasSuv ?? jwt.carType === 'suv';
          let driverGender: GenderPreference | undefined = undefined;
          if (driver?.driverGender === 'Male' || jwt.driverGender === 'male') {
            driverGender = 'male';
          } else if (
            driver?.driverGender === 'Female' ||
            jwt.driverGender === 'female'
          ) {
            driverGender = 'female';
          }

          const rides = await rideRepository.list(
            {
              filters: {
                fromNow: true,
                status: 'OPEN',
                carType: ['All' as CarType].concat(hasSuv ? [] : 'noSUV'),
                gender: ['any' as GenderPreference].concat(
                  !isUndefined(driverGender) ? [driverGender] : []
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
    await connection.end();
  }
};
