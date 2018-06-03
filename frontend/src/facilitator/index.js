import React from 'react';
import Table from '../components/table';
import moment from 'moment';
import { Link } from 'react-router-dom';
import axios from 'axios';
import matchSorter from 'match-sorter';
import history from '../history';

const columns = [
  { accessor: 'client', Header: 'Client' },
  {
    Header: 'Pickup Time',
    id: 'pickupTime',
    accessor: cell => moment(cell).format('YYYY-MM-DD'),
    filterMethod: (filter, rows) =>
      matchSorter(rows, filter.value, { keys: ['pickupTime'] }),
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
      <a href={cell} target="blank">
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
];
class Facilitator extends React.Component {
  constructor() {
    super();
    this.state = { drives: null };
  }
  componentDidMount() {
    const { isAuthenticated, hasFacilitatorPriviledge } = this.props.auth;
    if (!isAuthenticated() || !hasFacilitatorPriviledge()) {
      history.replace('/');
      return false;
    }

    // const url = process.env.REACT_APP_API_URL + '/drives'
    axios.get('sampledata.json').then(res => {
      this.setState({ drives: res.data });
    });
  }
  render() {
    if (!this.state.drives) {
      return <img alt="loader" className="loader" src="loader.svg" />;
    }

    return (
      <div className="container">
        <h1>Rides</h1>
        <Link className="btn btn-primary" to={'/facilitator/create'}>
          Create new
        </Link>
        <Table data={this.state.drives} columns={columns} />
      </div>
    );
  }
}

export default Facilitator;
