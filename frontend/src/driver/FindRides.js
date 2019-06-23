import React, { Component } from 'react';
import axiosInstance from '../auth/api';
import history from '../history';
import LocationSearch from './LocationSearch';
import qs from 'qs';
import DriverTable from './DriverTable';
import DriverMap from './DriverMap';

class FindRides extends Component {
  constructor() {
    super();
    this.state = {
      rides: null,
      page: 'table',
      driverCoords: null,
      showLocationSearch: false
    };
    this.handleSearch = this.handleSearch.bind(this);
  }
  componentDidMount() {
    const { isAuthenticated, hasDriverPriviledge } = this.props.auth;
    if (!isAuthenticated() || !hasDriverPriviledge()) {
      history.replace('/');
      return false;
    }

    this.searchAllRides();
  }

  searchAllRides() {
    const url = process.env.REACT_APP_API_URL + '/rides?listType=driver';
    axiosInstance
      .get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`
        }
      })
      .then(res => {
        this.setState({ rides: res.data });
      });
  }

  handleSearch({ locationFrom, locationTo }) {
    const query = {
      listType: 'driver',
      toLongitude: locationTo.longitude,
      toLatitude: locationTo.latitude,
      fromLongitude: locationFrom.longitude,
      fromLatitude: locationFrom.latitude
    };
    const qString = qs.stringify(query);
    axiosInstance
      .get('/rides?' + qString, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`
        }
      })
      .then(res => {
        this.setState({
          rides: res.data,
          driverCoords: { locationFrom, locationTo }
        });
      });
  }
  renderPage() {
    if (this.state.page === 'table') {
      return <DriverTable rides={this.state.rides} />;
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
    this.setState(state => {
      if (state.showLocationSearch) {
        // We've just hidden the location search, so make sure the search results don't include it
        this.searchAllRides();
      }

      return {
        showLocationSearch: !state.showLocationSearch
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
    if (!this.state.rides) {
      return <img alt="loader" className="loader" src="loader.svg" />;
    }
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 col-sm-6">
            <h4>Upcoming Trips</h4>
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
        {this.renderPage()}
      </div>
    );
  }
}

FindRides.propTypes = {};

export default FindRides;
