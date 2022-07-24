// Third party module
import 'module-alias/register';
import { expect } from '@oclif/test';
import { from, of } from 'rxjs';
import { take, share, mergeMap } from 'rxjs/operators';
import { unnest } from 'ramda';
import { fancy } from 'fancy-test';
const request = require('supertest');
const del = require('del');

// Native modules
import * as path from 'path';

// Library modules
import build from '../../src/commands/build';
// import { createServer } from '../../src/functions/build/build-server';
import serve from '../../src/commands/serve';
import {
  supposedFileName,
  getFileNameFromParts,
  truncateFilePath
} from '../../src/functions/build/build-utilities';
import { retryTest, baseTempFolder, dryFlag, testDataDirectory } from './test-utilities';

describe('Build', () => {
  const invalidInputFlag = `${testDataDirectory}zz`;
  const invalidOutputFlag = `${testDataDirectory}jkl/hlkj/`;
  const validInputFlag = `${testDataDirectory}input.latex`;
  const validOutputFlag = `${testDataDirectory}`;
  const flags = [validInputFlag, validOutputFlag];

  const dryFlagStr = dryFlag.join("");

  after(() => {
    del([`${baseTempFolder}no-downloads/*`, `!${baseTempFolder}no-downloads/.gitkeep`]);
  });

  fancy
    .it('dry run with valid input and invalid output flag', (_, done) => {
      const buildFile$ = from(build.run([
        '--input',
        validInputFlag,
        '--output',
        invalidOutputFlag,
        dryFlagStr
      ]) as Promise<any>).pipe(take(1), share());

      buildFile$
        .subscribe({
          next: ({ asyncResultsLog$ }) => {
            asyncResultsLog$
              .pipe(
                mergeMap((res: any) => {
                  return res;
                })
              )
              .subscribe((asyncResultsLog: any) => {
                expect(asyncResultsLog.msg)
                  .to.contain('Build failed: Invalid output folder/file');
                done();
              });
          }
        });
    });

  fancy
    .it('dry run with invalid input and valid output flag', (_, done) => {
      const buildFile$ = from(build.run([
        '--input',
        invalidInputFlag,
        '--output',
        validOutputFlag,
        dryFlagStr
      ]) as Promise<any>).pipe(take(1), share());

      buildFile$
        .subscribe({
          next: ({ asyncResultsLog$ }) => {
            asyncResultsLog$
              .pipe(
                mergeMap((res: any) => {
                  return res;
                })
              )
              .subscribe((asyncResultsLog: any) => {
                expect(asyncResultsLog.msg)
                  .to.contain('Build failed: Invalid input file');
                done();
              });
          }
        });
    });

  fancy
    .it('dry run with invalid input and invalid output flags', (_, done) => {
      const buildFile$ = from(build.run([
        '--input',
        invalidInputFlag,
        '--output',
        invalidOutputFlag,
        dryFlagStr
      ]) as Promise<any>).pipe(take(1), share());

      buildFile$
        .subscribe({
          next: ({ asyncResultsLog$ }) => {
            asyncResultsLog$
              .pipe(
                mergeMap((res: any) => {
                  return res;
                })
              )
              .subscribe((asyncResultsLog: any) => {
                expect(asyncResultsLog.msg)
                  .to.contain('Build failed: Invalid input file and invalid output folder/file');
                done();
              });
          }
        });
    });

  fancy
    .it('dry run with valid input and output flags', (_, done) => {
      const buildFile$ = from(build.run([
        'html',
        'pdf',
        '--input',
        validInputFlag,
        '--output',
        validOutputFlag,
        dryFlagStr
      ]) as Promise<any>).pipe(take(1), share());

      buildFile$
        .subscribe({
          next: ({ asyncResultsLog$ }) => {
            asyncResultsLog$
              .pipe(
                mergeMap((res: any) => {
                  return res;
                })
              )
              .subscribe((asyncResultsLog: any) => {
                expect(asyncResultsLog.msg)
                  .to.contain('Creating output file');
                done();
              });
          }
        });
    });

  fancy
    .it('dry run with pdf format and valid flags', (_, done) => {
      const buildFile$ = from(build.run([
        'pdf',
        '--input',
        validInputFlag,
        '--output',
        validOutputFlag,
        dryFlagStr
      ]) as Promise<any>).pipe(take(1), share());

      buildFile$
        .subscribe({
          next: ({ asyncResultsLog$ }) => {
            asyncResultsLog$
              .pipe(
                mergeMap((res: any) => {
                  return res;
                })
              )
              .subscribe((asyncResultsLog: any) => {
                expect(asyncResultsLog.msg)
                  .to.contain('Creating output file');
                done();
              });
          }
        });
    });

  fancy
    .it('dry run with epub format and valid flags', (_, done) => {
      const buildFile$ = from(build.run([
        'epub',
        '--input',
        validInputFlag,
        '--output',
        validOutputFlag,
        dryFlagStr
      ]) as Promise<any>).pipe(take(1), share());

      buildFile$
        .subscribe({
          next: ({ asyncResultsLog$ }) => {
            asyncResultsLog$
              .pipe(
                mergeMap((res: any) => {
                  return res;
                })
              )
              .subscribe((asyncResultsLog: any) => {
                expect(asyncResultsLog.msg)
                  .to.contain('Creating output file');
                done();
              });
          }
        });
    });

  fancy
    .it('dry run with epub and html format and valid flags', (_, done) => {
      const buildFile$ = from(build.run([
        'epub',
        'html',
        '--input',
        validInputFlag,
        '--output',
        validOutputFlag,
        dryFlagStr
      ]) as Promise<any>).pipe(take(1), share());

      buildFile$
        .subscribe({
          next: ({ asyncResultsLog$ }) => {
            asyncResultsLog$
              .pipe(
                mergeMap((res: any) => {
                  return res;
                })
              )
              .subscribe((asyncResultsLog: any) => {
                expect(asyncResultsLog.msg)
                  .to.contain('Creating output file');
                done();
              });
          }
        });
    });

  fancy
    .it('dry run with html, pdf, and epub format with valid flags', (_, done) => {
      const buildFile$ = from(build.run([
        'html',
        'pdf',
        'epub',
        '--input',
        validInputFlag,
        '--output',
        validOutputFlag,
        dryFlagStr
      ]) as Promise<any>).pipe(take(1), share());

      buildFile$
        .subscribe({
          next: ({ asyncResultsLog$ }) => {
            asyncResultsLog$
              .pipe(
                mergeMap((res: any) => {
                  return res;
                })
              )
              .subscribe((asyncResultsLog: any) => {
                expect(asyncResultsLog.msg)
                  .to.contain('Creating output file');
                done();
              });
          }
        });
    });

  fancy
    .it('dry run with html, pdf, and epub format with valid flags', (_, done) => {
      const buildFile$ = from(build.run([
        'sdaf',
        '--input',
        validInputFlag,
        '--output',
        validOutputFlag,
        dryFlagStr
      ]) as Promise<any>).pipe(take(1), share());

      buildFile$
        .subscribe({
          next: ({ asyncResultsLog$ }) => {
            asyncResultsLog$
              .pipe(
                mergeMap((res: any) => {
                  return res;
                })
              )
              .subscribe((asyncResultsLog: any) => {
                expect(asyncResultsLog.msg)
                  .to.contain('Did not build as there are no valid formats');
                done();
              });
          }
        });
    });

  fancy
    .it('dry run with multiple invalid formats and valid flags', (_, done) => {
      const buildFile$ = from(build.run([
        'sdaf',
        'mf',
        '--input',
        validInputFlag,
        '--output',
        validOutputFlag,
        dryFlagStr
      ]) as Promise<any>).pipe(take(1), share());

      buildFile$
        .subscribe({
          next: ({ asyncResultsLog$ }) => {
            asyncResultsLog$
              .pipe(
                mergeMap((res: any) => {
                  return res;
                })
              )
              .subscribe((asyncResultsLog: any) => {
                expect(asyncResultsLog.msg)
                  .to.contain('Did not build as there are no valid formats');
                done();
              });
          }
        });
    });

  fancy
    .it('dry run with valid and invalid formats with valid flags', (_, done) => {
      const buildFile$ = from(build.run([
        'sdaf',
        'pdf',
        '--input',
        validInputFlag,
        '--output',
        validOutputFlag,
        dryFlagStr
      ]) as Promise<any>).pipe(take(1), share());

      buildFile$
        .subscribe({
          next: ({ asyncResultsLog$ }) => {
            asyncResultsLog$
              .pipe(
                mergeMap((res: any) => {
                  return res;
                })
              )
              .subscribe((asyncResultsLog: any) => {

                // Still create the valid document format
                expect(asyncResultsLog.msg)
                  .to.contain('Creating output file');
                done();
              });
          }
        });
    });

  fancy
    .it('dry run with no formats specified, defaults to all formats and with valid flags', (_, done) => {
      const buildFile$ = from(build.run([
        '--input',
        validInputFlag,
        '--output',
        validOutputFlag,
        dryFlagStr
      ]) as Promise<any>).pipe(take(1), share());

      buildFile$
        .subscribe({
          next: ({ asyncResultsLog$ }) => {
            asyncResultsLog$
              .pipe(
                mergeMap((res: any) => {
                  return res;
                })
              )
              .subscribe((asyncResultsLog: any) => {

                // Still create the valid document format
                expect(asyncResultsLog.msg)
                  .to.contain('Creating output file');
                done();
              });
          }
        });
    });

  fancy
    .it('dry run with no formats and empty args flag and valid input', (_, done) => {
      const buildFile$ = from(build.run([
        "--args=''",
        '--input',
        validInputFlag,
        dryFlagStr
      ]) as Promise<any>).pipe(take(1), share());

      buildFile$
        .subscribe({
          next: ({ asyncResultsLog$ }) => {
            asyncResultsLog$
              .pipe(
                mergeMap((res: any) => {
                  return res;
                })
              )
              .subscribe((asyncResultsLog: any) => {
                expect(asyncResultsLog.msg)
                  .to.contain('Build failed: Missing a required "--input" or "--output"');
                done();
              });
          }
        });
    });

  fancy
    .it('with no formats and no flags', (_, done) => {
      const buildFile$ = from(build.run([]) as Promise<any>)
        .pipe(take(1), share());

      buildFile$
        .subscribe({
          next: ({ asyncResultsLog$ }) => {
            asyncResultsLog$
              .pipe(
                mergeMap((res: any) => {
                  return res;
                })
              )
              .subscribe((asyncResultsLog: any) => {
                expect(asyncResultsLog.msg)
                  .to.contain('Build failed: No arguments and no flags available');
                done();
              });
          }
        });
    });

  fancy
    .it('with only invalid formats and no flags', (_, done) => {
      const buildFile$ = from(build.run([
        'nsdfa',
        'ce'
      ]) as Promise<any>)
        .pipe(take(1), share());

      buildFile$
        .subscribe({
          next: ({ asyncResultsLog$ }) => {
            asyncResultsLog$
              .pipe(
                mergeMap((res: any) => {
                  return res;
                })
              )
              .subscribe((asyncResultsLog: any) => {
                expect(asyncResultsLog.msg)
                  .to.contain('Build failed: Arguments provided but no flags present');
                done();
              });
          }
        });
    });

  fancy
    .it('with pdf format and no flags', (_, done) => {
      const buildFile$ = from(build.run([
        'pdf',
      ]) as Promise<any>)
        .pipe(take(1), share());

      buildFile$
        .subscribe({
          next: ({ asyncResultsLog$ }) => {
            asyncResultsLog$
              .pipe(
                mergeMap((res: any) => {
                  return res;
                })
              )
              .subscribe((asyncResultsLog: any) => {
                expect(asyncResultsLog.msg)
                  .to.contain('Build failed: Arguments provided but no flags present');
                done();
              });
          }
        });
    });

  fancy
    .it('with all invalid formats and no flags', (_, done) => {
      const buildFile$ = from(build.run([
        'sdaf',
        'mf'
      ]) as Promise<any>)
        .pipe(take(1), share());

      buildFile$
        .subscribe({
          next: ({ asyncResultsLog$ }) => {
            asyncResultsLog$
              .pipe(
                mergeMap((res: any) => {
                  return res;
                })
              )
              .subscribe((asyncResultsLog: any) => {
                expect(asyncResultsLog.msg)
                  .to.contain('Build failed: Arguments provided but no flags present');
                done();
              });
          }
        });
    });

  fancy
    .it('with no formats and empty args flag', (_, done) => {
      const buildFile$ = from(build.run([
        "--args=''"
      ]) as Promise<any>)
        .pipe(take(1), share());

      buildFile$
        .subscribe({
          next: ({ asyncResultsLog$ }) => {
            asyncResultsLog$
              .pipe(
                mergeMap((res: any) => {
                  return res;
                })
              )
              .subscribe((asyncResultsLog: any) => {
                expect(asyncResultsLog.msg)
                  .to.contain('Build failed: No required flags found (--input, --output)');
                done();
              });
          }
        });
    });

  fancy
    .it('file name checks with "supposed file name"', () => {
      const results = supposedFileName('/a/path/stuff.js');
      expect(results).to.be.an('array').that.includes('stuff');
      expect(results).to.be.an('array').that.includes('js');
    });

  fancy
    .it('file name checks with "get file name from parts"', () => {
      const results = supposedFileName('/a/path/stuff.js');
      const firstItem = getFileNameFromParts(results);
      expect(firstItem).to.contain('stuff');
    });

  fancy
    .it('file name checks with "truncate file path"', () => {
      const results = truncateFilePath('/a/path/stuff.js');
      expect(results.filePathSplit).to.be.an('array').that.includes('stuff.js');
      expect(results.filePathFolder).to.contain('/a/path');
    });

  // Server - Content-type check
  fancy
    .it('static server serves found html content', async (_, done) => {
      const serveRun$ = await serve.run([]);
      serveRun$
        .subscribe((serveProcess: any) => {
          if (serveProcess.includes('Did not find the server.js" file, might not be a "convertedbook" project!')) {
            done();
          }
        });
    });

  // Command inputs build
  fancy
    .it('runs build pdf and html command with minimum flags', (_, done) => {

      const buildFile$ = from(build.run([
        'pdf',
        'html',
        '--input',
        path.join(__dirname, '../fixtures/io/input.latex'),
        '--output',
        path.join(__dirname, '../temp/no-downloads/pdf-html-min-output.pdf'),
      ]) as Promise<any>)
        .pipe(take(1), share());

      buildFile$
        .subscribe({
          next: ({ docsGenerated$ }) => {
            docsGenerated$
              .subscribe(() => {
                done();
              });
          }
        });
    });

  fancy
    .it('runs build pdf command with exact flag. Will ignore the exact flag.', (_, done) => {

      const buildFile$ = from(build.run([
        'pdf',
        '--input',
        path.join(__dirname, '../fixtures/io/input.latex'),
        '--output',
        path.join(__dirname, '../temp/no-downloads/pdf-exact-output.pdf'),
        '--exact'
      ]) as Promise<any>)
        .pipe(take(1), share());

      buildFile$
        .subscribe({
          next: ({ docsGenerated$ }) => {
            docsGenerated$
              .subscribe(() => {
                done();
              });
          }
        });
    });

  fancy
    .it('runs build pdf command with force flags', (_, done) => {

      const buildFile$ = from(build.run([
        'pdf',
        '--input',
        path.join(__dirname, '../fixtures/io/input.latex'),
        '--output',
        path.join(__dirname, '../temp/no-downloads/exact-force-output.pdf'),
      ]) as Promise<any>)
        .pipe(take(1), share());

      buildFile$
        .subscribe(
          (res: any) => {
            const { docsGenerated$ } = res;
            docsGenerated$
              .subscribe(() => {
                done();
              });
          }
        );
    });
});
