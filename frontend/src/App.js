import React, { Component } from 'react';
import './App.css';
import { Link } from 'react-router-dom';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userRole: '',
    };
  }

  logout() {
    this.props.auth.logout();
  }

  render() {
    const { isAuthenticated } = this.props.auth;
    return (
      <div>
        <div className="App-header">
          <div>Hills CarPal</div>
          <div>
            This nav is for demo
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
          <div className="App-header-controls">
            {
              isAuthenticated() && (
                  <button
                    onClick={this.logout.bind(this)}
                  >
                    Log Out
                  </button>
                )
            }
          </div>
        </div>
        {this.props.children}
      </div>
    );
  }
}

export default App;
