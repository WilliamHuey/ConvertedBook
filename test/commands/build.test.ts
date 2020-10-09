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
      expect(ctx.stdout).to.contain('Building - Html and pdf');
    });

  test
    .stdout()
    .command(['build', 'html', 'pdf', 'epub'])
    .it('runs build', ctx => {
      expect(ctx.stdout).to.contain('Building - Html, pdf and epub');
    });
});
