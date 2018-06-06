'use strict';

const db = require('../utils/db').connection;
const rideStatus = require('./ride-status');
const decodeJwt = require('../utils/jwt').decodeJwt;

module.exports.update = (event, context, callback) => {
  const timestamp = new Date().getTime();
  const connection = db();

  const data = JSON.parse(event.body);
  data.datetime = timestamp;
  let loginData = decodeJwt(event);
  let facilitatorEmail = loginData && loginData.email;

  let id = event.pathParameters.id;
  if(!id){
    return callback(null, {
      statusCode: 400,
      headers: {
        'Content-Type': 'text/plain'
      },
      body: 'Invalid id'
    });
  }

  let escape = function (data) {
    return connection.escape(data)
  };
  let payload = {
    client: `${escape(data.client)}`,
    facilitatorEmail: `${escape(facilitatorEmail)}`,
    pickupTimeAndDateInUTC: `"${new Date(data.pickupTimeAndDateInUTC).toISOString()}"`,
    locationFrom: `POINT(${data.locationFrom.latitude}, ${data.locationFrom.longitude})`,
    locationTo: `POINT(${data.locationTo.latitude}, ${data.locationTo.longitude})`,
    fbLink: `${escape(data.fbLink)}`,
    driverGender: `${escape(data.driverGender)}`,
    carType: `${escape(data.carType)}`,
    status: `${data.status}`,
    deleted: `0`,
    suburbFrom: `${escape(data.locationFrom.suburb)}`,
    placeNameFrom: `${escape(data.locationFrom.placeName)}`,
    postCodeFrom: `${escape(data.locationFrom.postcode)}`,
    suburbTo: `${escape(data.locationTo.suburb)}`,
    placeNameTo: `${escape(data.locationTo.placeName)}`,
    postCodeTo: `${escape(data.locationTo.postcode)}`
  };

  let values = Reflect.ownKeys(payload).map(key => `${key} = ${payload[key]}`).join(',');
  let query = `UPDATE rides SET ${values} WHERE id = ${id}`;
  console.log(query);

  queryDatabase(connection, query, (err, result) => {
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

function queryDatabase(connection, query, callback) {
  connection.query(query, (error, results, fields) => {
    connection.end(function (err) {
      callback(error, results);
    });
  });
}
