// Runs the ORIGINAL prototype script (../LifeGoals-Customer-Journey-Prototype.html) in node:vm,
// cut before its DOM boot, so golden tests can compare our outputs with the original's.
// Never reads public/prototype.js.
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

export const TODAY = '2026-10-26'

const html = readFileSync(
  new URL('../../../LifeGoals-Customer-Journey-Prototype.html', import.meta.url),
  'utf8',
)
const marker = html.indexOf("<script>\n'use strict';")
const domBoot = html.indexOf('S = fresh(); try { applyAssume(); }')
if (marker < 0 || domBoot < 0) throw new Error('original script markers not found')
const script = html.slice(marker + '<script>\n'.length, domBoot)

// Absorbs any DOM call the original's top-level code makes.
const fakeDom = (): any =>
  new Proxy(function () {}, {
    get: (_, key) => (key === Symbol.toPrimitive ? () => '' : fakeDom()),
    apply: () => fakeDom(),
    construct: () => fakeDom(),
  })

/** A fresh copy of the original script. `exposed` is the body of an object literal naming what
 *  to hand back (e.g. 'eur, fresh, version: () => RULES_VERSION'); getState/setState are always added. */
export function runOriginal(exposed: string, today = TODAY): any {
  const window: any = { __TODAY: today }
  const context = vm.createContext({
    window,
    document: fakeDom(),
    addEventListener() {},
    matchMedia: () => ({ matches: true }),
    MutationObserver: class {
      observe() {}
    },
    localStorage: { getItem: () => null, setItem() {} },
    location: { search: '' },
    URLSearchParams,
    console,
    setTimeout,
    clearTimeout,
    navigator: { userAgent: 'node' },
    innerWidth: 375,
    innerHeight: 812,
  })
  Object.assign(window, context)
  const handBack = `;({ getState: () => S, setState: (v) => { S = v }, ${exposed} })`
  return vm.runInContext(script + handBack, context)
}

export const origSlice = (today = TODAY) =>
  runOriginal('RULES: RULES_IE_2026, eur, eurK, eurW, pcs, fresh, loadSample', today)
