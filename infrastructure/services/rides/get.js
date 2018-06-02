'use strict';
const decodeJwt = require('../utils/jwt').decodeJwt;
const connection = require('../utils/db').connection;

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

module.exports.get = (event, context, callback) => {
    console.log('attempting mysql');

    // const decodedJwt = decodeJwt(event); // let params = {     TableName:
    // process.env.DYNAMODB_TABLE }; if (decodedJwt) { const email =
    // decodedJwt.email; const role = decodedJwt['https://carpal.org.au/role'];
    // console.log('Get rides for ' + role + ', ' + email);
    connection.query('SELECT * FROM geom', function (error, results, fields) {
        if (error) {
            console.error(error);
            callback(null, {
                statusCode: error.statusCode || 501,
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: 'Couldn\'t fetch the todos.'
            });
            return;
        }
        console.log(results);
        // create a response
        const response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify(results)
        };
        connection.end(function (err) {
            callback(null, response);
        });
    });

};