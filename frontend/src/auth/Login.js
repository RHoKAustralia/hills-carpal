import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

class Login extends Component {
  login() {
    this.props.auth.login();
  }

  render() {
    const { isAuthenticated, hasAdminPriviledge } = this.props.auth;
    return (
      <div>
        <div className="Login-header">
          <div>Welcome to CarPal</div>
        </div>
        <div>
          {
            !isAuthenticated() && (
                <button
                  onClick={this.login.bind(this)}
                >
                  Log In
                </button>
              )
          }
          {
            isAuthenticated() && (
              <div>
                Pick your action:
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
              </div>
            )
          }
        </div>
      </div>
    );
  }
}

export default Login;
