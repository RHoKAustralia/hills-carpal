const jsonwebtoken = require('jsonwebtoken');

module.exports.decodeJwt = (event) => {
  if (!event.headers.Authorization) {
    return;
  }
  const tokenValue = event
    .headers
    .Authorization
    .split(' ')[1];

  try {
    const domain = process.env.DOMAIN || 'carpal.org.au';
    const decodedToken = jsonwebtoken.decode(tokenValue);
    const claims = {};
    claims.email = decodedToken[`https://${domain}/email`];
    claims.roles = decodedToken[`https://${domain}/roles`];
    if (claims.roles.indexOf('driver') >= 0) {
      claims.driverGender = decodedToken[`https://${domain}/gender`];
      claims.car = decodedToken[`https://${domain}/car`];
    }
    return claims;
  } catch (err) {
    console.log('catch error. Invalid token', err);
  }
}