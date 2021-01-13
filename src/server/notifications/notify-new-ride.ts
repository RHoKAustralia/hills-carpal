import _ from 'lodash';
import { managementClient } from '../auth/node-auth0';
import roleIdsPromise from '../auth/role-ids';
import { Ride } from '../../common/model';
import sendEmail from './send-email';
import moment from 'moment-timezone';

export default async function notifyNewRides(ride: Ride) {
  const roleIdLookup = await roleIdsPromise;

  const drivers = await managementClient.getUsersInRole({
    id: roleIdLookup['driver'].id,
  });

  for (let driver of drivers) {
    const driverRoles = await managementClient.getUserRoles({
      id: driver.user_id,
    });
    const roleLookup = _.keyBy(driverRoles, (role) => role.name);

    /** Does the driver's car match the suv preference */
    const suvOk =
      ride.carType === 'All' ||
      (ride.carType === 'noSUV' && !roleLookup['suv']) ||
      (ride.carType === 'suv' && roleLookup['suv']);

    /** Does the driver's gender match the gender preference */
    const genderOk =
      ride.driverGender === 'any' ||
      (ride.driverGender === 'female' && roleLookup['female']) ||
      (ride.driverGender === 'male' && roleLookup['male']);

    if (suvOk && genderOk) {
      console.log(`Sending new ride notification to ${driver.email} `);

      await sendEmail({
        to: driver.email,
        subject: `New Hills Carpal ride for ${ride.client.name}`,
        html: `
          <p>Hi ${driver.given_name || driver.nickname || ''},</p>

          <p>A new ride has been created for ${
            ride.client.name
          } in Hills Carpal.</p>

          <h3>Details</h3>
          <p>
            <strong>From:</strong> ${ride.locationFrom.placeName} <br>
            <strong>To:</strong> ${ride.locationTo.placeName} <br>
            <strong>Time:</strong> ${moment
              .tz(ride.pickupTimeAndDate, process.env.TIMEZONE)
              .format(process.env.DATE_FORMAT)} <br>
            <strong>Description:</strong> ${ride.description} <br>
          </p>
  
          <p>To view and accept this ride, <a href="${
            process.env.EXTERNAL_URL
          }/driver/rides/${ride.id}/details">click here</a>.</p>
 
          <p>
            Thanks,<br>
            Hills Carpal
          </p>
       `,
      });
    } else {
      console.log(
        `Skipping sending new ride notification to ${driver.email}: suvOk: ${suvOk}, genderOk ${genderOk}`
      );
    }
  }
}
