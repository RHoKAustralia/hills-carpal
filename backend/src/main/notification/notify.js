exports.handler = function (event, context, callback) {

  let AWS = require('aws-sdk');

  // Create chron job
  // search rides with time below 24 hours
  // send sms to each one
  // update entry to say that driver was notified

  // create amazon account for hillscarpal

  sendSMS();


};

function sendSMS() {
  let sns = new AWS.SNS();
  sns.publish({
    Message: 'Hello World',
    PhoneNumber: '+610123456789',
    MessageStructure: 'text'
  }, function (err, data) {
    console.log("test2")
    if (err) {
      console.log(err.stack);
    }

    console.log('push sent');

    callback(null, {
      "statusCode": 200,
      "headers": {"Date": new Date()},
      "body": ""
    });
  });
}