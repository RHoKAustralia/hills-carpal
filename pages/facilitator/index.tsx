import React from 'react';
import moment from 'moment-timezone';
import Link from 'next/link';
import router from 'next/router';

import Table from '../../src/common/components/table';
import { AuthContext } from '../../src/client/auth';

import './index.css';
import { Ride } from '../../src/common/model';
import isAuthedWithRole from '../../src/common/redirect-if-no-role';
import getUserEmail from '../../src/common/components/facilitator/getUserEmail';
import { filter } from 'lodash';

const getColumns = (table) => {
  return [
    { accessor: 'client.name', id: 'clientName', Header: 'Client' },
    {
      Header: 'Pickup Time',
      id: 'pickupTimeAndDate',
      filterable: false,
      accessor: (cell: Ride) =>
        moment
          .tz(cell.pickupTimeAndDate, process.env.TIMEZONE)
          .format('dddd DD/MM/YYYY hh:mma'),
    },
    {
      Header: 'Location from',
      id: 'locationFrom',
      filterable: false,
      accessor: (cell) => cell.locationFrom.placeName,
    },
    {
      id: 'locationTo',
      Header: 'Location to',
      filterable: false,
      accessor: (cell) => cell.locationTo.placeName,
    },
    {
      id: 'driverName',
      accessor: 'driver.name',
      filterable: false,
      Header: 'Driver',
    },
    {
      id: 'facilitatorEmail',
      accessor: 'facilitatorEmail',
      filterable: false,
      Header: 'Facilitator Email'
    },
    {
      id: 'status',
      accessor: 'status',
      filterable: false,
      Header: 'Status',
    },
  ];
};

interface Props {}

interface State {
  rides: Ride[];
  loading: boolean;
  error?: Error;
  pages: number;
}

class Facilitator extends React.Component<Props, State> {
  static contextType = AuthContext;
  context!: React.ContextType<typeof AuthContext>;

  state: State = { rides: [], loading: false, pages: -1};

  async componentDidMount() {
    isAuthedWithRole(this.context, 'facilitator');
  }

  handleRowClick = (id: number) => {
    router.push(`/facilitator/rides/[id]`, '/facilitator/rides/' + id);
  };

  render() {
    if (this.state.error) {
      return (
        <span>
          Error: {this.state.error.message}. Please refresh the page to try
          again.
        </span>
      );
    }

    const handleRowClick = this.handleRowClick;

    return (
      <React.Fragment>
        <div className="row">
          <div className="col-6">
            <h4>Rides</h4>
          </div>
          <div className="col-6 create-button-row">
            <Link href={'/facilitator/clients'}>
              <a className="btn btn-primary create-button">Clients</a>
            </Link>
            <Link href={'/facilitator/rides/create'}>
              <a className="btn btn-primary create-button">Create new</a>
            </Link>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <Table
              getTrProps={(state, rowInfo, column) => ({
                onClick() {
                  handleRowClick((rowInfo.row._original as Ride).id);
                },
              })}
              pages={this.state.pages} // should default to -1 (which means we don't know how many pages we have)
              loading={this.state.loading}
              data={this.state.rides}
              manual
              columns={getColumns(this)}
              onFetchData={async (state, instance) => {
                // show the loading overlay
                this.setState({ loading: true });

                try {
                  const sorted = state.sorted
                    .map(
                      (sortColumn) =>
                        `&sort=${sortColumn.id}&sortDirection=${
                          sortColumn.desc ? 'desc' : 'asc'
                        }`
                    )
                    .join('');

                  const res = await fetch(
                    `/api/rides/facilitator?page=${state.page}&pageSize=${
                      state.pageSize
                    }${sorted}&filtered=${JSON.stringify(state.filtered)}`,
                    {
                      headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                          'id_token'
                        )}`,
                      },
                    }
                  );

                  if (res.status === 200) {
                    const data = await res.json();
                    this.setState({
                      loading: false,
                      rides : data.rides,
                      pages: data.pages,
                    });
                  } else {
                    throw new Error('Could not list rides');
                  }
                } catch (e) {
                  console.error(e);
                  this.setState({
                    loading: false,
                    error: e,
                  });
                }
              }}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Facilitator;
