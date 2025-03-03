import DatabaseManager from './database/database-manager';
import { Client, Facilitator } from '../../common/model';
import { Connection } from 'mysql2/promise';

export default class FacilitatorRepository {
  private dbName: string;

  constructor(private readonly databaseManager: DatabaseManager) {
    this.dbName = databaseManager.databaseConfig.database;
  }

  async create(
    facilitator: Facilitator,
    connection: Connection
  ): Promise<number> {
    const escape = (data) => connection.escape(data);

    try {
      await connection.beginTransaction();

      let query = `
        INSERT INTO ${this.dbName}.facilitator(
          givenName,
          familyName,
          email,
          mobile,
          auth0Id,
          inactive
        ) VALUES (
        ${[
          escape(facilitator.givenName),
          escape(facilitator.familyName),
          escape(facilitator.email),
          escape(facilitator.mobile),
          escape(facilitator.auth0Id),
          escape(facilitator.inactive || false),
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

  async update(id: number, facilitator: Facilitator, connection: Connection) {
    if (!id) {
      throw new Error('No id specified when updating client.');
    }
    const escape = (data) => connection.escape(data);

    let query = `
      UPDATE ${this.dbName}.facilitator AS facilitators
      SET
        facilitators.givenName = ${escape(facilitator.givenName)},
        facilitators.familyName = ${escape(facilitator.familyName)},
        facilitators.email = ${escape(facilitator.email)},
        facilitators.mobile = ${escape(facilitator.mobile)},
        facilitators.auth0Id = ${escape(facilitator.auth0Id)},
        facilitators.inactive = ${escape(facilitator.inactive || false)}
      WHERE
        facilitators.id = ${escape(id)};
    `;

    // console.log(query);

    return this.databaseManager.query(query, connection);
  }

  async list(connection: Connection): Promise<Facilitator[]> {
    const query = `
      SELECT
        *
      FROM ${this.dbName}.facilitator
      ORDER BY facilitator.givenName, facilitator.familyName ASC;
    `;

    // console.log(query);

    const results = await this.databaseManager.query(query, connection);

    return results as Facilitator[];
  }

  delete(id: number, connection: Connection) {
    if (!id) {
      throw new Error('No id specified when updating facilitator.');
    }
    const escape = (data) => connection.escape(data);
    let query = `DELETE FROM ${this.dbName}.facilitator WHERE id = ${escape(
      id
    )}`;

    return this.databaseManager.query(query, connection);
  }

  async getByAuth0Id(
    auth0Id: string,
    connection: Connection
  ): Promise<Facilitator | undefined> {
    const query = `
      SELECT
        *
      FROM ${this.dbName}.facilitator
      WHERE auth0Id = ${connection.escape(auth0Id)}
      LIMIT 1;
    `;

    // console.log(query);

    const results = await this.databaseManager.query(query, connection);

    const facilitators = results.map((result) => result as Facilitator);

    return facilitators.length >= 1 ? facilitators[0] : undefined;
  }

  async isFacilitator(auth0Id: string, connection: Connection) {
    const query = `SELECT 1 FROM ${
      this.dbName
    }.facilitator WHERE auth0Id = ${connection.escape(auth0Id)} AND inactive=0`;

    const results = await this.databaseManager.query(query, connection);

    return results.length > 0;
  }
}

module.exports = FacilitatorRepository;
