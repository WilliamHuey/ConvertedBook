// Third party modules
import { cond, always } from 'ramda';
import { XOR } from 'ts-xor';
const listify = require('listify');

// Library modules
import Build from '../../commands/build';
import { action, messagesKeys } from './build-log';

export type BuildCheckBadResults = {
  msg: string;
  continue: boolean;
}

export type BuildCheckGoodResults = {
  msg: string;
  continue: boolean;
  conditions: object;
}

export type BuildCheckResults = XOR<BuildCheckBadResults, BuildCheckGoodResults>

// Rigorous checks after more simple args and flags check,
// used by 'buildCliInputsChecks'
export function buildChecks(this: Build, { argv, flags }: { argv: string[]; flags: object }): BuildCheckResults {
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

  // Supply the information after making checks on the build command
  const conditionsFlagsArgv = { ...conditions, flags, argv };

  // Valid scenarios for building
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
        conditions: conditionsFlagsArgv,
        continue: true
      };
    }];
  }));

  // Also a valid scenario:
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
            conditions: conditionsFlagsArgv,
            continue: true
          };
        }
      ]
    ]
  );

  return emptyArgsValidFlagsCond() || buildArgsConds();
}
