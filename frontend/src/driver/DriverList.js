import React from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';

import './DriverList.css';

export default function DriverList({ rides }) {
  return (
    <div className="row">
      <div className="col-12">
        <ul className="ride-list">
          {rides.map(ride => {
            const rideMoment = moment.tz(
              ride.pickupTimeAndDateInUTC,
              'Australia/Sydney'
            );
            return (
              <li className="ride-list__item">
                <Link
                  to={`/driver/rides/${ride.id}/details`}
                  className="ride-list__link"
                >
                  <div className="ride-list__content">
                    <div className="ride-list__client-name">{ride.client}</div>
                    <div className="ride-list__time">
                      {rideMoment.format('dddd DD/MM/YYYY hh:mma')} (
                      {rideMoment.fromNow(false)})
                    </div>
                    <div className="ride-list__from">
                      <span className="ride-list__place-prefix">From:</span>{' '}
                      {ride.locationFrom.placeName}
                    </div>
                    <div className="ride-list__to">
                      <span className="ride-list__place-prefix">To:</span>{' '}
                      {ride.locationTo.placeName}
                    </div>
                  </div>
                  <div className="ride-list__chevron">
                    <span class="chevron right"></span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
