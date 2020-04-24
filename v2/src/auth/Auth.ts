import auth0 from 'auth0-js';
import Router from 'next/router';

export const KEY_USER_ROLE = 'user_role';

export class Auth {
  auth0 = new auth0.WebAuth({
    domain: process.env.REACT_APP_AUTH0_DOMAIN,
    clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
    redirectUri: process.env.REACT_APP_AUTH0_CALLBACK_URL,
    audience: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/userinfo`,
    responseType: 'token id_token',
    scope: 'openid profile email'
  });

  metadataKeyUserRole =
    process.env.REACT_APP_AUTH_METADATA_NAMESPACE +
    process.env.REACT_APP_AUTH_METADATA_ROLE;

  userRole = undefined;

  handleAuthentication() {
    this.auth0.parseHash((err, authResult) => {
      console.log(authResult);
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
      } else if (err) {
        console.error(err);
        Router.replace('/');
      }
    });
  }

  setSession(authResult) {
    // Set the time that the Access Token will expire at
    const expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    );

    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
    localStorage.setItem('user_id', authResult.idTokenPayload.sub);

    this.getProfile();
  }

  getProfile() {
    const accessToken = this.getAccessToken();
    this.auth0.client.userInfo(accessToken, (err, profile) => {
      this.setProfile(err, profile);
    });
  }

  getUserId() {
    return localStorage.getItem('user_id');
  }

  getAccessToken() {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      throw new Error('No Access Token found');
    }
    return accessToken;
  }

  setProfile(error, profile) {
    let userRoles = profile[this.metadataKeyUserRole];
    if (process.env.REACT_APP_UNSAFE_GOD_MODE) {
      userRoles = ['driver', 'facilitator', 'admin'];
    }

    localStorage.setItem(KEY_USER_ROLE, userRoles || ['']);

    const firstUserRole = userRoles[0];
    if (firstUserRole === 'facilitator') {
      Router.replace('/facilitator');
    } else if (firstUserRole === 'driver') {
      Router.replace('/driver');
    } else {
      Router.replace('/');
    }
  }

  getRoles() {
    return localStorage.getItem(KEY_USER_ROLE).split(',');
  }

  login() {
    try {
      this.auth0.authorize();
    } catch (error) {
      throw new Error(`Apologies, system is unable to process users log in.`);
    }
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem(KEY_USER_ROLE);
    this.auth0.logout({
      returnTo: window.location.origin + '/'
    });
  }

  isAuthenticated() {
    if (typeof window === 'undefined') {
      return false;
    } else {
      const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
      return new Date().getTime() < expiresAt;
    }
  }

  hasFacilitatorPrivilege() {
    const userRoles = localStorage.getItem(KEY_USER_ROLE);
    return userRoles.indexOf('facilitator') > -1 || this.hasAdminPriviledge();
  }

  hasDriverPriviledge() {
    const userRoles = localStorage.getItem(KEY_USER_ROLE);
    return userRoles.indexOf('driver') > -1 || this.hasAdminPriviledge();
  }

  hasAdminPriviledge() {
    const userRoles = localStorage.getItem(KEY_USER_ROLE);
    return userRoles.indexOf('admin') > -1;
  }
}

export default new Auth();
