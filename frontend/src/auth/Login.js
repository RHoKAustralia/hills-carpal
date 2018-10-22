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
        <Link className="btn btn-success" to="/facilitator">
          Facilitator
        </Link>
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
        <Link className="btn btn-success" to="/driver">
          Driver
        </Link>
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
            <div className="outerForm">
              {!isAuthenticated() && (
                <React.Fragment>
                  <div className="quote">Share the ride, share the life</div>

                  <button
                    className="btn btn-success btn-block"
                    id="loginButton"
                    onClick={this.login.bind(this)}
                  >
                    Log In
                  </button>
                </React.Fragment>
              )}
              {isAuthenticated() && (
                <React.Fragment>
                  Pick your action:{' '}
                  <div class="btn-group" role="group">
                    {this.facilitatorLink()}
                    {this.driverLink()}
                  </div>
                </React.Fragment>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
