import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment-timezone';
import router from 'next/router';
import Link from 'next/link';

import LocationInput from '../driver/location-input';
import { AuthContext } from '../../../client/auth';

import './Ride.css';
import {
  Location,
  RideDriver,
  Ride as ModelRide,
  Gender,
  CarType,
  Client,
  RideStatus,
  RideInput,
} from '../../model';
import isAuthedWithRole from '../../redirect-if-no-role';

interface Props {
  id?: number;
  duplicate?: number;
}

interface State {
  clientId: null | number;
  pickupTimeAndDate: Date;
  locationTo: Location;
  locationFrom: Location;
  description: string;
  status: RideStatus | null;
  driver: RideDriver | null;
  clients: Client[];
  selectedClientId: number;
  loading: boolean;
  loadingError: Error | null;
  updating: boolean;
  updatingError: Error | null;
  originalRideState?: ModelRide;
  rideCreatedTimeAndDate: Date;
}

const blankState: State = {
  clientId: null,
  pickupTimeAndDate: moment().tz(process.env.TIMEZONE).toDate(),
  locationTo: undefined,
  locationFrom: undefined,
  description: '',
  status: 'OPEN',
  driver: null,
  clients: [],
  selectedClientId: -1,
  loading: false,
  loadingError: null,
  updating: false,
  updatingError: null,
  originalRideState: undefined,
  rideCreatedTimeAndDate: moment().tz(process.env.TIMEZONE).toDate(),
};
class Ride extends Component<Props, State> {
  static contextType = AuthContext;
  context!: React.ContextType<typeof AuthContext>;

  state: State = blankState;

  static getInitialProps({ query }) {
    return {
      id: query.id && Number.parseInt(query.id),
      duplicate: query.duplicate && Number.parseInt(query.duplicate),
    };
  }

  async componentDidUpdate(
    prevProps: Readonly<Props>,
    prevState: Readonly<State>,
    snapshot?: any
  ) {
    if (this.props.id !== prevProps.id) {
      this.fetchData();
    }
  }

  async componentDidMount() {
    if (!isAuthedWithRole(this.context, 'facilitator')) {
      return;
    }

    this.fetchData();
  }

