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
      clientId: null,
      pickupTimeAndDateInUTC: moment(),
      driverGender: '',
      locationTo: '',
      locationFrom: '',
      carType: '',
      description: '',
      hasMps: false,
      clients: [],
      selectedClientId: -1
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
            Authorization: `Bearer ${localStorage.getItem('id_token')}`
          }
        })
        .then(res => {
          const data = res.data;
          const client = this.state.clients.find(c => c.name === data.client);
          let clientId = -1;
          if (client) {
            clientId = client.id;
          }
          data.selectedClientId = clientId;
          this.setState(data);
        });
    }

    axiosInstance
      .get('/clients', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`
        }
      })
      .then(res => {
        const data = res.data;
        const client = data.find(c => c.name === this.state.client);
        let clientId = -1;
        if (client) {
          clientId = client.id;
        }
        this.setState({ clients: data, selectedClientId: clientId });
      });
  }

  handleSubmit(e) {
    e.preventDefault();

    //hack remove non-ride props
    let ride = this.state;
    delete ride.clients;
    delete ride.selectedClientId;

    if (this.props.match.params.id) {
      axiosInstance({
        url: '/rides/' + this.props.match.params.id,
        method: 'put',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`
        },
        data: ride
      }).then(_ => {
        this.props.history.push('/facilitator/');
      });
    } else {
      axiosInstance({
        url: '/rides',
        method: 'post',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`
        },
        data: ride
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
      <React.Fragment>
        {this.getHeadline()}
        <form onSubmit={this.handleSubmit}>
          <div className="form-group">
            <label>Client</label>
            <select
              required
              onChange={e => {
                const clientId = parseInt(e.currentTarget.value, 10);
                const client = this.state.clients.find(c => c.id === clientId);
                this.setState({
                  selectedClientId: clientId,
                  locationFrom: client.locationHome,
                  locationTo: client.locationHome,
                  carType: client.carType,
                  clientId: client.id,
                  driverGender: client.driverGender,
                  hasMps: client.hasMps
                });
              }}
              value={this.state.selectedClientId}
              className="custom-select"
            >
              <option>Select from following</option>
              {this.state.clients.map(c => {
                return (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                );
              })}
            </select>
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
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="mps"
              checked={this.state.hasMps}
              onChange={e => {
                this.setState({ hasMps: e.currentTarget.checked });
              }}
            />
            <label className="form-check-label" htmlFor="mps">
              Has Mobility Parking Sticker
            </label>
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
      </React.Fragment>
    );
  }
}

export default CreateNewRide;
