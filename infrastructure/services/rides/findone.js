'use strict';
const db = require('../utils/db').connection;
const mapToDto = require('./rides-mapper').mapToDto;

module.exports.findone = (event, context, callback) => {
  console.log('Querying mysql');
  const connection = db();
  let id = event.pathParameters.id;
  if (!id) {
    return callback(null, {
      statusCode: 400,
      headers: {
        'Content-Type': 'text/plain'
      },
      body: 'Invalid id'
    });
  }

  queryDatabase(connection, `SELECT * FROM rides where id = ${id}`, (error, result) => {
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: {
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify(error)
      });
      return;
    }
    console.log(mapToDto(result));

    // create a response
    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(mapToDto((result || [])[0]))
    };
    callback(null, response);
  });

};


function queryDatabase(connection, query, callback) {
  connection.query(query, (error, results, fields) => {
    connection.end(function (err) {
      callback(error, results);
    });
  });
}