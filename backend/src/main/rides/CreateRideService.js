'use strict';

const jsonValidator = require('jsonschema');
const rideSchema = require('../schema/ride.json');
const RideStatus = require('./RideStatus');
const RideRepository = require('./RideRepository');
const RideMapper = require('./RideMapper');

class CreateRideService {

  constructor(databaseManager) {
    this._databaseManager = databaseManager;
    this._rideRepository = new RideRepository(databaseManager);
  }

  createRide(body, loginData) {
    const connection = this._databaseManager.createConnection();

    return this._createRide(body, loginData, connection)
      .finally(() => this._databaseManager.closeConnection(connection));
  }

  _createRide(rideObject, loginData, connection) {
    rideObject.datetime = new Date().getTime();

    let validationError = this._validate(rideObject);
    if (validationError) {
      return Promise.reject(validationError);
    }

    const payload = RideMapper.dtoToEntity(rideObject, loginData && loginData.email);
    payload.status = RideStatus.OPEN;
    payload.deleted = '0';

    return this._rideRepository.create(payload, connection);
  }

  _validate(data) {
    const validationResult = jsonValidator.validate(data, rideSchema);
    if (validationResult.errors && validationResult.errors.length) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify({"error": validationResult.errors})
      };
    }
  }
}

module.exports = CreateRideService;