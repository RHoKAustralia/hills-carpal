const moment = require('moment');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

function toBase64(value){
  return Buffer.from(value).toString('base64')
}

class ExpressAuthApis {
  constructor(app) {
    this.app = app;
    this.app.get('/authorize', this.auth.bind(this));
    this.app.get('/userinfo', this.userinfo.bind(this));
    this.app.get('/authcheck', this.authcheck.bind(this));
    this.app.get('/.well-known/jwks.json', this.wellKnown.bind(this));
  }

  wellKnown(req, res) {
    let expiry = moment().add(100, 'd');
    console.log(req.query);
    let jwks = fs.readFileSync(path.resolve(__dirname, '../config/express/certs/jwks.json'));
    res.status(200).send(JSON.parse(jwks));
  }

  auth(req, res) {
    let queryParams = req.query || {};
    let nonce = queryParams.nonce;
    let state = queryParams.state;
    let expiry = moment().add(100, 'd');
    let date = expiry.toDate();
    let host = req.get('host');

    let urls = {
      driver: this.extractUrl(queryParams, expiry, state, date, host, this._getDriver()),
      admin: this.extractUrl(queryParams, expiry, state, date, host, this._getAdmin()),
      falicitator: this.extractUrl(queryParams, expiry, state, date, host, this._getFacilitator())
    };

    let redirectNow = queryParams.loginAs ? `window.location = "${urls[queryParams.loginAs]}"` : '';
    res.status(200).send(`
        <html>
        <script>
            const loginAsDriver = () => { window.location = "${urls.driver}" };
            const loginAsFacilitator = () => { window.location = "${urls.falicitator}" };
            const loginAsAdmin = () => { window.location = "${urls.admin}" };
            document.cookie = "com.auth0.auth.${nonce}=${state};path=/"; ${redirectNow}
        </script>
        <div><button onclick="loginAsDriver()">Login as driver</button></div>
        <div><button onclick="loginAsFacilitator()">Login as facilitator</button></div>
        <div><button onclick="loginAsAdmin()">Login as admin</button></div>
        <html>`);
  }

  extractUrl(queryParams, expiry, state, date, host, userInfo) {
    let {accessToken, jwtToken} = this._authAs(queryParams, host, userInfo, expiry);
    let url = `${queryParams.redirect_uri}#access_token=${accessToken}&id_token=${jwtToken}&refresh_token=6789&state=${state}&expires_in=${date.getTime()}`;
    return url;
  }

  _authAs(queryParams, host, userInfo, expiry) {
    let payload = this._completeJWT(userInfo, host, expiry.toDate(), queryParams.nonce);

    let accessToken = userInfo.role;
    let cert = fs.readFileSync(path.resolve(__dirname, '../config/express/certs/private.key'));
    let jwtToken = jwt.sign(payload, cert, {algorithm: 'RS256'});
    return {accessToken, jwtToken};
  }

  _completeJWT(data, host, expiryDate, nonce){
    let result = {
      "nonce": nonce.replace("@", "~"),
      "iss": `https://${host}/`,
      "aud": '1234',
      "exp": expiryDate.getTime() / 1000,
      "nbf": new Date().getTime() / 1000,
      ...this._uriBased(data, `https://${host}/`)
    };
    return result;
  }

  _uriBased(data, uri){
    let result = {};
    Reflect.ownKeys(data).forEach(k => result[uri + k] = data[k]);
    return result;
  }

  _getDriver(uri){
    let data = require('../users/driver.json');
    return uri ? this._uriBased(data, uri) : data;
  }

  _getAdmin(uri){
    let data = require('../users/admin.json');
    return uri ? this._uriBased(data, uri) : data;
  }

  _getFacilitator(uri){
    let data = require('../users/facilitator.json');
    return uri ? this._uriBased(data, uri) : data;
  }

  userinfo(req, res){
    let uri = req.get('origin') + '/';
    let tokens = (req.get('authorization') || '').split(' ');
    switch (tokens[1]){
      case 'admin':
        return res.status(200).send(this._getAdmin(uri));
      case 'facilitator':
        return res.status(200).send(this._getFacilitator(uri));
      default:
        return res.status(200).send(this._getDriver(uri));
    }
  }

  authcheck(req, res){
    res.status(200).send({ name: 'Foo' });
  }

}

module.exports = ExpressAuthApis;