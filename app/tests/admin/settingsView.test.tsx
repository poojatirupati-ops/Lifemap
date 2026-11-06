// The admin view must render the same DOM as the ORIGINAL's settingsHTML(), run in node:vm.
import { JSDOM } from 'jsdom'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { beforeEach, expect, test } from 'vitest'
import { runOriginal } from '../golden/origSlice.ts'
import Body from '../../src/components/admin/SettingsBody.tsx'
import { queryClient } from '../../src/auth/planSync.ts'
import { TENANT_KEY } from '../../src/shell/tenant.ts'
import type { StandardKey } from '../../src/domain/planning/settings.ts'
import { shape } from '../golden/helpers'

const original = runOriginal('settingsHTML, SETTINGS, applyAssume, fresh')
const page = new JSDOM('<!doctype html><body></body>')
Object.assign(globalThis, {
  window: page.window,
  document: page.window.document,
  IS_REACT_ACT_ENVIRONMENT: true,
})

// the original's dispatcher hooks, dropped on purpose; a picked option is a property in React
const IGNORED = new Set(['data-a', 'data-p', 'data-set', 'data-setname', 'selected'])

// the tax register's note drops the prototype's aside about its missing database, on purpose
const SESSION_NOTE = [
  'apply to this session (the prototype has no shared database yet).',
  'apply to this session only.',
] as const

function originalView() {
  original.setState(original.fresh())
  original.applyAssume()
  return shape(original.settingsHTML(), IGNORED).map((line) =>
    line.replace(SESSION_NOTE[0], SESSION_NOTE[1]),
  )
}

function ourView() {
  const container = document.createElement('div')
  const root = createRoot(container)
  act(() => root.render(<Body />))
  const html = container.innerHTML
  act(() => root.unmount())
  return shape(html, IGNORED)
}

/** The signed-in tenant: its name is the partner's, its rates the partner's figures. */
const tenant = (name: string, rates: object) =>
  queryClient.setQueryData(TENANT_KEY, {
    id: 'org-a',
    slug: 'cu-a',
    name,
    logo: null,
    colors: {},
    features: {},
    rates,
  })

beforeEach(() => {
  tenant('', {})
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
  for (const [key, figure] of Object.entries(figures)) original.SETTINGS.s[key].pv = figure
  tenant('Acme CU', figures)
  expect(ourView()).toEqual(originalView())
})
