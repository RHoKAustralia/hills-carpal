'use strict';

const DatabaseManager = require('../database/DatabaseManager');

module.exports.endpoint = async (event, context, callback) => {
  try {
    const currentTime = new Date().toTimeString();

    const databaseManager = new DatabaseManager();
    const connection = databaseManager.createConnection();
    await databaseManager.query('SELECT version();', connection);

    const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: `Hello, the current time is ${currentTime}.`
      })
    };

    return response;
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'DB messed up yo' })
    };
  } finally {
    databaseManager.closeConnection(connection);
  }
};
