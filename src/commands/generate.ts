// Third party module
import 'module-alias/register';

// Native modules
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

// Third party modules
import { Command, flags } from '@oclif/command';
import { bindCallback, from, merge, bindNodeCallback, race } from 'rxjs';
import { tap, mergeMap, share, takeUntil, filter, takeLast, take } from 'rxjs/operators';
import { match } from 'ts-pattern';
const IsThere = require('is-there');

// RxJs wrapped fs remove
const remove = bindNodeCallback(fs.rm);

// Libraries modules
import { typeCheck, stringTypes } from '@utilities/type-check';
import { GenerateContent } from '../functions/generate/generate-content';
import { mkdir } from '@utilities/rxjs-fs';
import { truncateFilePath, supposedFileName } from '../functions/build/build-utilities';

type FileFolderPathError = string

interface FileFolderError {
  code: string;
  path: FileFolderPathError;
}

export default class Generate extends Command {
  static description = 'Create a "convertedbook" project folder.';

  static flags = {
    help: flags.help({ char: 'h' }),

    // flag with a value (-n, --name=VALUE)
    name: flags.string({ char: 'n', description: 'Generate' }),

    // flag with no value (-f, --force)
    force: flags.boolean({
      char: 'f',
      default: false,
      description: 'overwrite an existing folder'
    }),
    'npm-project-name': flags.string({
      char: 'p',
      description: 'add the package.json\'s project name field'
    }),
    'dry-run': flags.boolean({
      char: 'd',
      default: false,
      description: 'test out the generate command to see cli output without generating the actual project folder and files'
    }),
    toc: flags.boolean({
      char: 't',
      default: false,
      description: 'when present, display the table of contents link on the top of the document'
    })
  };

  static aliases = ['g'];

  static args = [{ name: 'folderName' }];

  private logCreationBegin = () => {
    console.log('Created project folders and files');
    console.log('Now downloading node modules...');
  }

  private logErrorMsg = (error: FileFolderError) => {
    if (error.path === '.') {
      // Current directory path
      console.log(
        'Error: Folder already exists in current directory and project was not generated'
      );
    } else {
      console.log(
        `Error: Folder already exists: ${error.path}. Project was not generated`
      );
    }
  }

  private logCreationDone = {
    error: (error: FileFolderError) => {
      console.log(error);
      match(error)
        .with(
          {
            code: 'EEXIST',
          },
          () => {
            this.logErrorMsg(error);
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

    const isDryRun = flags['dry-run'],
      forcedGenerate = flags.force;

    // Generate the top folder project first, before using a recursive
    // pattern creation of other files
    const normalizedFolder = typeCheck(folderName, stringTypes.Undefined) ||
      folderName?.length === 0 ?
      'New Folder' :
      folderName;

    // Determine the project folder name
    const {
      filePathFolder: parentFolderName,
      filePathSplit
    } = truncateFilePath(folderName);

    const parentFolderNamePresent = parentFolderName.length > 0;
    const normalizedParentFolderName = parentFolderNamePresent ?
      parentFolderName : normalizedFolder;
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
        },
        error: () => {
          // Ignore error
        }
      });

    const executionPath = process.cwd(),
      parentFolderPath = path.join(executionPath, folderName);

    const forcedOutputFolderExists$ = outputFolderExists$
      .pipe(
        filter(() => {
          return forcedGenerate;
        })
      );

    // Delete the existing folder if it exists when the forced flag is found
    const deleteFolderOnForce$ = forcedOutputFolderExists$
      .pipe(
        filter(() => {
          return !isDryRun;
        }),
        mergeMap(() => {
          return remove(path.join(parentFolderPath), {
            recursive: true, force: true
          })
            .pipe(share());
        }))
      .pipe(share());

    deleteFolderOnForce$.subscribe(() => { });

    const creationVerified$ = race(
      deleteFolderOnForce$,
      fullProjectFolderNonExists$)
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

            // Output folder exists one level above the specified
            // project folder name then create the project folder as is
            mkdir(
              filePathSplit.join('/')
            ).pipe(share()) : mkdir(
              normalizedFolder
            ).pipe(share());
        }),
        takeLast(1),
        share()
      );

    const normalizedFolderPath = parentFolderNamePresent ?
      normalizedFolder : parentFolderPath;

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
          return folderStructure
            .generateStructure(fullProjectFolderExists$)
            .structureCreationCount$;
        }),
        take(1),
        tap(this.logCreationBegin),
        mergeMap(() => {
          // Install the NPM modules
          const npmService = spawn('npm', ['install'], {
            cwd: normalizedFolderPath,
          });

          const npmOnComplete$ = bindCallback(npmService.stdout.on),
            npmClose$ = npmOnComplete$.call(npmService, 'close');

          return npmClose$;
        })
      )
      .pipe(share());

    // Existing folder prevents generation of the project folder
    fullProjectFolderExists$
      .pipe(
        filter(() => {
          return !forcedGenerate;
        })
      )
      .subscribe(() => {
        this.logErrorMsg({ code: 'EEXIST', path: normalizedParentFolderName });
      });

    // Actual project generation
    projectFolderWithContents$
      .subscribe(this.logCreationDone);

    // Dry run project generation
    // should still log out to console when force flag is present
    const projectFolderDry$ = merge(creationVerified$,
      forcedOutputFolderExists$)
      .pipe(filter(() => {
        return isDryRun;
      }));

    projectFolderDry$
      .pipe(takeLast(1), share())
      .pipe(tap(this.logCreationBegin))
      .subscribe(this.logCreationDone);

    return {
      projectFolderWithContents$,
      projectFolderDry$
    };
  }
}
