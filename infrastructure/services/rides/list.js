'use strict';

const geocode = require('../utils/geocode');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const dynamoDb = new AWS
  .DynamoDB
  .DocumentClient();


const params = {
  TableName: process.env.DYNAMODB_TABLE
};

module.exports.list = async (event, context, callback) => {

  let queryParams = event.queryStringParameters || {};

  if (queryParams.address) {
    let coordinates = await geocode(queryParams.address);
    if (coordinates) {
      // TEST
      callback(null, {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify(coordinates)
      });
      return;
    }
  }


  // fetch all todos from the database
  dynamoDb.scan(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: {
          'Content-Type': 'text/plain'
        },
        body: 'Couldn\'t fetch the todos.'
      });
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Items)
    };

    callback(null, response);
  });
};