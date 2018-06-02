var mysql = require('mysql');
const MYSQL_PW = process.env.MYSQL_PW;
module.exports.connection = mysql.createConnection({host: 'carpal.cttgjqpjknhf.ap-southeast-2.rds.amazonaws.com', user: 'carpaladmin', password: MYSQL_PW, database: 'geotest'});