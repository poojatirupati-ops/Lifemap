// The Detail view's chart, year detail, legend and summary must equal the ORIGINAL's markup
// (run in node:vm) on every fixture, after taps, keys and the savings toggle.
import { JSDOM } from 'jsdom'
import { populateGlobal } from 'vitest/runtime'
import { afterEach, describe, expect, it } from 'vitest'
import { runOriginal } from '../golden/origSlice'
import { fixtures } from '../golden/origProfile'
import { viewLines } from '../../tools/normalise.mjs'
import { project } from '../../src/domain/planning/project'
import { whatIfFrom } from '../../src/domain/planning/wi'
import { fromOriginal } from '../../src/state/migrate'
import { useStore } from '../../src/state/store'
import CashflowView from '../../src/components/results/chart/CashflowView'

// A node test with its own DOM: in the jsdom environment Vite rewrites origSlice's file URLs.
populateGlobal(globalThis, new JSDOM('', { url: 'http://localhost/' }).window, {
  bindFunctions: true,
})
const { cleanup, fireEvent, render } = await import('@testing-library/react')

const original = runOriginal(
  'applyAssume, syncLists, autoSafety, project, chartSVG, chartLegend, chartSummary, chartDefaultSel',
)

function prepared(state: any) {
  original.setState(structuredClone(state))
  original.applyAssume()
  original.syncLists()
  original.autoSafety()
  return original.getState()
}

function theirLines(state: any, selected: number | null, showSavings: boolean) {
  original.setState({ ...structuredClone(state), csel: selected, csave: showSavings })
  const result = original.project(state.wi)
  const box = document.createElement('div')
  box.id = 'theirs'
  box.innerHTML =
    original.chartSVG(result.rows, 322, { live: true }) +
    original.chartLegend() +
    original.chartSummary(result)
  // the original's click dispatcher attributes; our bars have their own handlers
  for (const bar of box.querySelectorAll('[data-a]')) {
    bar.removeAttribute('data-a')
    bar.removeAttribute('data-p')
  }
  document.body.append(box)
  const lines = viewLines('#theirs').slice(1)
  box.remove()
  return lines
}

function ourLines() {
  const root = document.querySelector('#ours')!.cloneNode(true) as HTMLElement
  root.id = 'copy'
  root.querySelector('.chead')!.remove()
  // emoji wrapped for screen readers, as the original's hideEmoji does after render
  for (const span of root.querySelectorAll('span[aria-hidden="true"]'))
    span.replaceWith(span.textContent!)
  root.normalize()
  document.body.append(root)
  const lines = viewLines('#copy').slice(1)
  root.remove()
  return lines
}

afterEach(cleanup)

describe.each(fixtures)('cashflow detail on %s', (_, fixture) => {
  const theirPlan = prepared(fixture)
  const plan: any = fromOriginal(theirPlan)
  const rows = project(plan, whatIfFrom(plan.whatIf)).rows

  it('matches the original after a default view, a key step, End, a tap and the savings toggle', () => {
    useStore.setState({ plan })
    render(
      <div id="ours">
        <CashflowView rows={rows} />
      </div>,
    )
    expect(ourLines()).toEqual(theirLines(theirPlan, null, false))
    const first = original.chartDefaultSel(original.project(theirPlan.wi).rows) // S is this plan now

    const slider = document.querySelector('.cwrap')!
    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(ourLines()).toEqual(theirLines(theirPlan, Math.min(first + 1, rows.length - 1), false))

    fireEvent.keyDown(slider, { key: 'End' })
    fireEvent.keyDown(slider, { key: 'ArrowUp' })
    expect(ourLines()).toEqual(theirLines(theirPlan, rows.length - 1, false))

    fireEvent.click(document.querySelectorAll('.cchart rect[fill="transparent"]')[3])
    fireEvent.click(document.querySelector('.chead button')!)
    expect(document.querySelector('.chead button')!.getAttribute('aria-pressed')).toBe('true')
    expect(ourLines()).toEqual(theirLines(theirPlan, 3, true))
  })
})
