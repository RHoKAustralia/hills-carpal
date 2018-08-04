'use strict';

module.exports.endpoint = (event, context, callback) => {
    const currentTime = new Date().toTimeString();
    console.log('Called at ' + currentTime);
        
    const response = {
            statusCode: 200,
            body: JSON.stringify({
                message: `Hello, the current time is ${currentTime}.`,
            })
    };
    callback(null, response);
};