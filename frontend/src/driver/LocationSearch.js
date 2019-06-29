import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LocationInput from '../components/location-input';
class LocationSearch extends Component {
  constructor() {
    super();
    this.state = {
      locationTo: '',
      locationFrom: ''
    };
  }
  render() {
    return (
      <div>
        <h4 style={{ marginTop: '10px' }}>Search Trips</h4>
        <p>Carpal will then use this trip to find nearby ride requests</p>
        <form
          onSubmit={e => {
            e.preventDefault();
            this.props.onLocationSearch(this.state);
          }}
        >
          <div className="row">
            <div className="form-group col-12 col-sm-6">
              <label>Driving from:</label>
              <LocationInput
                required={true}
                clearable={this.props.clearable}
                value={this.state.locationFrom}
                onChange={value => {
                  this.setState({ locationFrom: value });
                }}
              />
            </div>
            <div className="form-group col-12 col-sm-6">
              <label>to:</label>
              <LocationInput
                clearable={this.props.clearable}
                required={true}
                value={this.state.locationTo}
                onChange={value => {
                  this.setState({ locationTo: value });
                }}
              />
            </div>
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
  clearable: PropTypes.bool
};

export default LocationSearch;
