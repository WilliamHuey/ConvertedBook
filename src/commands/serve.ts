// Native modules
import * as childProcess from "child_process";
const { spawn } = childProcess;

// Third party modules
import { Command, flags } from '@oclif/command'

export default class Serve extends Command {
  static description = 'Run live server for real-time updates on document changes'

  static flags = {
    help: flags.help({ char: 'h' }),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({ char: 'n', description: 'Serve' }),
    pandoc: flags.string({ char: 'p', description: 'Pandoc options' })
  }

  static aliases = ['s']

  async run() {
    const { flags } = this.parse(Serve),
      server = spawn('node', ['./server.js', JSON.stringify(flags)]);

    server.stdout.on('data', (data: any) => {
      console.error(`Info: ${data}`);
    });

    server.stderr.on('data', (data: any) => {
      console.error(`Error: ${data}`);
    });
  }
}
