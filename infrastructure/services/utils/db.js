var mysql = require('mysql');
const MYSQL_PW = process.env.MYSQL_PW;
const MYSQL_PORT = process.env.MYSQL_PORT;

module.exports.connection = () => mysql.createConnection({
    host: 'carpal.cttgjqpjknhf.ap-southeast-2.rds.amazonaws.com', 
    port: MYSQL_PORT, 
    user: 'carpaladmin', 
    password: MYSQL_PW, 
    database: 'carpal'
});