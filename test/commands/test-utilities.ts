// Native modules
const path = require('path');

// Third party modules
import { test } from '@oclif/test';

// Observables resolution is slow and the
// tests need retries to prevent incorrect
// readings
const retryTest = function () {
  return test
    .retries(100);
};

// Remove generated testing files
// after the set of tests have completed
const baseTempFolder = path.join(__dirname, '../temp/');

const dryFlag = ['-d=true'];

export {
  retryTest,
  baseTempFolder,
  dryFlag
};
