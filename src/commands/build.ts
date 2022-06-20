// Third party module
import 'module-alias/register';

// Third party modules
import { Command, flags } from '@oclif/command';
import { unnest, difference, without } from 'ramda';
import { ReplaySubject, zip, merge, from } from 'rxjs';
import { filter, mergeMap, take, takeLast, mapTo } from 'rxjs/operators';
const IsThere = require('is-there');
const listify = require('listify');

// Library modules
import {
  buildReport, buildLog, buildCliInputsChecks,
  buildCliInputsAsyncChecks, BuildCheckResults,
  BuildCheckGoodResults, buildChecks, buildDependencies,
  buildGenerate, AsyncCheckResults
} from '../functions/build/build-import';

export default class Build extends Command {

  // Allow any number of arguments
  static strict = false;

  public buildReport = buildReport.bind(this)

  public buildLog = buildLog.bind(this)

  public buildCliInputsChecks = buildCliInputsChecks.bind(this)

  public buildCliInputsAsyncChecks = buildCliInputsAsyncChecks.bind(this)

  public buildChecks = buildChecks.bind(this)

  public buildDependencies = buildDependencies.bind(this)

  public buildGenerate = buildGenerate.bind(this)

  static examples = [
    '$ convertedbook build pdf',
  ]

  static requiredFlags = ['input', 'output']

  static optionalFlags = ['args']

  static flags = {
    help: flags.help({ char: 'h' }),
    force: flags.boolean({
      char: 'f',
      description: 'overwrite an existing output file'
    }),
    exact: flags.boolean({
      char: 'e',
      description: 'Only for pdf output. Generate pdf based on html instead of using Pandoc'
    }),
    input: flags.string({
      char: 'i',
      description: 'path of the input file to convert'
    }),
    output: flags.string({
      char: 'o',
      description: 'path of the output file destination'
    }),
    args: flags.string({ char: 'a' }),
    'dry-run': flags.boolean({
      char: 'd',
      description: 'test out the build command to see cli output without generating the actual output file(s)'
    }),
    pandoc: flags.string({
      char: 'p',
      description: 'Pandoc options'
    })
  }

  static aliases = ['b']

  static BuildWithOrder = ['html', 'pdf']

  static acceptedOutputFormats = unnest([Build.BuildWithOrder, 'epub'])

  static description = `Generate output format of your choosing from these following formats: ${listify(Build.acceptedOutputFormats)}`

  static requiredExternalDeps = ['pandoc', 'latex']

