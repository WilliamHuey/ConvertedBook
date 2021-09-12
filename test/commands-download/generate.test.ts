// Third party modules
import { from } from 'rxjs';
import { fancy } from 'fancy-test'
import { filter, share } from 'rxjs/operators';
const del = require('del');
const isOnline = require('is-online');

// Library modules
import generate from '../../src/commands/generate';
import { baseTempFolder } from '../commands/test-utilities';

// Command line usage:
// convertedbook generate my_project --npm-project-name=my_project_name
const npmProjectName = 'my_project_name';

describe('Actual Project Generation:', () => {

  after(() => {
    del([`${baseTempFolder}*`, `!${baseTempFolder}.gitkeep`]);
  });

  fancy
    .it('generate project goes to "completion" status', (_, done) => {

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
          generate.run([`${baseTempFolder}project-generate`, '--npm-project-name', npmProjectName])
            .then(res => {
              res.projectFolderWithContents$
                .pipe(share())
                .subscribe({
                  next: () => {
                    // Able to reach completion is a good sign
                    // and use this as a marker for a
                    // successful project generation
                    done();
                  }
                });
            });

        });
    })
});
