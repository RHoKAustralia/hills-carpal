const decodeJwt = require('../../utils/jwt').decodeJwt;

class AwsLambdaRideApis {
  constructor(createRideService,
              listRidesService,
              findOneRideService,
              updateRideService) {
    this.createRideService = createRideService;
    this.listRidesService = listRidesService;
    this.findOneRideService = findOneRideService;
    this.updateRideService = updateRideService;
  }

  create(event, context, callback) {
    let loginData = decodeJwt(event);
    return this.createRideService.createRide(JSON.parse(event.body), loginData)
      .then(result => callback(null, result))
      .catch(result => callback(result));
  }

  update(event, context, callback) {
    const loginData = decodeJwt(event);
    const ride = JSON.parse(event.body);
    const id = event.pathParameters.id;
    return this.updateRideService.updateRide(id, ride, loginData)
      .then(result => callback(null, result))
      .catch(result => callback(result));
  }

  list(event, context, callback) {
    let loginData = decodeJwt(event);
    let queryParams = event.queryStringParameters || {};
    return this.listRidesService.listRides(queryParams, loginData)
      .then(result => callback(null, result))
      .catch(result => callback(result));
  }

  findOne(event, context, callback) {
    let loginData = decodeJwt(event);
    let pathParams = event.pathParameters || {};
    return this.findOneRideService.findOne(pathParams.id, loginData)
      .then(result => callback(null, result))
      .catch(result => callback(result));
  }
}

module.exports = AwsLambdaRideApis;