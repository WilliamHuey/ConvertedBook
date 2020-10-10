import Build from '../../commands/build';
import { intersection } from 'ramda';
const listify = require('listify');

export function buildReport(this: Build, { argv }: { argv: string[] }) {
  // Check for 'html', 'pdf' or 'pdf', 'html'
  const numberArgs = argv.length,
    buildOrder = Build.BuildWithOrder;

  // Check if the special order formats are found
  const buildIntersection = intersection(argv, buildOrder),
    buildIntersectionLen = buildIntersection.length,
    exactMatchBuildOrder = buildIntersectionLen === numberArgs,
    additionalArgsBuildOrder = buildIntersectionLen < numberArgs;

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
      additionalArgsBuildOrder
    }
  };
}
