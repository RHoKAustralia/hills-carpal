import React, { Component } from 'react';
import Link from 'next/link';
import type { User, AppMetadata, UserMetadata } from 'auth0';

import { AuthContext, hasFacilitatorPrivilege } from '../../../src/client/auth';

import {
  Facilitator,
  OptionalFacilitator,
  Gender,
  CarType,
} from '../../../src/common/model';
import isAuthedWithRole from '../../../src/common/redirect-if-no-role';
import CrudList from '../../../src/common/components/crud-list';

const defaultFacilitator: OptionalFacilitator = {
  givenName: '',
  familyName: '',
  email: '',
  mobile: '',
};

interface Props {
  id: number;
}

interface State {
  users: User<AppMetadata, UserMetadata>[];
}

class Facilitators extends Component<Props, State> {
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

  fetchFacilitators = async (): Promise<Facilitator[]> => {
    const data = await fetch('/api/facilitators', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('id_token')}`,
      },
    });

    const facilitators = (await data.json()) as Facilitator[];

    return facilitators.map((facilitator) => ({
      ...facilitator,
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

  validate = (facilitator: OptionalFacilitator) => {
    // return !!facilitator.homeLocation;
    return true;
  };

  create = async (facilitator: OptionalFacilitator) => {
    const res = await fetch('/api/facilitators', {
      method: 'post',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('id_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(facilitator),
    });

    if (res.status === 200) {
      return (await res.json()) as Facilitator;
    } else {
      throw new Error('Failed to send the facilitator to the server.');
    }
  };

  update = async (facilitator: OptionalFacilitator) => {
    const result = await fetch('/api/facilitators/' + facilitator.id, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('id_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(facilitator),
    });

    if (result.status < 200 || result.status >= 300) {
      throw new Error('Bad status: ' + result.status);
    }
  };

  delete = async (id: number) => {
    await fetch('/api/facilitators/' + id, {
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
        <h1>Facilitators</h1>

        <CrudList<OptionalFacilitator>
          id={this.props.id?.toString()}
          blankModel={defaultFacilitator}
          create={this.create}
          delete={this.delete}
          getData={this.fetchFacilitators}
          update={this.update}
          validate={this.validate}
          baseRoute="/facilitator/facilitators"
          getName={(facilitator) =>
            `${facilitator.givenName} ${facilitator.familyName}`
          }
          children={(facilitator, buttons, update, save) => {
            return (
              <div className="col-9">
                <section className="facilitator-form-section">
                  <form onSubmit={(event) => this.onSubmit(event, save)}>
                    <h5>Details</h5>

                    <div className="form-group">
                      <label>Auth0 User</label>
                      <select
                        required
                        onChange={(e) => {
                          let currentFacilitator = {
                            ...facilitator,
                            auth0Id: e.currentTarget.value,
                          };
                          update(currentFacilitator);
                        }}
                        value={facilitator.auth0Id ?? ''}
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
                        value={facilitator.givenName}
                        required
                        onChange={(e) => {
                          let curr = { ...facilitator };
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
                        value={facilitator.familyName}
                        required
                        onChange={(e) => {
                          let curr = { ...facilitator };
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
                        value={facilitator.email}
                        required
                        onChange={(e) => {
                          let curr = { ...facilitator };
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
                        value={facilitator.mobile}
                        required
                        onChange={(e) => {
                          let curr = { ...facilitator };
                          curr.mobile = e.currentTarget.value;
                          update(curr);
                        }}
                        type="text"
                        name="facilitator"
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

export default Facilitators;
