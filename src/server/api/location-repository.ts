import DatabaseManager from './database/database-manager';
import { Location } from '../../common/model';
import { Connection } from 'mysql2/promise';

export default class LocationRepository {
  private dbName: string;

  constructor(private readonly databaseManager: DatabaseManager) {
    this.dbName = databaseManager.databaseConfig.database;
  }

  async create(location: Location, connection: Connection): Promise<number> {
    const escape = (data) => connection.escape(data);

    const point = `POINT(${escape(location.longitude)}, ${escape(
      location.latitude
    )})`;

    await this.databaseManager.query(
      `INSERT INTO locations (
          point, name, suburb, postCode
        ) VALUES (
          ${point},
          ${escape(location.placeName)},
          ${escape(location.suburb)},
          ${escape(location.postCode)}
        );
      `,
      connection
    );

    return (
      await this.databaseManager.query(
        'SELECT LAST_INSERT_ID() AS lastInsertId',
        connection
      )
    )[0]['lastInsertId'];
  }

  async update(
    id: number,
    location: Location,
    connection: Connection
  ): Promise<void> {
    const escape = (data) => connection.escape(data);

    const point = `POINT(${escape(location.longitude)}, ${escape(
      location.latitude
    )})`;

    const sql = `
      UPDATE ${this.dbName}.locations 
      SET
        point = ${point},
        name = ${escape(location.placeName)},
        suburb = ${escape(location.suburb)},
        postCode = ${escape(location.postCode)}
      WHERE
        id = ${id};
   `;

    // console.log(sql);

    await this.databaseManager.query(sql, connection);
  }
}
