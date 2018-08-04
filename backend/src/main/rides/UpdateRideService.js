'use strict';

const jsonValidator = require('jsonschema');
const rideSchema = require('../schema/ride.json');
const RideRepository = require('./RideRepository');
const RideMapper = require('./RideMapper');

class UpdateRideService {

  constructor(databaseManager) {
    this._databaseManager = databaseManager;
    this._rideRepository = new RideRepository(databaseManager);
  }

  updateRide(id, ride, loginData) {
    const connection = this._databaseManager.createConnection();

    let updatePromise = this._updateRide(id, ride, loginData, connection);
    return updatePromise.finally(() => this._databaseManager.closeConnection(connection));
  }

  _updateRide(id, rideObject, loginData, connection) {
    rideObject.datetime = new Date().getTime();

    let validationError = this._validate(rideObject);
    if (validationError) {
      return Promise.reject(validationError);
    }

    return this._rideRepository
      .findOne({
        id: id,
        facilitatorId: loginData.role === 'facilitator' ? loginData.email : undefined,
        includePickupTimeInPast: true
      })
      .then(ride => {
        if (!ride || ride.deleted) {
          return null;
        }
        let rideEntity = RideMapper.dtoToEntity(rideObject);
        rideEntity.facilitatorId = ride.facilitatorId;
        return this._rideRepository.update(ride.id, rideEntity, connection);
      });
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

module.exports = UpdateRideService;