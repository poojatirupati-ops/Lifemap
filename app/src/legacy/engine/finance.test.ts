/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { RI } from './rates.ts'
import { amortSchedule, amortYear, clamp, pmtM } from './finance.ts'
import { arfMin, incomeTax, lumpSum, prsiA, prsiRate, prsiS, reliefOn, sftFor, usc } from './tax.ts'

// Run the prototype's own functions (sliced from the HTML) against the same RI to get expected values.
const html = readFileSync(new URL('../../../../LifeGoals-Customer-Journey-Prototype.html', import.meta.url), 'utf8')
const line = (p: string) => html.slice(html.indexOf(p), html.indexOf('\n', html.indexOf(p)))
const taxBlock = html.slice(html.indexOf('function incomeTax('), html.indexOf('function prsi('))
const INFL = 0.025
const AS = { infl: INFL }
const P = new Function('RI', 'AS', `${taxBlock}
${['const relLim', 'const reliefOn', 'function lumpSum', 'const sftFor', 'const arfMin', 'function pmtM', 'function amortYear', 'const clamp'].map(line).join('\n')}
return {incomeTax, usc, prsiRate, prsiA, prsiS, reliefOn, lumpSum, sftFor, arfMin, pmtM, amortYear, clamp}`)(RI, AS)

test('pmtM, amortYear, clamp match the prototype', () => {
  for (const [b, i, n] of [[300000, 0.04 / 12, 360], [50000, 0, 120], [0, 0.01, 12], [12000, 0.2 / 12, 24]]) expect(pmtM(b, i, n)).toBeCloseTo(P.pmtM(b, i, n), 8)
  for (const [b, r, pay] of [[300000, 0.04, 1432], [5000, 0.2, 400], [100, 0.05, 500]]) expect(amortYear(b, r, pay)).toEqual(P.amortYear(b, r, pay))
  expect(amortYear(1000, 0, 0, 0.01)).toEqual(P.amortYear(1000, 0, 0, 0.01))
  for (const [v, a, b] of [[5, 1, 3], [-2, 0, 9], [4, 1, 9]]) expect(clamp(v, a, b)).toBe(P.clamp(v, a, b))
})

test('amortSchedule yields until cleared and agrees with amortYear', () => {
  for (const [b, r, pay] of [[100000, 0.04, 1000], [20000, 0.07, 250], [5000, 0, 100]]) {
    const want: { year: number; bal: number; paid: number }[] = []
    for (let bal = b, year = 1; bal > 0.5 && year <= 100; year++) {
      const y = P.amortYear(bal, r, pay)
      want.push({ year, ...y })
      bal = y.bal
    }
    expect([...amortSchedule(b, r, pay)]).toEqual(want)
    expect(want.length).toBeGreaterThan(1)
  }
  const ys = [...amortSchedule(100000, 0.04, 1000)]
  expect(ys.at(-1)!.bal).toBeLessThan(0.5 + 1e-9)
  expect([...amortSchedule(1000, 0.04, 1, 3)].length).toBe(3)
  expect(amortYear(0.4, 0.05, 100)).toEqual(P.amortYear(0.4, 0.05, 100))
  expect([...amortSchedule(0.4, 0.05, 100)]).toEqual([])
  expect([...amortSchedule(100000, 0.04, 100)].length).toBe(100)
})

test('income tax, USC, PRSI match the prototype', () => {
  for (const g of [0, 5000, 18304, 22048, 12012, 13000, 20000, 28700, 44000, 70044, 90000, 250000]) {
    expect(incomeTax(g)).toBeCloseTo(P.incomeTax(g), 8)
    for (const red of [false, true]) expect(usc(g, red)).toBeCloseTo(P.usc(g, red), 8)
    const rate = P.prsiRate(2027)
    expect(prsiA(g, rate)).toBeCloseTo(P.prsiA(g, rate), 8)
    expect(prsiS(g, rate)).toBeCloseTo(P.prsiS(g, rate), 8)
  }
  expect(incomeTax(60000, 4000, 53000)).toBeCloseTo(P.incomeTax(60000, 4000, 53000), 8)
  for (const y of [2025, 2026, 2027, 2029]) expect(prsiRate(y)).toBeCloseTo(P.prsiRate(y), 10)
})

test('pension helpers match the prototype', () => {
  for (const [g, E, age] of [[50000, 10000, 35], [200000, 80000, 58], [30000, 1000, 62], ...[29, 30, 39, 40, 49, 50, 54, 55, 59, 60].map(a => [60000, 20000, a])]) expect(reliefOn(g, E, age)).toBeCloseTo(P.reliefOn(g, E, age), 8)
  for (const [pot, pct] of [[400000, 0.25], [1000000, 0.25], [3000000, 0.5], [100000, 0.1]]) expect(lumpSum(pot, pct)).toEqual(P.lumpSum(pot, pct))
  for (const infl of [0, 0.025, 0.039]) {
    AS.infl = infl
    for (const y of [2024, 2026, 2029, 2030, 2033, 2040]) expect(sftFor(y, infl)).toBeCloseTo(P.sftFor(y), 4)
  }
  AS.infl = INFL
  for (const [a, pot] of [[55, 1e5], [61, 1e5], [71, 1e5], [65, 3e6], [65, RI.pen.arfBig], [65, RI.pen.arfBig + 1]]) expect(arfMin(a, pot)).toBe(P.arfMin(a, pot))
})
