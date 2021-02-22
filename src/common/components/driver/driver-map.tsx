import React, { Component } from 'react';
import bboxArray from '@turf/bbox';
import linestring from 'turf-linestring';
import isEqual from 'lodash/isEqual';
import moment from 'moment-timezone';
import Head from 'next/head';

import { Ride } from '../../model';

import './driver-map.css';

const token =
  'pk.eyJ1Ijoic21hbGxtdWx0aXBsZXMiLCJhIjoiRk4xSUp6OCJ9.GilBdBaV0oKMZgBwBqRMWA';
export const getBoundsFromLngLatArray = (latlng: number[][]) => {
  const bounds = bboxArray(linestring(latlng));
  return [
    [bounds[1], bounds[0]],
    [bounds[3], bounds[2]],
  ] as [[number, number], [number, number]];
};

const rideToDirectionUrl = (ride) => {
  const from = `${ride.locationFrom.longitude},${ride.locationFrom.latitude}`;
  const to = `${ride.locationTo.longitude},${ride.locationTo.latitude}`;
  return `https://api.mapbox.com/directions/v5/mapbox/driving/${from};${to}.json?access_token=${token}&geometries=geojson`;
};

interface Props {
  rides: Ride[];
  driverCoords?: any;
  onViewTableClick?: () => void;
}

class DriverMap extends Component<Props> {
  L: any;
  ReactLeaflet: any;

  state = {
    directionsById: null,
    driverRoute: null,
    directionsGeojsonById: null,
    driverRouteKey: null,
  };

  async componentDidMount() {
    this.L = await import('leaflet');
    this.ReactLeaflet = await import('react-leaflet');

    const directionsP = this.props.rides.map((ride) => {
      return fetch(rideToDirectionUrl(ride))
        .then((response) => {
          if (response.status === 200) {
            return response.json();
          } else {
            throw new Error('Failed to get directions');
          }
        })
        .then((data) => {
          return { id: ride.id, directionResponse: data };
        });
    });

    Promise.all(directionsP)
      .then((directionsWithId) => {
        const directionsGeojsonById = directionsWithId.reduce((acc, val) => {
          acc[val.id] = val.directionResponse.routes[0].geometry;
          return acc;
        }, {});

        this.setState({ directionsGeojsonById });
      })
      .catch(() => {
        // eh
      });
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.driverCoords, this.props.driverCoords)) {
      return fetch(rideToDirectionUrl(this.props.driverCoords))
        .then((res) => {
          if (res.status === 200) {
            return res.json();
          } else {
            throw new Error('Could not get directions');
          }
        })
        .then((data: any) => {
          this.setState({
            driverRoute: data.routes[0].geometry,
            driverRouteKey: data.uuid,
          });
        });
    }
  }
  renderMarkers() {
    const { driverCoords, rides } = this.props;
    const allRides = driverCoords ? rides.concat(driverCoords) : rides;
    const markers = allRides.map((ride) => {
      const date = ride.pickupTimeAndDate;
      const popup = (
        <this.ReactLeaflet.Popup>
          <div>
            <p>
              At:{' '}
              {moment
                .tz(date, process.env.TIMEZONE)
                .format('dddd hh:mma DD/MM/YYYY ')}
            </p>
          </div>
        </this.ReactLeaflet.Popup>
      );
      // console.log(ride.locationTo);
      return [
        <this.ReactLeaflet.Marker
          key={ride.id + 'from'}
          icon={this.L.icon({
            iconUrl: '/leaflet/marker-start.svg',
            iconSize: [18, 23.5], // size of the icon
            iconAnchor: [9, 23.5],
          })}
          position={this.L.latLng(
            ride.locationFrom.latitude,
            ride.locationFrom.longitude
          )}
        >
          {popup}
        </this.ReactLeaflet.Marker>,
        <this.ReactLeaflet.Marker
          key={ride.id + 'to'}
          icon={this.L.icon({
            iconUrl: '/leaflet/marker-end.svg',
            iconSize: [18, 23.5], // size of the icon
            iconAnchor: [9, 23.5],
          })}
          position={this.L.latLng(
            ride.locationTo.latitude,
            ride.locationTo.longitude
          )}
        >
          {popup}
        </this.ReactLeaflet.Marker>,
      ];
    });

    return markers.reduce((acc, val) => acc.concat(val), []);
  }
  renderClientsDirections() {
    const { directionsGeojsonById } = this.state;
    if (!directionsGeojsonById) return;
    return this.props.rides.map((ride) => {
      return (
        <this.ReactLeaflet.GeoJSON
          key={ride.id}
          onEachFeature={(feature, layer) => {
            (layer as any).setStyle({ color: '#6610f2' });
          }}
          data={directionsGeojsonById[ride.id]}
        />
      );
    });
  }
  renderDriverDirections() {
    if (!this.state.driverRoute) return;

    return (
      <this.ReactLeaflet.GeoJSON
        key={this.state.driverRouteKey}
        onEachFeature={(feature, layer) => {
          (layer as any).setStyle({ color: '#007bff' });
        }}
        data={this.state.driverRoute}
      />
    );
  }
  getBounds() {
    const { driverCoords, rides } = this.props;
    const allRides = driverCoords ? rides.concat(driverCoords) : rides;

    const lnglats: number[][] = allRides
      .map((ride) => {
        return [
          [ride.locationFrom.longitude, ride.locationFrom.latitude],
          [ride.locationTo.longitude, ride.locationTo.latitude],
        ];
      })
      .reduce((acc, val) => acc.concat(val), [] as [number, number][]);

    // If no lnglats, defaults to Sydney Area
    if (lnglats.length === 0) {
      lnglats.push([151.09901, -33.7049]);
      lnglats.push([151.058, -34.0331]);
    }

    return new this.L.LatLngBounds(getBoundsFromLngLatArray(lnglats));
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
    if (!this.ReactLeaflet) {
      return 'Loading...';
    }

    return (
      <div>
        <Head>
          <link rel="stylesheet" href="/leaflet/leaflet.css" />
        </Head>
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
              Start <img src="/leaflet/marker-start.svg" alt="" />
            </div>
            <div className="legend-col">
              End <img src="/leaflet/marker-end.svg" alt="" />
            </div>
          </div>
        </div>

        <this.ReactLeaflet.Map
          style={{ height: '500px' }}
          center={[-24.554411, 133.865766]}
          zoom={5}
          bounds={this.getBounds()}
          useFlyTo={true}
        >
          <this.ReactLeaflet.TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {this.renderMarkers()}
          {this.renderClientsDirections()}
          {this.renderDriverDirections()}
        </this.ReactLeaflet.Map>
      </div>
    );
  }
}

export default DriverMap;
