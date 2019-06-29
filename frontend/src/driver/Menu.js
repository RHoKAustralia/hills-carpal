import React from 'react';
import { Link } from 'react-router-dom';

export default function DriverMenu() {
  return (
    <div className="container">
      <div className="hcp-background" />
      <div className="row justify-content-center">
        <div className="col-xs-12 col-sm-9 col-md-8 text-center">
          <div class="btn-group" role="group">
            <Link className="btn btn-success" to="/driver/find-rides">
              Find a ride
            </Link>
            <Link className="btn btn-success" to="/driver/queue">
              My rides
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
