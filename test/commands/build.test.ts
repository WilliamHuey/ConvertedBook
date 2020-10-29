import { expect, test } from '@oclif/test';
import { unnest } from 'ramda';

describe('build', () => {
  const flags = ['--input="/a/directory/with-file.latex"', '--output="/a/directory/output-file"'];

  // Observables resolution is slow and the
  // tests need retries to prevent correct
  // readings
  const retryTest = function () {
    return test
      .retries(10);
  };

  // Unsure why a /n character was introduce, but
  // need to remove it to perform a proper comparison from ctx.stdout

  retryTest()
    .stdout()
    .command(unnest([['build', 'html', 'pdf'], flags]))
    .it('runs build', ctx => {
      expect(ctx.stdout.trim()).to.contain('Start building: html and pdf');
    });

  retryTest()
    .stdout()
    .command(unnest([['build', 'html', 'pdf', 'epub'], flags]))
    .it('runs build', ctx => {
      expect(ctx.stdout.trim()).to.contain('Start building: html, pdf, and epub');
    });

  retryTest()
    .stdout()
    .command(unnest([['build', 'pdf'], flags]))
    .it('runs build', ctx => {
      expect(ctx.stdout.trim()).to.contain('Start building: pdf');
    });

  retryTest()
    .stdout()
    .command(unnest([['build', 'sdaf'], flags]))
    .it('runs build', ctx => {
      expect(ctx.stdout.trim()).to.contain('Did not build as there are no valid formats');
    });

  retryTest()
    .stdout()
    .command(unnest([['build', 'sdaf', 'pdf'], flags]))
    .it('runs build', ctx => {
      expect(ctx.stdout.trim()).to.contain('Ignoring unknown formats');
    });

  retryTest()
    .stdout()
    .command(unnest([['build', 'sdaf', 'mf'], flags]))
    .it('runs build', ctx => {
      expect(ctx.stdout.trim()).to.contain('Did not build as there are no valid formats');
    });

  retryTest()
    .stdout()
    .command(unnest([['build', "--args=''"], flags[0]]))
    .it('runs build', ctx => {
      expect(ctx.stdout.trim()).to.contain('Build failed: Missing a required "--input" or "--output"');
    });

  retryTest()
    .stdout()
    .command(['build'])
    .it('runs build', ctx => {
      expect(ctx.stdout.trim()).to.contain('Build failed: No arguments and no flags available.');
    });

  retryTest()
    .stdout()
    .command(['build', 'nsdfa', 'ce'])
    .it('runs build', ctx => {
      expect(ctx.stdout.trim()).to.contain('Build failed: Arguments provided but no flags present.');
    });

  retryTest()
    .stdout()
    .command(['build', 'pdf'])
    .it('runs build', ctx => {
      expect(ctx.stdout.trim()).to.contain('Build failed: Arguments provided but no flags present.');
    });

  retryTest()
    .stdout()
    .command(['build', 'sdaf', 'mf'])
    .it('runs build', ctx => {
      expect(ctx.stdout.trim()).to.contain('Build failed: Arguments provided but no flags present.');
    });

  retryTest()
    .stdout()
    .command(['build', "--args=''"])
    .it('runs build', ctx => {
      expect(ctx.stdout.trim()).to.contain('Build failed: No required flags found (--input, --output)');
    });
});
