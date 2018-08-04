const express = require('express');
const fs = require('fs');
const path = require('path');
const CreateRideService = require('../main/rides/CreateRideService');
const ListRidesService = require('../main/rides/ListRidesService');
const FindOneRideService = require('../main/rides/FindOneRideService');
const UpdateRideService = require('../main/rides/UpdateRideService');
const DatabaseManager = require('../main/database/DatabaseManager');
const ExpressRideApis = require('./rides/express/ExpressRidesApis');
const ExpressAuthApis = require('./auth/ExpressAuthApis');
const AwsLambdaRideApis = require('../main/rides/aws/AwsLambdaRideApis');
const bodyParser = require('body-parser');
const databaseManager = new DatabaseManager();

const https = require('https');
const http = require('http');

process.on('uncaughtException', function (err) {
  console.log(err);
});

process.env.DOMAIN = 'localhost:8081';

const createRideService = new CreateRideService(databaseManager);
const listRidesService = new ListRidesService(databaseManager);
const findOneRideService = new FindOneRideService(databaseManager);
const updateRideService = new UpdateRideService(databaseManager);
const app = express();
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", req.get("Origin"));
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
  next();
});

new ExpressAuthApis(app);
let awsLambdaRideApis = new AwsLambdaRideApis(createRideService,
  listRidesService,
  findOneRideService,
  updateRideService);

new ExpressRideApis(app, awsLambdaRideApis);

const options = {
  key: fs.readFileSync(path.resolve(__dirname, './config/express/certs/key.pem')),
  cert: fs.readFileSync(path.resolve(__dirname, './config/express/certs/certificate.pem'))
};

http.createServer(app).listen(8080, () => {
  console.log("HTTP Server started and listening on port 8080")
});
https.createServer(options, app).listen(8081, () => {
  console.log("HTTPS Server started and listening on port 8081")
});