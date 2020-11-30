// Third party modules
import { Command, flags } from '@oclif/command';

// Libraries modules
import { generatePackageJson } from '../functions/generate/generate-imports';

export default class Generate extends Command {
  static description = 'Create a "convertedbook" project folder.'

  static flags = {
    help: flags.help({ char: 'h' }),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({ char: 'n', description: 'Generate' }),
    // flag with no value (-f, --force)
    force: flags.boolean({ char: 'f' }),
  }

  static args = [{ name: 'file' }]

  public generatePackageJson = generatePackageJson.bind(this)

  async run() {
    const { args, flags } = this.parse(Generate);

    this.generatePackageJson();



  }
}
