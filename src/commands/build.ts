import { Command, flags } from '@oclif/command'
import { match, __ } from 'ts-pattern'

export default class Build extends Command {
  static description = 'Generate output format of your choosing from these following formats: html, pdf, epub'

  static examples = [
    '$ convertedbook build pdf',
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({ char: 'n', description: 'name to print' }),
    // flag with no value (-f, --force)
    force: flags.boolean({ char: 'f' }),
  }

  static args = [{ name: 'file' }]

  async run() {
    const buildCmd = this.parse(Build),
      { flags } = buildCmd

    const output = match(flags)
      .with({ force: true }, () => (
        'Building - flag force'
      ))
      .with(__, () => 'Building')
      .run()

    this.log(output)
  }
}
