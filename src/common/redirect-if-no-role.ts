import router from 'next/router';
import { Auth, login } from '../client/auth';

export default function isAuthedWithRole(
  context: Auth,
  role: 'facilitator' | 'driver'
) {
  const { authState, onClient } = context;

  if (!onClient) {
    return false;
  }

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
