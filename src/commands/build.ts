// Third party modules
import { Command, flags } from '@oclif/command';
import { unnest } from 'ramda';
import { map, filter } from 'rxjs/operators';
const listify = require('listify');

// Library modules
import { buildReport } from '../functions/build/build-report';
import { buildLog } from '../functions/build/build-log';
import { buildCliInputsChecks, buildCliInputsAsyncChecks } from '../functions/build/build-cli-input-checks';
import { BuildCheckResults, BuildCheckGoodResults, buildChecks } from '../functions/build/build-checks';
import { buildDependencies } from '../functions/build/build-dependencies';

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
      .subscribe(output => {
        this.log(output.msg.trim());
      });

    // Continue with the async checks as required flags are found
    const buildCliAsyncCheck$ = buildCliResults$
      .pipe(
        filter((result: BuildCheckResults) => {
          return result.continue;
        })
      );

    buildCliAsyncCheck$
      .subscribe(output => {
        this.buildCliInputsAsyncChecks((output as BuildCheckGoodResults));
        this.log(output.msg.trim());
      });
  }
}
