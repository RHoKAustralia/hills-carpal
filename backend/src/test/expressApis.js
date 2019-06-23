const express = require('express');
const fs = require('fs');
const path = require('path');

const ExpressRideApis = require('./rides/express/ExpressRidesApis');
const AwsLambdaRideApis = require('../main/rides/aws/AwsLambdaRideApis');
const CreateRideService = require('../main/rides/CreateRideService');
const ListRidesService = require('../main/rides/ListRidesService');
const FindOneRideService = require('../main/rides/FindOneRideService');
const UpdateRideService = require('../main/rides/UpdateRideService');

const DatabaseManager = require('../main/database/DatabaseManager');

const ExpressClientApis = require('./clients/express/ExpressClientsApis');
const AwsLambdaClientApis = require('../main/clients/aws/AwsLambdaClientApis');
const CreateClientService = require('../main/clients/CreateClientService');
const ListClientsService = require('../main/clients/ListClientsService');
const UpdateClientService = require('../main/clients/UpdateClientService');
const DeleteClientService = require('../main/clients/DeleteClientService');

const ExpressImageApis = require('./images/express/ExpressImagesApis');
const AwsLambdaImageApis = require('../main/images/aws/AwsLambdaImageApis');
const UploadImageService = require('../main/images/UploadImageService');
const ListImagesService = require('../main/images/ListImagesService');
const UpdateImageService = require('../main/images/UpdateImageService');
const DeleteImageService = require('../main/images/DeleteImageService');

const ExpressAuthApis = require('./auth/ExpressAuthApis');
const bodyParser = require('body-parser');
const databaseManager = new DatabaseManager();

const https = require('https');
const http = require('http');

process.on('uncaughtException', function(err) {
  console.log(err);
});

process.env.DOMAIN = 'localhost:8081';

const createRideService = new CreateRideService(databaseManager);
const listRidesService = new ListRidesService(databaseManager);
const findOneRideService = new FindOneRideService(databaseManager);
const updateRideService = new UpdateRideService(databaseManager);
const app = express();
app.use(bodyParser());
// app.use(bodyParser.json()); // for parsing application/json
// app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// app.use((req, res, next) => {
//   if (req.originalUrl.indexOf('upload') > -1) next();
//   else {
//     req.bodyParser.json()(req, res, next);
//   }
// });

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', req.get('Origin'));
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE');
  next();
});

new ExpressAuthApis(app);

let awsLambdaRideApis = new AwsLambdaRideApis(
  createRideService,
  listRidesService,
  findOneRideService,
  updateRideService
);
new ExpressRideApis(app, awsLambdaRideApis);

const createClientService = new CreateClientService(databaseManager);
const listClientsService = new ListClientsService(databaseManager);
const updateClientService = new UpdateClientService(databaseManager);
const deleteClientService = new DeleteClientService(databaseManager);
let awsLambdaClientApis = new AwsLambdaClientApis(
  createClientService,
  listClientsService,
  updateClientService,
  deleteClientService
);

new ExpressClientApis(app, awsLambdaClientApis);

const createImageService = new UploadImageService(databaseManager);
const listImagesService = new ListImagesService(databaseManager);
const updateImageService = new UpdateImageService(databaseManager);
const deleteImageService = new DeleteImageService(databaseManager);
let awsLambdaImageApis = new AwsLambdaImageApis(
  createImageService,
  listImagesService,
  updateImageService,
  deleteImageService
);

new ExpressImageApis(app, awsLambdaImageApis);

const options = {
  key: fs.readFileSync(
    path.resolve(__dirname, './config/express/certs/key.pem')
  ),
  cert: fs.readFileSync(
    path.resolve(__dirname, './config/express/certs/certificate.pem')
  )
};

http.createServer(app).listen(8080, () => {
  console.log('HTTP Server started and listening on port 8080');
});

https.createServer(options, app).listen(8081, () => {
  console.log('HTTPS Server started and listening on port 8081');
});
