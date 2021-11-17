const snowpack = require('snowpack'),
    path = require('path'),
    { lookpath } = require('lookpath');

const { loadConfiguration, startServer } = snowpack;
const convertedbookCliName = 'convertedbook';

(async () => {
    const configPath = path.resolve(process.cwd(), 'snowpack.config.js');

    const config = await loadConfiguration({
        devOptions: {
            hmr: true
        }
    }, configPath);

    const convertedBookPath = await lookpath(convertedbookCliName);
    if (convertedBookPath) {
        startServer({ config });
    } else {
        console.log(`ERROR: "${convertedbookCliName}" is not found in the path! Server can not be started.`);
    }
})();
