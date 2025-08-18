// Vendor modules
import { Parcel } from '@parcel/core';
import watcher from '@parcel/watcher';
import _ from 'lodash';
import { pathExists } from 'path-exists';

// Native modules
import * as path from 'path';

// Library modules
import convertLatexToHtml from "./convert.js";
import { serverConfig } from './server-config.js';

async function startServerAndWatchFiles() {
    // Bundler options
    let bundler = new Parcel({
        entries: 'index.html',
        defaultConfig: '@parcel/config-default',
        serveOptions: {
            port: localhostPort
        },
        hmrOptions: {
            port: hmrPort
        }
    });

    const watchFiles = (_err, events) => {
        const eventData = events[0],
            { path: url } = eventData,
            fileName = path.basename(url);

        if (fileName === "index.tex") {
            console.log("File change: Index.tex");
            convertLatexToHtml({ localhostPort });
        }
    }

    // Watch specifically for .tex file changes since it is not
    // a typical file type that parcel monitors.
    // The index.tex triggers two events when file is changed.
    // Debounce this to prevent double conversion and to produce
    // less noise in the console.
    const changedDebounced = _.debounce(watchFiles, 200);
    await watcher.subscribe(process.cwd(), changedDebounced);

    // Watch starts the dev server with the bundler options
    await bundler.watch((err, event) => {
        if (err) {

            // Fatal error
            throw err;
        }

        if (event.type === 'buildSuccess') {
            let bundles = event.bundleGraph.getBundles();
            console.log(`Built ${bundles.length} bundles in ${event.buildTime}ms\n`);
        } else if (event.type === 'buildFailure') {
            console.log(event.diagnostics);
        }
    });
}

const localhostPort = serverConfig.port,
    hmrPort = localhostPort;

// Don't change the log statement. Need it to detect progress
console.log(`Starting server on localhost:${localhostPort}`);

const indexHtmlExists = await pathExists('index.html');

if (!indexHtmlExists) {

    // When the 'index.html' doesn't exist, this suggest an initial run.
    // Create the index.html before starting the server.
    const convertedBookBuild = convertLatexToHtml({ localhostPort });

    convertedBookBuild.stdout.on('data', (data) => {
        if (`${data}`.includes("Completed file format generation")) {
            startServerAndWatchFiles();
        }
    });
} else {
    startServerAndWatchFiles();
}