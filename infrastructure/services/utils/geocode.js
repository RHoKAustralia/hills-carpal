const request = require('request');

module.exports = function (address) {
  let apiKey = process.env.MAPS_API_KEY;
  let encodedAddress = encodeURIComponent(address);
  let url = `https://maps.google.com/maps/api/geocode/json?key=${apiKey}&address=${encodedAddress}`;
  console.log('url', url);

  return new Promise((resolve, reject) => {
    request(url, {json: true}, (err, res, body) => {
      if (err || body.error_message) {
        console.trace('error', body.error_message);
        reject(err || body.error_message);
      }
      if (!body.results.length) {
        return resolve(null);
      }
      console.log('found coordinates:', body.results);
      resolve(body.results[0].geometry.location);
    });
  });

};