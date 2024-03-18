import React, { Component } from 'react';
import Link from 'next/link';

import { AuthContext, hasFacilitatorPrivilege } from '../../../src/client/auth';

import {
  Driver,
  OptionalDriver,
  Gender,
  CarType,
} from '../../../src/common/model';
import isAuthedWithRole from '../../../src/common/redirect-if-no-role';
import CrudList from '../../../src/common/components/crud-list';

const defaultDriver: OptionalDriver = {
  givenName: '',
  familyName: '',
  email: '',
  mobile: '',
  driverGender: null,
  hasSuv: false,
  driverRego: 'string',
  mpsPermit: false,
};

interface Props {
  id: number;
}

interface State {
  driverImages: any[] | null;
  driverImagesLoadingError: Error | null;
}

class Drivers extends Component<Props, State> {
  static contextType = AuthContext;
  context!: React.ContextType<typeof AuthContext>;

  state: State = {
    driverImages: null,
    driverImagesLoadingError: null,
  };

  static getInitialProps({ query }) {
    return {
      id: query.driverId,
    };
  }

  componentDidMount() {
    if (!isAuthedWithRole(this.context.authState, 'facilitator')) {
      return;
    }

    this.fetchDrivers();
  }

  fetchDrivers = async (): Promise<Driver[]> => {
    const data = await fetch('/api/drivers', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('id_token')}`,
      },
    });

    return (await data.json()) as Driver[];
  };

  validate = (driver: OptionalDriver) => {
    return !!driver.homeLocation;
  };

  create = async (driver: OptionalDriver) => {
    const res = await fetch('/api/drivers', {
      method: 'post',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('id_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(driver),
    });

    if (res.status === 200) {
      return (await res.json()) as Driver;
    } else {
      throw new Error('Failed to send the driver to the server.');
    }
  };

  update = async (driver: OptionalDriver) => {
    await fetch('/api/drivers/' + driver.id, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('id_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(driver),
    });
  };

  onDriverSelected = async (driver: OptionalDriver) => {
    this.setState({
      driverImages: null,
      driverImagesLoadingError: null,
    });

    const imagesRes = await fetch(`/api/drivers/${driver.id}/images`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('id_token')}`,
      },
    });

    if (imagesRes.status !== 200) {
      this.setState({
        driverImages: null,
        driverImagesLoadingError: new Error('Could not load driver images'),
      });
    }

    this.setState({ driverImages: await imagesRes.json() });
  };

  onImagesChanged = (images) => {
    this.setState({
      driverImages: images,
    });
  };

  delete = async (id: number) => {
    await fetch('/api/drivers/' + id, {
      method: 'delete',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('id_token')}`,
      },
    });
  };

  onSubmit = (event: React.FormEvent<HTMLFormElement>, save: () => void) => {
    event.preventDefault();

    save();
  };

  render() {
    return (
      <div className="container">
        <h1>Drivers</h1>

        <CrudList<OptionalDriver>
          id={this.props.id}
          blankModel={defaultDriver}
          create={this.create}
          delete={this.delete}
          getData={this.fetchDrivers}
          update={this.update}
          onSelected={this.onDriverSelected}
          validate={this.validate}
          baseRoute="/facilitator/drivers"
          children={(driver, buttons, update, save) => {
            return (
              <div className="col-9">
                {driver.inactive && (
                  <div className="p-3 mb-2 bg-danger text-white">
                    This Driver is now deactivated
                  </div>
                )}
                <section className="driver-form-section">
                  <form onSubmit={(event) => this.onSubmit(event, save)}>
                    <h5>Details</h5>
                    <div className="form-group">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="aflag"
                          checked={driver.inactive}
                          onChange={(e) => {
                            const curr = { ...driver };
                            curr.inactive = e.currentTarget.checked;
                            update(curr);
                          }}
                        />
                        <label className="form-check-label" htmlFor="aflag">
                          Inactive Status
                        </label>
                      </div>

                      <label>Name</label>
                      <input
                        value={driver.name}
                        required
                        onChange={(e) => {
                          let curr = { ...driver };
                          curr.name = e.currentTarget.value;
                          update(curr);
                        }}
                        type="text"
                        name="driver"
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        value={driver.phoneNumber}
                        required
                        onChange={(e) => {
                          let curr = { ...driver };
                          curr.phoneNumber = e.currentTarget.value;
                          update(curr);
                        }}
                        type="text"
                        name="driver"
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>Home Address</label>
                      <LocationInput
                        required
                        value={driver.homeLocation}
                        onChange={(value) => {
                          let curr = { ...driver };
                          curr.homeLocation = value;
                          update(curr);
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Driver Gender</label>
                      <select
                        required
                        onChange={(e) => {
                          let currentDriver = {
                            ...driver,
                            preferredDriverGender: e.currentTarget
                              .value as Gender,
                          };
                          update(currentDriver);
                        }}
                        value={driver.preferredDriverGender}
                        className="custom-select"
                      >
                        <option value="any">Any</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Car Type</label>
                      <select
                        required
                        onChange={(e) => {
                          const currentDriver: OptionalDriver = {
                            ...driver,
                            preferredCarType: e.currentTarget.value as CarType,
                          };

                          update(currentDriver);
                        }}
                        value={driver.preferredCarType}
                        className="custom-select"
                      >
                        <option>Car Type</option>
                        <option value="All">All</option>
                        <option value="noSUV">No SUV</option>
                      </select>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="mps"
                        checked={driver.hasMps}
                        onChange={(e) => {
                          let curr = { ...driver };
                          curr.hasMps = e.currentTarget.checked;
                          update(curr);
                        }}
                      />
                      <label className="form-check-label" htmlFor="mps">
                        Has Mobility Parking Sticker
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Driver Description</label>
                      <textarea
                        rows={5}
                        maxLength={1024}
                        onChange={(e) => {
                          let curr = { ...driver };
                          curr.driverDescription = e.currentTarget.value;
                          update(curr);
                        }}
                        className="form-control"
                        value={driver.driverDescription}
                      />
                    </div>
                    {buttons()}
                  </form>
                </section>

                <section className="driver-form-section">
                  <h5>Images</h5>
                  {!isNaN(driver.id) ? (
                    <DriverImages
                      driverId={driver.id}
                      images={this.state.driverImages}
                      onChange={this.onImagesChanged}
                    />
                  ) : (
                    <div>Hit "Save" to add images</div>
                  )}
                </section>
              </div>
            );
          }}
        ></CrudList>
      </div>
    );
  }
}

export default Drivers;
