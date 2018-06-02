import React from 'react';
import Table from '../components/table';
import moment from 'moment';
import { Link } from 'react-router-dom';

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
  render() {
    return (
      <div className="container">
        <h1>Rides</h1>

        <Link className="btn btn-primary" to={'/facilitator/create'}>
          Create new
        </Link>
        <Table columns={columns} />
      </div>
    );
  }
}

export default Facilitator;
