// Third party modules
import { from, forkJoin, merge } from 'rxjs';
import { filter, map, takeLast } from 'rxjs/operators';
import { init } from 'ramda';
const IsThere = require('is-there');

// Library modules
import Build from '../../commands/build';
import { buildLog, action, messagesKeys } from './build-log';
import { BuildCheckGoodResults } from './build-checks';

export function buildCliInputsAsyncChecks(this: Build, buildCli: BuildCheckGoodResults) {
  const { flags } = buildCli.conditions;
  const { input, output } = flags;

  const supposeOutputFolderName = init(output.split('/')),
    outputFolder = supposeOutputFolderName.join('/');

  const checkInputFile$ = from(IsThere.promises.file(input) as Promise<boolean>);

  const inputFileExists$ = checkInputFile$
    .pipe(
      filter(inputFile => {
        return inputFile;
      })
    );

  const inputFileNonExistent$ = checkInputFile$
    .pipe(
      filter(inputFile => {
        return !inputFile;
      })
    );

  const checkOutputFile$ = from(IsThere.promises.file(output) as Promise<boolean>);

  // Ouput file name points to existing file
  const outputFileExist$ = checkOutputFile$
    .pipe(
      filter(outputFile => {
        return outputFile;
      })
    );

  // File does not exists, means that is the new file
  // for the directory that is to be created
  const outputFileNonExistent$ = checkOutputFile$
    .pipe(
      filter(outputFile => {
        return !outputFile;
      })
    );

  // File will be written regardless if its current
  // directory exists

  // Assumed that output given is an actual valid folder path
  const checkOutputFolder$ = from(IsThere.promises.directory(output) as Promise<boolean>);

  const outputFolderExists$ = checkOutputFolder$
    .pipe(
      filter(outputFolder => {
        return outputFolder;
      })
    );

  // Another check for the actual output folder, by removing the
  // last portion of the path item from the initial output
  const truncatedOutputFolder$ = from(IsThere.promises.directory(outputFolder) as Promise<boolean>);

  const truncatedOutputFolderExists$ = truncatedOutputFolder$
    .pipe(
      filter(truncatedOutputFolder => {
        return truncatedOutputFolder;
      })
    );

  const truncatedOutputFolderNonexistent$ = truncatedOutputFolder$
    .pipe(
      filter(truncatedOutputFolder => {
        return !truncatedOutputFolder;
      })
    );

  // Truncated folder invalid is a direct invalidation
  // since the file generated can not find a suitable folder
  // to reside in
  const nonExistingOutputFileAndTruncatedFolder$ = forkJoin([
    outputFileNonExistent$,
    truncatedOutputFolderNonexistent$
  ]);

  // 'nonExistingOutputFileAndTruncatedFolder' is the only invalid output
  const invalidOutput$ = nonExistingOutputFileAndTruncatedFolder$;

  // Truncated folder exists means, that the output file
  // provides points to a new file intended to be made
  const nonExistingOutputFileAndExistingTruncatedFolder$ = forkJoin([
    outputFileNonExistent$,
    truncatedOutputFolderExists$
  ]);

  // All valid output scenarios
  const validOutput$ = merge([
    nonExistingOutputFileAndExistingTruncatedFolder$,
    // Existing folder means the file creation can continue
    outputFolderExists$,
    // Existing file means the file creation can continue
    outputFileExist$
  ]);

  const validInputOutput$ = forkJoin([
    inputFileExists$,
    validOutput$
  ])
    .pipe(map(
      () => {
        return {
          msg: buildLog({
            action: action.check,
            log: messagesKeys.createOutputFile
          }),
          validInput: true,
          validOutput: true,
          continue: true
        };
      }
    ));

  const invalidInputValidOutput$ = forkJoin([
    inputFileNonExistent$,
    validOutput$
  ])
    .pipe(map(
      () => {
        return {
          msg: buildLog({
            action: action.check,
            log: messagesKeys.invalidInputFile
          }),
          validInput: false,
          validOutput: true,
          continue: false
        };
      }
    ));

  const validInputInvalidOutput$ = forkJoin([
    inputFileExists$,
    invalidOutput$
  ])
    .pipe(map(
      () => {
        return {
          msg: buildLog({
            action: action.check,
            log: messagesKeys.invalidOutputFolderOrFile
          }),
          validInput: true,
          validOutput: false,
          continue: false
        };
      }
    ));

  const invalidInputInvalidOutput$ = forkJoin([
    inputFileNonExistent$,
    invalidOutput$
  ])
    .pipe(map(
      () => {
        return {
          msg: buildLog({
            action: action.check,
            log: messagesKeys.invalidInputAndOutput
          }),
          validInput: false,
          validOutput: false,
          continue: false
        };
      }
    ));

  return merge(
    invalidInputInvalidOutput$,
    validInputInvalidOutput$,
    invalidInputValidOutput$,
    validInputOutput$
  ).pipe(takeLast(1));
}
