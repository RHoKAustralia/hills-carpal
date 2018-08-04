const mysql = require('mysql');

class DatabaseManager {

  constructor(databaseConfig) {
    this.databaseConfig = databaseConfig || {
      host: process.env.MYSQL_HOST || 'localhost',
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PW || 'admin',
      database: process.env.MYSQL_DB || 'carpal',
      multipleStatements: true
    };
  }

  createConnection() {
    return mysql.createConnection(this.databaseConfig);
  }

  query(queryString, connection) {
    let closeConnection = false;
    if (!connection) {
      connection = this.createConnection();
      closeConnection = true;
    }

    return new Promise((resolve, reject) => {
      connection.query(queryString, (error, results, fields) => {
        if (closeConnection) {
          let closePromise = this.closeConnection(connection);
          return closePromise.finally(() => {
            if (error) {
              return reject(error);
            }
            resolve(results);
          });
        }
        if (error) {
          console.log("Error executing", queryString, error);
          return reject(error);
        }
        return resolve(results);
      });
    });
  }

  closeConnection(connection) {
    return new Promise((resolve, reject) => {
      connection.end(function (error) {
        if (error) {
          return reject(error);
        }
        resolve();
      });
    });
  }

  beginTransaction(connection) {
    return new Promise((resolve, reject) => {
      connection.beginTransaction(function (error) {
        if (error) {
          return reject(error);
        }
        resolve();
      });
    });
  }

  rollback(connection) {
    return new Promise((resolve, reject) => {
      connection.rollback(function (error) {
        if (error) {
          return reject(error);
        }
        resolve();
      });
    });
  }

  commit(connection) {
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