import { useStore } from '../../state/store.ts'
import { setDependants, setPlanningWithPartner } from '../define/aboutActions.ts'
import PartnerBlock from '../define/PartnerBlock.tsx'
import CredChips from './CredChips.tsx'

const DEPENDANTS = ['0', '1', '2', '3+']

/** About you: partner and dependants from the customer's answers, and the tax credits they open. */
export default function AboutHousehold() {
  const partner = useStore(({ plan }) => plan.about.partner)
  const deps = useStore(({ plan }) => plan.about.deps)
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
      {partner && (
        <div style={{ borderTop: '1px dashed var(--line)', marginTop: 14, paddingTop: 12 }}>
          <b>Your partner</b>
          <PartnerBlock />
        </div>
      )}
      <CredChips />
    </div>
  )
}
