import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Login extends Component {
  constructor() {
    super();
    this.state = {
      username: '',
      password: '',
    };
    this.handleLoginClick = this.handleLoginClick.bind(this);
  }
  handleLoginClick(e) {
    e.preventDefault();
    this.props.onSubmit(this.state);
  }
  render() {
    return (
      <form>
        <label>
          Username
          <input
            onChange={e => this.setState({ username: e.currentTarget.value })}
            value={this.state.username}
            type="text"
            name={'username'}
          />
        </label>
        <label>
          Username
          <input
            onChange={e => this.setState({ password: e.currentTarget.value })}
            value={this.state.password}
            type="password"
            name={'password'}
          />
        </label>
        <button onClick={this.handleLoginClick}> Login </button>
      </form>
    );
  }
}

Login.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default Login;
