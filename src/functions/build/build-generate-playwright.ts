// Third party modules
import { chromium } from 'playwright';

// Library modules
import { BuildGenerate } from './build-generate';
import { createServer } from './build-server';

interface CreateExactPdf {
  port: string | Number;
  fileName: string;
}

// TODO: Read the server port from snowpack dynamically

const snowpackDevServerPort = 8080;
const simpleServerPort = 9000;

const createExactPdf = ({ port, fileName }: CreateExactPdf) => {
  const server = createServer();
  server.listen(simpleServerPort, () => {
    (async () => {
      const browser = await chromium.launch();
      const page = await browser.newPage();
      await page.goto(`localhost:${port}`);
      await page.pdf({
        format: 'A4',
        printBackground: true,
        path: `${process.cwd()}/${fileName}.pdf`
      });
      await browser.close();
      console.log('gen');
      server.close();
    })();
  });
}

// TODO: Run the 'playwright' build for the exact pdf generation
export function playwrightGenerated({
  input,
  normalizedFormats,
  flags,
  fileOutputExistence,
  checkFromServerCli,
  normalizedOutputPath
}: BuildGenerate) {

  createExactPdf({
    port: simpleServerPort,
    fileName: 'test'
  });




}
