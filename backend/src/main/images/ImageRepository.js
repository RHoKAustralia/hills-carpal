'use strict';

const moment = require('moment');

class ImageRepository {
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

      return this._databaseManager
        .query(
          `SELECT images.id, images.mime_type, images.caption FROM ${this._dbName}.images AS images
      WHERE images.id = (SELECT LAST_INSERT_ID())`,
          connection
        )
        .then(images => images[0]);
    } catch (e) {
      await this._databaseManager.rollback(connection);
      console.error(e);
      throw e;
    }
  }

  list(connection, clientId) {
    const escape = data => connection.escape(data);

    let query = `SELECT images.id, images.mime_type, images.caption FROM ${
      this._dbName
    }.images AS images 
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

  update(id, image, connection) {
    if (!id) {
      throw new Error('No id specified when updating client.');
    }
    const escape = data => connection.escape(data);
    let query = `UPDATE ${this._dbName}.images SET mime_type = ${escape(
      image.mime_type
    )},
                                  caption = ${escape(image.caption)}
                                WHERE
                                  id = ${escape(id)}`;
    console.log(query);

    return this._databaseManager.query(query, connection);
  }

  delete(id, connection) {
    if (!id) {
      throw new Error('No id specified when deleting image.');
    }
    const escape = data => connection.escape(data);
    let query = `DELETE FROM ${this._dbName}.images WHERE id = ${id}`;

    return this._databaseManager.query(query, connection);
  }
}

module.exports = ImageRepository;
