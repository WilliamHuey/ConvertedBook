const { createServer } = require('vite');

(async () => {
    const server = await createServer({
        configFile: "./vite.config.js",
        root: __dirname,
        server: {
            port: 8080
        }
    });

    await server.listen();

    server.printUrls();
})();
