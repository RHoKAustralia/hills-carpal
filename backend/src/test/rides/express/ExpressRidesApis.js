class ExpressRideApis {
  constructor(app, awsLambdaRideApis) {
    this.app = app;
    this.awsLambdaRideApis = awsLambdaRideApis;
    this.app.post('/rides', this.create.bind(this));
    this.app.put('/rides/:id', this.update.bind(this));
    this.app.get('/rides/:id', this.findOne.bind(this));
    this.app.get('/rides', this.list.bind(this));
  }

  create(req, res) {
    this.awsLambdaRideApis.create(this._extractAwsEvent(req), {}, (error, result) => {
      if (error) {
        return res.status(500).send(error);
      }
      res.status(200).send(result);
    });
  }

  update(req, res) {
    this.awsLambdaRideApis.update(this._extractAwsEvent(req), {}, (error, result) => {
      if (error) {
        return res.status(500).send(error);
      }
      res.status(200).send(result);
    });
  }

  list(req, res) {
    this.awsLambdaRideApis.list(this._extractAwsEvent(req), {}, (error, result) => {
      if (error) {
        return res.status(500).send(error);
      }
      res.status(200).send(result);
    });
  }

  findOne(req, res) {
    this.awsLambdaRideApis.findOne(this._extractAwsEvent(req), {}, (error, result) => {
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

module.exports = ExpressRideApis;