// What the pension and retirement tools start from.
import { retirementGoal } from '../goals/goals.ts'
import { pensionPotAfter } from '../planning/pensions.ts'
import type { Fill, Known, Values } from './known.ts'

/** 20 or 40: the customer's top income tax rate. */
function taxRate({ figures, settings: { rules } }: Known) {
  const band = figures.married
    ? rules.it.bandMarried + Math.min(figures.partnerIncome, rules.it.bandUplift)
    : figures.singleParentCredit
      ? rules.it.bandSPCCC
      : rules.it.band
  const income = figures.married ? figures.income + figures.partnerIncome : figures.income
  return income > band ? 40 : 20
}

function contributions(known: Known): Fill {
  const { has, figures, plan, age, pensionGrowth } = known
  const paidYearly = (figures.monthlyOwnPension + Number(plan.pensionExtra || 0)) * 12
  return {
    values: {
      ...(has('income') && { sal: figures.income, tr: taxRate(known) }),
      ...(figures.monthlyOwnPension > 0 && { ex: Math.round(paidYearly) }),
      ...(plan.retireSet && { y: Math.max(1, plan.retireAge - age) }),
      g: pensionGrowth,
    },
  }
}

function drawdown({ has, figures, plan, age, settings }: Known): Values {
  const fixedWithdrawal = plan.assumptions.drawRule === 'fixed' && Number(plan.assumptions.drawFixed) > 0
  const potKnown = (has('pension') || has('pensionM')) && plan.retireSet
  const pot = () =>
    pensionPotAfter(
      Math.max(0, plan.retireAge - age),
      figures.pension,
      figures.monthlyPension,
      figures.pensionGrowth,
      settings.growth.wage,
    )
  return {
    ...(fixedWithdrawal && { w: Math.round(Number(plan.assumptions.drawFixed)) }),
    ...(potKnown && { pot: Math.round(pot()) }),
  }
}

export const PENSION_FILLS: Record<string, (known: Known) => Fill> = {
  retirement: ({ has, figures, plan, settings: { rules }, pensionGrowth }) => {
    const goal = retirementGoal(plan.goals)
    return {
      values: {
        ...(has('pension') && { pot: figures.pension }),
        ...(has('pensionM') && { m: figures.monthlyPension }),
        ...(plan.retireSet && { ra: plan.retireAge }),
        ...(figures.statePensionKnown && {
          o: Math.round(rules.sp.week * rules.sp.weeks * figures.statePensionShare),
        }),
        g: pensionGrowth,
        ...(goal && { d: goal.amount }),
      },
    }
  },
  contrib: contributions,
  avc: contributions,
  drawdown: (known) => ({ values: drawdown(known) }),
  lastmoney: (known) => {
    const { plan, settings } = known
    return {
      values: {
        ...drawdown(known),
        ...(plan.retireSet && { age: Math.max(plan.retireAge, Number(settings.accessAge)) }),
      },
    }
  },
}
