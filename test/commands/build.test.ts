import { expect, test } from '@oclif/test';
import { unnest } from 'ramda';

describe('build', () => {
  const flags = ['--input="/a/directory/with-file.latex"', '--output="/a/directory/output-file"'];

  // Unsure why a /n character was introduce, but
  // need to remove it to perform a proper comparison from ctx.stdout

  test
    .stdout()
    .command(['build'])
    .it('runs build', ctx => {
      expect(ctx.stdout.trim()).to.contain('Build failed: No arguments and no flags available.');
    });

  test
    .stdout()
    .command(unnest([['build', 'html', 'pdf'], flags]))
    .it('runs build', ctx => {
      expect(ctx.stdout.trim()).to.contain('Start building: html and pdf');
    });

  test
    .stdout()
    .command(unnest([['build', 'html', 'pdf', 'epub'], flags]))
    .it('runs build', ctx => {
      expect(ctx.stdout.trim()).to.contain('Start building: html, pdf, and epub');
    });

  test
    .stdout()
    .command(unnest([['build', 'sdaf'], flags]))
    .it('runs build', ctx => {
      expect(ctx.stdout.trim()).to.contain('Did not build as there are no valid formats');
    });

  test
    .stdout()
    .command(unnest([['build', 'sdaf', 'pdf'], flags]))
    .it('runs build', ctx => {
      expect(ctx.stdout.trim()).to.contain('Ignoring unknown formats');
    });

  test
    .stdout()
    .command(['build', "--args=''"])
    .it('runs build', ctx => {
      expect(ctx.stdout.trim()).to.contain('Build failed: No required flags found (--input, --output)');
    });
});
