// The original's profile, goals and normaliser functions, plus the fixtures the profile tests share.
import { readFileSync, readdirSync } from 'node:fs'
import { runOriginal, TODAY } from './origSlice'
import { normalize } from '../../src/domain/plan/normalize'
import { localToday } from '../../src/lib/today'
import type { Plan } from '../../src/state/types'
import samplePlan from '../../src/state/sample-plan.json'

export const original = runOriginal(
  `applyAssume, syncAges, syncSafety, syncLists, mkGoal, autoSafety, setSafetyMonths, setRetireAge,
  asmV, essM, finNums, AS, SAVE, personality, personalityScores, suggestU9, riskRead, riskLabelText,
  discCount, discEnough, umCount, umS, dsc, cushionM, PW, P_ORDER, RISK_LBL, COMFORT, MIS, MIS_ADV,
  RISK_SETBY, KE_NOTE, SETTINGS`,
)

/** JSON round trip that keeps Infinity comparable. */
export const plain = (value: unknown) =>
  JSON.parse(JSON.stringify(value, (_, v) => (v === Infinity ? 'Inf' : v)))

const fixtureDir = new URL('../fixtures/', import.meta.url)
export const fixtures = readdirSync(fixtureDir)
  .filter((name) => name.endsWith('.json'))
  .map((name) => [name, JSON.parse(readFileSync(new URL(name, fixtureDir), 'utf8'))] as const)
  .concat([['sample-plan.json', samplePlan]])

/** The original's state after the steps it runs before every render. */
export function originalNormalized(state: unknown) {
  original.setState(structuredClone(state))
  original.applyAssume()
  original.syncLists()
  return original.getState()
}

/** Our state after the same normalisation. */
export function ourNormalized(state: Plan) {
  const copy = structuredClone(state)
  normalize(copy, localToday(TODAY))
  const { listsFedTotals, ...rest } = copy // the original calls it dv
  return { ...rest, dv: listsFedTotals }
}
