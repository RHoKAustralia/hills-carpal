import React, { Component } from 'react';

import { Location } from '../../model';
import LocationInput from './location-input';

interface Props {
  clearable: boolean;
  onLocationSearch: (locations: State) => void;
}

interface State {
  locationTo?: Location;
  locationFrom?: Location;
}

class LocationSearch extends Component<Props, State> {
  state: State = {
    locationTo: null,
    locationFrom: null,
  };

  render() {
    return (
      <div>
        <h4 style={{ marginTop: '10px' }}>Search Trips</h4>
        <p>Carpal will then use this trip to find nearby ride requests</p>
        <form
          onSubmit={(e) => {
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
                onChange={(value) => {
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
                onChange={(value) => {
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

export default LocationSearch;
