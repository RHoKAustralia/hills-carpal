import React, { Component } from 'react';
import Link from 'next/link';
import { AuthContext, hasFacilitatorPrivilege } from '../../client/auth';

import {
  Client,
  OptionalClient,
  Gender,
  CarType,
  Complete,
} from '../../../src/common/model';
import isAuthedWithRole from '../../../src/common/redirect-if-no-role';
import { isUndefined } from 'lodash';

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

const clientSort = (lhs, rhs) => {
  if (lhs.name < rhs.name) {
    return -1;
  }
  if (lhs.name > rhs.name) {
    return 1;
  }
  return 0;
};

interface Props<Model> {
  blankModel: Model
  id: string;
  getData: () => Promise<Complete<Model>[]>;
  validate: (data : Model) => boolean | Error
  update: (data: Model) => Promise<void>
  create: (data: Model) => Promise<Complete<Model>>
}

interface State<Model> {
  current: Model;
  list: Model[];
  loading: boolean;
  loadingError: Error | null;
  saving: boolean;
  savingError: Error | null;
}

class CrudList<Model extends { id?: number }> extends Component<Props<Model>, State<Model>> {
  static contextType = AuthContext;
  context!: React.ContextType<typeof AuthContext>;

  state: State<Model> = {
    current: this.props.blankModel,
    list: [],
    loading: false,
    loadingError: null,
    saving: false,
    savingError: null
  };

  componentDidMount() {
    if (!isAuthedWithRole(this.context.authState, 'facilitator')) {
      return;
    }

    this.fetchData();
  }

  componentDidUpdate = (prevProps: Props<Model>) => {
    if (this.props.id !== prevProps.id) {
      this.setCurrent(this.props.id);
    }
  };

  fetchData = async () => {
    this.setState({ loading: true, loadingError: null });

    try {
      const data = await this.props.getData()
      this.setState({ list: data, loading: false }, () => {
        if (data.length > 0) {
          if (this.props.id) {
            this.setCurrent(this.props.id);
          } else {
            this.setCurrent(data[0].id);
          }
        }
      })
    } catch (e) {
      console.error(e);
      this.setState({ loadingError: e, loading: false });
    }
  };

  async saveClient(e) {
    e.preventDefault();

    this.setState({
      saving: true,
      savingError: null,
    });

    const validation = this.props.validate(this.state.current)

    if (validation instanceof Error) {
      this.setState({
        saving: false,
        savingError: validation,
      });
      return;
    }

    if (!isNaN(this.state.current.id)) {
      await this.props.update(this.state.current)
    } else {
      const withId = await this.props.create(this.state.current)

      this.setState({
        current: withId
      })
    }

    this.updateCurrentAndList()

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
      currentClient: this.find(this.state.clients, id),
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

  find(id: number) : Model | undefined {
    return this.state.list.find((c) => c.id === id);
  }

  newClient() {
    this.setState({ currentClient: defaultClient, clientImages: null });
  }

  updateCurrentAndList(model: Model) {
    const list = this.state.list;
    const modelInList = this.find(model.id);

    if (isUndefined(modelInList)) {
      list.push(model)
    } else {
      Object.assign(modelInList, model)
    }

    list.sort(clientSort);

    this.setState({ list , current: model});
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
      <div className="container">
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
        <br></br>
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
                      className={`nav-link ${
                        c.id === this.state.currentClient.id ? 'active' : ''
                      }`}>

                      {c.name}

                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="col-9">
            {this.state.currentClient.inactive && (
              <div className="p-3 mb-2 bg-danger text-white">
                This Client is now deactivated
              </div>
            )}
            <section className="client-form-section">
              <form onSubmit={this.saveClient.bind(this)}>
                <h5>Details</h5>
                <div className="form-group">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="aflag"
                      checked={this.state.currentClient.inactive}
                      onChange={(e) => {
                        const curr = { ...this.state.currentClient };
                        curr.inactive = e.currentTarget.checked;
                        this.setState({ currentClient: curr });
                      }}
                    />
                    <label className="form-check-label" htmlFor="aflag">
                      Inactive Status
                    </label>
                  </div>

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
                      let currentClient = {
                        ...this.state.currentClient,
                        preferredDriverGender: e.currentTarget.value as Gender,
                      };
                      this.setState({ currentClient });
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
                      const currentClient: OptionalClient = {
                        ...this.state.currentClient,
                        preferredCarType: e.currentTarget.value as CarType,
                      };

                      this.setState({ currentClient });
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
                  <label>Client Description</label>
                  <textarea
                    rows={5}
                    maxLength={1024}
                    onChange={(e) => {
                      let curr = { ...this.state.currentClient };
                      curr.clientDescription = e.currentTarget.value;
                      this.setState({ currentClient: curr });
                    }}
                    className="form-control"
                    value={this.state.currentClient.clientDescription}
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
      </div>
    );
  }
}

export default Clients;
