import { useState } from 'react'
import { euro } from '../../lib/format.ts'
import { useStore } from '../../state/store.ts'
import type { Goal } from '../../state/types.ts'
import Emo from '../ui/Emo.tsx'
import MoneyBox from './MoneyBox.tsx'
import { STEP } from './saving.ts'
import WhatIfLive from './WhatIfLive.tsx'
import { pickWhatIfGoal, setExtra, setLumpSum, stepExtra } from './planActions.ts'

function extraHint(extra: number, goal: Goal | undefined) {
  if (extra < 0) return 'Saving less each month (affects your whole plan)'
  if (extra === 0) return '−€500 to +€1,000 a month'
  const retire = goal?.kind === 'retire' ? ' (counted as retirement saving)' : ' until it happens'
  return `Extra each month towards ${goal ? goal.name.toLowerCase() : 'your goal'}${retire}`
}

/** "Try an extra amount": the goal, an extra each month, a one-off amount and the live total. */
export default function WhatIfExtra({ saving, spare }: { saving: number; spare: number }) {
  const goals = useStore((store) => store.plan.goals)
  const { g: goalId, m: extra, l: lumpSum } = useStore((store) => store.plan.wi)
  const [hints, setHints] = useState({ m: '', l: '' })
  const goal = goals.find((each) => each.id === goalId)
  const hintFor = (key: 'm' | 'l') => (hint: string) =>
    setHints((shown) => ({ ...shown, [key]: hint }))

  return (
    <div className="wisec" id="wi-extra">
      <h4 className="wih" id="wi-extra-h">
        Try an extra amount for {goal ? goal.name.toLowerCase() : 'a goal'}
      </h4>
      <p className="small" style={{ margin: '0 0 8px' }}>
        This is on top of your saving above. It only changes the what-if.
      </p>
      <div className="fl" style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
        Put it towards
      </div>
      <div className="chips" role="group" aria-label="Goal for the what-if">
        {goals
          .toSorted((a, b) => a.age - b.age)
          .map((each) => (
            <button
              key={each.id}
              className={goalId === each.id ? 'chip sm sel' : 'chip sm'}
              aria-pressed={goalId === each.id}
              data-a="wig"
              data-p={each.id}
              onClick={() => pickWhatIfGoal(each.id)}
            >
              <Emo>{`${each.e} ${each.name}`}</Emo>
            </button>
          ))}
      </div>
      <div className="field" style={{ margin: '14px 0 6px' }}>
        <span className="flabel" id="wim-l">
          Extra each month
        </span>
        <div className="wi-row">
          <button
            className="rb"
            data-a="wim"
            data-p={-STEP}
            aria-label="25 euro less"
            onClick={() => stepExtra(-STEP)}
          >
            −
          </button>
          <div className="wi-val">
            <MoneyBox
              name="wi|m"
              id="wim-v"
              labelledBy="wim-l"
              value={extra}
              min={-5000}
              max={10000}
              signed
              onValue={setExtra}
              onHint={hintFor('m')}
            />
          </div>
          <button
            className="rb"
            data-a="wim"
            data-p={STEP}
            aria-label="25 euro more"
            onClick={() => stepExtra(STEP)}
          >
            +
          </button>
        </div>
        <input
          type="range"
          min={Math.min(-500, extra)}
          max={Math.max(1000, extra)}
          step={25}
          value={extra}
          data-wi="m"
          aria-labelledby="wim-l"
          aria-valuetext={euro(extra) + ' a month'}
          onChange={(event) => setExtra(+event.currentTarget.value)}
        />
        <span className="nbhint" id="nh-wi-m" role="status" aria-live="polite">
          {hints.m}
        </span>
        <span className="small" id="wim-h">
          {extraHint(extra, goal)}
        </span>
      </div>
      <div className="field" style={{ margin: '10px 0 0' }}>
        <div className="flabel">
          <span id="wil-l">One-off amount</span>
          <MoneyBox
            name="wi|l"
            id="wil-v"
            labelledBy="wil-l"
            value={lumpSum}
            min={0}
            max={2000000}
            onValue={setLumpSum}
            onHint={hintFor('l')}
          />
        </div>
        <input
          type="range"
          min={0}
          max={Math.max(50000, lumpSum)}
          step={500}
          value={lumpSum}
          data-wi="l"
          aria-labelledby="wil-l"
          aria-valuetext={euro(lumpSum)}
          onChange={(event) => setLumpSum(+event.currentTarget.value)}
        />
        <span className="nbhint" id="nh-wi-l" role="status" aria-live="polite">
          {hints.l}
        </span>
        <span className="small">Once, e.g. from savings or a bonus</span>
      </div>
      <WhatIfLive saving={saving} spare={spare} extra={extra} />
    </div>
  )
}
