// Native modules
import * as path from 'path';

// Library modules
import { Results, AsyncResults, additionalCond } from './base-results';

export class ForceCheckResults extends Results {
  constructor() {
    super();
  }

  msg = 'Start building: html, pdf, and epub';
  exactPdf = false;
  conditions = Object.assign({
    onlyOneBuildFormat: true,
    recognizedFormats: ['html'],
    normalizedFormats: ['html'],
    flags: {
      input: path.join(__dirname, '../../../README.md'),
      output: path.join(__dirname, '../../temp/no-downloads/'),
      force: true,
      'dry-run': 'false'
    },
    argv: ['html']
  }, additionalCond);
}

export class ForceAsyncCheckResults extends AsyncResults {
  constructor() {
    super();
  }

  msg = 'Creating output file';
  outputFilename = 'forced-stuff';
  fileOutputExistence = { html: false };
}
