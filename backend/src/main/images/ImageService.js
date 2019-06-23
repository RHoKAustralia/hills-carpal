'use strict';

const jsonValidator = require('jsonschema');
const clientSchema = require('../schema/client.json');
const ClientRepository = require('./ClientRepository');
const ClientMapper = require('./ClientMapper');
const PromiseUtils = require('../utils/PromiseUtils');

class ImageService {

  constructor(databaseManager) {
    this._databaseManager = databaseManager;
    this._clientRepository = new ClientRepository(databaseManager);
  }

  addClientImage(id, client, loginData) {
    const connection = this._databaseManager.createConnection();
    let updatePromise = this._addClientImage(id, client, loginData, connection);
    const closeConnection = () => this._databaseManager.closeConnection(connection);
    return PromiseUtils.promiseFinally(updatePromise, closeConnection);
  }

  _addClientImage(id, clientObject, loginData, connection) {
    // let validationError = this._validate(clientObject);
    // if (validationError) {
    //   return Promise.reject(validationError);
    // }

    // let clientEntity = ClientMapper.dtoToEntity(clientObject);
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
        body: JSON.stringify({"error": validationResult.errors})
      };
    }
  }
}

module.exports = ImageService;