// Native modules
import * as path from 'path';

// Third party modules
import { length, isEmpty, isNil, intersection, symmetricDifference, difference } from 'ramda';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';
import listify from 'listify';

// Library modules
import Build from '../../commands/build.js';
import { buildFlags } from './build-flags.js';
import { CommandArgsFlags } from './build-checks.js';
import { configurationValues } from '../shared/configuration-values.js';
const { serverConfig } = configurationValues;

// Port ranges
const upperPortValue = 65535,
  lowerPortValue = 1;

export interface BuildReportConditions {
  exactMatchBuildOrder: boolean;
  additionalArgsOverBuildOrder: boolean;
  onlyOneBuildFormat: boolean;
  multipleArgsNotDependentBuildOrder: boolean;
  emptyArgsValidFlags: boolean;
  allRequiredFlagsRecognized: boolean;
  someFlagsRequiredRecognized: boolean;
  recognizedFormats: Array<string>;
  normalizedFormats: Array<string>;
  validServerBuildPort: boolean;
  outputFlagExists: boolean;
  patchOutput: string
}

interface BuildFlagsStatus {
  allRequiredFlagsRecognized: boolean;
  someFlagsRequiredRecognized: boolean;
  argsFlagKeys: Array<string>;
}

export interface BuildReportResults {
  conditionsHelpers: {
    argsCommaList: string;
    noValidFormats: boolean;
    emptyArgs: boolean;
    unknownFormats: Array<string>;
    hasUnknownFormats: boolean;
    buildFlagsStatus: BuildFlagsStatus;
  };
  conditions: BuildReportConditions;
}

interface ServerFileCheckParams {
  serverFileName: string
}

export interface ServerFileCheck {
  customPort: number;
  customPortValid: boolean;
  default: number;
}

export function serverFileCheck({ serverFileName }: ServerFileCheckParams) {

  // Format server url for compatibility with windows
  const serverFilePath = process.platform === 'win32'
    ? 'file:///' + path.resolve(process.cwd(), serverFileName).replace(/\\/g, '/')
    : path.resolve(process.cwd(), serverFileName);

  return from(import(serverFilePath))
    .pipe(
      map((result: Record<any, any>) => {
        const customPort = !isNil(result),
          customPortValid = customPort && result?.serverConfig?.port &&
            (lowerPortValue <= result?.serverConfig?.port &&
            result?.serverConfig?.port <= upperPortValue) ? true : false;

        return {
          customPort: result?.serverConfig?.port,
          customPortValid,
          default: serverConfig.port
        }
      })
    )
}

export function buildReport(this: Build, { argv: argsGroup, flags, buildCheckData, serverjsBuild$ }: CommandArgsFlags): BuildReportResults {

  // Discern which is an unknown format or flag

  // Default to empty array to avoid errors when read later
  argsGroup = isNil(argsGroup) ? [] : argsGroup;

  const recognizedFormats = intersection(Build.acceptedOutputFormats, argsGroup);
  const unrecognizedElements = difference(argsGroup, Build.acceptedOutputFormats);
  const unknownFlags = unrecognizedElements.filter(element => {
    return element.slice(0, 2) === '--';
  });
  const emptyArgs = recognizedFormats.length === 0 && unknownFlags.length === argsGroup.length;
  const unknownFormats = difference(unrecognizedElements, unknownFlags);
  const hasUnknownFormats = unknownFormats.length > 0;
  const { port: buildServerPort } = flags;

  // Output flag
  const outputFlagExists = 'output' in flags ? true : false;

  // Check for server build port's validness

  const inputServerBuildServerPort = buildServerPort ?
    parseInt(buildServerPort, 10):
    null;

  let validServerBuildPort = false
  if (!isNil(inputServerBuildServerPort)) {
    if (lowerPortValue <= inputServerBuildServerPort &&
      inputServerBuildServerPort <= upperPortValue) {
      validServerBuildPort = true;
    }
  }

  // Check for 'html', 'pdf' or 'pdf', 'html'
  const numberArgs = argsGroup.length,
    buildOrder = Build.BuildWithOrder,
    buildOrderLen = buildOrder.length;

  // Check arguments against the build order with only regards
  // to the elements and not the order (presence comparison)
  const equalElements = length(buildOrder) === length(recognizedFormats) &&
    isEmpty(symmetricDifference(buildOrder, recognizedFormats));

  // Check if the special order formats are found
  const buildIntersection = intersection(buildOrder, recognizedFormats),
    buildIntersectionLen = buildIntersection.length,
    exactMatchBuildOrder = equalElements,
    additionalArgsOverBuildOrder = buildIntersectionLen < numberArgs &&
      buildIntersectionLen === buildOrderLen,
    multipleArgsNotDependentBuildOrder = numberArgs >= 2 &&
      (!exactMatchBuildOrder && !additionalArgsOverBuildOrder),
    onlyOneBuildFormat = numberArgs === 1;

  // Create a comma separated list of the supported build formats
  const argsCommaList = listify(recognizedFormats),
    noValidFormats = recognizedFormats.length === 0;

  // Argument flags presence check
  const buildFlagsStatus = buildFlags.bind(this)(flags, serverjsBuild$),
    emptyArgsValidFlags = emptyArgs && buildFlagsStatus.allRequiredFlagsRecognized,
    normalizedFormats = emptyArgsValidFlags && recognizedFormats.length === 0 ?
      Build.acceptedOutputFormats : recognizedFormats,
    allRequiredFlagsRecognized = buildFlagsStatus.allRequiredFlagsRecognized,
    someFlagsRequiredRecognized = buildFlagsStatus.someFlagsRequiredRecognized;

  // Set to a default output file on the same level as the input file
  // if one wasn't provided.
  const patchOutput = buildCheckData?.patchOutputPath ?
    buildCheckData?.patchOutputPath : '';

  return {
    conditionsHelpers: {
      argsCommaList,
      noValidFormats,
      emptyArgs,
      unknownFormats,
      hasUnknownFormats,
      buildFlagsStatus
    },
    conditions: {
      exactMatchBuildOrder,
      additionalArgsOverBuildOrder,
      onlyOneBuildFormat,
      multipleArgsNotDependentBuildOrder,
      emptyArgsValidFlags,
      allRequiredFlagsRecognized,
      someFlagsRequiredRecognized,
      recognizedFormats,
      normalizedFormats,
      validServerBuildPort,
      outputFlagExists,
      patchOutput
    }
  };
}