  async run() {

    // Used to determine status of the generated documents
    // after running the build command
    const docsGenerated$ = new ReplaySubject(undefined);

    // Build for a 'convertedbook' project.

    // Assume that the presence of the 'server.js'
    // will be enough to determine that a pdf will want
    // to be generated
    const checkServerFilepath$ = from(IsThere
      .promises.file('server.js') as Promise<boolean>);

    const hasServerFile$ = checkServerFilepath$
      .pipe(
        filter(hasServerFile => {
          return hasServerFile;
        })
      );

    // Build for inputs in cli
    const buildFilesFromCli$ = checkServerFilepath$
      .pipe(
        filter(hasServerFile => {
          return !hasServerFile;
        })
      );

    buildFilesFromCli$
      .subscribe(() => {
        const {
          showDepsUnsatisfied$,
          allDepsSatisfied$
        } = this.buildDependencies();

        // Can not continue further, and display the dependencies error message
        showDepsUnsatisfied$
          .subscribe(res => {
            this.log(`Build failed: These dependencies were not found in your path: ${without([''], res).join(', ')}`);
          });

        // All dependencies found, and can perform further checks
        // on the cli command inputs
        const buildCliResults$ = allDepsSatisfied$
          .pipe(
            mapTo(this.buildCliInputsChecks())
          );

        // End the checks early as critical problems are found
        // or required flags not satisfied
        const errorMessage$ = buildCliResults$
          .pipe(
            filter((result: BuildCheckResults) => {
              return !result.continue;
            }),
            take(1)
          );

        errorMessage$
          .subscribe(buildCli => {
            this.log(buildCli.msg.trim());
          });

        // Continue with the async checks as required flags are found
        const buildCliAsyncCheck$ = buildCliResults$
          .pipe(
            filter((result: BuildCheckResults) => {
              return result.continue;
            })
          );

        const buildCliAsyncResults$ = buildCliAsyncCheck$
          .pipe(
            mergeMap(buildCli => {
              const buildAsyncResults = this
                .buildCliInputsAsyncChecks((buildCli as BuildCheckGoodResults));
              return buildAsyncResults;
            })
          );

        // Valid input and output means file conversion can happen
        const buildCliContinueGeneration$ = zip(
          buildCliAsyncCheck$,
          buildCliAsyncResults$
            .pipe(
              filter(buildAsyncResults => {
                return buildAsyncResults.continue;
              })
            )
        );

        const dryRunBuild$ = buildCliContinueGeneration$
          .pipe(
            filter(([buildCli, _]) => {
              return (buildCli as BuildCheckGoodResults)
                .conditions.flags['dry-run'] === 'true';
            })
          );

        const buildRunMap: Record<string, Function> = {
          'dry-run': ([buildCli, buildAsyncResults]: [BuildCheckGoodResults, AsyncCheckResults]) => {

            // Dry run will only log out from console
            // meaning no file generation will occur
            this.log(buildCli.msg.trim());
            this.log(buildAsyncResults.msg.trim());
            docsGenerated$.next('');
            docsGenerated$.complete();

          },
          exact: (([buildCli, buildAsyncResults]: [BuildCheckGoodResults, AsyncCheckResults]) => {
            buildRunMap.default([{ ...buildCli, exactPdf: true }, buildAsyncResults]);
          }),
          force: (([buildCli, buildAsyncResults]: [BuildCheckGoodResults, AsyncCheckResults]) => {
            buildRunMap.default([buildCli, buildAsyncResults]);
          }),
          pandoc: ([buildCli, buildAsyncResults]: [BuildCheckGoodResults, AsyncCheckResults]) => {
            buildRunMap.default([{ ...buildCli, fromServerCli: true }, buildAsyncResults]);
          },
          default: ([buildCli, buildAsyncResults]: [BuildCheckGoodResults, AsyncCheckResults]) => {

            // Default build with file generation
            this.log(buildCli.msg.trim());
            this.log(buildAsyncResults.msg.trim());
            this.buildGenerate(buildCli as BuildCheckGoodResults, buildAsyncResults, docsGenerated$);
          }
        };

        const buildRunScenarios$ = merge(
          dryRunBuild$,
          buildCliContinueGeneration$
        )
          .pipe(takeLast(1));

        buildRunScenarios$
          .pipe(take(1))
          .subscribe(([buildCli, buildAsyncResults]) => {
            const flagOptions = (buildCli as BuildCheckGoodResults).conditions.flags;
            const options = difference(Object.keys(flagOptions), Build.requiredFlags);

            // Apply any flags selectively one at a time,
            // for custom changes for each flag other than 'input' and 'output'
            const optionsLen = options.length;

            if (optionsLen > 0) {

              // Apply the option as is the since there is no possibility
              // of interference from multiple options interactions
              if (optionsLen === 1) {
                buildRunMap[options[0]]([buildCli, buildAsyncResults]);
              } else {

                // Multiple options available
                const hasDryRunOpt = options.includes('dry-run');
                const hasExactOpt = options.includes('exact');
                const hasForceOpt = options.includes('force');
                const hasPandocOpt = options.includes('pandoc');

                if (hasDryRunOpt) {

                  // Dry run should not apply any options due to its
                  // lack of actions behavior
                  buildRunMap['dry-run']([buildCli, buildAsyncResults]);
                } else if (hasForceOpt) {
                  if (hasExactOpt) {
                    buildRunMap.default([{ ...buildCli, exactPdf: true }, buildAsyncResults]);
                  } else {
                    buildRunMap['force']([buildCli, buildAsyncResults]);
                  }
                } else if (hasPandocOpt) {
                  if (hasExactOpt) {
                    buildRunMap.default([{ ...buildCli, exactPdf: true, fromServerCli: true }, buildAsyncResults]);
                  } else {
                    buildRunMap['pandoc']([buildCli, buildAsyncResults]);
                  }
                } else if (hasExactOpt) {
                  buildRunMap['exact']([buildCli, buildAsyncResults]);
                }

              }
            } else {

              // Basic build command for generation
              buildRunMap.default([buildCli, buildAsyncResults]);
            }
          });

        // Log additional errors with flags
        const buildCliFlagProblems$ = zip(
          buildCliAsyncCheck$,
          buildCliAsyncResults$
            .pipe(
              filter(buildAsyncResults => {
                return !buildAsyncResults.continue;
              }),
              take(1)
            )
        );

        buildCliFlagProblems$
          .subscribe(([_, buildAsyncResults]) => {
            this.log(buildAsyncResults.msg.trim());
          });
      });

    return {
      docsGenerated$
      //dryRunBuild$
    };
  }
}
