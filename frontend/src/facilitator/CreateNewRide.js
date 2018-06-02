import React, { Component } from "react";
import PropTypes from "prop-types";
import DatePicker from "react-datepicker";
import moment from "moment";
import "react-datepicker/dist/react-datepicker.css";
class CreateNewRide extends Component {
  constructor() {
    super();
    this.state = {
      client: "",
      // todo more fields
      datetime: moment()
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    this.onSubmit(this.state);
  }
  render() {
    return (
      <form onSubmit={e => this.handleSubmit(this.state)}>
        <div class="form-group">
          <label>Client</label>
          <input
            onChange={e => this.setState({ client: e.currentTarget.value })}
            type="text"
            name="client"
          />
        </div>
        <div class="form-group">
          <label>Date</label>
          {/* https://github.com/Hacker0x01/react-datepicker inlcude this one maybe */}
          {/* Add more fields  */}
          <DatePicker
            selected={this.state.datetime}
            onChange={date => this.setState({ datetime: date })}
          />;
        </div>
        <div class="form-group">
          <label>Location from</label>
          <input
            onChange={e =>
              this.setState({ locationFrom: e.currentTarget.value })
            }
            type="text"
            name="locationFrom"
          />
        </div>
        <div class="form-group">
          <label>Location to</label>
          <input
            onChange={e => this.setState({ locationTo: e.currentTarget.value })}
            type="text"
            name="locationTo"
          />
        </div>
        <div class="form-group">
          <label>Facebook link</label>
          <input
            onChange={e => this.setState({ fbLink: e.currentTarget.value })}
            type="text"
            name="fbLink"
          />
        </div>
        <div class="form-group">
          <label>Driver Gender</label>
          <input
            onChange={e =>
              this.setState({ driverGender: e.currentTarget.value })
            }
            type="text"
            name="driverGender"
          />
        </div>
        <label />
      </form>
    );
  }
}

CreateNewRide.propTypes = {
  onSubmit: PropTypes.func.isRequired
};

export default CreateNewRide;
