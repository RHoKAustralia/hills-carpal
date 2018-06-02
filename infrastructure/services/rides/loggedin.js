const jwt = require('jsonwebtoken');

module.exports.loggedin = function (event, context, callback) {

    console.log(JSON.stringify(event)); // Contains incoming request data (e.g., query params, headers and more)

    const tokenParts = event
        .headers
        .Authorization
        .split(' ');
    const tokenValue = tokenParts[1];
    console.log('Token: ' + tokenValue);

    try {
        console.log(jwt.decode(tokenValue));
    } catch (err) {
        console.log('catch error. Invalid token', err);
        return callback('Unauthorized');
    }
    const response = {
        statusCode: 200,
        headers: {
            /* Required for CORS support to work */
            'Access-Control-Allow-Origin': '*',
            /* Required for cookies, authorization headers with HTTPS */
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({"message": "You're logged in"})
    };

    callback(null, response);
};