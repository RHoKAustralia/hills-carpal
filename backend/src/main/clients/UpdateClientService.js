'use strict';

const jsonValidator = require('jsonschema');
const clientSchema = require('../schema/client.json');
const ClientRepository = require('./ClientRepository');
const ClientMapper = require('./ClientMapper');
const PromiseUtils = require('../utils/PromiseUtils');

class UpdateClientService {
  constructor(databaseManager) {
    this._databaseManager = databaseManager;
    this._clientRepository = new ClientRepository(databaseManager);
  }

  updateClient(id, client, loginData) {
    const isAdmin = this._hasRole('admin', loginData);
    const isFacilitator = this._hasRole('facilitator', loginData);
    if (!isAdmin && !isFacilitator) {
      console.log('WARNING: unauthorised attempt to create client', loginData);
      return Promise.reject(new Error('Not authorised'));
    }

    const connection = this._databaseManager.createConnection();
    let updatePromise = this._updateClient(id, client, loginData, connection);
    const closeConnection = () =>
      this._databaseManager.closeConnection(connection);
    return PromiseUtils.promiseFinally(updatePromise, closeConnection);
  }

  _updateClient(id, clientObject, loginData, connection) {
    let validationError = this._validate(clientObject);
    if (validationError) {
      return Promise.reject(validationError);
    }

    let clientEntity = ClientMapper.dtoToEntity(clientObject);
    return this._clientRepository.update(id, clientEntity, connection);
  }

  _validate(data) {
    const validationResult = jsonValidator.validate(data, clientSchema);
    if (validationResult.errors && validationResult.errors.length) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify({ error: validationResult.errors })
      };
    }
  }

  _hasRole(role, loginData) {
    return loginData && loginData.roles.indexOf(role) >= 0;
  }
}

module.exports = UpdateClientService;
