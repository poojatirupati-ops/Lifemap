import { use, type ReactNode } from 'react'
import { useLocation } from '@tanstack/react-router'
import { useStore } from '../../state/store.ts'
import { toast } from '../../state/shell.ts'
import Screen, { Area } from '../../shell/Screen.tsx'
import Emo from '../ui/Emo.tsx'
import BrandBar from './BrandBar.tsx'
import PbBar from './PbBar.tsx'
import TitleBlock from './TitleBlock.tsx'
import { planBuilderStep } from '../../domain/journey/planBuilderSteps.ts'
import { useFeature } from '../../shell/tenant.ts'

interface Props {
  id: string
  note: string
  /** The eyebrow above the title; "Step ..." eyebrows are left out. */
  eye?: string
  title: ReactNode
  sub?: ReactNode
  back?: () => void
  foot?: ReactNode
  children: ReactNode
}

function leavePlanBuilder() {
  useStore.getState().leavePlanBuilder()
  toast('Saved. Carry on any time from My Plan')
}

/** The plan builder's slim progress row, pinned at the top; `step` is 1 to 8. */
export function PbRow({ back, step }: { back?: () => void; step: number }) {
  const { openAsk } = useStore.getState()
  const ask = useFeature('ask')
  return (
    <div className="pbrow">
      {/* No tab bar in the builder, so Back always offers a way out. */}
      <button className="pbback" aria-label="Back" onClick={back ?? leavePlanBuilder}>
        ‹
      </button>
      <PbBar current={step} />
      <span className="pbn" aria-hidden="true">
        {step}/8
      </span>
      {ask && (
        <button
          className="pbask"
          aria-label="Ask: help and plain-English explanations"
          onClick={openAsk}
        >
          ?
        </button>
      )}
    </div>
  )
}

/**
 * A journey screen. Inside the plan builder its head is the slim progress row; elsewhere it is the
 * brand bar and an eyebrow.
 */
export default function FlowScreen({ eye, title, sub, back, ...screen }: Props) {
  const step = planBuilderStep(useLocation({ select: (location) => location.pathname }))
  if (use(Area) === 'build')
    return (
      <Screen
        {...screen}
        bar={<PbRow back={back} step={step} />}
        head={<TitleBlock title={title} sub={sub} />}
      />
    )
  return <Screen {...screen} head={<FlowHead eye={eye} title={title} sub={sub} back={back} />} />
}

/** A journey screen's head outside the plan builder: the brand bar, an eyebrow ("Step ..." ones are left out) and the title. */
export function FlowHead({ eye, title, sub, back }: Pick<Props, 'eye' | 'title' | 'sub' | 'back'>) {
  return (
    <>
      <BrandBar back={back} />
      <div className="eyebrow" style={{ marginTop: 8 }}>
        {eye && !eye.startsWith('Step ') ? <Emo>{eye}</Emo> : null}
      </div>
      <TitleBlock title={title} sub={sub} />
    </>
  )
}
