import samplePlan from '../state/sample-plan.json'
import { fresh } from '../state/fresh.ts'
import { makeSlots } from '../domain/identity/slots.ts'
import { fromOriginal } from '../state/migrate.ts'
import type { Snapshot } from '../state/types.ts'

// The reviewer panel's "Jump to any screen": same groups, ids and labels as the original.
// Each jump builds a whole new plan from a starting point plus a few changed fields.

type Patch = Partial<Snapshot> | ((plan: Snapshot) => Partial<Snapshot>)
export type Jump = { id: string; label: string; build: () => Snapshot }

// ponytail: the captured sample customer stands in for the original's loadSample(); swap when a domain card ports it.
export const sampleCustomer = () => fromOriginal<Snapshot>(structuredClone(samplePlan))

const discovered = (): Snapshot => ({
  ...fresh(),
  answers: { 2: 0, 4: 1, 7: 1, 8: 2, 9: 2, 12: 1 },
  why: ['track'],
})

const inPlanBuilder = (): Snapshot => ({
  ...sampleCustomer(),
  hasResults: false,
  inShell: true,
  planBuilder: true,
  tab: 'plan',
  versions: [],
})

const from =
  (start: () => Snapshot, patch: Patch = {}) =>
  () => {
    const plan = start()
    return { ...plan, ...(typeof patch === 'function' ? patch(plan) : patch) }
  }

const sample = (patch?: Patch) => from(sampleCustomer, patch)
const builder = (scr: string, patch?: Patch) =>
  from(() => ({ ...inPlanBuilder(), screen: scr }), patch)

const meJump = (id: string, label: string, me: string): Jump => ({
  id,
  label,
  build: sample({ tab: 'me', mePage: me }),
})
const expertJump = (id: string, label: string, exp: string): Jump => ({
  id,
  label,
  build: sample({ tab: 'exp', expertsPage: exp }),
})

export const JUMPS: { group: string; jumps: Jump[] }[] = [
  {
    group: 'Sign in',
    jumps: [
      { id: 'P1', label: 'Sign in (email)', build: from(fresh, { screen: 'P1' }) },
      { id: 'P1E', label: 'Email code', build: from(fresh, { screen: 'P1E' }) },
      { id: 'P1D', label: 'New account: name + consents', build: from(fresh, { screen: 'P1D' }) },
    ],
  },
  {
    group: 'Onboarding',
    jumps: [
      { id: 'D0', label: 'Welcome', build: from(fresh) },
      { id: 'D1', label: 'What brought you here?', build: from(fresh, { screen: 'D1' }) },
      { id: 'D2', label: 'Question 1 of 6', build: from(fresh, { screen: 'D2', discoverStep: 0 }) },
      {
        id: 'D5',
        label: 'Question 4 (road)',
        build: from(fresh, { screen: 'D5', discoverStep: 3 }),
      },
      {
        id: 'D6',
        label: 'Question 5 (scenario)',
        build: from(fresh, { screen: 'D6', discoverStep: 4 }),
      },
      { id: 'DR', label: 'Money personality + terms', build: from(discovered, { screen: 'DR' }) },
    ],
  },
  {
    group: 'App before a plan',
    jumps: [
      {
        id: 'HOME-0',
        label: 'Home (no plan yet)',
        build: from(discovered, { inShell: true, tab: 'home' }),
      },
      {
        id: 'XPL-01',
        label: 'Explore',
        build: from(discovered, { inShell: true, tab: 'explore' }),
      },
      {
        id: 'CALC-retirement',
        label: 'A calculator',
        build: from(discovered, {
          inShell: true,
          tab: 'explore',
          explorePages: [{ page: 'CALC', param: 'retirement' }],
        }),
      },
      {
        id: 'VID-01',
        label: 'A video',
        build: from(discovered, {
          inShell: true,
          tab: 'explore',
          explorePages: [{ page: 'VID', param: 'v2' }],
        }),
      },
      {
        id: 'PLAN-0',
        label: 'My Plan (empty state)',
        build: from(discovered, { inShell: true, tab: 'plan' }),
      },
    ],
  },
  {
    group: 'Admin (not for customers)',
    jumps: [
      {
        id: 'ADMIN-SET',
        label: 'Settings: standards, wording, sources, partner label',
        build: sample({ adminView: true }),
      },
    ],
  },
  {
    group: 'Plan builder',
    jumps: [
      { id: 'B1', label: '1 · About you & family', build: builder('B1') },
      { id: 'F1', label: '2 · Your goals', build: builder('F1') },
      { id: 'F2', label: '3 · Your timeline (drag)', build: builder('F2') },
      { id: 'F4', label: '3 · Confirm my LifeMap', build: builder('F4') },
      {
        id: 'B4',
        label: '4 · Your money profile',
        build: builder('B4', ({ answers }) => ({
          answers: Object.fromEntries(
            Object.entries(answers).filter(([question]) => question !== '6'),
          ),
        })),
      },
      { id: 'P2', label: '6 · Your finances hub', build: builder('P2') },
      { id: 'P3-2', label: '6 · Income (type it)', build: builder('P3', { financeSection: 1 }) },
      {
        id: 'P3-6',
        label: '6 · Pension (upload)',
        build: builder('P3', ({ entryMode }) => ({
          financeSection: 5,
          entryMode: { ...entryMode, pension: 'upload' },
        })),
      },
      { id: 'P4', label: '7 · Check your details', build: builder('P4', { checked: false }) },
    ],
  },
  {
    group: 'Results & app',
    jumps: [
      { id: 'HOME', label: 'Home dashboard', build: sample({ tab: 'home' }) },
      // Opens with the plan's gap question already asked, as the original does.
      { id: 'ASK', label: 'Ask (help sheet)', build: sample({ tab: 'home', sheet: 'ask|pgap' }) },
      { id: 'PLAN', label: 'My Plan (timeline + results)', build: sample() },
      meJump('ME-01', 'Me', 'home'),
      meJump('ME-UM', 'Your money profile', 'um'),
      meJump('ME-CHK', 'Your first answers (re-check)', 'recheck'),
      meJump('ME-TERMS', 'Your money terms', 'terms'),
      {
        id: 'ME-UM2',
        label: 'Money profile · capacity',
        build: sample(({ moneyProfile }) => ({
          tab: 'me',
          mePage: 'ums',
          moneyProfile: { ...moneyProfile, section: 2 },
        })),
      },
      {
        id: 'ME-R',
        label: 'Profile result',
        build: sample(({ moneyProfile }) => ({
          tab: 'me',
          mePage: 'umr',
          moneyProfile: {
            ...moneyProfile,
            answers: { ...moneyProfile.answers, u4: 1, u9: 3, u10: 1, u11: 1, u12: 2, u14: 2 },
            done: { 1: true, 2: true, 3: true },
          },
        })),
      },
      meJump('ME-MONEY', 'My money', 'money'),
    ],
  },
  {
    group: 'Connect',
    jumps: [
      expertJump('C0', 'Help your adviser know you', 'c0'),
      expertJump('C1', 'Your match', 'c1'),
      expertJump('C2', 'Share your plan', 'c2'),
      expertJump('C3', 'Pick a time', 'c3'),
      {
        id: 'C4',
        label: "You're booked",
        build: sample(({ booking }) => ({
          tab: 'exp',
          expertsPage: 'c4',
          booking: { ...booking, done: true, slot: makeSlots()[1] },
        })),
      },
    ],
  },
]
