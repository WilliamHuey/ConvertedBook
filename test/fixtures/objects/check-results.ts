// Native modules
import * as path from 'path';

// Third party modules
import { clone } from 'ramda';

// Library modules
import { Results, AsyncResults } from './base-results';

export class CheckResults {
  constructor() {
    Object.assign(this, clone(Results), {
      msg: 'Start building: html, pdf, and epub',
      conditions: {
        flags: {
          input: path.join(__dirname, '../../../README.md'),
          output: path.join(__dirname, '../../temp/no-downloads/')
        },
        recognizedFormats: ['html', 'pdf', 'epub'],
        normalizedFormats: ['html', 'pdf', 'epub'],
        argv: ['html', 'pdf', 'epub']
      },
      continue: true
    });
  }
}

export class AsyncCheckRes {
  constructor() {
    Object.assign(this, clone(AsyncResults), {
      msg: 'Creating output file',
      outputFilename: 'stuff',
      fileOutputExistence: { html: false, pdf: false, epub: false }
    });
  }
}
