// Native modules
import * as path from 'path';

// Third party modules
import { chromium } from 'playwright';
import { take } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';
const scouter = require('port-scout');

// Library modules
import { BuildGenerate } from './build-generate';
import { createServer } from './build-server';

import serve from "../../commands/serve";

interface CreateExactPdf {
  port?: string | Number;
  fileName: string;
  outPutFileName: string;
  docsGenerated$: ReplaySubject<any>;
}

// TODO: Read the server port from snowpack dynamically
const snowpackDevServerPort = 8080;

const createExactPdf = ({
  port, fileName, outPutFileName,
  docsGenerated$
}: CreateExactPdf) => {
  // const server = createServer({ fileName: `${fileName}.html` });

  console.log('++++++++-------');

  (async () => {
    const serveRun$ = await serve.run([]);

    console.log('fasdgafsaisdf');

    // Pick a random port which is available
    // const availablePort = await scouter.web();
    // server.listen(availablePort, () => { });

    serveRun$
      .subscribe((serveProcess: any) => {
        console.log('serveProcess', serveProcess);

        serveProcess.stdout.on('data', async function (data: any) {
          console.log('data', data)
          if (data.toString().includes('Command completed.')) {
            console.log('done')

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

    // server.close();
  })();
}

export function playwrightGenerated({
  flags,
  normalizedOutputPath,
  buildDocuments$,
  docsGenerated$
}: BuildGenerate) {
  buildDocuments$
    .pipe(take(1))
    .subscribe(() => {
      console.log('++||||')
      createExactPdf({
        fileName: path.parse(flags.input).name,
        outPutFileName: normalizedOutputPath,
        docsGenerated$
      });
    });
}
