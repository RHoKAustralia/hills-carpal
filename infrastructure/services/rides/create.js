'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const validate = require('jsonschema').validate;
const rideSchema = require('../schema/ride');

const dynamoDb = new AWS
  .DynamoDB
  .DocumentClient();

module.exports.create = (event, context, callback) => {
  const timestamp = new Date().getTime();

  // TODO validate input
  const data = JSON.parse(event.body);
  data.datetime = timestamp;
  const validationResult = validate(data, rideSchema);

  if (validationResult) {
    callback(null, {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json'
      },
      body: {"error": validationResult}
    });
  }

  data.id = uuid.v1();


  // if (typeof data.text !== 'string') {
  //     console.error('Validation Failed');
  //     callback(null, {
  //         statusCode: 400,
  //         headers: {
  //             'Content-Type': 'text/plain'
  //         },
  //         body: 'Couldn\'t create the todo item.'
  //     });
  //     return;
  // }

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: data
  };

  dynamoDb.put(params, (error) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: {
          'Content-Type': 'application/json'
        },
        body: {errorMessage: "Failed to create ride request"}
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
};