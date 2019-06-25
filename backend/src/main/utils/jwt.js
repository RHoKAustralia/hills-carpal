const jsonwebtoken = require('jsonwebtoken');

module.exports.decodeJwt = event => {
  try {
    const domain = process.env.DOMAIN || 'carpal.org.au';

    if (!event.headers.Authorization) {
      return;
    }
    const tokenValue = event.headers.Authorization.split(' ')[1];

    let decodedToken = jsonwebtoken.decode(tokenValue);

    if (
      process.env.DOMAIN === 'localhost:8081' &&
      process.env.UNSAFE_GOD_MODE === 'true'
    ) {
      decodedToken = {
        ...decodedToken,
        'https://localhost:8081/email': 'test-driver@carpal.com',
        'https://localhost:8081/gender': 'male',
        'https://localhost:8081/car': 'suv',
        'https://localhost:8081/roles': ['driver', 'admin', 'facilitator']
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
