import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../auth/api';
import history from '../history';
import LocationInput from '../components/location-input';
import Dropzone from 'react-dropzone';

const defaultClient = {
  id: NaN,
  name: '',
  description: '',
  phoneNumber: '',
  driverGender: 'any',
  carType: 'All',
  hasMps: false,
  locationHome: {}
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

class Clients extends Component {
  constructor() {
    super();
    this.state = {
      currentClient: defaultClient,
      clients: []
    };
  }

  onDrop(accepted, rejected, event) {
    // this.props.cloudinaryUploadFile(accepted[0]).then(cloudFile => {
    //   alert('done');
    // });

    const file = accepted[0];
    const formData = new FormData();
    formData.append(file.name, file);

    // return this.handleResult(
    //   file.name,
    //   this.props.authFetch(`${functionRoot()}/cloudinaryUpload/upload`, {
    //     method: 'POST',
    //     body: formData
    //   })
    // );

    axiosInstance
      .post(
        `/clients/${this.state.currentClient.id}/images`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('id_token')}`,
            'Content-Type': 'multipart/form-data'
          }
        },
        formData
      )
      .then(res => {
        this.setState({ clients: res.data });
      });
  }

  componentDidMount() {
    const { isAuthenticated, hasFacilitatorPriviledge } = this.props.auth;
    if (!isAuthenticated() || !hasFacilitatorPriviledge()) {
      history.replace('/');
      return false;
    }

    axiosInstance
      .get('/clients', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`
        }
      })
      .then(res => {
        this.setState({ clients: res.data });
      });
  }

  saveClient(e) {
    e.preventDefault();

    if (!isNaN(this.state.currentClient.id)) {
      let client = this.state.currentClient;
      axiosInstance({
        url: '/clients/' + this.state.currentClient.id,
        method: 'put',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`
        },
        data: client
      }).then(_ => {
        this.updateClientsWithCurrent();
      });
    } else {
      axiosInstance({
        url: '/clients',
        method: 'post',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`
        },
        data: this.state.currentClient
      }).then(result => {
        let client = this.state.currentClient;
        client.id = result.data.insertId;
        let clients = this.state.clients;
        clients.push(client);
        clients.sort(clientSort);
        this.setState({ clients: clients, currentClient: defaultClient });
      });
    }
  }

  setCurrent(id) {
    this.setState({ currentClient: this.findClient(this.state.clients, id) });
  }

  findClient(clients, id) {
    return clients.find(c => c.id === id);
  }

  newClient() {
    this.setState({ currentClient: defaultClient });
  }

  updateClientsWithCurrent() {
    let clients = this.state.clients;
    let client = this.findClient(clients, this.state.currentClient.id);
    client.name = this.state.currentClient.name;
    client.description = this.state.currentClient.description;
    client.phoneNumber = this.state.currentClient.phoneNumber;
    client.driverGender = this.state.currentClient.driverGender;
    client.carType = this.state.currentClient.carType;
    client.hasMps = this.state.currentClient.hasMps;
    client.locationHome = this.state.currentClient.locationHome;
    clients.sort(clientSort);
    this.setState({ clients: clients });
  }

  deleteCurrent() {
    if (isNaN(this.state.currentClient.id)) {
      return;
    }

    axiosInstance({
      url: '/clients/' + this.state.currentClient.id,
      method: 'delete',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('id_token')}`
      }
    }).then(_ => {
      let clients = this.state.clients;
      const idx = clients.findIndex(c => c.id === this.state.currentClient.id);
      if (idx >= 0) {
        clients.splice(idx, 1);
        this.setState({ clients: clients, currentClient: defaultClient });
      }
    });
  }

  render() {
    if (this.props.match.params.id && this.state.id === undefined) {
      return <img alt="loader" className="loader" src="/loader.svg" />;
    }

    return (
      <div className="container">
        <h1>Clients</h1>
        <Link className="btn btn-secondary" to={'/facilitator'}>
          Back
        </Link>
        <div className="container">
          <div className="row">
            <ul className="nav flex-column col-3">
              <li className="nav-item">
                <a className="nav-link active" onClick={() => this.newClient()}>
                  Create Client
                </a>
              </li>
              {this.state.clients.map(c => {
                return (
                  <li key={c.id} className="nav-item">
                    <a
                      className="nav-link"
                      onClick={() => this.setCurrent(c.id)}
                    >
                      {c.name}
                    </a>
                  </li>
                );
              })}
            </ul>
            <div className="col-9">
              <form onSubmit={this.saveClient.bind(this)}>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    value={this.state.currentClient.name}
                    required
                    onChange={e => {
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
                    onChange={e => {
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
                    value={this.state.currentClient.locationHome}
                    onChange={value => {
                      let curr = { ...this.state.currentClient };
                      curr.locationHome = value;
                      this.setState({ currentClient: curr });
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Driver Gender</label>
                  <select
                    required
                    onChange={e => {
                      let curr = { ...this.state.currentClient };
                      curr.driverGender = e.currentTarget.value;
                      this.setState({ currentClient: curr });
                    }}
                    value={this.state.currentClient.driverGender}
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
                    onChange={e => {
                      let curr = { ...this.state.currentClient };
                      curr.carType = e.currentTarget.value;
                      this.setState({ currentClient: curr });
                    }}
                    value={this.state.currentClient.carType}
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
                    onChange={e => {
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
                    onChange={e => {
                      let curr = { ...this.state.currentClient };
                      curr.description = e.currentTarget.value;
                      this.setState({ currentClient: curr });
                    }}
                    className="form-control"
                    value={this.state.currentClient.description}
                  />
                </div>

                
                <div className="form-group">
                  <Dropzone
                    accept="image/jpeg, image/png"
                    onDrop={this.onDrop.bind(this)}
                  >
                    {({ getRootProps, getInputProps }) => (
                      <div {...getRootProps()}>
                        <input {...getInputProps()} />
                        Try dropping some files here, or click to select files
                        to upload.
                      </div>
                    )}
                  </Dropzone>
                </div>

                <div className="btn-group mr-2" role="group">
                  <button className="btn btn-primary" type="submit">
                    Save
                  </button>
                </div>
                {!isNaN(this.state.currentClient.id) && (
                  <div className="btn-group mr-2" role="group">
                    <button
                      className="btn btn-danger"
                      type="button"
                      onClick={() => this.deleteCurrent()}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Clients;
