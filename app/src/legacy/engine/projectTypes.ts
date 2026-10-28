// Shapes the projection returns. Pure types.
import type { GoalOut, WhatIf } from './goalFund.ts'

export type { GoalOut, WhatIf }
export type Missing = 'dob' | 'retireAge' | 'planUntil' | 'infl' | 'partnerRetireAge'
export type DueGoal = { id: number; name: string; e: string; kind: string; cost: number; paid: number }
export type YearRow = {
  t: number; age: number; year: number; inflow: number; needs: number; goalPaid: number; living: number; fixed: number; goalCost: number
  dueG: DueGoal[]; short: number; shortLiving: number; goalGap: number; due: string[]; used: number; saved: number; spent: number
  liquid: number; pen: number; retired: boolean; rmark: boolean; tax: number; gross: number; polIn: number; downIn: number
  goalShort?: boolean   // set by projectAll: a goal due this year is covered below 95%
}
export type Summary = { pct: Record<number, number>; goal: Record<number, GoalOut>; save: { surplusM: number; saveM: number; autoM: number }; goalShortAt: number[] }
export type Result = { blocked: true; missing: Missing[] } | ({ blocked: false; rows: YearRow[] } & Summary)
