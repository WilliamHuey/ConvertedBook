// Third party modules
import { Command, flags } from '@oclif/command';
import { match, when } from 'ts-pattern';
import { cond, always, unnest } from 'ramda';
const listify = require('listify');

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

  static flags = {
    help: flags.help({ char: 'h' }),
    input: flags.string({ char: 'i' }),
    output: flags.string({ char: 'o' }),
    args: flags.string({ char: 'a' })
  }

  static BuildWithOrder = ['html', 'pdf']

  static acceptedOutputFormats = unnest([Build.BuildWithOrder, 'epub'])

  static description = `Generate output format of your choosing from these following formats: ${listify(Build.acceptedOutputFormats)}`

  // Rigorous checks after more simple args and flags check
  private buildChecks = ({ argv }: { argv: string[] }) => {
    // Get the status of the arguments
    const {
      conditionsHelpers,
      conditions
    } = this.buildReport({ argv });

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
      multipleArgsNotDependentBuildOrder
    } = conditions;

    // No more processing without any valid output formats
    if (noValidFormats) {
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

    // Build format matches where all the argument
    // conditions share the same log format
    const result = cond([
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

    return result();
  }

  async run() {
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
        // No build arguments, but has flags
        argv: [],
        flags: when(flags => {
          return Object.keys(flags).length > 0;
        })
      }), () => {
        // Further checks on the flags
        return {
          msg: this.buildLog({
            action: action.beforeStart,
            log: messagesKeys.noArgsButFlags
          }),
          continue: true
        };
      })
      .with(({
        // Arguments, but no flags
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
        // Arguments and flags present
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
