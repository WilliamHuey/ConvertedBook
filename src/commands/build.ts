// Third party modules
import { Command, flags } from '@oclif/command';
import { match, when } from 'ts-pattern';
import { cond, always, unnest } from 'ramda';
const listify = require('listify');
const { lookpath } = require('lookpath');
import { from, forkJoin } from 'rxjs';

// Library modules
import { buildReport } from '../functions/build/build-report';
import { buildLog, action, messagesKeys } from '../functions/build/build-log';

export default class Build extends Command {
  // Allow any number of arguments
  static strict = false;

  public buildReport = buildReport.bind(this)

  public buildLog = buildLog.bind(this)

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

  // Rigorous checks after more simple args and flags check
  private buildChecks = ({ argv, flags }: { argv: string[]; flags: object }) => {
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
    const depCheckGroup$ = Build.requiredExternalDeps
      .map((extDep) => {
        return from(lookpath(extDep));
      });
    const pathCheckGroup$ = forkJoin(depCheckGroup$);

    pathCheckGroup$
      .subscribe((thing) => {
        console.log(thing)
      });
    // forkJoin


    // Check for cli input validity
    const buildCmd = this.parse(Build);

    const output = match(buildCmd)
      .with(({
        // No build arguments and no flags
        argv: [],
        flags: when(flags => {
          return Object.keys(flags).length === 0;
        })
      }), () => {
        // Can not continue
        return {
          msg: this.buildLog({
            action: action.beforeStart,
            log: messagesKeys.noArgsOrFlags
          }),
          continue: false
        };
      })
      .with(({
        // Build arguments, but no flags
        argv: when(argv => {
          return argv.length > 0;
        }),
        flags: when(flags => {
          return Object.keys(flags).length === 0;
        })
      }), () => {
        // Can not continue
        return {
          msg: this.buildLog({
            action: action.beforeStart,
            log: messagesKeys.argsButNoFlags
          }),
          continue: false
        };
      })
      .with(({
        // No build arguments, but has flags
        argv: [],
        flags: when(flags => {
          return Object.keys(flags).length > 0;
        })
      }), () => {
        // Further checks on the flags
        return this.buildChecks(buildCmd);
      })
      .with(({
        // Build arguments and flags present
        argv: when(argv => {
          return argv.length > 0;
        }),
        flags: when(flags => {
          return Object.keys(flags).length > 0;
        })
      }), () => {
        return this.buildChecks(buildCmd);
      })
      .run();

    this.log(output.msg);
  }
}
