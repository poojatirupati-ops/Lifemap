// Retirement and pension-access rules (spec sec 27.3, 29). Pure: no react, storage or network.
import { ageInYear, type Dob } from './dates.ts'
import { RI } from './rates.ts'

export type Person = { readonly dob: Dob; readonly retireAge: number; readonly planUntil: number; readonly scheme50?: boolean; readonly partner?: boolean }   // partner: own pension not modelled, only their State Pension counts; read Year.statePension (Year.pension is also true from 66)
export type Rules = {
  readonly min: number; readonly max: number; readonly ok: boolean     // allowed range and whether retireAge is inside it
  readonly note: string | null                                          // calm one-liner, never a block
  readonly accessAge: number; readonly stateAge: number
  readonly bridgeYears: number                                          // years between retiring and pension access, paid from savings
}
export type Year = { readonly year: number; readonly age: number; readonly working: boolean; readonly pension: boolean; readonly statePension: boolean; readonly bridge: boolean }

/** Any age after today's (age in year0) up to plan-until minus 1; notes below 50 and below 60, never a block. */
export function retireRules(p: Person, year0: number): Rules {
  const min = ageInYear(p.dob, year0) + 1, max = Math.max(min, p.planUntil - 1)
  const { earliestAge } = RI.pen, { schemeEarliest } = RI.guide
  const accessAge = p.partner ? RI.sp.age : p.scheme50 ? schemeEarliest : earliestAge
  const gap = 'Your results will show any gap honestly.'
  const own = `Pensions can usually be drawn from ${earliestAge} (some schemes from ${schemeEarliest}) and the State Pension from ${RI.sp.age}, so until then your plan uses savings and other income. ${gap}`
  const note = p.partner
    ? p.retireAge < schemeEarliest ? `Their pay stops at this age. Until their State Pension at ${RI.sp.age} your plan uses savings and other income, and the results will show any gap honestly.`
      : p.retireAge < earliestAge ? `Their pay stops at this age. Their own pension is not modelled, so until their State Pension at ${RI.sp.age} your plan relies on savings and other income. ${gap}`
      : null
    : p.retireAge < schemeEarliest ? `Retiring before ${schemeEarliest} is possible. ${own}`
    : p.retireAge < accessAge || p.retireAge < earliestAge ? own
    : null
  return { min, max, ok: p.retireAge >= min && p.retireAge <= max, note, accessAge, stateAge: RI.sp.age, bridgeYears: Math.max(0, accessAge - p.retireAge) }
}

/** One row per calendar year; every age event applies to the whole year in which the age is reached (income stops in the retirement year). */
export function* retireYears(p: Person, year0: number): Generator<Year> {
  const r = retireRules(p, year0)
  for (let year = year0; ageInYear(p.dob, year) <= p.planUntil; year++) {
    const age = ageInYear(p.dob, year), retired = age >= p.retireAge, pension = retired && age >= r.accessAge
    yield { year, age, working: !retired, pension, statePension: age >= r.stateAge, bridge: retired && !pension }
  }
}
