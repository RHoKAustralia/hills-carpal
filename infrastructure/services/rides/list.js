'use strict';
const decodeJwt = require('../utils/jwt').decodeJwt;
const db = require('../utils/db').connection;
const mapToDto = require('./rides-mapper').mapToDto;

module.exports.list = (event, context, callback) => {
  console.log('Querying mysql');
  const connection = db();
  connection.query('SELECT * FROM rides', function (error, results, fields) {
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: {
          'Content-Type': 'text/plain'
        },
        body: 'Couldn\'t fetch rides.'
      });
      return;
    }
    console.log(results);
    // create a response
    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(mapToDto(results))
    };
    connection.end(function (err) {
      callback(null, response);
    });
  });

};