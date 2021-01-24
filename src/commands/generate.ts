// Native modules
import { spawn } from 'child_process';
const path = require('path');

// Third party modules
import { Command, flags } from '@oclif/command';
import { bindCallback, NEVER, of } from 'rxjs';
import { tap, mergeMap, share, takeUntil, takeLast } from 'rxjs/operators';
import { isUndefined } from 'is-what';
import { match } from 'ts-pattern';

// Libraries modules
import { GenerateContent } from '../functions/generate/generate-content';
import { mkdir } from '@rxnode/fs';

export default class Generate extends Command {
  static description = 'Create a "convertedbook" project folder.';

  static flags = {
    help: flags.help({ char: 'h' }),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({ char: 'n', description: 'Generate' }),
    // flag with no value (-f, --force)
    force: flags.boolean({ char: 'f' }),
    'npm-project-name': flags.string({ char: 'p' }),
    'dry-run': flags.string({ char: 'd' })
  };

  static aliases = ['g'];

  static args = [{ name: 'folderName' }];

  private logCreationBegin = () => {
    console.log('Created project folders and files');
    console.log('Now downloading node modules...');
  }

  private logCreationDone = {
    error: (error: any) => {
      match(error)
        .with(
          {
            code: 'EEXIST',
          },
          () => {
            console.log(
              `Error: Folder already exists: ${error.path}, project was not generated`
            );
          }
        )
        .otherwise(() => console.log('Error: Can not create folder'));
    },
    next: () => {
      console.log('Complete project generation');
    },
  }

  async run() {
    const { args, flags } = this.parse(Generate),
      { folderName } = args;

    // Generate the top folder project first, before using a recursive
    // pattern creation of other files
    const normalizedFolder =
      isUndefined(folderName) || folderName?.length === 0 ?
        'New Folder' :
        folderName;

    // Determine the project folder name
    const executionPath = process.cwd(),
      parentFolderPath = path.join(executionPath, folderName);
    const projectFolder$ = mkdir(
      path.join(executionPath, normalizedFolder)
    ).pipe(share());

    const projectFolderDry$ = flags['dry-run'] ?
      of(path.join(executionPath, normalizedFolder))
        .pipe(share()) : NEVER;

    // Read the project folder for generating the observable creating chain
    const folderStructure = new GenerateContent(
      folderName,
      projectFolder$,
      parentFolderPath
    );

    // Project folder ready for the content inside to be generated
    const projectFolderWithContents$ = projectFolder$
      .pipe(
        mergeMap(() => {
          return folderStructure.generateStructure().structureCreationCount$;
        }),
        tap(this.logCreationBegin),
        mergeMap(() => {

          // Install the NPM modules
          const normalizedFolder =
            isUndefined(folderName) || folderName?.length === 0 ?
              'New Folder' :
              folderName;
          const executionPath = process.cwd(),
            npmService = spawn('npm', ['install'], {
              cwd: path.join(executionPath, normalizedFolder, 'content/'),
            });

          const npmOnComplete$ = bindCallback(npmService.stdout.on),
            npmClose$ = npmOnComplete$.call(npmService, 'close');

          return npmClose$;
        })
      )
      .pipe(share());

    // Project dry run to test out console logging
    projectFolderDry$
      .pipe(tap(this.logCreationBegin))
      .subscribe(this.logCreationDone);

    projectFolderWithContents$
      .pipe(takeUntil(projectFolderDry$))
      .subscribe(this.logCreationDone);

    return {
      projectFolderWithContents$:
        projectFolderWithContents$,
      projectFolderDry$:
        projectFolderDry$
    };
  }
}
