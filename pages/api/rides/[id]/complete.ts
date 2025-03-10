import { NextApiRequest, NextApiResponse } from 'next';
import _, { isNil } from 'lodash';

import RideRepository from '../../../../src/server/api/rides/ride-repository';
import DatabaseManager from '../../../../src/server/api/database/database-manager';
import {
  requireDriverPermissions,
  verifyJwt,
} from '../../../../src/server/api/authz';
import { CompletePayload } from '../../../../src/common/model';
import isRideInPast from '../../../../src/common/util';
import writeSurvey from '../../../../src/server/google/sheets';
import moment from 'moment';

const databaseManager = new DatabaseManager();
const rideRepository = new RideRepository(databaseManager);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  const connection = await databaseManager.createConnection();
  await databaseManager.query(
    'SET TRANSACTION ISOLATION LEVEL READ COMMITTED',
    connection
  );
  await connection.beginTransaction();

  try {
    const jwt = await verifyJwt(req);

    if (requireDriverPermissions(req, res, connection, jwt)) {
      switch (method) {
        case 'PUT':
          const id = Number.parseInt(req.query.id as string);

          const oldRide = await rideRepository.get(id, connection, true);
          const body = req.body as CompletePayload;

          if (
            isNil(body.lateness) ||
            isNil(body.mobilityPermitUsedDropOff) ||
            isNil(body.mobilityPermitUsedPickup) ||
            isNil(body.reimbursementAmount) ||
            isNil(body.satisfaction)
          ) {
            res.status(400).json({
              message: 'Required field was not supplied',
            });
            return;
          }

          if (!isRideInPast(oldRide)) {
            res.status(400).json({
              message: "Cannot close ride that's yet to happen",
            });
            return;
          }

          await rideRepository.setSurvey(id, body, connection);
          await rideRepository.setStatus(
            id,
            body.lateness == 'didNotHappen' ? 'NOT_READY' : 'ENDED',
            jwt.userId,
            jwt.name,
            connection
          );

          const newRide = await rideRepository.get(id, connection);

          await writeSurvey({
            ...body,
            clientName: newRide.client.name,
            driverName: newRide.driver.name,
            rideDateTime: moment(newRide.pickupTimeAndDate),
          });

          await connection.commit();
          res.status(200).json(newRide);
          break;
        default:
          res.setHeader('Allow', ['PUT']);
          res.status(405).end(`Method ${method} Not Allowed`);
      }
    }
  } catch (e) {
    console.error(e);

    await connection.rollback();
    res.status(500).json({ status: 'Error' });
  } finally {
    await connection.end();
  }
};
