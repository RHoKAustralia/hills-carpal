'use strict';

const moment = require('moment');

class ClientRepository {
  constructor(databaseManager) {
    this._databaseManager = databaseManager;
    this._dbName = this._databaseManager.databaseConfig.database;
  }

  create(client, connection) {
    const escape = (data) => connection.escape(data);
    let query = `INSERT INTO ${this._dbName}.clients(name,
                                  description) 
                         VALUES 
                                  (${
      [escape(client.name),
        escape(client.description)
      ].join(',')})`;
    console.log(query);

    return this._databaseManager.query(query, connection);
  }

  update(id, client, connection) {
    if (!id) {
      throw new Error('No id specified when updating client.');
    }
    const escape = (data) => connection.escape(data);
    let query = `UPDATE ${this._dbName}.clients SET name = ${escape(client.name)},
                                  description = ${escape(client.description)}
                                WHERE
                                  id = ${id}`;
    console.log(query);

    return this._databaseManager.query(query, connection);
  }

  list(connection) {
    const escape = (data) => connection.escape(data);

    let query = `SELECT * FROM ${this._dbName}.clients ORDER BY name ASC;`;
    console.log(query);
    return this._databaseManager.query(query, connection);
  }

  delete(id, connection) {
    if (!id) {
      throw new Error('No id specified when updating client.');
    }
    const escape = (data) => connection.escape(data);
    let query = `DELETE FROM ${this._dbName}.clients WHERE id = ${id}`;

    return this._databaseManager.query(query, connection);
  }
}

module.exports = ClientRepository;