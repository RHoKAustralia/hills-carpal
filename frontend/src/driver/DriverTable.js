import matchSorter from 'match-sorter';
import moment from 'moment';
import Table from '../components/table';

import axiosInstance from '../auth/api';

import React, { Component } from 'react';
const columns = [
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
    id: 'description',
    Header: 'Description',
    accessor: cell => cell.description,
    filterMethod: (filter, rows) =>
      matchSorter(rows, filter.value, { keys: ['description'] }),
    filterAll: true
  },
  {
    id: 'status',
    Header: 'Status',
    accessor: cell => {
      const endpoint = cell.status === 'OPEN' ? 'accept' : 'decline';
      const clickHandler = function() {

          const data = axiosInstance
          .put(`rides/${this.id}/${endpoint}`, cell, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('id_token')}`,
              },
            })
            .then(res => {
                return res.data;
            });

        this.status = data.status;
      };

      const label = cell.status === 'OPEN' ? 'Going' : 'Decline';

      return <button onClick={clickHandler.bind(cell)} className={`outline ${label.toLowerCase()}`}>{label}</button>
    }
  }
];

class DriverTable extends Component {
  render() {
    return (
      <Table
        style={{ paddingTop: '10px' }}
        data={this.props.rides}
        columns={columns}
        filterable={false}
        defaultPageSize={5}
      />
    );
  }
}

export default DriverTable;
