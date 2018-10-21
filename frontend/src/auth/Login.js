import React, { Component } from 'react';
import './login.css';
import { Link } from 'react-router-dom';

class Login extends Component {
  login() {
    this.props.auth.login();
  }

  facilitatorLink() {
    const isAuthorised =
      this.props.auth.hasFacilitatorPriviledge() ||
      this.props.auth.hasAdminPriviledge();
    if (isAuthorised) {
      return (
        <li>
          <Link to="/facilitator">Facilitator</Link>
        </li>
      );
    } else {
      return false;
    }
  }

  driverLink() {
    const isAuthorised =
      this.props.auth.hasDriverPriviledge() ||
      this.props.auth.hasAdminPriviledge();
    if (isAuthorised) {
      return (
        <li>
          <Link to="/driver">Driver</Link>
        </li>
      );
    } else {
      return false;
    }
  }

  render() {
    const { isAuthenticated } = this.props.auth;
    return (
      <div className="container">
        <div className="hcp-background" />
        <div className="row justify-content-center">
          <div className="col-xs-12 col-sm-9 col-md-8 text-center">
            {!isAuthenticated() && (
              <div className="outerForm">
                <div className="quote">Share the ride, share the life</div>

                <button
                  className="btn btn-success btn-block"
                  id="loginButton"
                  onClick={this.login.bind(this)}
                >
                  Log In
                </button>
              </div>
            )}
            {isAuthenticated() && (
              <div>
                Pick your action:
                <ul>
                  {this.facilitatorLink()}
                  {this.driverLink()}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
