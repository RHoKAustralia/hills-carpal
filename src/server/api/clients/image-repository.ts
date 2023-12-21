import { Connection } from 'mysql2';

import DatabaseManager from '../database/database-manager';
import { Image } from '../../../common/model';

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
  ): Promise<Image> {
    try {
      await this.databaseManager.beginTransaction(connection);

      const addImageQuery = `
        INSERT INTO ${this.dbName}.images(mime_type, content) 
        VALUES (${[
          connection.escape(mimeType),
          connection.escape(content),
        ].join(',')})`;

      await this.databaseManager.query(addImageQuery, connection);

      const imageIds = await this.databaseManager.query(
        'SELECT LAST_INSERT_ID() AS lastId',
        connection
      );

      const imageId = imageIds[0].lastId;

      const addJoinQuery = `
        INSERT INTO ${this.dbName}.client_images(images_id, clients_id) 
        VALUES (
          ${imageId},  
          ${[connection.escape(clientId)].join(',')}
        )`;

      await this.databaseManager.query(addJoinQuery, connection);
      await this.databaseManager.commit(connection);

      const images = await this.databaseManager.query(
        `SELECT
            images.id as id, images.mime_type AS mimeType, images.caption AS caption
          FROM
            ${this.dbName}.images AS images
          WHERE
            images.id = ${imageId};`,
        connection
      );

      return images[0];
    } catch (e) {
      console.error(e);
      await this.databaseManager.rollback(connection);
      throw e;
    }
  }

  list(connection: Connection, clientId: string): Promise<Image[]> {
    const escape = (data) => connection.escape(data);

    let query = `
      SELECT
        images.id, images.mime_type AS mimeType, images.caption
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

  async get(
    connection: Connection,
    imageId: string
  ): Promise<Image | undefined> {
    const escape = (data) => connection.escape(data);

    const query = `
      SELECT 
        images.content as content, images.mime_type as mimeType
      FROM 
        ${this.dbName}.images AS images
      WHERE 
        images.id = ${escape(imageId)};
    `;

    const images = await this.databaseManager.query(query, connection);

    if (images.length > 0) {
      return images[0];
    } else {
      return;
    }
  }

  update(id: string, image: Image, connection: Connection) {
    if (!id) {
      throw new Error('No id specified when updating client.');
    }
    const escape = (data) => connection.escape(data);
    let query = `
      UPDATE ${this.dbName}.images
      SET 
        mime_type = ${escape(image.mimeType)},
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
