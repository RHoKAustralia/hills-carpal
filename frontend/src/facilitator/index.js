import React from 'react';
import CreateNewRide from './CreateNewRide';
import Table from '../components/table';
import moment from 'moment';
import axios from 'axios';

const columns = [
  { dataField: 'client', text: 'client' },
  {
    dataField: 'pickupTime',
    text: 'Pickup Time',
    formatter: cell => moment(cell).format('YYYY-MM-DD'),
  },
  {
    dataField: 'locationFrom',
    text: 'Location from',
    formatter: cell => cell.placeName,
  },
  {
    dataField: 'locationTo',
    text: 'Location to',
    formatter: cell => cell.placeName,
  },
  { dataField: 'fbLink', text: 'Facebook link' },
  { dataField: 'driverGender', text: 'Gender' },
  { dataField: 'carType', text: 'Car' },
  { dataField: 'status', text: 'Status' },
];
class Facilitator extends React.Component {
  constructor() {
    super();
    this.state = {
      page: 'list', // 'create
    };
    this.handleCreate = this.handleCreate.bind(this);
  }
  handleCreate(data) {
    const url = process.env.API_URL || '';
    axios.post('/facilities', data);
  }
  render() {
    if (this.state.page === 'create') {
      return (
        <CreateNewRide
          onBackBtnClick={() => this.setState({ page: 'list' })}
          onSubmit={this.handleCreate}
        />
      );
    }
    return (
      <div className="container">
        <h1>Rides</h1>
        <button
          className="btn btn-primary"
          onClick={() => this.setState({ page: 'create' })}
        >
          Create new
        </button>
        <Table columns={columns} />
      </div>
    );
  }
}

export default Facilitator;
