const CreateRideService = require('./CreateRideService');
const ListRidesService = require('./ListRidesService');
const FindOneRideService = require('./FindOneRideService');
const UpdateRideService = require('./UpdateRideService');
const DatabaseManager = require('../database/DatabaseManager');
const AwsLambdaRideApis = require('./aws/AwsLambdaRideApis');
const databaseManager = new DatabaseManager();

const createRideService = new CreateRideService(databaseManager);
const listRidesService = new ListRidesService(databaseManager);
const findOneRideService = new FindOneRideService(databaseManager);
const updateRideService = new UpdateRideService(databaseManager);

const rides = new AwsLambdaRideApis(createRideService, listRidesService, findOneRideService, updateRideService);

let wrappedCallback = (callback) => {
  return (error, result) => {
    if (!error) {
      const response = {
        statusCode: 200,
        body: JSON.stringify(result),
        headers: {
          "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
          "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
        }
      };
      callback(null, response);
    } else {
      callback(error);
    }
  };
};


module.exports =
  ['list', 'create', 'update', 'findOne', 'acceptRide', 'declineRide'].reduce(function(acc, current) {
    acc[current] = rides[current](event, context, wrappedCallback(callback));
    return acc;
  }, {});
