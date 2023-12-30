import DatabaseManager from './database/database-manager';
import { Client, Driver } from '../../common/model';
import { Connection } from 'mysql2/promise';
import LocationRepository from './location-repository';

export default class DriverRepository {
  private dbName: string;

  constructor(private readonly databaseManager: DatabaseManager) {
    this.dbName = databaseManager.databaseConfig.database;
  }

  // async create(client: Client, connection: Connection): Promise<number> {
  //   const escape = (data) => connection.escape(data);

  //   try {
  //     await connection.beginTransaction();

  //     const homeLocationId = await this.locationRepository.create(
  //       client.homeLocation,
  //       connection
  //     );

  //     let query = `
  //       INSERT INTO ${this.dbName}.clients(
  //         name,
  //         description,
  //         phoneNumber,
  //         driverGender,
  //         carType,
  //         homeLocation,
  //         hasMps,
  //         inactive
  //       ) VALUES (
  //       ${[
  //         escape(client.name),
  //         escape(client.clientDescription),
  //         escape(client.phoneNumber),
  //         escape(client.preferredDriverGender),
  //         escape(client.preferredCarType),
  //         escape(homeLocationId),
  //         client.hasMps ? 'true' : 'false',
  //         client.inactive ? 'true' : 'false',
  //       ].join(',')})`;

  //     await this.databaseManager.query(query, connection);

  //     return (
  //       await this.databaseManager.query(
  //         'SELECT LAST_INSERT_ID() AS lastInsertId',
  //         connection
  //       )
  //     )[0]['lastInsertId'];
  //   } catch (e) {
  //     console.error(e);
  //     await connection.rollback();
  //     throw e;
  //   } finally {
  //     await connection.commit();
  //   }
  // }

  // async update(id: number, client: Client, connection: Connection) {
  //   if (!id) {
  //     throw new Error('No id specified when updating client.');
  //   }
  //   const escape = (data) => connection.escape(data);

  //   const homeLocationPoint = `POINT(${escape(
  //     client.homeLocation.longitude
  //   )}, ${escape(client.homeLocation.latitude)})`;

  //   let query = `
  //     UPDATE ${this.dbName}.clients AS clients
  //       INNER JOIN ${this.dbName}.locations AS locations
  //       ON clients.homeLocation = locations.id
  //     SET
  //       clients.name = ${escape(client.name)},
  //       clients.description = ${escape(client.clientDescription)},
  //       clients.phoneNumber = ${escape(client.phoneNumber)},
  //       clients.driverGender = ${escape(client.preferredDriverGender)},
  //       clients.carType = ${escape(client.preferredCarType)},
  //       clients.hasMps = ${escape(client.hasMps)},
  //       clients.inactive = ${escape(client.inactive)},
  //       locations.name = ${escape(client.homeLocation.placeName)},
  //       locations.point = ${homeLocationPoint},
  //       locations.suburb = ${escape(client.homeLocation.suburb)},
  //       locations.postCode = ${escape(client.homeLocation.postCode)}
  //     WHERE
  //       clients.id = ${escape(id)};
  //   `;

  //   // console.log(query);

  //   return this.databaseManager.query(query, connection);
  // }

  async list(connection: Connection): Promise<Driver[]> {
    const query = `
      SELECT 
        *
      FROM ${this.dbName}.driver
      ORDER BY driverName ASC;
    `;

    // console.log(query);

    const results = await this.databaseManager.query(query, connection);

    return results.map(
      (result) => ({
        ...result,
        hasSuv: result.hasSuv === 'Yes'
      } as Driver)
    );
  }

  // delete(id, connection) {
  //   if (!id) {
  //     throw new Error('No id specified when updating client.');
  //   }
  //   const escape = (data) => connection.escape(data);
  //   let query = `DELETE FROM ${this.dbName}.clients WHERE id = ${escape(id)}`;

  //   return this.databaseManager.query(query, connection);
  // }
}

module.exports = DriverRepository;
