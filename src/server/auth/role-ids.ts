import { Role } from 'auth0';
import _ from 'lodash';
import { managementClient } from './node-auth0';

const roleIds: Promise<{ [name: string]: Role }> = (async () => {
  const roles = await managementClient.getRoles();

  return _.keyBy(roles, (role) => role.name);
})();

export default roleIds;
