'use strict';

const jsonValidator = require('jsonschema');
const ClientSchema = require('../schema/client.json');
const ClientMapper = require('./ClientMapper');
const ClientRepository = require('./ClientRepository');
const PromiseUtils = require('../utils/PromiseUtils');

class CreateClientService {

  constructor(databaseManager) {
    this._databaseManager = databaseManager;
    this._ClientRepository = new ClientRepository(databaseManager);
  }

  createClient(body, loginData) {
    const connection = this._databaseManager.createConnection();

    const createClientPromise = this._createClient(body, loginData, connection);
    const closeConnection = () => this._databaseManager.closeConnection(connection);
    return PromiseUtils.promiseFinally(createClientPromise, closeConnection);
  }

  _createClient(ClientObject, loginData, connection) {
    let validationError = this._validate(ClientObject);
    if (validationError) {
      return Promise.reject(validationError);
    }

    const payload = ClientMapper.dtoToEntity(ClientObject);

    return this._ClientRepository.create(payload, connection);
  }

  _validate(data) {
    const validationResult = jsonValidator.validate(data, ClientSchema);
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

module.exports = CreateClientService;