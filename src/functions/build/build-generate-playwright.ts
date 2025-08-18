import http from "http";

// Third party modules
import { chromium } from 'playwright';
import { take } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';
import getPort from 'get-port';

// Library modules
import { BuildPlaywrightGenerate } from './build-generate.js';

import serve from "../../commands/serve.js";
interface CreateExactPdf {
  port?: string | Number;
  outPutFileName: string;
  docsGenerated$: ReplaySubject<any>;
  additionalInputArgs: Record<any, any>;
}

// Helper function to wait for localhost before launching chromium
// from playwright
function waitForServerReady(url: string, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    (function check() {
      http.get(url, res => {
        res.destroy();
        resolve(null);
      }).on('error', () => {
        if (Date.now() - start > timeout) {
          reject(new Error('Timeout waiting for server'));
        } else {
          setTimeout(check, 200);
        }
      });
    })();
  });
}

// Default port for generation
let serverPortStr = 8000;

// Assumed the exact generation is from a cli or programmatic
// pdf generation event that is outside of the project generation.
// Project based generation will only use the inexact pdf generation
const createExactPdf = ({
  outPutFileName,
  docsGenerated$, additionalInputArgs
}: CreateExactPdf) => {
  (async () => {
    const serveRun$ = await serve.run(['--pandoc', 'true', '--options', JSON.stringify(additionalInputArgs)]);

    const chromiumPort = await getPort({ port: 9000 })
    serveRun$
      .subscribe((serveProcess: any) => {
        serveProcess.stdout.on('data', async function (data: any) {

          // Read the server port from 'server-config.js' through the console
          let [_str, serverPort] = data
            .toString().split("localhost:");

          if (serverPort) {
            serverPortStr = parseInt(serverPort
              .replace(/\//g, "").trim(), 10);
          }

          if (data.toString().includes('Created following: html')) {

            await waitForServerReady(`http://localhost:${serverPortStr}`);

            const browser = await chromium.launch({
              args: [`--remote-debugging-port=${chromiumPort}`],
              headless: true
            });
            const page = await browser.newPage();

            await page.goto(`http://127.0.0.1:${serverPortStr}`)

            // Remove the helper JavaScript helper elements:
            // table of contents dropdown menu
            const elementHandle = await page.$('#convertedbook-interactions');
            if (elementHandle) {
              await elementHandle.evaluate(node => {
                node.remove();
              });
            }

            await page.pdf({
              format: 'A4',
              printBackground: true,
              path: `${outPutFileName}.pdf`
            });

            await browser.close();
            serveProcess.kill();

            docsGenerated$.next('Generated exact pdf document');

            // TODO: Delete the html if exact generation of pdf
            // did not supply the html generation in the command cli

            docsGenerated$.complete();
          }
        });
      });
  })();
}

export function playwrightGenerated({
  normalizedOutputPath,
  buildDocuments$,
  docsGenerated$,
  additionalInputArgs
}: BuildPlaywrightGenerate) {
  buildDocuments$
    .pipe(take(1))
    .subscribe(() => {
      createExactPdf({
        outPutFileName: normalizedOutputPath,
        docsGenerated$,
        additionalInputArgs
      });
    });
}