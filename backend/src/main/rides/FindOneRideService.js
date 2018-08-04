'use strict';

const RideRepository = require('./RideRepository');
const RidesMapper = require('./RideMapper');

class FindOneRideService {

  constructor(databaseManager) {
    this._databaseManager = databaseManager;
    this._rideRepository = new RideRepository(databaseManager);
  }

  findOne(id, loginData) {
    if (loginData.role === 'driver') {
      return Promise.resolve(null);
    }

    const connection = this._databaseManager.createConnection();
    return this._findOne(id, loginData, connection)
      .finally(() => this._databaseManager.closeConnection(connection));
  }

  _findOne(id, loginData, connection) {
    let jsonQuery = this._createQuery(id, loginData);
    return this._rideRepository.findOne(jsonQuery, connection)
      .then(item => RidesMapper.entityToDto(item));
  }

  _createQuery(id, loginData) {
    return {
      id: id,
      facilitatorId: loginData.role === 'facilitator' ? loginData.email : undefined,
      includePickupTimeInPast: true
    };
  }
}

module.exports = FindOneRideService;