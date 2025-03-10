import { AppMetadata, User, UserMetadata } from 'auth0';
import _, { unionBy } from 'lodash';

import { Ride } from '../../common/model';
import { getUserRoles, getUsersInRole } from '../auth/api-auth0';
import DatabaseManager from '../api/database/database-manager';
import DriverRepository from '../api/driver-repository';

const databaseManager = new DatabaseManager();
const driverRepository = new DriverRepository(databaseManager);

interface NotificationDriver {
  email: string;
  name: string;
}
export const getDrivers = async (ride: Ride) => {
  const auth0Drivers = (await getDriversFromAuth0(ride)).map((driver) => ({
    email: driver.email,
    name: driver.given_name || driver.nickname || driver.name || '',
  }));
  const dbDrivers = (await getDriversFromDb(ride)).map((driver) => ({
    email: driver.email,
    name: driver.givenName,
  }));

  return unionBy(dbDrivers, auth0Drivers, (driver) => driver.email);
};

async function getDriversFromAuth0(ride: Ride) {
  const allDriversFromAuth0 = await getUsersInRole('driver');

  console.log(`${allDriversFromAuth0.length} users in Auth0 have role driver`);

  const requiredRole = process.env.REQUIRE_USER_ROLE;

  if (requiredRole) {
    console.log(`Required role for this environment is ${requiredRole}`);
  } else {
    console.log(`No required role for this environment`);
  }

  const validDrivers = requiredRole
    ? _.intersectionBy(
        allDriversFromAuth0,
        await getUsersInRole(requiredRole),
        (driver1) => driver1.user_id
      )
    : allDriversFromAuth0;

  console.log(
    `${validDrivers.length} have both role driver and the environment required role`
  );

  let filteredDrivers: User<AppMetadata, UserMetadata>[] = [];

  for (let driver of validDrivers) {
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
      (ride.client.preferredDriverGender === 'female' &&
        roleLookup['female']) ||
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

const getDriversFromDb = async (ride: Ride) => {
  const connection = await databaseManager.createConnection();
  const allDriversFromDb = await driverRepository.list(connection, {
    gender: ride.client.preferredDriverGender,
    hasSuv: ride.client.preferredCarType,
    excludeInactive: true,
  });

  console.log(`${allDriversFromDb.length} valid drivers from DB`);

  return allDriversFromDb;
};
