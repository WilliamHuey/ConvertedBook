// From https://stackoverflow.com/questions/16333790/node-js-quick-file-server-static-files-over-http/59088331#59088331

import * as http from 'http';
import { IncomingMessage, ServerResponse } from 'http';
import * as fs from 'fs';
import * as path from 'path';

interface CreateServer {
  fileName: string;
}

const mediaTypes: Record<string, string> = {
  zip: 'application/zip',
  jpg: 'image/jpeg',
  html: 'text/html',
}

const createServer = ({ fileName }: CreateServer) => {
  const server = http.createServer(function (_request: IncomingMessage, response: ServerResponse) {
    fs.readFile(fileName, function (err: NodeJS.ErrnoException | null, data: Buffer) {
      if (err) {
        response.statusCode = 404;
        return response.end('File not found or invalid request made.');
      }

      let mediaType = 'text/html';
      const ext = path.extname(fileName);
      if (ext.length > 0 && mediaTypes.hasOwnProperty(ext.slice(1))) {
        mediaType = mediaTypes[ext.slice(1)];
      }

      response.setHeader('Content-Type', mediaType);
      response.end(data);
    })
  });

  return server;
}

export {
  createServer
};