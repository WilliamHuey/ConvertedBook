// Third party modules
import { cond, always } from 'ramda';
import { XOR } from 'ts-xor';
import { Observable } from 'rxjs';
const listify = require('listify');

// Library modules
import Build from '../../commands/build';
import { action, messagesKeys } from './build-log';
import { BuildReportConditions } from './build-report';

import { ServerjsBuild } from './build-import';

export type BuildCheckBadResults = {
  msg: string;
  continue: boolean;
}

export type BuildCheckGoodResults = {
  msg: string;
  continue: boolean;
  conditions: CondsFlagsArgv;
  fromServerCli?: boolean;
  exactPdf?: boolean;
}

export type BuildCheckResults = XOR<BuildCheckBadResults, BuildCheckGoodResults>

export type CommandFlagKeys = { input: string; output: string; 'dry-run': string };

export type CommandArgsFlags = { argv: string[]; flags: CommandFlagKeys, serverjsBuild$?: Observable<ServerjsBuild> | undefined }

type CondsFlagsArgv = BuildReportConditions & CommandArgsFlags;

// Rigorous checks after more simple args and flags check,
// used by 'buildCliInputsChecks'
export function buildChecks(this: Build, buildCmd: Record<string, any>, serverjsBuild$?: Observable<ServerjsBuild>): BuildCheckResults {

  const { argv, flags }: Partial<Record<string, any>> = buildCmd;
  // Get the status of the arguments
  const {
    conditionsHelpers,
    conditions
  } = this.buildReport({ argv, flags, serverjsBuild$ });

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

  if (!serverjsBuild$) {

    // Missing a required flag and can not continue
    if (someFlagsRequiredRecognized) {
      return {
        msg: this.buildLog({
          action: action.check,
          log: messagesKeys.someRequiredFlagsFound
        }),
        continue: false
      };
    }

    // No required flags present and will not continue
    if (!allRequiredFlagsRecognized) {
      return {
        msg: this.buildLog({
          action: action.check,
          log: messagesKeys.noRequiredFlagsFound
        }),
        continue: false
      };
    }

    // No more processing without any valid output formats
    if (!emptyArgsValidFlags && noValidFormats) {
      return {
        msg: this.buildLog({
          action: action.check,
          log: messagesKeys.noValidFormats,
          data: unknownFormats
        }),
        continue: false
      };
    }

    // Unknown format warning
    if (hasUnknownFormats) {
      console.log(this.buildLog({
        action: action.check,
        log: messagesKeys.ignoreUnknownFormats,
        data: unknownFormats
      }));
    }

  }

  // Supply the information after making checks on the build command
  const conditionsFlagsArgv: CondsFlagsArgv = { ...conditions, flags, argv };

  // Patch 'conditionsFlagsArgv' with the location of the source tex file and
  // the 'index.html' files for a project folder generation
  if (serverjsBuild$) {
    Object.assign(conditionsFlagsArgv, {
      flags: { input: './src/index.tex', output: './index.html', force: true }
    });
  }

  let listOfConds = [
    onlyOneBuildFormat,
    additionalArgsOverBuildOrder,
    exactMatchBuildOrder,
    multipleArgsNotDependentBuildOrder
  ];

  console.log('listOfConds', listOfConds);


  // Valid scenarios for building
  const buildArgsConds = cond(listOfConds.map(argsCond => {
    return [always(argsCond), () => {

      return {
        msg: this.buildLog({
          action: action.ready,
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
              action: action.ready,
              buildFormats: listify(Build.acceptedOutputFormats)
            }),
            conditions: conditionsFlagsArgv,
            continue: true
          };
        }
      ]
    ]
  );

  this.log('+++emptyArgsValidFlagsCond()', emptyArgsValidFlagsCond());
  this.log('+++buildArgsConds', buildArgsConds());


  return emptyArgsValidFlagsCond() || buildArgsConds();
}