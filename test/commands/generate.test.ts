// Third party module
import 'module-alias/register';
import { expect, test } from '@oclif/test';
import { unnest } from 'ramda';
import { share } from 'rxjs/operators';
import { mkdir } from '@rxnode/fs';

// Library modules
import { retryTest, dryFlag, baseTempFolder } from './test-utilities';
const baseTempNoDownloadFolder = `${baseTempFolder}no-downloads/`;

// Command line usage:
// convertedbook generate my_project --npm-project-name=my_project_name
const npmProjectName = 'my_project_name',
  npmProjectFlagAndName = `--npm-project-name=${npmProjectName}`;

describe('Dry Run Generation:', () => {
  retryTest()
    .stdout()
    .command(unnest([['generate'], [`${baseTempNoDownloadFolder}dry-run-generate`, npmProjectFlagAndName], dryFlag]))
    .it('dry run with valid project name and npm project name', ctx => {
      expect(ctx.stdout.trim()).to.contain('Created project folders and files\nNow downloading node modules...\nComplete project generation');
    });

  retryTest()
    .stdout()
    .command(unnest([['generate'], [`${baseTempNoDownloadFolder}dry-run-generate-no-npm-name`], dryFlag]))
    .it('dry run with valid project name', ctx => {
      expect(ctx.stdout.trim()).to.contain('Created project folders and files\nNow downloading node modules...\nComplete project generation');
    });

  mkdir(`${baseTempNoDownloadFolder}dry-duplicate-folder`).pipe(share())
    .subscribe(() => {
      test
        .stdout()
        .command(unnest([['generate'], [`${baseTempNoDownloadFolder}dry-duplicate-folder`, npmProjectFlagAndName], dryFlag]))
        .it('dry run with existing project folder name', ctx => {
          expect(ctx.stdout.trim()).to.contain('Error: Folder already exists');
        });
    });

  // dry-run and force flag with existing folder
  mkdir(`${baseTempNoDownloadFolder}dry-forced-duplicate-folder`).pipe(share())
    .subscribe((res) => {
      test
        .stdout()
        .command(unnest([['generate'], [`${baseTempNoDownloadFolder}dry-forced-duplicate-folder`, npmProjectFlagAndName], dryFlag, '--force']))
        .it('dry run forced with existing project folder name', ctx => {
          expect(ctx.stdout.trim()).to.contain('Created project folders and files\nNow downloading node modules...\nComplete project generation');
        });
    });

  // dry-run and force flag with non-existing folder
  retryTest()
    .stdout()
    .command(unnest([['generate'], [`${baseTempNoDownloadFolder}dry-forced-folder`, npmProjectFlagAndName], dryFlag]))
    .it('dry run forced with valid project name and npm project name', ctx => {
      expect(ctx.stdout.trim()).to.contain('Created project folders and files\nNow downloading node modules...\nComplete project generation');
    });
});

