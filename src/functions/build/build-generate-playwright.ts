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
  const server = createServer({ fileName: `${fileName}.html` });
  (async () => {

    // Pick a random port which is available
    const availablePort = await scouter.web();
    server.listen(availablePort, () => { });
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`localhost:${availablePort}`);
    await page.pdf({
      format: 'A4',
      printBackground: true,
      path: `${outPutFileName}.pdf`
    });
    console.log('Generated exact pdf');
    docsGenerated$.next('Generated exact pdf document');
    docsGenerated$.complete();
    await browser.close();
    server.close();
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
      createExactPdf({
        fileName: path.parse(flags.input).name,
        outPutFileName: normalizedOutputPath,
        docsGenerated$
      });
    });
}
