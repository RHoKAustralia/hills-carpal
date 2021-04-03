import React from 'react';
import moment from 'moment-timezone';
import Link from 'next/link';

import './driver-list.css';

export default function DriverList({ rides }) {
  return (
    <div className="row">
      <div className="col-12">
        <ul className="ride-list">
          {rides.map((ride) => {
            const rideMoment = moment.tz(
              ride.pickupTimeAndDate,
              process.env.TIMEZONE
            );
            return (
              <li className="ride-list__item">
                <Link href={`/driver/rides/${ride.id}/details`}>
                  <a className="ride-list__link">
                    <div className="ride-list__content">
                      <div className="ride-list__client-name">
                        {ride.client.name}
                      </div>
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
                      <div className="ride_list_facilitator">
                        <span className="ride_list_facilitator_prefix">Facilitator:</span>{' '}
                        {ride.facilitatorEmail}
                      </div>
                    </div>
                    <div className="ride-list__chevron">
                      <span className="chevron right"></span>
                    </div>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
