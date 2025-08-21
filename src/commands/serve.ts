// Native modules
import { ChildProcess, spawn } from 'child_process';

// Third party modules
import { Command, Flags } from '@oclif/core';
import { from, ReplaySubject } from 'rxjs';
import { filter, takeLast } from 'rxjs/operators';
import { pathExists } from 'path-exists';

// Library modules
import { messages, messagesKeys } from '../functions/serve/serve-log.js';

type ServerReplaySubject = ReplaySubject<ChildProcess | String>

export default class Serve extends Command {
  static description = `Run a live server to view real-time updates on document changes in the browser. You must change into the directory of your convertedbook project before you are able to run this command. To change the server port, edit the port value in server-config.js.
  `

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
    help: Flags.help({ char: 'h' }),
    name: Flags.string({ char: 'n', description: 'Serve' }),
    pandoc: Flags.string({ char: 'p', description: 'Pandoc options' }),
    options: Flags.string({ char: 'o', description: 'General options' })
  }

  static aliases = ['s', 'server']

  static serverFilenamePath = 'server.js';

  public async run(): Promise<ServerReplaySubject> {
    const { flags } = await this.parse(Serve);

    const server$: ServerReplaySubject = new ReplaySubject();

    const checkServerFilepath$ = from(pathExists
      (Serve.serverFilenamePath) as Promise<boolean>);

    // Basic check for 'server.js' file as a measure
    // of a folder being a 'convertedbook' project.
    const hasServerFile$ = checkServerFilepath$
      .pipe(
        filter((hasServerFile: boolean) => {
          return hasServerFile;
        })
      );

    // A found 'server.js' file means it is most
    // likely to be a 'convertedbook' project
    hasServerFile$
      .pipe(takeLast(1))
      .subscribe({
        next: () => {

          // Force the pandoc generation mode by passing the option
          // explicitly
          const server: ChildProcess = spawn('node', [Serve.serverFilenamePath,
            '--pandoc=true', JSON.stringify(flags)]);

          if (server?.stdout) {
            server.stdout.on('data', (data: any) => {
              console.error(`Info: ${data}`);
            });
          }

          if (server.stderr) {
            server.stderr.on('data', (data: any) => {
              console.error(`Error: ${data}`);
            });
          }

          server$.next(server);
        },
        error: () => {
          this.log(`${messages[messagesKeys.errorWhenStartingServer]}`);
        }
      });

    // Did not find the 'server.js' means that it
    // is most likely not a 'convertedbook' project
    const noServerFile$ = checkServerFilepath$
      .pipe(
        filter((hasServerFile: boolean) => {
          return !hasServerFile;
        })
      );

    noServerFile$
      .subscribe(() => {
        server$.next(`${messages[messagesKeys.serverJsNotFound]}`);
        server$.complete();
        this.log(`${messages[messagesKeys.serverJsNotFound]}`);
      });

    return server$;
  }
}
