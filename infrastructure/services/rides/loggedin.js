module.exports.loggedin = function (event, context, callback) {

    console.log(event); // Contains incoming request data (e.g., query params, headers and more)

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