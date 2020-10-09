import { Command, flags } from '@oclif/command';
import { match, __ } from 'ts-pattern';
import { intersection, cond, always } from 'ramda';
const listify = require('listify');

export default class Build extends Command {
  static examples = [
    '$ convertedbook build pdf',
  ]

  static flags = {
    help: flags.help({ char: 'h' })
  }

  static acceptedOutputFormats = ['html', 'pdf', 'epub']

  static args = Build.acceptedOutputFormats
    .map(format => {
      return { name: format };
    })

  static description = `Generate output format of your choosing from these following formats: ${Build.acceptedOutputFormats.join(', ')}`

  static BuildWithOrder = ['html', 'pdf'];

  async run() {
    const buildCmd = this.parse(Build);
    const output = match(buildCmd)

      // No build arguments
      .with(({
        argv: []
      }), () => `Building - Into all formats: ${Build.acceptedOutputFormats.join(', ')}`)
      .with(__, ({ argv }) => {
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

        // Build format matches
        const result = cond([
          [
            always(additionalArgsBuildOrder),
            always(`Building - ${argsCommaList}`)
          ],
          [
            always(exactMatchBuildOrder),
            always(`Building - ${listBuildOrder}`)
          ]
        ]);

        return result();
      })
      .run();

    this.log(output);
  }
}
