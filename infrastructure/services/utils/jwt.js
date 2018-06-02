const jsonwebtoken = require('jsonwebtoken');

module.exports.decodeJwt = (event) => {
    const tokenValue = event
        .headers
        .Authorization
        .split(' ')[1];

    try {
        const decodedToken = jsonwebtoken.decode(tokenValue);
        return decodedToken;
    } catch (err) {
        console.log('catch error. Invalid token', err);
        return;
    }
}