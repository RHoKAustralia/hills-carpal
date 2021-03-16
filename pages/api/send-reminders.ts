import { NextApiRequest, NextApiResponse } from 'next';
import _ from 'lodash';
import fetch from 'node-fetch';
import SnsMessageValidator from 'sns-validator';
import moment from 'moment';

import RideRepository from '../../src/server/api/rides/ride-repository';
import DatabaseManager from '../../src/server/api/database/database-manager';
import notifyUnclaimedRide from '../../src/server/notifications/notify-unclaimed-ride';
import notifyRideNeedsClosing from '../../src/server/notifications/notify-ride-needs-closing';

const snsValidator = new SnsMessageValidator();
const databaseManager = new DatabaseManager();
const rideRepository = new RideRepository(databaseManager);

type SnsMessageType = 'SubscriptionConfirmation' | 'Notification';

/**
 * e.g.
 * {
 *   "Type" : "Notification",
 *   "MessageId" : "22b80b92-fdea-4c2c-8f9d-bdfb0c7bf324",
 *   "TopicArn" : "arn:aws:sns:us-west-2:123456789012:MyTopic",
 *   "Subject" : "My First Message",
 *   "Message" : "Hello world!",
 *   "Timestamp" : "2012-05-02T00:54:06.655Z",
 *   "SignatureVersion" : "1",
 *   "Signature" : "EXAMPLEw6JRN...",
 *   "SigningCertURL" : "https://sns.us-west-2.amazonaws.com/SimpleNotificationService-f3ecfb7224c7233fe7bb5f59f96de52f.pem",
 *   "UnsubscribeURL" : "https://sns.us-west-2.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:us-west-2:123456789012:MyTopic:c9135db0-26c4-47ec-8998-413945fb5a96"
 * }
 */
type SnsMessage = {
  Type: SnsMessageType;
  SubscribeURL: string;
};

const reminderDifferenceDays = Number.parseInt(
  process.env.REMINDER_DIFFERENCE_DAYS
);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  const connection = databaseManager.createConnection();

  try {
    switch (method) {
      case 'POST':
        const message = await new Promise<SnsMessage>((resolve, reject) => {
          snsValidator.validate(req.body, (err, message) => {
            if (err) {
              reject(err);
            } else {
              resolve(message as SnsMessage);
            }
          });
        });

        if (message.Type === 'SubscriptionConfirmation') {
          // This is a subscriptionconfirmation - we have to call the subscribe url in the request
          // otherwise we won't get notifications
          const subscribeRes = await fetch(message.SubscribeURL);

          if (!subscribeRes.ok) {
            throw new Error(
              `Failed to respond to subscribe confirmation event with response ${
                subscribeRes.status
              } and event ${JSON.stringify(message)}`
            );
          }

          res.status(200).end();
        } else if (message.Type === 'Notification') {
          // this is a notification - this means that the cron job has gone off so
          // it's time to send notifications!

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
        }

        break;
      default:
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'Error' });
  } finally {
    databaseManager.closeConnection(connection);
  }
};
