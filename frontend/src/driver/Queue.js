import React, { Component } from 'react';
import axiosInstance from '../auth/api';
import history from '../history';
import DriverTable from './DriverTable';

class FindRides extends Component {
  constructor() {
    super();
    this.state = {
      rides: null
    };
  }

  componentDidMount() {
    const { isAuthenticated, hasDriverPriviledge } = this.props.auth;
    if (!isAuthenticated() || !hasDriverPriviledge()) {
      history.replace('/');
      return false;
    }

    this.getQueue();
  }

  getQueue() {
    const url =
      process.env.REACT_APP_API_URL +
      `/rides?listType=driver&driverId=${localStorage.getItem(
        'user_id'
      )}&status=CONFIRMED`;
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

  render() {
    if (!this.state.rides) {
      return <img alt="loader" className="loader" src="loader.svg" />;
    }
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 col-sm-6">
            <h4>Your Upcoming Trips</h4>
          </div>
        </div>
        <DriverTable rides={this.state.rides} />
      </div>
    );
  }
}

FindRides.propTypes = {};

export default FindRides;
