import React from 'react';
import moment from 'moment-timezone';
import matchSorter from 'match-sorter';
import Link from 'next/link';
import router from 'next/router';

import Table from '../../src/components/table';
import auth from '../../src/auth/Auth';

import './index.css';
import { Ride } from '../../src/model';

const getColumns = (table) => {
  return [
    { accessor: 'client.name', Header: 'Client' },
    {
      Header: 'Pickup Time',
      id: 'pickupTimeAndDateInUTC',
      accessor: (cell: Ride) =>
        moment
          .tz(cell.pickupTimeAndDate, 'Australia/Sydney')
          .format('ddd h:mma DD/MM/YYYY'),
      filterMethod: (filter, rows) =>
        matchSorter(rows, filter.value, { keys: ['pickupTimeAndDateInUTC'] }),
      filterAll: true,
    },
    {
      Header: 'Location from',
      id: 'locationFrom',
      accessor: (cell) => cell.locationFrom.placeName,
      filterMethod: (filter, rows) => {
        return matchSorter(rows, filter.value, { keys: ['locationFrom'] });
      },
      filterAll: true,
    },
    {
      id: 'locationTo',
      Header: 'Location to',
      accessor: (cell) => cell.locationTo.placeName,
      filterMethod: (filter, rows) =>
        matchSorter(rows, filter.value, { keys: ['locationTo'] }),
      filterAll: true,
    },
    {
      accessor: 'status',
      Header: 'Status',
      filterMethod: (filter, rows) =>
        matchSorter(rows, filter.value, { keys: ['status'] }),
      filterAll: true,
    },
    {
      accessor: 'driver.name',
      Header: 'Driver',
      filterMethod: (filter, rows) =>
        matchSorter(rows, filter.value, { keys: ['driver.driver_name'] }),
      filterAll: true,
    },
    {
      Header: 'Change status',
      id: 'statusChanger',
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
  drives: any[];
  loading: boolean;
  error?: Error;
}

class Facilitator extends React.Component<Props, State> {
  state: State = { drives: null, loading: false };

  async handleStatusChange(e, row) {
    // This is a work around for a backend incinsistency.  It still gives us back pickupTime instead of pickupTimeAndDateInUTC
    const newStatus = e.currentTarget.value;
    const pickupTimeAndDateInUTC =
      row._original.pickupTimeAndDateInUTC || row._original.pickupTime;
    const res = await fetch('/rides/' + row._original.id, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('id_token')}`,
      },
      body: JSON.stringify({
        ...row._original,
        pickupTimeAndDateInUTC,
        status: newStatus,
        driver: newStatus !== 'OPEN' ? row._original.driver : null,
      }),
    });

    if (res.status === 200) {
      row.status = newStatus;
      let newState = this.state;
      newState.drives[row._index].status = newStatus;
      newState.drives[row._index].driver = null;
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

    this.setState({
      loading: true,
    });

    try {
      const res = await fetch('/api/rides/facilitator', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`,
        },
      });

      if (res.status === 200) {
        this.setState({ loading: false, drives: await res.json() });
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
  }

  handleRowClick(row) {
    router.push('/facilitator/' + row._original.id);
  }

  render() {
    if (this.state.loading) {
      return <img alt="loader" className="loader" src="/loader.svg" />;
    }
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
            <Link href={'/facilitator/create'}>
              <a className="btn btn-primary create-button">Create new</a>
            </Link>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            {this.state.drives && (
              <Table
                getTrProps={function (state, rowInfo, column) {
                  return {
                    onClick() {
                      handleRowClick(rowInfo.row);
                    },
                  };
                }}
                data={this.state.drives}
                columns={getColumns(this)}
              />
            )}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Facilitator;
