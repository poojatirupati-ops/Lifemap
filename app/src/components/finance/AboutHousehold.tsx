import { useShallow } from 'zustand/react/shallow'
import { creditsFor, type Household } from '../../domain/finances/credits.ts'
import { assumption } from '../../domain/planning/assumptions.ts'
import { useStore } from '../../state/store.ts'
import { setDependants, setPlanningWithPartner } from '../../state/about.ts'
import PartnerBlock from '../define/PartnerBlock.tsx'

const DEPENDANTS = ['0', '1', '2', '3+']

/** The tax credits that need a Yes, as chips; each shows only when it can apply. */
function CredChips() {
  const household = useStore(
    useShallow(({ plan }): Household => ({
      startYear: assumption(plan, 'startYear'),
      home: plan.figures.home,
      deps: plan.about.dependants,
      partner: plan.about.partner,
      married: plan.about.married,
    })),
  )
  const chosen = useStore(({ plan }) => plan.about.taxCredits)
  const credits = creditsFor(household)
  if (!credits.length) return null
  return (
    <div
      className="field"
      style={{ margin: '14px 0 0', borderTop: '1px dashed var(--line)', paddingTop: 12 }}
    >
      <span className="flabel" id="cred-l">
        Do any of these apply to you?{' '}
        <span className="small" style={{ fontWeight: 600 }}>
          Optional
        </span>
      </span>
      <div className="chips" role="group" aria-labelledby="cred-l">
        {credits.map(({ key, label }) => (
          <button
            key={key}
            className={chosen?.[key] ? 'chip sm sel' : 'chip sm'}
            aria-pressed={!!chosen?.[key]}
            data-a="cred"
            data-p={key}
            onClick={() => useStore.getState().toggleCredit(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <span className="small">{credits.map(({ detail }) => detail).join(' · ')}.</span>
    </div>
  )
}

/** About you: partner and dependants from the customer's answers, and the tax credits they open. */
export default function AboutHousehold() {
  const partner = useStore(({ plan }) => plan.about.partner)
  const deps = useStore(({ plan }) => plan.about.dependants)
  const fromAnswers = <span className="tag pre">From your answers</span>

  return (
    <div className="card">
      <div className="field">
        <span className="flabel">Planning with a partner? {fromAnswers}</span>
        <div
          className="seg"
          role="group"
          style={{ margin: 0 }}
          aria-label="Planning with a partner"
        >
          {['Yes', 'No'].map((answer) => {
            const on = (answer === 'Yes') === !!partner
            return (
              <button
                key={answer}
                className={on ? 'on' : ''}
                aria-pressed={on}
                data-a="partner"
                data-p={answer}
                onClick={() => setPlanningWithPartner(answer === 'Yes')}
              >
                {answer}
              </button>
            )
          })}
        </div>
      </div>
      <div className="field" style={{ margin: 0 }}>
        <span className="flabel">Children or others who rely on you {fromAnswers}</span>
        <div className="seg" role="group" style={{ margin: 0 }} aria-label="Dependants">
          {DEPENDANTS.map((label, count) => (
            <button
              key={label}
              className={deps === count ? 'on' : ''}
              aria-pressed={deps === count}
              data-a="deps"
              data-p={count}
              onClick={() => setDependants(count)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {partner ? (
        <div style={{ borderTop: '1px dashed var(--line)', marginTop: 14, paddingTop: 12 }}>
          <b>Your partner</b>
          <PartnerBlock />
        </div>
      ) : null}
      <CredChips />
    </div>
  )
}
