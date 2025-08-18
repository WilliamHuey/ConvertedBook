// Source modules
import * as path from 'path';

// Third party modules
import { from, forkJoin, merge, Observable, ReplaySubject, of, combineLatest, race } from 'rxjs';
import { filter, map, takeLast, withLatestFrom, mergeMap, take, shareReplay, first } from 'rxjs/operators';
import { last, isNil } from 'ramda';
import { pathExists } from 'path-exists';

// Library modules
import Build from '../../commands/build.js';
import { buildLog, action, messagesKeys, messages } from './build-log.js';
import { BuildCheckGoodResults, BuildCheckResults, BuildMsg } from './build-checks.js';
import { supposedFileName, getFileNameFromParts, truncateFilePath }
  from './build-utilities.js';
import { ServerFileCheck } from "./build-report.js";
import { buildCliInputChecksOutput } from './build-cli-input-checks.js';

export type FileOutputExistence = Record<string, boolean>

export interface AsyncCheckResults {
  msg: string;
  validInput: boolean;
  validOutput: boolean;
  outputFilename: string;
  continue: boolean;
  truncateOutput: boolean;
  fileOutputExistence: FileOutputExistence;
  allDependenciesMet: boolean;
}

export type ServerjsBuild = buildCliInputChecksOutput

// Common operations checks when generating in a project folder and
// a non-project folder
function processBuildCliAsync(buildCli: BuildCheckGoodResults, inputOutputWithOutputFileName$: ReplaySubject<any>) {
  const { flags, normalizedFormats } = buildCli.conditions;
  const { input, output } = flags;

  const {
    filePathSplit: outputSplit,
    filePathFolder: outputFolder
  } = truncateFilePath(output);

  const lastOutputSplit = last(outputSplit)?.split('.');
  const supposeFileOutputParts = lastOutputSplit ?
    lastOutputSplit : [""],
    supposeFileInputParts = supposedFileName(input);

  // Get the file output name from the input file
  // when there is no output file name specified
  const supposeFileInputName = getFileNameFromParts(supposeFileInputParts);
  let supposeFileOutputName = getFileNameFromParts(supposeFileOutputParts);

  supposeFileOutputName = supposeFileOutputName?.length === 0 ?
    supposeFileInputName : supposeFileOutputName;

  const checkInputFile$ = from(pathExists(input) as
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

  const checkOutputFile$ = from(pathExists(output) as Promise<boolean>);

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
  const checkOutputFolder$ = from(pathExists(output) as Promise<boolean>);

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
      return { ...formatAcc, [format]: from(pathExists(`${outputFolder}/${supposeFileOutputName}.${format}`) as Promise<boolean>) };
    }, {}));

  // Another check for the actual output folder, by removing the
  // last portion of the path item from the initial output
  const truncatedOutputFolder$ = from(pathExists(outputFolder) as Promise<boolean>);

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
    .pipe(
      map(
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
      map(() => {
        return {
          truncateOutput: true
        }
      })
    );


  // Folder non existent, because the last portion
  // of the path is desired to be the new file name
  const intoOutputFolderNewFile$ = truncatedOutputFolderExists$
    .pipe(
      withLatestFrom(outputFolderNonExistent$),
      map(() => {
        return {
          truncateOutput: true
        }
      })
    );

  // Refer to just the folder which exist, and
  // can create the file directly in this folder
  const inputAndOutputExists$ = outputFolderExists$
    .pipe(
      withLatestFrom(inputFileExists$),
      map(() => {
        return {
          truncateOutput: false
        }
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
        map(() => {
          return {
            truncateOutput: false
          }
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

  const inputOutputChecksRun$ = outputFileName$
      .pipe(take(1), withLatestFrom(inputOutputChecks$), shareReplay(1));

  inputOutputChecksRun$
    .pipe(
      withLatestFrom(checkOutputFileFormatsPresence$),
      map(([[inputOutput, outputPath], fileOutputExistence]) => {
        if (fileOutputExistence) {
          return Object.assign({ fileOutputExistence }, outputPath, inputOutput);
        } else {
          return Object.assign({}, outputPath, inputOutput);
        }

      })
    )
  .pipe(take(1))
    .subscribe((res) => {
      inputOutputWithOutputFileName$.next(res);
    });
}

export type AsyncChecksGoodResults = AsyncCheckResults & BuildCheckResults

export type BuildCheckData = {
  fromOneOffBuild: Boolean;
  patchOutputPath: string;
}

type BuildFlags = {
    help: void;
    force: boolean;
    exact: boolean;
    input: string | undefined;
    output: string | undefined;
    'dry-run': boolean;
    pandoc: string | undefined;
    port: string | undefined;
} | {
    [flag: string]: any;
}

// Initially wanted the buildCliInputsAsyncChecks to run later that
// are async since they takes longer to resolve, but need to run async checks
// early before the synchronous buildCli checks
export function buildCliInputsAsyncChecks(this: Build,
  buildCmd: Record<any, any>,
  oneOffBuildFilesFromCli$: Observable<boolean>,
  portInfo: ServerFileCheck,
  serverjsBuild$: Observable<ServerjsBuild>,
  validServerPort$: Observable<ServerFileCheck>,
  invalidServerPort$: Observable<ServerFileCheck>,
  fromOneOffBuild: Boolean,
  consoleLogSubject$: ReplaySubject<{ }>) {

  let inputOutputWithOutputFileName$: ReplaySubject<AsyncCheckResults> = new ReplaySubject();
  let finalResults$: ReplaySubject<AsyncChecksGoodResults> = new ReplaySubject();

  // Gather warning messages because when an error message is present,
  // the warning messages shouldn't be logged out.
  let warningMsgs: Array<BuildMsg> = [];

  const relatedMsgs = { warning: warningMsgs};

  const multipleLogs = function(key:any) {
    warningMsgs.push({ msg: `${messages[messagesKeys[key]]}` });
    consoleLogSubject$.next({warning: messages[messagesKeys[key]] });
  }

  const buildCliChecks$ = merge(
    oneOffBuildFilesFromCli$,
    validServerPort$,
    invalidServerPort$
  ).pipe(
    first(),
    mergeMap(async () => {
      const parsedBuild = buildCmd;

      // Additional build check data.

      // Used to suppress some errors such as when the output option
      // is not provided and will infer the filename from the input
      // and will use the default path as the input file
      let buildCheckData: BuildCheckData = {
        fromOneOffBuild,
        patchOutputPath: ''
      };

      if (fromOneOffBuild) {
        if (!("output" in parsedBuild.flags)) {
          multipleLogs('outputfileOptionMissing');

          if ("input" in parsedBuild.flags) {
            const outputFormat = parsedBuild.args.description;

            // Selecting the first selected format as any format
            // should be valid, if not an error message will appear
            // early
            const suppliedOutputFile = parsedBuild.flags.output;

            // Default to using the parent folder of the input path
            // if the output path isn't given
            const parentDirOfInput = path.resolve(
              parsedBuild.flags.input,
              '..');

            const outputFileName = suppliedOutputFile ?
              suppliedOutputFile : `${parentDirOfInput}/output`;

            const patchOutputPath = `${outputFileName}.${outputFormat}`;

            // Add some data to for error suppression in the 'build checks'
            buildCheckData.patchOutputPath = patchOutputPath;
          }
        }
      } else {
        // Project folder warning that the output path
        // has been assumed
        if (!("output" in parsedBuild.flags)) {

          // The output path has been set elsewhere
          multipleLogs('outputfileOptionMissing');
        }
      }

      const buildChecks = !fromOneOffBuild ?
        this.buildChecks(parsedBuild, consoleLogSubject$, buildCheckData, serverjsBuild$, portInfo) :
        this.buildChecks(parsedBuild, consoleLogSubject$, buildCheckData, undefined, portInfo)

      // Add relate messages to the final results
      Object.assign(buildChecks, { relatedMsgs })

      // Async function wants a promise returned
      return buildChecks;
    }),
    shareReplay(1)
  )



  // Good results
  buildCliChecks$
  .pipe(
    filter(({ conditions }) => {
      return isNil(conditions) ? false : true;
    }),
    map((results) => {

      // Patch the conditions and conditions flags with the
      // output flag which makes it serves as a default
      // when it isn't provided

      if (results.conditions?.patchOutput) {
        if(results.conditions?.patchOutput.length > 0) {
          results.conditions.flags.output = results.conditions?.patchOutput;
        }
      }
      return results;
    }),
    mergeMap((buildChecks) => {
      processBuildCliAsync((buildChecks as BuildCheckGoodResults),
        inputOutputWithOutputFileName$);
      return combineLatest([inputOutputWithOutputFileName$, of(buildChecks)])
    })
  )
    .subscribe(([asyncCheckResults, buildCheckGoodResults]) => {
      finalResults$
        .next(Object.assign(buildCheckGoodResults, asyncCheckResults, { allDependenciesMet: true}));
    });

  // Bad results
  buildCliChecks$
    .pipe(
      filter((results) => {
        return results.continue === false ? true : false;
      })
    )
    .subscribe((buildCheckBadResults) => {
      finalResults$
        .next(Object.assign(buildCheckBadResults));
    });

  return finalResults$;
}
