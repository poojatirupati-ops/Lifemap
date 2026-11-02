// The changes the report tries on the plan: one at a time, then a few together. Pure: nothing is run here.
import { euro } from '../../lib/format.ts'
import type { ReportContext } from './context.ts'
import { pensionRoom, type Change } from './changedPlan.ts'

export interface ScenarioRow {
  id: string
  lever: string
  title: string
  sub: string
  covered: number
  gapStartsAt: number | null
  points: number
  /** retire-at rows: the age tried */
  age?: number
  /** pension rows: the monthly payment and its cost after tax relief */
  monthlyM?: number
  afterReliefM?: number
  amountM?: number
}

export type Candidate = {
  row: Omit<ScenarioRow, 'covered' | 'gapStartsAt' | 'points'>
  change: Change
}

export function candidateChanges(context: ReportContext) {
  const { projection, figures: f, rows } = context
  const { fullStatePension } = context
  const takeHomeM = rows[0].inflow / 12
  const moreM = Math.max(50, Math.round((0.18 * takeHomeM) / 50) * 50)
  const halfM = Math.round(moreM / 2)
  const share = (monthly: number) => Math.round((100 * monthly) / takeHomeM)
  const pension = pensionRoom(context)
  const grossOf = (monthly: number) => Math.round(monthly / (1 - pension.taxRate))
  const age = f.age ?? 0
  const retireAge = f.retireAge
  const working = f.income > 0 && f.work !== 'Not working' && retireAge > age
  const canAddPension = working && pension.limitM > 0 && retireAge - age >= 1
  const canRetireAt = (at: number) => retireAge < at && retireAge > age
  const { spareMonthly, savingMonthly } = projection.saving
  const extraSaved = Math.max(0, Math.min(spareMonthly, savingMonthly + moreM) - savingMonthly)

  const retireLater = (at: number) => ({
    row: {
      id: `retire${at}`,
      lever: 'retirementAge',
      title: `Retire at ${at}`,
      sub: `${at - retireAge} years later`,
      age: at,
    },
    change: { retireAge: at },
  })
  const withPension = (at: number, addM: number) => ({
    retireAge: at,
    pensionAddM: addM,
    fullStatePension: true,
  })

  const single = [
    canRetireAt(60) && retireLater(60),
    (working || age < retireAge) &&
      extraSaved >= moreM / 2 && {
        row: {
          id: 'save',
          lever: 'saveMore',
          title: `Save ${euro(moreM)} more a month`,
          sub: `In cash and investments. About ${share(moreM)}% of take-home pay`,
          amountM: moreM,
        },
        change: { saveM: Math.round(savingMonthly + moreM) },
      },
    canRetireAt(65) && retireLater(65),
    canAddPension && {
      row: {
        id: 'pension',
        lever: 'startPension',
        title:
          f.monthlyOwnPension > 0
            ? `Raise your pension to the limit, ${euro(pension.limitM)} more a month`
            : `Start a pension, ${euro(pension.limitM)} a month`,
        sub: `About ${euro(pension.afterReliefM)} after tax relief. The most you can claim on at ${age}`,
        monthlyM: pension.limitM,
        afterReliefM: pension.afterReliefM,
      },
      change: { pensionAddM: pension.limitM },
    },
    !fullStatePension && {
      row: {
        id: 'statePension',
        lever: 'statePension',
        title: 'Count your State Pension',
        sub: `Full rate, ${euro(context.statePensionYear)} a year from ${context.statePensionAge}`,
      },
      change: { fullStatePension: true },
    },
    canAddPension && {
      row: {
        id: 'payMore',
        lever: 'payMorePension',
        title: `Pay ${euro(moreM)} more a month into a pension`,
        sub: `After tax relief. About ${share(moreM)}% of take-home pay`,
        amountM: moreM,
      },
      change: { pensionAddM: grossOf(moreM) },
    },
  ].filter((item) => item !== false)

  // each counts a full State Pension ("confirm yours")
  const at60 = canAddPension && canRetireAt(60)
  const combined = [
    at60 && {
      row: {
        id: 'c60',
        lever: 'combined',
        title: 'Retire at 60 + pension at the limit',
        sub: fullStatePension
          ? 'Retire at 60 and a pension at the limit'
          : 'With a full State Pension (confirm yours)',
      },
      change: withPension(60, pension.limitM),
    },
    at60 && {
      row: {
        id: 'c60more',
        lever: 'combined',
        title: `…and pay ${euro(halfM)} more a month into a pension`,
        sub: `Total ${share(pension.afterReliefM + halfM)}% of take-home pay`,
      },
      change: withPension(60, pension.limitM + grossOf(halfM)),
    },
    canAddPension &&
      canRetireAt(65) && {
        row: {
          id: 'c65',
          lever: 'combined',
          title: `${at60 ? 'Or retire' : 'Retire'} at 65 + pension at the limit`,
          sub: `With a full State Pension. Total ${share(pension.afterReliefM)}% of take-home pay`,
        },
        change: withPension(65, pension.limitM),
      },
  ].filter((item) => item !== false)

  return { single, combined }
}
