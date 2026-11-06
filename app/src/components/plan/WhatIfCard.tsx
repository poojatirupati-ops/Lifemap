import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react'
import { discoverQuestion } from '../../domain/discovery/questions.data.ts'
import {
  changedGoals,
  EXTRA_MAX,
  EXTRA_MIN,
  STEP,
  suggestedSaving,
  whatIfTotal,
} from '../../domain/planning/saving.ts'
import type { Projection } from '../../hooks/useProjection.ts'
import { euro, readNumber } from '../../lib/format.ts'
import { useStore } from '../../state/store.ts'
import type { Goal, Plan } from '../../state/types.ts'
import InflationChoice from '../finance/InflationChoice.tsx'
import GrowthSetToggle from '../me/GrowthSetToggle.tsx'
import Emo from '../ui/Emo.tsx'

interface Props {
  goals: Goal[]
  whatIf: Plan['whatIf']
  base: Projection
  withWhatIf: Projection
}

interface MoneyBoxProps {
  /** data-nb, e.g. "wi|m": the hint beside it is nh-wi-m. */
  name: string
  id?: string
  labelledBy: string
  value: number
  min: number
  max: number
  /** What the hint says when the typed amount is over max (default "Max €…"). */
  maxMessage?: string
  /** Show + before amounts above zero. */
  signed?: boolean
  onValue: (amount: number) => void
  onHint: (hint: string) => void
}

const shown = (amount: number, signed?: boolean) =>
  (signed && amount > 0 ? '+' : '') + Math.round(amount).toLocaleString('en-IE')
const width = (text: string) => `${Math.max(2, text.length) + 0.6}ch`

/** The original's € .nbox: typed amounts apply as you type, kept between min and max. */
function MoneyBox(props: MoneyBoxProps) {
  const { name, id, labelledBy, value, min, max, maxMessage, signed, onValue, onHint } = props
  const input = useRef<HTMLInputElement>(null)

  // the −/+ buttons and sliders change the amount: show it unless the customer is typing here
  useEffect(() => {
    const box = input.current
    if (!box || document.activeElement === box) return
    box.value = shown(value, signed)
    box.style.width = width(box.value)
  }, [value, signed])

  function commit(box: HTMLInputElement, final: boolean) {
    const typed = readNumber(box.value)
    if (typed == null) {
      if (final) box.value = shown(value, signed)
      return
    }
    const amount = Math.min(max, Math.max(min, typed))
    if (typed > max) onHint(maxMessage ?? `Max ${euro(max)}`)
    else if (typed < min) onHint(`Min ${euro(min)}`)
    else onHint('')
    onValue(amount)
    if (final) {
      box.value = shown(amount, signed)
      box.style.width = width(box.value)
    }
  }

  return (
    <span className="nbox">
      <span className="nbu" aria-hidden="true">
        €
      </span>
      <input
        ref={input}
        className="nb"
        id={id}
        type="text"
        inputMode="numeric"
        style={{ width: width(shown(value, signed)) }}
        data-nb={name}
        defaultValue={shown(value, signed)}
        aria-labelledby={labelledBy}
        autoComplete="off"
        enterKeyHint="done"
        onInput={(event) => {
          event.currentTarget.style.width = width(event.currentTarget.value)
          commit(event.currentTarget, false)
        }}
        onBlur={(event) => commit(event.currentTarget, true)}
        onKeyDown={(event) => {
          if (event.key !== 'Enter') return
          event.preventDefault()
          commit(event.currentTarget, true)
        }}
      />
    </span>
  )
}

/** An amount between − and + buttons that move it by €25; `action` is their data-a. */
function StepRow(props: {
  action: string
  lessLabel: string
  moreLabel: string
  onStep: (change: number) => void
  children: ReactNode
}) {
  const { action, onStep } = props
  return (
    <div className="wi-row">
      <button
        className="rb"
        data-a={action}
        data-p={-STEP}
        aria-label={props.lessLabel}
        onClick={() => onStep(-STEP)}
      >
        −
      </button>
      <div className="wi-val">{props.children}</div>
      <button
        className="rb"
        data-a={action}
        data-p={STEP}
        aria-label={props.moreLabel}
        onClick={() => onStep(STEP)}
      >
        +
      </button>
    </div>
  )
}

