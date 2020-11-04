import React, { Component } from 'react';
import Link from 'next/link';

import auth from '../src/auth/Auth';

import './login.css';

class Home extends Component {
  componentDidMount() {
    if (/access_token|id_token|error/.test(window.location.hash)) {
      auth.handleAuthentication();
    }
  }

  login() {
    auth.login();
  }

  facilitatorLink() {
    const isAuthorised =
      auth.hasFacilitatorPrivilege() || auth.hasAdminPriviledge();
    if (isAuthorised) {
      return (
        <Link href="/facilitator">
          <a className="btn btn-success">Facilitator</a>
        </Link>
      );
    } else {
      return false;
    }
  }

  driverLink() {
    const isAuthorised =
      auth.hasDriverPriviledge() || auth.hasAdminPriviledge();
    if (isAuthorised) {
      return (
        <Link href="/driver">
          <a className="btn btn-success">Driver</a>
        </Link>
      );
    } else {
      return false;
    }
  }

  render() {
    const { isAuthenticated } = auth;
    return (
      <div className="container">
        <div className="hcp-background" />
        <div className="row justify-content-center">
          <div className="col-xs-12 col-sm-9 col-md-8 text-center">
            <div className="outerForm">
              {!isAuthenticated() && (
                <React.Fragment>
                  <div className="quote">Share the ride, share the life</div>

                  <div>Please log into Facebook before logging in here.</div>

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
                  <div className="btn-group" role="group">
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

export default Home;
