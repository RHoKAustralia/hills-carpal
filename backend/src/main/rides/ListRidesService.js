'use strict';

const RideRepository = require('./RideRepository');
const RidesMapper = require('./RideMapper');
const PromiseUtils = require('../utils/PromiseUtils');

class ListRidesService {
  constructor(databaseManager) {
    this._databaseManager = databaseManager;
    this._rideRepository = new RideRepository(databaseManager);
  }

  listRides(query, loginData) {
    const connection = this._databaseManager.createConnection();

    const listRidesPromise = this._listRides(query, loginData, connection).then(
      rides => rides.map(RidesMapper.entityToDto)
    );
    const closeConnection = () =>
      this._databaseManager.closeConnection(connection);
    return PromiseUtils.promiseFinally(listRidesPromise, closeConnection);
  }

  _listRides(query, loginData, connection) {
    let jsonQuery = this._parseParams(query, loginData);
    if (!jsonQuery) {
      return Promise.resolve([]);
    }
    return this._rideRepository.list(jsonQuery, connection);
  }

  _parseParams(query, loginData) {
    const listType = query.listType || 'driver';
    const isAdmin = this._hasRole('admin', loginData);
    const isDriver = this._hasRole('driver', loginData);
    const isFacilitator = this._hasRole('facilitator', loginData);
    const notAdminAndListTypeDoesNotMatchRole =
      !this._hasRole(listType, loginData) && !isAdmin;
    if (notAdminAndListTypeDoesNotMatchRole) {
      console.log('WARNING: unauthorised attempt to query data', loginData);
      return null;
    }

    const driverRoutesOnly = listType === 'driver';

    return {
      toLongitude: query.toLongitude,
      toLatitude: query.toLatitude,
      fromLongitude: query.fromLongitude,
      fromLatitude: query.fromLatitude,
      driverGenders: driverRoutesOnly
        ? ['any', loginData.driverGender]
        : undefined,
      driverCars: driverRoutesOnly ? ['All', loginData.car] : undefined,
      includePickupTimeInPast: !driverRoutesOnly,
      facilitatorId:
        isFacilitator && !driverRoutesOnly ? loginData.email : undefined,
      driverId: decodeURIComponent(query.driverId),
      status: query.status && query.status.toUpperCase()
    };
  }

  _hasRole(role, loginData) {
    return loginData.roles.indexOf(role) >= 0;
  }
}

module.exports = ListRidesService;
