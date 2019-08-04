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
    const isAdmin = this._hasRole('admin', loginData);
    const isFacilitator = this._hasRole('facilitator', loginData);
    if (!isAdmin && !isFacilitator) {
      console.log('WARNING: unauthorised attempt to delete client', loginData);
      return Promise.reject(new Error('Not authorised'));
    }
    const connection = this._databaseManager.createConnection();
    let deletePromise = this._deleteClient(id, loginData, connection);
    const closeConnection = () =>
      this._databaseManager.closeConnection(connection);
    return PromiseUtils.promiseFinally(deletePromise, closeConnection);
  }

  _deleteClient(id, loginData, connection) {
    return this._clientRepository.delete(id, connection);
  }

  _hasRole(role, loginData) {
    return loginData && loginData.roles.indexOf(role) >= 0;
  }
}

module.exports = DeleteClientService;
