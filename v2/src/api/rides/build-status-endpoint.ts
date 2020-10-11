import { NextApiRequest, NextApiResponse } from 'next';
import _ from 'lodash';

import RideRepository from './ride-repository';
import DatabaseManager from '../database/database-manager';
import { requireDriverPermissions, decodeJwt } from '../../auth/jwt';
import { RideStatus } from '../../model';

const databaseManager = new DatabaseManager();
const rideRepository = new RideRepository(databaseManager);

export default (rideStatus: RideStatus) => async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { method } = req;
  const connection = databaseManager.createConnection();

  try {
    const jwt = decodeJwt(req);

    if (requireDriverPermissions(jwt, req, res)) {
      switch (method) {
        case 'PUT':
          const id = Number.parseInt(req.query.id as string);

          await rideRepository.setStatus(
            id,
            rideStatus,
            rideStatus !== 'OPEN' ? jwt.userId : null,
            rideStatus !== 'OPEN' ? jwt.name : null,
            connection
          );

          const newRide = await rideRepository.get(id, connection);

          res.status(200).json(newRide);
          break;
        default:
          res.setHeader('Allow', ['PUT']);
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
