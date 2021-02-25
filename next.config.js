const withPlugins = require('next-compose-plugins');
const withCSS = require('@zeit/next-css');
const withImages = require('next-images');

module.exports = withPlugins([
  [withImages, {}],
  [
    withCSS,
    {
      env: {
        REACT_APP_AUTH0_DOMAIN: 'hills-carpal.au.auth0.com',
        REACT_APP_AUTH0_CLIENT_ID: 's6DigGwiugQ2lNOnGbpNJPY5RlxO65KB',
        REACT_APP_AUTH0_CALLBACK_URL:
          process.env.REACT_APP_AUTH0_CALLBACK_URL ||
          'https://ride.carpal.org.au/',
        REACT_APP_AUTH_METADATA_NAMESPACE: 'https://carpal.org.au/',
        REACT_APP_AUTH_METADATA_ROLE: 'roles',
        REACT_APP_UNSAFE_GOD_MODE:
          process.env.REACT_APP_UNSAFE_GOD_MODE || false,
        EXTERNAL_URL: process.env.EXTERNAL_URL || 'https://ride.carpal.org.au',
        DATE_FORMAT: process.env.DATE_FORMAT || 'DD/MM/YYYY hh:mma',
        TIMEZONE: process.env.TIMEZONE || 'Australia/Sydney',
        REMINDER_DIFFERENCE_DAYS: process.env.REMINDER_DIFFERENCE_DAYS || '5',
      },
    },
  ],
]);
