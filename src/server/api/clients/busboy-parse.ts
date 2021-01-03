import Busboy from 'busboy';
import { NextApiRequest } from 'next';

type Result = {
  chunk: Buffer | string;
  filename: string;
  contentType: string;
};

function parser(req: NextApiRequest): Promise<Result> {
  return new Promise((resolve, reject) => {
    const headers = {};
    Object.keys(req.headers).forEach((key) => {
      headers[key.toLowerCase()] = req.headers[key];
    });

    const busboy = new Busboy({
      headers,
    });

    const result: any = {};

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      file.on('data', (chunk: Buffer) => {
        result.chunk = result.chunk
          ? Buffer.concat([result.chunk, chunk])
          : chunk;
      });

      file.on('end', () => {
        result.filename = filename;
        result.contentType = mimetype;
      });
    });

    busboy.on('field', (fieldname, value) => {
      result[fieldname] = value;
    });

    busboy.on('error', (error) => reject(error));

    busboy.on('finish', () => resolve(result));

    req.pipe(busboy);
  });
}

export default parser;
