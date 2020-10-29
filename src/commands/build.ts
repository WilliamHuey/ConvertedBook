// Third party modules
import { Command, flags } from '@oclif/command';
import { all, cond, always, unnest } from 'ramda';
import { isString, isUndefined } from 'is-what';
import { from, forkJoin } from 'rxjs';
import { filter, map, first } from 'rxjs/operators';
const listify = require('listify');
const { lookpath } = require('lookpath');

// Library modules
import { buildReport } from '../functions/build/build-report';
import { buildLog, action, messagesKeys } from '../functions/build/build-log';
import { buildCliInputsChecks } from '../functions/build/build-cli-input-checks';

export default class Build extends Command {
  // Allow any number of arguments
  static strict = false;

  public buildReport = buildReport.bind(this)

  public buildLog = buildLog.bind(this)

  public buildCliInputsChecks = buildCliInputsChecks.bind(this)

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

  // Rigorous checks after more simple args and flags check,
  // used by 'buildCliInputsChecks'
  public buildChecks = ({ argv, flags }: { argv: string[]; flags: object }) => {
    // Get the status of the arguments
    const {
      conditionsHelpers,
      conditions
    } = this.buildReport({ argv, flags });

    const {
      argsCommaList,
      noValidFormats,
      unknownFormats,
      hasUnknownFormats
    } = conditionsHelpers;

    const {
      exactMatchBuildOrder,
      additionalArgsOverBuildOrder,
      onlyOneBuildFormat,
      multipleArgsNotDependentBuildOrder,
      emptyArgsValidFlags,
      allRequiredFlagsRecognized,
      someFlagsRequiredRecognized
    } = conditions;

    // Missing a required flag and can not continue
    if (someFlagsRequiredRecognized) {
      return {
        msg: this.buildLog({
          action: action.beforeStart,
          log: messagesKeys.someRequiredFlagsFound
        }),
        continue: false
      };
    }

    // No required flags present and will not continue
    if (!allRequiredFlagsRecognized) {
      return {
        msg: this.buildLog({
          action: action.beforeStart,
          log: messagesKeys.noRequiredFlagsFound
        }),
        continue: false
      };
    }

    // No more processing without any valid output formats
    if (!emptyArgsValidFlags && noValidFormats) {
      return {
        msg: this.buildLog({
          action: action.beforeStart,
          log: messagesKeys.noValidFormats,
          data: unknownFormats
        }),
        continue: false
      };
    }

    // Unknown format warning
    if (hasUnknownFormats) {
      console.log(this.buildLog({
        action: action.beforeStart,
        log: messagesKeys.ignoreUnknownFormats,
        data: unknownFormats
      }));
    }

    const buildArgsConds = cond([
      onlyOneBuildFormat,
      additionalArgsOverBuildOrder,
      exactMatchBuildOrder,
      multipleArgsNotDependentBuildOrder
    ].map(argsCond => {
      return [always(argsCond), () => {
        return {
          msg: this.buildLog({
            action: action.start,
            buildFormats: argsCommaList
          }),
          continue: true
        };
      }];
    }));

    // Build format matches where all the argument
    // conditions share the same log format
    const emptyArgsValidFlagsCond = cond(
      [
        [
          always(emptyArgsValidFlags),
          () => {
            return {
              msg: this.buildLog({
                action: action.start,
                buildFormats: listify(Build.acceptedOutputFormats)
              }),
              continue: true
            };
          }
        ]
      ]
    );

    return emptyArgsValidFlagsCond() || buildArgsConds();
  }

  async run() {
    // Check for presence of external dependencies
    const depCheckGroup$ = Build
      .requiredExternalDeps
      .map(extDep => {
        return from(lookpath(extDep));
      });

    // Run checks for all external dependencies at once
    const pathCheckResults$ = forkJoin(depCheckGroup$);

    // All extenal dependencies are found
    const allDepsSatisfied$ = pathCheckResults$
      .pipe(
        first(),
        filter((result: Array<any>) => {
          return all((resItem: string | undefined) => {
            return isString(resItem);
          }, result);
        })
      );

    // Some or all of the external dependencies can not be found
    const showDepsUnsatisfied$ = pathCheckResults$
      .pipe(
        first(),
        map((result: Array<any>) => {
          return result.map((resItem, resItemIndex) => {
            return isUndefined(resItem) ?
              Build.requiredExternalDeps[resItemIndex] : '';
          });
        }),
        filter(res => {
          return res.join('').length > 0;
        })
      );

    // Can not continue further, and display the error message
    showDepsUnsatisfied$
      .subscribe(res => {
        this.log(`Build failed: These dependencies were not found in your path: ${res.join('')}`);
      });

    // All dependencies found, and can perform further checks
    // on the cli command inputs
    allDepsSatisfied$
      .subscribe(() => {
        const output = this.buildCliInputsChecks();
        this.log(output.msg.trim());
      });
  }
}
