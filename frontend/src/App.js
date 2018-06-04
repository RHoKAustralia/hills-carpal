import React, { Component } from 'react';
import './App.css';

class App extends Component {
  logout() {
    this.props.auth.logout();
  }

  render() {
    const { isAuthenticated } = this.props.auth;
    return (
      <div>
        <nav className="navbar navbar-light bg-light">
          <a className="navbar-brand" href="http://www.hillscarpal.org.au/">
            <img
              src="/styles/carpal.png"
              width="200"
              height="100"
              alt="HillsCarPal"
              id="icon"
            />
          </a>
          {!isAuthenticated() && (
            <div className="linkBlock">
              <a
                className="links"
                href="http://www.hillscarpal.org.au/"
                display="inline-block"
              >
                about us |
              </a>
              <a
                className="links"
                href="http://www.hillscarpal.org.au/"
                display="inline-block"
              >
                contribute |
              </a>
              <a
                className="donatelink"
                href="http://www.hillscarpal.org.au/donate/"
                display="inline-block"
              >
                donate |
              </a>
              <a
                className="links"
                href="http://www.hillscarpal.org.au/contact-us/"
                display="inline-block"
              >
                {' '}
                contact us
              </a>
            </div>
          )}
          <div className="App-header-controls">
            {isAuthenticated() && (
              <button
                className="btn btn-success"
                id="logOutButton"
                onClick={this.logout.bind(this)}
              >
                Log Out
              </button>
            )}
          </div>
        </nav>

        {this.props.children}
      </div>
    );
  }
}

export default App;
