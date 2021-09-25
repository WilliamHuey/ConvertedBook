// Third party modules
import { expect, test } from '@oclif/test';
import { unnest } from 'ramda';
import { share } from 'rxjs/operators';

// Library modules
import { mkdir } from '@rxnode/fs';
import { retryTest, dryFlag, baseTempFolder } from './test-utilities';
const baseTempNoDownloadFolder = `${baseTempFolder}no-downloads/`;

// Command line usage:
// convertedbook generate my_project --npm-project-name=my_project_name
const npmProjectName = 'my_project_name',
  npmProjectFlagAndName = `--npm-project-name=${npmProjectName}`;

// TODO: Force flag on existing folder and non-existing folder

describe('Dry Run Generation:', () => {
  retryTest()
    .stdout()
    .command(unnest([['generate'], [`${baseTempNoDownloadFolder}dry-run-generate`, npmProjectFlagAndName], dryFlag]))
    .it('dry run with valid project name and npm project name', ctx => {
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
});


