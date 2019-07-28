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
    // console.log(body);
    // const buffer = Buffer.from(body, 'base64');
    // console.log(buffer);toArray(stream)
    // console.log(stream);
    // const streamArr = await toArray(stream);
    // console.log(streamArr);
    // const buffers = streamArr.map(part =>
    //   Buffer.isBuffer(part) ? part : Buffer.from(part)
    // );
    // const content = Buffer.concat(buffers);
    const content = stream.toString('base64');

    const connection = this._databaseManager.createConnection();

    // const content = await new Promise((resolve, reject) =>
    //   fs.readFile(
    //     path,
    //     {
    //       encoding: 'base64'
    //     },
    //     (err, data) => {
    //       if (err) {
    //         reject(err);
    //       } else {
    //         resolve(data);
    //       }
    //     }
    //   )
    // );

    // console.log(Object.keys(body));
    // const content = body.toString(); //Buffer.from(body).toString('base64');
    // console.log(Buffer.from(body).toString('base64'));
    // const buffer = Buffer.from(body);
    // console.log(Buffer.from(body).length);
    // const type = fileType();
    // console.log(type);
    // const mime = type.mime;
    // const content = buffer.toString('base64');

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
