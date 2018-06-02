'use strict';

const uuid = require('uuid'); // eslint-disable-line import/no-extraneous-dependencies
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const validate = require('jsonschema').validate; // eslint-disable-line import/no-extraneous-dependencies
const rideSchema = require('../schema/ride'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS
  .DynamoDB
  .DocumentClient();

module.exports.create = (event, context, callback) => {
  const timestamp = new Date().getTime();

  const data = JSON.parse(event.body);
  data.datetime = timestamp;
  data.id = uuid.v1();
  const validationResult = validate(data, rideSchema);

  if (validationResult) {
    callback(null, {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json'
      },
      body: {"error": validationResult}
    });
    return;
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: data
  };

  dynamoDb.put(params, (error) => {
    // handle potential errors
    if (error) {
      console.error({"db-error": error});
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: {
          'Content-Type': 'application/json'
        },
        body: {dbError: error}
      });
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(params.Item)
    };
    callback(null, response);
  });
}

