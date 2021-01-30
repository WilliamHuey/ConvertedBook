// Third party modules
import { expect } from '@oclif/test';
import { unnest } from 'ramda';

// Library modules
import generate from '../../src/commands/generate';
import { retryTest, dryFlag } from './test-utilities';

describe('Generate', () => {
  // Command line usage:
  // convertedbook generate my_project --npm-project-name=my_project_name
  const projectFolderName = 'my_project',
    npmProjectName = 'my_project_name',
    npmProjectFlagAndName = `--npm-project-name=${npmProjectName}`;

  retryTest()
    .stdout()
    .command(unnest([['generate'], [projectFolderName, npmProjectFlagAndName], dryFlag]))
    .it('dry run with valid project name and npm project name', ctx => {
      expect(ctx.stdout.trim()).to.contain('Created project folders and files\nNow downloading node modules...\nComplete project generation');
    });

  it('generate project goes to "completion" status', ctx => {
    generate.run([projectFolderName, '--npm-project-name', npmProjectName])
      .then(res => {
        res.projectFolderWithContents$
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
