# Authentication with Auth0

We've created an Auth0 account to handle authentication and authorization.

Authentication will be via the administrator/driver/facilitator logging into the https://rides.carpal.org.au website with their Facebook account.

The Auth0 site has examples for implementing the 'lock' screen with React. The 'infrastructure/test-login-frontend' folder has a pure JavaScript implementation.

# Roles as Meta Data

In the Auth0 configuration, we are using the User property 'app_metadata' to add a 'role' property with one of three values:
- admin
- facilitator
- driver

e.g.
```
{
    "role": "driver"
}
```

# Custom Rule

A custom rule copies the meta data to a JWT claim:

```
function (user, context, callback) {
  const namespace = 'https://carpal.org.au/';
  if (user.app_metadata) {
    context.idToken[namespace + 'role'] = user.app_metadata.role;
  } else {
    context.idToken[namespace + 'role'] = 'none';
  }
  callback(null, user, context);
}
```