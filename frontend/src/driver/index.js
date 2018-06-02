import React, { Component } from 'react';
import moment from 'moment';
import axios from 'axios';
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
        <h1>Find drives</h1>
        <Table data={this.state.drives} columns={columns} />
      </div>
    );
  }
}

Driver.propTypes = {};

export default Driver;
