import DatabaseManager from './database/database-manager';
import { CarType, Client, Driver, GenderPreference } from '../../common/model';
import { Connection } from 'mysql2/promise';
import LocationRepository from './location-repository';
import { isUndefined } from 'lodash';

interface QueryFilter {
  hasSuv?: CarType;
  gender?: GenderPreference;
  excludeInactive?: boolean;
}
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
          auth0Id,
          inactive
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
          driver.inactive ? 'true' : 'false',
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
        drivers.auth0Id = ${escape(driver.auth0Id)},
        drivers.inactive = ${escape(driver.inactive)}
      WHERE
        drivers.id = ${escape(id)};
    `;

    // console.log(query);

    return this.databaseManager.query(query, connection);
  }

  async list(
    connection: Connection,
    filter: QueryFilter = {}
  ): Promise<Driver[]> {
    const where = [];

    if (!isUndefined(filter.gender) && filter.gender !== 'any') {
      where.push(
        `( driver.driverGender = ${connection.escape(filter.gender)} )`
      );
    }

    if (!isUndefined(filter.hasSuv) && filter.hasSuv !== 'All') {
      where.push(
        `( driver.hasSuv = ${filter.hasSuv === 'noSUV' ? "'No'" : "'Yes'"} )`
      );
    }

    if (filter.excludeInactive) {
      where.push(`( driver.inactive = 0 )`);
    }

    const query = `
      SELECT 
        *
      FROM ${this.dbName}.driver
      ${where.length ? ' WHERE ' + where.join(' AND ') : ''}
      ORDER BY driverName ASC;
    `;

    // console.log(query);

    const results = await this.databaseManager.query(query, connection);

    return results.map(
      (result) =>
        ({
          ...result,
          hasSuv: result.hasSuv === 'Yes',
          inactive: result.inactive ? true : false,
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

  async getByAuth0Id(
    auth0Id: string,
    connection: Connection
  ): Promise<Driver | undefined> {
    const query = `
      SELECT 
        *
      FROM ${this.dbName}.driver
      WHERE auth0Id = ${connection.escape(auth0Id)}
      LIMIT 1;
    `;

    // console.log(query);

    const results = await this.databaseManager.query(query, connection);

    const driverResults = results.map(
      (result) =>
        ({
          ...result,
          hasSuv: result.hasSuv === 'Yes',
          inactive: result.inactive ? true : false,
        } as Driver)
    );

    return driverResults.length >= 1 ? driverResults[0] : undefined;
  }

  async isActiveDriver(auth0Id: string, connection: Connection) {
    const query = `SELECT 1 FROM ${
      this.dbName
    }.driver WHERE auth0Id = ${connection.escape(auth0Id)} AND inactive = 0`;

    const results = await this.databaseManager.query(query, connection);

    return results.length > 0;
  }
}

module.exports = DriverRepository;
