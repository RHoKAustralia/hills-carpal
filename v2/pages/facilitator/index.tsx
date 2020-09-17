import React from 'react';
import moment from 'moment-timezone';
import Link from 'next/link';
import router from 'next/router';

import Table from '../../src/components/table';
import auth from '../../src/auth/Auth';

import './index.css';
import { Ride } from '../../src/model';

const getColumns = (table) => {
  return [
    { accessor: 'client.name', id: 'clientName', Header: 'Client' },
    {
      Header: 'Pickup Time',
      id: 'pickupTimeAndDate',
      accessor: (cell: Ride) =>
        moment
          .tz(cell.pickupTimeAndDate, 'Australia/Sydney')
          .format('ddd h:mma DD/MM/YYYY'),
    },
    {
      Header: 'Location from',
      id: 'locationFrom',
      accessor: (cell) => cell.locationFrom.placeName,
    },
    {
      id: 'locationTo',
      Header: 'Location to',
      accessor: (cell) => cell.locationTo.placeName,
    },
    {
      id: 'driverName',
      accessor: 'driver.name',
      Header: 'Driver',
    },
    {
      id: 'status',
      accessor: 'status',
      Header: 'Status',
      Cell: ({ row }) => {
        return (
          <div onClick={(e) => e.stopPropagation()} className="form-group">
            <select
              onChange={(e) => table.handleStatusChange(e, row)}
              value={row['status']}
              className="custom-select"
            >
              <option value="OPEN">Open</option>
              <option value="CONFIRMED" disabled={!row._original.driver}>
                Confirmed
              </option>
              <option value="ENDED" disabled={!row._original.driver}>
                Ended
              </option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        );
      },
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
  state: State = { rides: [], loading: false, pages: -1 };

  async handleStatusChange(e, row) {
    // This is a work around for a backend incinsistency.  It still gives us back pickupTime instead of pickupTimeAndDateInUTC
    const newStatus = e.currentTarget.value;
    const pickupTimeAndDate =
      row._original.pickupTimeAndDate || row._original.pickupTime;
    const res = await fetch('/facilitator/rides/' + row._original.id, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('id_token')}`,
      },
      body: JSON.stringify({
        ...row._original,
        pickupTimeAndDate,
        status: newStatus,
        driver: newStatus !== 'OPEN' ? row._original.driver : null,
      }),
    });

    if (res.status === 200) {
      row.status = newStatus;
      let newState = this.state;
      newState.rides[row._index].status = newStatus;
      newState.rides[row._index].driver = null;
      this.setState(newState);
    } else {
      throw new Error('Could not change status');
    }
  }

  async componentDidMount() {
    const { isAuthenticated, hasFacilitatorPrivilege } = auth;
    if (!isAuthenticated() || !hasFacilitatorPrivilege()) {
      router.replace('/');
      return false;
    }
  }

  handleRowClick = (id: number) => {
    router.push('/facilitator/rides/' + id);
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
              filterable={false}
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
                    `/api/rides/facilitator?page=${state.page}&pageSize=${state.pageSize}${sorted}&filtered=${state.filtered}`,
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
                      rides: data.rides,
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

                // fetch your data
                // Axios.post('mysite.com/data', {
                //   page: state.page,
                //   pageSize: state.pageSize,
                //   sorted: state.sorted,
                //   filtered: state.filtered,
                // }).then((res) => {
                //   // Update react-table
                //   this.setState({
                //     data: res.data.rows,
                //     pages: res.data.pages,
                //     loading: false,
                //   });
                // });
              }}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Facilitator;
