import { AppMetadata, Role, User, UserMetadata } from 'auth0';
import _ from 'lodash';
import { managementClient } from '../auth/node-auth0';
import roleIdsPromise from '../auth/role-ids';
import { Ride } from '../../common/model';
import sendEmail from './send-email';
// import sendEmail from './send-email';

export default async function notifyNewRides(ride: Ride) {
  const roleIdLookup = await roleIdsPromise;

  const drivers = await managementClient.getUsersInRole({
    id: roleIdLookup['driver'].id,
    // id: roleIds.driver
  });

  const driverRoleGetters = drivers.map((driver) => () =>
    managementClient.getUserRoles({
      id: driver.user_id,
    })
  );

  const driversAndRoles: [User<AppMetadata, UserMetadata>, Role[]][] = [];
  for (let i = 0; i < drivers.length; i++) {
    const driverRoles = await driverRoleGetters[i]();

    driversAndRoles.push([drivers[i], driverRoles]);
  }

  // console.log(driversAndRoles);
  console.log(ride);

  for (let [driver, roles] of driversAndRoles) {
    const roleLookup = _.keyBy(roles, (role) => role.name);
    // console.log(driver.name);
    // console.log(roleLookup);

    /** Does the driver's car match the suv preference */
    const suvOk =
      ride.carType === null ||
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
        <p>Hi ${driver.name},</p>

        <p>A new ride has been created for ${ride.client.name} in Hills Carpal.</p>

        <h3>Details</h3>
        <strong>From:</strong> ${ride.locationFrom.placeName} 
        <strong>To:</strong> ${ride.locationTo.placeName} 
        <strong>Time:</strong> ${ride.pickupTimeAndDate}
      `,
      });
    } else {
      console.log(`Skipping sending new ride notification to ${driver.email}`);
    }
  }
}
