import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../../state/store.ts'
import { DEPENDANT_CHOICES } from '../../domain/identity/household.data.ts'
import { setDependants, setPlanningWithPartner } from '../../state/about.ts'
import MarriedField from '../define/MarriedField.tsx'
import PartnerBlock from '../define/PartnerBlock.tsx'

/** Partner and dependants, changed straight from the hub. */
export default function HouseholdCard() {
  const { partner, deps } = useStore(
    useShallow(({ plan }) => ({ partner: plan.about.partner, deps: plan.about.dependants })),
  )

  return (
    <div className="card mehh">
      <h3 className="h">Your household</h3>
      <div className="field" style={{ margin: '10px 0 0' }}>
        <span className="flabel">Planning with a partner?</span>
        <div className="seg" role="group" style={{ margin: '6px 0 0' }}>
          {[true, false].map((together) => {
            const label = together ? 'Yes' : 'No'
            const on = partner === together
            return (
              <button
                key={label}
                className={on ? 'on' : ''}
                aria-pressed={on}
                data-a="partner"
                data-p={label}
                onClick={() => setPlanningWithPartner(together)}
              >
                {label}
              </button>
            )
          })}
        </div>
        {partner && (
          <>
            <MarriedField />
            <PartnerBlock />
          </>
        )}
      </div>
      <div className="field" style={{ margin: '16px 0 0' }}>
        <span className="flabel">Children or others who rely on you</span>
        <div className="seg" role="group" style={{ margin: '6px 0 0' }}>
          {DEPENDANT_CHOICES.map((label, count) => (
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
    </div>
  )
}
