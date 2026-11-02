import type { ReactNode } from 'react'
import { useStore } from '../../state/store.ts'
import { toast } from '../../state/shell.ts'
import Emo from '../ui/Emo.tsx'
import BrandBar from './BrandBar.tsx'
import PbBar from './PbBar.tsx'
import TitleBlock from './TitleBlock.tsx'
import { planBuilderStep } from '../../domain/journey/planBuilderSteps.ts'
import { loadedTenant } from '../../shell/tenant.ts'

interface Props {
  /** The eyebrow above the title; "Step ..." eyebrows are left out. */
  eye?: string
  title: ReactNode
  sub?: ReactNode
  back?: () => void
}

function leavePlanBuilder() {
  useStore.getState().leavePlanBuilder()
  toast('Saved. Carry on any time from My Plan')
}

/**
 * The head of a journey screen. Inside the plan builder (My Plan tab, before the app) it is the
 * slim progress row; elsewhere it is the brand bar and an eyebrow.
 * Hook-free: return FlowHead({...}) from a Head.
 */
export default function FlowHead({ eye, title, sub, back }: Props) {
  const { plan, screen, inShell, tab, openAsk } = useStore.getState()
  const inPlanBuilder = !plan.hasResults && inShell && tab === 'plan'
  // TODO(R-05): callers still pass "Step ..." eyebrows; drop this check once they stop.
  const eyebrow = eye && !eye.startsWith('Step ') ? <Emo>{eye}</Emo> : null

  if (inPlanBuilder) {
    return (
      <>
        <div className="pbrow">
          {/* No tab bar in the builder, so Back always offers a way out. */}
          <button className="pbback" aria-label="Back" onClick={back ?? leavePlanBuilder}>
            ‹
          </button>
          <PbBar />
          <span className="pbn" aria-hidden="true">
            {planBuilderStep(screen)}/8
          </span>
          {loadedTenant()?.features.ask !== false && (
            <button
              className="pbask"
              aria-label="Ask: help and plain-English explanations"
              onClick={openAsk}
            >
              ?
            </button>
          )}
        </div>
        <TitleBlock title={title} sub={sub} />
      </>
    )
  }

  return (
    <>
      {BrandBar({ back })}
      <div className="eyebrow" style={{ marginTop: 8 }}>
        {eyebrow}
      </div>
      <TitleBlock title={title} sub={sub} />
    </>
  )
}
