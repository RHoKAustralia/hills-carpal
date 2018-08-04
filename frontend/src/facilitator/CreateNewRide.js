import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { Link } from 'react-router-dom';
import LocationInput from '../components/location-input';
import axiosInstance from '../auth/api';
import history from '../history';
import 'react-datepicker/dist/react-datepicker.css';
import './CreateNewRide.css';

class CreateNewRide extends Component {
  constructor() {
    super();
    this.state = {
      client: '',
      pickupTimeAndDateInUTC: moment(),
      driverGender: '',
      locationTo: '',
      locationFrom: '',
      carType: '',
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const { isAuthenticated, hasFacilitatorPriviledge } = this.props.auth;
    if (!isAuthenticated() || !hasFacilitatorPriviledge()) {
      history.replace('/');
      return false;
    }

    if (this.props.match.params.id) {
      axiosInstance
        .get('/rides/' + this.props.match.params.id, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('id_token')}`,
          },
        })
        .then(res => {
          const data = res.data;

          this.setState(data);
        });
    }
  }

  handleSubmit(e) {
    e.preventDefault();

    if (this.props.match.params.id) {
      axiosInstance({
        url: '/rides/' + this.props.match.params.id,
        method: 'put',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`,
        },
        data: this.state,
      }).then(_ => {
        this.props.history.push('/facilitator/');
      });
    } else {
      axiosInstance({
        url: '/rides',
        method: 'post',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`,
        },
        data: this.state,
      }).then(_ => {
        this.props.history.push('/facilitator/');
      });
    }
  }
  getHeadline() {
    if (this.props.match.params.id) {
      return <h1>Edit ride</h1>;
    }
    return <h1>Create new ride</h1>;
  }
  render() {
    if (this.props.match.params.id && this.state.id === undefined) {
      return <img alt="loader" className="loader" src="/loader.svg" />;
    }

    return (
      <div className="container">
        {this.getHeadline()}
        <form onSubmit={this.handleSubmit}>
          <div className="form-group">
            <label>Client</label>
            <input
              value={this.state.client}
              required
              onChange={e => this.setState({ client: e.currentTarget.value })}
              type="text"
              name="client"
              className="form-control"
              placeholder="Type your name"
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <DatePicker
              required
              value={moment(this.state.pickupTimeAndDateInUTC || Date.now())}
              selected={moment(this.state.pickupTimeAndDateInUTC || Date.now())}
              onChange={date => this.setState({ pickupTimeAndDateInUTC: date })}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="LLL"
              timeCaption="time"
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Location from</label>
            <LocationInput
              required={true}
              value={this.state.locationFrom}
              onChange={value => {
                this.setState({ locationFrom: value });
              }}
            />
          </div>
          <div className="form-group">
            <label>Location to</label>
            <LocationInput
              required={true}
              value={this.state.locationTo}
              onChange={value => {
                this.setState({ locationTo: value });
              }}
            />
          </div>
          <div className="form-group">
            <label>Facebook link</label>
            <input
              value={this.state.fbLink}
              onChange={e => this.setState({ fbLink: e.currentTarget.value })}
              type="text"
              name="fbLink"
              className="form-control"
              placeholder="Type your Facebook link here"
            />
          </div>
          <div className="form-group">
            <label>Driver Gender</label>
            <select
              required
              onChange={e => {
                this.setState({ driverGender: e.currentTarget.value });
              }}
              value={this.state.driverGender}
              className="custom-select"
            >
              <option>Select from following</option>
              <option value="any">Any</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="form-group">
            <label>Car type</label>

            <select
              required
              onChange={e => {
                this.setState({ carType: e.currentTarget.value });
              }}
              value={this.state.carType}
              className="custom-select"
            >
              <option>Select from following</option>
              <option value="noSUV">No SUV</option>
              <option value="All">All</option>
            </select>
          </div>
          <div className="form-group">
            <label>Description</label>

            <textarea
              onChange={e => {
                this.setState({ description: e.target.value });
              }}
              rows={5}
              maxLength={1024}
              className="form-control"
              value={this.state.description}
            />
          </div>
          <div className="btn-group mr-2" role="group">
            <button className="btn btn-primary" type="submit">
              Save
            </button>
          </div>
          <div className="btn-group mr-2" role="group">
            <Link className="btn btn-secondary" to={'/facilitator'}>
              Back
            </Link>
          </div>
        </form>
      </div>
    );
  }
}

export default CreateNewRide;
