import { useState } from 'react'
import { discoverQuestion } from '../../domain/discovery/questions.data.ts'
import { euro } from '../../lib/format.ts'
import { useStore } from '../../state/store.ts'
import MoneyBox from './MoneyBox.tsx'
import { STEP, suggestedSaving } from './saving.ts'
import { resetSaving, stepSavingBy, typeSaving } from './planActions.ts'
import type { Projection } from './useProjection.ts'

/** Where the saving comes from: the customer's note, their own choice, or their Q6 answer. */
function savingSource(note: string, chosen: boolean, answer: number | undefined) {
  if (note) return note
  if (chosen) return 'Your choice. '
  const option = answer == null ? undefined : discoverQuestion('6')?.options[answer]
  return `From your answer${option ? ` "${option.text}"` : ''}. `
}

/** "Your saving today": −/+ in €25 steps or typed, capped at the spare money; plus the save-more tip. */
export default function SavingControl({ saving }: { saving: Projection['saving'] }) {
  const chosen = useStore((store) => store.plan.saveM)
  const note = useStore((store) => store.plan.saveNote)
  const answer = useStore((store) => store.plan.ans['6'])
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
        <div className="wi-row">
          <button
            className="rb"
            data-a="savem"
            data-p={-STEP}
            aria-label="Save 25 euro less a month"
            onClick={() => stepSavingBy(-STEP)}
          >
            −
          </button>
          <div className="wi-val">
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
          </div>
          <button
            className="rb"
            data-a="savem"
            data-p={STEP}
            aria-label="Save 25 euro more a month"
            onClick={() => stepSavingBy(STEP)}
          >
            +
          </button>
        </div>
        <span className="small">
          {savingSource(note, chosen != null, answer)}Your spare money is about {euro(spare)} a
          month; the rest is assumed spent.
          {chosen != null && (
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
      {suggestion != null && (
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
