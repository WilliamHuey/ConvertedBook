// Third party modules
import { expect } from '@oclif/test';
import { unnest } from 'ramda';
import { from } from 'rxjs';
import { filter, share } from 'rxjs/operators';
const isOnline = require('is-online');

// Library modules
import generate from '../../src/commands/generate';
import { retryTest, dryFlag } from './test-utilities';

// Command line usage:
// convertedbook generate my_project --npm-project-name=my_project_name
const npmProjectName = 'my_project_name',
  npmProjectFlagAndName = `--npm-project-name=${npmProjectName}`;

describe('Dry Run Generation:', () => {
  retryTest()
    .stdout()
    .command(unnest([['generate'], ['dry-run-generate', npmProjectFlagAndName], dryFlag]))
    .it('dry run with valid project name and npm project name', ctx => {
      expect(ctx.stdout.trim()).to.contain('Created project folders and files\nNow downloading node modules...\nComplete project generation');
    });
});

describe('Actual Project Generation:', () => {
  // The generation test relies on internet connectivity to test out
  // project generation, which provide warning when no connection is found
  const onLineTest$ = from(isOnline() as Promise<boolean>);

  const isOnLine$ = onLineTest$
    .pipe(
      filter((connected): boolean => {
        return connected;
      })
    );

  const isOffLine$ = onLineTest$
    .pipe(
      filter((connected): boolean => {
        return !connected;
      })
    );

  isOffLine$
    .subscribe(() => {
      console.log('Warning: Did not run tests related to NPM module download due to no internet connectivity');
    });

  isOnLine$
    .subscribe(() => {
      it('generate project goes to "completion" status', ctx => {
        generate.run(['project-generate', '--npm-project-name', npmProjectName])
          .then(res => {
            res.projectFolderWithContents$
              .pipe(share())
              .subscribe({
                next: () => {
                  // Able to reach completion is a good sign
                  // and use this as a marker for a
                  // successful project generation
                  ctx();
                },
                error: (e: any) => {
                  console.log('Error', e);
                }
              });
          });
      });
    });
});
