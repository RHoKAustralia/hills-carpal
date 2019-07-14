const https = require('https');
const querystring = require('querystring');

/**
 * Adds a proxy to John's polldaddy form that sends an event to the parent
 * window when the survey is successfully completed.
 */
module.exports.survey = (event, context, callback) => {
  console.log(event.headers);
  const newHeaders = {};
  const contentType =
    event.headers['Content-Type'] || event.headers['content-type'];
  if (contentType) {
    newHeaders['Content-Type'] = contentType;
  }
  const contentLength =
    event.headers['Content-Length'] || event.headers['content-length'];
  if (contentLength) {
    newHeaders['Content-Length'] = contentLength;
  }

  var options = {
    method: event.httpMethod,
    hostname: 'john3110.survey.fm',
    headers: newHeaders,
    path:
      event.path.split('/survey')[1] +
      '?' +
      querystring.stringify(event.multiValueQueryStringParameters)
  };

  console.log('Sending request with options', options);

  var req = https.request(options, function(res) {
    console.log('Received response', res.statusCode);
    var body = '';
    res.on('data', function(d) {
      //   console.log('data ' + d);
      body += d;
    });
    res.on('end', function() {
      //   console.log('ended ' + body);
      callback(null, {
        statusCode: res.statusCode,
        body: body.replace(
          '</head>',
          `<script>
            document.addEventListener('DOMContentLoaded', () => {
                if (document.body.classList.contains('survey-finished')) {
                    parent.window.postMessage("carpal:surveySuccess", "*");
                }
            });
          </script>
          </head>`
        ),
        headers: {
          'content-type': res.headers['content-type'],
          location:
            res.headers.location &&
            res.headers.location.replace(
              '/ride-feedback',
              event.path.split('/survey')[0] + '/survey/ride-feedback'
            )
        }
      });
    });
  });

  req.on('error', function(e) {
    console.error(e);
    callback(e);
  });

  if (event.body) {
    req.write(event.body);
  }

  req.end();
};
