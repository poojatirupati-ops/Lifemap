// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createElement as h } from 'react'
import { act, render } from '@testing-library/react'
import { fresh } from '../../src/state/fresh.ts'
import { JUMPS } from '../../src/shell/jumps.data.ts'
import Screen from '../../src/shell/Screen.tsx'
import { router } from '../../src/shell/router.ts'
import { useStore } from '../../src/state/store.ts'
import { useShell } from '../../src/state/shell.ts'
import { path, renderAt } from '../renderAt.tsx'

const html = readFileSync(
  resolve(__dirname, '../../../LifeGoals-Customer-Journey-Prototype.html'),
  'utf8',
)

describe('wall', () => {
  it('sends a visitor without a session to sign-in, remembering the page; sign-in itself is open', async () => {
    useStore.getState().load(fresh())
    useShell.setState({ authed: true })
    await act(() => router.navigate({ href: '/sign-in' }))
    useShell.setState({ authed: false })
    localStorage.removeItem('lm-test-auth')
    // no API here: the session check finds none
    globalThis.fetch = (async () => new Response('null')) as typeof fetch
    await act(() => router.navigate({ href: '/me/privacy' }))
    expect(path()).toBe('/sign-in')
    expect(router.state.location.search).toEqual({ redirect: '/me/privacy' })
    await act(() => router.navigate({ href: '/sign-in/code' }))
    expect(path()).toBe('/sign-in/code')
  })
})

describe('Screen', () => {
  const bar = h('div', { className: 'topbar hdr' }, 'logo')
  const title = h('h2', null, 'Title')
  const markup = (props: object) =>
    render(h(Screen, { id: 'X', note: '', ...props }, 'body')).container.innerHTML

  it('keeps the logo bar pinned and the title in .pghead at the top of the scroll area', () =>
    expect(markup({ bar, head: title })).toBe(
      '<div class="app"><header class="sky"><div class="topbar hdr">logo</div></header>' +
        '<div class="scroll" id="main"><div class="pghead"><h2>Title</h2></div>body</div></div>',
    ))
  it('a lone logo bar has no .pghead; a head without a bar stays in the header', () => {
    expect(markup({ bar })).toBe(
      '<div class="app"><header class="sky"><div class="topbar hdr">logo</div></header>' +
        '<div class="scroll" id="main">body</div></div>',
    )
    expect(markup({ head: title, foot: 'go' })).toBe(
      '<div class="app"><header class="sky"><h2>Title</h2></header>' +
        '<div class="scroll" id="main">body</div><div class="foot">go</div></div>',
    )
  })
})

describe('jumps', () => {
  it('ids and labels match the original JUMPS, less its save step and the sign-in moved first (O-01)', () => {
    const block = html.slice(html.indexOf('const JUMPS = ['), html.indexOf('function side()'))
    const orig = [...block.matchAll(/\['([A-Za-z0-9-]+)',\s*(?:"([^"]*)"|'([^']*)')/g)].map((m) => [
      m[1],
      m[2] ?? m[3],
    ])
    const ours = JUMPS.slice(1).flatMap(({ jumps }) => jumps.map(({ id, label }) => [id, label]))
    expect(ours).toEqual(orig.filter(([id]) => !['DS', 'P1', 'P1E'].includes(id!)))
    expect(JUMPS.map(({ group }) => group)).toEqual([
      'Sign in',
      'Onboarding',
      'App before a plan',
      'Admin (not for customers)',
      'Plan builder',
      'Results & app',
      'Connect',
    ])
  })
  it('every jump builds a state', () =>
    JUMPS.forEach(({ jumps }) =>
      jumps.forEach(({ build }) => expect(build().goals).toBeInstanceOf(Array)),
    ))
})

describe('jump URLs', () => {
  it('every jump opens its page with its plan', async () => {
    await renderAt('/')
    for (const { jumps } of JUMPS)
      for (const jump of jumps) {
        await act(() => router.navigate({ href: `/jump/${jump.id}` }))
        expect([jump.id, path()]).toEqual([jump.id, jump.to.split('?')[0]])
        if (jump.id !== 'ASK') expect(useShell.getState().screenId).toBe(jump.id)
      }
  })
})

describe('Screen ids', () => {
  it('a new id is a new screen: its page remounts (enter replays) and #curid follows; the same id keeps it', async () => {
    useStore.getState().load(fresh())
    const { container } = await renderAt('/discover/1')
    const page = () => container.querySelector('#screen')!.firstElementChild
    expect(useShell.getState().screenId).toBe('D2')
    const first = page()
    act(() => useStore.getState().update((plan) => void (plan.whyNote = 'x')))
    expect(page()).toBe(first) // same id: no replay
    await act(() => router.navigate({ href: '/discover/2' }))
    expect(page()).not.toBe(first)
    expect(useShell.getState().screenId).toBe('D3')
    expect(useShell.getState().screenNote).toMatch(/^Discover question 2 of 6/)
  })
})
