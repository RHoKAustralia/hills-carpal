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
  list: (event, context, callback) => {
    console.log(JSON.stringify(event));
    rides.list(event, context, ()=>{
      const currentTime = new Date().toTimeString();
      console.log('Called at ' + currentTime);
          
      const response = {
              statusCode: 200,
              body: JSON.stringify({
                  message: `Hello, the current time is ${currentTime}.`,
              })
      };
      callback(null, response);
    });
  },
  create: (event, context, callback) => {
    rides.create(event, context, callback)
  },
  findOne: (event, context, callback) => {
    rides.findOne(event, context, callback)
  },
  update: (event, context, callback) => {
    rides.update(event, context, callback)
  }
};