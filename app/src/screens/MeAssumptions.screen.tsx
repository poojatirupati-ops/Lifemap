import { meHead } from '../components/me/meHead.ts'
import { backToMe } from '../components/finance/financeActions.ts'
import { missingChoices } from '../components/finance/requiredChoices.ts'
import AssumptionGroup from '../components/me/AssumptionGroup.tsx'
import { rememberOpenGroup } from '../components/me/assumptionActions.ts'
import { ASSUMPTION_GROUPS, GOVERNMENT_TITLE } from '../domain/planning/assumptionFields.data.ts'
import { governmentRules } from '../domain/planning/governmentRules.ts'
import { useMePlan } from '../components/me/mePlan.ts'
import { assumption } from '../domain/planning/assumptions.ts'
import { rulesFor, rulesVersion } from '../domain/planning/rates.ts'

export const key = 'ME:asm'
export const id = 'ME-ASM'
export const note =
  "Your assumptions (journey-spec §27): LifeMap standards are set automatically (Set by LifeMap) and can be changed (Your choice, with Back to LifeMap's figure); market rates we do not know use a suggested or planning rate (Assumed: add yours); only retirement age, plan-until age and inflation (and a working partner's retirement age) block results; type 1 values are shown as Set by Government. Drives the plan and the calculators live."

// TODO(R-26): the original's Back returns to S.asmBack (set by the calculators); only Me home is wired
export const Head = () =>
  meHead({
    title: 'Your assumptions',
    sub: 'Some values are set by law. For the rest we show a suggestion or the standard, and you choose.',
    back: backToMe,
  })

export function Body() {
  const left = useMePlan((plan) => missingChoices(plan).length)
  const lawOpen = useMePlan((plan) => plan.asmOpen === 'law')
  const year = useMePlan((plan) => assumption(plan, 'startYear'))

  return (
    <>
      <div className="card">
        <b>
          {left
            ? `To see your results we need ${left} ${left === 1 ? 'thing' : 'things'}`
            : 'Everything your results need is chosen'}
        </b>
        <p className="small" style={{ margin: '2px 0 0' }}>
          LifeMap sets the figures that are the same for everyone (tagged <b>Set by LifeMap</b>) and
          uses them from the start. Change any of them and it reads <b>Your choice</b>. A rate we
          don't know is tagged <b>Assumed: add yours</b>.
        </p>
      </div>
      {ASSUMPTION_GROUPS.map(([group, title]) => (
        <AssumptionGroup key={group} group={group} title={title} />
      ))}
      <details
        className="card asmg"
        data-g="law"
        open={lawOpen}
        onToggle={(event) => rememberOpenGroup('law', event.currentTarget.open)}
      >
        <summary style={{ cursor: 'pointer', fontWeight: 800, minHeight: 44 }}>
          {GOVERNMENT_TITLE}
        </summary>
        <div style={{ marginTop: 10 }}>
          {governmentRules(rulesFor(year), year).map(([title, text]) => (
            <div className="mini" key={title}>
              <span>{title}</span>
              <b>{text}</b>
            </div>
          ))}
          <p className="small" style={{ margin: '8px 0 0' }}>
            Set by law and the same for everyone, so you can't change them. {rulesVersion(year)}.
          </p>
        </div>
      </details>
    </>
  )
}
