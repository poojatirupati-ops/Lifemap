// Every report page must equal the ORIGINAL renderer's page (run in node:vm on the original's own
// reportData()), as normalised DOM, on every fixture and seeded random plans.
// One page kind: npx vitest run tests/report/reportPages -t money
import { JSDOM } from 'jsdom'
import { populateGlobal } from 'vitest/runtime'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { fixtures, plain } from '../golden/origProfile'
import { viewLines } from '../../tools/normalise.mjs'
import { reportData } from '../../src/report/model/reportData'
import { fromOriginal } from '../../src/state/migrate'
import { reportPages } from '../../src/components/report/reportPages'
import { original, prepared, randomPlan, today } from './originalReport'

// A node test with its own DOM: in the jsdom environment Vite rewrites origSlice's file URLs.
populateGlobal(globalThis, new JSDOM('', { url: 'http://localhost/' }).window, {
  bindFunctions: true,
})

// the original renderer in node:vm is slow on long appendices
vi.setConfig({ testTimeout: 30_000, hookTimeout: 30_000 })

const KINDS = {
  cover: 'Cover',
  plan: 'Your plan on a page',
  money: 'Your money today',
  roadmap: 'Your roadmap',
  goals: 'Your goals in detail',
  cashflow: 'Cashflow',
  scenarios: 'What could change the answer',
  foundations: 'Foundations and you',
  next: 'Share with an expert',
  assumptions: 'What your plan assumes',
  appendix: 'Appendix',
}

function lines(html: string) {
  const box = document.createElement('div')
  box.id = 'page'
  box.innerHTML = html
  // React 19 hoists a preload link for each image in static markup
  for (const link of box.querySelectorAll('link[rel="preload"]')) link.remove()
  // an empty style attribute is no style
  for (const element of box.querySelectorAll('[style=""]')) element.removeAttribute('style')
  document.body.append(box)
  const result = viewLines('#page').slice(1)
  box.remove()
  return result
}

const labelOf = (html: string) => / aria-label="Page \d+ of \d+: ([^"(]+)/.exec(html)![1].trim()

const plans = [
  ...fixtures,
  ...Array.from({ length: 30 }, (_, seed) => [`random ${seed + 1}`, randomPlan(seed + 1)] as const),
]

describe.each(plans)('%s', (_, state) => {
  let theirs: string[] = []
  let ours: string[] = []
  beforeAll(() => {
    const plan = prepared(state)
    const data = plain(original.reportData())
    if (data.ready === false) return
    theirs = original.LifeMapReport.reportPages(data).pages
    const mine = reportData(fromOriginal(plan), today)
    if (mine.ready === false) throw new Error('ours is not ready but the original is')
    ours = reportPages(mine).map((page) => renderToStaticMarkup(page))
  })
  it('has as many pages', () => expect(ours.length).toBe(theirs.length))
  it.each(Object.entries(KINDS))('%s pages equal the original', (_, label) => {
    theirs.forEach((page, index) => {
      if (labelOf(page) !== label) return
      expect(lines(ours[index] ?? '')).toEqual(lines(page))
    })
  })
})
