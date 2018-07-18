import React, { Component } from 'react';
import axiosInstance from '../auth/api';
import history from '../history';
import LocationSearch from './LocationSearch';
import qs from 'qs';
import DriverTable from './DriverTable';
import DriverMap from './DriverMap';

class Driver extends Component {
  constructor() {
    super();
    this.state = { rides: null, page: 'table', driverCoords: null };
    this.handleSearch = this.handleSearch.bind(this);
  }
  componentDidMount() {
    const { isAuthenticated, hasDriverPriviledge } = this.props.auth;
    if (!isAuthenticated() || !hasDriverPriviledge()) {
      history.replace('/');
      return false;
    }

    const url = process.env.REACT_APP_API_URL + '/rides';
    axiosInstance
      .get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`,
        },
      })
      .then(res => {
        this.setState({ rides: res.data });
      });
  }
  handleSearch({ locationFrom, locationTo }) {
    const query = {
      toLongitude: locationTo.longitude,
      toLatitude: locationTo.latitude,
      fromLongitude: locationFrom.longitude,
      fromLatitude: locationFrom.latitude,
    };
    const qString = qs.stringify(query);
    axiosInstance
      .get('/rides?' + qString, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`,
        },
      })
      .then(res => {
        this.setState({
          rides: res.data,
          driverCoords: { locationFrom, locationTo },
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
    if (this.state.page === 'map') return null;
    return (
      <button
        className="btn btn-sm btn-secondary"
        onClick={() => this.setState({ page: 'map' })}
      >
        Use map instead
      </button>
    );
  }
  render() {
    if (!this.state.rides) {
      return <img alt="loader" className="loader" src="loader.svg" />;
    }
    return (
      <div className="container">
        <LocationSearch clearable={true} onLocationSearch={this.handleSearch} />
        <div
          style={{
            display: 'flex',
            marginTop: '10px',
            justifyContent: 'flex-end',
          }}
          className="btn-group"
        >
          {this.renderMapBtn()}
        </div>
        {this.renderPage()}
        <a
          style={{ marginTop: '20px', display: 'block' }}
          href={'https://john3110.polldaddy.com/s/ride-feedback'}
        >
          Please fill in the survey
        </a>
      </div>
    );
  }
}

Driver.propTypes = {};

export default Driver;
