import Build from '../../commands/build';
import { length, isEmpty, intersection, symmetricDifference } from 'ramda';
const listify = require('listify');

export function buildReport(this: Build, { argv }: { argv: string[] }) {
  // Check for 'html', 'pdf' or 'pdf', 'html'
  const numberArgs = argv.length,
    buildOrder = Build.BuildWithOrder,
    buildOrderLen = buildOrder.length;

  // Check arguments against the build order with only regards
  // to the elements and not the order (presence comparison)
  const equalElements = length(buildOrder) === length(argv) &&
    isEmpty(symmetricDifference(buildOrder, argv));

  // Check if the special order formats are found
  const buildIntersection = intersection(buildOrder, argv),
    buildIntersectionLen = buildIntersection.length,
    exactMatchBuildOrder = equalElements,
    additionalArgsOverBuildOrder = buildIntersectionLen < numberArgs &&
      buildIntersectionLen === buildOrderLen,
    multipleArgsNotDependentBuildOrder = numberArgs >= 2 &&
      (!exactMatchBuildOrder && !additionalArgsOverBuildOrder),
    onlyOneBuildFormat = numberArgs === 1;

  // Create a comma list of the supported build formats
  const listBuildOrder = listify(buildOrder),
    argsCommaList = listify(argv);

  return {
    conditionsLogs: {
      listBuildOrder,
      argsCommaList
    },
    conditions: {
      exactMatchBuildOrder,
      additionalArgsOverBuildOrder,
      onlyOneBuildFormat,
      multipleArgsNotDependentBuildOrder
    }
  };
}
