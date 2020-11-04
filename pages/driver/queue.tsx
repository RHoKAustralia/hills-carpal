import React, { Component } from 'react';
import Link from 'next/link';
import Router from 'next/router';

import DriverList from '../../src/components/driver/driver-list';
import auth from '../../src/auth/Auth';

class Queue extends Component {
  state = {
    loading: false,
    error: null,
    rides: null,
  };

  componentDidMount() {
    const { isAuthenticated, hasDriverPriviledge } = auth;
    if (!isAuthenticated() || !hasDriverPriviledge()) {
      Router.replace('/');
      return false;
    }

    this.getQueue();
  }

  getQueue() {
    const url = '/api/rides/queue';

    this.setState({
      loading: true,
    });

    fetch(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('id_token')}`,
      },
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        }

        throw new Error('Could not get queue');
      })
      .then((data) => {
        this.setState({ rides: data, loading: false });
      })
      .catch((e) => {
        console.error(e);
        this.setState({
          error: e,
          loading: false,
        });
      });
  }

  render() {
    if (this.state.loading) {
      return <img alt="loader" className="loader" src="/loader.svg" />;
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
            <h4>Your Rides</h4>
          </div>
        </div>
        {this.state.rides && this.state.rides.length > 0 ? (
          <DriverList rides={this.state.rides} />
        ) : (
          <React.Fragment>
            You don't have any rides right now! Go to{' '}
            <Link href="/driver/rides/find">
              <a>find a ride</a>
            </Link>{' '}
            to accept one!
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}

export default Queue;
