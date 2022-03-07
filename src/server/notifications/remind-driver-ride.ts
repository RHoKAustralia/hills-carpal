import _ from 'lodash';
import moment from 'moment-timezone';

import { Ride } from '../../common/model';
import { managementClient } from '../auth/api-auth0';
import sendEmail from './send-email';

export default async function remindDriverOfRide(ride: Ride) {
  const driver = await managementClient.getUser({
    id: ride.driver.id,
  });

  console.log(
    `Sending unclosed ride notification for ride ${ride.id} to ${driver.email} `
  );

  const formattedRideDate = moment
    .tz(ride.pickupTimeAndDate, process.env.TIMEZONE)
    .format(process.env.DATE_FORMAT);

  await sendEmail({
    to: driver.email,
    subject: `Hills Carpal Ride Reminder: ${ride.client.name} at ${formattedRideDate}`,
    html: `
      <p>Hi ${driver.given_name || driver.nickname || driver.name || ''},</p>

      <p>
        This is a reminder that you've offered to give a ride to ${
          ride.client.name
        } at ${formattedRideDate}. <a href="${
      process.env.EXTERNAL_URL
    }/driver/rides/${ride.id}/details">Click here</a> for details.
      </p>

      <p>Facilitator for the ride : ${ride.facilitatorEmail}</p>
      
      <p>
        Thanks,<br>
        Hills Carpal
      </p>
    `,
  });
}
