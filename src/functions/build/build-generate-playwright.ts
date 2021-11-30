// Third party modules
import { chromium } from 'playwright';

// Library modules
import { BuildGenerate } from './build-generate';
import { createServer } from './build-server';

// TODO: Read the server port from snowpack dynamically

const snowpackDevServerPort = 8080;
const simpleServerPort = 9000;

const createExactPdf = () => {
  const server = createServer();
  server.listen(simpleServerPort, () => {
    (async () => {
      const browser = await chromium.launch()
      const page = await browser.newPage()
      await page.goto('https://duckduckgo.com')
      await page.pdf({
        format: 'A4',
        printBackground: true,
        path: '/output/test.pdf'
      });
      await browser.close();
      server.close();
    })();
  });
}

export function playwrightGenerated({
  input,
  normalizedFormats,
  flags,
  fileOutputExistence,
  checkFromServerCli,
  normalizedOutputPath
}: BuildGenerate) {
  createExactPdf();



}