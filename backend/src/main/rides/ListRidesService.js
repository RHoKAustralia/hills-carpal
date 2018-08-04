'use strict';

const RideRepository = require('./RideRepository');
const RidesMapper = require('./RideMapper');

class ListRidesService {

  constructor(databaseManager) {
    this._databaseManager = databaseManager;
    this._rideRepository = new RideRepository(databaseManager);
  }

  listRides(queryParams, loginData) {
    const connection = this._databaseManager.createConnection();

    return this._listRides(queryParams, loginData, connection)
      .then(rides => rides.map(RidesMapper.entityToDto))
      .finally(() => this._databaseManager.closeConnection(connection));
  }

  _listRides(queryParams, loginData, connection) {
    let jsonQuery = this._parseParams(queryParams, loginData);
    return this._rideRepository.list(jsonQuery, connection);
  }

  _parseParams(queryParams, loginData) {
    return {
      toLongitude: queryParams.toLongitude,
      toLatitude: queryParams.toLatitude,
      fromLongitude: queryParams.fromLongitude,
      fromLatitude: queryParams.fromLatitude,
      driverGenders: loginData.role === 'driver' ? ['any', loginData.driverGender] : undefined,
      includePickupTimeInPast: loginData.role !== 'driver',
      facilitatorId: loginData.role === 'facilitator' ? loginData.email : undefined,
    };
  }
}

module.exports = ListRidesService;