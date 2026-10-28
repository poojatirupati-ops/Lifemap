import samplePlan from '../state/sample-plan.json'
import { fresh } from '../state/fresh.ts'
import { makeSlots } from '../domain/identity/slots.ts'
import type { Snapshot } from '../state/types.ts'

// The reviewer panel's "Jump to any screen": same groups, ids and labels as the original.
// Each jump builds a whole new plan from a starting point plus a few changed fields.

type Patch = Partial<Snapshot> | ((plan: Snapshot) => Partial<Snapshot>)
export type Jump = { id: string; label: string; build: () => Snapshot }

// ponytail: the captured sample customer stands in for the original's loadSample(); swap when a domain card ports it.
// The cast: JSON imports widen literal unions (Provenance) to string; the file is a saved Snapshot.
export const sampleCustomer = () => structuredClone(samplePlan as Snapshot)

const discovered = (): Snapshot => ({
  ...fresh(),
  ans: { 2: 0, 4: 1, 7: 1, 8: 2, 9: 2, 12: 1 },
  why: ['track'],
})

const inPlanBuilder = (): Snapshot => ({
  ...sampleCustomer(),
  app: false,
  shell: true,
  pb: true,
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
const builder = (scr: string, patch?: Patch) => from(() => ({ ...inPlanBuilder(), scr }), patch)

const meJump = (id: string, label: string, me: string): Jump => ({
  id,
  label,
  build: sample({ tab: 'me', me }),
})
const expertJump = (id: string, label: string, exp: string): Jump => ({
  id,
  label,
  build: sample({ tab: 'exp', exp }),
})

export const JUMPS: { group: string; jumps: Jump[] }[] = [
  {
    group: 'Onboarding',
    jumps: [
      { id: 'D0', label: 'Welcome', build: from(fresh) },
      { id: 'D1', label: 'What brought you here?', build: from(fresh, { scr: 'D1' }) },
      { id: 'D2', label: 'Question 1 of 6', build: from(fresh, { scr: 'D2', di: 0 }) },
      { id: 'D5', label: 'Question 4 (road)', build: from(fresh, { scr: 'D5', di: 3 }) },
      { id: 'D6', label: 'Question 5 (scenario)', build: from(fresh, { scr: 'D6', di: 4 }) },
      { id: 'DR', label: 'Money personality + terms', build: from(discovered, { scr: 'DR' }) },
      { id: 'DS', label: 'Save your results', build: from(discovered, { scr: 'DS' }) },
    ],
  },
  {
    group: 'App before a plan',
    jumps: [
      {
        id: 'HOME-0',
        label: 'Home (no plan yet)',
        build: from(discovered, { shell: true, tab: 'home' }),
      },
      { id: 'XPL-01', label: 'Explore', build: from(discovered, { shell: true, tab: 'explore' }) },
      {
        id: 'CALC-retirement',
        label: 'A calculator',
        build: from(discovered, {
          shell: true,
          tab: 'explore',
          xs: [{ v: 'CALC', p: 'retirement' }],
        }),
      },
      {
        id: 'VID-01',
        label: 'A video',
        build: from(discovered, { shell: true, tab: 'explore', xs: [{ v: 'VID', p: 'v2' }] }),
      },
      {
        id: 'PLAN-0',
        label: 'My Plan (empty state)',
        build: from(discovered, { shell: true, tab: 'plan' }),
      },
    ],
  },
  {
    group: 'Admin (not for customers)',
    jumps: [
      {
        id: 'ADMIN-SET',
        label: 'Settings: standards, wording, sources, partner label',
        build: sample({ admin: true }),
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
        build: builder('B4', ({ ans }) => ({
          ans: Object.fromEntries(Object.entries(ans).filter(([question]) => question !== '6')),
        })),
      },
      {
        id: 'P1',
        label: '5 · Secure your account',
        build: builder('P1', ({ acct }) => ({
          acct: { ...acct, c1: false, ev: false, sv: false },
        })),
      },
      {
        id: 'P1E',
        label: '5 · Email code',
        build: builder('P1E', ({ acct }) => ({ acct: { ...acct, ev: false, sv: false } })),
      },
      { id: 'P2', label: '6 · Your finances hub', build: builder('P2') },
      { id: 'P3-2', label: '6 · Income (type it)', build: builder('P3', { fsec: 1 }) },
      {
        id: 'P3-6',
        label: '6 · Pension (upload)',
        build: builder('P3', ({ fmode }) => ({ fsec: 5, fmode: { ...fmode, pension: 'upload' } })),
      },
      { id: 'P4', label: '7 · Check your details', build: builder('P4', { checked: false }) },
    ],
  },
  {
    group: 'Results & app',
    jumps: [
      { id: 'HOME', label: 'Home dashboard', build: sample({ tab: 'home' }) },
      // ponytail: the original also seeds one Q&A from askPlan(); add it with the Ask card.
      { id: 'ASK', label: 'Ask (help sheet)', build: sample({ tab: 'home', sheet: 'ask' }) },
      { id: 'PLAN', label: 'My Plan (timeline + results)', build: sample() },
      meJump('ME-01', 'Me', 'home'),
      meJump('ME-UM', 'Your money profile', 'um'),
      meJump('ME-CHK', 'Your first answers (re-check)', 'recheck'),
      meJump('ME-TERMS', 'Your money terms', 'terms'),
      {
        id: 'ME-UM2',
        label: 'Money profile · capacity',
        build: sample(({ um }) => ({ tab: 'me', me: 'ums', um: { ...um, sec: 2 } })),
      },
      {
        id: 'ME-R',
        label: 'Profile result',
        build: sample(({ um }) => ({
          tab: 'me',
          me: 'umr',
          um: {
            ...um,
            a: { ...um.a, u4: 1, u9: 3, u10: 1, u11: 1, u12: 2, u14: 2 },
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
        build: sample(({ book }) => ({
          tab: 'exp',
          exp: 'c4',
          book: { ...book, done: true, slot: makeSlots()[1] },
        })),
      },
    ],
  },
]
