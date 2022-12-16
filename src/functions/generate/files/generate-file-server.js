const { createServer } = require('vite');
const serverConfig = require('./server-config.json');

(async () => {
    const server = await createServer({
        configFile: "./vite.config.js",
        root: __dirname,
        server: serverConfig
    });

    await server.listen();

    server.printUrls();
})();
