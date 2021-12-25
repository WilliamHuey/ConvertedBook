
export const additionalCond = {
  exactMatchBuildOrder: true,
  additionalArgsOverBuildOrder: false,
  multipleArgsNotDependentBuildOrder: false,
  allRequiredFlagsRecognized: true,
  someFlagsRequiredRecognized: false,
  onlyOneBuildFormat: true,
  emptyArgsValidFlags: false,
};

export class Results {
  constructor() { }
  msg = '';

  conditions = {
    exactMatchBuildOrder: true,
    additionalArgsOverBuildOrder: false,
    multipleArgsNotDependentBuildOrder: false,
    allRequiredFlagsRecognized: true,
    someFlagsRequiredRecognized: false,
    onlyOneBuildFormat: true,
    emptyArgsValidFlags: false,
    recognizedFormats: [''],
    normalizedFormats: [''],
    flags: {},
    argv: ['']
  };

  continue = true
}

export class AsyncResults {
  constructor() { }
  msg = '';
  validInput = true;
  validOutput = true;
  outputFilename = '';
  continue = true;
  truncateOutput = true;
  fileOutputExistence = {};
}