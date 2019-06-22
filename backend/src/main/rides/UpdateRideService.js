'use strict';

const jsonValidator = require('jsonschema');
const rideSchema = require('../schema/ride.json');
const RideRepository = require('./RideRepository');
const RideStatus = require('../../main/rides/RideStatus');
const RideMapper = require('./RideMapper');
const PromiseUtils = require('../utils/PromiseUtils');

class UpdateRideService {

  constructor(databaseManager) {
    this._databaseManager = databaseManager;
    this._rideRepository = new RideRepository(databaseManager);
  }

  updateRide(id, ride, loginData) {
    const connection = this._databaseManager.createConnection();
    let updatePromise = this._updateRide(id, ride, loginData, connection);
    const closeConnection = () => this._databaseManager.closeConnection(connection);
    return PromiseUtils.promiseFinally(updatePromise, closeConnection);
  }

  acceptRide(id, ride, loginData) {
    const rideToUpdate = Object.assign({}, ride);
    rideToUpdate.status = RideStatus.CONFIRMED;
    return this.updateRide(id, rideToUpdate, loginData);
  }

  declineRide(id, ride, loginData) {
    const rideToUpdate = Object.assign({}, ride);
    rideToUpdate.status = RideStatus.OPEN;
    return this.updateRide(id, rideToUpdate, loginData);
  }

  _getRide(id, loginData) {
    return this._rideRepository
      .findOne({
        id: id,
        facilitatorId: loginData.role === 'facilitator' ? loginData.email : undefined,
        includePickupTimeInPast: true
      });
  }

  _updateRide(id, rideObject, loginData, connection) {
    rideObject.datetime = new Date().getTime();

    let validationError = this._validate(rideObject);
    if (validationError) {
      return Promise.reject(validationError);
    }

    return this._getRide(id, loginData)
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
