import { expect, test } from '@oclif/test';

describe('build', () => {
  // Unsure why a /n character was introduce, but
  // need to remove it to perform a proper comparison from ctx.stdout

  test
    .stdout()
    .command(['build'])
    .it('runs build', ctx => {
      expect(ctx.stdout.trim()).to.contain('Start Building:');
    });

  test
    .stdout()
    .command(['build', 'html', 'pdf'])
    .it('runs build', ctx => {
      expect(ctx.stdout.trim()).to.contain('Start Building: html and pdf');
    });

  test
    .stdout()
    .command(['build', 'html', 'pdf', 'epub'])
    .it('runs build', ctx => {
      expect(ctx.stdout.trim()).to.contain('Start Building: html, pdf, and epub');
    });
});
