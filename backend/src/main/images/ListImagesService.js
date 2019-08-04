'use strict';

const ImageRepository = require('./ImageRepository');
const ImageMapper = require('./ImageMapper');
const PromiseUtils = require('../utils/PromiseUtils');

class ListImagesService {
  constructor(databaseManager) {
    this._databaseManager = databaseManager;
    this._imageRepository = new ImageRepository(databaseManager);
  }

  listImages(clientId, loginData) {
    const isAdmin = this._hasRole('admin', loginData);
    const isFacilitator = this._hasRole('facilitator', loginData);
    const isDriver = this._hasRole('driver', loginData);
    if (!isAdmin && !isFacilitator && !isDriver) {
      console.log('WARNING: unauthorised attempt to list images', loginData);
      return Promise.reject(new Error('Not authorised'));
    }

    const connection = this._databaseManager.createConnection();

    const listImagesPromise = this._listImages(
      clientId,
      loginData,
      connection
    ).then(images => images.map(ImageMapper.entityToDto));
    const closeConnection = () =>
      this._databaseManager.closeConnection(connection);
    return PromiseUtils.promiseFinally(listImagesPromise, closeConnection);
  }

  _listImages(clientId, loginData, connection) {
    return this._imageRepository.list(connection, clientId);
  }

  _hasRole(role, loginData) {
    return loginData && loginData.roles.indexOf(role) >= 0;
  }
}

module.exports = ListImagesService;
