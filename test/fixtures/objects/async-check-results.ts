export default class AsyncCheckResults {
  constructor() {
    Object.assign(this, {
      msg: 'Creating output file',
      validInput: true,
      validOutput: true,
      outputFilename: 'stuff',
      continue: true,
      truncateOutput: true,
      fileOutputExistence: { html: false, pdf: false, epub: false }
    });
  }
}
