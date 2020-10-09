import { Command, flags } from '@oclif/command';
import { match, __ } from 'ts-pattern';
import { intersection, difference, cond, always } from 'ramda';

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

  static BuildWithOrder = new Map([['htmlPdf', ['html', 'pdf']]]);

  async run() {
    const buildCmd = this.parse(Build);
    const output = match(buildCmd)

      // No build arguments
      .with(({
        argv: []
      }), () => `Building - Into all formats: ${Build.acceptedOutputFormats.join(', ')}`)
      .with(__, ({ argv }) => {
        const numberArgs = argv.length;

        // Check for 'html', 'pdf' or 'pdf', 'html'
        const htmlWithPdf = Build.BuildWithOrder.get('htmlPdf') || [];

        const buildIntersection = intersection(argv, htmlWithPdf),
          buildDifference = difference(argv, htmlWithPdf),
          buildIntersectionLen = buildIntersection.length,
          exactMatchHtmlWithPdf = buildIntersectionLen === numberArgs,
          additionalArgsHtmlWithPdf = buildIntersectionLen < numberArgs;

        const result = cond([
          [
            always(additionalArgsHtmlWithPdf),
            always(`Building - Html, pdf and ${buildDifference.join('')}`)
          ],
          [
            always(exactMatchHtmlWithPdf),
            always('Building - Html and pdf')
          ]
        ]);

        return result();
      })
      .run();

    this.log(output);
  }
}
