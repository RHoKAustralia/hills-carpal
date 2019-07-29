const decodeJwt = require('../../utils/jwt').decodeJwt;
const busboyParse = require('../busboyParse');

class AwsLambdaImageApis {
  constructor(
    uploadImageService,
    listImagesService,
    getImageService,
    updateImageService,
    deleteImageService
  ) {
    this.uploadImageService = uploadImageService;
    this.listImagesService = listImagesService;
    this.getImageService = getImageService;
    this.updateImageService = updateImageService;
    this.deleteImageService = deleteImageService;
  }

  list(event, context, callback) {
    let loginData = decodeJwt(event);
    let queryParams = event.queryStringParameters || {};
    this.listImagesService
      .listImages(event.pathParameters.id, loginData)
      .then(result => callback(null, result || []))
      .catch(result => callback(result));
  }

  upload(event, context, callback) {
    let loginData = decodeJwt(event);

    busboyParse(event)
      .then(result =>
        this.uploadImageService.uploadImage(
          result.stream,
          result.contentType,
          event.pathParameters.id,
          loginData
        )
      )
      .then(result => callback(null, result || {}))
      .catch(result => callback(result));
  }

  show(event, context, callback) {
    let loginData = decodeJwt(event);
    let queryParams = event.queryStringParameters || {};
    this.getImageService
      .getImage(event.pathParameters.id, loginData)
      .then(image => {
        console.log(Object.keys(image));
        callback(null, {
          statusCode: 200,
          headers: {
            'Content-Type': image.mime_type
          },
          body: image.content,
          isBase64Encoded: true
        });
      })
      .catch(result => callback(result));
  }

  update(event, context, callback) {
    const loginData = decodeJwt(event);
    const image = JSON.parse(event.body);
    const id = event.pathParameters.id;
    this.updateImageService
      .updateImage(id, image, loginData)
      .then(result => callback(null, result || {}))
      .catch(result => callback(result));
  }

  delete(event, context, callback) {
    let loginData = decodeJwt(event);
    const id = event.pathParameters.id;
    this.deleteImageService
      .deleteImage(id, loginData)
      .then(result => callback(null, result || {}))
      .catch(result => callback(result));
  }
}

module.exports = AwsLambdaImageApis;
