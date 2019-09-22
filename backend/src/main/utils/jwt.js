const jsonwebtoken = require('jsonwebtoken');

module.exports.decodeJwt = event => {
  try {
    const authHeader =
      event.headers.Authorization ||
      event.headers.authorization ||
      event.queryStringParameters['access_token'];

    if (!authHeader) {
      return;
    }

    const domain = process.env.DOMAIN || 'carpal.org.au';
    const authHeaderParts = authHeader.split(' ');
    const tokenValue = authHeaderParts[1] || authHeaderParts[0];
    let decodedToken = jsonwebtoken.decode(tokenValue);
    if (process.env.UNSAFE_GOD_MODE === 'true') {
      decodedToken = {
        ...decodedToken,
        [`https://${domain}/gender`]: 'male',
        [`https://${domain}/roles`]: ['driver', 'admin', 'facilitator']
      };
    }
    const claims = {};
    claims.userId = decodedToken.sub;
    claims.email = decodedToken[`email`];
    claims.roles = decodedToken[`https://${domain}/roles`];
    claims.name = decodedToken[`name`];

    if (claims.roles.indexOf('driver') >= 0) {
      claims.driverGender = decodedToken[`https://${domain}/gender`];
      claims.car = decodedToken[`https://${domain}/car`];
    }

    return claims;
  } catch (err) {
    console.log('catch error. Invalid token', err);
  }
};
