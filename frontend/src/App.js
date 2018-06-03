import React, { Component } from 'react';
import './App.css';

class App extends Component {
  logout() {
    this.props.auth.logout();
  }

  render() {
    const { isAuthenticated, getUserRole } = this.props.auth;
    return (
      <div>
        <div className="App-header">
          <div>Hills CarPal</div>
          <div className="App-header-controls">
            {isAuthenticated() && (
              <button onClick={this.logout.bind(this)}>Log Out</button>
            )}
          </div>
        </div>
        {this.props.children}
      </div>
    );
  }
}

export default App;
