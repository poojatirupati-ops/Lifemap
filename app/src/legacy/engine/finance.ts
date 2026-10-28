// Pure loan maths. Rates are passed in (annual, decimal); nothing here reads state.
export const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v))

/** Monthly payment for balance `bal`, monthly rate `i`, `n` months. */
export const pmtM = (bal: number, i: number, n: number): number =>
  bal > 0 ? (i ? (bal * i) / (1 - Math.pow(1 + i, -n)) : bal / n) : 0

/** One year of repayments at `payM` a month. `r` is the annual rate; `iM` overrides the monthly rate (e.g. an APR). */
export function amortYear(bal: number, r: number, payM: number, iM?: number): { bal: number; paid: number } {
  const i = iM ?? r / 12
  let paid = 0
  for (let m = 0; m < 12 && bal > 0.5; m++) {
    const it = bal * i
    const p = Math.min(payM, bal + it)
    paid += p
    bal = bal + it - p
  }
  return { bal: Math.max(0, bal), paid }
}

/** Year-by-year schedule until the loan is cleared (or `maxYears`). */
export function* amortSchedule(bal: number, r: number, payM: number, maxYears = 100): Generator<{ year: number; bal: number; paid: number }> {
  for (let year = 1; year <= maxYears && bal > 0.5; year++) {
    const y = amortYear(bal, r, payM)
    bal = y.bal
    yield { year, ...y }
  }
}
