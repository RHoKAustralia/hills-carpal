var axios = require("axios").default;

var userID = localStorage.getItem('user_id');
var accessToken = localStorage.getItem('access_token');

var options = {
  method: 'GET',
  url: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/users/${userID}`,
  headers: {authorization: `Bearer ${accessToken}`}
};

var email = '';


const getUserEmail = () => {
    axios.request(options).then(function (response) {
        console.log(response.data);
      }).catch(function (error) {
        console.error(error);
      });
}


export default getUserEmail;