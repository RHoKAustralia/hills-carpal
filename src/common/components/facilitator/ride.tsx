import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment-timezone';
import router from 'next/router';
import Link from 'next/link';

import LocationInput from '../driver/location-input';
import auth, {
  AuthContext,
  hasFacilitatorPrivilege,
} from '../../../client/auth';

import './Ride.css';
import { Location, RideDriver, Ride as ModelRide } from '../../model';
import Client from '../../../../pages/facilitator/clients';
import redirectIfNoRole from '../../redirect-if-no-role';

interface Props {
  id?: number;
}

interface State {
  clientId: null | string;
  pickupTimeAndDate: Date;
  driverGender: string;
  locationTo: Location;
  locationFrom: Location;
  carType: string;
  description: string;
  status: string | null;
  driver: RideDriver | null;
  hasMps: boolean;
  clients: Client[];
  selectedClientId: number;
  loading: boolean;
  loadingError: Error | null;
  updating: boolean;
  updatingError: Error | null;
}

class Ride extends Component<Props, State> {
  static contextType = AuthContext;
  context!: React.ContextType<typeof AuthContext>;

  state = {
    clientId: null,
    pickupTimeAndDate: moment().tz('Australia/Sydney').toDate(),
    driverGender: '',
    locationTo: undefined,
    locationFrom: undefined,
    carType: '',
    description: '',
    status: 'OPEN',
    driver: null,
    hasMps: false,
    clients: [],
    selectedClientId: -1,
    loading: false,
    loadingError: null,
    updating: false,
    updatingError: null,
  };

  static getInitialProps({ query }) {
    return {
      id: query.id && Number.parseInt(query.id),
    };
  }

  async componentDidMount() {
    redirectIfNoRole(this.context, 'facilitator');

    this.setState({ loading: true, loadingError: null });

    const ridePromise = (async () => {
      if (this.props.id) {
        const res = await fetch('/api/rides/' + this.props.id, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('id_token')}`,
          },
        });

        if (!res.ok) {
          throw new Error('Bad response when getting rides');
        }

        const data = await res.json();
        const client = this.state.clients.find((c) => c.name === data.client);
        let clientId = -1;
        if (client) {
          clientId = client.id;
        }
        data.selectedClientId = clientId;
        this.setState({
          ...data,
          pickupTimeAndDate: moment.tz(
            data.pickupTimeAndDate,
            'Australia/Sydney'
          ),
        });

        return data;
      }
    })();

    const clientPromise = (async () => {
      const res = await fetch('/api/clients', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`,
        },
      });

      if (!res.ok) {
        throw new Error('Bad response when getting clients');
      }

      const data = await res.json();

      if (data.length === 0) {
        throw new Error('Please add a client before adding a ride');
      }

      this.setState({ clients: data });

      return data;
    })();

    Promise.all([ridePromise, clientPromise])
      .then(([data, clients]) => {
        this.setState({
          loading: false,
        });

        const clientId = (data && data.client.id) || clients[0].id;
        const client = clients.find((c) => c.id === clientId);

        this.setState((state: State) => ({
          selectedClientId: clientId,
          locationFrom: state.locationFrom || client.locationHome,
          locationTo: state.locationTo || client.locationHome,
          carType: state.carType || client.carType,
          clientId: clientId,
          driverGender: state.driverGender || client.driverGender,
          hasMps: state.hasMps || client.hasMps,
        }));
      })
      .catch((e) => {
        console.error(e);
        this.setState({
          loading: false,
          loadingError: e,
        });
      });
  }

  handleSubmit = (e) => {
    e.preventDefault();

    //hack remove non-ride props
    const rideFromState = { ...this.state };
    delete rideFromState.clients;
    delete rideFromState.selectedClientId;

    this.setState({
      updating: true,
      updatingError: null,
    });

    let promise;
    if (this.props.id) {
      promise = fetch('/api/rides/' + this.props.id, {
        method: 'put',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rideFromState),
      }).then((res) => {
        if (res.ok) {
          router.push('/facilitator');
        } else {
          this.setState({
            updatingError: new Error('Could not update'),
          });
        }
      });
    } else {
      promise = fetch('/api/rides', {
        method: 'post',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rideFromState),
      }).then((res) => {
        if (res.ok) {
          router.push('/facilitator');
        } else {
          this.setState({
            updatingError: new Error('Could not update'),
          });
        }
      });
    }

    promise
      .then(() => {
        this.setState({
          updating: false,
        });
      })
      .catch((e) => {
        console.error(e);
        this.setState({
          updating: false,
          updatingError: e,
        });
      });
  };

  getHeadline() {
    if (this.props.id) {
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
            <Link href={'/facilitator'}>
              <a className="btn btn-secondary">Back</a>
            </Link>
          </div>
        </React.Fragment>
      );
    }
  }

  setNewClient = (clientId, clients = this.state.clients) => {
    const client = clients.find((c) => c.id === clientId);
    this.setState((state: State) => ({
      selectedClientId: clientId,
      locationFrom: state.locationFrom || client.locationHome,
      locationTo: state.locationTo || client.locationHome,
      carType: client.carType,
      clientId: client.id,
      driverGender: client.driverGender,
      hasMps: client.hasMps,
    }));
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
              onChange={(e) => {
                const clientId = parseInt(e.currentTarget.value, 10);
                this.setNewClient(clientId);
              }}
              value={this.state.selectedClientId}
              className="custom-select"
            >
              <option disabled={true}>Select from following</option>
              {this.state.clients.map((c) => {
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
              value={moment
                .tz(
                  this.state.pickupTimeAndDate || Date.now(),
                  'Australia/Sydney'
                )
                .format('LLL')}
              selected={moment
                .tz(
                  this.state.pickupTimeAndDate || Date.now(),
                  'Australia/Sydney'
                )
                .toDate()}
              onChange={(date) =>
                this.setState({ pickupTimeAndDate: date as Date })
              }
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
              onChange={(value) => {
                this.setState({ locationFrom: value });
              }}
            />
          </div>
          <div className="form-group">
            <label>Location to</label>
            <LocationInput
              required={true}
              value={this.state.locationTo}
              onChange={(value) => {
                this.setState({ locationTo: value });
              }}
            />
          </div>
          <div className="form-group">
            <label>Driver Gender</label>
            <select
              required
              onChange={(e) => {
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
              onChange={(e) => {
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
              onChange={(e) => {
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
              onChange={(e) => {
                this.setState({ description: e.target.value });
              }}
              rows={5}
              maxLength={1024}
              className="form-control"
              value={this.state.description}
            />
          </div>
          {this.props.id && (
            <React.Fragment>
              <div className="form-group">
                <label>Status</label>
                <select
                  onChange={(e) => {
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
                  <div>{this.state.driver.name}</div>
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

export default Ride;
