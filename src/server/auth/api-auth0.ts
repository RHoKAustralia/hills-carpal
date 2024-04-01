import auth0, { Role } from 'auth0';
import NodeCache from 'node-cache';
import _ from 'lodash';

const userRoleCache = new NodeCache({
  stdTTL: 60 * 5, // 5 minutes
});
const usersInRoleCache = new NodeCache({
  stdTTL: 60 * 5, // 5 minutes
});

export const managementClient = new auth0.ManagementClient({
  domain: process.env.REACT_APP_AUTH0_DOMAIN,
  clientId: 'EFdG2h9dMZHtfo4aGD3SUZfghxlkED2K',
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  scope: 'read:users read:roles read:role_members',
});

const roleIdsPromise: Promise<{ [name: string]: Role }> = (async () => {
  const roles = await managementClient.getRoles();

  return _.keyBy(roles, (role) => role.name);
})();

export async function getUserRoles(userId: string): Promise<auth0.Role[]> {
  if (userRoleCache.get(userId)) {
    return userRoleCache.get(userId);
  } else {
    const roles = await managementClient.getUserRoles({
      id: userId,
    });
    userRoleCache.set(userId, roles);
    return roles;
  }
}

export async function getUsersInRole(
  roleId: string
): Promise<auth0.User<auth0.AppMetadata, auth0.UserMetadata>[]> {
  if (usersInRoleCache.get(roleId)) {
    return usersInRoleCache.get(roleId);
  } else {
    const roleIdLookup = await roleIdsPromise;
    const users = await managementClient.getUsersInRole({
      id: roleIdLookup[roleId].id,
    });
    usersInRoleCache.set(roleId, users);
    return users;
  }
}

export async function getUser(
  userId: string
): Promise<auth0.User<auth0.AppMetadata, auth0.UserMetadata>> {
  return managementClient.getUser({ id: userId });
}

export async function getUsers() {
  return managementClient.getUsers();
}
