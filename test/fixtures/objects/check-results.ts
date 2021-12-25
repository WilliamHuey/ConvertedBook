// Native modules
import * as path from 'path';

// Library modules
import { Results, AsyncResults, additionalCond } from './base-results';

export class CheckResults extends Results {
  constructor() {
    super();
  }

  msg = 'Start building: html, pdf, and epub';
  exactPdf = false;
  conditions = Object.assign({
    flags: {
      input: path.join(__dirname, '../../../README.md'),
      output: path.join(__dirname, '../../temp/no-downloads/'),
      'dry-run': 'false'
    },
    recognizedFormats: ['html', 'pdf', 'epub'],
    normalizedFormats: ['html', 'pdf', 'epub'],
    argv: ['html', 'pdf', 'epub']
  }, additionalCond);
}

export class AsyncCheckRes extends AsyncResults {
  constructor() {
    super();
  }

  msg = 'Creating output file';
  outputFilename = 'stuff';
  fileOutputExistence = { html: false, pdf: false, epub: false };
}
