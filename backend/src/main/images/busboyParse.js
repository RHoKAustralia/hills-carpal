const Busboy = require('busboy');

const parser = event => {
  return new Promise((resolve, reject) => {
    const headers = {};
    Object.keys(event.headers).forEach(key => {
      headers[key.toLowerCase()] = event.headers[key];
    });

    const busboy = new Busboy({
      headers
    });

    const result = {};

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      file.on('data', data => {
        result.stream = data;
      });

      file.on('end', () => {
        result.filename = filename;
        result.contentType = mimetype;
      });
    });

    busboy.on('field', (fieldname, value) => {
      result[fieldname] = value;
    });

    busboy.on('error', error => reject(`Parse error: ${error}`));

    busboy.on('finish', () => resolve(result));

    busboy.write(event.body, event.isBase64Encoded ? 'base64' : 'binary');
    busboy.end();
  });
};

module.exports = parser;
