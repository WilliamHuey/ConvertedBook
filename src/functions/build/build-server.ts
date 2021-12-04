// From https://stackoverflow.com/questions/16333790/node-js-quick-file-server-static-files-over-http/59088331#59088331

const http = require('http')
const fs = require('fs')
const path = require('path')

interface CreateServer {
  fileName: string;
}

process.on('uncaughtException',
  err => console.error('uncaughtException', err));
process.on('unhandledRejection',
  err => console.error('unhandledRejection', err));

const mediaTypes: Record<string, string> = {
  zip: 'application/zip',
  jpg: 'image/jpeg',
  html: 'text/html',
}

const createServer = ({ fileName }: CreateServer) => {
  const server = http.createServer(function (_request: any, response: any) {
    fs.readFile(fileName, function (err: any, data: any) {
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

