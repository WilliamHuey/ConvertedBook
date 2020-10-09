import { expect, test } from '@oclif/test';

describe('build', () => {
  test
    .stdout()
    .command(['build'])
    .it('runs build', ctx => {
      expect(ctx.stdout).to.contain('Building - Into all formats:');
    });

  test
    .stdout()
    .command(['build', 'html', 'pdf'])
    .it('runs build', ctx => {
      expect(ctx.stdout).to.contain('Building - html and pdf');
    });

  test
    .stdout()
    .command(['build', 'html', 'pdf', 'epub'])
    .it('runs build', ctx => {
      // Unsure why a /n character was introduce, but
      // need to remove it to perform a proper comparison
      expect(ctx.stdout.trim()).to.contain('Building - html, pdf, and epub');
    });
});
