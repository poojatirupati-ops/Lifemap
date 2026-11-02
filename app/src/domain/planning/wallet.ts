// Unallocated money: cash, savings and assets, sold in order when a goal or a short year needs them.
/** In the order they are used; the emergency fund is kept apart. */
export const HOLDINGS = ['cash', 'savings', 'invest', 'otherAssets', 'alternatives'] as const
export type Holding = (typeof HOLDINGS)[number]
/** Money taken from each holding, after tax. */
export type Sources = Partial<Record<Holding, number>>
/** the emergency fund is built from cash and savings accounts only */
export const EASY_ACCESS: Holding[] = ['cash', 'savings']

export interface Wallet {
  held: Record<Holding, number>
  emergency: number
  /** capital gains tax on the value of other assets and alternatives when sold */
  gainsTax: number
  /** new unallocated money: the share invested, the rest kept as cash */
  investShare: number
}

const taxOnSale = (wallet: Wallet, holding: Holding) =>
  holding === 'otherAssets' || holding === 'alternatives' ? wallet.gainsTax : 0

/** Sells holdings in order until the amount is raised; returns what was raised after tax. */
export function sell(wallet: Wallet, amount: number, from: readonly Holding[], record: Sources) {
  let need = Math.max(0, amount)
  let total = 0
  for (const holding of from) {
    const keep = 1 - taxOnSale(wallet, holding)
    const raised = Math.min(need, Math.max(0, wallet.held[holding]) * keep)
    if (raised <= 0) continue
    wallet.held[holding] -= raised / keep
    need -= raised
    total += raised
    record[holding] = (record[holding] ?? 0) + raised
  }
  return total
}

export function deposit(wallet: Wallet, amount: number) {
  wallet.held.cash += amount * (1 - wallet.investShare)
  wallet.held.invest += amount * wallet.investShare
}

export const walletTotal = (wallet: Wallet) =>
  HOLDINGS.reduce((total, holding) => total + wallet.held[holding], 0)

/** A year's growth: cash and savings at the cash rate, other assets with prices, the rest invested. */
export function growWallet(
  wallet: Wallet,
  growth: { cash: number; invest: number; inflation: number },
) {
  const { held } = wallet
  held.cash *= 1 + growth.cash
  held.savings *= 1 + growth.cash
  held.invest *= 1 + growth.invest
  held.otherAssets *= 1 + growth.inflation
  held.alternatives *= 1 + growth.invest
  wallet.emergency *= 1 + growth.cash
}
