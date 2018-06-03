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
        claims.email = decodedToken.email;
        claims.role = decodedToken['https://carpal.org.au/role'];
        if (claims.role === 'driver') {
            claims.gender = decodedToken['https://carpal.org.au/gender'];
            claims.car = decodedToken['https://carpal.org.au/car'];
        }
        console.log("Claims: " + claims);
        return claims;
    } catch (err) {
        console.log('catch error. Invalid token', err);
        return;
    }
}