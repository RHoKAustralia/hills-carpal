import { AppMetadata, User, UserMetadata } from 'auth0';
import _ from 'lodash';

import { Ride } from '../../common/model';
import { getUserRoles, getUsersInRole } from '../auth/api-auth0';

export default async function getDrivers(ride: Ride) {
  const drivers = await getUsersInRole('driver');

  let filteredDrivers: User<AppMetadata, UserMetadata>[] = [];
  for (let driver of drivers) {
    const driverRoles = await getUserRoles(driver.user_id);
    const roleLookup = _.keyBy(driverRoles, (role) => role.name);

    /** Does the driver's car match the suv preference */
    const suvOk =
      ride.client.preferredCarType === 'All' ||
      (ride.client.preferredCarType === 'noSUV' && !roleLookup['suv']) ||
      (ride.client.preferredCarType === 'suv' && roleLookup['suv']);

    /** Does the driver's gender match the gender preference */
    const genderOk =
      ride.client.preferredDriverGender === 'any' ||
      (ride.client.preferredDriverGender === 'female' && roleLookup['female']) ||
      (ride.client.preferredDriverGender === 'male' && roleLookup['male']);

    if (suvOk && genderOk) {
      filteredDrivers.push(driver);
    } else {
      console.log(
        `Skipping sending new ride notification to ${driver.email}: suvOk: ${suvOk}, genderOk ${genderOk}`
      );
    }
  }

  return filteredDrivers;
}
