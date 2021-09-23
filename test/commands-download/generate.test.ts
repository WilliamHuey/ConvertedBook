// Third party modules
import { from } from 'rxjs';
import { fancy } from 'fancy-test'
import { filter, take, share } from 'rxjs/operators';
const del = require('del');
const isOnline = require('is-online');

// Library modules
import generate from '../../src/commands/generate';
import { baseTempFolder } from '../commands/test-utilities';

// Command line usage:
// convertedbook generate my_project --npm-project-name=my_project_name
const npmProjectName = 'my_project_name';

describe('Actual project generation:', () => {

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
      console.log('Warning: Tests will fail if NPM module can not be downloaded due to no internet connectivity');
    });

  // Online observable wrapped function
  const isOnLine = function (fn: any) {
    isOnLine$
      .subscribe(fn)
  }

  // Able to reach completion is a good sign
  // and use this as a marker for a
  // successful project generation
  describe('with internet connectivity:', () => {

    // Folder paths for generation tests
    const originalFolderPath = process.cwd();
    const generationPathProjectGenerate = `${baseTempFolder}project-generate`;

    fancy
      .it('will download NPM modules to generate project to "completion" status', (_, done) => {

        isOnLine(() => {
          const generateProjectFolder$ = from(generate.run([generationPathProjectGenerate, '--npm-project-name', npmProjectName]) as Promise<any>).pipe(take(1), share());

          generateProjectFolder$
            .subscribe({
              next: (result) => {
                result
                  .projectFolderWithContents$
                  .subscribe({
                    complete: () => {
                      done();
                    }
                  })
              }
            });
        });

      });

    fancy
      .it('run the server', (_, done) => {
        isOnLine(() => {
          //process.chdir(generationPathProjectGenerate);

          //process.chdir(originalFolderPath);
          done();
        });
      });

  });
});
