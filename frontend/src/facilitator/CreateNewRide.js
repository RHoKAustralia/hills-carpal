import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment-timezone';
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
      pickupTimeAndDateInUTC: moment().tz('Australia/Sydney'),
      driverGender: '',
      locationTo: '',
      locationFrom: '',
      carType: '',
      description: '',
      status: null,
      driver: null,
      hasMps: false,
      clients: [],
      selectedClientId: -1,
      loading: false,
      loadingError: null,
      updating: false,
      updatingError: null
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const { isAuthenticated, hasFacilitatorPriviledge } = this.props.auth;
    if (!isAuthenticated() || !hasFacilitatorPriviledge()) {
      history.replace('/');
      return false;
    }
    this.setState({ loading: true, loadingError: null });

    const dataPromise = this.props.match.params.id
      ? axiosInstance
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
            this.setState({ ...data });

            return data;
          })
      : Promise.resolve();

    const clientPromise = axiosInstance
      .get('/clients', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`
        }
      })
      .then(res => {
        const data = res.data;

        if (data.length === 0) {
          throw new Error('Please add a client before adding a ride');
        }

        this.setState({ clients: data });

        return data;
      });

    Promise.all([dataPromise, clientPromise])
      .then(([data, clients]) => {
        this.setState({
          loading: false
        });

        const clientId = (data && data.clientId) || clients[0].id;
        this.setNewClient(clientId);
      })
      .catch(e => {
        console.error(e);
        this.setState({
          loading: false,
          loadingError: e
        });
      });
  }

  handleSubmit(e) {
    e.preventDefault();

    //hack remove non-ride props
    let ride = { ...this.state };
    delete ride.clients;
    delete ride.selectedClientId;

    this.setState({
      updating: true,
      updatingError: null
    });

    let promise;
    if (this.props.match.params.id) {
      promise = axiosInstance({
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
      promise = axiosInstance({
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

    promise
      .then(() => {
        this.setState({
          updating: false
        });
      })
      .catch(e => {
        console.error(e);
        this.setState({
          updating: false,
          updatingError: e
        });
      });
  }

  getHeadline() {
    if (this.props.match.params.id) {
      return <h1>Edit ride</h1>;
    }
    return <h1>Create new ride</h1>;
  }

  buttons() {
    if (this.state.updating) {
      return <img alt="loader" className="loader" src="/loader.svg" />;
    } else {
      return (
        <React.Fragment>
          {this.state.updatingError && (
            <span>
              Failed to update: {this.state.updatingError.message}. Please try
              again.
            </span>
          )}
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
        </React.Fragment>
      );
    }
  }

  setNewClient = (clientId, clients = this.state.clients) => {
    const client = clients.find(c => c.id === clientId);
    this.setState({
      selectedClientId: clientId,
      locationFrom: client.locationHome,
      locationTo: client.locationHome,
      carType: client.carType,
      clientId: client.id,
      driverGender: client.driverGender,
      hasMps: client.hasMps
    });
  };

  render() {
    if (this.state.loading) {
      return <img alt="loader" className="loader" src="/loader.svg" />;
    }

    if (this.state.loadingError) {
      return (
        <span>
          Failed to load: {this.state.loadingError.message}. Please try
          refreshing the page.
        </span>
      );
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
                this.setNewClient(clientId);
              }}
              value={this.state.selectedClientId}
              className="custom-select"
            >
              <option disabled={true}>Select from following</option>
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
            <label>Date (all dates and times are in the Sydney timezone)</label>
            <DatePicker
              required
              value={moment.tz(
                this.state.pickupTimeAndDateInUTC || Date.now(),
                'Australia/Sydney'
              )}
              selected={moment.tz(
                this.state.pickupTimeAndDateInUTC || Date.now(),
                'Australia/Sydney'
              )}
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
              <option disabled={true}>Select from following</option>
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
              <option disabled={true}>Select from following</option>
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
          {this.props.match.params.id && (
            <React.Fragment>
              <div className="form-group">
                <label>Status</label>
                <select
                  onChange={e => {
                    this.setState({ status: e.currentTarget.value });
                  }}
                  value={this.state.status}
                  className="custom-select"
                >
                  <option value="OPEN">Open</option>
                  <option value="CONFIRMED" disabled={!this.state.driver}>
                    Confirmed
                  </option>
                  <option value="ENDED" disabled={!this.state.driver}>
                    Ended
                  </option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              {this.state.driver && (
                <div className="form-group">
                  <label>Driver Name</label>
                  <div>{this.state.driver.driver_name}</div>
                </div>
              )}
            </React.Fragment>
          )}
          {this.buttons()}
        </form>
      </React.Fragment>
    );
  }
}

export default CreateNewRide;
