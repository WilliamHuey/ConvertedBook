// Third party modules
import { Command, flags } from '@oclif/command';
import { match, __ } from 'ts-pattern';
import { cond, always } from 'ramda';

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

  static description = `Generate output format of your choosing from these following formats: ${Build.acceptedOutputFormats.join(', ')}`

  static BuildWithOrder = ['html', 'pdf'];

  async run() {
    const buildCmd = this.parse(Build);

    const output = match(buildCmd)
      .with(({
        // No build arguments
        argv: []
      }), () => `Start Building: Into all formats: ${Build.acceptedOutputFormats.join(', ')}`)
      .with(__, ({ argv }) => {
        // Get the status of the arguments
        const {
          conditionsLogs,
          conditions
        } = this.buildReport({ argv });

        const {
          argsCommaList,
          unknownFormats,
          hasUnknownFormats
        } = conditionsLogs;

        const {
          exactMatchBuildOrder,
          additionalArgsOverBuildOrder,
          onlyOneBuildFormat,
          multipleArgsNotDependentBuildOrder
        } = conditions;

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
