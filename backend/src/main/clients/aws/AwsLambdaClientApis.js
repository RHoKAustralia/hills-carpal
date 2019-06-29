const decodeJwt = require('../../utils/jwt').decodeJwt;

class AwsLambdaClientApis {
  constructor(
    createClientService,
    listClientsService,
    updateClientService,
    deleteClientService
  ) {
    this.createClientService = createClientService;
    this.listClientsService = listClientsService;
    this.updateClientService = updateClientService;
    this.deleteClientService = deleteClientService;
  }

  create(event, context, callback) {
    let loginData = decodeJwt(event);
    this.createClientService
      .createClient(JSON.parse(event.body), loginData)
      .then(result => callback(null, result || {}))
      .catch(result => callback(result));
  }

  update(event, context, callback) {
    const loginData = decodeJwt(event);
    const client = JSON.parse(event.body);
    const id = event.pathParameters.id;
    this.updateClientService
      .updateClient(id, client, loginData)
      .then(result => callback(null, result || {}))
      .catch(result => callback(result));
  }

  list(event, context, callback) {
    let loginData = decodeJwt(event);
    let queryParams = event.queryStringParameters || {};
    this.listClientsService
      .listClients(queryParams, loginData)
      .then(result => callback(null, result || []))
      .catch(result => callback(result));
  }

  delete(event, context, callback) {
    let loginData = decodeJwt(event);
    const id = event.pathParameters.id;
    this.deleteClientService
      .deleteClient(id, loginData)
      .then(result => callback(null, result || {}))
      .catch(result => callback(result));
  }
}

module.exports = AwsLambdaClientApis;
