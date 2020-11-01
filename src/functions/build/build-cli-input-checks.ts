// Third party modules
import { match, when } from 'ts-pattern';
// const IsThere = require('is-there');

// Library modules
import Build from '../../commands/build';
import { action, messagesKeys } from './build-log';
import { BuildCheckResults, BuildCheckBadResults, BuildCheckGoodResults } from './build-checks';

export function buildCliInputsChecks(this: Build): BuildCheckResults {
  // Check for cli input validity
  const buildCmd = this.parse(Build);
  const output = match(buildCmd)
    .with(({
      // No build arguments and no flags
      argv: [],
      flags: when(flags => {
        return Object.keys(flags).length === 0;
      })
    }), (): BuildCheckBadResults => {
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
    }), (): BuildCheckBadResults => {
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
      return (this.buildChecks(buildCmd) as BuildCheckResults);
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
      return (this.buildChecks(buildCmd) as BuildCheckResults);
    })
    .run();
  return output;
}

export function buildCliInputsAsyncChecks(this: Build, _buildCli: BuildCheckGoodResults) {
  // console.log(output);
  // const { argv, flags } = buildCli.conditions;
  // const { input, output } = flags;

  // IsThere
}
