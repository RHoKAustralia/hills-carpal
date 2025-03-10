import auth0 from 'auth0-js';
import React, { FunctionComponent } from 'react';
import { useState } from 'react';
import type { WhoAmI } from '../common/model';
import { isUndefined } from 'lodash';

export const KEY_USER_ROLE = 'user_role';

const webAuth = new auth0.WebAuth({
  domain: process.env.REACT_APP_AUTH0_DOMAIN,
  clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
  redirectUri:
    typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.host}/`
      : undefined,
  audience: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/userinfo`,
  responseType: 'token id_token',
  scope: 'openid profile email',
});

const metadataKeyUserRole =
  process.env.REACT_APP_AUTH_METADATA_NAMESPACE +
  process.env.REACT_APP_AUTH_METADATA_ROLE;

async function handleAuthentication(requireUserRole?: string) {
  const authResult = await new Promise<auth0.Auth0DecodedHash>(
    (resolve, reject) => {
      webAuth.parseHash((err, authResult) => {
        if (authResult && authResult.accessToken && authResult.idToken) {
          setSession(authResult)
            .then((profile) => {
              const roles: string[] | undefined = profile[metadataKeyUserRole];
              if (
                requireUserRole &&
                (roles || []).indexOf(requireUserRole) === -1
              ) {
                reject(
                  new Error(
                    'User does not have the ' + requireUserRole + ' role'
                  )
                );
              }

              resolve(authResult);
            })
            .catch(reject);
        } else if (err) {
          console.error(err);
          reject(err);
        }
        webAuth.client.userInfo(authResult.accessToken, function (err, user) {
          localStorage.setItem('user_email', user.email);
        });
      });
    }
  );
  await refreshWhoAmI();
  return authResult;
}

const refreshWhoAmI = async () => {
  const res = await fetch('/api/users/whoami', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('id_token')}`,
    },
  });

  if (res.ok) {
    const data: WhoAmI = await res.json();
    localStorage.setItem('whoami', JSON.stringify(data));
  } else {
    throw new Error('Got response code ' + res.status);
  }
};

function setSession(authResult) {
  // Set the time that the Access Token will expire at
  const expiresAt = JSON.stringify(
    authResult.expiresIn * 1000 + new Date().getTime()
  );

  localStorage.setItem('access_token', authResult.accessToken);
  localStorage.setItem('id_token', authResult.idToken);
  localStorage.setItem('expires_at', expiresAt);
  localStorage.setItem('user_id', authResult.idTokenPayload.sub);

  return getProfile(authResult.accessToken);
}

function getProfile(accessToken: string): Promise<auth0.Auth0UserProfile> {
  return new Promise<auth0.Auth0UserProfile>(async (resolve, reject) => {
    webAuth.client.userInfo(accessToken, (err, profile) => {
      if (err) {
        reject(err);
      } else {
        setProfile(profile);
        resolve(profile);
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
        whoami: JSON.parse(localStorage.getItem('whoami')),
      };
}

function setProfile(profile) {
  let userRoles = profile[metadataKeyUserRole];
  if (process.env.REACT_APP_UNSAFE_GOD_MODE) {
    userRoles = ['facilitator'];
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
  const expiresAt = authState.expiresAt;
  return new Date().getTime() < expiresAt;
}

export function hasFacilitatorPrivilege(auth: AuthState | undefined) {
  return (
    auth?.roles.indexOf('facilitator') > -1 ||
    !isUndefined(auth?.whoami.facilitator)
  );
}

export function hasDriverPrivilege(auth: AuthState | undefined) {
  return (
    auth?.roles.indexOf('driver') > -1 || !isUndefined(auth?.whoami.driver)
  );
}

export function hasAdminPrivilege(auth: AuthState | undefined) {
  return auth?.roles.indexOf('admin') > -1;
}

/** Returns true if the user is inactive in all their roles - i.e. if they're only a driver and inactive as a driver,
or only a facilitator and inactive as a facilitator, or both driver and facilitator and inactive as both */
function isInactive(auth: AuthState | undefined) {
  if (!auth) {
    return false;
  }

  if (hasDriverPrivilege(auth) && hasFacilitatorPrivilege(auth)) {
    return auth.whoami.driver.inactive && auth.whoami.facilitator.inactive;
  }

  if (hasDriverPrivilege(auth)) {
    return auth.whoami.driver.inactive;
  }

  if (hasFacilitatorPrivilege(auth)) {
    return auth.whoami.facilitator.inactive;
  }

  return false;
}

export const AuthContext = React.createContext<Auth | undefined>(undefined);

export type AuthState = {
  userId: string;
  accessToken: string;
  expiresAt: number;
  roles: string[];
  whoami: WhoAmI;
};

export type Auth = {
  onClient: boolean;
  authState: AuthState;
  logout: () => void;
  handleAuthentication: (requireUserRole?: string) => Promise<void>;
  isInactive: typeof isInactive;
};

export type WrappedComponentProps = {
  auth: Auth;
};

const AuthProvider: FunctionComponent<{ children: React.ReactElement }> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState | undefined>(() =>
    getFromStorage()
  );

  const [onClient, setOnClient] = React.useState(false);

  React.useEffect(() => {
    setOnClient(true);
  }, []);

  const value: Auth = {
    onClient,
    authState: authState && isAuthenticated(authState) ? authState : undefined,
    logout: () => {
      setAuthState(undefined);
      logout();
    },
    handleAuthentication: async (requireUserRole?: string) => {
      try {
        const authResult = await handleAuthentication(requireUserRole);
        setAuthState(getFromStorage());

        window.location.href = authResult.appState.redirectTo;
      } catch (e) {
        console.error(e);
        alert('Failed to log in: ' + e.message);
      }
    },
    isInactive,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
