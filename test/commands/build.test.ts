// Third party module
import 'module-alias/register';
import { expect } from '@oclif/test';
import { from } from 'rxjs';
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
  const invalidInputFlag = `--input=${testDataDirectory}zz`;
  const invalidOutputFlag = `--output=${testDataDirectory}jkl/hlkj/`;
  const validInputFlag = `--input=${testDataDirectory}input.latex`;
  const validOutputFlag = `--output=${testDataDirectory}`;
  const flags = [validInputFlag, validOutputFlag];

  after(() => {
    del([`${baseTempFolder}no-downloads/*`, `!${baseTempFolder}no-downloads/.gitkeep`]);
  });

  retryTest()
    .stdout()
    .command(unnest([['build'], [validInputFlag, invalidOutputFlag], dryFlag]))
    .it('dry run with valid input and invalid output flag', ctx => {
      expect(ctx.stdout.trim()).to.contain('Build failed: Invalid output folder/file');
    });

  retryTest()
    .stdout()
    .command(unnest([['build'], [invalidInputFlag, validOutputFlag], dryFlag]))
    .it('dry run with invalid input and valid output flag', ctx => {
      expect(ctx.stdout.trim()).to.contain('Build failed: Invalid input file');
    });

  retryTest()
    .stdout()
    .command(unnest([['build'], [invalidInputFlag, invalidOutputFlag], dryFlag]))
    .it('dry run with invalid input and invalid output flags', ctx => {
      expect(ctx.stdout.trim()).to.contain('Build failed: Invalid input file and invalid output folder/file');
    });

  retryTest()
    .stdout()
    .command(unnest([['build', 'html', 'pdf'], flags, dryFlag]))
    .it('dry run with valid input and output flags', ctx => {
      expect(ctx.stdout.trim()).to.contain('Creating output file');
    });

  retryTest()
    .stdout()
    .command(unnest([['build', 'pdf'], flags, dryFlag]))
    .it('dry run with pdf format and valid flags', ctx => {
      expect(ctx.stdout.trim()).to.contain('Start building: pdf');
    });

  retryTest()
    .stdout()
    .command(unnest([['build', 'epub'], flags, dryFlag]))
    .it('dry run with epub format and valid flags', ctx => {
      expect(ctx.stdout.trim()).to.contain('Start building: epub');
    });

  retryTest()
    .stdout()
    .command(unnest([['build', 'epub', 'html'], flags, dryFlag]))
    .it('dry run with epub and html format and valid flags', ctx => {
      expect(ctx.stdout.trim()).to.contain('Start building: epub and html');
    });

  retryTest()
    .stdout()
    .command(unnest([['build', 'html', 'pdf', 'epub'], flags, dryFlag]))
    .it('dry run with html, pdf, and epub format with valid flags', ctx => {
      expect(ctx.stdout.trim()).to.contain('Start building: html, pdf, and epub');
    });

  retryTest()
    .stdout()
    .command(unnest([['build', 'sdaf'], flags, dryFlag]))
    .it('dry run with invalid format and valid flags', ctx => {
      expect(ctx.stdout.trim()).to.contain('Did not build as there are no valid formats');
    });

  retryTest()
    .stdout()
    .command(unnest([['build', 'sdaf', 'mf'], flags, dryFlag]))
    .it('dry run with multiple invalid formats and valid flags', ctx => {
      expect(ctx.stdout.trim()).to.contain('Did not build as there are no valid formats');
    });

  retryTest()
    .stdout()
    .command(unnest([['build', 'sdaf', 'pdf'], flags, dryFlag]))
    .it('dry run with valid and invalid formats with valid flags', ctx => {
      expect(ctx.stdout.trim()).to.contain('Ignoring unknown formats');
    });

  retryTest()
    .stdout()
    .command(unnest([['build'], flags, dryFlag]))
    .it('dry run with no formats specified, defaults to all formats and with valid flags', ctx => {
      expect(ctx.stdout.trim()).to.contain('Start building: html, pdf, and epub');
    });

  retryTest()
    .stdout()
    .command(unnest([['build', "--args=''"], flags[0], dryFlag]))
    .it('dry run with no formats and empty args flag and valid input', ctx => {
      expect(ctx.stdout.trim()).to.contain('Build failed: Missing a required "--input" or "--output"');
    });

  retryTest()
    .stdout()
    .command(['build'])
    .it('with no formats and no flags', ctx => {
      expect(ctx.stdout.trim()).to.contain('Build failed: No arguments and no flags available');
    });

  retryTest()
    .stdout()
    .command(['build', 'nsdfa', 'ce'])
    .it('with only invalid formats and no flags', ctx => {
      expect(ctx.stdout.trim()).to.contain('Build failed: Arguments provided but no flags present');
    });

  retryTest()
    .stdout()
    .command(['build', 'pdf'])
    .it('with pdf format and no flags', ctx => {
      expect(ctx.stdout.trim()).to.contain('Build failed: Arguments provided but no flags present');
    });

  retryTest()
    .stdout()
    .command(['build', 'sdaf', 'mf'])
    .it('with all invalid formats and no flags', ctx => {
      expect(ctx.stdout.trim()).to.contain('Build failed: Arguments provided but no flags present');
    });

  retryTest()
    .stdout()
    .command(['build', "--args=''"])
    .it('with no formats and empty args flag', ctx => {
      expect(ctx.stdout.trim()).to.contain('Build failed: No required flags found (--input, --output)');
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
          serveProcess.stdout.on('data', async function (data: any) {
            if (data.toString().includes('Command completed.')) {
              done();
              serveProcess.kill();
            }
          });
        });
    });

  // Command inputs build

  fancy
    .it('runs build pdf command with minimum flags', (_, done) => {
      const buildFile$ = from(build.run([
        'pdf',
        '--input',
        path.join(__dirname, '../fixtures/io/input.latex'),
        '--output',
        path.join(__dirname, '../temp/no-downloads/output.pdf')
      ]) as Promise<any>).pipe(take(1), share());

      buildFile$
        .pipe(
          mergeMap(res => {
            return res.docsGenerated$;
          })
        )
        .subscribe({
          next: () => {
            done();
          }
        });
    });

  fancy
    .it('runs build pdf, html and epub command with minimum flags', (_, done) => {
      const buildFile$ = from(build.run([
        'pdf',
        'html',
        'epub',
        '--input',
        path.join(__dirname, '../fixtures/io/input.latex'),
        '--output',
        path.join(__dirname, '../temp/no-downloads/output.pdf'),
        '--exact'
      ]) as Promise<any>).pipe(take(1), share());

      buildFile$
        .pipe(
          mergeMap(res => {
            return res.docsGenerated$;
          })
        )
        .subscribe({
          next: () => {
            done();
          }
        });
    });

  fancy
    .it('runs build pdf and html command with minimum flags', (_, done) => {
      const buildFile$ = from(build.run([
        'pdf',
        'html',
        '--input',
        path.join(__dirname, '../fixtures/io/input.latex'),
        '--output',
        path.join(__dirname, '../temp/no-downloads/output.pdf'),
        '--exact'
      ]) as Promise<any>).pipe(take(1), share());

      buildFile$
        .pipe(
          mergeMap(res => {
            return res.docsGenerated$;
          })
        )
        .subscribe({
          next: () => {
            done();
          }
        });
    });

  fancy
    .it('runs build pdf command with exact flag', (_, done) => {
      const buildFile$ = from(build.run([
        'pdf',
        '--input',
        path.join(__dirname, '../fixtures/io/input.latex'),
        '--output',
        path.join(__dirname, '../temp/no-downloads/exact-output.pdf'),
        '--exact'
      ]) as Promise<any>).pipe(take(1), share());

      buildFile$
        .pipe(
          mergeMap(res => {
            return res.docsGenerated$;
          })
        )
        .subscribe({
          next: () => {
            done();
          }
        });
    });

  fancy
    .it('runs build pdf command with exact and force flags', (_, done) => {
      const buildFile$ = from(build.run([
        'pdf',
        '--input',
        path.join(__dirname, '../fixtures/io/input.latex'),
        '--output',
        path.join(__dirname, '../temp/no-downloads/exact-force-output.pdf'),
        '--exact',
        '--force'
      ]) as Promise<any>).pipe(take(1), share());

      buildFile$
        .pipe(
          mergeMap(res => {
            return res.docsGenerated$;
          })
        )
        .subscribe({
          next: () => {
            done();
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
        '--force'
      ]) as Promise<any>).pipe(take(1), share());

      buildFile$
        .pipe(
          mergeMap(res => {
            return res.docsGenerated$;
          })
        )
        .subscribe({
          next: () => {
            done();
          }
        });
    });

  fancy
    .it('runs build pdf command with dry-run flags', (_, done) => {
      const buildFile$ = from(build.run([
        'pdf',
        '--input',
        path.join(__dirname, '../fixtures/io/input.latex'),
        '--output',
        path.join(__dirname, '../temp/no-downloads/exact-force-output.pdf'),
        `--dry-run`,
      ]) as Promise<any>).pipe(take(1), share());

      buildFile$
        .pipe(
          mergeMap(res => {
            return res.docsGenerated$;
          })
        )
        .subscribe({
          next: () => {
            done();
          }
        });
    });

  fancy
    .it('runs build pdf command with exact and dry-run flags', (_, done) => {
      const buildFile$ = from(build.run([
        'pdf',
        '--input',
        path.join(__dirname, '../fixtures/io/input.latex'),
        '--output',
        path.join(__dirname, '../temp/no-downloads/exact-force-output.pdf'),
        '--exact',
        `--dry-run`,
      ]) as Promise<any>).pipe(take(1), share());

      buildFile$
        .pipe(
          mergeMap(res => {
            return res.docsGenerated$;
          })
        )
        .subscribe({
          next: () => {
            done();
          }
        });
    });
});
