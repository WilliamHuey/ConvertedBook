import { Command, flags } from '@oclif/command'
import { match, when, __ } from 'ts-pattern'
import { isPlainObject } from 'is-what'
import { intersection } from 'ramda'

export default class Build extends Command {
  static examples = [
    '$ convertedbook build pdf',
  ]

  static flags = {
    help: flags.help({ char: 'h' })
  }

  static acceptedOutputFormats = ['html', 'pdf', 'epub']

  static args = Build.acceptedOutputFormats.map((format) => {
    return { name: format }
  })

  static description = `Generate output format of your choosing from these following formats: ${Build.acceptedOutputFormats.join(', ')}`

  static BuildWithOrder = new Map([['htmlPdf', ['html', 'pdf']]]);

  private checkAcceptedOutputFormats = () => {

  }

  async run() {
    const buildCmd = this.parse(Build)

    const output = match(buildCmd)

      // No build arguments
      .with(({
        argv: []
      }), () => 'Building - Into all formats')
      .with(__, ({ argv }) => {

        const numberArgs = argv.length

        // Check for 'html', 'pdf' or 'pdf', 'html'
        const htmlWithPdf = Build.BuildWithOrder
          .get('htmlPdf') || [];
        const buildIntersection = intersection(argv, htmlWithPdf)
        const buildIntersectionLen = buildIntersection.length
        const matchHtmlWithPdf = buildIntersectionLen &&
          (buildIntersectionLen === numberArgs)

        console.log(matchHtmlWithPdf)



        return 'Building - Various';
      })

      .run()

    this.log(output)
  }
}
