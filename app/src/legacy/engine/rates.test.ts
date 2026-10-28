/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { AS, ASM, SAVE } from './assumptions.ts'
import { RI, RULES_2027, RULES_IE_2026 } from './rates.ts'

const html = readFileSync(new URL('../../../../LifeGoals-Customer-Journey-Prototype.html', import.meta.url), 'utf8')

test('spot-check 5 values', () => {
  expect(RI.it.band).toBe(44000)
  expect(RI.sp.week).toBe(299.3)
  expect(RI.pen.sft[2026]).toBe(2.2e6)
  expect(RI.usc.exempt).toBe(13000)
  expect(SAVE.band).toEqual([50, 200, 500, 1000, null])
})

test('every rule matches the prototype table', () => {
  const block = html.slice(html.indexOf('const RULES_IE_2026 = {'), html.indexOf('// RI: plain values'))
  const proto = new Function('RV_', block.replace(/^const RULES_IE_2026 =/, 'return').replace(/\};\s*$/, '}'))(
    (v: unknown, src: string, eff: string, verify?: boolean, by?: string) => ({ v, src, eff, verify: verify !== false, by }),
  )
  expect(RULES_IE_2026).toEqual(proto)
})

// Evaluate a block of prototype source with the given names in scope.
const evalProto = (block: string, scope: Record<string, unknown>) =>
  new Function(...Object.keys(scope), `return (${block.replace(/^const \w+ = /, '')})`)(...Object.values(scope))
const between = (from: string, to: string) => html.slice(html.indexOf(from), html.indexOf(to, html.indexOf(from)))
const RV_ = (v: unknown, src: string, eff: string, verify?: boolean, by?: string) => ({ v, src, eff, verify: verify !== false, by })

test('Budget 2027 overlay matches the prototype', () => {
  const block = between('const RULES_2027 = {', '};\nconst RULES_2027_NOT_CHANGED') + '}'
  expect(RULES_2027).toEqual(evalProto(block, { RV_, B27_SRC: RULES_2027['it.band'].src }))
})

test('AS and SAVE match the prototype', () => {
  // The prototype's infl and end are internal fallbacks the customer must choose instead (sec 14, 22): not ported.
  const { infl: _i, end: _e, ...proto } = evalProto(between('const AS = {', ';\n'), { RI })
  expect(AS).toEqual(proto)
  expect(SAVE).toEqual(evalProto(between('const SAVE = {', '\n};') + '\n}', {}))
})

test('ASM static fields match the prototype', () => {
  // Fields built from closures, standards or LAW text evaluate to the marker and are skipped: they belong to the planning context.
  const mark = new Proxy({}, { get: () => '\0' })
  const proto = evalProto(between('const ASM = {', '};\n// §27.3') + '\n}', {
    RI, eurW: (n: number) => '€' + (Math.abs(n % 1) > 1e-9 ? n.toFixed(2) : String(Math.round(n))), LAW: mark, GD: mark, GDB: mark, pcs: () => '\0',
  }) as Record<string, Record<string, unknown>>
  expect(Object.keys(ASM)).toEqual(Object.keys(proto))
  for (const [k, p] of Object.entries(proto)) {
    const want: Record<string, unknown> = {}
    for (const f of Object.keys(p)) {
      const d = Object.getOwnPropertyDescriptor(p, f)!
      if (f === 'rng') want.rng = (d.value as () => unknown)()
      else if (d.get || typeof d.value === 'function' || String(d.value).includes('\0')) continue
      else want[f] = d.value
    }
    expect(ASM[k as keyof typeof ASM], k).toEqual(want)
  }
})