/** Where the saving comes from: the spare-money cap, their own choice, or their Q6 answer. */
function savingSource(capped: boolean, chosen: boolean, answer: number | undefined) {
  if (capped) return "That's all of your spare money each month, so we can't count more than this. "
  if (chosen) return 'Your choice. '
  const option = answer == null ? undefined : discoverQuestion('6')?.options[answer]
  return `From your answer${option ? ` "${option.text}"` : ''}. `
}

/** "Your saving today": −/+ in €25 steps or typed, capped at the spare money; plus the save-more tip. */
function SavingControl({ saving }: { saving: Projection['saving'] }) {
  const chosen = useStore((store) => store.plan.monthlySaving)
  const capped = useStore((store) => store.plan.savingCapped)
  const answer = useStore((store) => store.plan.answers['6'])
  const stepSavingBy = useStore((store) => store.stepSavingBy)
  const typeSaving = useStore((store) => store.typeSaving)
  const resetSaving = useStore((store) => store.resetSaving)
  const [hint, setHint] = useState('')
  const spare = saving.spareMonthly
  const current = chosen ?? saving.savingMonthly
  const suggestion = suggestedSaving(saving.savingMonthly, current, spare)

  return (
    <>
      <div className="field" style={{ margin: '12px 0 4px' }} id="r-save">
        <span className="flabel" id="sv-l">
          Your saving today
        </span>
        <StepRow
          action="savem"
          lessLabel="Save 25 euro less a month"
          moreLabel="Save 25 euro more a month"
          onStep={stepSavingBy}
        >
          <MoneyBox
            name="save|m"
            labelledBy="sv-l"
            value={saving.savingMonthly}
            min={0}
            max={Math.max(0, spare)}
            maxMessage="That's all your spare money each month"
            onValue={typeSaving}
            onHint={setHint}
          />
          <span className="small" style={{ marginLeft: 4 }}>
            a month
          </span>
        </StepRow>
        <span className="small">
          {savingSource(capped, chosen != null, answer)}Your spare money is about {euro(spare)} a
          month; the rest is assumed spent.
          {chosen == null ? null : (
            <>
              {' '}
              <button
                className="link"
                style={{ fontSize: 12.5, padding: 0 }}
                data-a="savereset"
                onClick={resetSaving}
              >
                Use my answer
              </button>
            </>
          )}
        </span>
        <span className="nbhint" id="nh-save-m" role="status" aria-live="polite">
          {hint}
        </span>
      </div>
      {suggestion == null ? null : (
        <p className="small" id="r-savenudge" style={{ margin: '6px 0 0' }}>
          💡 You may be able to save more than you said: your spare money is about {euro(spare)} a
          month.{' '}
          <button
            className="link"
            style={{ fontSize: 12.5, padding: 0 }}
            data-a="savem"
            data-p={suggestion - current}
            onClick={() => stepSavingBy(suggestion - current)}
          >
            Try {euro(suggestion)} a month
          </button>{' '}
          to see what changes.
        </p>
      )}
    </>
  )
}

function extraHint(extra: number, goal: Goal | undefined) {
  if (extra < 0) return 'Saving less each month (affects your whole plan)'
  if (extra === 0) return '−€500 to +€1,000 a month'
  const retire = goal?.kind === 'retire' ? ' (counted as retirement saving)' : ' until it happens'
  return `Extra each month towards ${goal ? goal.name.toLowerCase() : 'your goal'}${retire}`
}

