// Native modules
import { spawn } from 'child_process';
const path = require('path');

// Third party modules
import { Command, flags } from '@oclif/command';
import { bindCallback, of, from } from 'rxjs';
import { tap, mergeMap, share, takeUntil, catchError, filter } from 'rxjs/operators';
import { isUndefined } from 'is-what';
import { match } from 'ts-pattern';
const IsThere = require('is-there');

// Libraries modules
import { GenerateContent } from '../functions/generate/generate-content';
import { mkdir } from '@rxnode/fs';
import { truncateFilePath, supposedFileName } from '../functions/build/build-utilities';

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
    let { 'npm-project-name': npmProjectName } = flags;
    npmProjectName = npmProjectName || 'project';

    const isDryRun = 'dry-run' in flags;

    // Generate the top folder project first, before using a recursive
    // pattern creation of other files
    const normalizedFolder =
      isUndefined(folderName) || folderName?.length === 0 ?
        'New Folder' :
        folderName;

    // Determine the project folder name
    const {
      filePathFolder: parentFolderName,
      filePathSplit
    } = truncateFilePath(folderName);

    const parentFolderNamePresent = parentFolderName.length > 0;
    const normalizedParentFolderName = parentFolderNamePresent ? parentFolderName : normalizedFolder;
    const actualProjectFolderName = supposedFileName(normalizedFolder)
      ?.join('');

    const checkFullOutputPathProjectFolder$ = from(IsThere
      .promises.directory(normalizedFolder) as Promise<boolean>);

    // Verify the full project's folder existence or non-existence
    const fullProjectFolderExists$ = checkFullOutputPathProjectFolder$
      .pipe(
        filter((outputFolder: boolean) => {
          return outputFolder;
        })
      );
    const fullProjectFolderNonExists$ = checkFullOutputPathProjectFolder$
      .pipe(
        filter((outputFolder: boolean) => {
          return !outputFolder;
        })
      );

    const checkOutputFolder$ = from(IsThere
      .promises.directory(normalizedParentFolderName) as Promise<boolean>);

    // Checking one level up the project to verify the proper placement
    // of the project folder
    const outputFolderExists$ = checkOutputFolder$
      .pipe(
        filter((outputFolder: boolean) => {
          // Also accept the situation where only the project name exists
          // by itself, meaning that the output folder should exist
          return outputFolder || !parentFolderNamePresent;
        })
      );

    const outputFolderNonExists$ = checkOutputFolder$
      .pipe(
        filter((outputFolder: boolean) => {
          return !outputFolder;
        })
      );

    const nonExistentUpperLevelFolder$ = outputFolderNonExists$
      .pipe(
        filter(() => {
          return parentFolderNamePresent;
        }),
        takeUntil(outputFolderExists$)
      );

    nonExistentUpperLevelFolder$
      .subscribe({
        next: () => {
          console.log(`Error: Non-existent parent folder for "${actualProjectFolderName}"`);
        }
      });

    const executionPath = process.cwd(),
      parentFolderPath = path.join(executionPath, folderName);

    const creationVerified$ = fullProjectFolderNonExists$
      .pipe(
        mergeMap(() => {
          return outputFolderExists$;
        }),
        takeUntil(nonExistentUpperLevelFolder$)
      );

    const projectFolder$ = creationVerified$
      .pipe(
        filter(() => {
          return !isDryRun;
        }),
        mergeMap(() => {
          return parentFolderNamePresent ?

            // Output folder exists one level above the specified project folder name
            // then create the project folder as is
            mkdir(
              filePathSplit.join('/')
            ).pipe(share()) : mkdir(
              normalizedFolder
            ).pipe(share());
        }),
        share(),
        catchError(error => of(error))
      );

    const normalizedFolderPath = parentFolderNamePresent ? normalizedFolder : parentFolderPath;

    // Read the project folder for generating the observable creating chain.
    // Normalize the path for project folder generation
    const folderStructure = new GenerateContent(
      npmProjectName,
      projectFolder$,
      normalizedFolderPath
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
          const npmService = spawn('npm', ['install'], {
            cwd: path.join(normalizedFolderPath, 'content/'),
          });

          const npmOnComplete$ = bindCallback(npmService.stdout.on),
            npmClose$ = npmOnComplete$.call(npmService, 'close');

          return npmClose$;
        })
      )
      .pipe(share());

    // Existing folder prevents generation of the project folder
    fullProjectFolderExists$
      .subscribe(() => {
        console.log(
          `Error: Folder already exists: ${normalizedParentFolderName}, project was not generated`
        );
      });

    // Actual project generation
    projectFolderWithContents$
      .subscribe(this.logCreationDone);

    // Dry run project generation
    const projectFolderDry$ = creationVerified$
      .pipe(filter(() => {
        return isDryRun;
      }));

    projectFolderDry$
      .pipe(tap(this.logCreationBegin))
      .subscribe(this.logCreationDone);

    return {
      projectFolderWithContents$:
        projectFolderWithContents$,
      projectFolderDry$:
        projectFolderDry$
    };
  }
}
