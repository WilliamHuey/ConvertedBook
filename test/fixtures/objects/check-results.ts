// Native modules
import * as path from 'path';

export default class CheckResults {
  constructor() {
    Object.assign(this, {
      msg: 'Start building: html, pdf, and epub',
      conditions: {
        exactMatchBuildOrder: false,
        additionalArgsOverBuildOrder: true,
        onlyOneBuildFormat: false,
        multipleArgsNotDependentBuildOrder: false,
        emptyArgsValidFlags: false,
        allRequiredFlagsRecognized: true,
        someFlagsRequiredRecognized: false,
        recognizedFormats: ['html', 'pdf', 'epub'],
        normalizedFormats: ['html', 'pdf', 'epub'],
        flags: {
          input: path.join(__dirname, '../../../README.md'),
          output: path.join(__dirname, '../../temp/no-downloads/')
        },
        argv: ['html', 'pdf', 'epub']
      },
      continue: true
    });
  }
}
