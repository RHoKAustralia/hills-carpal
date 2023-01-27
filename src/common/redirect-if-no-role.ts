import router from 'next/router';
import { AuthState, login } from '../client/auth';

export default function isAuthedWithRole(
  authState: AuthState,
  role: 'facilitator' | 'driver'
) {
  if (!authState) {
    login();
    return false;
  }

  if (!authState.roles.includes(role)) {
    router.replace('/');
    return false;
  }

  return true;
}
