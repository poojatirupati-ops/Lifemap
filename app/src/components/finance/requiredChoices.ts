// The choices only the customer can make; until they are made there are no results.
// TODO(Q-01): domain logic; move to src/domain/planning once that folder is open to this card.
import { isChosen } from '../../domain/planning/assumptions.ts'
import type { Plan } from '../../state/types.ts'
import { partnerEarns } from '../../domain/finances/fields.data.ts'

/** name is used in sentences, label on the gate card. */
type RequiredChoice = { key: string; name: string; label: string }

type ChoiceInputs = Pick<Plan, 'retireSet' | 'assumptions' | 'inflation' | 'about' | 'figures' | 'partnerRetireSet'>

export function requiredChoices(plan: ChoiceInputs): RequiredChoice[] {
  const choices = [
    { key: 'retireAge', name: 'retirement age', label: 'Retirement age' },
    { key: 'planEnd', name: 'plan-until age', label: 'Plan until age' },
    { key: 'infl', name: 'inflation rate', label: 'Inflation' },
  ]
  if (partnerEarns(plan))
    choices.push({
      key: 'pRetireAge',
      name: "partner's retirement age",
      label: "Partner's retirement age",
    })
  return choices
}

const isMade = (plan: ChoiceInputs, key: string) =>
  ({
    retireAge: plan.retireSet,
    planEnd: isChosen(plan.assumptions, 'planEnd'),
    infl: plan.inflation != null,
    pRetireAge: !!plan.partnerRetireSet,
  })[key]

export const missingChoices = (plan: ChoiceInputs) =>
  requiredChoices(plan).filter((choice) => !isMade(plan, choice.key))
