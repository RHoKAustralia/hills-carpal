import auth0 from 'auth0-js';
import history from '../history';

const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID || '';
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || '';
const AUTH0_CALLBACK_URL = process.env.AUTH0_CALLBACK_URL || '';
const PUBLIC_ENDPOINT = process.env.PUBLIC_ENDPOINT || '';
const PRIVATE_ENDPOINT = process.env.PRIVATE_ENDPOINT || '';
const LOGGEDIN_URL = process.env.LOGGEDIN_URL || '';

export default class Auth {
  constructor() {
    if ('' === AUTH0_DOMAIN || '' === AUTH0_CLIENT_ID) {
      throw new Error(`Apologies, system is unable to process users log in.`)
    }

    this.auth0 = new auth0.WebAuth({
      domain: AUTH0_DOMAIN,
      clientID: AUTH0_CLIENT_ID,
      redirectUri: AUTH0_CALLBACK_URL,
      audience: `https://${AUTH0_DOMAIN}/userinfo`,
      responseType: 'token id_token',
      scope: 'openid'
    });

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
  }

  handleAuthentication() {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
        history.replace('/');
      } else if (err) {
        history.replace('/');
        console.log(err);
      }
    });
  }

  setSession(authResult) {
    // Set the time that the Access Token will expire at
    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
    // navigate to the home route
    history.replace('/');
  }

  login() {
    this.auth0.authorize();
  }

  logout() {
    // Clear Access Token and ID Token from local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    // navigate to the home route
    history.replace('/');
  }

  isAuthenticated() {
    // Check whether the current time is past the 
    // Access Token's expiry time
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }
}