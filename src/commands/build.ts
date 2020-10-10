import { Command, flags } from '@oclif/command';
import { match, __ } from 'ts-pattern';
import { cond, always } from 'ramda';
import { buildReport } from '../functions/build/build-report';

export default class Build extends Command {
  public buildReport = buildReport.bind(this);

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
      .with(({
        // No build arguments
        argv: []
      }), () => `Building - Into all formats: ${Build.acceptedOutputFormats.join(', ')}`)
      .with(__, ({ argv }) => {
        // Get the status of the arguments
        const {
          conditionsLogs,
          conditions
        } = this.buildReport({ argv });

        const {
          listBuildOrder,
          argsCommaList
        } = conditionsLogs;

        const {
          exactMatchBuildOrder,
          additionalArgsBuildOrder
        } = conditions;

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
