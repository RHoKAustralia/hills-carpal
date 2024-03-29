import _ from 'lodash';
import { managementClient } from '../auth/api-auth0';
import { Ride } from '../../common/model';
import sendEmail from './send-email';
import moment from 'moment-timezone';

export default async function notifyCancelled(ride: Ride) {
  const driver = await managementClient.getUser({
    id: ride.driver.id,
  });

  console.log(
    `Sending cancellation notification to ${driver.email} for ride ${ride.id}`
  );

  const formattedDate = moment
    .tz(ride.pickupTimeAndDate, process.env.TIMEZONE)
    .format('dddd DD/MM/YYYY hh:mma');

  await sendEmail({
    to: driver.email,
    subject: `Carpal ride for ${ride.client.name} at ${formattedDate} has been cancelled`,
    html: `
          <p>Hi ${
            driver.given_name || driver.nickname || driver.name || ''
          },</p>

          <p>
            The ride you accepted for ${ride.client.name} from
            ${ride.locationFrom.placeName} to ${ride.locationTo.placeName} at 
            ${formattedDate} by facilitator
            ${ride.facilitatorEmail} is no longer needed. Thanks for 
            accepting it!
          </p>
  
          <p>If you'd like to pick up a new ride, <a href="${
            process.env.EXTERNAL_URL
          }/driver/rides/find">click here</a>.</p>
 
          <p>
            Thanks,<br>
            Carpal
          </p>
       `,
  });
}
