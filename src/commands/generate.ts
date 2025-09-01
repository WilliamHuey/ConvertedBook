// Native modules
import spawn from 'cross-spawn';
import * as fs from 'fs';

// Third party modules
import { bindCallback, from, merge, bindNodeCallback, Observable, ReplaySubject, of } from 'rxjs';
import { tap, mergeMap, share, takeUntil, filter, takeLast, take, map } from 'rxjs/operators';
import { match } from 'ts-pattern';
import { pathExists } from 'path-exists';
import { Args, Command, Flags } from '@oclif/core';

// RxJs wrapped fs remove
const remove = bindNodeCallback(fs.rm);

// Libraries modules
import { typeCheck, stringTypes } from '../utilities/type-check.js';
import { GenerateContent } from '../functions/generate/generate-content.js';
import { mkdir } from '../utilities/rxjs-fs.js';
import { truncateFilePath, supposedFileName } from '../functions/build/build-utilities.js';
import ConsoleLog from '../functions/shared/console-log.js'

import { messages, messagesKeys } from '../functions/generate/generate-log.js';

type FileFolderPathError = string

interface FileFolderError {
  code: string;
  path: FileFolderPathError;
}

export default class Generate extends Command {
 constructor(args: string[], config: any) {
    super(args, config);

    // Use a logger for general message logging
    const consoleLog = new ConsoleLog();
    const { consoleLog$, consoleErrorLog$, consoleLogSubject$ } = consoleLog.create();

    Generate.consoleLog$ = consoleLog$;
    Generate.consoleErrorLog$ = consoleErrorLog$;
    Generate.consoleLogSubject$ = consoleLogSubject$;
  }

  static consoleLog$: Observable<any>;
  static consoleErrorLog$: Observable<any>;
  static consoleLogSubject$: ReplaySubject<{}>;

  static description = 'Create a new "convertedbook" project folder with files.'

  static examples = [
    {
      command: '<%= config.bin %> <%= command.id %> my-folder --npm-project-name="a-projectname"',
      description: "Generate a project with the name of 'my-folder' and the package.json project key of 'a-projectname'"
    },
    {
      command: '<%= config.bin %> <%= command.id %> my-folder --npm-project-name="a-projectname" --dry-run',
      description: "Dry run of the command above for testing"
    }
  ]

  static flags = {
    help: Flags.help({ char: 'h' }),

    // flag with a value (-n, --name=VALUE)
    name: Flags.string({ char: 'n', description: 'Generate' }),

    // flag with no value (-f, --force)
    force: Flags.boolean({
      char: 'f',
      default: false,
      description: 'Overwrite an existing folder'
    }),
    'npm-project-name': Flags.string({
      char: 'p',
      description: 'Add the package.json\'s project name field'
    }),
    'dry-run': Flags.boolean({
      char: 'd',
      default: false,
      description: 'Test out the generate command to see cli output without generating the actual project folder and files'
    }),
    toc: Flags.boolean({
      char: 't',
      default: false,
      description: 'When present, display the table of contents link on the top of the document'
    })
  }

  static aliases = ['g'];

  static args = {
    name: Args.string({ required: true, folderName: 'folderName' })
  };

  private logErrorMsg = (error: FileFolderError) => {
    if (error.path === '.') {

      // Current directory path
      Generate.consoleLogSubject$
        .next({error: `${messages[messagesKeys.folderAlreadyExists]}` });
    } else {

      Generate.consoleLogSubject$
        .next({error: `${(messages[messagesKeys
        .folderExistsNotGenerated] as Function)(error)}`});
    }
  }

  private logCreationDone = {
    error: (error: FileFolderError) => {
      this.log(`${error}`);
      match(error)
        .with(
          {
            code: 'EEXIST',
          },
          () => {
            this.logErrorMsg(error);
          }
        )
        .otherwise(() => {
          Generate.consoleLogSubject$
            .next({error: `${messages[messagesKeys.canNotCreateFolder]}` });
        });
    },
    next: () => {
      Generate.consoleLogSubject$
        .next({info: `${messages[messagesKeys.completeProjectGeneration]}` });
    },
  }

  private logCreationBegin = () => {
    Generate.consoleLogSubject$
      .next({info: `${messages[messagesKeys.createdProjectFoldersAndFiles]}` });

    Generate.consoleLogSubject$
      .next({info: `${messages[messagesKeys.nowDownloadingFiles]}` });
  }

