const UploadImageService = require('./UploadImageService');
const ListImagesService = require('./ListImagesService');
const GetImageService = require('./GetImageService');
const UpdateImageService = require('./UpdateImageService');
const DeleteImageService = require('./DeleteImageService');
const DatabaseManager = require('../database/DatabaseManager');
const AwsLambdaImageApis = require('./aws/AwsLambdaImagesApis');
const databaseManager = new DatabaseManager();

const uploadImageService = new UploadImageService(databaseManager);
const listImagesService = new ListImagesService(databaseManager);
const getImageService = new GetImageService(databaseManager);
const updateImageService = new UpdateImageService(databaseManager);
const deleteImageService = new DeleteImageService(databaseManager);

const images = new AwsLambdaImageApis(
  uploadImageService,
  listImagesService,
  getImageService,
  updateImageService,
  deleteImageService
);

let wrappedCallback = callback => {
  return (error, result) => {
    if (!error) {
      const response = {
        statusCode: 200,
        body: JSON.stringify(result),
        headers: {
          'Access-Control-Allow-Origin': '*', // Required for CORS support to work
          'Access-Control-Allow-Credentials': true // Required for cookies, authorization headers with HTTPS
        }
      };
      callback(null, response);
    } else {
      callback(error);
    }
  };
};

const jsonFns = ['list', 'upload', 'delete', 'update'].reduce(
  (acc, current) => {
    acc[current] = (event, context, callback) => {
      return images[current](event, context, wrappedCallback(callback));
    };
    return acc;
  },
  {}
);

module.exports = {
  ...jsonFns,
  show: (event, context, callback) => images.show(event, context, callback)
};
