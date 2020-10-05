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
          await rideRepository.setStatus(
            Number.parseInt(req.query.id as string),
            rideStatus,
            jwt.userId,
            jwt.name,
            connection
          );

          res.status(200).send('');
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
