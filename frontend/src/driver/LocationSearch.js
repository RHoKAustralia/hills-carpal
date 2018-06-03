import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LocationInput from '../components/location-input';
class LocationSearch extends Component {
  constructor() {
    super();
    this.state = {
      locationTo: '',
      locationFrom: '',
    };
  }
  render() {
    return (
      <div>
        <h2> Search location around your route</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            this.props.onLocationSearch(this.state);
          }}
        >
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
          <button className="btn btn-primary" type="submit">
            Search
          </button>
        </form>
      </div>
    );
  }
}

LocationSearch.propTypes = {
  onLocationSearch: PropTypes.func.isRequired,
};

export default LocationSearch;
