// @vitest-environment jsdom
import { useRef, type ReactNode } from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useStore } from '../../src/state/store.ts'
import { fresh } from '../../src/state/fresh.ts'
import { useScreenEnter } from '../../src/hooks/useScreenEnter.ts'
import { useCountUp } from '../../src/hooks/useCountUp.ts'
import { useFndWatch } from '../../src/hooks/useFndWatch.ts'
import { useOrbit } from '../../src/hooks/useOrbit.ts'
import { useScrollKeep } from '../../src/hooks/useScrollKeep.ts'
import { focusAfterRender, useFocusReturn } from '../../src/hooks/useFocusReturn.ts'
import { useGlobalKeys } from '../../src/hooks/useGlobalKeys.ts'

function Host({ k, children }: { k: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null),
    sheet = useStore((st) => st.sheet)
  useScreenEnter(ref, k)
  useCountUp(ref, k)
  useFndWatch(ref)
  useOrbit(ref, k)
  useScrollKeep(ref, k)
  useFocusReturn(ref, k, sheet)
  useGlobalKeys()
  return (
    <div id="screen" ref={ref}>
      {children}
    </div>
  )
}
const Sheet = ({ name }: { name: string }) => (
  <div className="sheet">
    <h2 tabIndex={-1}>Sheet</h2>
    {name !== 'ask' && (
      <>
        <input id="sf" />
        <button className="btn" id="sb">
          Go
        </button>
      </>
    )}
  </div>
)
const Page = ({
  title,
  sheet,
  opener = true,
  extra,
}: {
  title: string
  sheet?: string | null
  opener?: boolean
  extra?: ReactNode
}) => (
  <>
    <h2 tabIndex={-1}>{title}</h2>
    <input id="in" />
    {opener && (
      <button data-a="sheet" data-p="x">
        open
      </button>
    )}
    <button data-a="fex" data-p="rate">
      rate
    </button>
    {extra}
    {sheet && <Sheet name={sheet} />}
  </>
)
const view = (k: string, extra?: { opener?: boolean; extra?: ReactNode }) => (
  <Host k={k}>
    <Page title={k} sheet={useStore.getState().sheet} {...extra} />
  </Host>
)
const setSheet = (v: string | null) => act(() => useStore.setState({ sheet: v }))
const active = () => {
  const a = document.activeElement as HTMLElement
  return a.id || a.dataset.a + '|' + (a.dataset.p ?? '') || a.tagName
}
// jsdom has no layout: offsetParent is always null, which the Tab trap uses to skip hidden controls
Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
  configurable: true,
  get() {
    return this.parentNode
  },
})

beforeEach(() => useStore.setState({ plan: fresh(), screen: 'D0', sheet: null }))
afterEach(() => vi.unstubAllGlobals())

