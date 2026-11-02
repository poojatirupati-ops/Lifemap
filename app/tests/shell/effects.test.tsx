// @vitest-environment jsdom
import { useRef, type ReactNode } from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useStore } from '../../src/state/store.ts'
import { fresh } from '../../src/state/fresh.ts'
import { useCountUp } from '../../src/hooks/useCountUp.ts'
import { useFndWatch } from '../../src/hooks/useFndWatch.ts'
import { useOrbit } from '../../src/hooks/useOrbit.ts'
import { useScrollKeep } from '../../src/hooks/useScrollKeep.ts'
import { useFocusReturn } from '../../src/hooks/useFocusReturn.ts'
import SheetFrame from '../../src/components/ui/SheetFrame.tsx'

function Host({ screenKey, children }: { screenKey: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useCountUp(ref, screenKey)
  useFndWatch(ref, screenKey)
  useOrbit(ref, screenKey)
  useScrollKeep(ref, screenKey)
  useFocusReturn(ref, screenKey)
  return (
    <div id="screen" ref={ref}>
      {children}
    </div>
  )
}

/** A sheet as SheetHost mounts it: Ask is a chat with no field. */
function Sheet({ name }: { name: string }) {
  const closeSheet = useStore((store) => store.closeSheet)
  return (
    <SheetFrame chat={name === 'ask'} onClose={closeSheet}>
      <h2 id="sheet-t" tabIndex={-1}>
        Sheet
      </h2>
      {name === 'ask' ? null : (
        <>
          <input id="field" />
          <button className="btn" id="go">
            Go
          </button>
        </>
      )}
    </SheetFrame>
  )
}

function Page({ title, opener = true }: { title: string; opener?: boolean }) {
  const sheet = useStore((store) => store.sheet)
  return (
    <>
      <h2 tabIndex={-1}>{title}</h2>
      <input id="in" />
      {opener ? <button id="opener">open</button> : null}
      {sheet ? <Sheet name={sheet} /> : null}
    </>
  )
}

const view = (screenKey: string, opener?: boolean) => (
  <Host screenKey={screenKey}>
    <Page title={screenKey} opener={opener} />
  </Host>
)
const focusedId = () => document.activeElement?.id || document.activeElement?.textContent
const focus = (id: string) => act(() => document.getElementById(id)!.focus())
const openSheet = (name: string) => act(() => useStore.getState().openSheet(name))
// Radix hands focus back on a timer after the dialog unmounts.
const afterClose = () => act(() => new Promise((done) => setTimeout(done, 0)))

beforeEach(() => useStore.setState({ plan: fresh(), screen: 'D0', sheet: null }))
afterEach(() => vi.unstubAllGlobals())

describe('focus', () => {
  it('a new screen focuses its h2; a focused #screen input keeps focus; a re-render leaves focus alone', () => {
    const screen = render(view('A'))
    expect(focusedId()).toBe('A')
    focus('in')
    screen.rerender(view('B'))
    expect(focusedId()).toBe('in')
    focus('opener')
    screen.rerender(view('B'))
    expect(focusedId()).toBe('opener')
  })

  it.each([
    ['x', 'field'],
    ['ask', 'sheet-t'],
  ])('sheet %s opens on its first field, Ask on its title', (name, want) => {
    render(view('A'))
    openSheet(name)
    expect(focusedId()).toBe(want)
  })

  it('Escape closes the sheet and focus returns to the control that opened it', async () => {
    render(view('A'))
    focus('opener')
    openSheet('x')
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' })
    await afterClose()
    expect(useStore.getState().sheet).toBeNull()
    expect(focusedId()).toBe('opener')
  })

  it('a sheet whose opener is gone hands focus to the screen title, never the body', async () => {
    const screen = render(view('A'))
    focus('opener')
    openSheet('x')
    act(() => useStore.getState().closeSheet())
    screen.rerender(view('A', false))
    await afterClose()
    expect(focusedId()).toBe('A')
  })

  it('Tab wraps inside an open sheet', () => {
    render(view('A'))
    openSheet('x')
    const sheet = document.querySelector('.sheet')!
    focus('go')
    fireEvent.keyDown(sheet, { key: 'Tab' })
    expect(document.activeElement?.className).toBe('sx')
    fireEvent.keyDown(sheet, { key: 'Tab', shiftKey: true })
    expect(focusedId()).toBe('go')
  })
})

describe('scroll keep', () => {
  it("same screen restores the reader's place even if the scroller is re-created; a new screen starts at the top", () => {
    const r = render(
      <Host screenKey="A">
        <div className="scroll" key="1">
          x
        </div>
      </Host>,
    )
    const sc = document.querySelector('.scroll') as HTMLElement
    sc.scrollTop = 240
    fireEvent.scroll(sc)
    r.rerender(
      <Host screenKey="A">
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
      <Host screenKey="B">
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
  it('normal motion: figures count up from 0, years stay still, fnd tiles wait for view', () => {
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
    render(<Host screenKey="A">{figs}</Host>)
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
    render(<Host screenKey="A">{figs}</Host>)
    expect(raf).not.toHaveBeenCalled()
    expect(document.querySelector('.tlv-big')!.textContent).toBe('€12,000')
    expect(document.querySelector('.fnd2')!.classList.contains('seen')).toBe(true)
    expect((document.querySelector('.o') as HTMLElement).style.transform).toBe(
      'translate3d(0.00px,-122.00px,0)',
    )
  })
})
