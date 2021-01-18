import { NextApiRequest, NextApiResponse } from 'next';
import _ from 'lodash';

import RideRepository from './ride-repository';
import DatabaseManager from '../database/database-manager';
import { requireDriverPermissions, decodeJwt } from '../jwt';
import { RideStatus } from '../../../common/model';
import notifyDeclined from '../../notifications/notify-declined';

const databaseManager = new DatabaseManager();
const rideRepository = new RideRepository(databaseManager);

export default (rideStatus: RideStatus) => async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { method } = req;
  const connection = databaseManager.createConnection();

  try {
    const jwt = await decodeJwt(req);

    if (requireDriverPermissions(jwt, req, res)) {
      switch (method) {
        case 'PUT':
          const id = Number.parseInt(req.query.id as string);

          const oldRide = await rideRepository.get(id, connection);

          await rideRepository.setStatus(
            id,
            rideStatus,
            rideStatus !== 'OPEN' ? jwt.userId : null,
            rideStatus !== 'OPEN' ? jwt.name : null,
            connection
          );

          if (rideStatus === 'OPEN') {
            notifyDeclined(oldRide);
          }

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
