import React, { Component } from 'react';
import Link from 'next/link';
import type { User, AppMetadata, UserMetadata } from 'auth0';

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
  driverRego: '',
  mpsPermit: '',
};

interface Props {
  id: number;
}

interface State {
  users: User<AppMetadata, UserMetadata>[];
}

class Drivers extends Component<Props, State> {
  static contextType = AuthContext;
  context!: React.ContextType<typeof AuthContext>;

  state: State = {
    users: [],
  };

  static getInitialProps({ query }) {
    return {
      id: query.id,
    };
  }

  componentDidMount() {
    if (!isAuthedWithRole(this.context.authState, 'facilitator')) {
      return;
    }

    this.fetchUsers();
  }

  fetchDrivers = async (): Promise<Driver[]> => {
    const data = await fetch('/api/drivers', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('id_token')}`,
      },
    });

    const drivers = (await data.json()) as Driver[];

    return drivers.map((driver) => ({
      ...driver,
    }));
  };

  fetchUsers = async () => {
    const data = await fetch('/api/users', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('id_token')}`,
      },
    });

    const users = (await data.json()) as User<AppMetadata, UserMetadata>[];

    this.setState({ users });
  };

  validate = (driver: OptionalDriver) => {
    // return !!driver.homeLocation;
    return true;
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
    const result = await fetch('/api/drivers/' + driver.id, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('id_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(driver),
    });

    if (result.status < 200 || result.status >= 300) {
      throw new Error('Bad status: ' + result.status);
    }
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
          id={this.props.id?.toString()}
          blankModel={defaultDriver}
          create={this.create}
          delete={this.delete}
          getData={this.fetchDrivers}
          update={this.update}
          validate={this.validate}
          baseRoute="/facilitator/drivers"
          getName={(driver) => `${driver.givenName} ${driver.familyName}`}
          children={(driver, buttons, update, save) => {
            return (
              <div className="col-9">
                <section className="driver-form-section">
                  <form onSubmit={(event) => this.onSubmit(event, save)}>
                    <h5>Details</h5>

                    <div className="form-group">
                      <label>Auth0 User</label>
                      <select
                        required
                        onChange={(e) => {
                          let currentDriver = {
                            ...driver,
                            auth0Id: e.currentTarget.value,
                          };
                          update(currentDriver);
                        }}
                        value={driver.auth0Id ?? ''}
                        className="custom-select"
                      >
                        <option disabled selected value="">
                          {' '}
                          -- select an option --{' '}
                        </option>
                        {this.state.users.map((user) => (
                          <option value={user.user_id}>
                            {user.name} - {user.user_id}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Given Name</label>
                      <input
                        value={driver.givenName}
                        required
                        onChange={(e) => {
                          let curr = { ...driver };
                          curr.givenName = e.currentTarget.value;
                          update(curr);
                        }}
                        type="text"
                        name="given-name"
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>Family Name</label>
                      <input
                        value={driver.familyName}
                        required
                        onChange={(e) => {
                          let curr = { ...driver };
                          curr.familyName = e.currentTarget.value;
                          update(curr);
                        }}
                        type="text"
                        name="family-name"
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        value={driver.email}
                        required
                        onChange={(e) => {
                          let curr = { ...driver };
                          curr.email = e.currentTarget.value;
                          update(curr);
                        }}
                        type="text"
                        name="email"
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>Mobile Number</label>
                      <input
                        value={driver.mobile}
                        required
                        onChange={(e) => {
                          let curr = { ...driver };
                          curr.mobile = e.currentTarget.value;
                          update(curr);
                        }}
                        type="text"
                        name="driver"
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label>Driver Gender</label>
                      <select
                        required
                        onChange={(e) => {
                          let currentDriver = {
                            ...driver,
                            driverGender: e.currentTarget.value as Gender,
                          };
                          update(currentDriver);
                        }}
                        value={driver.driverGender ?? ''}
                        className="custom-select"
                      >
                        <option disabled selected value="">
                          {' '}
                          -- select an option --{' '}
                        </option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="suv"
                        checked={driver.hasSuv}
                        onChange={(e) => {
                          let curr = { ...driver };
                          curr.hasSuv = e.currentTarget.checked;
                          update(curr);
                        }}
                      />
                      <label className="form-check-label" htmlFor="suv">
                        Has SUV
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Rego</label>
                      <input
                        value={driver.driverRego}
                        required
                        onChange={(e) => {
                          let curr = { ...driver };
                          curr.driverRego = e.currentTarget.value;
                          update(curr);
                        }}
                        type="text"
                        name="driver-rego"
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label>MPS Permit #</label>
                      <input
                        value={driver.mpsPermit}
                        required
                        onChange={(e) => {
                          let curr = { ...driver };
                          curr.mpsPermit = e.currentTarget.value;
                          update(curr);
                        }}
                        type="text"
                        name="mps-permit"
                        className="form-control"
                      />
                    </div>

                    {buttons()}
                  </form>
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
