'use strict';

const ImageRepository = require('./ImageRepository');
const ImageMapper = require('./ImageMapper');
const PromiseUtils = require('../utils/PromiseUtils');

class ShowImageContentService {
  constructor(databaseManager) {
    this._databaseManager = databaseManager;
    this._imageRepository = new ImageRepository(databaseManager);
  }

  getImage(imageId, loginData) {
    const isAdmin = this._hasRole('admin', loginData);
    const isFacilitator = this._hasRole('facilitator', loginData);
    const isDriver = this._hasRole('driver', loginData);
    
    if (!isAdmin && !isFacilitator && !isDriver) {
      console.log('WARNING: unauthorised attempt to get image', loginData);
      return Promise.reject(new Error('Not authorised'));
    }

    const connection = this._databaseManager.createConnection();

    const showImageContentPromise = this._imageRepository
      .get(connection, imageId)
      .then(images => images[0]);
    const closeConnection = () =>
      this._databaseManager.closeConnection(connection);
    return PromiseUtils.promiseFinally(
      showImageContentPromise,
      closeConnection
    );
  }

  _hasRole(role, loginData) {
    return loginData && loginData.roles.indexOf(role) >= 0;
  }
}

module.exports = ShowImageContentService;
