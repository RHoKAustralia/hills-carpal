'use strict';

const geocode = require('../utils/geocode');


module.exports.maps = (event, context, callback) => {
  console.log("key: " + process.env.MAPS_API_KEY);

  geocode(event.queryStringParameters.address)
    .then(c => {
      const response = {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify(c)
      };

      callback(null, response);
    }).catch(e => callback(e));

};