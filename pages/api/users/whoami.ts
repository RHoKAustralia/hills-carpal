import { NextApiRequest, NextApiResponse } from 'next';
import {
  hasRole,
  requireFacilitatorPermissions,
  verifyJwt,
} from '../../../src/server/api/authz';
import DatabaseManager from '../../../src/server/api/database/database-manager';
import DriverRepository from '../../../src/server/api/driver-repository';
import FacilitatorRepository from '../../../src/server/api/facilitator-repository';
import { isUndefined } from 'lodash';

const databaseManager = new DatabaseManager();
const driverRepo = new DriverRepository(databaseManager);
const facilitatorRepo = new FacilitatorRepository(databaseManager);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, body } = req;

  const connection = await databaseManager.createConnection();

  try {
    switch (method) {
      case 'GET':
        const claims = await verifyJwt(req);
        const [driver, facilitator] = await Promise.all([
          driverRepo.getByAuth0Id(claims.userId, connection),
          facilitatorRepo.getByAuth0Id(claims.userId, connection),
        ]);

        const isDriver = !isUndefined(driver) || hasRole('driver', claims);
        const isFacilitator =
          !isUndefined(facilitator) || hasRole('facilitator', claims);

        const data = {
          auth0Id: claims.userId,
          driver: isDriver
            ? {
                hasSuv: driver?.hasSuv ?? claims.carType === 'suv',
                gender: driver?.driverGender ?? claims.driverGender,
                inactive: driver?.inactive ?? false,
              }
            : undefined,
          facilitator: isFacilitator
            ? {
                inactive: facilitator?.inactive ?? false,
              }
            : undefined,
        };

        res.status(200).json(data);

        break;
      default:
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'Error' });
  }
};
