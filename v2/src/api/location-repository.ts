import DatabaseManager from './database/database-manager';
import { Location } from './../model';
import { Connection } from 'mysql';

export default class LocationRepository {
  private dbName: string;

  constructor(private readonly databaseManager: DatabaseManager) {
    this.dbName = databaseManager.databaseConfig.database;
  }

  async create(location: Location, connection: Connection): Promise<number> {
    const escape = (data) => connection.escape(data);

    const point = `POINT(${escape(location.latitude)}, ${escape(
      location.longitude
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
}
