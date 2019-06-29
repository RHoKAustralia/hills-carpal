const jsonwebtoken = require('jsonwebtoken');

module.exports.decodeJwt = event => {
  try {
    const authHeader =
      event.headers.Authorization || event.headers.authorization;

    if (!authHeader) {
      return;
    }

    const domain = process.env.DOMAIN || 'carpal.org.au';
    const tokenValue = authHeader.split(' ')[1];
    let decodedToken = jsonwebtoken.decode(tokenValue);
    if (process.env.UNSAFE_GOD_MODE === 'true') {
      decodedToken = {
        ...decodedToken,
        [`https://${domain}/email`]: 'test-driver@carpal.com',
        [`https://${domain}/gender`]: 'male',
        [`https://${domain}/car`]: 'suv',
        [`https://${domain}/roles`]: ['driver', 'admin', 'facilitator']
      };
    }
    const claims = {};
    claims.userId = decodedToken.sub;
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
};
