'use strict';
const decodeJwt = require('../utils/jwt').decodeJwt;
const db = require('../utils/db').connection;
const mapToDto = require('./rides-mapper').mapToDto;

module.exports.list = (event, context, callback) => {
  let queryParams = event.queryStringParameters || {};
  console.log(JSON.stringify(queryParams));
  console.log('Querying mysql');
  const connection = db();
  const claims = decodeJwt(event);
  console.log("Claims: " + JSON.stringify(claims));

  let listType = queryParams.listType || 'driver';

  let query;

  if (listType == 'driver' && claims.roles.indexOf('driver') > -1) {
    let locationQuery = '';
    if (queryParams.toLongitude && queryParams.toLatitude && queryParams.fromLongitude && queryParams.fromLatitude) {
      locationQuery = `and ST_Contains(ST_Envelope(ST_GeomFromText('LINESTRING(${queryParams.toLongitude} ${queryParams.toLatitude}, ${queryParams.fromLongitude} ${queryParams.fromLatitude})')), locationFrom)`;
    }
    query = `
SELECT * FROM rides where pickupTimeAndDateInUTC > NOW() 
and(driverGender = 'any' or driverGender = '${claims.driverGender}')
${locationQuery}
ORDER BY pickupTimeAndDateInUTC ASC
  `
  } else if (listType == 'facilitator' && claims.roles.indexOf('facilitator' > -1)) {
    query = `
SELECT * FROM carpal.rides WHERE facilitatorEmail = '${claims.email}' 
ORDER BY pickupTimeAndDateInUTC ASC;
  `
  } else if (claims.roles.indexOf('admin') > -1) {
    query = `
SELECT * FROM carpal.rides
ORDER BY pickupTimeAndDateInUTC ASC;
  `
  }

  console.log('Query: ' + query);

  connection.query(query, function (error, results, fields) {
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