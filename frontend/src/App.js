import React, { Component } from 'react';
import './App.css';
import Login from './Login.js';
import Facilitator from './facilitator/';
import CreateNewRide from './facilitator/CreateNewRide';
import Driver from './driver';
import { HashRouter as Router, Route, Link } from 'react-router-dom';
import { Switch } from 'react-router';
import axios from 'axios';
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userRole: '',
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit({ username, password }) {
    const URL = process.env.API_URL || '';
    axios.post(URL + '/login', { username, password }).then(response => {
      this.setState({ userRole: response.data.role });
    });
  }

  render() {
    return (
      <Router>
        <div>
          This nav is for demo
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/facilitator">Facilitator</Link>
            </li>
            <li>
              <Link to="/driver">Driver</Link>
            </li>
          </ul>
          <hr />
          <Switch>
            <Route exact path="/" component={Login} />
            <Route exact path="/facilitator" component={Facilitator} />
            <Route exact path="/facilitator/create" component={CreateNewRide} />
            <Route exact path="/driver" component={Driver} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
