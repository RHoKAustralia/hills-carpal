'use strict';

const jsonValidator = require('jsonschema');

var toArray = require('stream-to-array');

// const ImageSchema = require('../schema/image.json');
const ImageMapper = require('./ImageMapper');
const ImageRepository = require('./ImageRepository');
const PromiseUtils = require('../utils/PromiseUtils');

class UploadImageService {
  constructor(databaseManager) {
    this._databaseManager = databaseManager;
    this._imageRepository = new ImageRepository(databaseManager);
  }

  async uploadImage(stream, mime, clientId, loginData) {
    const isAdmin = this._hasRole('admin', loginData);
    const isFacilitator = this._hasRole('facilitator', loginData);
    if (!isAdmin && !isFacilitator) {
      console.log('WARNING: unauthorised attempt to create client', loginData);
      return Promise.reject(new Error('Not authorised'));
    }

    const content = stream.toString('base64');

    const connection = this._databaseManager.createConnection();

    const uploadImagePromise = this._imageRepository
      .upload(content, mime, clientId, connection)
      .then(image => {
        console.log(image);
        return ImageMapper.entityToDto(image);
      });
    const closeConnection = () =>
      this._databaseManager.closeConnection(connection);
    return PromiseUtils.promiseFinally(uploadImagePromise, closeConnection);
  }

  _hasRole(role, loginData) {
    return loginData && loginData.roles.indexOf(role) >= 0;
  }
}

module.exports = UploadImageService;
