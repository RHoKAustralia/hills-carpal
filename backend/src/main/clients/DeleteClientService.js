'use strict';

const jsonValidator = require('jsonschema');
const clientSchema = require('../schema/client.json');
const ClientRepository = require('./ClientRepository');
const ClientMapper = require('./ClientMapper');
const PromiseUtils = require('../utils/PromiseUtils');

class DeleteClientService {

  constructor(databaseManager) {
    this._databaseManager = databaseManager;
    this._clientRepository = new ClientRepository(databaseManager);
  }

  deleteClient(id, loginData) {
    const connection = this._databaseManager.createConnection();
    let deletePromise = this._deleteClient(id, loginData, connection);
    const closeConnection = () => this._databaseManager.closeConnection(connection);
    return PromiseUtils.promiseFinally(deletePromise, closeConnection);
  }

  _deleteClient(id, loginData, connection) {
    return this._clientRepository.delete(id, connection);
  }
}

module.exports = DeleteClientService;