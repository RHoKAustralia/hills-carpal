import
  React from 'react';
import axiosInstance from '../auth/api';
import moment from 'moment';
import history from "../history";

export default class RideDetail extends React.Component {

  state = {
    client: ``,
    pickupTimeAndDateInUTC: ``,
    locationFrom: {
      latitude: ``,
      longitude: ``,
      suburb: ``,
      placeName: ``,
      postcode: ``,
    },
    locationTo: {
      latitude: ``,
      longitude: ``,
      suburb: ``,
      placeName: ``,
      postcode: ``,
    },
    driverGender: ``,
    carType: ``,
    status: ``,
    deleted: 0,
    facilitatorId: ``,
    description: ``,
    driver: {
      ride_id:this.props.match.params.rideId,
      email: null,
      confirmed: null,
      updated_at: Date.now()
    }
  };

  componentDidMount() {
    const { isAuthenticated } = this.props.auth;
    if (!isAuthenticated()) {
      history.replace('/');
      return false;
    }

    if (this.props.match.params.rideId) {
      axiosInstance
      .get('/rides/' + this.props.match.params.rideId, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`,
        },
      })
      .then(res => {
        let data = res.data;

        if (data.driver_email) {
          data = Object.assign({}.data, {
            email: data.driver_email,
            confirmed: data.confirmed,
            updated_at: data.updated_at,
            ride_id: this.props.match.params.rideId
          })
        }
        this.setState(data);
      });
    }
  }

  acceptRide() {

    const self = this;
    axiosInstance
    .put(`/rides/${this.state.id}/accept`, this.state, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('id_token')}`
      }
    })
    .then(res => {
      self.setState({driver: {confirmed: true}});
      return res.data;
    });
  }

  declineRide() {
    const self = this;
    axiosInstance
    .put(`/rides/${this.state.id}/decline`, this.state, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('id_token')}`
      }
    })
    .then(res => {
      self.setState({driver: {confirmed: false}});
      return res.data;
    });
  }

  OfferRideButton() {
    return <button onClick={this.acceptRide.bind(this)} className="btn btn-outline btn-primary">Offering a ride</button>
  }


  DeclineRideButton() {
    return <button onClick={this.declineRide.bind(this)} className="btn btn-outline btn-danger">Declining</button>
  }

  render() {
    if (this.props.match.params.rideId && this.state.id === undefined) {
      return <img alt="loader" className="loader" src="/loader.svg" />;
    }

    return (
      <div>
        <div className="card">
          <div className="card-header">
            <h1>{this.state.client} is asking for a ride</h1>
          </div>
          <div className="card-body">
            <h5 className="card-title">Ride details:</h5>
            <dl>
              <dt>When?</dt>
              <dd>{moment(this.state.pickupTimeAndDateInUTC).format('YYYY-MM-DD @ hh:mm')}</dd>
              <dt>Who?</dt>
              <dd>{this.state.client}</dd>
              <dt>Pickup Address</dt>
              <dd>{this.state.locationFrom.placeName}</dd>
              <dt>Drop Address</dt>
              <dd>{this.state.locationTo.placeName}</dd>
              <dt>Ride details:</dt>
              <dd>{this.state.description}</dd>
            </dl>
          </div>
          <div className="card-footer">
            {!this.state.driver.confirmed  ? this.OfferRideButton() : this.DeclineRideButton()}
          </div>
        </div>
      </div>
    );
  }
}
