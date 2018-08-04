import React from 'react';
import Table from '../components/table';
import moment from 'moment';
import { Link } from 'react-router-dom';
import axiosInstance from '../auth/api';
import matchSorter from 'match-sorter';
import history from '../history';
import './index.css';
const handleStatusChange = (e, row) => {
  // This is a work around for a backend incinsistency.  It still gives us back pickupTime instead of pickupTimeAndDateInUTC
  const pickupTimeAndDateInUTC =
    row._original.pickupTimeAndDateInUTC || row._original.pickupTime;
  axiosInstance({
    url: '/rides/' + row._original.id,
    method: 'put',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('id_token')}`,
    },
    data: {
      ...row._original,
      pickupTimeAndDateInUTC,
      status: e.currentTarget.value,
    },
  });
};

const columns = [
  { accessor: 'client', Header: 'Client' },
  {
    Header: 'Pickup Time',
    id: 'pickupTimeAndDateInUTC',
    accessor: cell =>
      moment(cell.pickupTimeAndDateInUTC).format('dddd hh:mma DD/MM/YYYY'),
    filterMethod: (filter, rows) =>
      matchSorter(rows, filter.value, { keys: ['pickupTimeAndDateInUTC'] }),
    filterAll: true,
  },
  {
    Header: 'Location from',
    id: 'locationFrom',
    accessor: cell => cell.locationFrom.placeName,
    filterMethod: (filter, rows) => {
      return matchSorter(rows, filter.value, { keys: ['locationFrom'] });
    },
    filterAll: true,
  },
  {
    id: 'locationTo',
    Header: 'Location to',
    accessor: cell => cell.locationTo.placeName,
    filterMethod: (filter, rows) =>
      matchSorter(rows, filter.value, { keys: ['locationTo'] }),
    filterAll: true,
  },
  {
    id: 'fbLink',
    Header: 'Facebook link',
    accessor: cell => (
      <a href={cell.fbLink} target="blank">
        Go to facebook event
      </a>
    ),
  },
  {
    accessor: 'driverGender',
    Header: 'Gender',
    filterMethod: (filter, rows) =>
      matchSorter(rows, filter.value, { keys: ['driverGender'] }),
    filterAll: true,
  },
  {
    accessor: 'carType',
    Header: 'Car',
    filterMethod: (filter, rows) =>
      matchSorter(rows, filter.value, { keys: ['carType'] }),
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
    Header: 'Change status',
    id: 'statusChanger',
    Cell: ({ row }) => (
      <div onClick={e => e.stopPropagation()} className="form-group">
        <select
          onChange={e => handleStatusChange(e, row)}
          value={row['status']}
          className="custom-select"
        >
          <option value="OPEN">Open</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="ENDED">Ended</option>
          <option value="CANCELED">Canceled</option>
        </select>
      </div>
    ),
  },
];
class Facilitator extends React.Component {
  constructor() {
    super();
    this.state = { drives: null };
    this.handleRowClick = this.handleRowClick.bind(this);
  }
  componentDidMount() {
    const { isAuthenticated, hasFacilitatorPriviledge } = this.props.auth;
    if (!isAuthenticated() || !hasFacilitatorPriviledge()) {
      history.replace('/');
      return false;
    }
    axiosInstance
      .get('/rides?listType=facilitator', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`,
        },
      })
      .then(res => {
        this.setState({ drives: res.data });
      });
  }
  handleRowClick(row) {
    this.props.history.push('/facilitator/' + row._original.id);
  }
  render() {
    if (!this.state.drives) {
      return <img alt="loader" className="loader" src="loader.svg" />;
    }
    const handleRowClick = this.handleRowClick;
    return (
      <div className="container">
        <h1>Rides</h1>
        <div className="create-button-row">
          <Link
            className="btn btn-primary create-button"
            to={'/facilitator/create'}
          >
            Create new
          </Link>
        </div>
        <Table
          getTrProps={function(state, rowInfo, column) {
            return {
              onClick() {
                handleRowClick(rowInfo.row);
              },
            };
          }}
          data={this.state.drives}
          columns={columns}
        />
      </div>
    );
  }
}

export default Facilitator;
