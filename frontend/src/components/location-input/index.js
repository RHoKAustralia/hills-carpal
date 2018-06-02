import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Async } from 'react-select';
import 'react-select/dist/react-select.css';

// New south wales coordinates
const bbox = [143, -38, 154, -28];
const token =
  'pk.eyJ1Ijoic21hbGxtdWx0aXBsZXMiLCJhIjoiRk4xSUp6OCJ9.GilBdBaV0oKMZgBwBqRMWA';
const baseUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/{text}.json?country=au&bbox=${bbox}&access_token=${token}`;
const getUrl = text => {
  return baseUrl.replace('{text}', text.replace(/\s/g, '+'));
};

class LocationInput extends Component {
  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
  }
  getOptions(text) {
    if (!text || text.length < 2) {
      return Promise.resolve({ options: [] });
    }
    const url = getUrl(text);
    return axios.get(url).then(response => {
      const options = response.data.features.map(x => {
        return {
          label: x.place_name,
          value: x,
        };
      });
      console.log(options);
      return { options };
    });
  }
  filterOptions(options) {
    return options;
  }
  handleChange(option) {
    if (!option) return;
    const value = option.value;
    // Mapbox api gives back a context array.
    // This is a bit weird format so we use this helper function to grab the value we want.
    const getValueFromContext = key => {
      const valueObj = value.context.find(x => {
        return x.id.includes(key);
      });
      return valueObj ? valueObj.text : null;
    };
    this.props.onChange({
      placeName: value.place_name,
      longitude: value.center[0],
      latitude: value.center[1],
      postcode: getValueFromContext('postcode'),
      suburb: getValueFromContext('suburb'),
    });
  }
  render() {
    return (
      <Async
        loadOptions={this.getOptions}
        value={this.props.value || ''}
        onChange={this.handleChange}
        placeholder={'Type your address, suburb or postcode'}
        filterOptions={x => x} // The mapbox api does the filtering for us
      />
    );
  }
}

LocationInput.propTypes = {
  onChange: PropTypes.func.isRequired,
};

export default LocationInput;
