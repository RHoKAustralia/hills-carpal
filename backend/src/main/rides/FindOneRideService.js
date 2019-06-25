'use strict';

const RideRepository = require('./RideRepository');
const RidesMapper = require('./RideMapper');
const PromiseUtils = require('../utils/PromiseUtils');

class FindOneRideService {
  constructor(databaseManager) {
    this._databaseManager = databaseManager;
    this._rideRepository = new RideRepository(databaseManager);
  }

  findOne(id, loginData) {
    const connection = this._databaseManager.createConnection();
    const findOnePromise = this._findOne(id, loginData, connection);
    const closeConnection = () =>
      this._databaseManager.closeConnection(connection);
    return PromiseUtils.promiseFinally(findOnePromise, closeConnection);
  }

  _findOne(id, loginData, connection) {
    let jsonQuery = this._createQuery(id, loginData);
    return this._rideRepository
      .findOne(jsonQuery, connection)
      .then(item => RidesMapper.entityToDto(item));
  }

  _createQuery(id, loginData) {
    return {
      id: id,
      facilitatorId:
        loginData.roles.indexOf('facilitator') !== -1
          ? loginData.userId
          : undefined,
      includePickupTimeInPast: true,
      driverId:
        loginData.roles && loginData.roles.indexOf('driver') !== -1
          ? loginData.userId
          : undefined
    };
  }
}

module.exports = FindOneRideService;
