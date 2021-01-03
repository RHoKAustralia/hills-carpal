import router from 'next/router';
import { Auth } from '../client/auth';

export default function redirectIfNoRole(
  context: Auth,
  role: 'facilitator' | 'driver'
) {
  const { authState } = context;
  if (
    typeof window !== 'undefined' &&
    (!authState || !authState.roles.includes(role))
  ) {
    router.replace('/');
    return false;
  }
}
