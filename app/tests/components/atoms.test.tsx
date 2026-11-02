import type { ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it } from 'vitest'
import { runOriginal } from '../golden/origSlice.ts'
import { fresh } from '../../src/state/fresh.ts'
import { useStore } from '../../src/state/store.ts'
import type { Plan } from '../../src/state/types.ts'
import financesPartial from '../fixtures/finances-partial.json'
import AppHead from '../../src/components/frame/AppHead.tsx'
import Brand from '../../src/components/frame/Brand.tsx'
import BrandBar from '../../src/components/frame/BrandBar.tsx'
import FlowHead from '../../src/components/frame/FlowHead.tsx'
import HdrBar from '../../src/components/frame/HdrBar.tsx'
import PbBar from '../../src/components/frame/PbBar.tsx'
import GateNote from '../../src/components/ui/GateNote.tsx'
import SheetFrame from '../../src/components/ui/SheetFrame.tsx'

const original = runOriginal(
  'brand2, brandBar, hdrBar, appHead, flowHead, pbBar, gateHTML, planMissing, sheetHTML, fresh',
)

/** Puts the same plan and screen into both apps. */
function setBoth(patch: Partial<Plan>, screen = 'D0') {
  const plan = { ...fresh(), ...patch }
  useStore.getState().load({ ...plan, screen: screen })
  // Static rendering reads the store's initial state object (zustand's hook closes over it, so a
  // spy on useStore.getInitialState is never called); copy the state each test sets into it.
  Object.assign(useStore.getInitialState(), useStore.getState())
  original.setState({ ...original.fresh(), ...patch, scr: screen })
}

/** The original's markup without its data-a dispatcher attributes. */
const withoutActions = (html: string) => html.replace(/ data-[ap]="[^"]*"/g, '')
/** Sorts each tag's attributes: attribute order does not change the DOM. */
const sortAttributes = (html: string) =>
  html.replace(/<(\w+)((?:\s[\w:-]+(?:="[^"]*")?)*)\s*(\/?)>/g, (_, tag, attrs, close) => {
    const sorted = (attrs.match(/[\w:-]+(?:="[^"]*")?/g) ?? []).toSorted()
    return `<${[tag, ...sorted].join(' ')}${close}>`
  })
/**
 * React escapes & in attributes and closes empty SVG shapes with a tag; the browser parses both
 * spellings to the same DOM.
 */
const sameDom = (html: string) =>
  sortAttributes(html.replaceAll('&amp;', '&').replace(/><\/(path|circle|rect)>/g, '/>'))
const markup = (element: ReactElement) => sameDom(renderToStaticMarkup(element))
const back = () => {}

beforeEach(() => setBoth({}))

describe('frame atoms match the original markup', () => {
  it('Brand and BrandBar', () => {
    expect(markup(<Brand />)).toBe(sameDom(original.brand2()))
    expect(markup(<BrandBar />)).toBe(sameDom(original.brandBar()))
    expect(markup(<BrandBar back={back} />)).toBe(
      sameDom(withoutActions(original.brandBar('go|D0'))),
    )
  })

  it('HdrBar and AppHead, with and without the bell', () => {
    expect(markup(<HdrBar />)).toBe(sameDom(withoutActions(original.hdrBar())))
    expect(markup(<>{AppHead({ title: 'Home', sub: 'Hello', back })}</>)).toBe(
      sameDom(withoutActions(original.appHead('Home', 'Hello', 'go|D0'))),
    )
    setBoth({ ...financesPartial, hasResults: true } as Partial<Plan>)
    const needsLook = original.hdrBar().match(/class="badge" aria-hidden="true">(\d+)/)?.[1]
    expect(needsLook).toBeDefined()
    expect(markup(<HdrBar needsLook={Number(needsLook)} />)).toBe(
      sameDom(withoutActions(original.hdrBar())),
    )
  })

  it('FlowHead outside and inside the plan builder, and PbBar', () => {
    expect(markup(<>{FlowHead({ eye: 'Your goals', title: 'Pick', sub: 'Any' })}</>)).toBe(
      sameDom(original.flowHead(1, 'Your goals', 'Pick', 'Any')),
    )
    expect(markup(<>{FlowHead({ eye: 'Step 2', title: 'Pick' })}</>)).toBe(
      sameDom(original.flowHead(1, 'Step 2', 'Pick')),
    )
    for (const screen of ['B1', 'F1', 'F2', 'B4', 'P1', 'P2', 'P4', 'U1', 'X9']) {
      setBoth({ inShell: true, tab: 'plan', hasResults: false }, screen)
      expect(markup(<PbBar />)).toBe(sameDom(original.pbBar()))
      expect(markup(<>{FlowHead({ eye: 'Step 1', title: 'T', back })}</>)).toBe(
        sameDom(withoutActions(original.flowHead(1, 'Step 1', 'T', '', 'go|D0'))),
      )
    }
    const verified = { ...fresh().account, ev: true, sv: true }
    setBoth({ inShell: true, tab: 'plan', account: verified }, 'P2')
    expect(markup(<PbBar />)).toBe(sameDom(original.pbBar()))
  })

  it('GateNote', () => {
    const missing = original.planMissing().map((m: { k: string; t: string }) => ({
      key: m.k,
      label: m.t,
    }))
    expect(missing.length).toBeGreaterThan(0)
    expect(markup(<GateNote where="u1" missing={missing} onChoose={back} />)).toBe(
      sameDom(withoutActions(original.gateHTML('u1'))),
    )
    expect(markup(<GateNote where="u1" missing={[]} onChoose={back} />)).toBe('')
  })

  it('SheetFrame matches the original sheet shell', () => {
    original.getState().sheet = 'whyask'
    const body = original.sheetHTML('D0').match(/✕<\/button>([\s\S]*)<\/div><\/div>$/)[1]
    const ours = markup(
      <SheetFrame onClose={back}>
        <div dangerouslySetInnerHTML={{ __html: withoutActions(body) }} />
      </SheetFrame>,
    ).replace(/<div>([\s\S]*)<\/div><\/div><\/div>$/, '$1</div></div>')
    expect(ours).toBe(sameDom(withoutActions(original.sheetHTML('D0'))))
  })
})
