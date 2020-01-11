import React from 'react';
import Table from '../components/table';
import moment from 'moment-timezone';
import { Link } from 'react-router-dom';
import axiosInstance from '../auth/api';
import matchSorter from 'match-sorter';
import history from '../history';
import './index.css';

const getColumns = table => {
  return [
    { accessor: 'client', Header: 'Client' },
    {
      Header: 'Pickup Time',
      id: 'pickupTimeAndDateInUTC',
      accessor: cell =>
        moment
          .tz(cell.pickupTimeAndDateInUTC, 'Australia/Sydney')
          .format('dddd hh:mma DD/MM/YYYY'),
      filterMethod: (filter, rows) =>
        matchSorter(rows, filter.value, { keys: ['pickupTimeAndDateInUTC'] }),
      filterAll: true
    },
    {
      Header: 'Location from',
      id: 'locationFrom',
      accessor: cell => cell.locationFrom.placeName,
      filterMethod: (filter, rows) => {
        return matchSorter(rows, filter.value, { keys: ['locationFrom'] });
      },
      filterAll: true
    },
    {
      id: 'locationTo',
      Header: 'Location to',
      accessor: cell => cell.locationTo.placeName,
      filterMethod: (filter, rows) =>
        matchSorter(rows, filter.value, { keys: ['locationTo'] }),
      filterAll: true
    },
    {
      accessor: 'status',
      Header: 'Status',
      filterMethod: (filter, rows) =>
        matchSorter(rows, filter.value, { keys: ['status'] }),
      filterAll: true
    },
    {
      accessor: 'driver.driver_name',
      Header: 'Driver',
      filterMethod: (filter, rows) =>
        matchSorter(rows, filter.value, { keys: ['driver.driver_name'] }),
      filterAll: true
    },
    {
      Header: 'Change status',
      id: 'statusChanger',
      Cell: ({ row }) => {
        return (
          <div onClick={e => e.stopPropagation()} className="form-group">
            <select
              onChange={e => table.handleStatusChange(e, row)}
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
      }
    }
  ];
};

class Facilitator extends React.Component {
  constructor() {
    super();
    this.state = { drives: null };
    this.handleRowClick = this.handleRowClick.bind(this);
  }

  handleStatusChange(e, row) {
    // This is a work around for a backend incinsistency.  It still gives us back pickupTime instead of pickupTimeAndDateInUTC
    const newStatus = e.currentTarget.value;
    const pickupTimeAndDateInUTC =
      row._original.pickupTimeAndDateInUTC || row._original.pickupTime;
    axiosInstance({
      url: '/rides/' + row._original.id,
      method: 'put',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('id_token')}`
      },
      data: {
        ...row._original,
        pickupTimeAndDateInUTC,
        status: newStatus,
        driver: newStatus !== 'OPEN' ? row._original.driver : null
      }
    }).then(res => {
      row.status = newStatus;
      let newState = this.state;
      newState.drives[row._index].status = newStatus;
      newState.drives[row._index].driver = null;
      this.setState(newState);
    });
  }

  componentDidMount() {
    const { isAuthenticated, hasFacilitatorPriviledge } = this.props.auth;
    if (!isAuthenticated() || !hasFacilitatorPriviledge()) {
      history.replace('/');
      return false;
    }

    this.setState({
      loading: true
    });
    axiosInstance
      .get('/rides?listType=facilitator&includePast=true', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`
        }
      })
      .then(res => {
        this.setState({ loading: false, drives: res.data });
      })
      .catch(e => {
        console.error(e);
        this.setState({
          loading: false,
          error: e
        });
      });
  }
  handleRowClick(row) {
    this.props.history.push('/facilitator/' + row._original.id);
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
            <Link
              className="btn btn-primary create-button"
              to={'/facilitator/clients'}
            >
              Clients
            </Link>
            <Link
              className="btn btn-primary create-button"
              to={'/facilitator/create'}
            >
              Create new
            </Link>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            {this.state.drives && (
              <Table
                getTrProps={function(state, rowInfo, column) {
                  return {
                    onClick() {
                      handleRowClick(rowInfo.row);
                    }
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
