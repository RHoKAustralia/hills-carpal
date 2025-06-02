import fs from 'fs';
import mysql, { Pool, PoolConnection, PoolOptions } from 'mysql2/promise';
import path from 'path';

export default class DatabaseManager {
  databaseConfig: PoolOptions;
  pool: Pool;

  constructor(databaseConfig?: PoolOptions) {
    this.databaseConfig = databaseConfig || {
      host: process.env.MYSQL_HOST || 'localhost',
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PW || 'admin',
      database: process.env.MYSQL_DB || 'carpal',
      multipleStatements: true,
      timezone: '+00:00',
      ssl:
        process.env.MYSQL_USE_SSL === 'TRUE'
          ? {
              ca: fs.readFileSync(
                path.join(
                  process.cwd(),
                  'src',
                  'server',
                  'api',
                  'database',
                  'global-bundle.pem'
                )
              ),
            }
          : undefined,
      // Connection pool settings
      waitForConnections: true,
      connectionLimit: parseInt(process.env.MYSQL_CONNECTION_LIMIT || '10'),
      idleTimeout: parseInt(process.env.MYSQL_IDLE_TIMEOUT || '600000'),
      // debug: true
    };

    this.pool = mysql.createPool(this.databaseConfig);
  }

  async getConnection(): Promise<PoolConnection> {
    return await this.pool.getConnection();
  }

  async _setTimeZone(connection: PoolConnection) {
    await connection.query("SET time_zone='+00:00'");
  }

  async query(
    queryString: string,
    connection?: PoolConnection
  ): Promise<mysql.RowDataPacket[]> {
    await this._setTimeZone(connection);
    const [results] = await (connection ?? this.pool).query(queryString);
    return results as unknown as mysql.RowDataPacket[];
  }

  // Execute function with automatic connection management
  async withConnection<T>(
    fn: (connection: PoolConnection) => Promise<T>
  ): Promise<T> {
    const connection = await this.getConnection();
    try {
      await this._setTimeZone(connection);
      return await fn(connection);
    } finally {
      connection.release();
    }
  }

  // Execute function within a transaction
  async withTransaction<T>(
    fn: (connection: PoolConnection) => Promise<T>
  ): Promise<T> {
    const connection = await this.getConnection();
    try {
      await this._setTimeZone(connection);
      await connection.beginTransaction();

      const result = await fn(connection);

      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Execute function with read committed isolation level and optional transaction
  async withReadCommitted<T>(
    fn: (connection: PoolConnection) => Promise<T>,
    useTransaction = false
  ): Promise<T> {
    const connection = await this.getConnection();
    try {
      await this._setTimeZone(connection);
      await connection.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');

      if (useTransaction) {
        await connection.beginTransaction();
      }

      const result = await fn(connection);

      if (useTransaction) {
        await connection.commit();
      }

      return result;
    } catch (error) {
      if (useTransaction) {
        await connection.rollback();
      }
      throw error;
    } finally {
      connection.release();
    }
  }

  async closePool(): Promise<void> {
    await this.pool.end();
  }
}

module.exports = DatabaseManager;
