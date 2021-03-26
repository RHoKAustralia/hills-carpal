import React from 'react';
import moment from 'moment-timezone';
import ImageGallery from 'react-image-gallery';
import Link from 'next/link';

import DriverMap from '../../../../src/common/components/driver/driver-map';
import { AuthContext } from '../../../../src/client/auth';

import 'react-image-gallery/styles/css/image-gallery.css';
import '../../../../src/common/components/driver/ride-detail.css';
import { Ride, Image } from '../../../../src/common/model';
import isAuthedWithRole from '../../../../src/common/redirect-if-no-role';
import isRideInPast from '../../../../src/common/util';

interface Props {
  rideId: string;
}

interface State {
  ride?: Ride;
  clientImages?: Image[];
  loading: boolean;
  updating: boolean;
  updateError?: Error;
  error?: Error;
}

export default class RideDetail extends React.Component<Props, State> {
  static contextType = AuthContext;
  context!: React.ContextType<typeof AuthContext>;

  state: State = {
    loading: true,
    updating: false,
    error: null,
    updateError: null,
  };

  static getInitialProps({ query }) {
    return {
      rideId: query.rideId && Number.parseInt(query.rideId),
    };
  }

  async componentDidMount() {
    if (!isAuthedWithRole(this.context, 'driver')) {
      return;
    }

    if (this.props.rideId) {
      this.setState({
        loading: true,
        error: null,
      });

      try {
        const ridesRes = await fetch('/api/rides/' + this.props.rideId, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('id_token')}`,
          },
        });

        if (!ridesRes.ok) {
          throw new Error(
            `Got status ${ridesRes.status} from /api/rides/${this.props.rideId}`
          );
        }
        const data: Ride = await ridesRes.json();

        this.setDriverState(data);

        const clientImagesRes = await fetch(
          '/api/clients/' + data.client.id + '/images',
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('id_token')}`,
            },
          }
        );

        if (!clientImagesRes.ok) {
          throw new Error(
            `Got status ${clientImagesRes.status} from /clients/${data.client.id}/images`
          );
        }

