import React from 'react';
import { Route, Router } from 'react-router-dom';
import App from './App';
import Auth from './auth/Auth';
import history from './history';
import Login from './auth/Login.js';
import Facilitator from './facilitator/index.js';
import CreateNewRide from './facilitator/CreateNewRide.js';
import Driver from './driver/index.js';

const auth = new Auth();

const handleAuthentication = (nextState, replace) => {
  if (/access_token|id_token|error/.test(nextState.location.hash)) {
    auth.handleAuthentication();
  }
}

export const createRoutes = () => {
  return (
    <Router history={history} component={App}>
      <App auth={auth}>
        <Route exact path="/" render={(props) => {
          handleAuthentication(props);
          return <Login auth={auth} {...props} />} 
        }/>
        <Route path="/facilitator" render={(props) => <Facilitator auth={auth} {...props} />} />
        <Route exact path="/facilitator/create" render={(props) => <CreateNewRide auth={auth} {...props} />} />
        <Route exact path="/driver" render={(props) => <Driver auth={auth} {...props} />}/>
      </App>
    </Router>
  );
}