'use strict';

const moment = require('moment');
const jsonValidator = require('jsonschema');

const FindOneRideService = require('./FindOneRideService');
const rideSchema = require('../schema/ride.json');
const RideRepository = require('./RideRepository');
const RideStatus = require('../../main/rides/RideStatus');
const RideMapper = require('./RideMapper');
const PromiseUtils = require('../utils/PromiseUtils');

class UpdateRideService {
  constructor(databaseManager) {
    this._databaseManager = databaseManager;
    this._rideRepository = new RideRepository(databaseManager);
    this._findOneRideService = new FindOneRideService(databaseManager);
  }

  updateRide(id, ride, loginData) {
    const connection = this._databaseManager.createConnection();
    let updatePromise = this._updateRide(id, ride, loginData, connection);
    const closeConnection = () =>
      this._databaseManager.closeConnection(connection);
    return PromiseUtils.promiseFinally(updatePromise, closeConnection);
  }

  acceptRide(id, loginData) {
    return this.changeRideStatus(id, RideStatus.CONFIRMED, loginData);
  }

  declineRide(id, loginData) {
    return this.changeRideStatus(id, RideStatus.OPEN, loginData);
  }

  completeRide(id, loginData) {
    return this.changeRideStatus(id, RideStatus.ENDED, loginData);
  }

  changeRideStatus(id, newStatus, loginData) {
    const connection = this._databaseManager.createConnection();
    let updatePromise = this._changeRideStatus(
      id,
      newStatus,
      loginData,
      connection
    ).then(() => {
      return this._findOneRideService.findOne(id, loginData);
    });
    const closeConnection = () =>
      this._databaseManager.closeConnection(connection);
    return PromiseUtils.promiseFinally(updatePromise, closeConnection);
  }

  _getRide(id, loginData) {
    return this._rideRepository.findOne({
      id: id,
      facilitatorId:
        loginData.role === 'facilitator' ? loginData.email : undefined,
      includePickupTimeInPast: true
    });
  }

  _updateRide(id, rideObject, loginData, connection) {
    return this._getRide(id, loginData).then(ride => {
      if (!ride || ride.deleted) {
        return null;
      }
      const toSave = Object.assign(
        {},
        RideMapper.entityToDto(ride),
        rideObject,
        {
          datetime: new Date().getTime()
        }
      );

      if (toSave.status === RideStatus.OPEN) {
        toSave.driver = null;
      }

      let validationError = this._validate(toSave);
      if (validationError) {
        return Promise.reject(validationError);
      }
      let rideEntity = RideMapper.dtoToEntity(toSave);
      rideEntity.facilitatorId = ride.facilitatorId;

      return this._rideRepository.update(ride.id, rideEntity, connection);
    });
  }

  _changeRideStatus(id, newStatus, loginData, connection) {
    return this._getRide(id, loginData).then(dbRide => {
      if (!dbRide || dbRide.deleted) {
        return null;
      }

      const rideObject = RideMapper.entityToDto(dbRide);

      if (
        rideObject.driver &&
        rideObject.driver.driver_id !== loginData.userId
      ) {
        throw new Error(
          "Attempting to change the status of someone else's ride"
        );
      }

      rideObject.datetime = new Date().getTime();
      rideObject.status = newStatus;

      let validationError = this._validate();
      if (validationError) {
        return Promise.reject(validationError);
      }

      let rideEntity = RideMapper.dtoToEntity(rideObject);

      if (newStatus === RideStatus.OPEN) {
        rideEntity.driver = null;
      } else {
        rideEntity.driver = {
          driver_id: loginData.userId,
          driver_name: loginData.name,
          email: loginData.email,
          confirmed: rideObject.status === RideStatus.CONFIRMED
        };
      }

      rideEntity.facilitatorId = rideObject.facilitatorId;
      return this._rideRepository.update(id, rideEntity, connection);
    });
  }

  _validate(data) {
    const validationResult = jsonValidator.validate(data, rideSchema);
    if (validationResult.errors && validationResult.errors.length) {
      console.error(validationResult);
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify({ error: validationResult.errors })
      };
    }
  }
}

module.exports = UpdateRideService;
