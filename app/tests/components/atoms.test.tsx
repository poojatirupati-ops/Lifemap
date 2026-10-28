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
  useStore.getState().load({ ...plan, scr: screen })
  original.setState({ ...original.fresh(), ...patch, scr: screen })
}

/** The original's markup without its data-a dispatcher attributes. */
const withoutActions = (html: string) => html.replace(/ data-[ap]="[^"]*"/g, '')
/** React escapes & in attributes; the browser parses both spellings to the same DOM. */
const markup = (element: ReactElement) => renderToStaticMarkup(element).replaceAll('&amp;', '&')
const back = () => {}

beforeEach(() => setBoth({}))

describe('frame atoms match the original markup', () => {
  it('Brand and BrandBar', () => {
    expect(markup(<Brand />)).toBe(original.brand2())
    expect(markup(<BrandBar />)).toBe(original.brandBar())
    expect(markup(<BrandBar back={back} />)).toBe(withoutActions(original.brandBar('go|D0')))
  })

  it('HdrBar and AppHead, with and without the bell', () => {
    expect(markup(<HdrBar />)).toBe(withoutActions(original.hdrBar()))
    expect(markup(<>{AppHead({ title: 'Home', sub: 'Hello', back })}</>)).toBe(
      withoutActions(original.appHead('Home', 'Hello', 'go|D0')),
    )
    setBoth({ ...financesPartial, app: true } as Partial<Plan>)
    const needsLook = original.hdrBar().match(/class="badge" aria-hidden="true">(\d+)/)?.[1]
    expect(needsLook).toBeDefined()
    expect(markup(<HdrBar needsLook={Number(needsLook)} />)).toBe(withoutActions(original.hdrBar()))
  })

  it('FlowHead outside and inside the plan builder, and PbBar', () => {
    expect(markup(<>{FlowHead({ eye: 'Your goals', title: 'Pick', sub: 'Any' })}</>)).toBe(
      original.flowHead(1, 'Your goals', 'Pick', 'Any'),
    )
    expect(markup(<>{FlowHead({ eye: 'Step 2', title: 'Pick' })}</>)).toBe(
      original.flowHead(1, 'Step 2', 'Pick'),
    )
    for (const screen of ['B1', 'F1', 'F2', 'B4', 'P1', 'P2', 'P4', 'U1', 'X9']) {
      setBoth({ shell: true, tab: 'plan', app: false }, screen)
      expect(markup(<PbBar />)).toBe(original.pbBar())
      expect(markup(<>{FlowHead({ eye: 'Step 1', title: 'T', back })}</>)).toBe(
        withoutActions(original.flowHead(1, 'Step 1', 'T', '', 'go|D0')),
      )
    }
    const verified = { ...fresh().acct, ev: true, sv: true }
    setBoth({ shell: true, tab: 'plan', acct: verified }, 'P2')
    expect(markup(<PbBar />)).toBe(original.pbBar())
  })

  it('GateNote', () => {
    const missing = original.planMissing().map((m: { k: string; t: string }) => ({
      key: m.k,
      label: m.t,
    }))
    expect(missing.length).toBeGreaterThan(0)
    expect(markup(<GateNote where="u1" missing={missing} onChoose={back} />)).toBe(
      withoutActions(original.gateHTML('u1')),
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
    expect(ours).toBe(withoutActions(original.sheetHTML('D0')))
  })
})
