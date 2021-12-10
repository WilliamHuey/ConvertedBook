// Native modules
import * as path from 'path';

// Third party modules
import { chromium } from 'playwright';
import { take } from 'rxjs/operators';
const scouter = require('port-scout');

// Library modules
import { BuildGenerate } from './build-generate';
import { createServer } from './build-server';

interface CreateExactPdf {
  port?: string | Number;
  fileName: string;
  outPutFileName: string
}

// TODO: Read the server port from snowpack dynamically
const snowpackDevServerPort = 8080;

const createExactPdf = ({
  port, fileName, outPutFileName
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
    await browser.close();
    server.close();

  })();

}

export function playwrightGenerated({
  flags,
  normalizedOutputPath,
  buildDocuments$
}: BuildGenerate) {
  buildDocuments$
    .pipe(take(1))
    .subscribe(() => {
      createExactPdf({
        fileName: path.parse(flags.input).name,
        outPutFileName: normalizedOutputPath
      });
    });
}
