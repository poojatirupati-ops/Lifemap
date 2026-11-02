// What a calculator is: its inputs, and a pure run() from the figures to a result.
import type { Rules } from '../planning/rates.ts'

/** € money, % rate, y years, m months, age; yn, style and tax are chips, never sliders. */
export type Unit = '€' | '%' | 'y' | 'm' | 'age' | 'yn' | 'style' | 'tax'

export interface CalcInput {
  key: string
  label: string
  /** The tool's labelled example figure, shown when nothing better is known. */
  example: number
  min: number
  max: number
  step: number
  unit: Unit
}

/** The figures a calculator runs on. What-if inputs may be missing (they count as 0). */
export type Figures = Record<string, number>

/** What "Add to my plan" would add (one of the plan's goal kinds), or why it can't yet ('blocked'). */
export interface Handoff {
  kind: string
  name?: string
  emoji?: string
  /** Why it can't be added yet (kind 'blocked'). */
  message?: string
  /** The goal key a spending goal files under ('home'). */
  goalKind?: string
  need?: string
  amount?: number
  saved?: number
  years?: number
  age?: number
}

export interface CalcResult {
  label: string
  value: string
  line: string
  rows: [label: string, value: string][]
  goal: Handoff | null
  /** The workbook's named results, compared with the original in the golden tests. */
  numbers: Record<string, number | string>
}

/** An uploaded pension statement's figures. */
export interface PensionStatement {
  proj?: number | null
  nra: number
  projToday?: string
}

/** Everything a calculator reads besides its own figures. */
export interface CalcContext {
  /** Irish rules for the plan's start year. */
  rules: Rules
  /** Prices rising a year; null until the customer chooses. */
  inflation: number | null
  /** Pay rises and cash growth a year (the chosen growth set). */
  wage: number
  cash: number
  /** The plan-until age. */
  planEnd: number
  /** A "Your assumptions" value: the customer's choice, else the standard or a planning figure. */
  assumption: (key: string) => number | string
  /** The monthly mortgage repayment the customer stated (statement or typed), if any. */
  statedMortgagePayment: { amount: number; from: 'your statement' | 'your figures' } | null
  /** True while the customer has moved none of these inputs in this tool. */
  untouched: (keys: string[]) => boolean
  /** The uploaded pension statement's figures, if any. */
  pensionStatement: PensionStatement | null
  /** The "Adjust for inflation" switch (lump-sum and regular investing tools). */
  adjustForInflation: boolean
  /** The emergency fund months the plan uses (the tip on the emergency fund tool). */
  safetyMonths: number
}

export interface Calculator {
  id: string
  inputs: CalcInput[]
  whatIfs?: CalcInput[]
  tip?: (context: CalcContext) => string
  run: (figures: Figures, context: CalcContext) => CalcResult
}
