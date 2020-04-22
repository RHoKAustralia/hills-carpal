import React, { Component } from 'react';
import Router from 'next/router';
import Link from 'next/link';

import LocationInput from '../../../src/components/driver/location-input';
import ClientImages from '../../../src/components/facilitator/client-images';
import auth from '../../../src/auth/Auth';

import './clients.css';
import { Client, OptionalClient, Gender } from '../../../src/model';

const defaultClient: OptionalClient = {
  name: '',
  description: '',
  phoneNumber: '',
  preferredDriverGender: undefined,
  preferredCarType: undefined,
  homeLocation: undefined,
  hasMps: false,
};

const clientSort = (lhs, rhs) => {
  if (lhs.name < rhs.name) {
    return -1;
  }
  if (lhs.name > rhs.name) {
    return 1;
  }
  return 0;
};

interface Props {
  id: string;
}

interface State {
  currentClient: OptionalClient;
  clients: OptionalClient[];
  clientImages: any[] | null;
  loading: boolean;
  loadingError: Error | null;
  saving: boolean;
  savingError: Error | null;
}

class Clients extends Component<Props, State> {
  state: State = {
    currentClient: defaultClient,
    clients: [],
    loading: false,
    loadingError: null,
    saving: false,
    savingError: null,
    clientImages: null,
  };

  static getInitialProps({ query }) {
    return {
      id: query.clientId && Number.parseInt(query.clientId),
    };
  }

  componentDidMount() {
    const { isAuthenticated, hasFacilitatorPriviledge } = auth;
    if (!isAuthenticated() || !hasFacilitatorPriviledge()) {
      Router.replace('/');
      return false;
    }

    this.fetchClients();
  }

  componentDidUpdate = (prevProps: Props, prevState: State) => {
    if (this.props.id !== prevProps.id) {
      this.setCurrent(this.props.id);
    }
  };

