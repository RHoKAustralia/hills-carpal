const decodeJwt = require('../utils/jwt').decodeJwt;
module.exports.loggedin = function (event, context, callback) {
    console.log(JSON.stringify(event)); // Contains incoming request data (e.g., query params, headers and more)
    const decodedJwt = decodeJwt(event.headers.Authorization);
    console.log(decodedJwt);
    const email = decodedJwt.email;
    const role = decodedJwt['https://carpal.org.au/role'];
    const response = {
        statusCode: 200,
        headers: {
            /* Required for CORS support to work */
            'Access-Control-Allow-Origin': '*',
            /* Required for cookies, authorization headers with HTTPS */
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            "message": email + " is logged in with role " + role,
            "email": email,
            "role": role
        })
    };

    callback(null, response);
};