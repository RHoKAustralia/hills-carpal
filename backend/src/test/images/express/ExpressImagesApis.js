const { fileParser } = require('express-multipart-file-parser');

class ExpressImageApis {
  constructor(app, awsLambdaImageApis) {
    this.app = app;
    this.awsLambdaImageApis = awsLambdaImageApis;
    this.app.post(
      '/client/:clientId/images',
      fileParser({
        rawBodyOptions: {
          limit: '10mb'
        }
      }),
      this.upload.bind(this)
    );
    // this.app.put('/images/:id', this.update.bind(this));
    // this.app.get('/images', this.list.bind(this));
    // this.app.delete('/images/:id', this.delete.bind(this));
  }

  upload(req, res) {
    console.log(req);
    req.body = req.files[0].buffer;

    this.awsLambdaImageApis.upload(
      this._extractAwsEvent(req),
      {},
      (error, result) => {
        if (error) {
          return res.status(500).send(error);
        }
        res.status(200).send(result);
      }
    );
  }

  update(req, res) {
    this.awsLambdaImageApis.update(
      this._extractAwsEvent(req),
      {},
      (error, result) => {
        if (error) {
          return res.status(500).send(error);
        }
        res.status(200).send(result);
      }
    );
  }

  list(req, res) {
    this.awsLambdaImageApis.list(
      this._extractAwsEvent(req),
      {},
      (error, result) => {
        if (error) {
          return res.status(500).send(error);
        }
        res.status(200).send(result);
      }
    );
  }

  delete(req, res) {
    this.awsLambdaImageApis.delete(
      this._extractAwsEvent(req),
      {},
      (error, result) => {
        if (error) {
          return res.status(500).send(error);
        }
        res.status(200).send(result);
      }
    );
  }

  _extractAwsEvent(req) {
    let event = {
      headers: {
        Authorization: req.get('authorization'),
        ...req.headers
      },
      body: req.body,
      pathParameters: req.params || {},
      queryStringParameters: req.query || {}
    };
    return event;
  }
}

module.exports = ExpressImageApis;
