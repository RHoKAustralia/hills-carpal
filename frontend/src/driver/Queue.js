import React, { Component } from 'react';
import axiosInstance from '../auth/api';
import history from '../history';
import DriverList from './DriverList';

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
      `/rides?listType=driver&driverId=${encodeURIComponent(
        localStorage.getItem('user_id')
      )}&status=CONFIRMED`;

    this.setState({
      loading: true
    });

    axiosInstance
      .get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`
        }
      })
      .then(res => {
        this.setState({ rides: res.data, loading: false });
      })
      .catch(e => {
        console.error(e);
        this.setState({
          error: e,
          loading: false
        });
      });
  }

  render() {
    if (this.state.loading) {
      return <img alt="loader" className="loader" src="loader.svg" />;
    }
    if (this.state.error) {
      return (
        <span>Encountered an error - please try refreshing the page.</span>
      );
    }
    return (
      <React.Fragment>
        <div className="row">
          <div className="col-12 col-sm-6">
            <h4>Your Upcoming Trips</h4>
          </div>
        </div>
        {this.state.rides && <DriverList rides={this.state.rides} />}
      </React.Fragment>
    );
  }
}

FindRides.propTypes = {};

export default FindRides;
