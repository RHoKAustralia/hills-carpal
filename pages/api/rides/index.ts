import { NextApiRequest, NextApiResponse } from 'next';
import _ from 'lodash';

import RideRepository from '../../../src/server/api/rides/ride-repository';
import DatabaseManager from '../../../src/server/api/database/database-manager';
import {
  requireFacilitatorPermissions,
  decodeJwt,
} from '../../../src/server/api/jwt';
import { RideInput } from '../../../src/common/model';
import notifyAvailableRide from '../../../src/server/notifications/notify-available-ride';
import isRideInPast from "../../../src/common/util"

const databaseManager = new DatabaseManager();
const rideRepository = new RideRepository(databaseManager);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  const connection = databaseManager.createConnection();

  const claims = await decodeJwt(req);
  if(isRideInPast(req.body)){
    res.status(400).json({ status: 'Error please make sure date is valid' });

  }
  else{
    try {
      if (await requireFacilitatorPermissions(req, res, claims)) {
        switch (method) {
          case 'POST':
            const rideInput: RideInput = {
              ...req.body,
  
              facilitatorEmail: claims.email,
              status: 'OPEN',
              driverGender: req.body.driverGender || 'any',
              carType: req.body.carType || 'All',
            };
  
            const rideId = await rideRepository.create(rideInput, connection);
            const newRide = await rideRepository.get(rideId, connection);
  
            notifyAvailableRide(newRide, 'new');
  
            res.status(200).json(newRide);
            break;
          default:
            res.setHeader('Allow', ['POST']);
            res.status(405).end(`Method ${method} Not Allowed`);
        }
      }
    } catch (e) {
      console.error(e);
      res.status(500).json({ status: 'Error' });
    } finally {
      databaseManager.closeConnection(connection);
    }

  }


};
