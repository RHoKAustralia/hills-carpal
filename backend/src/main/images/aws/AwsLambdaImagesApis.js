const decodeJwt = require('../../utils/jwt').decodeJwt;

class AwsLambdaImageApis {
  constructor(
    uploadImageService,
    listImagesService,
    updateImageService,
    deleteImageService
  ) {
    this.uploadImageService = uploadImageService;
    this.listImagesService = listImagesService;
    this.updateImageService = updateImageService;
    this.deleteImageService = deleteImageService;
  }

  upload(event, context, callback) {
    let loginData = decodeJwt(event);
    this.uploadImageService
      .uploadImage(
        event.body,
        event.headers['content-type'] || event.headers['Content-Type'],
        event.pathParameters.clientId,
        loginData
      )
      .then(result => callback(null, result || {}))
      .catch(result => callback(result));
  }

  // update(event, context, callback) {
  //   const loginData = decodeJwt(event);
  //   const image = JSON.parse(event.body);
  //   const id = event.pathParameters.id;
  //   this.updateImageService
  //     .updateImage(id, image, loginData)
  //     .then(result => callback(null, result || {}))
  //     .catch(result => callback(result));
  // }

  // list(event, context, callback) {
  //   let loginData = decodeJwt(event);
  //   let queryParams = event.queryStringParameters || {};
  //   this.listImagesService
  //     .listImages(queryParams, loginData)
  //     .then(result => callback(null, result || []))
  //     .catch(result => callback(result));
  // }

  // delete(event, context, callback) {
  //   let loginData = decodeJwt(event);
  //   const id = event.pathParameters.id;
  //   this.deleteImageService
  //     .deleteImage(id, loginData)
  //     .then(result => callback(null, result || {}))
  //     .catch(result => callback(result));
  // }
}

module.exports = AwsLambdaImageApis;
