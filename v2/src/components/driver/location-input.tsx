import React, { Component } from 'react';
import Async from 'react-select/async';
import { Location } from '../../model';
// import 'react-select/dist/react-select.css';

// New south wales coordinates
const bbox = [143, -38, 154, -28];
// TODO create a mapbox account to get a token
const token =
  'pk.eyJ1Ijoic21hbGxtdWx0aXBsZXMiLCJhIjoiRk4xSUp6OCJ9.GilBdBaV0oKMZgBwBqRMWA';
const baseUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/{text}.json?country=au&bbox=${bbox}&access_token=${token}`;
const getUrl = (text) => {
  return baseUrl.replace('{text}', text.replace(/\s/g, '+'));
};

interface Props {
  onChange: (location: Location) => void;
  value: Location;
  required?: boolean;
  clearable?: boolean;
}

class LocationInput extends Component<Props> {
  getOptions(text) {
    if (!text || text.length < 2) {
      return Promise.resolve([]);
    }
    const url = getUrl(text);
    return fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const options = data.features.map((x) => {
          return {
            label: x.place_name,
            value: x,
          };
        });
        
        return options;
      })
      .catch((e) => {
        console.error(e);
        throw e;
      });
  }
  filterOptions(options) {
    return options;
  }
  handleChange = (option) => {
    if (!option) return;
    const value = option.value;
    // Mapbox api gives back a context array.
    // This is a bit weird format so we use this helper function to grab the value we want.
    const getValueFromContext = (key) => {
      const valueObj = value.context.find((x) => {
        return x.id.includes(key);
      });
      return valueObj ? valueObj.text : null;
    };
    this.props.onChange({
      placeName: value.place_name,
      longitude: value.center[0],
      latitude: value.center[1],
      postCode: getValueFromContext('postcode'),
      suburb: getValueFromContext('suburb'),
    });
  };
  getValue() {
    const { value } = this.props;
    if (!value) return '';
    return { value, label: value.placeName };
  }
  render() {
    return (
      <Async
        loadOptions={this.getOptions}
        value={this.getValue()}
        onChange={this.handleChange}
        required={this.props.required}
        clearable={this.props.clearable}
        placeholder={'Type your address, suburb or postcode'}
        filterOptions={(x) => x} // The mapbox api does the filtering for us
      />
    );
  }
}

export default LocationInput;
