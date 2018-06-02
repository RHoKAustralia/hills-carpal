import React from 'react';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

class CreateNewRide extends Component {
  constructor() {
    super();
    this.state = {
      client: '',
      // todo more fields
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
        <label> Client</label>
        <input
          onChange={e => this.setState({ client: e.currentTarget.value })}
          type="text"
          name="client"
        />

        <label>Date</label>
        {/* https://github.com/Hacker0x01/react-datepicker inlcude this one maybe */}
        {/* Add more fields  */}
      </form>
    );
  }
}

CreateNewRide.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default CreateNewRide;
