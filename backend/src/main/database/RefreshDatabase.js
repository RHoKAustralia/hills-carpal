const fs = require('fs');
const path = require('path');

const changeSet = [
  '2018-08-04-1-create-database.sql',
  '2018-08-04-2-create-location-table.sql',
  '2018-08-04-3-create-rides-table.sql',
  '2018-08-04-4-create-driver-table.sql',
  '2018-08-04-5-create-driver_car-table.sql',
  '2018-08-04-6-create-driver_ride-table.sql'
];

class RefreshDatabase {
  constructor(databaseManager) {
    this.databaseManager = databaseManager;
  }

  async executeAll() {
    for (let fileName of changeSet) {
      await this.execute(fileName);
    }
  }

  async execute(fileName) {
    let sql = fs.readFileSync(path.resolve(__dirname, './changes/' + fileName)).toString().trim();
    return this.databaseManager.query(sql);
  }
}

module.exports = RefreshDatabase;