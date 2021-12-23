// Native modules
import * as path from 'path';

// Third party modules
import { clone } from 'ramda';

// Library modules
import { Results, AsyncResults } from './base-results';

export class ForceCheckResults {
  constructor() {
    Object.assign(this, clone(Results), {
      msg: 'Start building: html, pdf, and epub',
      conditions: {
        onlyOneBuildFormat: true,
        recognizedFormats: ['html'],
        normalizedFormats: ['html'],
        flags: {
          input: path.join(__dirname, '../../../README.md'),
          output: path.join(__dirname, '../../temp/no-downloads/'),
          force: true
        },
        argv: ['html']
      }
    });
  }
}

export class ForceAsyncCheckResults {
  constructor() {
    Object.assign(this, clone(AsyncResults), {
      msg: 'Creating output file',
      outputFilename: 'forced-stuff',
      fileOutputExistence: { html: false }
    });
  }
}
