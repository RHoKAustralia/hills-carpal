import React from 'react';
import moment from 'moment-timezone';
import Link from 'next/link';
import router from 'next/router';

import Table from '../../src/common/components/table';
import { AuthContext } from '../../src/client/auth';

import { Ride } from '../../src/common/model';
import isAuthedWithRole from '../../src/common/redirect-if-no-role';
import { TableColumn } from 'react-data-table-component';

const columns: TableColumn<Ride>[] = [
  {
    id: 'clientName',
    selector: (ride) => ride.client.name,
    name: 'Client',
    wrap: true,
    sortable: true,
  },
  {
    id: 'pickupTimeAndDate',
    sortable: true,
    name: 'Pickup Time',
    selector: (cell: Ride) =>
      moment
        .tz(cell.pickupTimeAndDate, process.env.TIMEZONE)
        .format('dddd DD/MM/YYYY hh:mma'),
    wrap: true,
  },
  {
    id: 'locationFrom',
    name: 'Location from',
    sortable: true,
    selector: (cell) => cell.locationFrom.placeName,
    grow: 1,
    wrap: true,
  },
  {
    id: 'locationTo',
    name: 'Location to',
    sortable: true,
    selector: (cell) => cell.locationTo.placeName,
    grow: 1,
    wrap: true,
  },
  {
    id: 'driverName',
    selector: (cell) => cell.driver?.name,
    grow: 1,
    sortable: true,
    name: 'Driver',
    wrap: true,
  },
  {
    id: 'facilitatorEmail',
    selector: (cell) => cell.facilitatorEmail,
    name: 'Facilitator Email',
    sortable: true,
    grow: 1,
    wrap: true,
  },
  {
    id: 'status',
    selector: (cell) => cell.status,
    sortable: true,
    name: 'Status',
  },
];

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
    isAuthedWithRole(this.context.authState, 'facilitator');
  }

  handleRowClick = (ride: Ride) => {
    router.push(`/facilitator/rides/[id]`, '/facilitator/rides/' + ride.id);
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

    return (
      <>
        <div className="container">
          <div className="row">
            <div className="col-6">
              <h4>Rides</h4>
            </div>
            <div className="col-6 create-button-row">
              <Link
                href={'/facilitator/clients'}
                className="btn btn-primary create-button"
              >
                Clients
              </Link>
              <Link
                href={'/facilitator/rides/create'}
                className="btn btn-primary create-button"
              >
                Create new
              </Link>
            </div>
          </div>
        </div>
        <div className="container-fluid">
          <div className="row">
            <div className="col">
              <Table
                defaultSort={{
                  column: 'pickupTimeAndDate',
                  direction: 'desc',
                }}
                columns={columns}
                onRowClicked={this.handleRowClick}
                fetchData={async (state) => {
                  const sorted = `&sort=${state.sorted.column}&sortDirection=${state.sorted.direction}`;

                  const res = await fetch(
                    `/api/rides/facilitator?page=${state.page - 1}&pageSize=${
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
                    const data = (await res.json()) as {
                      rides: Ride[];
                      count: number;
                    };

                    return {
                      rows: data.rides,
                      total: data.count,
                    };
                  } else {
                    throw new Error('Could not list rides');
                  }
                }}
              />
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default Facilitator;
