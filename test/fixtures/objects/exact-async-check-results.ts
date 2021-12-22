export default class ExactAsyncCheckResults {
  constructor() {
    Object.assign(this, {
      msg: 'Creating output file',
      validInput: true,
      validOutput: true,
      outputFilename: 'exact-stuff',
      continue: true,
      truncateOutput: true,
      fileOutputExistence: { pdf: false }
    });
  }
}
