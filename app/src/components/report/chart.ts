// The cashflow page's two charts share one frame: 649 x 300, plotted inside these edges.
import type { ReportData } from '../../report/model/reportData.ts'

export const CHART = { width: 649, height: 300, left: 54, right: 640, top: 31, bottom: 269 }

export type Zone = ReportData['cashflow']['savingsChart']['zones'][number]

/** y of an amount on an axis from 0 to `max`, kept inside the plot. */
export const yOf = (amount: number, max: number) =>
  CHART.bottom - Math.max(0, Math.min(1, amount / max)) * (CHART.bottom - CHART.top)

/** €0, €250k, €1.5m */
export const axisLabel = (amount: number) =>
  amount === 0 ? '€0' : amount >= 1e6 ? `€${amount / 1e6}m` : `€${amount / 1000}k`

export const TEXT = { fontFamily: 'Figtree,sans-serif' }
export const BOLD = { fontFamily: 'Figtree,sans-serif', fontWeight: 800 }
