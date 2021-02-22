import DatabaseManager from '../database/database-manager';
import { Client } from '../../../common/model';
import { Connection } from 'mysql';
import LocationRepository from '../location-repository';

export default class ClientRepository {
  private dbName: string;
  private locationRepository: LocationRepository;

  constructor(private readonly databaseManager: DatabaseManager) {
    this.dbName = databaseManager.databaseConfig.database;
    this.locationRepository = new LocationRepository(databaseManager);
  }

  async create(client: Client, connection: Connection): Promise<number> {
    const escape = (data) => connection.escape(data);

    try {
      await this.databaseManager.beginTransaction(connection);

      const homeLocationId = await this.locationRepository.create(
        client.homeLocation,
        connection
      );

      let query = `
        INSERT INTO ${this.dbName}.clients(
          name,
          description,
          phoneNumber,
          driverGender,
          carType,
          homeLocation,
          hasMps
        ) VALUES (
        ${[
          escape(client.name),
          escape(client.clientDescription),
          escape(client.phoneNumber),
          escape(client.preferredDriverGender),
          escape(client.preferredCarType),
          escape(homeLocationId),
          client.hasMps ? 'true' : 'false',
        ].join(',')})`;

      await this.databaseManager.query(query, connection);

      return (
        await this.databaseManager.query(
          'SELECT LAST_INSERT_ID() AS lastInsertId',
          connection
        )
      )[0]['lastInsertId'];
    } catch (e) {
      console.error(e);
      await this.databaseManager.rollback(connection);
      throw e;
    } finally {
      await this.databaseManager.commit(connection);
    }
  }

  async update(id: number, client: Client, connection: Connection) {
    if (!id) {
      throw new Error('No id specified when updating client.');
    }
    const escape = (data) => connection.escape(data);

    const homeLocationPoint = `POINT(${escape(
      client.homeLocation.longitude
    )}, ${escape(client.homeLocation.latitude)})`;

    let query = `
      UPDATE ${this.dbName}.clients AS clients
        INNER JOIN ${this.dbName}.locations AS locations
        ON clients.homeLocation = locations.id
      SET
        clients.name = ${escape(client.name)},
        clients.description = ${escape(client.clientDescription)},
        clients.phoneNumber = ${escape(client.phoneNumber)},
        clients.driverGender = ${escape(client.preferredDriverGender)},
        clients.carType = ${escape(client.preferredCarType)},
        clients.hasMps = ${escape(client.hasMps)},
        locations.name = ${escape(client.homeLocation.placeName)},
        locations.point = ${homeLocationPoint},
        locations.suburb = ${escape(client.homeLocation.suburb)},
        locations.postCode = ${escape(client.homeLocation.postCode)}
      WHERE
        clients.id = ${escape(id)};
    `;

    // console.log(query);

    return this.databaseManager.query(query, connection);
  }

  async list(connection): Promise<Client[]> {
    // const escape = (data) => connection.escape(data);

    const query = `
      SELECT 
        clients.id,
        clients.name,
        clients.phoneNumber,
        clients.description,
        clients.driverGender,
        clients.carType,
        clients.hasMps,
        locations.point,
        locations.name AS locationName,
        locations.suburb,
        locations.postCode
      FROM ${this.dbName}.clients AS clients
        INNER JOIN ${this.dbName}.locations AS locations
        ON clients.homeLocation = locations.id
      ORDER BY name ASC;
    `;

    // console.log(query);

    const results = await this.databaseManager.query(query, connection);

    return results.map(
      (result) =>
        ({
          id: result.id,
          name: result.name,
          phoneNumber: result.phoneNumber,
          clientDescription: result.description,
          preferredDriverGender: result.driverGender,
          preferredCarType: result.carType,
          hasMps: result.hasMps,
          homeLocation: {
            longitude: result.point.x,
            latitude: result.point.y,
            placeName: result.locationName,
            suburb: result.suburb,
            postCode: result.postCode,
          },
        } as Client)
    );
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
