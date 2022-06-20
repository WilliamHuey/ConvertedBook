// Third party module
import 'module-alias/register';

// Native modules
import * as childProcess from 'child_process';
const { spawn } = childProcess;

// Third party modules
import { Command, flags } from '@oclif/command';
import { from, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
const IsThere = require('is-there');

export default class Serve extends Command {
  static description = 'Run live server for real-time updates on document changes'

  static flags = {
    help: flags.help({ char: 'h' }),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({ char: 'n', description: 'Serve' }),
    pandoc: flags.string({ char: 'p', description: 'Pandoc options' })
  }

  static aliases = ['s', 'server']

  static serverFilenamePath = 'server.js';

  async run() {
    const { flags } = this.parse(Serve);

    const server$ = new ReplaySubject();

    const checkServerFilepath$ = from(IsThere
      .promises.file(Serve.serverFilenamePath) as Promise<boolean>);

    // Basic check for 'server.js' file as a measure
    // of a folder being a 'convertedbook' project.
    const hasServerFile$ = checkServerFilepath$
      .pipe(
        filter(hasServerFile => {
          return hasServerFile;
        })
      );

    // A found 'server.js' file means it is most
    // likely to be a 'convertedbook' project
    hasServerFile$
      .subscribe({
        next: () => {

          // Force the pandoc generation mode by passing the option
          // explicitly
          const server = spawn('node', [Serve.serverFilenamePath,
            '--pandoc=true', JSON.stringify(flags)]);

          server.stdout.on('data', (data: any) => {
            console.error(`Info: ${data}`);
          });

          server.stderr.on('data', (data: any) => {
            console.error(`Error: ${data}`);
          });

          server$.next(server);
        },
        error: () => {
          console.log('Error when attempting to start server!');
        }
      });

    // Did not find the 'server.js' means that it
    // is most likely not a 'convertedbook' project
    const noServerFile$ = checkServerFilepath$
      .pipe(
        filter(hasServerFile => {
          return !hasServerFile;
        })
      );

    noServerFile$
      .subscribe({
        next: () => {
          console.log('Did not find the server.js" file, might not be a "convertedbook" project!');
        }
      });

    return server$;
  }
}
