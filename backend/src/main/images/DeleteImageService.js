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
    const connection = this._databaseManager.createConnection();
    let deletePromise = this._deleteImage(id, loginData, connection);
    const closeConnection = () =>
      this._databaseManager.closeConnection(connection);
    return PromiseUtils.promiseFinally(deletePromise, closeConnection);
  }

  _deleteImage(id, loginData, connection) {
    return this._imageRepository.delete(id, connection).then(() => {});
  }
}

module.exports = DeleteImageService;
