const snowpack = require('snowpack'),
    path = require('path');

const { loadConfiguration, startServer } = snowpack;

(async function server() {
    const config = path.resolve(process.cwd(), 'snowpack.config.js');

    const config = await loadConfiguration({
        plugins: [
            ['./plugins/latex.js', {}],
            ["@snowpack/plugin-sass"]
        ],
        devOptions: {
            hmr: true,
            hmrErrorOverlay: false
        }

    }, config);
    startServer({ config });
})();
