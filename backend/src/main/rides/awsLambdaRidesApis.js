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

module.exports = {
  ...rides
};