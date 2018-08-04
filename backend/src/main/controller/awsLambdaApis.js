const CreateRideService = require('../rides/CreateRideService');
const ListRidesService = require('../rides/ListRidesService');
const FindOneRideService = require('../rides/FindOneRideService');
const DatabaseManager = require('../database/DatabaseManager');
const AwsLambdaRideApis = require('../rides/aws/AwsLambdaRideApis');
const databaseManager = new DatabaseManager();

const createRideService = new CreateRideService(databaseManager);
const listRidesService = new ListRidesService(databaseManager);
const findOneRideService = new FindOneRideService(databaseManager);

const rides = new AwsLambdaRideApis(createRideService, listRidesService, findOneRideService);

module.exports = {
  rides: rides
};