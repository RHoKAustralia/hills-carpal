import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Login extends Component {
  login() {
    this.props.auth.login();
  }

  render() {
    const { isAuthenticated } = this.props.auth;
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
              <div>You are already logged in!</div>
            )
          }
        </div>
      </div>
    );
  }
}

export default Login;
