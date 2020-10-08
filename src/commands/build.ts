import { Command, flags } from '@oclif/command'
import { match, when, __ } from 'ts-pattern'
import predicate from 'predicate'

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

  private checkAcceptedOutputFormats = () => {

  }

  async run() {
    const buildCmd = this.parse(Build)

    const output = match(buildCmd)

      // No build arguments
      .with(({
        argv: []
      }), () => 'Building - Into all formats')
      .with(__, (content) => {

        console.log(content)

        return 'Building - Various'
      })

      .run()

    this.log(output)
  }
}
