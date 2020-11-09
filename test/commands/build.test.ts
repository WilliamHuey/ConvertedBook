// Native modules
const path = require('path');

// Third party modules
import { expect, test } from '@oclif/test';
import { unnest } from 'ramda';

describe('Build', () => {
  const testDataDirectory = path.join(__dirname, '../', 'data/');
  const invalidInputFlag = `--input=${testDataDirectory}zz`;
  const invalidOutputFlag = `--output=${testDataDirectory}jkl/hlkj/`;
  const validInputFlag = `--input=${testDataDirectory}input.latex`;
  const validOutputFlag = `--output=${testDataDirectory}`;
  const flags = [validInputFlag, validOutputFlag];

  // Observables resolution is slow and the
  // tests need retries to prevent incorrect
  // readings
  const retryTest = function () {
    return test
      .retries(10);
  };

  retryTest()
    .stdout()
    .command(unnest([['build'], [validInputFlag, invalidOutputFlag]]))
    .it('with valid input and invalid output flag', ctx => {
      expect(ctx.stdout.trim()).to.contain('Build failed: Invalid output folder/file.');
    });

  retryTest()
    .stdout()
    .command(unnest([['build'], [invalidInputFlag, validOutputFlag]]))
    .it('with invalid input and valid output flag', ctx => {
      expect(ctx.stdout.trim()).to.contain('Build failed: Invalid input file.');
    });

  retryTest()
    .stdout()
    .command(unnest([['build'], [invalidInputFlag, invalidOutputFlag]]))
    .it('with invalid input and invalid output flags', ctx => {
      expect(ctx.stdout.trim()).to.contain('Build failed: Invalid input file and invalid output folder/file.');
    });

  retryTest()
    .stdout()
    .command(unnest([['build', 'html', 'pdf'], flags]))
    .it('with valid input and output flags', ctx => {
      expect(ctx.stdout.trim()).to.contain('Creating output file.');
    });

  retryTest()
    .stdout()
    .command(unnest([['build', 'pdf'], flags]))
    .it('with pdf format and valid flags', ctx => {
      expect(ctx.stdout.trim()).to.contain('Start building: pdf');
    });

  retryTest()
    .stdout()
    .command(unnest([['build', 'epub'], flags]))
    .it('with epub format and valid flags', ctx => {
      expect(ctx.stdout.trim()).to.contain('Start building: epub');
    });

  retryTest()
    .stdout()
    .command(unnest([['build', 'epub', 'html'], flags]))
    .it('with epub and html format and valid flags', ctx => {
      expect(ctx.stdout.trim()).to.contain('Start building: epub and html');
    });

  retryTest()
    .stdout()
    .command(unnest([['build', 'html', 'pdf', 'epub'], flags]))
    .it('with html, pdf, and epub format with valid flags', ctx => {
      expect(ctx.stdout.trim()).to.contain('Start building: html, pdf, and epub');
    });

  retryTest()
    .stdout()
    .command(unnest([['build', 'sdaf'], flags]))
    .it('with invalid format and valid flags', ctx => {
      expect(ctx.stdout.trim()).to.contain('Did not build as there are no valid formats');
    });

  retryTest()
    .stdout()
    .command(unnest([['build', 'sdaf', 'mf'], flags]))
    .it('with multiple invalid formats and valid flags', ctx => {
      expect(ctx.stdout.trim()).to.contain('Did not build as there are no valid formats');
    });

  retryTest()
    .stdout()
    .command(unnest([['build', 'sdaf', 'pdf'], flags]))
    .it('with valid and invalid formats with valid flags', ctx => {
      expect(ctx.stdout.trim()).to.contain('Ignoring unknown formats');
    });

  retryTest()
    .stdout()
    .command(unnest([['build'], flags]))
    .it('with no formats specified, defaults to all formats and with valid flags', ctx => {
      expect(ctx.stdout.trim()).to.contain('Start building: html, pdf, and epub');
    });

  retryTest()
    .stdout()
    .command(unnest([['build', "--args=''"], flags[0]]))
    .it('with no formats and empty args flag and valid input', ctx => {
      expect(ctx.stdout.trim()).to.contain('Build failed: Missing a required "--input" or "--output"');
    });

  retryTest()
    .stdout()
    .command(['build'])
    .it('with no formats and no flags', ctx => {
      expect(ctx.stdout.trim()).to.contain('Build failed: No arguments and no flags available.');
    });

  retryTest()
    .stdout()
    .command(['build', 'nsdfa', 'ce'])
    .it('with only invalid formats and no flags', ctx => {
      expect(ctx.stdout.trim()).to.contain('Build failed: Arguments provided but no flags present.');
    });

  retryTest()
    .stdout()
    .command(['build', 'pdf'])
    .it('with pdf format and no flags', ctx => {
      expect(ctx.stdout.trim()).to.contain('Build failed: Arguments provided but no flags present.');
    });

  retryTest()
    .stdout()
    .command(['build', 'sdaf', 'mf'])
    .it('with all invalid formats and no flags', ctx => {
      expect(ctx.stdout.trim()).to.contain('Build failed: Arguments provided but no flags present.');
    });

  retryTest()
    .stdout()
    .command(['build', "--args=''"])
    .it('with no formats and empty args flag', ctx => {
      expect(ctx.stdout.trim()).to.contain('Build failed: No required flags found (--input, --output)');
    });
});
