import React, { Component } from 'react';
import moment from 'moment';
import Table from '../components/table';
const columns = [
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
];

class Driver extends Component {
  render() {
    return (
      <div className="container">
        <h1>Find drives</h1>
        <Table columns={columns} />
      </div>
    );
  }
}

Driver.propTypes = {};

export default Driver;
