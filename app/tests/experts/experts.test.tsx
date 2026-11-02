// The Experts tab renders the same DOM as the ORIGINAL's V.EXP() at every booking step but c3, which is
// Cal.com's calendar now (the booking journey itself is in booking.test.tsx). The original's three advisers
// stand in for the tenant's (GET /api/advisers).
import { describe, expect, it, vi } from 'vitest'
import { rendered, shape } from '../sheets/dom'
import { runOriginal, TODAY } from '../golden/origSlice'
import { fixtures } from '../golden/origProfile'
import { Body } from '../../src/components/experts/ExpertsPage.tsx'
import ExpertsFoot from '../../src/components/experts/ExpertsFoot.tsx'
import { headOf, STAGES } from '../../src/components/experts/stages.ts'
import HdrBar from '../../src/components/frame/HdrBar.tsx'
import TitleBlock from '../../src/components/frame/TitleBlock.tsx'
import { queryClient } from '../../src/auth/planSync.ts'
import { ADVISERS, type Adviser } from '../../src/bookings/bookings.ts'
import { stageOf } from '../../src/domain/identity/booking.ts'
import { useStore } from '../../src/state/store'
import { seedContent } from '../content/seed'

seedContent()

// slow when the machine is busy: the original runs in node:vm
vi.setConfig({ testTimeout: 30000 })

Object.assign(globalThis, { __TODAY: TODAY })
const original = runOriginal('applyAssume, syncLists, autoSafety, V, ACT, ADVISERS')
const advisers: Adviser[] = original.ADVISERS.map((a: any) => ({
  id: a.ini,
  name: a.n,
  calLink: `${a.ini}/45min`,
  profile: { qualifications: a.q, languages: a.lang, location: a.loc, meetingMode: a.mode },
}))
queryClient.setQueryData(ADVISERS, advisers)
const fixture = (name: string) => structuredClone(fixtures.find(([file]) => file === name)![1])

function theirs(state: any) {
  original.setState(structuredClone(state))
  original.applyAssume()
  original.syncLists()
  original.autoSafety()
  const view = original.V.EXP()
  // Deliberate copy change: there is no SMS, so the app only promises email.
  const noSms = (html: string) => html.replaceAll('email and SMS', 'email')
  // Deliberate copy change: the advisers are the tenant's real ones, not samples.
  const realAdvisers = (html: string) =>
    html.replaceAll('Your match · sample adviser', 'Your match')
  return {
    id: view.id,
    head: shape(view.head),
    body: shape(realAdvisers(noSms(view.html))),
    foot: shape(view.foot ?? ''),
  }
}

function ours(state: any) {
  useStore.getState().load(structuredClone(state))
  const { plan } = useStore.getState()
  // the original's S.exp is the URL now (/experts or /experts/c0 to c4)
  const stage = stageOf(state.exp ?? 'home', plan.booking.done)
  const { title, sub, back } = headOf(plan, stage, advisers[plan.booking.adviser].name)
  const head = (
    <>
      <HdrBar back={back && (() => {})} bell />
      <TitleBlock title={title} sub={sub} titleStyle={{ marginTop: 10 }} />
    </>
  )
  return {
    id: STAGES[stage].id,
    head: shape(rendered(head)),
    body: shape(rendered(<Body stage={stage} />)),
    foot: shape(stage === 'booked' ? '' : rendered(<ExpertsFoot stage={stage} />)),
  }
}

const SLOT = 'Wed 28 Oct · 10:00'
const STEPS: [string, (state: any) => void][] = [
  ['home', () => {}],
  ['home, a specialist picked', (s) => (s.book.spec = 'pension')],
  ['c0', (s) => (s.exp = 'c0')],
  ['c1', (s) => (s.exp = 'c1')],
  ['c1, second adviser', (s) => Object.assign(s, { exp: 'c1' }, { book: { ...s.book, adv: 1 } })],
  ['c2', (s) => (s.exp = 'c2')],
  [
    'c2, ticked and agreed',
    (s) =>
      Object.assign(
        s.book,
        { share: { ...s.book.share, report: true }, agree: true },
        (s.exp = 'c2'),
      ),
  ],
  ['c4', (s) => Object.assign(s.book, { slot: SLOT, done: true }, (s.exp = 'c4'))],
  ['booked', (s) => Object.assign(s.book, { slot: SLOT, done: true })],
]

describe('Experts equals the original', () => {
  for (const name of ['sample-exp.json', 'fresh.json', 'discovered.json'])
    for (const [step, setUp] of STEPS)
      it(`${step} on ${name}`, () => {
        const state = fixture(name)
        Object.assign(state, { tab: 'exp', shell: true })
        setUp(state)
        const { foot, ...rest } = ours(state)
        const expected = theirs(state)
        expect(rest).toEqual({ id: expected.id, head: expected.head, body: expected.body })
        // the booked tab has no foot; ours renders nothing inside it
        expect(foot.join('')).toEqual(expected.foot.join(''))
      })
})
