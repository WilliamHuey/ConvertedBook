// Third party modules
import { NEVER } from 'rxjs';
import { startWith } from 'rxjs/operators';

export default class AsyncCheckResults {
  constructor() {
    Object.assign(this, {
      msg: 'Creating output file',
      validInput: true,
      validOutput: true,
      outputFilename: 'stuff',
      continue: true,
      truncateOutput: true,
      outputFileExist$: NEVER.pipe(startWith(false))
    });
  }
}
