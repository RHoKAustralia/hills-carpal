import mysql, { Connection } from 'mysql2/promise';
import fs from 'fs';

export default class DatabaseManager {
  databaseConfig: any;

  constructor(databaseConfig?) {
    this.databaseConfig = databaseConfig || {
      host: process.env.MYSQL_HOST || 'localhost',
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PW || 'admin',
      database: process.env.MYSQL_DB || 'carpal',
      multipleStatements: true,
      timezone: '+00:00',
      ssl: process.env.MYSQL_USE_SSL === 'TRUE' ? {
        ca: fs.readFileSync(__dirname + '/global-budle.pem'),
      } : undefined,
      // debug: true
    };
  }

  createConnection(): Promise<mysql.Connection> {
    return mysql.createConnection(this.databaseConfig);
  }

  async _setTimeZone(connection: Connection) {
    await connection.query("SET time_zone='+00:00'");
  }

  async query<T = any>(
    queryString: string,
    connection: Connection,
  ): Promise<T> {
    let closeConnection = false;
    if (!connection) {
      connection = await this.createConnection();
      closeConnection = true;
    }

    await this._setTimeZone(connection);

    const [results] = await connection.query(queryString);

    if (closeConnection) {
      await connection.end();
    }
    
    return results as unknown as T;
  }
}

module.exports = DatabaseManager;
