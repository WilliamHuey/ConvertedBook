// Native modules
import { spawn } from 'child_process';
const path = require('path');

// Third party modules
import { Command, flags } from '@oclif/command';
import { bindCallback } from 'rxjs';
import { tap, takeLast, mergeMap } from 'rxjs/operators';
import { isUndefined } from 'is-what';

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
    'project-name': flags.string({ char: 'p' })
  }

  static args = [{ name: 'folderName' }]

  public generatePackageJson = generatePackageJson.bind(this)

  async run() {
    const { args, flags } = this.parse(Generate),
      { folderName } = args;

    const generatePackageJSON$ = this.generatePackageJson({ folderName, flags })
      .pipe(takeLast(1));

    const normalizedFolder = isUndefined(folderName) || folderName?.length === 0 ?
      'New Folder' : folderName;
    const executionPath = process.cwd(),
      npmService = spawn('npm', ['install'], { cwd: path.join(executionPath, '/', normalizedFolder, '/') });

    const npmOnComplete$ = bindCallback(
      npmService.stdout.on);

    const npmClose$ = npmOnComplete$
      .call(npmService, 'close');

    npmClose$
      .subscribe({
        next: () => {
          console.log(`Node modules downloaded`);
        },
        error: (e: any) => {
          console.log('Error', e);
        }
      });

    generatePackageJSON$
      .pipe(
        tap(() => console.log('Downloading node modules...')),
        mergeMap(() => {
          return npmClose$;
        }))
      .subscribe({
        error: (e: any) => {
          // Ignore the error logging here as this is an
          // aggregate
        },
        complete: () => {
          console.log('Complete project generation');
        }
      });

  }
}
