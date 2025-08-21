// Third party modules
import { Args, Command, Flags } from '@oclif/core';
import { unnest, difference, without } from 'ramda';
import { ReplaySubject, merge, from, of, Observable, forkJoin } from 'rxjs';
import { filter, mergeMap, take, skipUntil, shareReplay, takeUntil, first } from 'rxjs/operators';
import { pathExists } from 'path-exists';
import listify from 'listify';

// Library modules
import {
  buildReport, buildLog,
  buildCliInputsAsyncChecks,
  BuildCheckResults, BuildCheckGoodResults, buildChecks, buildDependencies,
  buildGenerate, AsyncCheckResults, buildCliInputChecksOutput,
  serverFileCheck,
  messages,
  messagesKeys
} from '../functions/build/build-import.js';
import { configurationValues } from '../functions/shared/configuration-values.js';
import ConsoleLog from '../functions/shared/console-log.js'

export default class Build extends Command {
 constructor(args: string[], config: any) {
    super(args, config);

    // Use a logger for general message logging
    const consoleLog = new ConsoleLog();
    const {
      consoleLog$, consoleWarningLog$, consoleErrorLog$,
      consoleLogSubject$ } = consoleLog.create();

    Build.consoleLog$ = consoleLog$;
    Build.consoleWarningLog$ = consoleWarningLog$;
    Build.consoleErrorLog$ = consoleErrorLog$;
    Build.consoleLogSubject$ = consoleLogSubject$;
  }

  static consoleLog$: Observable<any>;
  static consoleWarningLog$: Observable<any>;
  static consoleErrorLog$: Observable<any>;
  static consoleLogSubject$: ReplaySubject<{}>;

  static description = 'Convert the LaTeX file to HTML, EPUB or PDF'

  static examples = [
    {
      command: '<%= config.bin %> <%= command.id %> html --input="./index.tex"',
      description: `One-off build - Operate on an LaTeX file that resides
      outside of a project folder.

      This outputs to an html file and assumes that destination file resides in
      the same location as the input file. The input option is required`
    },
    {
      command: '<%= config.bin %> <%= command.id %> pdf --input="./index.tex" --exact',
      description: `One-off build - Can specify an "exact" option for the
      output pdf file to use playwright to get an precise mirror representation
      of the document based on the web page display of the document.`
    }
  ]

  static requiredFlags = ['input', 'output']
  static optionalFlags = ['args']
  static BuildWithOrder = ['html', 'pdf']
  static acceptedOutputFormats = unnest([Build.BuildWithOrder, 'epub'])
  static requiredExternalDeps = ['pandoc', 'latex']

  // Allow any number of arguments
  static strict = false;

  public buildReport = buildReport.bind(this)
  public buildLog = buildLog.bind(this)
  public buildCliInputsAsyncChecks = buildCliInputsAsyncChecks.bind(this)
  public buildChecks = buildChecks.bind(this)
  public buildDependencies = buildDependencies.bind(this)
  public buildGenerate = buildGenerate.bind(this)

  static aliases = ['b']

  static flags = {
    help: Flags.help({ char: 'h' }),
    force: Flags.boolean({
      char: 'f',
      description: 'Overwrite an existing output file'
    }),
    exact: Flags.boolean({
      char: 'e',
      description: 'Only for pdf output. Generate pdf based on html instead of using Pandoc'
    }),
    input: Flags.string({
      char: 'i',
      description: 'Path of the input file to convert'
    }),
    output: Flags.string({
      char: 'o',
      description: 'Path of the output file destination'
    }),
    'dry-run': Flags.boolean({
      char: 'd',
      description: 'Test out the build command to see cli output without generating the actual output file(s)'
    }),
    pandoc: Flags.string({
      char: 'p',
      description: 'Pandoc options',
      hidden: true
    }),
    port: Flags.string({
      description: 'Build server port'
    })
  }

  static logOrder = ['info', 'warning']

  static args = {
    description: Args.string({ description: `Generate output format of your choosing from these following formats: ${listify(Build.acceptedOutputFormats)}` }),
  }

