// Third party modules
import { generateFile } from '@raminjafary/sura';

// Library modules
import { BuildGenerate } from './build-generate';
import { createServer } from './build-server';

// TODO: Read the server port from snowpack dynamically

const snowpackDevServerPort = 8080;
const simpleServerPort = 9000;

const createExactPdf = () => {
}

export function playwrightGenerated({
  input,
  normalizedFormats,
  flags,
  fileOutputExistence,
  checkFromServerCli,
  normalizedOutputPath
}: BuildGenerate) {
  const server = createServer();
  server.listen(simpleServerPort, () => {
    console.log('Server started');
  });

}