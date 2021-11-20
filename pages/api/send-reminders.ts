import { NextApiRequest, NextApiResponse } from 'next';
import _ from 'lodash';
import moment from 'moment';

import snsValidatorEndpoint from '../../src/server/api/sns-validator-endpoint';

import RideRepository from '../../src/server/api/rides/ride-repository';
import DatabaseManager from '../../src/server/api/database/database-manager';
import notifyUnclaimedRide from '../../src/server/notifications/notify-unclaimed-ride';
import notifyRideNeedsClosing from '../../src/server/notifications/notify-ride-needs-closing';

const databaseManager = new DatabaseManager();
const rideRepository = new RideRepository(databaseManager);

const reminderDifferenceDays = Number.parseInt(
  process.env.REMINDER_DIFFERENCE_DAYS
);

export default snsValidatorEndpoint(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const connection = databaseManager.createConnection();

    try {
      // find all rides that are unclaimed and due in a week
      const startOfToday = moment.tz(process.env.TIMEZONE).startOf('day');
      const unclaimedFromDate = startOfToday
        .clone()
        .add(reminderDifferenceDays - 1, 'days');
      const unclaimedToDate = startOfToday
        .clone()
        .add(reminderDifferenceDays, 'days');

      const unclaimedRides = await rideRepository.list(
        {
          filters: {
            status: 'OPEN',
            date: { from: unclaimedFromDate, to: unclaimedToDate },
          },
          size: Number.MAX_SAFE_INTEGER,
        },
        connection
      );

      const closingReminderFromDate = startOfToday.clone().add(-3, 'days');
      const closingReminderToDate = startOfToday.clone().add(-2, 'days');
      const closingReminderRides = await rideRepository.list(
        {
          filters: {
            status: 'CONFIRMED',
            date: {
              from: closingReminderFromDate,
              to: closingReminderToDate,
            },
          },
          size: Number.MAX_SAFE_INTEGER,
        },
        connection
      );

      // SNS will only wait 15 seconds before retrying and this might take
      // way longer, so return a 200 before actually sending emails
      res.status(200).send('');

      console.log(
        'Received reminder notification, sending reminders for ' +
          unclaimedRides.length +
          ' rides'
      );

      // We do these one by one so that we don't hit a rate limit on SES
      for (let ride of unclaimedRides) {
        await notifyUnclaimedRide(ride);
      }

      console.log(
        'Received unclosed notification, sending reminders for ' +
          closingReminderRides.length +
          ' rides'
      );
      for (let ride of closingReminderRides) {
        await notifyRideNeedsClosing(ride);
      }
    } catch (e) {
      console.error(e);
      res.status(500).json({ status: 'Error' });
    } finally {
      databaseManager.closeConnection(connection);
    }
  }
);
