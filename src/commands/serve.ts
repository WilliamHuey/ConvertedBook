import { Command, flags } from '@oclif/command'

const childProcess = require('child_process'),
  { spawn } = childProcess;

export default class Serve extends Command {
  static description = 'Run live server for real-time updates on document changes'

  static flags = {
    help: flags.help({ char: 'h' }),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({ char: 'n', description: 'Serve' }),
    // flag with no value (-f, --force)
    force: flags.boolean({ char: 'f' }),
  }

  static args = [{ name: 'file' }]

  async run() {
    const { args, flags } = this.parse(Serve)

    const server = spawn('node', ['./server.js']);

    server.stdout.on('data', (data: any) => {
      console.error(`Info: ${data}`);
    });
    server.stderr.on('data', (data: any) => {
      console.error(`Error: ${data}`);
    });
  }
}
