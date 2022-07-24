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

// TODO: Read the server port from snowpack dynamically
const snowpackDevServerPort = 8080;

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
        console.log(".subscribe ~ serveProcess", serveProcess, additionalInputArgs)

        serveProcess.stdout.on('data', async function (data: any) {
          if (data.toString().includes('Command completed.')) {
            const browser = await chromium.launch();
            const page = await browser.newPage();
            await page.goto(`localhost:${8080}`);
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