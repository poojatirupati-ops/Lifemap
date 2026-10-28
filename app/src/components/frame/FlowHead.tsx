import type { ReactNode } from 'react'
import { useStore } from '../../state/store.ts'
import { rerender, toast } from '../../state/shell.ts'
import Emo from '../ui/Emo.tsx'
import BrandBar from './BrandBar.tsx'
import PbBar from './PbBar.tsx'
import { planBuilderStep } from './planBuilderSteps.ts'

interface Props {
  /** The eyebrow above the title; "Step ..." eyebrows are left out. */
  eye: string
  title: ReactNode
  sub?: ReactNode
  back?: () => void
}

function leavePlanBuilder() {
  useStore.getState().leavePlanBuilder()
  rerender()
  toast('Saved. Carry on any time from My Plan')
}

/**
 * The head of a journey screen. Inside the plan builder (My Plan tab, before the app) it is the slim
 * progress row; elsewhere it is the brand bar and an eyebrow. Hook-free: return FlowHead({...}) from a Head.
 */
export default function FlowHead({ eye, title, sub, back }: Props) {
  const { plan, screen, openAsk } = useStore.getState()
  const inPlanBuilder = !plan.app && plan.shell && plan.tab === 'plan'

  const titleAndSub = [
    <h2 key="t" className="t" tabIndex={-1}>
      {title}
    </h2>,
    sub && (
      <p key="sub" className="sub" style={{ margin: 0 }}>
        {sub}
      </p>
    ),
  ]

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
          <button
            className="pbask"
            aria-label="Ask: help and plain-English explanations"
            onClick={openAsk}
          >
            ?
          </button>
        </div>
        {titleAndSub}
      </>
    )
  }

  return (
    <>
      {BrandBar({ back })}
      <div className="eyebrow" style={{ marginTop: 8 }}>
        {eye.startsWith('Step ') ? '' : <Emo>{eye}</Emo>}
      </div>
      {titleAndSub}
    </>
  )
}
