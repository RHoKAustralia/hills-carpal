const CreateClientService = require('./CreateClientService');
const ListClientsService = require('./ListClientsService');
const UpdateClientService = require('./UpdateClientService');
const DeleteClientService = require('./DeleteClientService');
const DatabaseManager = require('../database/DatabaseManager');
const AwsLambdaClientApis = require('./aws/AwsLambdaClientApis');
const databaseManager = new DatabaseManager();

const createClientService = new CreateClientService(databaseManager);
const listClientsService = new ListClientsService(databaseManager);
const updateClientService = new UpdateClientService(databaseManager);
const deleteClientService = new DeleteClientService(databaseManager);

const clients = new AwsLambdaClientApis(createClientService, listClientsService, updateClientService, deleteClientService);

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

module.exports = [
  'list',
  'create',
  'update',
  'delete',
].reduce((acc, current) => {
  acc[current] = (event, context, callback) => {
    return clients[current](event, context, wrappedCallback(callback));
  };
  return acc;
}, {});