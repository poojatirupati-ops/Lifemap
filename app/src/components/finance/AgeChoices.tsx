import { useShallow } from 'zustand/react/shallow'
import type { ReactNode } from 'react'
import { chosenAssumption } from '../../domain/planning/assumptions.ts'
import { guideSource, rules2026 } from '../../domain/planning/rates.ts'
import { GUIDANCE_FIGURES } from '../../domain/planning/settings.data.ts'
import { standardValue } from '../../domain/planning/settings.ts'
import { useStore } from '../../state/store.ts'
import AgeChoice from './AgeChoice.tsx'
import {
  choosePartnerRetireAge,
  choosePlanEnd,
  chooseRetireAge,
  partnerRetirementRange,
  planEndRange,
} from './choiceActions.ts'
import { retirementRange } from '../../domain/goals/retirement.ts'
import { partnerEarns } from '../../domain/finances/fields.data.ts'

const { sp, pen, guide } = rules2026
const { lifeMen65, lifeWomen65 } = GUIDANCE_FIGURES
const GAP_HONESTLY = 'Your results will show any gap honestly.'
const BEFORE_PENSION = `Pensions can usually be drawn from 60 (some schemes from 50) and the State Pension from ${sp.age}, so until then your plan uses savings and other income. ${GAP_HONESTLY}`

function retirementNote(age: number, accessAge: number) {
  if (age < 50) return `Retiring before 50 is possible. ${BEFORE_PENSION}`
  return age < accessAge || age < 60 ? BEFORE_PENSION : ''
}

function partnerRetirementNote(age: number) {
  if (age < 50)
    return `Their pay stops at this age. Until their State Pension at ${sp.age} your plan uses savings and other income, and the results will show any gap honestly.`
  if (age < 60)
    return `Their pay stops at this age. Their own pension is not modelled, so until their State Pension at ${sp.age} your plan relies on savings and other income. ${GAP_HONESTLY}`
  return ''
}

interface Props {
  inflation?: ReactNode
  /** Your assumptions asks the partner's retirement age straight after yours. */
  partnerFirst?: boolean
}

/** Retirement age, plan-until age, the inflation slot, and the partner's retirement age. */
export default function AgeChoices({ inflation, partnerFirst = false }: Props) {
  const plan = useStore(
    useShallow(({ plan }) => ({
      retireSet: plan.retireSet,
      retireAge: plan.retireAge,
      partnerRetireSet: plan.partnerRetireSet,
      partnerRetireAge: plan.partnerRetireAge,
      assumptions: plan.assumptions,
      about: plan.about,
      figures: plan.figures,
    })),
  )
  const retirement = retirementRange(plan)
  const planEnd = chosenAssumption(plan.assumptions, 'planEnd')
  const accessAge = Number(
    chosenAssumption(plan.assumptions, 'accessAge') ?? standardValue('accessAge'),
  )

  const partnerChoice = partnerEarns(plan) ? (
    <AgeChoice
      choice="pRetireAge"
      box="pret|a"
      label="Your partner's retirement age"
      age={plan.partnerRetireSet ? (plan.partnerRetireAge ?? null) : null}
      range={partnerRetirementRange(plan)}
      help="We count their pay until this age, then only their State Pension. Only you can choose it, so we never fill it in for you."
      note={
        plan.partnerRetireSet
          ? { id: 'pret-note', text: partnerRetirementNote(plan.partnerRetireAge!) }
          : undefined
      }
      onChoose={choosePartnerRetireAge}
    />
  ) : null

  return (
    <>
      <AgeChoice
        choice="retireAge"
        box="ret|a"
        label="Retirement age"
        age={plan.retireSet ? plan.retireAge : null}
        range={retirement}
        help={`You can usually draw a pension from ${pen.earliestAge} (${guideSource('schemeEarliest')} from ${guide.schemeEarliest}); State Pension is paid from ${sp.age}. Choose the age you want to plan for, any age from ${retirement.min} to ${retirement.max}.`}
        note={
          plan.retireSet
            ? { id: 'ret-note', text: retirementNote(plan.retireAge, accessAge) }
            : undefined
        }
        onChoose={chooseRetireAge}
      />
      {partnerFirst ? partnerChoice : null}
      <AgeChoice
        choice="planEnd"
        box="asm|planEnd"
        kind={planEnd != null ? 'mine' : 'req'}
        label="Plan until age (life expectancy)"
        age={planEnd != null ? Number(planEnd) : null}
        range={planEndRange(plan)}
        help={`At 65, average life expectancy in Ireland is about ${lifeMen65.value} for men and ${lifeWomen65.value} for women (${lifeMen65.by}). Choose the age you want to plan to.`}
        onChoose={choosePlanEnd}
      />
      {inflation}
      {partnerFirst ? null : partnerChoice}
    </>
  )
}
