import router from 'next/router';
import {
  AuthState,
  hasDriverPrivilege,
  hasFacilitatorPrivilege,
  login,
} from '../client/auth';

export default function isAuthedWithRole(
  authState: AuthState,
  role: 'facilitator' | 'driver'
) {
  if (!authState) {
    login();
    return false;
  }

  if (
    (role === 'driver' && !hasDriverPrivilege(authState)) ||
    (role === 'facilitator' && !hasFacilitatorPrivilege(authState))
  ) {
    router.replace('/');
    return false;
  }

  return true;
}
