const mysql = require('mysql');

class DatabaseManager {
  constructor(databaseConfig) {
    this.databaseConfig = databaseConfig || {
      host: process.env.MYSQL_HOST || 'localhost',
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PW || 'admin',
      database: process.env.MYSQL_DB || 'carpal',
      multipleStatements: true,
      connectTimeout: 60000 // Needs to be super high to wait for serverless aurora to wake up
      // debug: true
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
        if (error) {
          console.log('Error executing', queryString, error);
          return reject(error);
        } else if (closeConnection) {
          // Only close the connection if there's no error - otherwise we
          // get "Cannot enqueue Quit after fatal error"
          let closePromise = this.closeConnection(connection);
          return closePromise
            .then(() => {
              resolve(results);
            })
            .catch(error1 => {
              reject(error1 || error);
            });
        }
        return resolve(results);
      });
    });
  }

  closeConnection(connection) {
    return new Promise((resolve, reject) => {
      connection.end(function(error) {
        if (error) {
          return reject(error);
        }
        resolve();
      });
    });
  }

  beginTransaction(connection) {
    return new Promise((resolve, reject) => {
      connection.beginTransaction(function(error) {
        if (error) {
          return reject(error);
        }
        resolve();
      });
    });
  }

  rollback(connection) {
    return new Promise((resolve, reject) => {
      connection.rollback(function(error) {
        if (error) {
          return reject(error);
        }
        resolve();
      });
    });
  }

  commit(connection) {
    return new Promise((resolve, reject) => {
      connection.commit(function(error) {
        if (error) {
          return reject(error);
        }
        resolve();
      });
    });
  }
}

module.exports = DatabaseManager;
