import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { cushion as readCushion } from '../../domain/discovery/cushion.ts'
import { answerTag, moneyTerms } from '../../domain/discovery/moneyTerms.ts'
import { suggestedHorizonFor } from '../../domain/discovery/profile.ts'
import { APPETITE_QUESTION, SURPRISE_QUESTION } from '../../domain/discovery/questions.data.ts'
import { riskRead } from '../../domain/discovery/riskRead.ts'
import { PROFILE_SECTIONS, TERMS } from '../../domain/discovery/terms.data.ts'
import {
  DISCOVERY_DISCLAIMER,
  type PersonalityType,
} from '../../domain/identity/personality.data.ts'
import { useProfileAnswers } from '../../hooks/useProfileAnswers.ts'
import { useStore } from '../../state/store.ts'
import ColumnFoot from './ColumnFoot.tsx'
import PersonalityCard from './PersonalityCard.tsx'

const figure: CSSProperties = { display: 'block', fontSize: 19, marginTop: 4 }
const termTag: CSSProperties = { color: 'var(--storm-t)', fontWeight: 800 }

/** The money personality, risk appetite and cushion, the customer's terms and at most one hint. */
export default function PersonalityReveal({ type }: { type: PersonalityType }) {
  const answers = useProfileAnswers()
  const cushion = useStore(useShallow(({ plan }) => readCushion(plan)))
  const horizon = useStore(({ plan }) => suggestedHorizonFor(plan))
  const hasEmergencyFund = useStore(
    ({ plan }) => !!plan.safetyWanted || plan.goals.some((goal) => goal.key === 'safety'),
  )
  const { backFromReveal, finishOnboarding, wantEmergencyFund } = useStore.getState()
  const read = riskRead(answers, { complete: false, cushion, suggestedHorizon: horizon })
  const appetiteTerm = answerTag(answers.discover, APPETITE_QUESTION)
  const surpriseTerm = answerTag(answers.discover, SURPRISE_QUESTION)

  // past the photo the top bar turns frosted (.dscrolled on the quiz frame)
  const page = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)
  useLayoutEffect(() => {
    const frame = page.current?.closest('.quiz')
    frame?.classList.toggle('dscrolled', scrolled)
    return () => frame?.classList.remove('dscrolled')
  }, [scrolled])

  return (
    <>
      <div className="qtop dtop">
        <button className="dcirc" aria-label="Back to the questions" onClick={backFromReveal}>
          ‹
        </button>
        <span className="dtitle">Your money personality</span>
        <span className="dcirc" aria-hidden="true" style={{ visibility: 'hidden' }} />
      </div>
      <div
        className="qbody dpage"
        ref={page}
        onScroll={(event) => setScrolled(event.currentTarget.scrollTop > 140)}
      >
        <div
          className="dhero"
          aria-hidden="true"
          style={{
            backgroundImage: type.photo ? `url(${type.photo})` : 'var(--cover-photo)',
            backgroundPosition: 'center 40%',
          }}
        />
        <PersonalityCard type={type} />
        <div className="grid2 drstats">
          <div className="panel" style={{ margin: 0 }}>
            <span className="drsic" aria-hidden="true">
              🌦️
            </span>
            <span className="small">
              <b>Risk appetite</b>
              <br />
              how much risk you want
            </span>
            <b style={figure}>{read.comfort || '—'}</b>
            {appetiteTerm && appetiteTerm !== read.comfort ? (
              <span className="small" style={termTag}>
                ◆ {appetiteTerm}
              </span>
            ) : null}
          </div>
          <div className="panel" style={{ margin: 0 }}>
            <span className="drsic pe" aria-hidden="true">
              🛟
            </span>
            <span className="small">
              <b>Cushion</b>
              <br />
              money for surprises
            </span>
            <b style={figure}>{read.cushion || '—'}</b>
            {cushion.hasFigures ? (
              <span className="small" style={{ display: 'block' }}>
                {cushion.months} of {cushion.targetMonths} months (your figures)
              </span>
            ) : null}
            {surpriseTerm ? (
              <span className="small" style={termTag}>
                ◆ {surpriseTerm}
                {cushion.hasFigures ? '' : ' (your answer)'}
              </span>
            ) : null}
          </div>
        </div>
        {read.cushionNote ? (
          <p className="small" style={{ margin: '8px 2px 0' }}>
            {read.cushionNote}
          </p>
        ) : null}
        <div className="panel" style={{ marginTop: 12 }}>
          <div className="qeye">Your money terms</div>
          <p className="small" style={{ margin: '4px 0 0' }}>
            The words an adviser would use, and what they mean for you.
          </p>
          {moneyTerms(answers).map(({ section, terms }) => (
            <div key={section} className="tsec">
              <div className="tsec-h">
                <span className="tsec-ic" aria-hidden="true">
                  {PROFILE_SECTIONS[section].icon}
                </span>
                <span className="small" style={{ color: 'var(--ink)' }}>
                  <b>{PROFILE_SECTIONS[section].title}:</b> {PROFILE_SECTIONS[section].plain}
                </span>
              </div>
              {terms.map((term) => (
                <div key={term} className="term">
                  <span className="tg">◆ {term}</span>
                  <span className="tm">{TERMS[term] ?? ''}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        {read.mismatch ? (
          <div className="panel">
            <div className="qeye" style={{ color: 'var(--sea-d)' }}>
              You might notice…
            </div>
            <p style={{ margin: '6px 0 0', fontSize: 15, lineHeight: 1.5 }}>{read.mismatch}</p>
            {!read.cushion || read.cushion === 'In place' ? null : hasEmergencyFund ? (
              <p className="small" style={{ margin: '8px 0 0', fontWeight: 700 }}>
                ✓ An Emergency fund is in your goals. It's optional: you can remove it in My Plan.
              </p>
            ) : (
              <button className="btn ghost" style={{ marginTop: 10 }} onClick={wantEmergencyFund}>
                Add an Emergency fund goal
              </button>
            )}
          </div>
        ) : null}
        <p className="disc">A first read from 6 answers, not advice. {DISCOVERY_DISCLAIMER}</p>
      </div>
      <ColumnFoot>
        <p className="fnote">Get a more accurate picture</p>
        <button className="wbtn" onClick={finishOnboarding}>
          Continue
        </button>
      </ColumnFoot>
    </>
  )
}
