// Third party modules
import { Command, flags } from '@oclif/command';
import { concat, of } from 'rxjs';
import { takeLast, mergeMap } from 'rxjs/operators';

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

    const furtherProcessing$ = of('process some more');
    const anotherFurtherProcessing$ = of('further');

    generatePackageJSON$
      .pipe(mergeMap(() => {
        return furtherProcessing$;
      }), mergeMap(() => {
        return anotherFurtherProcessing$;
      }))
      .subscribe((thing) => {
        console.log('Further processing', thing);
      });

    concat(
      generatePackageJSON$,
      furtherProcessing$
    )
      .pipe(takeLast(1))
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
