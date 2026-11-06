// Unallocated money: cash, savings and assets, sold in order when a goal or a short year needs them.
import { LOT_HOLDINGS, type Holdings, type LotHolding } from './holdings'

/** In the order they are used; the emergency fund is kept apart. */
export const HOLDINGS = ['cash', 'savings', 'invest', 'otherAssets', 'alternatives'] as const
export type Holding = (typeof HOLDINGS)[number]
/** Money taken from each holding, after tax. */
export type Sources = Partial<Record<Holding, number>>
/** the emergency fund is built from cash and savings accounts only */
export const EASY_ACCESS: Holding[] = ['cash', 'savings']

export interface Wallet {
  /** cash and savings accounts */
  held: { cash: number; savings: number }
  /** investments, other assets and alternatives, lot by lot */
  assets: Holdings
  emergency: number
  /** new unallocated money: the share invested, the rest kept as cash */
  investShare: number
  /** money received from each holding this year, after tax */
  sold: Record<Holding, number>
}

const isLot = (holding: Holding): holding is LotHolding =>
  (LOT_HOLDINGS as readonly string[]).includes(holding)

export const noneSold = (): Record<Holding, number> => ({
  cash: 0,
  savings: 0,
  invest: 0,
  otherAssets: 0,
  alternatives: 0,
})

/** Sells holdings in order until the amount is raised; returns what was raised after tax. */
export function sell(wallet: Wallet, amount: number, from: readonly Holding[], record?: Sources) {
  let need = Math.max(0, amount)
  let total = 0
  for (const holding of from) {
    if (need <= 1e-9) break
    let raised: number
    if (isLot(holding)) raised = wallet.assets.sell(holding, need)
    else {
      raised = Math.min(need, Math.max(0, wallet.held[holding]))
      if (raised > 0) wallet.held[holding] -= raised
    }
    need -= raised
    total += raised
    wallet.sold[holding] += raised
    if (record && raised > 0) record[holding] = (record[holding] ?? 0) + raised
  }
  return total
}

export function deposit(wallet: Wallet, amount: number) {
  wallet.held.cash += amount * (1 - wallet.investShare)
  wallet.assets.buy(amount * wallet.investShare)
}

export const holdingValue = (wallet: Wallet, holding: Holding) =>
  isLot(holding) ? wallet.assets.total(holding) : wallet.held[holding]

export const walletTotal = (wallet: Wallet) =>
  HOLDINGS.reduce((total, holding) => total + holdingValue(wallet, holding), 0)

/** A year's growth: cash, savings and the emergency fund at the cash rate, the assets as given. */
export function growWallet(wallet: Wallet, cashRate: number, investGrowth: number) {
  wallet.held.cash *= 1 + cashRate
  wallet.held.savings *= 1 + cashRate
  wallet.assets.grow(investGrowth)
  wallet.emergency *= 1 + cashRate
}
