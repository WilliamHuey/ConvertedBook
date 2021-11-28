// From https://stackoverflow.com/questions/16333790/node-js-quick-file-server-static-files-over-http/59088331#59088331

const http = require('http')
const fs = require('fs')
const path = require('path')

process.on('uncaughtException',
  err => console.error('uncaughtException', err))
process.on('unhandledRejection',
  err => console.error('unhandledRejection', err))

const publicFolder = '.'

const mediaTypes: Record<string, string> = {
  zip: 'application/zip',
  jpg: 'image/jpeg',
  html: 'text/html',
  /* add more media types */
}

const createServer = () => {
  const server = http.createServer(function (request: any, response: any) {
    console.log(request.method + ' ' + request.url)

    const filepath = path.join(publicFolder, request.url)

    fs.readFile(filepath, function (err: any, data: any) {
      if (err) {
        response.statusCode = 404
        return response.end('File not found or you made an invalid request.')
      }

      let mediaType = 'text/html'
      const ext = path.extname(filepath)
      if (ext.length > 0 && mediaTypes.hasOwnProperty(ext.slice(1))) {
        mediaType = mediaTypes[ext.slice(1)]
      }

      response.setHeader('Content-Type', mediaType)
      response.end(data)
    })
  });

  return server;
}

export {
  createServer
};

