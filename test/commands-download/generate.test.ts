// Third party modules
import { from } from 'rxjs';
import { fancy } from 'fancy-test'
import { filter, share, mergeMap } from 'rxjs/operators';
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

  // Folder paths for generation tests
  const generationPathProjectGenerate = `${baseTempFolder}project-generate`;

  const generatedFolder$ = isOnLine$
    .pipe(
      mergeMap(() => {
        return from(generate.run([generationPathProjectGenerate, '--npm-project-name', npmProjectName]) as Promise<any>);
      }),
      share()
    );

  fancy
    .it('generate project goes to "completion" status', (_, done) => {
      generatedFolder$
        .subscribe({
          next: (result) => {
            result
              .projectFolderWithContents$
              .subscribe({
                complete: () => {

                  // Able to reach completion is a good sign
                  // and use this as a marker for a
                  // successful project generation
                  done();
                }
              })
          }
        });
    });


  // TODO
  // Run server and wait for the "localhost" server message

});
