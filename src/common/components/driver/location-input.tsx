import debounce from 'debounce-promise';
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
  disabled?: boolean;
}

class LocationInput extends Component<Props> {
  getOptions = debounce(
    (text) => {
      if (!text || text.length < 2) {
        return Promise.resolve([]);
      }
      const url = getUrl(text);
      return fetch(url)
        .then((res) => res.json())
        .then((data) => {
          const options = data.features.map((x) => {
            return {
              label: LocationInput.getPlaceName(x),
              value: x,
            };
          });

          return options;
        })
        .catch((e) => {
          console.error(e);
          throw e;
        });
    },
    200,
    {
      leading: true,
    }
  );

  filterOptions(options) {
    return options;
  }

  /**
   * Mapbox api gives back a context array.
   * This is a bit weird format so we use this helper function to grab the value we want.
   */
  static getValueFromContext = (key: string, value: any) => {
    const valueObj = value.context.find((x) => {
      return x.id.includes(key);
    });
    return valueObj ? valueObj.text : null;
  };

  static getPlaceName = (value: any) => {
    return value.place_type.length > 0 && value.place_type[0] === 'poi'
      ? value.place_name.replace(
          LocationInput.getValueFromContext('place', value),
          LocationInput.getValueFromContext('locality', value)
        )
      : value.place_name;
  };

  handleChange = (option) => {
    if (!option) return;
    const value = option.value;

    this.props.onChange({
      placeName: LocationInput.getPlaceName(value),
      longitude: value.center[0],
      latitude: value.center[1],
      postCode: LocationInput.getValueFromContext('postcode', value),
      suburb: LocationInput.getValueFromContext('suburb', value),
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
        isDisabled={this.props.disabled}
      />
    );
  }
}

export default LocationInput;
