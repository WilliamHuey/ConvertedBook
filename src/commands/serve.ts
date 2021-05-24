import { Command, flags } from '@oclif/command'

const childProcess = require('child_process');
const { spawn } = childProcess;

export default class Serve extends Command {
  static description = 'describe the command here'

  static flags = {
    help: flags.help({ char: 'h' }),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({ char: 'n', description: 'name to print' }),
    // flag with no value (-f, --force)
    force: flags.boolean({ char: 'f' }),
  }

  static args = [{ name: 'file' }]

  async run() {
    const { args, flags } = this.parse(Serve)

    const server = spawn('node', ['./server.js']);

    server.stdout.on('data', (data: any) => {
      console.error(`data on: ${data}`);
    });
  }
}
