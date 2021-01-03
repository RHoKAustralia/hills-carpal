import React, { Component } from 'react';

import history from 'next/router';
import qs from 'qs';

import auth, {
  AuthContext,
  hasDriverPrivilege,
} from '../../../src/client/auth';
import LocationSearch from '../../../src/common/components/driver/location-search';
import DriverList from '../../../src/common/components/driver/driver-list';
import DriverMap from '../../../src/common/components/driver/driver-map';
import redirectIfNoRole from '../../../src/common/redirect-if-no-role';

interface State {
  loading: boolean;
  showLocationSearch: boolean;
  rides?: any[];
  page: 'table' | 'map';
  driverCoords?: any;
  error?: Error;
}

class FindRides extends Component<{}, State> {
  static contextType = AuthContext;
  context!: React.ContextType<typeof AuthContext>;

  state: State = {
    loading: false,
    rides: null,
    page: 'table',
    driverCoords: null,
    showLocationSearch: false,
  };

  componentDidMount() {
    redirectIfNoRole(this.context, 'driver');

    this.searchAllRides();
  }

  async searchAllRides() {
    this.setState({
      loading: true,
    });
    const url = '/api/rides/driver';

    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`,
        },
      });
      if (res.ok) {
        this.setState({
          loading: false,
          rides: (await res.json()).rides,
        });
      } else {
        throw new Error('Got response code ' + res.status);
      }
    } catch (e) {
      console.error(e);
      this.setState({
        loading: false,
        error: e,
      });
    }
  }

  async handleSearch({ locationFrom, locationTo }) {
    this.setState({
      loading: true,
    });
    const query = {
      listType: 'driver',
      toLongitude: locationTo.longitude,
      toLatitude: locationTo.latitude,
      fromLongitude: locationFrom.longitude,
      fromLatitude: locationFrom.latitude,
    };
    const qString = qs.stringify(query);

    try {
      const res = await fetch('/rides?' + qString, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`,
        },
      });

      if (res.ok) {
        this.setState({
          loading: false,
          rides: await res.json(),
          driverCoords: { locationFrom, locationTo },
        });
      } else {
        throw new Error('Got response ' + res.status);
      }
    } catch (e) {
      console.error(e);
      this.setState({
        loading: false,
        error: e,
      });
    }
  }
  renderPage() {
    if (this.state.page === 'table') {
      return <DriverList rides={this.state.rides} />;
    }
    return (
      <DriverMap
        onViewTableClick={() => this.setState({ page: 'table' })}
        driverCoords={this.state.driverCoords}
        rides={this.state.rides}
      />
    );
  }

  renderMapBtn() {
    const isMap = this.state.page === 'map';

    return (
      <button
        className="btn btn-sm btn-outline-secondary"
        onClick={() => this.setState({ page: isMap ? 'table' : 'map' })}
      >
        {isMap ? 'Use table instead' : 'Use map instead'}
      </button>
    );
  }

  toggleLocationSearchVisible = () => {
    this.setState((state) => {
      if (state.showLocationSearch) {
        // We've just hidden the location search, so make sure the search results don't include it
        this.searchAllRides();
      }

      return {
        showLocationSearch: !state.showLocationSearch,
      };
    });
  };

  renderLocationSearchBtn() {
    return (
      <button
        className={`btn btn-sm btn-outline-secondary ${
          this.state.showLocationSearch ? 'active' : ''
        }`}
        onClick={this.toggleLocationSearchVisible}
      >
        Filter by location
      </button>
    );
  }

  render() {
    if (this.state.loading) {
      return <img alt="loader" className="loader" src="/loader.svg" />;
    }
    if (this.state.error) {
      return (
        <span>
          Error: {this.state.error.message}. Please refresh the page to try
          again.
        </span>
      );
    }
    return (
      <React.Fragment>
        <div className="row">
          <div className="col-12 col-sm-6">
            <h4>Available Rides</h4>
          </div>
          {/* <div className="col-12 col-sm-6 text-left text-sm-right">
            <div className="btn-group">
              {this.renderLocationSearchBtn()}
              {this.renderMapBtn()}
            </div>
          </div> */}
        </div>
        {this.state.showLocationSearch && (
          <LocationSearch
            clearable={true}
            onLocationSearch={this.handleSearch}
          />
        )}
        {this.state.rides && this.state.rides.length > 0
          ? this.renderPage()
          : 'There are no rides available right now - try again later!'}
      </React.Fragment>
    );
  }
}

export default FindRides;