  async fetchData() {
    this.setState({ loading: true, loadingError: null });

    const ridePromise = (async () => {
      if (this.props.id) {
        const data = await this.fetchRide(this.props.id);

        this.setState({
          clientId: data.client.id,
          pickupTimeAndDate: moment
            .tz(data.pickupTimeAndDate, process.env.TIMEZONE)
            .toDate(),
          locationTo: data.locationTo,
          locationFrom: data.locationFrom,
          description: data.description,
          status: data.status,
          driver: data.driver,
          selectedClientId: data.client.id,
          originalRideState: data,
          rideCreatedTimeAndDate: moment().tz(process.env.TIMEZONE).toDate(),
        });

        return data;
      } else if (this.props.duplicate) {
        const data = await this.fetchRide(this.props.duplicate);

        this.setState({
          clientId: data.client.id,
          pickupTimeAndDate: moment().tz(process.env.TIMEZONE).toDate(),
          locationTo: data.locationTo,
          locationFrom: data.locationFrom,
          description: data.description,
          status: data.status,
          driver: null,
          selectedClientId: data.client.id,
          originalRideState: undefined,
          rideCreatedTimeAndDate: moment().tz(process.env.TIMEZONE).toDate(),
        });
      } else {
        this.setState(blankState);
        return {};
      }
    })();

    const clientPromise = (async () => {
      const res = await fetch('/api/clients?inactive=false', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`
          

        },
        
  
      });

      if (!res.ok) {
        throw new Error('Bad response when getting clients');
      }

      const data = await res.json();


     

      this.setState({ clients: data });
      console.log(data)
      // Get the client's address to pre-populate even if no client has been selected (e.g. new ride)
      // in this case we treat it as if the first client had been selected.
      if (data.length) {
        this.setNewClient(data[0].id, data);
      }

      return data;
    })();

    Promise.all([ridePromise, clientPromise])
      .then(([data, clients]) => {
        this.setState({
          loading: false,
        });

        const clientId = this.state.clientId || clients[0].id;
        const client = clients.find((c) => c.id === clientId);

        this.setState((state: State) => ({
          selectedClientId: clientId,
          locationFrom: state.locationFrom || client.locationHome,
          locationTo: state.locationTo || client.locationHome,
          clientId: clientId,
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

    const rideFromState: Partial<RideInput> = {
      clientId: this.state.clientId,
      status: this.state.status,
      description: this.state.description,
      driver: this.state.driver,
      locationFrom: this.state.locationFrom,
      locationTo: this.state.locationTo,
      pickupTimeAndDate: this.state.pickupTimeAndDate.toISOString(),
    };

    this.setState({
      updating: true,
      updatingError: null,
    });

    let promise;
    if (this.props.id) {
      delete rideFromState.rideCreatedTimeAndDate;
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

  private async fetchRide(rideId: number): Promise<ModelRide> {
    const res = await fetch('/api/rides/' + rideId, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('id_token')}`,
      },
    });

    if (!res.ok) {
      throw new Error('Bad response when getting rides');
    }

    const data = await res.json();

    return data;
  }

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
            {this.props.id ? (
              <Link
                href={`/facilitator/rides/create?duplicate=${this.props.id}`}
              >
                <a className="btn btn-secondary">Duplicate</a>
              </Link>
            ) : (
              <button className="btn btn-secondary" disabled={true}>
                Duplicate
              </button>
            )}
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
    const newClient = clients.find((c) => c.id === clientId);
    this.setState((oldState: State) => {
      const oldClient = clients.find((c) => c.id === oldState.selectedClientId);
      return {
        selectedClientId: clientId,
        locationFrom:
          oldState.locationFrom?.id === oldClient?.homeLocation?.id
            ? newClient.homeLocation
            : oldState.locationFrom,
        locationTo:
          oldState.locationTo?.id === oldClient?.homeLocation?.id
            ? newClient.homeLocation
            : oldState.locationTo,
        clientId: newClient.id,
      };
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

    const dateInFuture = moment(this.state.pickupTimeAndDate).isAfter(
      moment.now()
    );
    const cannotReopen =
      !dateInFuture && this.state.originalRideState?.status === 'CANCELLED';
    const disabled =
      this.state.originalRideState &&
      this.state.originalRideState.status !== 'OPEN';

    return (
      <React.Fragment>
        {this.getHeadline()}
        <form onSubmit={this.handleSubmit}>
          {disabled && (
            <p className="alert alert-warning" role="alert">
              This ride can't be edited because the status is{' '}
              {this.state.originalRideState?.status}
            </p>
          )}
          <div className="form-group">
            <label>Client</label>
            <select
              disabled={disabled}
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
              minDate={new Date()}
              disabled={disabled}
              value={moment
                .tz(
                  this.state.pickupTimeAndDate || Date.now(),
                  process.env.TIMEZONE
                )
                .format('LLL')}
              selected={moment
                .tz(
                  this.state.pickupTimeAndDate || Date.now(),
                  process.env.TIMEZONE
                )
                .toDate()}
              onChange={(date: Date) =>
                this.setState((state) => {
                  const wasCancelled =
                    state.originalRideState?.status === 'CANCELLED';
                  const isInPast = date.valueOf() <= new Date().valueOf();
                  return {
                    status:
                      isInPast && wasCancelled ? 'CANCELLED' : state.status,
                    pickupTimeAndDate: date,
                  };
                })
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
              disabled={disabled}
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
              disabled={disabled}
              required={true}
              value={this.state.locationTo}
              onChange={(value) => {
                this.setState({ locationTo: value });
              }}
            />
          </div>
          <div className="form-group">
            <label>Ride Description</label>

            <textarea
              disabled={disabled}
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
                    this.setState({
                      status: e.currentTarget.value as RideStatus,
                    });
                  }}
                  value={this.state.status}
                  className="custom-select"
                >
                  <option value="OPEN" disabled={cannotReopen}>
                    Open
                  </option>
                  <option
                    value="CONFIRMED"
                    disabled={!this.state.driver || cannotReopen}
                  >
                    Confirmed
                  </option>
                  <option
                    value="ENDED"
                    disabled={!this.state.driver || cannotReopen}
                  >
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
