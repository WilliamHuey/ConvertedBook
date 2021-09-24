// Third party modules
import { from, ReplaySubject } from 'rxjs';
import { fancy } from 'fancy-test'
import { filter, take, share, mergeMap } from 'rxjs/operators';
const del = require('del');
const isOnline = require('is-online');

// Library modules
import generate from '../../src/commands/generate';
import serve from '../../src/commands/serve';
import { baseTempFolder } from '../commands/test-utilities';

// Command line usage:
// convertedbook generate my_project --npm-project-name=my_project_name
const npmProjectName = 'my_project_name';

describe('Actual project generation:', () => {

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

  // Able to reach completion is a good sign and use this as a marker for a
  // successful project generation
  describe('with internet connectivity:', () => {

    after(() => {
      del([`${baseTempFolder}*`, `!${baseTempFolder}.gitkeep`]);
    });

    // Folder paths for generation tests
    const originalFolderPath = process.cwd(),
      generationPathProjectGenerate = `${baseTempFolder}project-generate`;

    const generationDone$ = new ReplaySubject();

    fancy
      .it('will download NPM modules to generate project to "completion" status', (_, done) => {

        isOnLine(() => {
          const generateProjectFolder$ = from(generate.run([generationPathProjectGenerate, '--npm-project-name', npmProjectName]) as Promise<any>).pipe(take(1), share());

          generateProjectFolder$
            .pipe(
              mergeMap((res) => {
                return res.projectFolderWithContents$;
              })
            )
            .subscribe({
              next: () => {
                done();
                generationDone$.next('generated');
              }
            });
        });

      });

    fancy
      .it('run the server command', (_, done) => {
        generationDone$.subscribe(() => {
          process.chdir(generationPathProjectGenerate);
          const serveRun = serve.run([]);

          serveRun
            .then((serveProcess) => {
              serveProcess.stdout.on('data', function (data: any) {
                if (data.toString().trim() == "Complete file format generation") {
                  serveProcess.kill();
                  process.chdir(originalFolderPath);
                  done();
                }
              });
            });
        });
      });

  });
});
