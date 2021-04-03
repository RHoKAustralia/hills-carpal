import auth0 from 'auth0-js';
import React, { FunctionComponent } from 'react';
import { useState } from 'react';

export const KEY_USER_ROLE = 'user_role';

const webAuth = new auth0.WebAuth({
  domain: process.env.REACT_APP_AUTH0_DOMAIN,
  clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
  redirectUri:
    typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}/`
      : undefined,
  audience: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/userinfo`,
  responseType: 'token id_token',
  scope: 'openid profile email',
});

const metadataKeyUserRole =
  process.env.REACT_APP_AUTH_METADATA_NAMESPACE +
  process.env.REACT_APP_AUTH_METADATA_ROLE;

async function handleAuthentication() {
  return new Promise<auth0.Auth0DecodedHash>((resolve, reject) => {
    webAuth.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        setSession(authResult)
          .then(() => resolve(authResult))
          .catch(reject);
      } else if (err) {
        console.error(err);
        reject(err);
      }
    });
  });
}

async function setSession(authResult) {
  // Set the time that the Access Token will expire at
  const expiresAt = JSON.stringify(
    authResult.expiresIn * 1000 + new Date().getTime()
  );

  localStorage.setItem('access_token', authResult.accessToken);
  localStorage.setItem('id_token', authResult.idToken);
  localStorage.setItem('expires_at', expiresAt);
  localStorage.setItem('user_id', authResult.idTokenPayload.sub);

  await getProfile(authResult.accessToken);
}

function getProfile(accessToken: string) {
  return new Promise<void>((resolve, reject) => {
    webAuth.client.userInfo(accessToken, (err, profile) => {
      if (err) {
        reject(err);
      } else {
        setProfile(profile);
        resolve();
      }
    });
  });
}

function getFromStorage(): AuthState | undefined {
  return typeof window === 'undefined' || !localStorage.getItem('user_id')
    ? undefined
    : {
        userId: localStorage.getItem('user_id'),
        accessToken: localStorage.getItem('access_token'),
        roles: localStorage.getItem(KEY_USER_ROLE)?.split(',') || [],
        expiresAt: JSON.parse(localStorage.getItem('expires_at')),
      };
}

function setProfile(profile) {
  let userRoles = profile[metadataKeyUserRole];
  if (process.env.REACT_APP_UNSAFE_GOD_MODE) {
    userRoles = ['driver', 'admin', 'facilitator'];
  }

  localStorage.setItem(KEY_USER_ROLE, userRoles || ['']);
}

export function login() {
  try {
    webAuth.authorize({
      appState: {
        redirectTo: window.location.href,
      },
    });
  } catch (error) {
    throw new Error(`Apologies, system is unable to process users log in.`);
  }
}

function logout() {
  localStorage.removeItem('user_id');
  localStorage.removeItem('access_token');
  localStorage.removeItem('id_token');
  localStorage.removeItem('expires_at');
  localStorage.removeItem(KEY_USER_ROLE);
  webAuth.logout({
    returnTo: window.location.origin + '/',
  });
}

function isAuthenticated(authState: AuthState) {
  if (typeof window === 'undefined') {
    return false;
  } else {
    const expiresAt = authState.expiresAt;
    return new Date().getTime() < expiresAt;
  }
}

export function hasFacilitatorPrivilege(auth: AuthState | undefined) {
  return auth?.roles.indexOf('facilitator') > -1;
}

export function hasDriverPrivilege(auth: AuthState | undefined) {
  return auth?.roles.indexOf('driver') > -1;
}

export function hasAdminPrivilege(auth: AuthState | undefined) {
  return auth?.roles.indexOf('admin') > -1;
}

export const AuthContext = React.createContext<Auth | undefined>(undefined);

export type AuthState = {
  userId: string;
  accessToken: string;
  expiresAt: number;
  roles: string[];
};

export type Auth = {
  authState: AuthState;
  logout: () => void;
  handleAuthentication: () => Promise<void>;
};

export type WrappedComponentProps = {
  auth: Auth;
};

const AuthProvider: FunctionComponent<{}> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState | undefined>(() =>
    getFromStorage()
  );

  const value = {
    authState: authState && isAuthenticated(authState) ? authState : undefined,
    logout: () => {
      setAuthState(undefined);
      logout();
    },
    handleAuthentication: async () => {
      try {
        const authResult = await handleAuthentication();
        setAuthState(getFromStorage());

        window.location.href = authResult.appState.redirectTo;
      } catch (e) {
        console.error(e);
        alert('Failed to log in: ' + e.message);
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