/** "Try an extra amount": the goal, an extra each month, a one-off amount and the live total. */
function WhatIfExtra({ saving, spare }: { saving: number; spare: number }) {
  const goals = useStore((store) => store.plan.goals)
  const { goalId, monthlyExtra: extra, lumpSum } = useStore((store) => store.plan.whatIf)
  const pickWhatIfGoal = useStore((store) => store.pickWhatIfGoal)
  const stepExtra = useStore((store) => store.stepExtra)
  const setExtra = useStore((store) => store.setExtra)
  const setLumpSum = useStore((store) => store.setLumpSum)
  const [monthlyHint, setMonthlyHint] = useState('')
  const [lumpHint, setLumpHint] = useState('')
  const goal = goals.find((each) => each.id === goalId)
  // the live line: saving today plus the extra, warning when that is more than is spare
  const live = whatIfTotal(saving, spare, extra)

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
              <Emo>{`${each.emoji} ${each.name}`}</Emo>
            </button>
          ))}
      </div>
      <div className="field" style={{ margin: '14px 0 6px' }}>
        <span className="flabel" id="wim-l">
          Extra each month
        </span>
        <StepRow action="wim" lessLabel="25 euro less" moreLabel="25 euro more" onStep={stepExtra}>
          <MoneyBox
            name="wi|m"
            id="wim-v"
            labelledBy="wim-l"
            value={extra}
            min={EXTRA_MIN}
            max={EXTRA_MAX}
            signed
            onValue={setExtra}
            onHint={setMonthlyHint}
          />
        </StepRow>
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
          {monthlyHint}
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
            onHint={setLumpHint}
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
          {lumpHint}
        </span>
        <span className="small">Once, e.g. from savings or a bonus</span>
      </div>
      <div
        className={live.over ? 'wi-live over' : 'wi-live'}
        id="wi-live"
        role="status"
        aria-live="polite"
      >
        {extra === 0 ? (
          <>
            Your saving today is <b>{euro(saving)} a month</b> · spare money about{' '}
            {euro(live.spare)}. Add an extra amount to see what changes.
          </>
        ) : (
          <>
            With this what-if you'd save <b>{euro(live.total)} a month</b> ({euro(saving)}
            {extra > 0 ? ` + ${euro(extra)} extra` : ` − ${euro(-extra)} less`}) · spare money about{' '}
            {euro(live.spare)}
          </>
        )}
        {live.over && (
          <span className="wn">
            ⚠️ That's more than your spare money of about {euro(live.spare)} a month. It may only
            work if you cut back elsewhere.
          </span>
        )}
      </div>
    </div>
  )
}

/** How the what-if changes each goal's covered percent. */
function outcome({ goals, whatIf, base, withWhatIf }: Props) {
  if (!whatIf.monthlyExtra && !whatIf.lumpSum) return 'Move the sliders to see what changes.'
  const changes = changedGoals(goals, base.percent, withWhatIf.percent)
  if (!changes.length)
    return 'No change to your goals. Everything that could be covered already is.'
  return changes.map(({ goal, before, after }, index) => (
    <Fragment key={goal.id}>
      {index > 0 ? <br /> : null}
      <b>{goal.name}</b> goes from {before}% to <b>{after}%</b>
    </Fragment>
  ))
}

/** What if…? Your saving today, an extra amount for one goal, growth settings, save or reset. */
export default function WhatIfCard(props: Props) {
  const { saving } = props.base
  const saveWhatIf = useStore((store) => store.saveWhatIf)
  const resetWhatIf = useStore((store) => store.resetWhatIf)
  const openMe = useStore((store) => store.openMe)
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
      <details
        className="card asmg wigrow"
        data-g="wi-grow"
        style={{ margin: '12px 0 0', boxShadow: 'none', border: '1.5px solid #D5E0EA' }}
      >
        <summary style={{ cursor: 'pointer', fontWeight: 800, minHeight: 44 }}>
          Growth and inflation settings
        </summary>
        <div style={{ marginTop: 8 }}>
          <div className="fl" style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
            Growth assumptions
          </div>
          <GrowthSetToggle />
          <div style={{ height: 10 }}></div>
          <InflationChoice place="wi" />
          <p className="small" style={{ margin: '8px 0 0' }}>
            <button
              className="link"
              style={{ padding: 0, fontSize: 13 }}
              data-a="asmopen"
              onClick={() => openMe('asm')}
            >
              Your assumptions
            </button>{' '}
            · prices, growth, retirement and emergency fund settings
          </p>
        </div>
      </details>
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
