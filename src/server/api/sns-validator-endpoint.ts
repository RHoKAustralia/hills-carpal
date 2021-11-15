import { NextApiRequest, NextApiResponse } from 'next';
import _ from 'lodash';
import fetch from 'node-fetch';
import SnsMessageValidator from 'sns-validator';
import moment from 'moment';

const snsValidator = new SnsMessageValidator();

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

export default (
  fn: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const { method } = req;

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
            // this is a notification - this means that the cron job has gone off
            await fn(req, res);
          }

          break;
        default:
          res.setHeader('Allow', ['POST']);
          res.status(405).end(`Method ${method} Not Allowed`);
      }
    } catch (e) {
      console.error(e);
      res.status(500).json({ status: 'Error' });
    }
  };
};
