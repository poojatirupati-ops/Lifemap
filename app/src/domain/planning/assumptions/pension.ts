// The State Pension, retirement and drawdown rows.
import { chosenAssumption } from '../assumptions.ts'
import { retirementGoal } from '../../goals/goals.ts'
import { rules2026 } from '../rates.ts'
import { euro, euroWeekly, percent } from '../../../lib/format.ts'
import { MINE, NOT_CHOSEN, type AssumptionReader, type AssumptionRow } from './reader.ts'

/** Where the State Pension figure comes from, in words. */
function stateBasis({ plan, value }: AssumptionReader) {
  const { spYears, sp } = plan.figures
  const prsiYears =
    spYears != null && spYears !== '' ? spYears : chosenAssumption(plan.assumptions, 'spYears')
  if (prsiYears != null) return `from your ${prsiYears} years of PRSI`
  if (sp === 'Expect full') return 'you expect the full rate'
  return `your figure: ${euroWeekly(value('spWeek'))} a week`
}

function statePension(reader: AssumptionReader): AssumptionRow {
  const { settings, usually } = reader
  const { figures, rules } = settings
  const basis = stateBasis(reader)
  const yearly = euro(settings.statePension * figures.statePensionShare)
  return {
    label: 'Your State Pension',
    value: figures.statePensionKnown
      ? `${yearly} a year from ${rules.sp.age} (${basis}); taxable, no USC`
      : 'Not given yet',
    tag: usually('spWeek'),
  }
}

function partnerStatePensionText({ plan, settings, mine }: AssumptionReader) {
  const { partnerStatePensionShare, partnerStatePensionOption } = settings.figures
  if (partnerStatePensionShare === 'qa')
    return `Qualified Adult rate, ${euroWeekly(rules2026.sp.qa66)} a week`
  if (partnerStatePensionShare === 1) return 'Full rate'
  if (partnerStatePensionOption === 'None') return 'None'
  if (!mine('pSpWeek')) return 'Not given yet'
  return `${euroWeekly(Number(chosenAssumption(plan.assumptions, 'pSpWeek')))} a week (your figure)`
}

function partnerStatePension(reader: AssumptionReader): AssumptionRow {
  const value = partnerStatePensionText(reader)
  return { label: "Your partner's State Pension", value, tag: reader.usually('pSpWeek') }
}

export function pensionAssumptions(reader: AssumptionReader): AssumptionRow[] {
  const { plan, settings, value, mine, source, chosen, shown, row } = reader
  const accessAge = value('accessAge')
  const lumpSum = value('lumpSum')
  const scheme =
    accessAge < settings.rules.pen.earliestAge
      ? ' (an occupational scheme that allows it)'
      : ' (most pensions)'
  const planningFigure = mine('drawFixed') ? '' : ' (a planning figure: add yours)'
  const drawdown: Record<string, string> = {
    spread: 'Spread to the end of the plan, at least the legal minimum',
    min: 'The legal minimum only',
    fixed: `${euro(value('drawFixed'))} a year (today's money), at least the legal minimum${planningFigure}`,
  }
  const rows = [
    statePension(reader),
    ...(plan.about.partner ? [partnerStatePension(reader)] : []),
    row('State Pension in future', shown('spGrow'), 'spGrow'),
    row('Tax bands in future', shown('bands'), 'bands'),
    {
      label: retirementGoal(plan.goals) ? 'Retirement age' : 'Work income stops at',
      value: plan.retireSet ? `Age ${plan.retireAge}` : NOT_CHOSEN,
      tag: MINE,
    },
    {
      label: 'Plan until age',
      value: mine('planEnd') ? `Age ${settings.end}` : NOT_CHOSEN,
      tag: MINE,
    },
    { label: 'Plan starts', value: String(settings.startYear), tag: source('startYear') },
    row('Pension access age', `From ${accessAge}${scheme}`, 'accessAge'),
    row(
      'Lump sum at retirement',
      lumpSum > 0
        ? `${Math.round(lumpSum * 100)}% of your pension (tax as set by law, above)`
        : 'None',
      'lumpSum',
    ),
    { label: 'Pension drawdown', value: drawdown[settings.drawRule], tag: source('drawRule') },
  ]
  if (settings.figures.monthlyPension > 0)
    rows.push({
      label: 'Share of your pension you pay',
      value: mine('ownShare') ? chosen('ownShare') : percent(value('ownShare')),
      tag: source('ownShare'),
    })
  return rows
}