  fetchClients = () => {
    this.setState({ loading: true, loadingError: null });

    fetch('/api/clients', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('id_token')}`,
      },
    })
      .then(async (res) => {
        if (res.status !== 200) {
          throw new Error('Error when fetching clients');
        }

        const data = await res.json();
        this.setState({ clients: data, loading: false }, () => {
          if (data.length > 0) {
            if (this.props.id) {
              this.setCurrent(this.props.id);
            } else {
              this.setCurrent(data[0].id);
            }
          }
        });
      })
      .catch((e) => {
        console.error(e);
        this.setState({ loadingError: e, loading: false });
      });
  };

  saveClient(e) {
    e.preventDefault();

    this.setState({
      saving: true,
      savingError: null,
    });

    if (!this.state.currentClient.homeLocation) {
      this.setState({
        saving: false,
        savingError: new Error('Please enter a location'),
      });
      return;
    }

    let promise;
    if (!isNaN(this.state.currentClient.id)) {
      promise = fetch('/api/clients/' + this.state.currentClient.id, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.state.currentClient),
      }).then((res) => {
        if (res.status === 200) {
          this.updateClientsWithCurrent();
        } else {
          throw new Error('Could not update client');
        }
      });
    } else {
      promise = fetch('/api/clients', {
        method: 'post',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.state.currentClient),
      })
        .then((res) => {
          if (res.status === 200) {
            return res.json();
          } else {
            throw new Error('Failed to send the client to the server.');
          }
        })
        .then((result) => {
          let client = this.state.currentClient;
          client.id = result.id;
          let clients = this.state.clients;
          clients.push(client);
          clients.sort(clientSort);
          this.setState({ clients: clients, currentClient: client });
        });
    }

    promise
      .then(() => {
        this.setState({
          saving: false,
        });
      })
      .catch((e) => {
        console.error(e);
        this.setState({
          saving: false,
          savingError: e,
        });
      });
  }

  async setCurrent(id) {
    this.setState({
      currentClient: this.findClient(this.state.clients, id),
      clientImages: null,
    });

    const imagesRes = await fetch(`/api/clients/${id}/images`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('id_token')}`,
      },
    });

    if (imagesRes.status !== 200) {
      this.setState({
        clientImages: null,
        loadingError: new Error('Could not load client images'),
      });
    }

    this.setState({ clientImages: await imagesRes.json() });
  }

  findClient(clients, id) {
    return clients.find((c) => c.id === id);
  }

  newClient() {
    this.setState({ currentClient: defaultClient, clientImages: null });
  }

  updateClientsWithCurrent() {
    let clients = this.state.clients;
    let client = this.findClient(clients, this.state.currentClient.id);
    client.name = this.state.currentClient.name;
    client.description = this.state.currentClient.description;
    client.phoneNumber = this.state.currentClient.phoneNumber;
    client.driverGender = this.state.currentClient.preferredDriverGender;
    client.carType = this.state.currentClient.preferredCarType;
    client.hasMps = this.state.currentClient.hasMps;
    client.locationHome = this.state.currentClient.homeLocation;
    clients.sort(clientSort);
    this.setState({ clients: clients });
  }

  deleteCurrent = (event: React.FormEvent) => {
    event.preventDefault();

    if (isNaN(this.state.currentClient.id)) {
      return;
    }

    const promptResult = confirm(
      `Are you sure you want to delete ${this.state.currentClient.name}?`
    );

    if (promptResult) {
      fetch('/api/clients/' + this.state.currentClient.id, {
        method: 'delete',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`,
        },
      }).then((_) => {
        let clients = this.state.clients;
        const idx = clients.findIndex(
          (c) => c.id === this.state.currentClient.id
        );
        if (idx >= 0) {
          clients.splice(idx, 1);
          this.setState({ clients: clients, currentClient: defaultClient });
        }
      });
    }
  };

  onImagesChanged = (images) => {
    this.setState((state) => ({
      clientImages: images,
    }));
  };

  buttons = () => {
    if (this.state.saving) {
      return <img alt="loader" className="loader" src="/loader.svg" />;
    } else {
      return (
        <React.Fragment>
          {this.state.savingError && (
            <span>
              Error: {this.state.savingError.message}. Please try again.
            </span>
          )}

          <button className="btn btn-primary" type="submit">
            Save
          </button>

          <button
            className="btn btn-danger ml-2"
            type="submit"
            onClick={this.deleteCurrent}
          >
            Delete
          </button>
        </React.Fragment>
      );
    }
  };

  render() {
    if (this.state.loading) {
      return <img alt="loader" className="loader" src="/loader.svg" />;
    }
    if (this.state.loadingError) {
      return (
        <span>
          Error: {this.state.loadingError.message}. Please refresh the page to
          try again.
        </span>
      );
    }

    return (
      <React.Fragment>
        <h1>Clients</h1>

        <div className="row">
          <div className="col-12">
            <div className="btn-group">
              <button
                className="btn btn-primary"
                onClick={() => this.newClient()}
              >
                Create Client
              </button>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-3">
            <ul className="nav nav-fill nav-pills client-nav flex-column">
              {this.state.clients.map((c) => {
                return (
                  <li key={c.id} className={`nav-item`}>
                    <Link
                      scroll={false}
                      href={`/facilitator/clients/[clientId]`}
                      as={`/facilitator/clients/${c.id}`}
                    >
                      <a
                        className={`nav-link ${
                          c.id === this.state.currentClient.id ? 'active' : ''
                        }`}
                      >
                        {c.name}
                      </a>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="col-9">
            <section className="client-form-section">
              <form onSubmit={this.saveClient.bind(this)}>
                <h5>Details</h5>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    value={this.state.currentClient.name}
                    required
                    onChange={(e) => {
                      let curr = { ...this.state.currentClient };
                      curr.name = e.currentTarget.value;
                      this.setState({ currentClient: curr });
                    }}
                    type="text"
                    name="client"
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    value={this.state.currentClient.phoneNumber}
                    required
                    onChange={(e) => {
                      let curr = { ...this.state.currentClient };
                      curr.phoneNumber = e.currentTarget.value;
                      this.setState({ currentClient: curr });
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
                    value={this.state.currentClient.homeLocation}
                    onChange={(value) => {
                      let curr = { ...this.state.currentClient };
                      curr.homeLocation = value;
                      this.setState({ currentClient: curr });
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Driver Gender</label>
                  <select
                    required
                    onChange={(e) => {
                      let curr = { ...this.state.currentClient };
                      curr.preferredDriverGender =
                        e.currentTarget.value === 'any'
                          ? undefined
                          : (e.currentTarget.value as Gender);
                      this.setState({ currentClient: curr });
                    }}
                    value={this.state.currentClient.preferredDriverGender}
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
                      let curr = { ...this.state.currentClient };

                      if (e.currentTarget.value === 'All') {
                        curr.preferredCarType = undefined;
                      } else if (curr.preferredCarType === 'noSUV') {
                        curr.preferredCarType = 'noSUV';
                      }

                      this.setState({ currentClient: curr });
                    }}
                    value={this.state.currentClient.preferredCarType}
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
                    checked={this.state.currentClient.hasMps}
                    onChange={(e) => {
                      let curr = { ...this.state.currentClient };
                      curr.hasMps = e.currentTarget.checked;
                      this.setState({ currentClient: curr });
                    }}
                  />
                  <label className="form-check-label" htmlFor="mps">
                    Has Mobility Parking Sticker
                  </label>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    rows={5}
                    maxLength={1024}
                    onChange={(e) => {
                      let curr = { ...this.state.currentClient };
                      curr.description = e.currentTarget.value;
                      this.setState({ currentClient: curr });
                    }}
                    className="form-control"
                    value={this.state.currentClient.description}
                  />
                </div>

                {this.buttons()}
              </form>
            </section>

            <section className="client-form-section">
              <h5>Images</h5>
              {!isNaN(this.state.currentClient.id) ? (
                <ClientImages
                  clientId={this.state.currentClient.id}
                  images={this.state.clientImages}
                  onChange={this.onImagesChanged}
                />
              ) : (
                <div>Hit "Save" to add images</div>
              )}
            </section>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Clients;
