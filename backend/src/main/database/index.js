const DatabaseManager = require("./DatabaseManager");
const RefreshDatabase = require("./RefreshDatabase");
const refreshDatabase = new RefreshDatabase(new DatabaseManager());

process.on('unhandledRejection', error => {
  console.log('unhandledRejection', error);
});


refreshDatabase.executeAll(refreshDatabase)
  .catch(e => console.log(e));