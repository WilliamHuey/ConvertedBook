// Third party modules
import { Command, flags } from '@oclif/command';
import { concat, of } from 'rxjs';
import { takeLast } from 'rxjs/operators';

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

    const generatePackageJSON$ = this.generatePackageJson();

    const furtherProcessing$ = of('process some more');

    furtherProcessing$
      .subscribe(() => {
        console.log('Further processing')
      });

    concat(
      generatePackageJSON$,
      furtherProcessing$
    )
      .pipe(takeLast(1))
      .subscribe({
        error: (e: any) => {
          // Error logging will be done
        },
        complete: () => {
          console.log('Complete creation of project folder');
        }
      });

  }
}
