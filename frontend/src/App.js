import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import './App.css';

function Links(props) {
  return (
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
        <ul className="navbar-nav ml-auto">
          {props.links.map(link => (
            <li className="nav-item hcp-nav-item">
              {link.type === 'external' ? (
                <a
                  className="links nav-link"
                  href="http://www.hillscarpal.org.au/"
                  display="inline-block"
                >
                  {link.caption}
                </a>
              ) : (
                <Link to={link.route}>
                  <a className="links nav-link" display="inline-block">
                    {link.caption}
                  </a>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </React.Fragment>
  );
}

const loggedOutLinks = [
  {
    type: 'external',
    href: 'http://www.hillscarpal.org.au/',
    caption: 'about us'
  },
  {
    type: 'external',
    href: 'http://www.hillscarpal.org.au/',
    caption: 'contribute'
  },
  {
    type: 'external',
    href: 'http://www.hillscarpal.org.au/donate/',
    caption: 'donate'
  },
  {
    type: 'external',
    href: 'http://www.hillscarpal.org.au/contact-us/',
    caption: 'contact us'
  }
];

const loggedInLinks = [
  {
    type: 'internal',
    route: '/driver/queue',
    caption: 'queue',
    role: 'driver'
  },
  {
    type: 'internal',
    route: '/driver/find-rides',
    caption: 'find a ride',
    role: 'driver'
  },
  {
    type: 'internal',
    route: '/facilitator',
    caption: 'edit rides',
    role: 'facilitator'
  },
  {
    type: 'internal',
    route: '/facilitator/clients',
    caption: 'edit clients',
    role: 'facilitator'
  }
];

function getLinksForRoles(roles) {
  return loggedInLinks.filter(link => roles.some(role => link.role === role));
}

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
        <nav className="navbar navbar-light bg-light navbar-expand-md hcp-navbar justify-content-between">
          <a className="navbar-brand" href={this.getLogoHref()}>
            <img
              src="/styles/CarPal-Logo-emma-transparent.png"
              width="100"
              height="106"
              alt="HillsCarPal"
              id="icon"
            />
          </a>
          {!isAuthenticated() && <Links links={loggedOutLinks} />}
          {isAuthenticated() && (
            <React.Fragment>
              <Links links={getLinksForRoles(this.props.auth.getRoles())} />
              <div>
                <button
                  className="btn btn-success"
                  id="logOutButton"
                  onClick={this.logout.bind(this)}
                >
                  Log Out
                </button>
              </div>
            </React.Fragment>
          )}
        </nav>

        {this.props.children}
      </div>
    );
  }
}

export default App;
