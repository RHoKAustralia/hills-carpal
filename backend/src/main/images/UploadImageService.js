'use strict';

const jsonValidator = require('jsonschema');
// const ImageSchema = require('../schema/image.json');
const ImageMapper = require('./ImageMapper');
const ImageRepository = require('./ImageRepository');
const PromiseUtils = require('../utils/PromiseUtils');

class UploadImageService {
  constructor(databaseManager) {
    this._databaseManager = databaseManager;
    this._ImageRepository = new ImageRepository(databaseManager);
  }

  uploadImage(body, mime, clientId, loginData) {
    const connection = this._databaseManager.createConnection();

    // console.log(body);
    // const buffer = Buffer.from(body, 'base64');
    // console.log(buffer);
    // const content = buffer.toString('base64');

    // console.log(Object.keys(body));
    // const content = body.toString(); //Buffer.from(body).toString('base64');
    // console.log(Buffer.from(body).toString('base64'));
    const content = body.toString('base64');
    console.log(content);

    const uploadImagePromise = this._ImageRepository.upload(
      content,
      mime,
      clientId,
      connection
    );
    const closeConnection = () =>
      this._databaseManager.closeConnection(connection);
    return PromiseUtils.promiseFinally(uploadImagePromise, closeConnection);
  }

  // _validate(data) {
  //   const validationResult = jsonValidator.validate(data, ImageSchema);
  //   if (validationResult.errors && validationResult.errors.length) {
  //     return {
  //       statusCode: 400,
  //       headers: {
  //         'Content-Type': 'text/plain'
  //       },
  //       body: JSON.stringify({ error: validationResult.errors })
  //     };
  //   }
  // }
}

module.exports = UploadImageService;
