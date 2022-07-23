// Native modules
import * as path from 'path';

// Third party modules
import { test } from '@oclif/test';

// Observables resolution is slow and the
// tests need retries to prevent incorrect
// readings
const retryTest = function () {
  return test
    .retries(500);
};

// Remove generated testing files
// after the set of tests have completed
const baseTempFolder = path.join(__dirname, '../temp/');

const dryFlag = ['--dry-run'];

const testDataDirectory = path.join(__dirname, '../', 'fixtures/io/');

export {
  retryTest,
  baseTempFolder,
  dryFlag,
  testDataDirectory
};
