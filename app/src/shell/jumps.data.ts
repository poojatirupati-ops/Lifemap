import samplePlan from '../state/sample-plan.json'
import { fresh } from '../state/fresh.ts'
import { addDays } from 'date-fns/addDays'
import { isWeekend } from 'date-fns/isWeekend'
import { nextMonday } from 'date-fns/nextMonday'
import { setHours } from 'date-fns/setHours'
import { slotLabel } from '../domain/identity/booking.ts'
import { localToday } from '../lib/today.ts'
import { fromOriginal } from '../state/migrate.ts'
import type { Snapshot } from '../state/types.ts'

// The reviewer panel's "Jump to any screen": same groups, ids and labels as the original.
// Each jump builds a whole new plan from a starting point plus a few changed fields, then opens its URL
// (also reachable as /jump/<id>, routes/jump.$id.tsx, which the Playwright screen checks use).

/** The original's sample meeting: 18:00 on the first working day from two days ahead. */
function sampleSlot() {
  const day = addDays(localToday(), 2)
  return slotLabel(setHours(isWeekend(day) ? nextMonday(day) : day, 18))
}

type Patch = Partial<Snapshot> | ((plan: Snapshot) => Partial<Snapshot>)
export type Jump = { id: string; label: string; to: string; build: () => Snapshot }

// The captured sample customer stands in for the original's loadSample().
export const sampleCustomer = () => fromOriginal<Snapshot>(structuredClone(samplePlan))

const discovered = (): Snapshot => ({
  ...fresh(),
  answers: { 2: 0, 4: 1, 7: 1, 8: 2, 9: 2, 12: 1 },
  why: ['track'],
})

const inPlanBuilder = (): Snapshot => ({
  ...sampleCustomer(),
  hasResults: false,
  versions: [],
})

const from =
  (start: () => Snapshot, patch: Patch = {}) =>
  () => {
    const plan = start()
    return { ...plan, ...(typeof patch === 'function' ? patch(plan) : patch) }
  }

const sample = (patch?: Patch) => from(sampleCustomer, patch)
const builder = (patch?: Patch) => from(inPlanBuilder, patch)

// [id, label, URL, plan]; a jump without a plan opens the sample customer's app
type Row = [id: string, label: string, to: string, build?: () => Snapshot]

const group = (name: string, rows: Row[]) => ({
  group: name,
  jumps: rows.map(([id, label, to, build = sample()]): Jump => ({ id, label, to, build })),
})

export const JUMPS: { group: string; jumps: Jump[] }[] = [
  group('Sign in', [
    ['P1', 'Sign in (email)', '/sign-in', from(fresh)],
    ['P1E', 'Email code', '/sign-in/code', from(fresh)],
    ['P1D', 'New account: name + consents', '/account/details', from(fresh)],
  ]),
  group('Onboarding', [
    ['D0', 'Welcome', '/', from(fresh)],
    ['D1', 'What brought you here?', '/why', from(fresh)],
    ['D2', 'Question 1 of 6', '/discover/1', from(fresh)],
    ['D5', 'Question 4 (road)', '/discover/4', from(fresh)],
    ['D6', 'Question 5 (scenario)', '/discover/5', from(fresh)],
    ['DR', 'Money personality + terms', '/personality', from(discovered)],
  ]),
  group('App before a plan', [
    ['HOME-0', 'Home (no plan yet)', '/home', from(discovered)],
    ['XPL-01', 'Explore', '/explore', from(discovered)],
    ['CALC-retirement', 'A calculator', '/explore/calculator/retirement', from(discovered)],
    ['VID-01', 'A video', '/explore/videos/v2', from(discovered)],
    ['PLAN-0', 'My Plan (empty state)', '/plan', from(discovered)],
  ]),
  group('Admin (not for customers)', [
    ['ADMIN-SET', 'Settings: standards, wording, sources, partner label', '/admin'],
  ]),
  group('Plan builder', [
    ['B1', '1 · About you & family', '/build/about', builder()],
    ['F1', '2 · Your goals', '/build/goals', builder()],
    ['F2', '3 · Your timeline (drag)', '/build/timeline', builder()],
    ['F4', '3 · Confirm my LifeMap', '/build/review', builder()],
    [
      'B4',
      '4 · Your money profile',
      '/build/profile',
      builder(({ answers }) => ({
        answers: Object.fromEntries(
          Object.entries(answers).filter(([question]) => question !== '6'),
        ),
      })),
    ],
    ['P2', '6 · Your finances hub', '/build/finances', builder()],
    ['P3-2', '6 · Income (type it)', '/build/finances/2', builder()],
    [
      'P3-6',
      '6 · Pension (upload)',
      '/build/finances/6',
      builder(({ entryMode }) => ({ entryMode: { ...entryMode, pension: 'upload' } })),
    ],
    ['P4', '7 · Check your details', '/build/check', builder({ checked: false })],
  ]),
  group('Results & app', [
    ['HOME', 'Home dashboard', '/home'],
    // Opens with the plan's gap question already asked, as the original does.
    ['ASK', 'Ask (help sheet)', '/home', sample({ sheet: 'ask|pgap' })],
    ['PLAN', 'My Plan (timeline + results)', '/plan'],
    ['ME-01', 'Me', '/me'],
    ['ME-UM', 'Your money profile', '/me/profile'],
    ['ME-CHK', 'Your first answers (re-check)', '/me/recheck'],
    ['ME-TERMS', 'Your money terms', '/me/terms'],
    [
      'ME-UM2',
      'Money profile · capacity',
      '/me/profile/section',
      sample(({ moneyProfile }) => ({ moneyProfile: { ...moneyProfile, section: 2 } })),
    ],
    [
      'ME-R',
      'Profile result',
      '/me/profile/result',
      sample(({ moneyProfile }) => ({
        moneyProfile: {
          ...moneyProfile,
          answers: { ...moneyProfile.answers, u4: 1, u9: 3, u10: 1, u11: 1, u12: 2, u14: 2 },
          done: { 1: true, 2: true, 3: true },
        },
      })),
    ],
    ['ME-MONEY', 'My money', '/me/money'],
  ]),
  group('Connect', [
    ['C0', 'Help your adviser know you', '/experts/c0'],
    ['C1', 'Your match', '/experts/c1'],
    ['C2', 'Share your plan', '/experts/c2'],
    ['C3', 'Pick a time', '/experts/c3'],
    [
      'C4',
      "You're booked",
      '/experts/c4',
      sample(({ booking }) => ({ booking: { ...booking, done: true, slot: sampleSlot() } })),
    ],
  ]),
]

/** A jump by its id, for /jump/<id>. */
export const jumpById = (id: string) =>
  JUMPS.flatMap(({ jumps }) => jumps).find((jump) => jump.id === id)
