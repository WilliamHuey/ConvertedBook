// Third party modules
import { length, isEmpty, intersection, symmetricDifference, difference } from 'ramda';
const listify = require('listify');

// Library modules
import Build from '../../commands/build';

export function buildReport(this: Build, { argv }: { argv: string[] }) {
  // Discern which is an unknown format or flag
  const recognizedFormats = intersection(Build.acceptedOutputFormats, argv);
  const unrecognizedElements = difference(argv, Build.acceptedOutputFormats);
  const unknownFlags = unrecognizedElements.filter(element => {
    return element.slice(0, 2) === '--';
  });
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
  const argsCommaList = listify(recognizedFormats);

  return {
    conditionsLogs: {
      argsCommaList,
      unknownFormats,
      hasUnknownFormats
    },
    conditions: {
      exactMatchBuildOrder,
      additionalArgsOverBuildOrder,
      onlyOneBuildFormat,
      multipleArgsNotDependentBuildOrder
    }
  };
}
