'use strict';

const jsonValidator = require('jsonschema');
const imageSchema = require('../schema/image.json');
const ImageRepository = require('./ImageRepository');
const ImageMapper = require('./ImageMapper');
const PromiseUtils = require('../utils/PromiseUtils');

class DeleteImageService {
  constructor(databaseManager) {
    this._databaseManager = databaseManager;
    this._imageRepository = new ImageRepository(databaseManager);
  }

  deleteImage(id, loginData) {
    const isAdmin = this._hasRole('admin', loginData);
    const isFacilitator = this._hasRole('facilitator', loginData);
    if (!isAdmin && !isFacilitator) {
      console.log('WARNING: unauthorised attempt to delete client', loginData);
      return Promise.reject(new Error('Not authorised'));
    }

    const connection = this._databaseManager.createConnection();
    let deletePromise = this._deleteImage(id, loginData, connection);
    const closeConnection = () =>
      this._databaseManager.closeConnection(connection);
    return PromiseUtils.promiseFinally(deletePromise, closeConnection);
  }

  _deleteImage(id, loginData, connection) {
    return this._imageRepository.delete(id, connection).then(() => {});
  }

  _hasRole(role, loginData) {
    return loginData && loginData.roles.indexOf(role) >= 0;
  }
}

module.exports = DeleteImageService;
