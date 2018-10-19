const fs = require('fs');
const path = require('path');
const DatabaseManager = require('./DatabaseManager');

const createDB = '2018-08-04-1-create-database.sql';
const changeSet = [
  '2018-08-04-2-create-location-table.sql',
  '2018-08-04-3-create-rides-table.sql',
  '2018-08-04-4-create-driver-table.sql',
  '2018-08-04-5-create-driver_car-table.sql',
  '2018-08-04-6-create-driver_ride-table.sql'
];

class RefreshDatabase {
  constructor(databaseManager) {
    const dbConfig = Object.assign({}, databaseManager.databaseConfig);

    delete dbConfig.database;
    this.databaseManagerNoDb = new DatabaseManager(dbConfig);
    this.databaseManager = databaseManager;
  }

  executeAll() {
    return this.execute(createDB, this.databaseManagerNoDb)
      .then(() => {
        let result = Promise.resolve();
        changeSet.forEach(fileName => {
          result = result.then(() => this.execute(fileName, this.databaseManager))
        });
        return result;
      })
  }

  execute(fileName, databaseManager) {
    let sql = fs.readFileSync(path.resolve(__dirname, './changes/' + fileName)).toString().trim();
    return databaseManager.query(sql);
  }
}

module.exports = RefreshDatabase;