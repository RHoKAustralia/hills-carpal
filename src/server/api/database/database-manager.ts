import mysql, { Connection } from 'mysql';
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
      connectTimeout: 60000, // Needs to be super high to wait for serverless aurora to wake up
      timezone: 'UTC',
      ssl: process.env.MYSQL_USE_SSL === 'TRUE' ?? {
        ca: fs.readFileSync(__dirname + '/rds-ca-2019-root.pem'),
      },
      // debug: true
    };
  }

  createConnection(): mysql.Connection {
    return mysql.createConnection(this.databaseConfig);
  }

  _setTimeZone(connection) {
    return new Promise((resolve, reject) => {
      connection.query("SET time_zone='+00:00';", (error) => {
        if (error) {
          console.error('Error setting timezone', error);
          return reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  query<T = any>(queryString: string, connection: Connection): Promise<T> {
    let closeConnection = false;
    if (!connection) {
      connection = this.createConnection();
      closeConnection = true;
    }

    return this._setTimeZone(connection).then(
      () =>
        new Promise((resolve, reject) => {
          connection.query(queryString, (error, results, fields) => {
            if (error) {
              console.error('Error executing', queryString, error);
              return reject(error);
            } else if (closeConnection) {
              // Only close the connection if there's no error - otherwise we
              // get "Cannot enqueue Quit after fatal error"
              let closePromise = this.closeConnection(connection);
              return closePromise
                .then(() => {
                  resolve(results);
                })
                .catch((error1) => {
                  reject(error1 || error);
                });
            }
            return resolve(results);
          });
        })
    );
  }

  closeConnection(connection: mysql.Connection): Promise<void> {
    return new Promise((resolve, reject) => {
      connection.end(function (error) {
        if (error) {
          return reject(error);
        }
        resolve();
      });
    });
  }

  beginTransaction(connection: mysql.Connection): Promise<void> {
    return new Promise((resolve, reject) => {
      connection.beginTransaction(function (error) {
        if (error) {
          return reject(error);
        }
        resolve();
      });
    });
  }

  rollback(connection: mysql.Connection) {
    return new Promise((resolve, reject) => {
      connection.rollback(function (error) {
        if (error) {
          return reject(error);
        }
        resolve();
      });
    });
  }

  commit(connection: mysql.Connection) {
    return new Promise((resolve, reject) => {
      connection.commit(function (error) {
        if (error) {
          return reject(error);
        }
        resolve();
      });
    });
  }
}

module.exports = DatabaseManager;
