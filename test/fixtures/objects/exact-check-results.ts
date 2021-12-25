// Native modules
import * as path from 'path';

// Library modules
import { Results, AsyncResults, additionalCond } from './base-results';

export class ExactCheckResults extends Results {
  constructor() {
    super();
  }

  msg = 'Start building: pdf';
  exactPdf = true;
  conditions = Object.assign({
    recognizedFormats: ['pdf'],
    normalizedFormats: ['pdf'],
    flags: {
      input: path.join(__dirname, '../../../README.md'),
      output: path.join(__dirname, '../../temp/no-downloads/'),
      exact: true,
      'dry-run': 'false'
    },
    argv: ['pdf']
  }, additionalCond);

}

export class ExactAsyncCheckResults extends AsyncResults {
  constructor() {
    super();
  }

  msg = 'Creating output file';
  outputFilename = 'exact-stuff';
  fileOutputExistence = { pdf: false };
}