  public async run(): Promise<{
    projectFolderWithContents$: Observable<Object>,
    dryRunGenerate$: Observable<any>,
    consoleErrorLog$: Observable<any>,
    consoleLog$: Observable<any>,
  }> {
    const { args, flags } = await this.parse(Generate),
      { name: folderName } = args;
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

    const checkFullOutputPathProjectFolder$ = from(pathExists
      (normalizedFolder) as Promise<boolean>);

    // Verify the full project's folder existence or non-existence
    const fullProjectFolderNonExists$ = checkFullOutputPathProjectFolder$
      .pipe(
        filter((outputFolder: boolean) => {
          return outputFolder === false;
        })
      );

    const fullProjectFolderExists$ = checkFullOutputPathProjectFolder$
      .pipe(
        filter((outputFolder: boolean) => {
          return outputFolder === true;
        }),
        takeUntil(fullProjectFolderNonExists$)
      );

    const checkOutputFolder$ = from(pathExists
      (normalizedParentFolderName) as Promise<boolean>);

    // Checking one level up the project to verify the proper placement
    // of the project folder
    const outputFolderExists$ = checkOutputFolder$
      .pipe(
        filter((outputFolder: boolean) => {
          // Also accept the situation where only the project name exists
          // by itself, meaning that the output folder should exist
          return outputFolder || !parentFolderNamePresent;
        }),
        takeLast(1),
        share()
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
          this.log(`${messages[messagesKeys.nonExistingParentFolder]} "${actualProjectFolderName}"`);
        },
        error: () => {
          // Ignore error
        }
      });

    const forcedOutputFolderExists$ = outputFolderExists$
      .pipe(
        filter(() => {
          return forcedGenerate;
        }),
      );

    // Delete the existing folder if it exists when the forced flag is found
    const deleteFolderOnForce$ = forcedOutputFolderExists$
      .pipe(
        filter(() => {
          return !isDryRun;
        }),
        mergeMap(() => {
          return remove(folderName, {
            recursive: true, force: true
          })
            .pipe(share());
        }))
      .pipe(share());

    const creationVerified$ = merge(
      fullProjectFolderNonExists$,
      deleteFolderOnForce$
    )
      .pipe(
        takeLast(1)
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
            )
              .pipe(share());
        }),
        takeLast(1),
        share()
      );

    const normalizedFolderPath = parentFolderNamePresent ?
      normalizedFolder : folderName;

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
        tap(this.logCreationBegin),
        mergeMap(() => {

          // Install the NPM modules
          const npmService = spawn('npm', ['install'], {
            cwd: normalizedFolderPath,
          });

          npmService.on("error", function(err) {
            console.log('err--', err)
          });

          if (npmService.stdout) {
            const npmOnComplete$ = bindCallback(npmService.stdout.on),
              npmClose$ = npmOnComplete$.call(npmService, 'close');

            return npmClose$;
          } else {
            return of("Error: Std not defined");
          }
          
        })
      )
      .pipe(map(() => {
        return 'Created project folder';
      }))
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

    const dryRunGenerate$ = merge(creationVerified$, forcedOutputFolderExists$)
      .pipe(
        take(1),
        filter(() => {
          return isDryRun;
        }),
        map(() => {
          return isDryRun;
        })
      );

    // Actual project generation
    projectFolderWithContents$
      .subscribe(this.logCreationDone);

    // Log both the information and warning messages
    Generate.consoleErrorLog$
      .subscribe((msgs) => {
        const lastestMsg = msgs[msgs.length - 1];
        this.log(lastestMsg.error);
      });

    Generate.consoleLog$
      .pipe(

        // Prevent double logging of the messages with actual project
        // folder generation
        takeUntil(projectFolderWithContents$)
      )
      .subscribe((msgs) => {
        const lastestMsg = msgs[msgs.length - 1];
        this.log(lastestMsg.info);
      });

    // Dry run branch should still log out console messages
    dryRunGenerate$
      .subscribe(this.logCreationDone);

    return {
      projectFolderWithContents$,
      dryRunGenerate$,
      consoleErrorLog$: Generate.consoleErrorLog$,
      consoleLog$: Generate.consoleLog$
    };

  }
}
