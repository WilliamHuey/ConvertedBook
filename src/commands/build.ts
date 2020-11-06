// Third party modules
import { Command, flags } from '@oclif/command';
import { unnest } from 'ramda';
import { zip } from 'rxjs';
import { map, filter, mergeMap } from 'rxjs/operators';
const listify = require('listify');

// Library modules
import {
  buildReport, buildLog, buildCliInputsChecks,
  buildCliInputsAsyncChecks, BuildCheckResults,
  BuildCheckGoodResults, buildChecks, buildDependencies
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

  static examples = [
    '$ convertedbook build pdf',
  ]

  static requiredFlags = ['input', 'output']

  static optionalFlags = ['args']

  static flags = {
    help: flags.help({ char: 'h' }),
    input: flags.string({ char: 'i' }),
    output: flags.string({ char: 'o' }),
    args: flags.string({ char: 'a' })
  }

  static BuildWithOrder = ['html', 'pdf']

  static acceptedOutputFormats = unnest([Build.BuildWithOrder, 'epub'])

  static description = `Generate output format of your choosing from these following formats: ${listify(Build.acceptedOutputFormats)}`

  static requiredExternalDeps = ['pandoc', 'latex']

  async run() {
    const {
      showDepsUnsatisfied$,
      allDepsSatisfied$
    } = this.buildDependencies();

    // Can not continue further, and display the dependencies error message
    showDepsUnsatisfied$
      .subscribe(res => {
        this.log(`Build failed: These dependencies were not found in your path: ${res.join('')}`);
      });

    // All dependencies found, and can perform further checks
    // on the cli command inputs
    const buildCliResults$ = allDepsSatisfied$
      .pipe(
        map(
          () => {
            return this.buildCliInputsChecks();
          })
      );

    // End the checks early as critical problems are found
    // or required flags not satisfied
    const errorMessage$ = buildCliResults$
      .pipe(
        filter((result: BuildCheckResults) => {
          return !result.continue;
        })
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

    buildCliContinueGeneration$
      .subscribe(([buildCli, buildAsyncResults]) => {
        this.log(buildCli.msg.trim());
        this.log(buildAsyncResults.msg.trim());
      });

    const buildCliFlagProblems$ = zip(
      buildCliAsyncCheck$,
      buildCliAsyncResults$
        .pipe(
          filter(buildAsyncResults => {
            return !buildAsyncResults.continue;
          })
        )
    );

    buildCliFlagProblems$
      .subscribe(([_, buildAsyncResults]) => {
        this.log(buildAsyncResults.msg.trim());
      });

  }
}
