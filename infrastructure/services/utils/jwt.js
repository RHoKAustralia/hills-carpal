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
        const decodedToken = jsonwebtoken.decode(tokenValue);
        var claims = {};
        claims.email = decodedToken['https://carpal.org.au/email'];
        claims.role = decodedToken['https://carpal.org.au/roles'][0];
        if (claims.role === 'driver') {
            claims.driverGender = decodedToken['https://carpal.org.au/gender'];
            claims.car = decodedToken['https://carpal.org.au/car'];
        }
        return claims;
    } catch (err) {
        console.log('catch error. Invalid token', err);
        return;
    }
}