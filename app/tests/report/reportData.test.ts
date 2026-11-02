// reportData() must equal the ORIGINAL script's reportData(), run in node:vm, page by page,
// on every fixture and on seeded random plans. Fixed copy lives in the page components, so ours
// is a part of theirs. Run one page with: npx vitest run tests/report/reportData -t money
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { fixtures, plain } from '../golden/origProfile'
import { reportData } from '../../src/report/model/reportData'
import { fromOriginal } from '../../src/state/migrate'
import { original, prepared, randomPlan, today } from './originalReport'

// the original script in node:vm is slow when other suites share the CPU
vi.setConfig({ testTimeout: 30_000, hookTimeout: 30_000 })

const SECTIONS = [
  'meta',
  'road',
  'cover',
  'plan',
  'money',
  'roadmap',
  'goalsDetail',
  'cashflow',
  'scenarios',
  'foundations',
  'next',
  'assumptions',
  'appendix',
]

const plans = [
  ...fixtures,
  ...Array.from({ length: 80 }, (_, seed) => [`random ${seed + 1}`, randomPlan(seed + 1)] as const),
]

describe.each(plans)('%s', (_, state) => {
  let theirs: any
  let ours: any
  beforeAll(() => {
    const plan = prepared(state)
    theirs = plain(original.reportData())
    ours = plain(reportData(fromOriginal(plan), today))
  })
  it.each(SECTIONS)('%s equals the original', (section) => {
    if (theirs.ready === false) return expect(ours).toEqual(theirs)
    expect(theirs[section]).toMatchObject(ours[section])
  })
})
