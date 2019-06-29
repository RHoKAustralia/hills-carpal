import React from 'react';
import { Route, Router, Switch } from 'react-router-dom';
import App from './App';
import Auth from './auth/Auth';
import history from './history';
import Login from './auth/Login.js';
import Facilitator from './facilitator/index.js';
import CreateNewRide from './facilitator/CreateNewRide.js';
import Clients from './facilitator/Clients.js';
import Driver from './driver/index.js';
import Poll from './driver/Poll';
import RideDetail from './driver/RideDetail';

const auth = new Auth();

const handleAuthentication = (nextState, replace) => {
  if (/access_token|id_token|error/.test(nextState.location.hash)) {
    auth.handleAuthentication();
  }
};

export const createRoutes = () => {
  return (
    <Router history={history} component={App}>
      <App auth={auth}>
        <Switch>
          <Route
            exact
            path="/"
            render={props => {
              handleAuthentication(props);
              return <Login auth={auth} {...props} />;
            }}
          />
          <Route
            exact
            path="/facilitator"
            render={props => <Facilitator auth={auth} {...props} />}
          />
          <Route
            exact
            path="/facilitator/create"
            render={props => <CreateNewRide auth={auth} {...props} />}
          />
          <Route
            exact
            path="/facilitator/clients"
            render={props => <Clients auth={auth} {...props} />}
          />
          <Route
            exact
            path="/facilitator/:id"
            render={props => <CreateNewRide auth={auth} {...props} />}
          />
          <Route
            exact
            path="/driver"
            render={props => <Driver auth={auth} {...props} />}
          />
          <Route
            exact
            path="/driver/rides/:rideId/poll"
            render={props => <Poll auth={auth} {...props} />}
          />
          <Route
            exact
            path="/driver/rides/:rideId/details"
            render={props => <RideDetail auth={auth} {...props} />}
          />
        </Switch>
      </App>
    </Router>
  );
};
