const withPlugins = require('next-compose-plugins');
const withCSS = require('@zeit/next-css');
const withImages = require('next-images');

module.exports = withPlugins([
  [withImages, {}],
  [
    withCSS,
    {
      env: {
        REACT_APP_API_URL:
          process.env.REACT_APP_API_URL || 'https://api.ride.carpal.org.au/dev',
        REACT_APP_AUTH0_DOMAIN: 'hills-carpal.au.auth0.com',
        REACT_APP_AUTH0_CLIENT_ID: 's6DigGwiugQ2lNOnGbpNJPY5RlxO65KB',
        REACT_APP_AUTH0_CALLBACK_URL:
          process.env.REACT_APP_AUTH0_CALLBACK_URL ||
          'https://ride.carpal.org.au/',
        REACT_APP_PUBLIC_ENDPOINT:
          'https://whg7eifvn6.execute-api.us-west-2.amazonaws.com/dev/api/public',
        REACT_APP_PRIVATE_ENDPOINT:
          'https://whg7eifvn6.execute-api.us-west-2.amazonaws.com/dev/api/private',
        REACT_APP_LOGGEDIN_URL: 'https://api.ride.carpal.org.au/dev/authcheck',
        REACT_APP_AUTH_METADATA_NAMESPACE: 'https://carpal.org.au/',
        REACT_APP_AUTH_METADATA_ROLE: 'roles',
        REACT_APP_UNSAFE_GOD_MODE:
          process.env.REACT_APP_UNSAFE_GOD_MODE || false,
      },
    },
  ],
]);
