import React, { Component } from 'react';
import Link from 'next/link';

import auth, {
  AuthContext,
  hasAdminPrivilege,
  hasDriverPrivilege,
  hasFacilitatorPrivilege,
  login,
} from '../src/client/auth';

import './login.css';

class Home extends Component {
  static contextType = AuthContext;
  context!: React.ContextType<typeof AuthContext>;

  async componentDidMount() {
    if (/access_token|id_token|error/.test(window.location.hash)) {
      await this.context.handleAuthentication();
    }
  }

  facilitatorLink() {
    const isAuthorised = hasFacilitatorPrivilege(this.context.authState);

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
    const isAuthorised = hasDriverPrivilege(this.context.authState);

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
    return (
      <div className="container">
        <div className="hcp-background" />
        <div className="row justify-content-center">
          <div className="col-xs-12 col-sm-9 col-md-8 text-center">
            <div className="outerForm">
              {!this.context.authState && (
                <React.Fragment>
                  <div className="quote">Share the ride, share the life</div>

                  <div>Please log into Facebook before logging in here.</div>

                  <button
                    className="btn btn-success btn-block"
                    id="loginButton"
                    onClick={login}
                  >
                    Log In
                  </button>
                </React.Fragment>
              )}
              {this.context.authState && (
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
