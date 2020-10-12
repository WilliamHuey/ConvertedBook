import { expect, test } from '@oclif/test';

describe('build', () => {
  // Unsure why a /n character was introduce, but
  // need to remove it to perform a proper comparison from ctx.stdout

  test
    .stdout()
    .command(['build'])
    .it('runs build', ctx => {
      expect(ctx.stdout.trim()).to.contain('Start building:');
    });

  test
    .stdout()
    .command(['build', 'html', 'pdf'])
    .it('runs build', ctx => {
      expect(ctx.stdout.trim()).to.contain('Start building: html and pdf');
    });

  test
    .stdout()
    .command(['build', 'html', 'pdf', 'epub'])
    .it('runs build', ctx => {
      expect(ctx.stdout.trim()).to.contain('Start building: html, pdf, and epub');
    });

  test
    .stdout()
    .command(['build', 'sdaf'])
    .it('runs build', ctx => {
      expect(ctx.stdout.trim()).to.contain('Did not build as there are no valid formats');
    });

  test
    .stdout()
    .command(['build', 'pdf', 'sdaf'])
    .it('runs build', ctx => {
      expect(ctx.stdout.trim()).to.contain('Ignoring unknown formats');
    });
});
