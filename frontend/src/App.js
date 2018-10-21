import React, { Component } from 'react';
import './App.css';

const LoggedOutLinks = (
  <React.Fragment>
    <button
      className="navbar-toggler"
      type="button"
      data-toggle="collapse"
      data-target="#navbarSupportedContent"
      aria-controls="navbarSupportedContent"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span className="navbar-toggler-icon" />
    </button>

    <div className="collapse navbar-collapse" id="navbarSupportedContent">
      {/* <div className="linkBlock"> */}
      <ul className="navbar-nav ml-auto">
        <li className="nav-item hcp-nav-item">
          <a
            className="links nav-link"
            href="http://www.hillscarpal.org.au/"
            display="inline-block"
          >
            about us
          </a>
        </li>
        <li className="nav-item hcp-nav-item">
          <a
            className="links nav-link"
            href="http://www.hillscarpal.org.au/"
            display="inline-block"
          >
            contribute
          </a>
        </li>
        <li className="nav-item hcp-nav-item">
          <a
            className="donatelink nav-link"
            href="http://www.hillscarpal.org.au/donate/"
            display="inline-block"
          >
            donate
          </a>
        </li>
        <li className="nav-item hcp-nav-item">
          <a
            className="links nav-link"
            href="http://www.hillscarpal.org.au/contact-us/"
            display="inline-block"
          >
            contact us
          </a>
        </li>
      </ul>
      {/* </div> */}
    </div>
  </React.Fragment>
);

class App extends Component {
  logout() {
    this.props.auth.logout();
  }

  getLogoHref = () => {
    const auth = this.props.auth;
    if (!auth || !auth.isAuthenticated()) {
      return '/';
    } else if (auth.hasFacilitatorPriviledge()) {
      return '/facilitator';
    } else if (auth.hasDriverPriviledge()) {
      return '/driver';
    } else {
      return '/';
    }
  };

  render() {
    const { isAuthenticated } = this.props.auth;

    return (
      <div className="hcp-app">
        <nav className="navbar navbar-light bg-light navbar-expand-md">
          <a className="navbar-brand" href={this.getLogoHref()}>
            <img
              src="/styles/carpal.png"
              width="200"
              height="100"
              alt="HillsCarPal"
              id="icon"
            />
          </a>
          {!isAuthenticated() && LoggedOutLinks}
          {isAuthenticated() && (
            <div className="App-header-controls">
              <button
                className="btn btn-success"
                id="logOutButton"
                onClick={this.logout.bind(this)}
              >
                Log Out
              </button>
            </div>
          )}
        </nav>

        {this.props.children}
      </div>
    );
  }
}

export default App;