  public async run(): Promise<{
    docsGenerated$: ReplaySubject<any>
    asyncResultsLog$: ReplaySubject<any>
    consoleErrorLog$: Observable<any>,
    consoleLog$: Observable<any>,
    consoleWarningLog$: Observable<any>
  }> {
    const buildCmd = await this.parse(Build);

    const { raw, flags } = buildCmd;

    const hasDryRunFlag = flags['dry-run'] === true ? true : false;

    // Get extra information to know if this build command is
    // being initiated from the cli for building a file or from
    // the project folder.
    const additionalInputArgs = raw[raw.length - 1];

    // Used to determine status of the generated documents
    // after running the build command
    const docsGenerated$ = new ReplaySubject(undefined);

    // Log the checked results
    const asyncResultsLog$: ReplaySubject< BuildCheckResults>  = new ReplaySubject(undefined);

    // Build for a 'convertedbook' project.

    // Assume that the presence of the 'server.js'
    // will be enough to determine that a pdf will want
    // to be generated
    const checkServerFilepath$ = from(pathExists
      ('server.js') as Promise<boolean>);

    // Synonymous with server reload since reloads from
    // latex files trigger this path
    const hasServerFile$ = checkServerFilepath$
      .pipe(
        filter(hasServerFile => {
          return hasServerFile;
        })
      );

    // Build for inputs in cli
    const oneOffBuildFilesFromCli$ = checkServerFilepath$
      .pipe(
        filter(hasServerFile => {
          return !hasServerFile;
        })
      );

    // Earlier preliminary checks for the server.js file
    // since by the time actual server command runs, it is too
    // late to perform validation on the port since it runs
    // after many of the build checks are performed

    // The 'server-config.js' file will need to be checked
    const reportServerFile$ = hasServerFile$
      .pipe(
        mergeMap(() => {
          return serverFileCheck({ serverFileName: 'server-config.js' });
        })
      );

    const validServerPort$ = reportServerFile$
      .pipe(
        filter((report) => {
          return report.customPortValid;
        })
      );

    const invalidServerPort$ = reportServerFile$
      .pipe(
        filter((report) => {
          return !report.customPortValid;
        })
      );

    // Server reloads and cli conversion take the
    // usual build branch conditions
    merge(
      hasServerFile$,
      oneOffBuildFilesFromCli$
    )
    .pipe(

      // Add in the port data
      mergeMap((result) => {
        if (result) {
          return forkJoin([
            of({ fromProjectFolder: true}),
            merge(validServerPort$, invalidServerPort$).pipe(first())
          ]);
        } else {
          return forkJoin([
            of({ fromProjectFolder: false }),
            oneOffBuildFilesFromCli$
          ]);
        }
      }),
    )
      .subscribe(([projectInfo, portInfoObj]) => {

        let portInfo = typeof portInfoObj === "object"
          ? portInfoObj : {
          customPort: null,
          customPortValid: false,
          default: configurationValues.serverConfig.port,
        };

        const { fromProjectFolder } = projectInfo;

        const {
          showDepsUnsatisfied$,
          allDepsSatisfied$
        } = this.buildDependencies();

        // Can not continue. Display the dependencies error message
        showDepsUnsatisfied$
          .subscribe(res => {
            this.log(`${messages[messagesKeys.dependenciesNotMet]} ${without([''], res).join(', ')}`);
          });

        // All dependencies found, and can perform further checks
        // on the cli command inputs
        const asyncBuildCliResults$ = allDepsSatisfied$
          .pipe(
            filter(() => {
              fromProjectFolder
              return fromProjectFolder;
            }),
            mergeMap(() => {

              // Branch1: valid server
              //  create observable with validServerPort$
              //  and calling of 'buildCliInputsAsyncChecks'
              // probably skipping the buildCliInputsAsyncChecks
              // call later on
              const fromOneOffBuild = false;

              return this.buildCliInputsAsyncChecks(
                buildCmd,
                oneOffBuildFilesFromCli$,
                portInfo,
                serverjsBuild$,
                validServerPort$,
                invalidServerPort$,
                fromOneOffBuild,
                Build.consoleLogSubject$
              );

            }),
            shareReplay(1)
          );
  
        const oneOffBuildCliResults$ = allDepsSatisfied$
          .pipe(
            filter(() => {
              return !((fromProjectFolder && typeof portInfo === "object"));
            }),
            mergeMap(() => {
              return oneOffBuildFilesFromCli$;
            }),

            mergeMap(() => {
              const fromOneOffBuild = true;

              return this.buildCliInputsAsyncChecks(
                buildCmd,
                oneOffBuildFilesFromCli$,
                portInfo,
                serverjsBuild$,
                validServerPort$,
                invalidServerPort$,
                fromOneOffBuild,
                Build.consoleLogSubject$
              );
            }),
            shareReplay(1)
          );

        // Allow build command inside a project folder without displaying
        // the error messages.

        // Alias the asyncBuildCliResults
        const serverjsBuild$: Observable<buildCliInputChecksOutput> = asyncBuildCliResults$
          .pipe(
            skipUntil(validServerPort$),
            shareReplay(1)
          );

        // End the checks early as critical problems are found
        // or required flags not satisfied
        const foundServerjsErrorMessage$ = merge(hasServerFile$
          .pipe(
            mergeMap(() => {
              return asyncBuildCliResults$;
            })
          ), oneOffBuildCliResults$)
          .pipe(
            filter((result: BuildCheckResults) => {
              return !result.continue;
            }),
            take(1)
          );

        // Also log the status when there are no errors
        oneOffBuildCliResults$
          .pipe(
            filter((result: BuildCheckResults) => {
              return result.continue;
            }),
            take(1)
          )
          .subscribe(buildCli => {
            asyncResultsLog$.next(buildCli);
          });

        const logRelatedMsg$ = asyncResultsLog$
        .pipe(
          takeUntil(foundServerjsErrorMessage$),
          take(1),
          filter((result) => {

            const hasWarningMsg = Array.isArray(result?.
              relatedMsgs?.warning) &&
              result?.relatedMsgs?.warning?.length ?
              result?.relatedMsgs?.warning?.length > 0 : false;

            const hasInfoMsg = Array.isArray(result?.
              relatedMsgs?.info) &&
              result?.relatedMsgs?.info?.length ?
              result?.relatedMsgs?.info?.length > 0 : false

            return hasWarningMsg || hasInfoMsg ?
              true : false ;
          })
        )

        logRelatedMsg$
          .subscribe((results) => {
 
            if (results?.relatedMsgs) {
              results.relatedMsgs

              Build.logOrder.forEach((msgType) => {
                if (results?.relatedMsgs?.[msgType]) {
                  const msgInfo = results?.relatedMsgs?.[msgType][0];
                  if (msgInfo?.msg?.length) {
                    this.log(msgInfo?.msg);
                  }
                }
              });
            }
          })

        foundServerjsErrorMessage$
          .subscribe(buildCli => {
            this.log(buildCli.msg.trim());
            asyncResultsLog$.next(buildCli);
          });

        // Log out the info message for the dry-run
        // on error condition too
        foundServerjsErrorMessage$
          .pipe(filter(() => {
            return hasDryRunFlag;
          }))
          .subscribe(() => {
            this.log(messages[messagesKeys.dryRunInfo] as string);
          });

        // Continue with the async checks as required flags are found
        const buildCliAsyncCheck$ = merge(oneOffBuildCliResults$, serverjsBuild$)
          .pipe(
            filter((result: BuildCheckResults) => {
              return result.continue;
            }),
            shareReplay(1)
          );

        // Valid input and output means file conversion can happen
        const buildCliContinueGeneration$ = buildCliAsyncCheck$
          .pipe(
            filter(buildAsyncResults => {
              return buildAsyncResults.continue;
            })
          );

        // Dry run should still allow continuation even when facing
        // a continue value of false
        const continuationOnContFalse$ = buildCliAsyncCheck$
          .pipe(
            filter(buildAsyncResults => {
              return !buildAsyncResults.continue;
            })
          )
          .pipe(
            filter(buildCli => {
              return (buildCli as BuildCheckGoodResults)
                .conditions.flags['dry-run'] === 'true';
            })
          );

        const dryRunBuild$ = continuationOnContFalse$;

        const buildRunMap: Record<string, Function> = {
          'dry-run': (_buildCli: BuildCheckResults) => {

            // Dry run will only log out from console
            // meaning no file generation will occur
            docsGenerated$.next('next');
            Build.consoleLogSubject$.next({info: messages[messagesKeys.dryRunInfo] });
            docsGenerated$.complete();
          },
          exact: ((buildCli: BuildCheckResults) => {
            buildRunMap.default({ ...buildCli, exactPdf: true });
          }),
          force: ((buildCli: BuildCheckResults) => {
            buildRunMap.default(buildCli);
          }),
          pandoc: (buildCli: BuildCheckResults) => {
            buildRunMap.default({ ...buildCli, fromServerCli: true });
          },
          default: (buildCli: any) => {

            // Default build with file generation
            this.buildGenerate(buildCli as (BuildCheckGoodResults & AsyncCheckResults), docsGenerated$, Build.consoleLogSubject$, additionalInputArgs);
          }
        };

        const buildRunScenarios$ = merge(
          dryRunBuild$,
          buildCliContinueGeneration$
        ).pipe(take(1));

        buildRunScenarios$
          .subscribe((buildCli) => {
            const flagOptions = (buildCli as BuildCheckGoodResults).conditions.flags;
            const options = difference(Object.keys(flagOptions), Build.requiredFlags);

            // Apply any flags selectively one at a time,
            // for custom changes for each flag other than 'input' and 'output'
            const optionsLen = options.length;

            if (optionsLen > 0) {

              // Apply the option as is since there is no possibility
              // of interference from multiple options interactions

                // Multiple options available
                const hasDryRunOpt = options.includes('dry-run');
                const hasExactOpt = options.includes('exact');
                const hasForceOpt = options.includes('force');
                const hasPandocOpt = options.includes('pandoc');

                if (hasDryRunOpt) {

                  // Dry run should not apply any options due to its
                  // lack of actions behavior
                  buildRunMap['dry-run'](buildCli);
                } else if (hasForceOpt) {
                  if (hasExactOpt) {
                    buildRunMap.default([{ ...buildCli, exactPdf: true }]);
                  } else {
                    buildRunMap['force'](buildCli);
                  }
                } else if (hasPandocOpt) {
                  if (hasExactOpt) {
                    buildRunMap.default({ ...buildCli, exactPdf: true, fromServerCli: true });
                  } else {
                    buildRunMap['pandoc'](buildCli);
                  }
                } else if (hasExactOpt) {
                  buildRunMap['exact'](buildCli);
                }

            } else {

              // Basic build command for generation
              buildRunMap.default(buildCli);
            }
          });

        // Log additional errors with flags
        const buildCliFlagProblems$ = merge(buildCliAsyncCheck$, oneOffBuildCliResults$)
          .pipe(
            filter(buildAsyncResults => {
              return !buildAsyncResults.continue;
            }),
            take(1)
          )

          buildCliFlagProblems$
          .pipe(takeUntil(foundServerjsErrorMessage$))
          .subscribe((buildAsyncResults: any) => {
            this.log(buildAsyncResults.msg.trim());
          });
      });

      // Log out only the informational messages
      Build.consoleLog$
        .subscribe((msgs) => {
          const lastestMsg = msgs[msgs.length - 1];
          this.log(lastestMsg.info);
        });

    return {
      docsGenerated$,
      asyncResultsLog$,
      consoleLog$: Build.consoleLog$,
      consoleWarningLog$: Build.consoleWarningLog$,
      consoleErrorLog$: Build.consoleErrorLog$
    };
  }

}