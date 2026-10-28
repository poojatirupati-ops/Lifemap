// The choices only the customer can make; until they are made there are no results.
// TODO(Q-01): domain logic; move to src/domain/planning once that folder is open to this card.
import { isChosen } from '../../domain/planning/assumptions.ts'
import { toNumber } from '../../lib/format.ts'
import type { Plan } from '../../state/types.ts'

export type RequiredChoice = { key: string; name: string }

type ChoiceInputs = Pick<Plan, 'retireSet' | 'asm' | 'infl' | 'about' | 'fin' | 'pRetSet'>

/** A partner whose income counts in the plan. */
export const partnerEarns = ({ about, fin }: Pick<Plan, 'about' | 'fin'>) =>
  !!about.partner && toNumber(fin.pIncome) > 0

export function requiredChoices(plan: ChoiceInputs): RequiredChoice[] {
  const choices = [
    { key: 'retireAge', name: 'retirement age' },
    { key: 'planEnd', name: 'plan-until age' },
    { key: 'infl', name: 'inflation rate' },
  ]
  if (partnerEarns(plan)) choices.push({ key: 'pRetireAge', name: "partner's retirement age" })
  return choices
}

const isMade = (plan: ChoiceInputs, key: string) =>
  ({
    retireAge: plan.retireSet,
    planEnd: isChosen(plan.asm, 'planEnd'),
    infl: plan.infl != null,
    pRetireAge: !!plan.pRetSet,
  })[key]

export const missingChoices = (plan: ChoiceInputs) =>
  requiredChoices(plan).filter((choice) => !isMade(plan, choice.key))

/** "Choose your retirement age" */
export const chooseText = (name: string) => `Choose your ${name}`
