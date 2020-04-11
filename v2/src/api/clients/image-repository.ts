import { Connection } from 'mysql';

import DatabaseManager from '../database/database-manager';
import { Image } from '../../model';

class ImageRepository {
  private dbName: string;

  constructor(private readonly databaseManager: DatabaseManager) {
    this.dbName = databaseManager.databaseConfig.database;
  }

  async upload(
    content: string,
    mimeType: string,
    clientId: string,
    connection: Connection
  ) {
    try {
      await this.databaseManager.beginTransaction(connection);

      const addImageQuery = `
        INSERT INTO ${this.dbName}.images(mime_type, content) 
        VALUES (${[
          connection.escape(mimeType),
          connection.escape(content),
        ].join(',')})`;

      await this.databaseManager.query(addImageQuery, connection);

      const addJoinQuery = `
        INSERT INTO ${this.dbName}.client_images(images_id, clients_id) 
        VALUES (
          (SELECT LAST_INSERT_ID()),  
          ${[connection.escape(clientId)].join(',')}
        )`;

      await this.databaseManager.query(addJoinQuery, connection);
      await this.databaseManager.commit(connection);

      return this.databaseManager
        .query(
          `SELECT
            images.id, images.mime_type, images.caption
          FROM
            ${this.dbName}.images AS images
          WHERE
            images.id = (SELECT LAST_INSERT_ID());`,
          connection
        )
        .then((images) => images[0]);
    } catch (e) {
      await this.databaseManager.rollback(connection);
      console.error(e);
      throw e;
    }
  }

  list(connection: Connection, clientId: string): Promise<Image[]> {
    const escape = (data) => connection.escape(data);

    let query = `
      SELECT
        images.id, images.mime_type, images.caption
      FROM
        ${this.dbName}.images AS images 
      INNER JOIN
        ${this.dbName}.client_images AS client_images
        ON images.id = client_images.images_id
      WHERE
        client_images.clients_id = ${escape(clientId)};`;

    // console.log(query);

    return this.databaseManager.query(query, connection);
  }

  get(connection: Connection, imageId: string) {
    const escape = (data) => connection.escape(data);

    let query = `
      SELECT *
      FROM ${this.dbName}.images AS images
      WHERE images.id = ${escape(imageId)};`;

    return this.databaseManager.query(query, connection);
  }

  update(id: string, image: Image, connection: Connection) {
    if (!id) {
      throw new Error('No id specified when updating client.');
    }
    const escape = (data) => connection.escape(data);
    let query = `
      UPDATE ${this.dbName}.images
      SET 
        mime_type = ${escape(image.mime_type)},
        caption = ${escape(image.caption)}
      WHERE
        id = ${escape(id)};`;

    return this.databaseManager.query(query, connection);
  }

  delete(id: string, connection: Connection) {
    if (!id) {
      throw new Error('No id specified when deleting image.');
    }
    const escape = (data) => connection.escape(data);
    let query = `DELETE FROM ${this.dbName}.images WHERE id = ${escape(id)};`;

    return this.databaseManager.query(query, connection);
  }
}

export default ImageRepository;
