// Third party module
import 'module-alias/register';
import { expect } from '@oclif/test';
import { takeLast } from 'rxjs/operators';
import { unnest } from 'ramda';
const del = require('del');

// Library modules
import { BuildCheckGoodResults } from '../../src/functions/build/build-checks';
import { AsyncCheckResults } from '../../src/functions/build/build-cli-input-async-checks';
import { buildGenerate } from '../../src/functions/build/build-generate';
import { CheckResults, AsyncCheckRes } from '../fixtures/objects/check-results';
import ForcedCheckResults from '../fixtures/objects/forced-check-results';
import ForcedAsyncCheckRes from '../fixtures/objects/forced-async-check-results';
import ExactCheckResults from '../fixtures/objects/exact-check-results';
import ExactAsyncCheckRes from '../fixtures/objects/exact-async-check-results';
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

  it('generate function goes to "completion" status', ctx => {
    const originalFolderPath = process.cwd();
    const generationPathProjectGenerate = `${baseTempFolder}no-downloads/`;
    process.chdir(generationPathProjectGenerate);

    const checkResults = new CheckResults();
    const asyncCheckRes = new AsyncCheckRes();

    const pd = buildGenerate(checkResults as BuildCheckGoodResults, asyncCheckRes as AsyncCheckResults)
      .docsGenerated$
      .pipe(takeLast(1));

    pd
      .subscribe({
        next: () => {
          // Able to reach completion is a good sign
          // and use this as a marker for a
          // successful file generation
          ctx();
          process.chdir(originalFolderPath);
        },
        error: (e: any) => {
          console.log('Error', e);
        }
      });
  });

  it('force generate function goes to "completion" status', ctx => {
    const originalFolderPath = process.cwd();
    const generationPathProjectGenerate = `${baseTempFolder}no-downloads/`;
    process.chdir(generationPathProjectGenerate);

    const checkResults = new ForcedCheckResults();
    const asyncCheckRes = new ForcedAsyncCheckRes();

    const pd = buildGenerate(checkResults as BuildCheckGoodResults, asyncCheckRes as AsyncCheckResults)
      .docsGenerated$
      .pipe(takeLast(1));

    pd
      .subscribe({
        next: () => {
          // Able to reach completion is a good sign
          // and use this as a marker for a
          // successful file generation
          ctx();
          process.chdir(originalFolderPath);
        },
        error: (e: any) => {
          console.log('Error', e);
        }
      });
  });

  it('exact generate function goes to "completion" status', ctx => {
    const originalFolderPath = process.cwd();
    const generationPathProjectGenerate = `${baseTempFolder}no-downloads/`;
    process.chdir(generationPathProjectGenerate);

    const checkResults = new ExactCheckResults();
    const asyncCheckRes = new ExactAsyncCheckRes();

    const pd = buildGenerate(checkResults as BuildCheckGoodResults, asyncCheckRes as AsyncCheckResults)
      .docsGenerated$
      .pipe(takeLast(1));

    pd
      .subscribe({
        next: () => {
          // Able to reach completion is a good sign
          // and use this as a marker for a
          // successful file generation
          ctx();
          process.chdir(originalFolderPath);
        },
        error: (e: any) => {
          console.log('Error', e);
        }
      });
  });



});
