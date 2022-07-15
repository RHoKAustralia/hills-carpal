import _ from 'lodash';
import moment from 'moment-timezone';
import { managementClient } from '../auth/api-auth0';
import { Ride } from '../../common/model';
import sendEmail from './send-email';

export default async function notifyDeclined(ride: Ride) {
  const facilitators = await managementClient.getUsersByEmail(
    ride.facilitatorEmail
  );
  const facilitator = facilitators.length > 0 ? facilitators[0] : undefined;

  console.log(
    `Sending declined notification to ${ride.facilitatorEmail} for ride ${ride.id}`
  );

  const formattedRideDate = moment
    .tz(ride.pickupTimeAndDate, process.env.TIMEZONE)
    .format('dddd DD/MM/YYYY hh:mma');

  await sendEmail({
    to: ride.facilitatorEmail,
    subject: `Carpal ride for ${ride.client.name} at ${formattedRideDate} has been withdrawn from by ${ride.driver.name}`,
    html: `
          <p>Hi ${
            facilitator
              ? facilitator.given_name ||
                facilitator.nickname ||
                facilitator.name ||
                ''
              : ''
          },</p>

          <p>
            The ride for ${ride.client.name} from
            ${ride.locationFrom.placeName} to ${ride.locationTo.placeName} at 
            ${formattedRideDate} by facilitator ${ride.facilitatorEmail} 
            has been withdrawn from. This means that it's available for other
            drivers to pick up.
          </p>
  
          <p>To view the ride, <a href="${
            process.env.EXTERNAL_URL
          }/facilitator/rides/${ride.id}">click here</a>.</p>
 
          <p>
            Thanks,<br>
            Carpal
          </p>
       `,
  });
}
