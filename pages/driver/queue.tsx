import React, { Component } from 'react';
import Link from 'next/link';
import Router from 'next/router';

import DriverList from '../../src/common/components/driver/driver-list';
import { AuthContext, hasDriverPrivilege } from '../../src/client/auth';
import isAuthedWithRole from '../../src/common/redirect-if-no-role';

class Queue extends Component {
  static contextType = AuthContext;
  context!: React.ContextType<typeof AuthContext>;

  state = {
    loading: false,
    error: null,
    rides: null,
  };

  componentDidMount() {
    if (!isAuthedWithRole(this.context.authState, 'driver')) {
      return;
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
      <div className="container">
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
              find a ride
            </Link>{' '}
            to accept one!
          </React.Fragment>
        )}
      </div>
    );
  }
}

export default Queue;
