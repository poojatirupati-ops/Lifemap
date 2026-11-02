// The Experts tab renders the same DOM as the ORIGINAL's V.EXP() at every booking step, and the
// booking journey (match, share with consent, pick a time, confirm) books the meeting.
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi } from 'vitest'
import { rendered, shape } from '../sheets/dom'
import { runOriginal, TODAY } from '../golden/origSlice'
import { fixtures } from '../golden/origProfile'
import * as Experts from '../../src/screens/Experts.screen'
import { useStore } from '../../src/state/store'
import { toOriginal } from '../../src/state/migrate'
import { seedContent } from '../content/seed'

seedContent()

// slow when the machine is busy: the original runs in node:vm
vi.setConfig({ testTimeout: 30000 })

Object.assign(globalThis, { __TODAY: TODAY })
const original = runOriginal('applyAssume, syncLists, autoSafety, V, ACT')
const fixture = (name: string) => structuredClone(fixtures.find(([file]) => file === name)![1])

function theirs(state: any) {
  original.setState(structuredClone(state))
  original.applyAssume()
  original.syncLists()
  original.autoSafety()
  const view = original.V.EXP()
  // Deliberate copy change: there is no SMS, so the app only promises email.
  const noSms = (html: string) => html.replaceAll('email and SMS', 'email')
  return {
    id: view.id,
    head: shape(view.head),
    body: shape(noSms(view.html)),
    foot: shape(view.foot ?? ''),
  }
}

function ours(state: any) {
  useStore.getState().load(structuredClone(state))
  const store = useStore.getState()
  return {
    id: Experts.id(store.plan, store),
    head: shape(rendered(<>{Experts.Head()}</>)),
    body: shape(rendered(<Experts.Body />)),
    foot: shape(rendered(<Experts.Foot />)),
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
  ['c3', (s) => (s.exp = 'c3')],
  [
    'c3, a day and slot',
    (s) =>
      Object.assign(s.book, { day: 'Thu 29 Oct', slot: SLOT, mode: 'In person' }, (s.exp = 'c3')),
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

describe('booking journey', () => {
  it('match, share with consent, pick a time and confirm', async () => {
    const fetch = vi.fn(async () => new Response('{"booking":{"id":"b1"}}', { status: 201 }))
    vi.stubGlobal('fetch', fetch)
    const state = fixture('sample-exp.json')
    useStore.getState().load(structuredClone(state))
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    const click = (text: string) => {
      const button = [...container.querySelectorAll('button')].find((b) =>
        b.textContent?.includes(text),
      )
      if (!button) throw new Error(`no button "${text}"`)
      act(() => button.click())
    }
    const tick = (selector: string) =>
      act(() => (container.querySelector(selector) as HTMLInputElement).click())
    const page = () => (
      <>
        <Experts.Body />
        <Experts.Foot />
      </>
    )
    act(() => root.render(page()))

    click('Book my adviser meeting')
    // the profile is not finished, so the optional profile step comes first
    expect(useStore.getState().expertsPage).toBe('c0')
    click('Skip for now')
    click('See another match')
    click('Choose')
    expect((container.querySelector('#sharego') as HTMLButtonElement).disabled).toBe(true)
    tick('[data-share="report"]')
    tick('[data-agree]')
    expect((container.querySelector('#sharego') as HTMLButtonElement).disabled).toBe(false)
    click('Pick a time')
    click('In person')
    click('10:00')
    click('Confirm booking')
    await vi.waitFor(() => expect(useStore.getState().expertsPage).toBe('c4'))
    expect(fetch).toHaveBeenCalledWith('/api/bookings', expect.objectContaining({ method: 'POST' }))
    vi.unstubAllGlobals()

    const { plan, expertsPage } = useStore.getState()
    expect(expertsPage).toBe('c4')
    expect(toOriginal(plan).book).toMatchObject({
      adv: 1,
      share: { report: true, fin: false, docs: false, um: false },
      agree: true,
      mode: 'In person',
      slot: 'Wed 28 Oct · 10:00',
      done: true,
    })
    expect(plan.versions.at(-1)?.note).toBe('Adviser meeting booked')
    act(() => root.unmount())
    container.remove()
  })
})
