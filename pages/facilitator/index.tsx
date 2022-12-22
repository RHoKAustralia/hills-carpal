import React from 'react';
import moment from 'moment-timezone';
import Link from 'next/link';
import router from 'next/router';

import Table from '../../src/common/components/table';
import { AuthContext } from '../../src/client/auth';

import { Ride } from '../../src/common/model';
import isAuthedWithRole from '../../src/common/redirect-if-no-role';
import getUserEmail from '../../src/common/components/facilitator/getUserEmail';
import { filter } from 'lodash';

const getColumns = (table) => {
  return [
    { accessor: 'client.name', key: 'clientName', name: 'Client' },
    {
      name: 'Pickup Time',
      key: 'pickupTimeAndDate',
      filterable: false,
      accessor: (cell: Ride) =>
        moment
          .tz(cell.pickupTimeAndDate, process.env.TIMEZONE)
          .format('dddd DD/MM/YYYY hh:mma'),
    },
    {
      name: 'Location from',
      key: 'locationFrom',
      filterable: false,
      accessor: (cell) => cell.locationFrom.placeName,
    },
    {
      key: 'locationTo',
      name: 'Location to',
      filterable: false,
      accessor: (cell) => cell.locationTo.placeName,
    },
    {
      key: 'driverName',
      accessor: 'driver.name',
      filterable: false,
      name: 'Driver',
    },
    {
      key: 'facilitatorEmail',
      accessor: 'facilitatorEmail',
      filterable: false,
      name: 'Facilitator Email',
    },
    {
      key: 'status',
      accessor: 'status',
      filterable: false,
      name: 'Status',
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

  state: State = { rides: [], loading: false, pages: -1 };

  async componentDidMount() {
    isAuthedWithRole(this.context, 'facilitator');
  }

  // handleRowClick = (key: number) => {
  //   router.push(`/facilitator/rides/[id]`, '/facilitator/rides/' + id);
  // };

  render() {
    if (this.state.error) {
      return (
        <span>
          Error: {this.state.error.message}. Please refresh the page to try
          again.
        </span>
      );
    }

    // const handleRowClick = this.handleRowClick;

    return (
      <React.Fragment>
        <div className="row">
          <div className="col-6">
            <h4>Rides</h4>
          </div>
          <div className="col-6 create-button-row">
            <Link href={'/facilitator/clients'} className="btn btn-primary create-button">
              Clients
            </Link>
            <Link
              href={'/facilitator/rides/create'}
              className="btn btn-primary create-button">
              Create new
            </Link>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <Table
              // getTrProps={(state, rowInfo, column) => ({
              //   onClick() {
              //     handleRowClick((rowInfo.row._original as Ride).id);
              //   },
              // })}
              // pages={this.state.pages} // should default to -1 (which means we don't know how many pages we have)
              // loading={this.state.loading}
              rows={this.state.rides}
              // manual
              columns={getColumns(this)}
              // onFetchData={async (state) => {
              //   // show the loading overlay
              //   this.setState({ loading: true });

              //   try {
              //     const sorted = state.sorted
              //       .map(
              //         (sortColumn) =>
              //           `&sort=${sortColumn.id}&sortDirection=${
              //             sortColumn.desc ? 'desc' : 'asc'
              //           }`
              //       )
              //       .join('');

              //     const res = await fetch(
              //       `/api/rides/facilitator?page=${state.page}&pageSize=${
              //         state.pageSize
              //       }${sorted}&filtered=${JSON.stringify(state.filtered)}`,
              //       {
              //         headers: {
              //           Authorization: `Bearer ${localStorage.getItem(
              //             'id_token'
              //           )}`,
              //         },
              //       }
              //     );

              //     if (res.status === 200) {
              //       const data = await res.json();
              //       this.setState({
              //         loading: false,
              //         rides: data.rides,
              //         pages: data.pages,
              //       });
              //     } else {
              //       throw new Error('Could not list rides');
              //     }
              //   } catch (e) {
              //     console.error(e);
              //     this.setState({
              //       loading: false,
              //       error: e,
              //     });
              //   }
              // }}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Facilitator;
