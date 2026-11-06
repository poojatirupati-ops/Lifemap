// Investments, other assets and alternative investments, lot by lot: growth, the 8-year rule and
// the tax on sales kept apart (original makeHoldings). Nothing is taxed because it rises in value.
// - Funds and ETFs pay exit tax when sold (on the gain share of the sale, no loss relief) and when
//   the 8-year rule treats them as sold: the tax comes out of the fund and the cost resets.
// - Shares held directly, other assets and alternatives pay capital gains tax when sold: the rate
//   on the sale date, losses first, then the yearly exemption.
// Missing costs use disclosed simplifications: funds bought at today's value; shares, other assets
// and alternatives with a share of today's value as gain.
import { formatISO } from 'date-fns/formatISO'
import { cgtRateOn, type Rules } from './rates'

export const LOT_HOLDINGS = ['invest', 'otherAssets', 'alternatives'] as const
export type LotHolding = (typeof LOT_HOLDINGS)[number]

/** One purchase: its value, what was paid for it, and its years on the 8-year clock. */
interface Lot {
  value: number
  cost: number
  years: number
}

export interface HoldingsStart {
  value: Record<LotHolding, number>
  /** what was paid, when the customer knows it */
  cost: Record<LotHolding, number | null>
  /** years the investments have been held, when known */
  investYears: number | null
  /** shares held directly: no exit tax and no 8-year rule */
  direct: boolean
  /** the 8-year rule applies (off when the customer set their own growth after tax) */
  deemedDisposal: boolean
  /** share of the value that is gain when the cost is not known */
  gainShare: number
  inflation: number
  capitalLosses: number
  /** owners with their own yearly exemption (2 when owned with a partner) */
  owners: number
  startYear: number
  today: Date
}

/** Exit tax and capital gains tax taken, this year or over the plan. */
export interface TaxTaken {
  deemed: number
  sale: number
}

const TINY = 1e-9

export function makeHoldings(rules: Rules, start: HoldingsStart) {
  const { direct, gainShare } = start
  const { exit, deemed: clockYears, cgtExempt } = rules.sav
  const lots: Record<LotHolding, Lot[]> = { invest: [], otherAssets: [], alternatives: [] }
  const knownOr = (cost: number | null, otherwise: number) =>
    cost != null ? Math.max(0, cost) : otherwise
  const { invest, otherAssets, alternatives } = start.value
  if (invest > 0)
    lots.invest.push({
      value: invest,
      cost: knownOr(start.cost.invest, direct ? invest * (1 - gainShare) : invest),
      years: direct ? 0 : Math.max(0, Math.floor(start.investYears || 0)) % clockYears,
    })
  for (const [holding, value] of [
    ['otherAssets', otherAssets],
    ['alternatives', alternatives],
  ] as const)
    if (value > 0)
      lots[holding].push({
        value,
        cost: knownOr(start.cost[holding], value * (1 - gainShare)),
        years: 0,
      })

  const gains = { rate: rules.sav.cgt, exemptionLeft: 0, losses: start.capitalLosses || 0 }
  const thisYear: TaxTaken = { deemed: 0, sale: 0 }
  const wholePlan: TaxTaken = { deemed: 0, sale: 0 }
  const today = formatISO(start.today, { representation: 'date' })
  const taxOnSale = (tax: number) => {
    thisYear.sale += tax
    wholePlan.sale += tax
  }

  /** A new tax year: the CGT rate on its sale date (today, for a year already under way) and a fresh exemption. */
  function startYear(year: number) {
    const firstDay = `${year}-01-01`
    gains.rate = cgtRateOn(rules, today > firstDay ? today : firstDay)
    gains.exemptionLeft = cgtExempt * start.owners
    thisYear.deemed = 0
    thisYear.sale = 0
  }

  const total = (holding: LotHolding) => lots[holding].reduce((sum, lot) => sum + lot.value, 0)

  /** Sells one lot until `need` is received after tax; returns [received, value sold]. */
  function sellLot(lot: Lot, need: number, fund: boolean): [number, number] {
    const gainPart = (lot.value - lot.cost) / lot.value
    if (fund) {
      const tax = Math.max(0, gainPart) * exit
      const received = Math.min(need, lot.value * (1 - tax))
      const sold = received / (1 - tax)
      taxOnSale(sold - received)
      return [received, sold]
    }
    if (gainPart <= 0) {
      // a loss: set against later gains
      const sold = Math.min(need, lot.value)
      gains.losses += -gainPart * sold
      return [sold, sold]
    }
    const { rate } = gains
    const sheltered = gains.exemptionLeft + gains.losses
    const afterTax = (sold: number) => sold - rate * Math.max(0, gainPart * sold - sheltered)
    const received = Math.min(need, afterTax(lot.value))
    const sold =
      received <= sheltered / gainPart
        ? received
        : (received - rate * sheltered) / (1 - rate * gainPart)
    const used = Math.min(gainPart * sold, sheltered)
    const fromLosses = Math.min(used, gains.losses)
    gains.losses -= fromLosses
    gains.exemptionLeft = Math.max(0, gains.exemptionLeft - (used - fromLosses))
    taxOnSale(sold - received)
    return [received, sold]
  }

  /** Sells first in, first out until `amount` is received after tax; returns what was received. */
  function sell(holding: LotHolding, amount: number) {
    const fund = holding === 'invest' && !direct
    let need = amount
    let received = 0
    for (const lot of lots[holding]) {
      if (need <= TINY) break
      if (lot.value <= TINY) continue
      const [got, sold] = sellLot(lot, need, fund)
      lot.cost -= lot.cost * (sold / lot.value)
      lot.value -= sold
      received += got
      need -= got
    }
    lots[holding] = lots[holding].filter((lot) => lot.value > 1e-6)
    return received
  }

  /** A year's growth, then the 8-year rule on funds and ETFs. */
  function grow(investGrowth: number) {
    for (const holding of LOT_HOLDINGS)
      for (const lot of lots[holding]) {
        lot.value *= 1 + (holding === 'otherAssets' ? start.inflation : investGrowth)
        if (holding !== 'invest' || direct || !start.deemedDisposal) continue
        lot.years++
        if (lot.years < clockYears) continue
        const tax = Math.max(0, lot.value - lot.cost) * exit
        lot.value -= tax
        lot.cost = lot.value
        lot.years = 0
        thisYear.deemed += tax
        wholePlan.deemed += tax
      }
  }

  /** New money invested at its value, on its own 8-year clock. */
  const buy = (value: number) => {
    if (value > 0) lots.invest.push({ value, cost: value, years: 0 })
  }

  startYear(start.startYear)
  return { gains, thisYear, wholePlan, startYear, total, sell, grow, buy }
}

export type Holdings = ReturnType<typeof makeHoldings>
