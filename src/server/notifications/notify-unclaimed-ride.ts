import _ from 'lodash';
import { Ride } from '../../common/model';
import sendEmail from './send-email';
import moment from 'moment-timezone';

import { getDrivers } from './get-drivers';

export default async function notifyUnclaimedRide(ride: Ride) {
  const drivers = await getDrivers(ride);

  for (let driver of drivers) {
    console.log(
      `Sending unclaimed ride notification for ride ${ride.id} to ${driver.email} `
    );

    const formattedRideDate = moment
      .tz(ride.pickupTimeAndDate, process.env.TIMEZONE)
      .format('dddd DD/MM/YYYY hh:mma');

    await sendEmail({
      to: driver.email,
      subject: `Carpal ride for ${ride.client.name} at ${formattedRideDate} still doesn't have a driver!`,
      html: `
          <p>Hi ${driver.name},</p>

          <p>A ride for ${ride.client.name} at ${formattedRideDate} in Carpal still hasn't been claimed by any driver. Please consider claiming it if you're available!</p>

          <h3>Details</h3>
          <p>
            <strong>From:</strong> ${ride.locationFrom.placeName} <br>
            <strong>To:</strong> ${ride.locationTo.placeName} <br>
            <strong>Time:</strong> ${formattedRideDate} <br>
            <strong>Facilitator:</strong> ${ride.facilitatorEmail} <br>
            <strong>Ride Description:</strong> ${ride.description} <br>
          </p>
  
          <p>To view and accept this ride, <a href="${process.env.EXTERNAL_URL}/driver/rides/${ride.id}/details">click here</a>.</p>
 
          <p>
            Thanks,<br>
            Carpal
          </p>
       `,
    });
  }
}
