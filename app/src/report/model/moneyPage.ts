// Report page 3: your money today.
import { euro } from '../../lib/format.ts'
import { hasFigure, type ReportContext } from './context.ts'
import { completeness } from './completeness.ts'

type Row = {
  key: string
  label: string
  value: number | null
  text?: string
  status: 'given' | 'missing' | 'none'
}

const MARGIN = {
  short: {
    title: 'You spend more than you take home',
    note: 'Costs are higher than pay, so savings are being used.',
  },
  comfortable: { title: 'A comfortable monthly margin', note: 'That gives you room to save more.' },
  tight: { title: 'A tight monthly margin', note: 'There is little room to save more.' },
}

export function moneyPage(context: ReportContext) {
  const { plan, rows, projection } = context
  const { figures } = plan
  const has = (key: string) => hasFigure(plan, key)
  const first = rows[0]
  const takeHomeM = first.inflow / 12
  const livingM = first.living / 12
  const debtM = first.repayments / 12
  const goalsM = Math.round(projection.saving.savingMonthly)
  const left = takeHomeM - livingM - debtM - projection.saving.savingMonthly
  const livingCosts = Math.round(livingM) + Math.round(debtM)
  const leftM = Math.round(left)
  const leftPer100 = takeHomeM > 0 ? Math.round((100 * left) / takeHomeM) : 0
  const short = leftM < 0
  const comfortable = leftPer100 >= 10
  // the margin reads the exact figure, the big number the rounded one
  const margin = left < 0 ? 'short' : comfortable ? 'comfortable' : 'tight'

  const figure = (key: string, label: string): Row =>
    has(key)
      ? { key, label, status: 'given', value: +figures[key] }
      : { key, label, status: 'missing', value: null }
  const mortgaged = figures.home === 'Own with mortgage'
  const own = [
    figure('cash', 'Cash savings'),
    figure('invest', 'Investments'),
    figure('pension', 'Pension'),
  ]
  const home: Row = has('home')
    ? {
        key: 'home',
        label: 'Home',
        status: 'given',
        value: null,
        text: figures.home === 'Rent' ? 'Rent' : figures.home,
      }
    : { key: 'home', label: 'Home', status: 'missing', value: null }
  const mortgage: Row = mortgaged
    ? figure('mortBal', 'Mortgage')
    : {
        key: 'mortgage',
        label: 'Mortgage',
        status: 'none',
        value: has('home') ? 0 : null,
        text: 'None',
      }
  const owe = [mortgage, figure('cardBal', 'Credit cards'), figure('loanBal', 'Other loans')]
  const anyMissing =
    [...own, ...owe.slice(1)].some((row) => row.status === 'missing') ||
    (mortgaged && !has('homeValue'))
  const homeValue = figures.home && figures.home !== 'Rent' ? +figures.homeValue || 0 : 0
  const assets = own.reduce(
    (sum, row) => sum + (row.value ?? 0),
    homeValue + (+figures.propValue || 0),
  )
  const debts = owe.reduce((sum, row) => sum + (row.value ?? 0), 0)
  const shown = (row: Row) =>
    row.status === 'missing'
      ? { label: row.label, status: 'missing' }
      : { label: row.label, value: row.text ?? euro(row.value ?? 0) }
  const oweRows = owe.filter((row) => row.status !== 'none' || figures.home).map(shown)
  const complete = completeness(context)

  return {
    big: short ? `${euro(-leftM)} short` : euro(leftM),
    bigLabel: short ? 'each month' : 'left each month',
    bigTone: short ? 'coral' : 'good',
    title: MARGIN[margin].title,
    tiles: [
      {
        label: 'Living costs',
        value: euro(livingCosts),
        amount: livingCosts,
        tone: 'navy',
      },
      { label: 'Goals', value: euro(goalsM), amount: goalsM, tone: 'teal' },
      {
        label: 'Left over',
        value: euro(Math.max(0, leftM)),
        amount: Math.max(0, leftM),
        tone: 'white',
      },
    ],
    sentence: short
      ? 'Your costs and goals are more than you take home, so savings are being used. Cutting a cost or moving a goal would help.'
      : `For every €100 you take home, about €${leftPer100} is left at the end of the month. ${MARGIN[margin].note}`,
    takeHome: `Take-home pay is after tax, USC and PRSI (gross pay ${euro(context.figures.income + context.figures.partnerIncome)}).`,
    own: { rows: [...own, home].map(shown) },
    owe: { rows: oweRows.length ? oweRows : [{ label: 'Debts', value: 'No debts told to us' }] },
    /** no value while a figure is missing */
    netWorth: anyMissing ? {} : { value: euro(Math.round(assets - debts)) },
    complete,
  }
}