        this.setState({
          loading: false,
          clientImages: await clientImagesRes.json(),
        });
      } catch (e) {
        this.setState({ error: e, loading: false });
        console.error(e);
      }
    }
  }

  setDriverState = (data: Ride) => {
    this.setState({
      ride: data,
    });
  };

  async acceptRide() {
    if (!confirm('Are you sure you want to provide this ride?')) {
      return;
    }

    this.setState({
      updating: true,
      updateError: null,
    });

    try {
      const res = await fetch(`/api/rides/${this.props.rideId}/accept`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`,
        },
        body: JSON.stringify({
          ...this.state,
          driver: {
            ...this.state.ride.driver,
            driver_id: localStorage.getItem('user_id'),
          },
        }),
      });

      if (!res.ok) {
        throw new Error(
          `PUT /api/rides/${this.props.rideId}/accept got status ${res.status}`
        );
      }

      this.setDriverState(await res.json());
      this.setState({ updating: false });
    } catch (e) {
      console.error(e);
      this.setState({ updating: false, updateError: e });
    }
  }

  async declineRide() {
    this.setState({
      updating: true,
      updateError: null,
    });

    try {
      const res = await fetch(`/api/rides/${this.props.rideId}/decline`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`,
        },
      });

      if (!res.ok) {
        throw new Error(
          `PUT /api/rides/${this.props.rideId}/decline got status ${res.status}`
        );
      }

      this.setDriverState(await res.json());
      this.setState({ updating: false });
    } catch (e) {
      console.error(e);
      this.setState({ updating: false, updateError: e });
    }
  }

  offerRideButton() {
    return (
      <div className="btn-group" role="group">
        {isRideInPast(this.state.ride) ? (
          <div>
            A ride can't be offered because this ride's date was in the past.
          </div>
        ) : (
          <button
            onClick={this.acceptRide.bind(this)}
            className="btn btn-outline btn-primary"
          >
            Offer a ride
          </button>
        )}
      </div>
    );
  }

  rideOfferedButtons() {
    return this.state.ride.driver.id === this.context.authState.userId ? (
      <div className="btn-group" role="group">
        {!isRideInPast(this.state.ride) && (
          <button
            onClick={this.declineRide.bind(this)}
            className="card-link btn btn-outline btn-danger"
          >
            Decline
          </button>
        )}
        <Link href={`/driver/rides/${this.props.rideId}/poll`}>
          <a className="card-link btn btn-outline btn-success">
            Complete the ride
          </a>
        </Link>
      </div>
    ) : (
      <div>
        This ride has already been offered by {this.state.ride.driver.name}!
      </div>
    );
  }

  getImages = () => {
    if (!this.state.clientImages) {
      return [];
    }

    return this.state.clientImages.map((image) => ({
      original: `/api/images/${image.id}?access_token=${localStorage.getItem(
        'id_token'
      )}`,
      description: image.caption,
    }));
  };

  render() {
    if (this.state.loading) {
      return <img alt="loader" className="loader" src="/loader.svg" />;
    }

    if (this.state.error) {
      return (
        <span>
          Error: {this.state.error?.message}. Please refresh to try again.
        </span>
      );
    }

    return (
      <div>
        <div className="card">
          <div className="card-header">
            <h1>{this.state.ride.client.name} is asking for a ride</h1>
          </div>
          <div className="card-body">
            <h5 className="card-title">Ride Details</h5>
            <dl>
              <dt>When?</dt>
              <dd>
                {moment
                  .tz(this.state.ride.pickupTimeAndDate, process.env.TIMEZONE)
                  .format(process.env.DATE_FORMAT)}
              </dd>
              <dt>Client Name</dt>
              <dd>{this.state.ride.client.name}</dd>
              <dt>Client Phone Number</dt>
              <dd>{this.state.ride.client.phoneNumber}</dd>
              <dt>Client Has Mobility Parking Sticker?</dt>
              <dd>{this.state.ride.client.hasMps ? 'Yes' : 'No'}</dd>
              <dt>Preferred Driver Gender</dt>
              <dd className="title-case">
                {this.state.ride.client.preferredDriverGender}
              </dd>
              <dt>Preferred Car Type</dt>
              <dd>
                {this.state.ride.client.preferredCarType === 'noSUV'
                  ? 'No SUVs please'
                  : 'n/a'}
              </dd>
              <dt>Pickup Address</dt>
              <dd>{this.state.ride.locationFrom.placeName}</dd>
              <dt>Drop Address</dt>
              <dd>{this.state.ride.locationTo.placeName}</dd>
              <dt>Facilitator Email</dt>
              <dd>{this.state.ride.facilitatorEmail}</dd>
              <dt>Client Description</dt>
              <dd>{this.state.ride.client.clientDescription}</dd>
              <dt>Ride Description</dt>
              <dd>{this.state.ride.description}</dd>
            </dl>

            <h5>Directions</h5>
            <DriverMap rides={[this.state.ride]} />

            <h5>Images</h5>
            <div className="ride-detail__image-gallery">
              <ImageGallery
                items={this.getImages()}
                showThumbnails={false}
                useBrowserFullscreen={false}
              />
            </div>
          </div>
          <div className="card-footer ride-detail__footer">
            {(() => {
              const buttons = () =>
                this.state.ride.driver && this.state.ride.driver.confirmed
                  ? this.rideOfferedButtons()
                  : this.offerRideButton();

              if (this.state.updating) {
                return (
                  <img alt="loader" className="loader" src="/loader.svg" />
                );
              } else if (this.state.ride.status === 'ENDED') {
                return <div>This ride has already been marked as complete</div>;
              } else if (this.state.updateError) {
                return (
                  <React.Fragment>
                    <div>
                      Error: {this.state.updateError.message}. Please try again!
                    </div>
                    {buttons()}
                  </React.Fragment>
                );
              } else {
                return buttons();
              }
            })()}
          </div>
        </div>
      </div>
    );
  }
}
