import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

class Login extends Component {
  login() {
    this.props.auth.login();
  }

  facilitatorLink() {
    const isAuthorised = this.props.auth.hasFacilitatorPriviledge() || this.props.auth.hasAdminPriviledge();
    if (isAuthorised) {
      return <li>
        <Link to="/facilitator">Facilitator</Link>
      </li>
    } else {
      return false;
    }
  }

  driverLink() {
    const isAuthorised = this.props.auth.hasDriverPriviledge() || this.props.auth.hasAdminPriviledge();
    if (isAuthorised) {
      return <li>
        <Link to="/driver">Driver</Link>
      </li>
    } else {
      return false;
    }
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
                  {this.facilitatorLink()}
                  {this.driverLink()}
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
