import DatabaseManager from './database/database-manager';
import { Client, Driver } from '../../common/model';
import { Connection } from 'mysql2/promise';
import LocationRepository from './location-repository';

export default class DriverRepository {
  private dbName: string;

  constructor(private readonly databaseManager: DatabaseManager) {
    this.dbName = databaseManager.databaseConfig.database;
  }

  async create(driver: Driver, connection: Connection): Promise<number> {
    const escape = (data) => connection.escape(data);

    try {
      await connection.beginTransaction();

      let query = `
        INSERT INTO ${this.dbName}.driver(
          givenName,
          familyName,
          email,
          mobile,
          driverGender,
          hasSuv,
          driverName,
          driverRego,
          mpsPermit,
          auth0Id
        ) VALUES (
        ${[
          escape(driver.givenName),
          escape(driver.familyName),
          escape(driver.email),
          escape(driver.mobile),
          escape(driver.driverGender),
          escape(driver.hasSuv ? 'Yes' : 'No'),
          escape(driver.givenName + ' ' + driver.familyName),
          escape(driver.driverRego),
          escape(driver.mpsPermit),
          escape(driver.auth0Id),
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
      await connection.rollback();
      throw e;
    } finally {
      await connection.commit();
    }
  }

  async update(id: number, driver: Driver, connection: Connection) {
    if (!id) {
      throw new Error('No id specified when updating client.');
    }
    const escape = (data) => connection.escape(data);

    let query = `
      UPDATE ${this.dbName}.driver AS drivers
      SET
        drivers.givenName = ${escape(driver.givenName)},
        drivers.familyName = ${escape(driver.familyName)},
        drivers.email = ${escape(driver.email)},
        drivers.mobile = ${escape(driver.mobile)},
        drivers.driverGender = ${escape(driver.driverGender)},
        drivers.hasSuv = ${escape(driver.hasSuv ? 'Yes' : 'No')},
        drivers.driverName = ${escape(
          driver.givenName + ' ' + driver.familyName
        )},
        drivers.driverRego = ${escape(driver.driverRego)},
        drivers.mpsPermit = ${escape(driver.mpsPermit)},
        drivers.auth0Id = ${escape(driver.auth0Id)}
      WHERE
        drivers.id = ${escape(id)};
    `;

    // console.log(query);

    return this.databaseManager.query(query, connection);
  }

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
      (result) =>
        ({
          ...result,
          hasSuv: result.hasSuv === 'Yes',
        } as Driver)
    );
  }

  delete(id: number, connection: Connection) {
    if (!id) {
      throw new Error('No id specified when updating driver.');
    }
    const escape = (data) => connection.escape(data);
    let query = `DELETE FROM ${this.dbName}.driver WHERE id = ${escape(id)}`;

    return this.databaseManager.query(query, connection);
  }
}

module.exports = DriverRepository;
