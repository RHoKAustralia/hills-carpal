import React from 'react';
import Table from '../components/table';
import moment from 'moment';
import { Link } from 'react-router-dom';
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
    this.state = { drives: null };
  }
  componentDidMount() {
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
