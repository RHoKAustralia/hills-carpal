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
}

module.exports = ShowImageContentService;
