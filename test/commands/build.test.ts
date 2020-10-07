import { expect, test } from '@oclif/test'

describe('build', () => {
  test
    .stdout()
    .command(['build'])
    .it('runs build', ctx => {
      console.log(ctx)
      console.log(ctx.stdout)

      expect(ctx.stdout).to.contain('Building')
    })
})
