import { NextApiRequest, NextApiResponse } from 'next';
import _ from 'lodash';

import RideRepository from '../../../../src/api/rides/ride-repository';
import DatabaseManager from '../../../../src/api/database/database-manager';
import { requireFacilitatorPermissions } from '../../../../src/auth/jwt';

const databaseManager = new DatabaseManager();
const rideRepository = new RideRepository(databaseManager);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  const connection = databaseManager.createConnection();

  try {
    if (requireFacilitatorPermissions(req, res)) {
      switch (method) {
        case 'PUT':
          const updatedRide = await rideRepository.update(
            Number.parseInt(req.query.id as string),
            req.body,
            connection
          );
          console.log(updatedRide);
          res.status(200).json(updatedRide);
          break;
        case 'GET':
          const ride = await rideRepository.get(
            Number.parseInt(req.query.id as string),
            connection
          );
          console.log(ride);
          res.status(200).json(ride);
          break;
        default:
          res.setHeader('Allow', ['PUT', 'GET']);
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
