const decodeJwt = require('../utils/jwt').decodeJwt;
module.exports.loggedin = function (event, context, callback) {
    console.log(JSON.stringify(event)); // Contains incoming request data (e.g., query params, headers and more)
    const claims = decodeJwt(event);
    console.log(claims);
    const response = {
        statusCode: 200,
        headers: {
            /* Required for CORS support to work */
            'Access-Control-Allow-Origin': '*',
            /* Required for cookies, authorization headers with HTTPS */
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            "message": claims.email + " is logged in with role " + claims.role,
            "email": claims.email,
            "role": claims.role,
            "car": claims.car,
            "driverGender": claims.driverGender
        })
    };

    callback(null, response);
};