// Third party modules
import { Command, flags } from '@oclif/command';
import { match, __ } from 'ts-pattern';
import { cond, always } from 'ramda';
const listify = require('listify');

// Library modules
import { buildReport } from '../functions/build/build-report';
import { buildLog } from '../functions/build/build-log';

export default class Build extends Command {
  // Allow any number of arguments
  static strict = false;

  public buildReport = buildReport.bind(this);

  public buildLog = buildLog.bind(this);

  static examples = [
    '$ convertedbook build pdf',
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
    input: flags.string({ char: 'i' }),
    output: flags.string({ char: 'o' }),
    args: flags.string({ char: 'a' })
  }

  static acceptedOutputFormats = ['html', 'pdf', 'epub']

  static description = `Generate output format of your choosing from these following formats: ${listify(Build.acceptedOutputFormats)}`

  static BuildWithOrder = ['html', 'pdf'];

  async run() {
    const buildCmd = this.parse(Build);

    const output = match(buildCmd)
      .with(({
        // No build arguments
        argv: []
      }), () => {
        return this.buildLog({
          action: 'start',
          buildFormats: listify(Build.acceptedOutputFormats)
        });
      })
      .with(__, ({ argv }) => {
        // Get the status of the arguments
        const {
          conditionsHelpers,
          conditions
        } = this.buildReport({ argv });

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
          multipleArgsNotDependentBuildOrder
        } = conditions;

        // No more processing without any valid output formats
        if (noValidFormats) {
          console.warn('Did not build as there are no valid formats: ', unknownFormats);
          return;
        }

        // Unknown format warning
        if (hasUnknownFormats) {
          console.warn('Ignoring unknown formats:', unknownFormats);
        }

        // Build format matches
        const result = cond([
          [
            always(onlyOneBuildFormat),
            () => {
              return this.buildLog({
                action: 'start',
                buildFormats: argsCommaList
              });
            }
          ],
          [
            always(additionalArgsOverBuildOrder),
            () => {
              return this.buildLog({
                action: 'start',
                buildFormats: argsCommaList
              });
            }
          ],
          [
            always(exactMatchBuildOrder),
            () => {
              return this.buildLog({
                action: 'start',
                buildFormats: argsCommaList
              });
            }
          ],
          [
            always(multipleArgsNotDependentBuildOrder),
            () => {
              return this.buildLog({
                action: 'start',
                buildFormats: argsCommaList
              });
            }
          ]
        ]);

        return result();
      })
      .run();

    this.log(output);
  }
}
