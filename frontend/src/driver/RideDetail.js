import React from 'react';
import axiosInstance from '../auth/api';
import moment from 'moment';
import { Link } from 'react-router-dom';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import './RideDetail.css';

import history from '../history';

import DriverMap from './DriverMap';

export default class RideDetail extends React.Component {
  state = {
    clientId: null,
    pickupTimeAndDateInUTC: ``,
    locationFrom: {
      latitude: ``,
      longitude: ``,
      suburb: ``,
      placeName: ``,
      postcode: ``
    },
    locationTo: {
      latitude: ``,
      longitude: ``,
      suburb: ``,
      placeName: ``,
      postcode: ``
    },
    driverGender: ``,
    carType: ``,
    status: ``,
    deleted: 0,
    facilitatorId: ``,
    description: ``,
    driver: {
      ride_id: this.props.match.params.rideId,
      driver_id: null,
      email: null,
      confirmed: null,
      updated_at: Date.now()
    },
    loading: false,
    updating: false,
    updateError: null
  };

  componentDidMount() {
    const { isAuthenticated } = this.props.auth;
    if (!isAuthenticated()) {
      history.replace('/');
      return false;
    }

    if (this.props.match.params.rideId) {
      this.setState({
        loading: true
      });

      axiosInstance
        .get('/rides/' + this.props.match.params.rideId, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('id_token')}`
          }
        })
        .then(res => {
          let data = res.data;

          if (data.driver_id) {
            data = Object.assign({}.data, {
              driver_id: data.driver_id,
              email: data.driver_email,
              confirmed: data.confirmed,
              updated_at: data.updated_at,
              ride_id: this.props.match.params.rideId
            });
          }
          this.setState(data);

          return axiosInstance.get('/clients/' + data.clientId + '/images', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('id_token')}`
            }
          });
        })
        .then(res => {
          this.setState({
            images: res.data,
            loading: false
          });
        })
        .catch(e => {
          this.setState({ error: e, loading: false });
          console.error(e);
        });
    }
  }

  acceptRide() {
    this.setState({
      updating: true,
      updateError: null
    });
    axiosInstance
      .put(
        `/rides/${this.state.id}/accept`,
        {
          ...this.state,
          driver: {
            ...this.state.driver,
            driver_id: localStorage.getItem('user_id')
          }
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('id_token')}`
          }
        }
      )
      .then(() => {
        this.setState({ driver: { confirmed: true }, updating: false });
      })
      .catch(e => {
        console.error(e);
        this.setState({ updating: false, updateError: e });
      });
  }

  declineRide() {
    this.setState({
      updating: true,
      updateError: null
    });
    axiosInstance
      .put(`/rides/${this.state.id}/decline`, this.state, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`
        }
      })
      .then(() => {
        this.setState({ driver: { confirmed: false }, updating: false });
      })
      .catch(e => {
        console.error(e);
        this.setState({ updating: false, updateError: e });
      });
  }

  OfferRideButton() {
    return (
      <div className="btn-group" role="group">
        <button
          onClick={this.acceptRide.bind(this)}
          className="btn btn-outline btn-primary"
        >
          Offer a ride
        </button>
      </div>
    );
  }

  RideOfferedButtons() {
    return (
      <div className="btn-group" role="group">
        <button
          onClick={this.declineRide.bind(this)}
          className="card-link btn btn-outline btn-danger"
        >
          Decline
        </button>
        <Link
          to={`/driver/rides/${this.props.match.params.rideId}/poll`}
          className="card-link btn btn-outline btn-success"
        >
          Complete the ride
        </Link>
      </div>
    );
  }

  getImages = () => {
    if (!this.state.images) {
      return [];
    }

    return this.state.images.map(image => ({
      original:
        process.env.REACT_APP_API_URL +
        image.url +
        `?access_token=${localStorage.getItem('id_token')}`,
      description: image.caption
    }));
  };

  render() {
    if (this.state.loading) {
      return <img alt="loader" className="loader" src="/loader.svg" />;
    }

    if (this.state.error) {
      return (
        <span>
          Error: {this.state.error.message}. Please refresh to try again.
        </span>
      );
    }

    return (
      <div>
        <div className="card">
          <div className="card-header">
            <h1>{this.state.client} is asking for a ride</h1>
          </div>
          <div className="card-body">
            <h5 className="card-title">Ride Details</h5>
            <dl>
              <dt>When?</dt>
              <dd>
                {moment(this.state.pickupTimeAndDateInUTC).format(
                  'YYYY-MM-DD hh:mma'
                )}
              </dd>
              <dt>Who?</dt>
              <dd>{this.state.client}</dd>
              <dt>Pickup Address</dt>
              <dd>{this.state.locationFrom.placeName}</dd>
              <dt>Drop Address</dt>
              <dd>{this.state.locationTo.placeName}</dd>
              <dt>Description</dt>
              <dd>{this.state.description}</dd>
            </dl>

            <h5>Directions</h5>
            <DriverMap rides={[this.state]} />

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
                !this.state.driver.confirmed
                  ? this.OfferRideButton()
                  : this.RideOfferedButtons();

              if (this.state.updating) {
                return (
                  <img alt="loader" className="loader" src="/loader.svg" />
                );
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
