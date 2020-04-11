import DatabaseManager from '../database/database-manager';
import { Client } from '../../model';
import { Connection } from 'mysql';

export default class ClientRepository {
  private dbName: string;

  constructor(private readonly databaseManager: DatabaseManager) {
    this.dbName = databaseManager.databaseConfig.database;
  }

  create(client: Client, connection: Connection) {
    const escape = (data) => connection.escape(data);
    const locationHome = `POINT(${escape(
      client.locationHome.latitude
    )}, ${escape(client.locationHome.longitude)})`;
    let query = `
      INSERT INTO ${this.dbName}.clients(
        name,
        description,
        phoneNumber,
        driverGender,
        carType,
        locationHome,
        placeNameHome,
        hasMps
      ) VALUES (
      ${[
        escape(client.name),
        escape(client.description),
        escape(client.phoneNumber),
        escape(client.preferredDriverGender),
        escape(client.preferredCarType),
        locationHome,
        escape(client.locationHome.placeName),
        client.hasMps ? 'true' : 'false',
      ].join(',')})`;
    console.log(query);

    return this.databaseManager.query(query, connection);
  }

  update(id: number, client: Client, connection: Connection) {
    if (!id) {
      throw new Error('No id specified when updating client.');
    }
    const escape = (data) => connection.escape(data);
    const locationHome = `POINT(${escape(
      client.locationHome.latitude
    )}, ${escape(client.locationHome.longitude)})`;
    let query = `
      UPDATE ${this.dbName}.clients 
      SET
        name = ${escape(client.name)},
        description = ${escape(client.description)},
        phoneNumber = ${escape(client.phoneNumber)},
        driverGender = ${escape(client.preferredDriverGender)},
        carType = ${escape(client.preferredCarType)},
        locationHome = ${locationHome},
        placeNameHome = ${escape(client.locationHome.placeName)},
        hasMps = ${escape(client.hasMps)}
      WHERE
        id = ${escape(id)};
    `;
    console.log(query);

    return this.databaseManager.query(query, connection);
  }

  list(connection): Promise<Client[]> {
    // const escape = (data) => connection.escape(data);

    let query = `SELECT * FROM ${this.dbName}.clients ORDER BY name ASC;`;
    console.log(query);
    return this.databaseManager.query(query, connection);
  }

  delete(id, connection) {
    if (!id) {
      throw new Error('No id specified when updating client.');
    }
    const escape = (data) => connection.escape(data);
    let query = `DELETE FROM ${this.dbName}.clients WHERE id = ${escape(id)}`;

    return this.databaseManager.query(query, connection);
  }
}

module.exports = ClientRepository;
