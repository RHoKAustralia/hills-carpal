import matchSorter from 'match-sorter';
import moment from 'moment';
import Table from '../components/table';
import history from '../history';

import React, { Component } from 'react';
const columns = [
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
    id: 'description',
    Header: 'Description',
    accessor: cell => cell.description,
    filterMethod: (filter, rows) =>
      matchSorter(rows, filter.value, { keys: ['description'] }),
    filterAll: true
  }
];

class DriverTable extends Component {
  render() {
    return (
      <Table
        style={{ paddingTop: '10px', cursor: 'pointer' }}
        getTrProps={(state, rowInfo) => {
          return {
            onClick: e => {
              history.push(`/driver/rides/${rowInfo.original.id}/details`);
            }
          };
        }}
        data={this.props.rides}
        columns={columns}
        filterable={false}
        defaultPageSize={5}
      />
    );
  }
}

export default DriverTable;
