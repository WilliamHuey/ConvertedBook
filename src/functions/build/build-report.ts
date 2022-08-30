// Third party modules
import { length, isEmpty, intersection, symmetricDifference, difference } from 'ramda';
const listify = require('listify');

// Library modules
import Build from '../../commands/build';
import { buildFlags } from './build-flags';
import { CommandArgsFlags } from './build-checks';

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
}

type optionalArgsFlagKeys = 'input' | 'output'
export type optionalArgsFlagKeysArray = optionalArgsFlagKeys[]

interface BuildFlagsStatus {
  allRequiredFlagsRecognized: boolean;
  someFlagsRequiredRecognized: boolean;
  optionalArgsFlagKeys: optionalArgsFlagKeysArray;
  argsFlagKeys: Array<string>;
}

export interface BuildReportResults {
  conditionsHelpers: {
    argsCommaList: Array<string>;
    noValidFormats: boolean;
    emptyArgs: boolean;
    unknownFormats: Array<string>;
    hasUnknownFormats: boolean;
    buildFlagsStatus: BuildFlagsStatus;
  };
  conditions: BuildReportConditions;
}

export function buildReport(this: Build, { argv, flags, serverjsBuild$ }: CommandArgsFlags): BuildReportResults {
  // Discern which is an unknown format or flag
  const recognizedFormats = intersection(Build.acceptedOutputFormats, argv);
  const unrecognizedElements = difference(argv, Build.acceptedOutputFormats);
  const unknownFlags = unrecognizedElements.filter(element => {
    return element.slice(0, 2) === '--';
  });
  const emptyArgs = recognizedFormats.length === 0 && unknownFlags.length === argv.length;
  const unknownFormats = difference(unrecognizedElements, unknownFlags);
  const hasUnknownFormats = unknownFormats.length > 0;

  // Check for 'html', 'pdf' or 'pdf', 'html'
  const numberArgs = argv.length,
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

  // Create a comma list of the supported build formats
  const argsCommaList = listify(recognizedFormats),
    noValidFormats = argsCommaList.length === 0;

  // Argument flags presence check
  const buildFlagsStatus = buildFlags.bind(this)(flags, serverjsBuild$),
    emptyArgsValidFlags = emptyArgs && buildFlagsStatus.allRequiredFlagsRecognized,
    normalizedFormats = emptyArgsValidFlags && recognizedFormats.length === 0 ?
      Build.acceptedOutputFormats : recognizedFormats,
    allRequiredFlagsRecognized = buildFlagsStatus.allRequiredFlagsRecognized,
    someFlagsRequiredRecognized = buildFlagsStatus.someFlagsRequiredRecognized;

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
      normalizedFormats
    }
  };
}
