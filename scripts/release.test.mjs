import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { bumpVersion, canSkip, planRelease, stampChangelog } from './release.mjs'

const base = { version: '1.0.0', bump: 'patch', changedFiles: ['kit/motion.ts'], subjects: ['Fix the storyboard check-in', 'chore: back-merge v1.0.0 into dev', 'chore: bump version to 1.0.0'] }

describe('bumpVersion', () => {
  it('bumps each part and resets the lower ones', () => {
    assert.equal(bumpVersion('1.2.3', 'patch'), '1.2.4')
    assert.equal(bumpVersion('1.2.3', 'minor'), '1.3.0')
    assert.equal(bumpVersion('1.2.3', 'major'), '2.0.0')
  })
  it('rejects unknown input', () => {
    assert.throws(() => bumpVersion('1.2', 'patch'), /semver/)
    assert.throws(() => bumpVersion('1.2.3', 'huge'), /bump/)
  })
})

describe('canSkip', () => {
  it('skips tooling, CI and top-level docs only', () => {
    assert.equal(canSkip(['scripts/release.mjs', '.github/workflows/ci.yml', 'README.md', 'tests/motion.test.ts']), true)
    assert.equal(canSkip(['README.md', 'mascots/nodi/README.md']), false)
    assert.equal(canSkip(['kit/rig.ts']), false)
  })
})

describe('planRelease', () => {
  it('skips when nothing changed or only tooling did', () => {
    assert.equal(planRelease({ ...base, changedFiles: [] }).skip, true)
    assert.equal(planRelease({ ...base, changedFiles: ['scripts/release.mjs'] }).skip, true)
  })

  it('plans the next version with the topics, without bot noise', () => {
    const plan = planRelease(base)
    assert.deepEqual({ skip: plan.skip, version: plan.version, tag: plan.tag, bumpMessage: plan.bumpMessage }, { skip: false, version: '1.0.1', tag: 'v1.0.1', bumpMessage: 'chore: bump version to 1.0.1' })
    assert.equal(plan.releaseMessage, 'release: v1.0.1\n\n- Fix the storyboard check-in')
  })

  it('honours the requested bump', () => {
    assert.equal(planRelease({ ...base, bump: 'minor' }).version, '1.1.0')
  })
})

describe('stampChangelog', () => {
  it('names the Unreleased section after the version and opens a new one', () => {
    const out = stampChangelog('# Changelog\n\n## Unreleased\n\n- A change.\n\n## 1.0.0\n', '1.1.0')
    assert.equal(out, '# Changelog\n\n## Unreleased\n\n## 1.1.0\n\n- A change.\n\n## 1.0.0\n')
  })
  it('leaves a changelog without an Unreleased section alone', () => {
    assert.equal(stampChangelog('# Changelog\n\n## 1.0.0\n', '1.1.0'), '# Changelog\n\n## 1.0.0\n')
  })
})
