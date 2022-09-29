// Third party modules
import { from, forkJoin, merge, race, Observable, ReplaySubject } from 'rxjs';
import { filter, map, takeLast, withLatestFrom, mapTo } from 'rxjs/operators';
import { last } from 'ramda';
const IsThere = require('is-there');

// Library modules
import Build from '../../commands/build';
import { buildLog, action, messagesKeys } from './build-log';
import { BuildCheckGoodResults } from './build-checks';
import { supposedFileName, getFileNameFromParts, truncateFilePath }
  from './build-utilities';

export type FileOutputExistence = Record<string, boolean>

export interface AsyncCheckResults {
  msg: string;
  validInput: boolean;
  validOutput: boolean;
  outputFilename: string;
  continue: boolean;
  truncateOutput: boolean;
  fileOutputExistence: FileOutputExistence;
}

export interface ServerjsBuild {
  msg: string;
  continue: boolean;
  isServerJsFound$: Observable<Boolean>;
}

// Common operations checks when generating in a project folder and
// a non-project folder
function processBuildCliAsync(buildCli: BuildCheckGoodResults, inputOutputWithOutputFileName$: ReplaySubject<any>) {
  const { flags, normalizedFormats } = buildCli.conditions;
  const { input, output } = flags;
  const {
    filePathSplit: outputSplit,
    filePathFolder: outputFolder
  } = truncateFilePath(output);

  const supposeFileOutputParts = last(outputSplit)?.split('.'),
    supposeFileInputParts = supposedFileName(input);

  // Get the file output name from the input file
  // when there is no output file name specified
  const supposeFileInputName = getFileNameFromParts(supposeFileInputParts);
  let supposeFileOutputName = getFileNameFromParts(supposeFileOutputParts);
  supposeFileOutputName = supposeFileOutputName?.length === 0 ?
    supposeFileInputName : supposeFileOutputName;

  const checkInputFile$ = from(IsThere.promises.file(input) as
    Promise<boolean>);

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

  const outputFolderNonExistent$ = checkOutputFolder$
    .pipe(
      filter(outputFolder => {
        return !outputFolder;
      })
    );

  // Check against the existence of all the formats
  // specified in the build arguments
  const checkOutputFileFormatsPresence$ = forkJoin(normalizedFormats
    .reduce((formatAcc, format) => {
      return { ...formatAcc, [format]: from(IsThere.promises.file(`${outputFolder}/${supposeFileOutputName}.${format}`) as Promise<boolean>) };
    }, {}));

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
            log: messagesKeys.createOutputFile,
            data: {
              quantity: normalizedFormats.length
            }
          }),
          validInput: true,
          validOutput: true,
          outputFilename: supposeFileOutputName,
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
          outputFilename: supposeFileOutputName,
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
          outputFilename: supposeFileOutputName,
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
          outputFilename: supposeFileOutputName,
          continue: false
        };
      }
    ));

  // Output file name selection conditions:

  // The output file name actually exists,
  // and can proceed with the file name creation
  const existingOutputFolderAndOutputFile$ = truncatedOutputFolderExists$
    .pipe(
      withLatestFrom(outputFileExist$),
      mapTo({
        truncateOutput: true
      })
    );

  // Folder non existent, because the last portion
  // of the path is desired to be the new file name
  const intoOutputFolderNewFile$ = truncatedOutputFolderExists$
    .pipe(
      withLatestFrom(outputFolderNonExistent$),
      mapTo({
        truncateOutput: true
      })
    );

  // Refer to just the folder which exist, and
  // can create the file directly in this folder
  const inputAndOutputExists$ = outputFolderExists$
    .pipe(
      withLatestFrom(inputFileExists$),
      mapTo({
        truncateOutput: false
      })
    );

  // Invalid input or output still needs to provide
  // a truncate flag since it needs to combine with
  // the input and output check
  const invalidInputOrOutput$ = merge(
    inputFileNonExistent$,
    truncatedOutputFolderNonexistent$
      .pipe(
        withLatestFrom(outputFolderNonExistent$),
        mapTo({
          truncateOutput: false
        })
      )
  );

  const outputFileName$ = merge(
    inputAndOutputExists$,
    intoOutputFolderNewFile$,
    existingOutputFolderAndOutputFile$,
    invalidInputOrOutput$
  ).pipe(takeLast(1));

  const inputOutputChecks$ = merge(
    invalidInputInvalidOutput$,
    validInputInvalidOutput$,
    invalidInputValidOutput$,
    validInputOutput$
  ).pipe(takeLast(1));

  race(
    outputFileName$
      .pipe(
        withLatestFrom(inputOutputChecks$),
        withLatestFrom(checkOutputFileFormatsPresence$),
        map(([[inputOutput, outputPath], fileOutputExistence]) => {
          return Object.assign({ fileOutputExistence }, outputPath, inputOutput);
        })
      ),
    outputFileName$
      .pipe(
        withLatestFrom(inputOutputChecks$),
        map(([inputOutput, outputPath]) => {
          return Object.assign({}, outputPath, inputOutput);
        })
      )
  )
    .subscribe((res) => {
      console.log('res', res);

      inputOutputWithOutputFileName$.next(res);
    });
}

export function buildCliInputsAsyncChecks(this: Build, buildCli: BuildCheckGoodResults, serverjsBuild$: Observable<ServerjsBuild>, notProjectFolder$: Observable<Boolean>): ReplaySubject<AsyncCheckResults> {
  let inputOutputWithOutputFileName$: ReplaySubject<AsyncCheckResults> = new ReplaySubject();

  // TODO: Adapt serverjsBuild$ - pass in the observable to indicate to 'build-checks' that certain checks should be relaxed or nullified.
  serverjsBuild$
    .subscribe(() => {
      console.log("zzzzzzzzzzzzzBuild ||||| .subscribe ~ res")


      const buildChecks = (this.buildChecks(this.parse(),
        serverjsBuild$) as BuildCheckGoodResults);
      processBuildCliAsync(Object.assign(buildCli,
        { conditions: buildChecks.conditions }), inputOutputWithOutputFileName$);


    });

  // this.log('buildCli....', buildCli);

  notProjectFolder$
    .subscribe(() => {
      this.log('+/+.+>>+>+ non proj')
      processBuildCliAsync(buildCli, inputOutputWithOutputFileName$);
    });

  return inputOutputWithOutputFileName$;
}
