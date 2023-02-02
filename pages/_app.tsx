import React, { Component } from 'react';
import Link from 'next/link';
import { AppProps } from 'next/app';
import getConfig from 'next/config';

import AuthProvider, {
  AuthContext,
  hasDriverPrivilege,
  hasFacilitatorPrivilege,
} from '../src/client/auth';

import 'bootstrap/dist/css/bootstrap.css';
import 'react-data-grid/lib/styles.css';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-image-gallery/styles/css/image-gallery.css';

import './app.css';
import './document.css';
import './login.css';
import './facilitator/clients/clients.css';
import './facilitator/index.css';
import './driver/rides/[rideId]/poll.css';
import '../src/common/components/driver/driver-list.css';
import '../src/common/components/driver/ride-detail.css';
import '../src/common/components/driver/driver-map.css';
import '../src/common/components/facilitator/client-images.css';
import '../src/common/components/facilitator/ride.css';
import '../src/common/components/driver//leaflet/leaflet.css'

const { publicRuntimeConfig } = getConfig();

interface LinkData {
  type: string;
  route?: string;
  caption: string;
  role?: string;
  href?: string;
}

interface LinksProps {
  links: LinkData[];
}

function Links(props: LinksProps) {
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
          {props.links.map((link) => (
            <li key={link.route} className="nav-item hcp-nav-item">
              {link.type === 'external' ? (
                <a
                  className="links nav-link"
                  href="http://www.hillscarpal.org.au/"
                >
                  {link.caption}
                </a>
              ) : (
                <Link href={link.route} className="links nav-link">
                  {link.caption}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </React.Fragment>
  );
}

const loggedOutLinks: LinkData[] = [
  {
    type: 'external',
    href: 'http://www.hillscarpal.org.au/',
    caption: 'about us',
  },
  {
    type: 'external',
    href: 'http://www.hillscarpal.org.au/',
    caption: 'contribute',
  },
  {
    type: 'external',
    href: 'http://www.hillscarpal.org.au/donate/',
    caption: 'donate',
  },
  {
    type: 'external',
    href: 'http://www.hillscarpal.org.au/contact-us/',
    caption: 'contact us',
  },
];

const loggedInLinks: LinkData[] = [
  {
    type: 'internal',
    route: '/driver/queue',
    caption: 'your rides',
    role: 'driver',
  },
  {
    type: 'internal',
    route: '/driver/rides/find',
    caption: 'find a ride',
    role: 'driver',
  },
  {
    type: 'internal',
    route: '/facilitator',
    caption: 'edit rides',
    role: 'facilitator',
  },
  {
    type: 'internal',
    route: '/facilitator/clients',
    caption: 'edit clients',
    role: 'facilitator',
  },
];

function getLinksForRoles(roles) {
  return loggedInLinks.filter((link) =>
    roles.some((role) => link.role === role)
  );
}

const Nav = () => {
  const { authState, logout } = React.useContext(AuthContext);

  const [onClient, setOnClient] = React.useState(false);

  React.useEffect(() => {
    setOnClient(true);
  }, []);

  const getLogoHref = () => {
    if (!onClient || !authState) {
      return '/';
    } else if (hasFacilitatorPrivilege(authState)) {
      return '/facilitator';
    } else if (hasDriverPrivilege(authState)) {
      return '/driver';
    } else {
      return '/';
    }
  };

  return (
    <nav className="navbar navbar-light bg-light navbar-expand-md hcp-navbar justify-content-between">
      <Link className="navbar-brand" href={getLogoHref()}>
        <img
          src="/styles/CarPal-Logo-emma-transparent.png"
          width="100"
          height="106"
          alt="HillsCarPal"
          id="icon"
        />
      </Link>
      <div className="App-environment-name">
        {publicRuntimeConfig.environmentName} Environment
      </div>
      {onClient ? (
        <>
          {!authState && <Links links={loggedOutLinks} />}
          {authState && (
            <React.Fragment>
              <Links links={getLinksForRoles(authState.roles)} />
              <div>
              <button className="btn btn-success" id="logOutButton" onClick={()=>{if(window.confirm("Are you sure you want to logout?")){logout()}}} > Log Out </button>
              </div>
            </React.Fragment>
          )}
        </>
      ) : (
        'Loading...'
      )}
    </nav>
  );
};

class App extends Component<AppProps> {
  render() {
    return (
      <AuthProvider>
        <div className="hcp-app">
          <Nav />
          <div className="container">
            <this.props.Component {...this.props.pageProps} />
          </div>
        </div>
      </AuthProvider>
    );
  }
}

export default App;
