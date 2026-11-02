// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { fresh } from '../../src/state/fresh.ts'
import type { Plan, Snapshot } from '../../src/state/types.ts'
import type { Screen } from '../../src/shell/screens.tsx'
import { JUMPS } from '../../src/shell/jumps.data.ts'
import { fallbackKey, pickScreen } from '../../src/shell/pickScreen.ts'
import { PUBLIC, isWalled, sendToSignIn } from '../../src/shell/wall.ts'
import { splitHead } from '../../src/shell/splitHead.tsx'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement as h, Fragment } from 'react'
import { act, render } from '@testing-library/react'
import ScreenHost from '../../src/shell/ScreenHost.tsx'
import { useStore } from '../../src/state/store.ts'
import { useShell } from '../../src/state/shell.ts'

// A DQ-like screen whose id derives from the plan: 'D' + (di + 2).
vi.mock('../../src/shell/screens.tsx', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/shell/screens.tsx')>()
  const { createElement } = await import('react')
  const discoverQuestion: Screen = {
    key: 'DQ',
    id: (plan) => `D${plan.discoverStep + 2}`,
    note: (plan) => `Discover question ${plan.discoverStep + 1} of 6`,
    kind: 'quiz',
    Body: () => createElement('h2', { tabIndex: -1 }, 'q'),
  }
  return {
    ...actual,
    screenFor: (key: string, plan: Plan) =>
      key === 'DQ' ? discoverQuestion : actual.screenFor(key, plan),
  }
})

const html = readFileSync(
  resolve(__dirname, '../../../LifeGoals-Customer-Journey-Prototype.html'),
  'utf8',
)

describe('wall', () => {
  it('lets public keys and signed-in visitors through, walls the rest', () => {
    expect(PUBLIC).toEqual(['D0', 'D1', 'DQ', 'DR', 'DS'])
    PUBLIC.forEach((key) => expect(isWalled(key, false)).toBe(false))
    expect(isWalled('B1', true)).toBe(false)
    expect(isWalled('B1', false)).toBe(true)
    expect(isWalled('HOME', false)).toBe(true)
    expect(isWalled('P1E', false)).toBe(false) // the code step is not bounced to P1
  })
  it('sendToSignIn shows P1, which then passes the wall, and remembers the picked target in rt', () => {
    const cases: [string, Partial<Snapshot>][] = [
      ['F2', { inShell: true, tab: 'plan', planBuilder: true, screen: 'F2' }],
      ['HOME', { hasResults: true, tab: 'home' }],
      ['SET', { adminView: true }], // the wall clears admin too, or SET would keep showing
    ]
    cases.forEach(([want, patch]) => {
      useStore.getState().load({ ...fresh(), ...patch })
      const { plan, screen } = useStore.getState()
      sendToSignIn(pickScreen(plan, screen).key)
      const after = useStore.getState()
      expect(pickScreen(after.plan, after.screen).key).toBe('P1')
      expect(isWalled('P1', false)).toBe(false)
      expect(after.plan.returnTo).toBe(want)
    })
  })
})

describe('splitHead', () => {
  const html = (n: any) => renderToStaticMarkup(h(Fragment, null, n))
  const bar = h('div', { className: 'topbar hdr', key: 'a' }, 'logo'),
    title = h('h2', { key: 'b' }, 'Title')
  it('keeps the logo bar pinned and hoists the rest into .pghead (fragment, wrapper and lone bar)', () => {
    const [t1, r1] = splitHead(h(Fragment, null, bar, title))
    expect(html(t1)).toBe('<div class="topbar hdr">logo</div>')
    expect(html(r1)).toBe('<div class="pghead"><h2>Title</h2></div>')
    expect(html(splitHead(h('div', null, bar, title))[1])).toBe(
      '<div class="pghead"><h2>Title</h2></div>',
    )
    const [t3, r3] = splitHead(bar)
    expect(html(t3)).toBe('<div class="topbar hdr">logo</div>')
    expect(r3).toBeNull()
  })
  it('pins a .pbrow like a logo bar', () => {
    const pb = h('div', { className: 'pbrow', key: 'a' }, 'back')
    const [t, r] = splitHead(h(Fragment, null, pb, title))
    expect(html(t)).toBe('<div class="pbrow">back</div>')
    expect(html(r)).toBe('<div class="pghead"><h2>Title</h2></div>')
  })
  it('leaves a head without a logo bar alone', () =>
    expect(splitHead(title)).toEqual([title, null]))
})

