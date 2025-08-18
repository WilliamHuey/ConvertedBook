// Third party modules
import { cond, always, isNil } from 'ramda';
import { XOR } from 'ts-xor';
import { Observable, ReplaySubject } from 'rxjs';
import listify from 'listify';

// Library modules
import Build from '../../commands/build.js';
import { action, messagesKeys, messages } from './build-log.js';
import { BuildReportConditions, ServerFileCheck } from './build-report.js';
import { ServerjsBuild } from './build-import.js';
import { BuildCheckData } from './build-cli-input-async-checks.js';

export type BuildMsg = {
  msg: string
}

export type BuildRelatedMsg = {
  [key: string]: Array<BuildMsg>;
  warning: Array<BuildMsg>;
  info: Array<BuildMsg>;
}

export type BuildCheckBadResults = {
  msg: string;
  continue: boolean;
  isServerJsFound$?: Observable<Boolean>;
  relatedMsgs?: BuildRelatedMsg;
}

export type BuildCheckGoodResults = {
  msg: string;
  continue: boolean;
  conditions: CondsFlagsArgv;
  fromServerCli?: boolean;
  exactPdf?: boolean;
  isServerJsFound$?: Observable<Boolean>;
  relatedMsgs?: BuildRelatedMsg;
}

export type BuildCheckResults = XOR<BuildCheckBadResults, BuildCheckGoodResults>

export type CommandFlagKeys = { input: string; output: string; 'dry-run': string, port?: string };

export type CommandArgsFlags = { argv: string[]; flags: CommandFlagKeys, buildCheckData?: BuildCheckData, serverjsBuild$?: Observable<ServerjsBuild> | undefined }

type CondsFlagsArgv = BuildReportConditions & CommandArgsFlags;

// Rigorous checks after more simple args and flags check,
// used by 'buildCliInputsChecks'
export function buildChecks(this: Build, buildCmd: Record<string, any>, consoleLogSubject$: ReplaySubject<{ }>, buildCheckData?: BuildCheckData, serverjsBuild$?: Observable<ServerjsBuild>, portInfo?: ServerFileCheck): BuildCheckResults {

  const { argv, flags }: Partial<Record<string, any>> = buildCmd;

  // Get the status of the arguments
  const {
    conditionsHelpers,
    conditions
  } = this.buildReport({ argv, flags, buildCheckData, serverjsBuild$ });

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
    someFlagsRequiredRecognized,
    validServerBuildPort
  } = conditions;

  if (!serverjsBuild$) {

    // Missing a required flag and can not continue
    if (someFlagsRequiredRecognized) {

      if (!buildCheckData?.patchOutputPath) {
        return {
          msg: this.buildLog({
            action: action.check,
            log: messagesKeys.someRequiredFlagsFound
          }),
          continue: false
        };
      }
    }

    // No required flags present and will not continue
    if (!allRequiredFlagsRecognized) {

      if (!buildCheckData?.patchOutputPath){
        return {
          msg: this.buildLog({
            action: action.check,
            log: messagesKeys.noRequiredFlagsFound
          }),
          continue: false
        };
      }
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
      this.log(this.buildLog({
        action: action.check,
        log: messagesKeys.ignoreUnknownFormats,
        data: unknownFormats
      }));
      consoleLogSubject$.next({warning: (messages[messagesKeys.ignoreUnknownFormatsWithUnknowns] as Function)((unknownFormats) )});
    }
  } else {

    // Can not have invalid build server port when using
    // the 'exact' option
    if (!portInfo?.customPortValid) {

      // The validServerBuildPort info is not 
      // accurate when running from project folder
      // when the build command is ran directly
      return {
        msg: this.buildLog({
          action: action.check,
          log: messagesKeys.invalidServerBuildPort,
        }),
        continue: false
      };
    }
  }

  // Supply the information after making checks on the build command
  const conditionsFlagsArgv: CondsFlagsArgv = { ...conditions, flags, argv };

  // Patch 'conditionsFlagsArgv' with the location of the source tex file and
  // the 'index.html' files for a project folder generation
  if (serverjsBuild$) {

    // Default to the original project folder's
    // input and output values when they are not provided

    // The 'normalizedFormats' values should be the more accurate measure
    // of what needs to be output
    let { input, output } = flags;
    input = isNil(input) ? "./src/index.tex" : input;
    output = isNil(output) ? "./index.html" : output;

    Object.assign(conditionsFlagsArgv.flags,
      { input, output });
  }

  let listOfConds = [
    onlyOneBuildFormat,
    additionalArgsOverBuildOrder,
    exactMatchBuildOrder,
    multipleArgsNotDependentBuildOrder
  ];

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

  const emptyArgs = emptyArgsValidFlagsCond();
  const buildCond = buildArgsConds();

  return buildCond || emptyArgs;
}