import React, { Component } from 'react';
import moment from 'moment';
import axiosInstance from '../auth/api';
import Table from '../components/table';
import matchSorter from 'match-sorter';
import history from '../history';
import LocationSearch from './LocationSearch';
import qs from 'qs';
const columns = [
  {
    Header: 'Pickup Time',
    id: 'pickupTimeAndDateInUTC',
    accessor: cell => moment(cell).format('YYYY-MM-DD'),
    filterMethod: (filter, rows) =>
      matchSorter(rows, filter.value, { keys: ['pickupTimeAndDateInUTC'] }),
    filterAll: true,
  },
  {
    Header: 'Location from',
    id: 'locationFrom',
    accessor: cell => cell.locationFrom.placeName,
    filterMethod: (filter, rows) => {
      return matchSorter(rows, filter.value, { keys: ['locationFrom'] });
    },
    filterAll: true,
  },
  {
    id: 'locationTo',
    Header: 'Location to',
    accessor: cell => cell.locationTo.placeName,
    filterMethod: (filter, rows) =>
      matchSorter(rows, filter.value, { keys: ['locationTo'] }),
    filterAll: true,
  },
  {
    id: 'fbLink',
    Header: 'Facebook link',
    accessor: cell => (
      <a href={cell.fbLink} target="blank">
        Go to facebook event
      </a>
    ),
  },
];

class Driver extends Component {
  constructor() {
    super();
    this.state = { drives: null };
    this.handleSearch = this.handleSearch.bind(this);
  }
  componentDidMount() {
    const { isAuthenticated, hasDriverPriviledge } = this.props.auth;
    if (!isAuthenticated() || !hasDriverPriviledge()) {
      history.replace('/');
      return false;
    }

    // const url = process.env.REACT_APP_API_URL + '/drives'
    axiosInstance
      .get('/rides', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`,
        },
      })
      .then(res => {
        this.setState({ drives: res.data });
      });
  }
  handleSearch({ locationTo, locationFrom }) {
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
        this.setState({ drives: res.data });
      });
  }
  render() {
    if (!this.state.drives) {
      return <img alt="loader" className="loader" src="loader.svg" />;
    }
    return (
      <div className="container">
        <h1>Find drives</h1>

        <LocationSearch onLocationSearch={this.handleSearch} />

        <Table
          style={{ paddingTop: '10px' }}
          data={this.state.drives}
          columns={columns}
        />

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
