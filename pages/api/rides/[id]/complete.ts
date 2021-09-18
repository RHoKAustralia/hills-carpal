import { NextApiRequest, NextApiResponse } from 'next';
import _ from 'lodash';

import RideRepository from '../../../../src/server/api/rides/ride-repository';
import DatabaseManager from '../../../../src/server/api/database/database-manager';
import {
  requireDriverPermissions,
  decodeJwt,
} from '../../../../src/server/api/jwt';
import { CompletePayload } from '../../../../src/common/model';
import isRideInPast from '../../../../src/common/util';

const databaseManager = new DatabaseManager();
const rideRepository = new RideRepository(databaseManager);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  const connection = databaseManager.createConnection();
  await databaseManager.query(
    'SET TRANSACTION ISOLATION LEVEL READ COMMITTED',
    connection
  );
  await databaseManager.beginTransaction(connection);

  try {
    const jwt = await decodeJwt(req);

    if (requireDriverPermissions(jwt, req, res)) {
      switch (method) {
        case 'PUT':
          const id = Number.parseInt(req.query.id as string);

          const oldRide = await rideRepository.get(id, connection, true);
          const body = req.body as CompletePayload;

          if (!isRideInPast(oldRide)) {
            res.status(400).json({
              message: "Cannot close ride that's yet to happen",
            });
            return;
          }

          await rideRepository.setSurvey(id, body, connection);
          await rideRepository.setStatus(
            id,
            'ENDED',
            jwt.userId,
            jwt.name,
            connection
          );

          const newRide = await rideRepository.get(id, connection);

          await databaseManager.commit(connection);
          res.status(200).json(newRide);
          break;
        default:
          res.setHeader('Allow', ['PUT']);
          res.status(405).end(`Method ${method} Not Allowed`);
      }
    }
  } catch (e) {
    console.error(e);

    await databaseManager.rollback(connection);
    res.status(500).json({ status: 'Error' });
  } finally {
    databaseManager.closeConnection(connection);
  }
};
