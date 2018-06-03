'use strict';

const validate = require('jsonschema').validate; // eslint-disable-line import/no-extraneous-dependencies
const rideSchema = require('../schema/ride.json'); // eslint-disable-line import/no-extraneous-dependencies
const connection = require('../utils/db').connection;
const rideStatus = require('./ride-status');
const decodeJwt = require('../utils/jwt').decodeJwt;

module.exports.create = (event, context, callback) => {
  const timestamp = new Date().getTime();

  const data = JSON.parse(event.body);
  data.datetime = timestamp;
  let facilitatorEmail = decodeJwt(event);
  const validationResult = validate(data, rideSchema);

  if (validationResult.errors && validationResult.errors.length) {
    callback(null, {
      statusCode: 400,
      headers: {
        'Content-Type': 'text/plain'
      },
      body: JSON.stringify({"error": validationResult.errors})
    });
    return;
  }

  let escape = function (data) {
    return data
  };
  let payload = {
    client: `"${escape(data.client)}"`,
    facilitatorEmail: `"${escape(facilitatorEmail)}"`,
    pickupTimeAndDateInUTC: `"${new Date(data.pickupTime).toISOString()}"`,
    locationFrom: `POINT(${data.locationFrom.latitude}, ${data.locationFrom.longitude})`,
    locationTo: `POINT(${data.locationFrom.latitude}, ${data.locationFrom.longitude})`,
    fbLink: `"${escape(data.fbLink)}"`,
    driverGender: `"${escape(data.driverGender)}"`,
    carType: `"${escape(data.carType)}"`,
    status: `"${rideStatus.open}"`,
    deleted: `0`,
    suburbFrom: `"${escape(data.locationFrom.suburb)}"`,
    placeNameFrom: `"${escape(data.locationFrom.placeName)}"`,
    postCodeFrom: `"${escape(data.locationFrom.postcode)}"`,
    suburbTo: `"${escape(data.locationFrom.suburb)}"`,
    placeNameTo: `"${escape(data.locationFrom.placeName)}"`,
    postCodeTo: `"${escape(data.locationFrom.postcode)}"`
  };

  let values = Reflect.ownKeys(payload).map(key => payload[key]).join(',');
  let query = `insert into rides(${Reflect.ownKeys(payload)}) values (${values})`;
  console.log(query);

  queryDatabase(query, (err, result) => {
    if (err) {
      console.log('ERROR', err);
      return callback(null, {
        statusCode: err.statusCode || 501,
        headers: {
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify(err)
      });
    }
    callback(null, {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'text/plain'
      },
      body: JSON.stringify(result)
    })
  });
};

function queryDatabase(query, callback) {
  connection.query(query, (error, results, fields) => {
    connection.end(function (err) {
      callback(error, results);
    });
  });
}
