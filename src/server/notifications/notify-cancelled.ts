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

  await sendEmail({
    to: driver.email,
    subject: `Hills Carpal ride for ${ride.client.name} has been cancelled`,
    html: `
          <p>Hi ${driver.given_name || driver.nickname || ''},</p>

          <p>
            The ride you accepted for ${ride.client.name} from
            ${ride.locationFrom.placeName} to ${ride.locationTo.placeName} at 
            ${moment
              .tz(ride.pickupTimeAndDate, process.env.TIMEZONE)
              .format(process.env.DATE_FORMAT)} is no longer needed. Thanks for 
            accepting it!
          </p>
  
          <p>If you'd like to pick up a new ride, <a href="${
            process.env.EXTERNAL_URL
          }/driver/rides">click here</a>.</p>
 
          <p>
            Thanks,<br>
            Hills Carpal
          </p>
       `,
  });
}
