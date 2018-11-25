const CreateRideService = require('./CreateRideService');
const ListRidesService = require('./ListRidesService');
const FindOneRideService = require('./FindOneRideService');
const DatabaseManager = require('../database/DatabaseManager');
const AwsLambdaRideApis = require('./aws/AwsLambdaRideApis');
const databaseManager = new DatabaseManager();

const createRideService = new CreateRideService(databaseManager);
const listRidesService = new ListRidesService(databaseManager);
const findOneRideService = new FindOneRideService(databaseManager);

const rides = new AwsLambdaRideApis(createRideService, listRidesService, findOneRideService);

let wrappedCallback = (callback) => {
  return (error, result) => {
    if (!error) {
      const response = {
        statusCode: 200,
        body: JSON.stringify(result)
      };
      callback(null, response);
    } else {
      callback(error);
    }
  };
};

module.exports = {
  list: (event, context, callback) => rides.list(event, context, wrappedCallback(callback)),
  create: (event, context, callback) => rides.create(event, context, wrappedCallback(callback)),
  findOne: (event, context, callback) => rides.findOne(event, context, wrappedCallback(callback)),
  update: (event, context, callback) => rides.update(event, context, wrappedCallback(callback))
};