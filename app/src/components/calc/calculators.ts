// Every calculator by id. Names, questions, emoji and groups live with Explore (TOOLS).
import { avc } from './avc.calc.ts'
import { borrow } from './borrow.calc.ts'
import { budget } from './budget.calc.ts'
import { compound } from './compound.calc.ts'
import { contribution } from './contrib.calc.ts'
import { debtPay } from './debtpay.calc.ts'
import { deposit } from './deposit.calc.ts'
import { drawdown } from './drawdown.calc.ts'
import { emergency } from './emergency.calc.ts'
import { fees } from './fees.calc.ts'
import { goalPlanner } from './goalplanner.calc.ts'
import { incomeGap } from './incomegap.calc.ts'
import { lastMoney } from './lastmoney.calc.ts'
import { lifeCover } from './lifecover.calc.ts'
import { loan } from './loan.calc.ts'
import { lumpSum } from './lumpsum.calc.ts'
import { mortgageProtect } from './mortgageprotect.calc.ts'
import { netWorth } from './networth.calc.ts'
import { overpay } from './overpay.calc.ts'
import { rateChange } from './ratechange.calc.ts'
import { realReturn } from './realreturn.calc.ts'
import { regularInvest } from './regularinvest.calc.ts'
import { rentBuy } from './rentbuy.calc.ts'
import { repaymentTool } from './repayment.calc.ts'
import { retirement } from './retirement.calc.ts'
import { riskReturn } from './riskreturn.calc.ts'
import { surplus } from './surplus.calc.ts'
import { term } from './term.calc.ts'
import { BINDINGS, REDIRECTS } from './bindings.data.ts'
import type { Calculator } from './types.ts'

const CALCULATORS = new Map(
  [
    borrow,
    repaymentTool,
    deposit,
    overpay,
    rateChange,
    term,
    rentBuy,
    goalPlanner,
    compound,
    emergency,
    lumpSum,
    realReturn,
    regularInvest,
    fees,
    riskReturn,
    retirement,
    contribution,
    avc,
    lastMoney,
    drawdown,
    lifeCover,
    incomeGap,
    mortgageProtect,
    netWorth,
    surplus,
    budget,
    debtPay,
    loan,
  ].map((calculator) => [calculator.id, calculator]),
)

export const calculatorFor = (id: string) => CALCULATORS.get(REDIRECTS[id] ?? id)!

/** Inputs, then what-ifs. */
export const allInputs = (calculator: Calculator) => [
  ...calculator.inputs,
  ...(calculator.whatIfs ?? []),
]

export const bindingOf = (toolId: string, key: string) => BINDINGS[toolId]?.[key]
