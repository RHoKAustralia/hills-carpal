import _ from 'lodash';
import { Ride } from '../../common/model';
import sendEmail from './send-email';
import moment from 'moment-timezone';

import { getDrivers } from './get-drivers';

export default async function notifyAvailableRide(
  ride: Ride,
  type: 'new' | 'declined'
) {
  const drivers = await getDrivers(ride);

  for (let driver of drivers) {
    console.log(
      `Sending new ride notification for ride ${ride.id} to ${driver.email} `
    );

    const formattedDate = moment
      .tz(ride.pickupTimeAndDate, process.env.TIMEZONE)
      .format('dddd DD/MM/YYYY hh:mma');

    await sendEmail({
      to: driver.email,
      subject: `Carpal: Driver needed for ${ride.client.name} at ${formattedDate}`,
      html: `
          <p>Hi ${driver.name},</p>

          <p>${
            type === 'new'
              ? 'A new ride has been created'
              : 'The previous driver has had to withdraw their offer of a ride'
          } for ${ride.client.name} in Carpal, and it needs a driver.</p>

          <h3>Details</h3>
          <p>
            <strong>From:</strong> ${ride.locationFrom.placeName} <br>
            <strong>To:</strong> ${ride.locationTo.placeName} <br>
            <strong>Time:</strong> ${formattedDate} <br>
            <strong>Facilitator:</strong> ${ride.facilitatorEmail} <br>
            <strong>Ride Description:</strong> ${ride.description} <br>
          </p>
  
          <p>To view and accept this ride, <a href="${
            process.env.EXTERNAL_URL
          }/driver/rides/find">click here</a>.</p>
 
          <p>
            Thanks,<br>
            Carpal
          </p>
       `,
    });
  }
}
