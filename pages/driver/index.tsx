import React from 'react';
import Link from 'next/link';

export default function DriverMenu() {
  return (
    <div className="container">
      <div className="hcp-background" />
      <div className="row justify-content-center">
        <div className="col-xs-12 col-sm-9 col-md-8 text-center">
          <div className="btn-group" role="group">
            <Link href="/driver/rides/find">
              <a className="btn btn-success">Find a ride</a>
            </Link>
            <Link href="/driver/queue">
              <a className="btn btn-success">My rides</a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
