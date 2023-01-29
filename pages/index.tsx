import React, { Component } from 'react';
import Link from 'next/link';
import getConfig from 'next/config';

import {
  AuthContext,
  hasDriverPrivilege,
  hasFacilitatorPrivilege,
  login,
} from '../src/client/auth';
const { publicRuntimeConfig } = getConfig();

class Home extends Component {
  static contextType = AuthContext;
  context!: React.ContextType<typeof AuthContext>;

  // We need this to allow use of publicRuntimeConfig
  static getInitialProps() {
    return {};
  }

  async componentDidMount() {
    if (/access_token|id_token|error/.test(window.location.hash)) {
      await this.context.handleAuthentication(
        publicRuntimeConfig.requireUserRole
      );
    }
  }

  facilitatorLink() {
    const isAuthorised = hasFacilitatorPrivilege(this.context.authState);

    if (isAuthorised) {
      return (
        <Link href="/facilitator" className="btn btn-success">
          Facilitator
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
        <Link href="/driver" className="btn btn-success">
          Driver
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
              {this.context.onClient && !this.context.authState && (
                <React.Fragment>
                  <div className="quote">Share the ride, share the life</div>

                  <button
                    className="btn btn-success btn-block"
                    id="loginButton"
                    onClick={login}
                  >
                    Log In
                  </button>
                </React.Fragment>
              )}
              {this.context.onClient &&this.context.authState && (
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
