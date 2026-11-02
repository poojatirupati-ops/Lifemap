// The admin view must render the same DOM as the ORIGINAL's settingsHTML(), run in node:vm.
import { JSDOM } from 'jsdom'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { beforeEach, expect, test } from 'vitest'
import { runOriginal } from '../golden/origSlice.ts'
import { Body } from '../../src/screens/AdminSettings.screen.tsx'
import { useSettings } from '../../src/state/settings.ts'
import type { StandardKey } from '../../src/domain/planning/settings.ts'

const original = runOriginal('settingsHTML, SETTINGS, applyAssume, fresh')
const page = new JSDOM('<!doctype html><body></body>')
Object.assign(globalThis, {
  window: page.window,
  document: page.window.document,
  IS_REACT_ACT_ENVIRONMENT: true,
})

// the original's dispatcher hooks, dropped on purpose; a picked option is a property in React
const IGNORED = new Set(['data-a', 'data-p', 'data-set', 'data-setname', 'selected'])

function cssText(style: string) {
  const probe = document.createElement('i')
  probe.style.cssText = style
  return probe.style.cssText
}

/** Tags, sorted attributes and text; styles as the browser writes them. */
function shape(html: string) {
  const walk = (node: Node): string => {
    if (node.nodeType === 3) return node.textContent ?? ''
    const el = node as Element
    const attrs = [...el.attributes]
      .filter((attr) => !IGNORED.has(attr.name))
      .map((attr) => `${attr.name}=${attr.name === 'style' ? cssText(attr.value) : attr.value}`)
      .sort()
    return `<${el.tagName} ${attrs.join(' ')}>${[...el.childNodes].map(walk).join('')}</>`
  }
  const body = new JSDOM(html).window.document.body
  return [...body.childNodes].map(walk).join('').split('<')
}

function originalView() {
  original.setState(original.fresh())
  original.applyAssume()
  return shape(original.settingsHTML())
}

function ourView() {
  const container = document.createElement('div')
  const root = createRoot(container)
  act(() => root.render(<Body />))
  const html = container.innerHTML
  act(() => root.unmount())
  return shape(html)
}

beforeEach(() => {
  useSettings.getState().backToStandards()
  original.SETTINGS.partner = ''
  for (const standard of Object.values<any>(original.SETTINGS.s)) delete standard.pv
})

test('with the LifeMap standards', () => {
  expect(ourView()).toEqual(originalView())
})

test('with a partner and partner figures of every kind', () => {
  const figures: Partial<Record<StandardKey, unknown>> = {
    wage: 0.04,
    invGross: 0.06,
    riskMu: [0.03, 0.05, 0.08],
    drawRule: 'min',
    accessAge: 50,
    buyFees: 3000,
    cashYears: 1,
  }
  original.SETTINGS.partner = 'Acme CU'
  useSettings.getState().setPartner(' Acme CU ')
  for (const [key, figure] of Object.entries(figures)) {
    original.SETTINGS.s[key].pv = figure
    useSettings.getState().setPartnerFigure(key as StandardKey, figure as never)
  }
  expect(ourView()).toEqual(originalView())
})
