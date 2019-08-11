/* global window document localStorage fetch alert */

// Fill in with your values
const AUTH0_CLIENT_ID = 'KcWs7TkXHZZ41Co5xhpPR1Oq3nfr4HPW';
const AUTH0_DOMAIN = 'carpal.au.auth0.com';
const AUTH0_CALLBACK_URL = window.location.href; // eslint-disable-line
const LOGGEDIN_URL =
  'https://tn99ubmph1.execute-api.ap-southeast-2.amazonaws.com/dev/authcheck';
// const LOGGEDIN_URL =
// 'https://m62upgxr2k.execute-api.ap-southeast-2.amazonaws.com/dev/authcheck';
// initialize auth0 lock
const lock = new Auth0Lock(AUTH0_CLIENT_ID, AUTH0_DOMAIN, {
  // eslint-disable-line no-undef
  auth: {
    params: {
      scope: 'openid email'
    },
    responseType: 'token id_token'
  },
  theme: {
    logo:
      'https://lh3.googleusercontent.com/Ba2CsLxqbgNuHOgejaNbWwmXkQov4yle1NuxMwiItBsAkX' +
      '47GVKZms1aQbKcbpL9IZl3M8xi7u-O5X_9wFX8a1zhHw1ZG_B06Wwx5-0sJcBR-E4CD3WrzHIEf2R0Wo' +
      'LR-FG5W9fMeuk=s150-p-k'
  },
  languageDictionary: {
    title: 'CarPal'
  }
});

function updateUI() {
  const isLoggedIn = localStorage.getItem('id_token');
  if (isLoggedIn) {
    // swap buttons
    document.getElementById('btn-login').style.display = 'none';
    document.getElementById('btn-logout').style.display = 'inline';
    const profile = JSON.parse(localStorage.getItem('profile'));
    // show username
    document.getElementById('nick').textContent = profile.email;
  }
}

// Handle login
lock.on('authenticated', authResult => {
  console.log(authResult);
  lock.getUserInfo(authResult.accessToken, (error, profile) => {
    if (error) {
      // Handle error
      return;
    }

    document.getElementById('nick').textContent = profile.nickname;

    localStorage.setItem('accessToken', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('profile', JSON.stringify(profile));

    updateUI();
  });
});

updateUI();

// Handle login
document.getElementById('btn-login').addEventListener('click', () => {
  lock.show();
});

// Handle logout
document.getElementById('btn-logout').addEventListener('click', () => {
  localStorage.removeItem('id_token');
  localStorage.removeItem('access_token');
  localStorage.removeItem('profile');
  document.getElementById('btn-login').style.display = 'flex';
  document.getElementById('btn-logout').style.display = 'none';
  document.getElementById('nick').textContent = '';
});

document.getElementById('btn-loggedin').addEventListener('click', () => {
  // Call private API with JWT in header
  const token = localStorage.getItem('id_token');
  /*
   // block request from happening if no JWT token present
   if (!token) {
    document.getElementById('message').textContent = ''
    document.getElementById('message').textContent =
     'You must login to call this protected endpoint!'
    return false
  }*/
  // Do request to private endpoint
  fetch(LOGGEDIN_URL, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(response => response.json())
    .then(data => {
      console.log('Token:', data);
      document.getElementById('message').textContent = '';
      document.getElementById('message').textContent = data.message;
    })
    .catch(e => {
      console.error(e);
    });
});
