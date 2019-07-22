'use strict';

const moment = require('moment');

class ClientRepository {
  constructor(databaseManager) {
    this._databaseManager = databaseManager;
    this._dbName = this._databaseManager.databaseConfig.database;
  }

  async upload(content, mimeType, clientId, connection) {
    try {
      await this._databaseManager.beginTransaction(connection);

      const addImageQuery = `INSERT INTO ${
        this._dbName
      }.images(mime_type, content) 
        VALUES (${[
          connection.escape(mimeType),
          connection.escape(content)
        ].join(',')})`;

      await this._databaseManager.query(addImageQuery, connection);

      const addJoinQuery = `INSERT INTO ${
        this._dbName
      }.client_images(images_id, clients_id) 
        VALUES (
          (SELECT LAST_INSERT_ID()),  
          ${[connection.escape(clientId)].join(',')}
        )`;

      await this._databaseManager.query(addJoinQuery, connection);

      await this._databaseManager.commit(connection);
    } catch (e) {
      await this._databaseManager.rollback(connection);
      console.error(e);
      throw e;
    }
  }

  list(connection, clientId) {
    const escape = data => connection.escape(data);

    let query = `SELECT * FROM ${this._dbName}.images AS images 
      INNER JOIN ${this._dbName}.client_images AS client_images
      ON images.id = client_images.images_id
      WHERE client_images.clients_id = ${escape(clientId)}`;
    console.log(query);
    return this._databaseManager.query(query, connection);
  }

  get(connection, imageId) {
    const escape = data => connection.escape(data);

    let query = `SELECT * FROM ${this._dbName}.images AS images
      WHERE images.id = ${escape(imageId)}`;
    console.log(query);
    return this._databaseManager.query(query, connection);
  }

  // update(id, client, connection) {
  //   if (!id) {
  //     throw new Error('No id specified when updating client.');
  //   }
  //   const escape = (data) => connection.escape(data);
  //   let query = `UPDATE ${this._dbName}.clients SET name = ${escape(client.name)},
  //                                 description = ${escape(client.description)}
  //                               WHERE
  //                                 id = ${id}`;
  //   console.log(query);

  //   return this._databaseManager.query(query, connection);
  // }

  // delete(id, connection) {
  //   if (!id) {
  //     throw new Error('No id specified when updating client.');
  //   }
  //   const escape = (data) => connection.escape(data);
  //   let query = `DELETE FROM ${this._dbName}.clients WHERE id = ${id}`;

  //   return this._databaseManager.query(query, connection);
  // }
}

module.exports = ClientRepository;
