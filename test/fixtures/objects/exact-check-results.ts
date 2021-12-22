// Native modules
import * as path from 'path';

export default class ExactCheckResults {
  constructor() {
    Object.assign(this, {
      msg: 'Start building: pdf',
      exactPdf: true,
      conditions: {
        exactMatchBuildOrder: false,
        additionalArgsOverBuildOrder: true,
        onlyOneBuildFormat: true,
        multipleArgsNotDependentBuildOrder: false,
        emptyArgsValidFlags: false,
        allRequiredFlagsRecognized: true,
        someFlagsRequiredRecognized: false,
        recognizedFormats: ['pdf'],
        normalizedFormats: ['pdf'],
        flags: {
          input: path.join(__dirname, '../../../README.md'),
          output: path.join(__dirname, '../../temp/no-downloads/'),
          exact: true
        },
        argv: ['pdf']
      },
      continue: true
    });
  }
}
