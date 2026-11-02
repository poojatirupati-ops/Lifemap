import { useShallow } from 'zustand/react/shallow'
import type { ReactNode } from 'react'
import { chosenAssumption } from '../../domain/planning/assumptions.ts'
import { guideSource, rules2026 } from '../../domain/planning/rates.ts'
import { standardValue } from '../../domain/planning/settings.ts'
import { useStore } from '../../state/store.ts'
import AgeChoice from './AgeChoice.tsx'
import PlanEndChoice from '../assumptions/PlanEndChoice.tsx'
import { choosePartnerRetireAge, chooseRetireAge } from '../../state/choices.ts'
import { partnerRetirementRange, retirementRange } from '../../domain/goals/retirement.ts'
import { partnerEarns } from '../../domain/finances/fields.data.ts'

const { sp, pen, guide } = rules2026
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
  const ages = useStore(
    useShallow(({ plan }) => {
      const retirement = retirementRange(plan)
      const partner = partnerRetirementRange(plan)
      return {
        retireAge: plan.retireSet ? plan.retireAge : null,
        earliest: retirement.min,
        latest: retirement.max,
        accessAge: Number(
          chosenAssumption(plan.assumptions, 'accessAge') ?? standardValue('accessAge'),
        ),
        partnerEarns: partnerEarns(plan),
        partnerAge: plan.partnerRetireSet ? (plan.partnerRetireAge ?? null) : null,
        partnerEarliest: partner.min,
        partnerLatest: partner.max,
      }
    }),
  )
  const retirement = { min: ages.earliest, max: ages.latest }

  const partnerChoice = ages.partnerEarns ? (
    <AgeChoice
      choice="pRetireAge"
      box="pret|a"
      label="Your partner's retirement age"
      age={ages.partnerAge}
      range={{ min: ages.partnerEarliest, max: ages.partnerLatest }}
      help="We count their pay until this age, then only their State Pension. Only you can choose it, so we never fill it in for you."
      note={
        ages.partnerAge == null
          ? undefined
          : { id: 'pret-note', text: partnerRetirementNote(ages.partnerAge) }
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
        age={ages.retireAge}
        range={retirement}
        help={`You can usually draw a pension from ${pen.earliestAge} (${guideSource('schemeEarliest')} from ${guide.schemeEarliest}); State Pension is paid from ${sp.age}. Choose the age you want to plan for, any age from ${retirement.min} to ${retirement.max}.`}
        note={
          ages.retireAge == null
            ? undefined
            : { id: 'ret-note', text: retirementNote(ages.retireAge, ages.accessAge) }
        }
        onChoose={chooseRetireAge}
      />
      {partnerFirst ? partnerChoice : null}
      <PlanEndChoice />
      {inflation}
      {partnerFirst ? null : partnerChoice}
    </>
  )
}
