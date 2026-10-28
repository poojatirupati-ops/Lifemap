// Protection: life cover, income protection gap, mortgage protection.
import { repayment } from './maths.ts'

export const ILLNESS_BENEFIT_MONTHS = 24 // paid for at most 2 years (624 days)
export const PROTECTION_MAX_SHARE = 0.75
export const BALANCE_YEARS = [5, 10, 15]

export const NOT_COVERED = "Your repayment doesn't cover the interest: please check the figures."