describe('focus table (the original render() focus block)', () => {
  it('new screen: its h2 takes focus; a focused #screen input keeps it; same screen re-render leaves focus alone', () => {
    const r = render(view('A'))
    expect(document.activeElement?.textContent).toBe('A')
    act(() => (document.getElementById('in') as HTMLElement).focus())
    r.rerender(view('B'))
    expect(active()).toBe('in')
    act(() => (document.querySelector('[data-a="fex"]') as HTMLElement).focus())
    r.rerender(view('B'))
    expect(active()).toBe('fex|rate')
  })
  it('focusKey wins after a render', () => {
    const r = render(view('A'))
    focusAfterRender('[data-a="fex"][data-p="rate"]')
    r.rerender(view('A'))
    expect(active()).toBe('fex|rate')
  })
  it.each([
    ['x', 'sf'],
    ['ask', ''],
  ])('sheet %s opens: focus goes to its first field, Ask to its title', (name, want) => {
    const r = render(view('A'))
    setSheet(name)
    r.rerender(view('A'))
    if (want) expect(active()).toBe(want)
    else expect(document.activeElement?.textContent).toBe('Sheet')
  })
  it('sheet closes on the same screen: focus returns to the control that opened it', () => {
    const r = render(view('A'))
    act(() => (document.querySelector('[data-a="sheet"]') as HTMLElement).focus())
    setSheet('x')
    r.rerender(view('A'))
    expect(active()).toBe('sf')
    setSheet(null)
    r.rerender(view('A'))
    expect(active()).toBe('sheet|x')
  })
  it('explainer sheet (ex|) closed by Escape: focus goes to its link', () => {
    const r = render(view('A'))
    setSheet('ex|rate')
    r.rerender(view('A'))
    fireEvent.keyDown(document, { key: 'Escape' })
    r.rerender(view('A'))
    expect(useStore.getState().sheet).toBeNull()
    expect(active()).toBe('fex|rate')
  })
  it('sheet closes and its opener is gone: focus is never left on the body', () => {
    const r = render(view('A'))
    act(() => (document.querySelector('[data-a="sheet"]') as HTMLElement).focus())
    setSheet('x')
    r.rerender(view('A'))
    act(() => {
      useStore.getState().closeSheet()
      r.rerender(view('A', { opener: false }))
    }) // one render, like ScreenHost
    expect(document.activeElement?.textContent).toBe('A')
  })
  it('Tab wraps inside an open sheet and pulls stray focus back in', () => {
    const r = render(view('A'))
    setSheet('x')
    r.rerender(view('A'))
    act(() => (document.getElementById('sb') as HTMLElement).focus())
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(active()).toBe('sf')
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(active()).toBe('sb')
    act(() => (document.getElementById('in') as HTMLElement).focus())
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(active()).toBe('sf')
  })
})

describe('scroll keep', () => {
  it("same screen restores the reader's place even if the scroller is re-created; a new screen starts at the top", () => {
    const r = render(
      <Host k="A">
        <div className="scroll" key="1">
          x
        </div>
      </Host>,
    )
    const sc = document.querySelector('.scroll') as HTMLElement
    sc.scrollTop = 240
    fireEvent.scroll(sc)
    r.rerender(
      <Host k="A">
        <div className="scroll" key="2">
          x
        </div>
      </Host>,
    )
    const sc2 = document.querySelector('.scroll') as HTMLElement
    expect(sc2).not.toBe(sc)
    expect(sc2.scrollTop).toBe(240)
    expect(sc2.style.scrollBehavior).toBe('auto')
    r.rerender(
      <Host k="B">
        <div className="scroll" key="3">
          x
        </div>
      </Host>,
    )
    expect((document.querySelector('.scroll') as HTMLElement).scrollTop).toBe(0)
  })
})

describe('motion', () => {
  const figs = (
    <>
      <div className="tlv-big">€12,000</div>
      <b className="wi-val">2031</b>
      <div className="ro live">
        <div className="orbit">
          <i className="o" />
          <i className="o" />
        </div>
      </div>
      <div className="fnd2" />
    </>
  )
  it('normal motion: enter replays per screen, figures count up from 0, years stay still, fnd tiles wait for view', () => {
    const frames: FrameRequestCallback[] = []
    vi.stubGlobal('requestAnimationFrame', (f: FrameRequestCallback) => frames.push(f))
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    )
    render(<Host k="A">{figs}</Host>)
    expect(document.getElementById('screen')!.classList.contains('enter')).toBe(true)
    frames.shift()!(performance.now())
    expect(document.querySelector('.tlv-big')!.textContent).not.toBe('€12,000')
    expect(document.querySelector('.wi-val')!.textContent).toBe('2031')
    expect(document.querySelector('.fnd2')!.className).toBe('fnd2 pre')
    frames.forEach((f) => f(performance.now() + 1000))
    expect(document.querySelector('.tlv-big')!.textContent).toBe('€12,000')
  })
  it('reduced motion: no count, orbit placed once, fnd tiles shown at once', () => {
    const raf = vi.fn()
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    vi.stubGlobal('requestAnimationFrame', raf)
    render(<Host k="A">{figs}</Host>)
    expect(raf).not.toHaveBeenCalled()
    expect(document.querySelector('.tlv-big')!.textContent).toBe('€12,000')
    expect(document.querySelector('.fnd2')!.classList.contains('seen')).toBe(true)
    expect((document.querySelector('.o') as HTMLElement).style.transform).toBe(
      'translate3d(0.00px,-122.00px,0)',
    )
  })
})
