// Native modules
import * as path from 'path';

// Library modules
import { currDir } from "../../src/utilities/filesystem.js"

const __dirname = currDir(import.meta.url);

// Remove generated testing files
// after the set of tests have completed
const baseTempFolder = path.join(__dirname, '../temp/');

const dryFlag = ['--dry-run'];

const testDataDirectory = path.join(__dirname, '../', 'fixtures/io/');

export {
  baseTempFolder,
  dryFlag,
  testDataDirectory
};
