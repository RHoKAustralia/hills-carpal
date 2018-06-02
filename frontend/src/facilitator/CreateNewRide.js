import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import { Link } from 'react-router-dom';
import LocationInput from '../components/location-input';
class CreateNewRide extends Component {
  constructor() {
    super();
    this.state = {
      client: '',
      // todo more fields
      datetime: moment(),
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.onSubmit(this.state);
  }
  render() {
    return (
      <div className="container">
        <h1>Create new ride</h1>
        <form onSubmit={e => this.handleSubmit(this.state)}>
          <div className="form-group">
            <label>Client</label>
            <input
              onChange={e => this.setState({ client: e.currentTarget.value })}
              type="text"
              name="client"
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <DatePicker
              selected={this.state.datetime}
              onChange={date => this.setState({ datetime: date })}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Location from</label>
            <LocationInput
              onChange={value => {
                this.setState({ locationTo: value });
              }}
            />
          </div>
          <div className="form-group">
            <label>Location to</label>
            <LocationInput
              onChange={value => {
                this.setState({ locationTo: value });
              }}
            />
          </div>
          <div className="form-group">
            <label>Facebook link</label>
            <input
              onChange={e => this.setState({ fbLink: e.currentTarget.value })}
              type="text"
              name="fbLink"
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Driver Gender</label>
            <select className="custom-select">
              <option selected>Select from following</option>
              <option value="1">Male</option>
              <option value="2">Female</option>
              <option value="3">From Mars</option>
            </select>
            <input
              onChange={e =>
                this.setState({ driverGender: e.currentTarget.value })
              }
              type="text"
              name="driverGender"
              className="form-control"
            />
          </div>
          <label />
          <button className="btn btn-primary" type="submit">
            Save
          </button>
          <Link className="btn btn-secondary" to={'/facilitator'}>
            Cancel
          </Link>
        </form>
      </div>
    );
  }
}

CreateNewRide.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default CreateNewRide;
