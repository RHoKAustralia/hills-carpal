import { NextApiRequest, NextApiResponse } from 'next';
import _ from 'lodash';

import snsValidatorEndpoint from '../../src/server/api/sns-validator-endpoint';

import RideRepository from '../../src/server/api/rides/ride-repository';
import DatabaseManager from '../../src/server/api/database/database-manager';
import { dumpBackupRides } from '../../src/server/google/sheets';

const databaseManager = new DatabaseManager();
const rideRepository = new RideRepository(databaseManager);

export default snsValidatorEndpoint(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const connection = databaseManager.createConnection();

    try {
      console.log(`Dumping open rides to google sheets`);

      const openRides = await rideRepository.list(
        {
          filters: {
            status: 'OPEN',
            fromNow: true,
          },
          sort: ['pickupTimeAndDate'],
        },
        connection
      );

      const confirmedRides = await rideRepository.list(
        {
          filters: {
            status: 'CONFIRMED',
            fromNow: true,
          },
          sort: ['pickupTimeAndDate'],
        },
        connection
      );

      const allRides = [...openRides, ...confirmedRides];

      await dumpBackupRides(allRides);

      console.log(`Successfully dumped ${allRides.length} rides`);

      res.status(200).send({
        message: 'Complete',
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ status: 'Error' });
    } finally {
      databaseManager.closeConnection(connection);
    }
  }
);
