'use strict';

const ClientRepository = require('./ClientRepository');
const ClientMapper = require('./ClientMapper');
const PromiseUtils = require('../utils/PromiseUtils');

class ListClientsService {

  constructor(databaseManager) {
    this._databaseManager = databaseManager;
    this._clientRepository = new ClientRepository(databaseManager);
  }

  listClients(query, loginData) {
    const connection = this._databaseManager.createConnection();

    const listClientsPromise = this._listClients(query, loginData, connection)
      .then(clients => clients.map(ClientMapper.entityToDto));
    const closeConnection = () => this._databaseManager.closeConnection(connection);
    return PromiseUtils.promiseFinally(listClientsPromise, closeConnection);
  }

  _listClients(query, loginData, connection) {
    return this._clientRepository.list(connection);
  }

}


module.exports = ListClientsService;