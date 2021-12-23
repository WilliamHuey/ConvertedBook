export const Results = {
  msg: '',
  conditions: {
    exactMatchBuildOrder: false,
    additionalArgsOverBuildOrder: true,
    onlyOneBuildFormat: false,
    multipleArgsNotDependentBuildOrder: false,
    emptyArgsValidFlags: false,
    allRequiredFlagsRecognized: true,
    someFlagsRequiredRecognized: false,
    recognizedFormats: [],
    normalizedFormats: [],
    flags: {},
    argv: []
  },
  continue: true
};

export const AsyncResults = {
  msg: '',
  validInput: true,
  validOutput: true,
  outputFilename: '',
  continue: true,
  truncateOutput: true,
  fileOutputExistence: {}
};