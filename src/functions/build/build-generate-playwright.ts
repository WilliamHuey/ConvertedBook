// Native modules
import * as path from 'path';

// Third party modules
import { chromium } from 'playwright';
import { take } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';

// Library modules
import { BuildGenerate } from './build-generate';

import serve from "../../commands/serve";

interface CreateExactPdf {
  port?: string | Number;
  fileName: string;
  outPutFileName: string;
  docsGenerated$: ReplaySubject<any>;
  additionalInputArgs: Record<any, any>;
}

// Assumed the exact generation is from a cli or programmatic 
// pdf generation event that is outside of the project generation.
// Project based generation will only use the inexact pdf generation
const createExactPdf = ({
  port, fileName, outPutFileName,
  docsGenerated$, additionalInputArgs
}: CreateExactPdf) => {
  (async () => {

    const serveRun$ = await serve.run(['--pandoc', 'true']);
    serveRun$
      .subscribe((serveProcess: any) => {
        let serverPortStr = "8080";
        serveProcess.stdout.on('data', async function (data: any) {

          // Read the server port from 'server-config.json' through the console
          const isServerPortStr = data.toString().includes("http://localhost:");
          if (isServerPortStr) {
            const [_str, serverPort] = data
              .toString().split("http://localhost:");
            serverPortStr = serverPort.replace(/\//g, "").trim();
          }

          if (data.toString().includes('Complete file format generation')) {
            const browser = await chromium.launch();
            const page = await browser.newPage();
            await page.goto(`localhost:${serverPortStr}`);

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

            console.log('Generated exact pdf');
            docsGenerated$.next('Generated exact pdf document');

            // TODO: Delete the html if exact generation of pdf
            // did not supply the html generation in the command cli
            docsGenerated$.complete();
            await browser.close();
            serveProcess.kill();
          }
        });
      });
  })();
}

export function playwrightGenerated({
  flags,
  normalizedOutputPath,
  buildDocuments$,
  docsGenerated$,
  additionalInputArgs
}: BuildGenerate) {
  buildDocuments$
    .pipe(take(1))
    .subscribe(() => {
      createExactPdf({
        fileName: path.parse(flags.input).name,
        outPutFileName: normalizedOutputPath,
        docsGenerated$,
        additionalInputArgs
      });
    });
}