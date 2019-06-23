class ExpressClientApis {
  constructor(app, awsLambdaClientApis) {
    this.app = app;
    this.awsLambdaClientApis = awsLambdaClientApis;
    this.app.post('/clients', this.create.bind(this));
    this.app.put('/clients/:id', this.update.bind(this));
    this.app.get('/clients', this.list.bind(this));
    this.app.delete('/clients/:id', this.delete.bind(this));
  }

  create(req, res) {
    this.awsLambdaClientApis.create(this._extractAwsEvent(req), {}, (error, result) => {
      if (error) {
        return res.status(500).send(error);
      }
      res.status(200).send(result);
    });
  }

  update(req, res) {
    this.awsLambdaClientApis.update(this._extractAwsEvent(req), {}, (error, result) => {
      if (error) {
        return res.status(500).send(error);
      }
      res.status(200).send(result);
    });
  }

  list(req, res) {
    this.awsLambdaClientApis.list(this._extractAwsEvent(req), {}, (error, result) => {
      if (error) {
        return res.status(500).send(error);
      }
      res.status(200).send(result);
    });
  }

  delete(req, res) {
    this.awsLambdaClientApis.delete(this._extractAwsEvent(req), {}, (error, result) => {
      if (error) {
        return res.status(500).send(error);
      }
      res.status(200).send(result);
    });
  }

  _extractAwsEvent(req) {
    let event = {
      headers: {
        Authorization: req.get('authorization')
      },
      body: JSON.stringify(req.body),
      pathParameters: req.params || {},
      queryStringParameters: req.query || {},
    };
    return event;
  }
}

module.exports = ExpressClientApis;