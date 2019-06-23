'use strict';

const moment = require('moment');

class ClientRepository {
  constructor(databaseManager) {
    this._databaseManager = databaseManager;
    this._dbName = this._databaseManager.databaseConfig.database;
  }

  create(client, connection) {
    const escape = (data) => connection.escape(data);
    const locationHome = `POINT(${client.locationHome.latitude}, ${client.locationHome.longitude})`;
    let query = `INSERT INTO ${this._dbName}.clients(
      name,
      description,
      phoneNumber,
      driverGender,
      carType,
      locationHome,
      placeNameHome,
      hasMps
    )
      VALUES
      (${
      [escape(client.name),
        escape(client.description),
        escape(client.phoneNumber),
        escape(client.driverGender),
        escape(client.carType),
        locationHome,
        escape(client.locationHome.placeName),
        escape(client.hasMps)
      ].join(',')})`;
    console.log(query);

    return this._databaseManager.query(query, connection);
  }

  update(id, client, connection) {
    if (!id) {
      throw new Error('No id specified when updating client.');
    }
    const escape = (data) => connection.escape(data);
    const locationHome = `POINT(${client.locationHome.latitude}, ${client.locationHome.longitude})`;
    let query = `UPDATE ${this._dbName}.clients SET name = ${escape(client.name)},
                                  description = ${escape(client.description)},
                                  phoneNumber = ${escape(client.phoneNumber)},
                                  driverGender = ${escape(client.driverGender)},
                                  carType = ${escape(client.carType)},
                                  locationHome = ${locationHome},
                                  placeNameHome = ${escape(client.locationHome.placeName)},
                                  hasMps = ${escape(client.hasMps)}
                                WHERE
                                  id = ${id}`;
    console.log(query);

    return this._databaseManager.query(query, connection);
  }

  list(connection) {
    const escape = (data) => connection.escape(data);

    let query = `SELECT * FROM ${this._dbName}.clients ORDER BY name ASC;`;
    console.log(query);
    return this._databaseManager.query(query, connection);
  }

  delete(id, connection) {
    if (!id) {
      throw new Error('No id specified when updating client.');
    }
    const escape = (data) => connection.escape(data);
    let query = `DELETE FROM ${this._dbName}.clients WHERE id = ${id}`;

    return this._databaseManager.query(query, connection);
  }
}

module.exports = ClientRepository;
