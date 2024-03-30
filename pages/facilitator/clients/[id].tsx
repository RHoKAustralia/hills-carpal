import React, { Component } from 'react';
import Link from 'next/link';

import LocationInput from '../../../src/common/components/driver/location-input';
import ClientImages from '../../../src/common/components/facilitator/client-images';
import { AuthContext, hasFacilitatorPrivilege } from '../../../src/client/auth';

import {
  Client,
  OptionalClient,
  GenderPreference,
  CarType,
} from '../../../src/common/model';
import isAuthedWithRole from '../../../src/common/redirect-if-no-role';
import CrudList from '../../../src/common/components/crud-list';

const defaultClient: OptionalClient = {
  name: '',
  clientDescription: '',
  phoneNumber: '',
  preferredDriverGender: undefined,
  preferredCarType: undefined,
  homeLocation: undefined,
  hasMps: false,
  inactive: false,
};

interface Props {
  id: number;
}

interface State {
  clientImages: any[] | null;
  clientImagesLoadingError: Error | null;
}

class Clients extends Component<Props, State> {
  static contextType = AuthContext;
  context!: React.ContextType<typeof AuthContext>;

  state: State = {
    clientImages: null,
    clientImagesLoadingError: null,
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

    this.fetchClients();
  }

  fetchClients = async (): Promise<Client[]> => {
    const data = await fetch('/api/clients', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('id_token')}`,
      },
    });

    return (await data.json()) as Client[];
  };

  validate = (client: OptionalClient) => {
    return !!client.homeLocation;
  };

  create = async (client: OptionalClient) => {
    const res = await fetch('/api/clients', {
      method: 'post',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('id_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(client),
    });

    if (res.status === 200) {
      return (await res.json()) as Client;
    } else {
      throw new Error('Failed to send the client to the server.');
    }
  };

  update = async (client: OptionalClient) => {
    await fetch('/api/clients/' + client.id, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('id_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(client),
    });
  };

  onClientSelected = async (client: OptionalClient) => {
    this.setState({
      clientImages: null,
      clientImagesLoadingError: null,
    });

    const imagesRes = await fetch(`/api/clients/${client.id}/images`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('id_token')}`,
      },
    });

    if (imagesRes.status !== 200) {
      this.setState({
        clientImages: null,
        clientImagesLoadingError: new Error('Could not load client images'),
      });
    }

    this.setState({ clientImages: await imagesRes.json() });
  };

  onImagesChanged = (images) => {
    this.setState({
      clientImages: images,
    });
  };

  delete = async (id: number) => {
    await fetch('/api/clients/' + id, {
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
        <h1>Clients</h1>

        <CrudList<OptionalClient>
          id={this.props.id?.toString()}
          blankModel={defaultClient}
          create={this.create}
          delete={this.delete}
          getData={this.fetchClients}
          update={this.update}
          onSelected={this.onClientSelected}
          validate={this.validate}
          baseRoute="/facilitator/clients"
          getName={(model) => model.name}
          children={(client, buttons, update, save) => {
            return (
              <div className="col-9">
                {client.inactive && (
                  <div className="p-3 mb-2 bg-danger text-white">
                    This Client is now deactivated
                  </div>
                )}
                <section className="client-form-section">
                  <form onSubmit={(event) => this.onSubmit(event, save)}>
                    <h5>Details</h5>
                    <div className="form-group">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="aflag"
                          checked={client.inactive}
                          onChange={(e) => {
                            const curr = { ...client };
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
                        value={client.name}
                        required
                        onChange={(e) => {
                          let curr = { ...client };
                          curr.name = e.currentTarget.value;
                          update(curr);
                        }}
                        type="text"
                        name="client"
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        value={client.phoneNumber}
                        required
                        onChange={(e) => {
                          let curr = { ...client };
                          curr.phoneNumber = e.currentTarget.value;
                          update(curr);
                        }}
                        type="text"
                        name="client"
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>Home Address</label>
                      <LocationInput
                        required
                        value={client.homeLocation}
                        onChange={(value) => {
                          let curr = { ...client };
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
                          let currentClient = {
                            ...client,
                            preferredDriverGender: e.currentTarget
                              .value as GenderPreference,
                          };
                          update(currentClient);
                        }}
                        value={client.preferredDriverGender}
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
                          const currentClient: OptionalClient = {
                            ...client,
                            preferredCarType: e.currentTarget.value as CarType,
                          };

                          update(currentClient);
                        }}
                        value={client.preferredCarType}
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
                        checked={client.hasMps}
                        onChange={(e) => {
                          let curr = { ...client };
                          curr.hasMps = e.currentTarget.checked;
                          update(curr);
                        }}
                      />
                      <label className="form-check-label" htmlFor="mps">
                        Has Mobility Parking Sticker
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Client Description</label>
                      <textarea
                        rows={5}
                        maxLength={1024}
                        onChange={(e) => {
                          let curr = { ...client };
                          curr.clientDescription = e.currentTarget.value;
                          update(curr);
                        }}
                        className="form-control"
                        value={client.clientDescription}
                      />
                    </div>
                    {buttons()}
                  </form>
                </section>

                <section className="client-form-section">
                  <h5>Images</h5>
                  {!isNaN(client.id) ? (
                    <ClientImages
                      clientId={client.id}
                      images={this.state.clientImages}
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

export default Clients;