describe('pickScreen', () => {
  const pick = (f: (s: Snapshot) => void) => {
    const s: Snapshot = fresh()
    f(s)
    return pickScreen(s, s.screen ?? 'D0')
  }
  it('follows the original current()', () => {
    expect(pick(() => {}).key).toBe('D0')
    expect(
      pick((s) => {
        s.screen = 'D4'
      }).key,
    ).toBe('DQ')
    expect(
      pick((s) => {
        s.screen = 'DR'
      }).key,
    ).toBe('DR')
    expect(
      pick((s) => {
        s.adminView = true
      }).key,
    ).toBe('SET')
    expect(
      pick((s) => {
        s.inShell = true
        s.tab = 'home'
      }).key,
    ).toBe('HOME0')
    expect(
      pick((s) => {
        s.inShell = true
        s.tab = 'plan'
      }).key,
    ).toBe('PLAN0')
    expect(
      pick((s) => {
        s.inShell = true
        s.tab = 'plan'
        s.planBuilder = true
        s.screen = 'D0'
      }).key,
    ).toBe('B1')
    expect(
      pick((s) => {
        s.inShell = true
        s.tab = 'plan'
        s.planBuilder = true
        s.screen = 'F2'
      }).key,
    ).toBe('F2')
    expect(
      pick((s) => {
        s.inShell = true
        s.tab = 'explore'
      }).key,
    ).toBe('XPL')
    expect(
      pick((s) => {
        s.hasResults = true
        s.tab = 'explore'
        s.explorePages = [{ page: 'CALC', param: 'retirement' }]
      }),
    ).toEqual({ key: 'CALC', param: 'retirement' })
    expect(
      pick((s) => {
        s.hasResults = true
        s.tab = 'plan'
        s.planSegment = 'add'
      }).key,
    ).toBe('GOALS')
    expect(
      pick((s) => {
        s.hasResults = true
        s.tab = 'me'
        s.mePage = 'fin'
        s.financeSection = 2
      }).key,
    ).toBe('P3')
    expect(
      pick((s) => {
        s.hasResults = true
        s.tab = 'exp'
        s.expertsPage = 'fin'
      }).key,
    ).toBe('P2')
  })
})

describe('fallbackKey', () => {
  it('unknown ids show D0, or B1 in the shell plan branch', () => {
    const s: any = fresh()
    expect(fallbackKey(s)).toBe('D0')
    s.shell = true
    s.tab = 'plan'
    expect(fallbackKey(s)).toBe('B1')
    s.app = true
    expect(fallbackKey(s)).toBe('D0')
  })
})

describe('jumps', () => {
  it('ids and labels match the original JUMPS', () => {
    const block = html.slice(html.indexOf('const JUMPS = ['), html.indexOf('function side()'))
    const orig = [...block.matchAll(/\['([A-Za-z0-9-]+)',\s*(?:"([^"]*)"|'([^']*)')/g)].map((m) => [
      m[1],
      m[2] ?? m[3],
    ])
    expect(JUMPS.flatMap(({ jumps }) => jumps.map(({ id, label }) => [id, label]))).toEqual(orig)
    expect(JUMPS.map(({ group }) => group)).toEqual([
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

describe('ScreenHost', () => {
  it('a state-derived id (DQ: D + (di + 2)) is a new screen: its page remounts (enter replays), #curid follows; same id keeps it', () => {
    const set = (f: (s: any) => void, screen?: string) =>
      act(() => {
        if (screen) useStore.getState().go(screen)
        useStore.getState().update(f)
      })
    set((s) => {
      s.di = 0
    }, 'D2')
    const { container } = render(h(ScreenHost)),
      el = container.querySelector('#screen')!
    // #screen keeps .enter; a new screen remounts its keyed child, so the rise animation replays.
    const page = () => el.firstElementChild
    expect(useShell.getState().screenId).toBe('D2')
    const first = page()
    set((s) => {
      s.whyNote = 'x'
    })
    expect(page()).toBe(first) // same id: no replay
    set((s) => {
      s.di = 1
    }, 'D3')
    expect(page()).not.toBe(first)
    expect(useShell.getState()).toMatchObject({
      screenId: 'D3',
      screenNote: 'Discover question 2 of 6',
    })
  })
})
