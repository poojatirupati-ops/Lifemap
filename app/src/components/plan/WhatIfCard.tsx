import { Fragment } from 'react'
import type { Goal, Plan } from '../../state/types.ts'
import GrowthSettings from './GrowthSettings.tsx'
import SavingControl from './SavingControl.tsx'
import WhatIfExtra from './WhatIfExtra.tsx'
import { changedGoals } from './saving.ts'
import { resetWhatIf, saveWhatIf } from './planActions.ts'
import type { Projection } from './useProjection.ts'

interface Props {
  goals: Goal[]
  whatIf: Plan['wi']
  base: Projection
  withWhatIf: Projection
}

/** How the what-if changes each goal's covered percent. */
function outcome({ goals, whatIf, base, withWhatIf }: Props) {
  if (!whatIf.m && !whatIf.l) return 'Move the sliders to see what changes.'
  const changes = changedGoals(goals, base.percent, withWhatIf.percent)
  if (!changes.length)
    return 'No change to your goals. Everything that could be covered already is.'
  return changes.map(({ goal, before, after }, index) => (
    <Fragment key={goal.id}>
      {index > 0 && <br />}
      <b>{goal.name}</b> goes from {before}% to <b>{after}%</b>
    </Fragment>
  ))
}

/** What if…? Your saving today, an extra amount for one goal, growth settings, save or reset. */
export default function WhatIfCard(props: Props) {
  const { saving } = props.base
  return (
    <div className="card" id="r-wi">
      <h3 className="h">What if…?</h3>
      <p className="small" style={{ margin: '0 0 10px' }}>
        Try saving a bit more or less, or adding a one-off amount.
      </p>
      <div className="wisec" id="wi-base">
        <h4 className="wih">Your monthly saving</h4>
        <p className="small" style={{ margin: '0 0 2px' }}>
          What you save now. Change it here, or leave it.
        </p>
        <SavingControl saving={saving} />
      </div>
      <WhatIfExtra saving={saving.savingMonthly} spare={saving.spareMonthly} />
      <div className="wi-out" id="wi-out" aria-live="polite">
        {outcome(props)}
      </div>
      <GrowthSettings />
      <div className="grid2" style={{ marginTop: 12 }}>
        <button className="btn sm" style={{ width: '100%' }} data-a="wisave" onClick={saveWhatIf}>
          Save this plan
        </button>
        <button
          className="btn sm ghost"
          style={{ width: '100%' }}
          data-a="wireset"
          onClick={resetWhatIf}
        >
          Back to my plan
        </button>
      </div>
    </div>
  )
}
