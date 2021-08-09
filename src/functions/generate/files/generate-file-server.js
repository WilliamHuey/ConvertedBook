const snowpack = require('snowpack'),
    path = require('path');

const { loadConfiguration, startServer } = snowpack;

(async () => {
    const configPath = path.resolve(process.cwd(), 'snowpack.config.js');

    const config = await loadConfiguration({
        devOptions: {
            hmr: true,
            hmrErrorOverlay: false
        }
    }, configPath);
    startServer({ config });
})();
