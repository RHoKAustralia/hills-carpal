import _ from 'lodash';
import moment from 'moment-timezone';

import { Ride } from '../../common/model';
import { managementClient } from '../auth/api-auth0';
import sendEmail from './send-email';

export default async function notifyRideNeedsClosing(ride: Ride) {
  const driver = await managementClient.getUser({
    id: ride.driver.id,
  });

  console.log(
    `Sending unclosed ride notification for ride ${ride.id} to ${driver.email} `
  );

  const formattedRideDate = moment
    .tz(ride.pickupTimeAndDate, process.env.TIMEZONE)
    .format('dddd DD/MM/YYYY hh:mma');

  await sendEmail({
    to: driver.email,
    subject: `Carpal needs feedback from your ride for ${ride.client.name} at ${formattedRideDate}`,
    html: `
      <p>Hi ${driver.given_name || driver.nickname || driver.name || ''},</p>

      <p>
        We still haven't received feedback for the ride you gave to ${
          ride.client.name
        } at
        ${formattedRideDate}. Please complete the feedback form and mark the ride as completed at
        <a href="${process.env.EXTERNAL_URL}/driver/rides/${
      ride.id
    }/details">click here</a>.
      </p>

      <p>Facilitator for the ride : ${ride.facilitatorEmail}</p>
      
      <p>
        Thanks,<br>
        Carpal
      </p>
    `,
  });
}
