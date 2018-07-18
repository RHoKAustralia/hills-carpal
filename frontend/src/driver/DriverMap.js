import React, { Component } from 'react';
import { Map, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import axios from 'axios';
import bboxArray from '@turf/bbox';
import linestring from 'turf-linestring';
import L from 'leaflet';
import isEqual from 'lodash/isEqual';
import moment from 'moment';
import 'leaflet/dist/leaflet.css';
import './DriverMap.css';

const token =
  'pk.eyJ1Ijoic21hbGxtdWx0aXBsZXMiLCJhIjoiRk4xSUp6OCJ9.GilBdBaV0oKMZgBwBqRMWA';
export const getBoundsFromLngLatArray = latlng => {
  const bounds = bboxArray(linestring(latlng));
  return [[bounds[1], bounds[0]], [bounds[3], bounds[2]]];
};

const rideToDirectionUrl = ride => {
  const from = `${ride.locationFrom.longitude},${ride.locationFrom.latitude}`;
  const to = `${ride.locationTo.longitude},${ride.locationTo.latitude}`;
  return `https://api.mapbox.com/directions/v5/mapbox/driving/${from};${to}.json?access_token=${token}&geometries=geojson`;
};
class DriverMap extends Component {
  constructor() {
    super();
    this.state = {
      directionsById: null,
      driverRoute: null,
    };
  }
  componentDidMount() {
    const directionsP = this.props.rides.map(ride => {
      return axios.get(rideToDirectionUrl(ride)).then(response => {
        return { id: ride.id, directionResponse: response.data };
      });
    });
    Promise.all(directionsP).then(directionsWithId => {
      const directionsGeojsonById = directionsWithId.reduce((acc, val) => {
        acc[val.id] = val.directionResponse.routes[0].geometry;
        return acc;
      }, {});
      this.setState({ directionsGeojsonById });
    });
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.driverCoords, this.props.driverCoords)) {
      return axios
        .get(rideToDirectionUrl(this.props.driverCoords))

        .then(res => {
          this.setState({
            driverRoute: res.data.routes[0].geometry,
            driverRouteKey: res.data.uuid,
          });
        });
    }
  }
  renderMarkers() {
    const { driverCoords, rides } = this.props;
    const allRides = driverCoords ? rides.concat(driverCoords) : rides;
    const markers = allRides.map(ride => {
      const date = ride.pickupTimeAndDateInUTC || ride.pickupTime;
      const popup = (
        <Popup>
          <div>
            <a href={ride.fbLink}>Facebook event</a>
            <p>At: {moment(date).format('dddd hh:mma DD/MM/YYYY ')}</p>
          </div>
        </Popup>
      );
      return [
        <Marker
          key={ride.id + 'from'}
          icon={L.icon({
            iconUrl: '/marker-start.svg',
            iconSize: [18, 23.5], // size of the icon
            iconAnchor: [9, 23.5],
          })}
          position={[ride.locationFrom.latitude, ride.locationFrom.longitude]}
        >
          {popup}
        </Marker>,
        <Marker
          key={ride.id + 'to'}
          icon={L.icon({
            iconUrl: '/marker-end.svg',
            iconSize: [18, 23.5], // size of the icon
            iconAnchor: [9, 23.5],
          })}
          position={[ride.locationTo.latitude, ride.locationTo.longitude]}
        >
          {popup}
        </Marker>,
      ];
    });
    return markers.reduce((acc, val) => acc.concat(val), []);
  }
  renderClientsDirections() {
    const { directionsGeojsonById } = this.state;
    if (!directionsGeojsonById) return;
    return this.props.rides.map(ride => {
      return (
        <GeoJSON
          key={ride.id}
          onEachFeature={(feature, layer) => {
            layer.setStyle({ color: '#6610f2' });
          }}
          data={directionsGeojsonById[ride.id]}
        />
      );
    });
  }
  renderDriverDirections() {
    if (!this.state.driverRoute) return;

    return (
      <GeoJSON
        key={this.state.driverRouteKey}
        onEachFeature={(feature, layer) => {
          layer.setStyle({ color: '#007bff' });
        }}
        data={this.state.driverRoute}
      />
    );
  }
  getBounds() {
    const { driverCoords, rides } = this.props;
    const allRides = driverCoords ? rides.concat(driverCoords) : rides;

    const lnglats = allRides
      .map(ride => {
        return [
          [ride.locationFrom.longitude, ride.locationFrom.latitude],
          [ride.locationTo.longitude, ride.locationTo.latitude],
        ];
      })
      .reduce((acc, val) => acc.concat(val), []);

    // If no lnglats, defaults to Sydney Area
    if (lnglats.length === 0) {
      lnglats.push([151.09901, -33.7049])
      lnglats.push([151.058, -34.0331])
    }

    return getBoundsFromLngLatArray(lnglats);
  }

  renderYourRouteLegendItem() {
    if (!this.state.driverRoute) return;

    return (
      <div className="legend-col">
        <span>Your ride</span>
        <svg width={'40px'} height={'5px'} xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="40px" height="5px" fill={'#007bff'} />
        </svg>
      </div>
    );
  }

  render() {
    return (
      <div>
        <div className="legend-back-btn-row">
          <div className="legend">
            {this.renderYourRouteLegendItem()}
            <div className="legend-col">
              <span>Client rides</span>
              <svg
                width={'40px'}
                height={'5px'}
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="0" y="0" width="40px" height="5px" fill={'#6610f2'} />
              </svg>
            </div>
            <div className="legend-col">
              Start <img src="/marker-start.svg" alt="" />
            </div>
            <div className="legend-col">
              End <img src="/marker-end.svg" alt="" />
            </div>
          </div>
          <button
            className="btn btn-sm btn-secondary"
            onClick={this.props.onViewTableClick}
          >
            View list instead
          </button>
        </div>
        <Map
          style={{ height: '500px' }}
          center={[-24.554411, 133.865766]}
          zoom={5}
          bounds={this.getBounds()}
          useFlyTo={true}
        >
          <TileLayer
            attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {this.renderMarkers()}
          {this.renderClientsDirections()}
          {this.renderDriverDirections()}
        </Map>
      </div>
    );
  }
}

export default DriverMap;
