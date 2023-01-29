import busboy from 'busboy';
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

    const bb = busboy({
      headers, 
    });

    const result: any = {};

    bb.on('file', (name, file, { filename, encoding, mimeType } ) => {
      file.on('data', (chunk: Buffer) => {
        result.chunk = result.chunk
          ? Buffer.concat([result.chunk, chunk])
          : chunk;
      });

      file.on('end', () => {
        result.filename = filename;
        result.contentType = mimeType;
      });
    });

    bb.on('field', (fieldname, value) => {
      result[fieldname] = value;
    });

    bb.on('error', (error) => reject(error));

    bb.on('close', () => resolve(result));

    req.pipe(bb);
  });
}

export default parser;
