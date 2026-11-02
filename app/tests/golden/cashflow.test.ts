// Cashflow-engine pieces must equal the ORIGINAL script's, run in node:vm, on every fixture.
import { describe, expect, it } from 'vitest'
import { runOriginal } from './origSlice'
import { plain, fixtures } from './origProfile'
import { fromOriginal } from '../../src/state/migrate'
import * as tax from '../../src/domain/planning/tax'
import * as levies from '../../src/domain/planning/levies'
import * as loans from '../../src/domain/planning/loans'
import * as pensions from '../../src/domain/planning/pensions'
import * as figures from '../../src/domain/planning/householdFigures'
import { rulesFor } from '../../src/domain/planning/rates'

const original = runOriginal(
  `applyAssume, syncAges, syncLists, finNums, essM, AS, asmV, asmGet, asmMine, setRulesYear,
  incomeTax, usc, prsiRate, prsi, hhTax, netPay, netRet, reliefOn, pensionCost, jointGain, lumpSum, sftFor, arfMin, iAPR, mPmt, pmtM, amortYear, pensionAt, spFrac, relLim, mort2Nums`,
)

const cashflow = { ...tax, ...levies, ...loans, ...pensions, ...figures }

// our names for the original's person fields and tax options
const asPerson = (p: any): tax.Person => ({
  pay: p.emp,
  selfEmployed: p.se,
  statePension: p.sp,
  drawdown: p.draw,
  otherIncome: p.other,
  pensionRelief: p.relief,
  age: p.age,
})
const householdTax = (rules: any, p1: any, p2: any, o: any) => {
  const { incomeTax, ...rest } = cashflow.householdTax(rules, asPerson(p1), p2 && asPerson(p2), {
    married: o.married,
    singleParent: o.spccc,
    renting: o.rent,
    homeCarer: o.carer,
    prsiRate: o.rate,
  })
  return { it: incomeTax, ...rest }
}
const repaid = (...args: Parameters<typeof cashflow.repayForYear>) => {
  const { balance, paid } = cashflow.repayForYear(...args)
  return { bal: balance, paid }
}
// the original's finNums field names, mapped to ours
const FIGURE_NAMES: Record<string, string> = {
  R: 'retireAge',
  pSpO: 'partnerStatePensionOption',
  penG: 'pensionGrowth',
  aeElig: 'autoEnrolmentEligible',
  spccc: 'singleParentCredit',
  pAge: 'partnerAge',
  pRet: 'partnerRetireAge',
  pIncome: 'partnerIncome',
  otherM: 'otherIncomeMonthly',
  costsM: 'monthlyCosts',
  oneOffY: 'yearlyOneOffs',
  rentM: 'monthlyRentReceived',
  altInv: 'alternativeInvestments',
  downAge: 'downsizeAge',
  downValue: 'downsizeValue',
  polLump: 'policyLumpSum',
  polLumpAge: 'policyLumpSumAge',
  polInc: 'policyIncome',
  polIncAge: 'policyIncomeAge',
  homeVal: 'homeValue',
  mortBal: 'mortgageBalance',
  mortRate: 'mortgageRate',
  mortRateKnown: 'mortgageRateKnown',
  mortPayM: 'monthlyMortgage',
  mortPayEst: 'mortgageEstimated',
  mortYearsKnown: 'mortgageTermKnown',
  mortPayLow: 'mortgagePaymentLow',
  mortYears: 'mortgageYears',
  cardBal: 'cardBalance',
  cardPayM: 'monthlyCardPayment',
  cardPayEst: 'cardPaymentEstimated',
  loanBal: 'loanBalance',
  loanPayM: 'monthlyLoanPayment',
  loanPayEst: 'loanPaymentEstimated',
  debtPayM: 'monthlyDebtPayment',
  debtPayEst: 'debtPaymentEstimated',
  pensionM: 'monthlyPension',
  pensionOwnM: 'monthlyOwnPension',
  sp: 'statePensionShare',
  spKnown: 'statePensionKnown',
  pSp: 'partnerStatePensionShare',
  ae: 'autoEnrolled',
  rentCred: 'rentCredit',
  carer: 'homeCarerCredit',
}

// householdFigures, essentialMonthly and otherMortgages against the original
function sameFigures(theirState: any, year: number, id: string) {
  const mine: any = fromOriginal(theirState)
  const ours = cashflow.householdFigures(mine, rulesFor(year))
  const theirs = Object.fromEntries(
    Object.entries(original.finNums()).map(([key, v]) => [FIGURE_NAMES[key] ?? key, v]),
  )
  expect(plain(ours), id).toEqual(plain(theirs))
  expect(cashflow.essentialMonthly(ours), id).toBe(original.essM())
  const { balance, repayment, rate, count } = cashflow.otherMortgages(
    mine.lists?.mort2 ?? [],
    original.AS.mortRate,
  )
  expect(plain({ bal: balance, pay: repayment, rate, n: count }), id).toEqual(
    plain(original.mort2Nums()),
  )
}

describe('cashflow engine', () => {
  it('tax, pension and loan arithmetic equal the original', () => {
    for (const y of [2026, 2027]) {
      original.setState(structuredClone(fixtures[0][1]))
      original.getState().asm = { ...original.getState().asm, startYear: y }
      original.applyAssume()
      const rules = rulesFor(y)
      for (const g of [0, 5000, 20000, 44000, 60000, 99000, 150000, 400000, 1e6]) {
        expect(cashflow.incomeTax(rules, g)).toBe(original.incomeTax(g))
        expect(cashflow.usc(rules, g)).toBe(original.usc(g))
        expect(cashflow.usc(rules, g, true)).toBe(original.usc(g, true))
        for (const age of [30, 55, 66, 72]) {
          expect(cashflow.pensionRelief(rules, g, 3000, age)).toBe(original.reliefOn(g, 3000, age))
          expect(cashflow.pensionNetCost(rules, g, 3000, age)).toBe(
            original.pensionCost(g, 3000, age),
          )
          const rate = original.prsiRate(y + 3)
          expect(
            cashflow.takeHomePay(rules, g, {
              age,
              pensionRelief: 2000,
              statePension: 0,
              prsiRate: rate,
            }),
          ).toBe(original.netPay(g, { age, relief: 2000, rate }))
          expect(cashflow.retirementTakeHome(rules, g, 15000, age, rate)).toBe(
            original.netRet(g, 15000, age, rate),
          )
          for (const se of [false, true]) {
            const p1 = {
                emp: g,
                se,
                sp: age >= 66 ? 14000 : 0,
                draw: age >= 61 ? 9000 : 0,
                other: 1200,
                relief: 1500,
                age,
              },
              p2 = { emp: g / 2, se: false, sp: 0, draw: 0, other: 0, relief: 0, age: age - 3 }
            const opts = [
              { married: true, carer: true, rent: true },
              { married: false, spccc: true },
              { married: false, rent: true },
              { rent: true, spccc: true },
              {},
            ]
            for (const o of opts)
              for (const pp of [p2, { ...p2, emp: 0 }, null])
                expect(
                  plain(householdTax(rules, p1, pp, { ...o, rate })),
                  JSON.stringify([g, age, se, o]),
                ).toEqual(plain(original.hhTax(p1, pp, { ...o, rate })))
          }
        }
        expect(cashflow.jointAssessmentSaving(rules, g, g / 3)).toBe(original.jointGain(g, g / 3))
        expect(plain(cashflow.lumpSum(rules, g * 10, 0.25))).toEqual(
          plain(original.lumpSum(g * 10, 0.25)),
        )
      }
      for (const yr of [2026, 2028, 2029, 2030, 2040]) {
        original.AS.infl = 0.02
        expect(cashflow.standardFundThreshold(rules, yr, 0.02)).toBe(original.sftFor(yr))
      }
      for (const yr of [2026, 2027, 2028, 2030])
        expect(cashflow.prsiRate(rules, yr)).toBe(original.prsiRate(yr))
      for (const [age, pot] of [
        [55, 1e5],
        [61, 1e5],
        [71, 1e5],
        [71, 9e5],
      ])
        expect(cashflow.arfMinimum(rules, age, pot)).toBe(original.arfMin(age, pot))
      for (const yrs of [0, 5, 40, 45])
        expect(cashflow.statePensionFraction(rules, yrs)).toBe(original.spFrac(yrs))
      expect(cashflow.monthlyRateFromApr(0.2)).toBe(original.iAPR(0.2))
      expect(cashflow.mortgageRepayment(250000, 0.0375, 25)).toBe(original.mPmt(250000, 0.0375, 25))
      expect(cashflow.monthlyRepayment(5000, 0.01, 60)).toBe(original.pmtM(5000, 0.01, 60))
      expect(repaid(5000, 0, 300, 0.015)).toEqual(original.amortYear(5000, 0, 300, 0.015))
      expect(repaid(250000, 0.0375, 1300)).toEqual(original.amortYear(250000, 0.0375, 1300))
      expect(cashflow.pensionPotAfter(20, 50000, 400, 0.04, 0.03)).toBe(
        original.pensionAt(20, 50000, 400, 0.04, 0.03),
      )
    }
  })
  it('finNums, essM and mort2Nums equal the original on every fixture', () => {
    for (const [f, st] of fixtures)
      for (const y of [2026, 2027]) {
        const s = structuredClone(st)
        s.asm = { ...s.asm, startYear: y }
        original.setState(s)
        original.applyAssume()
        original.syncLists() // lists already synced, as finNums expects
        const mine = structuredClone(original.getState())
        sameFigures(mine, y, f)
      }
  })
  // variants of each fixture: the fixtures alone never reach mort2, a statement pension charge, the credits, the other work types or the pension-share overrides
  const mi = (f: Record<string, any>) => ({ f, src: {}, conf: {}, fix: {} })
  const V: [string, (s: any) => void][] = [
    [
      'mort2 owed',
      (s) => {
        s.lists.mort2 = [mi({ owed: 120000 })]
      },
    ],
    [
      'mort2 owed+years',
      (s) => {
        s.lists.mort2 = [mi({ owed: 120000, years: 18 })]
      },
    ],
    [
      'mort2 owed+rate+pay',
      (s) => {
        s.lists.mort2 = [mi({ owed: 90000, rate: 5, pay: 700 }), mi({ owed: 50000, rate: 3 })]
      },
    ],
    [
      'mort2 pay below interest',
      (s) => {
        s.lists.mort2 = [mi({ owed: 90000, rate: 5, pay: 10 }), mi({ owed: 0 })]
      },
    ],
    [
      'mort2 + loanBal/cardBal',
      (s) => {
        s.lists.mort2 = [mi({ owed: 80000, years: 10, rate: 4 })]
        Object.assign(s.fin, {
          loanBal: 15000,
          cardBal: 3000,
          loanRate: 7,
          cardRate: 20,
          loanPayM: 400,
          cardPayM: 30,
        })
      },
    ],
    [
      'mort2 + debt only',
      (s) => {
        s.lists.mort2 = [mi({ owed: 80000, pay: 600 })]
        Object.assign(s.fin, { debt: 9000, debtPayM: 100 })
      },
    ],
    [
      'loan/card only',
      (s) => {
        Object.assign(s.fin, { loanBal: 15000, cardBal: 3000, cardPayM: 5 })
      },
    ],
    [
      'penChg 0.5',
      (s) => {
        s.fin.penChg = 0.5
      },
    ],
    [
      'penChg 0',
      (s) => {
        s.fin.penChg = 0
      },
    ],
    [
      'penChg blank',
      (s) => {
        s.fin.penChg = ''
      },
    ],
    [
      'penChg 1.8',
      (s) => {
        s.fin.penChg = '1.8'
      },
    ],
    [
      'cred rent',
      (s) => {
        s.about.cred = { rent: true }
        s.fin.home = 'Rent'
      },
    ],
    [
      'cred lone',
      (s) => {
        s.about.cred = { lone: true }
        s.about.partner = false
        s.about.deps = 2
      },
    ],
    [
      'cred lone, no deps',
      (s) => {
        s.about.cred = { lone: true }
        s.about.partner = false
        s.about.deps = 0
      },
    ],
    [
      'cred carer',
      (s) => {
        s.about.cred = { carer: true }
        s.about.partner = true
        s.about.married = true
      },
    ],
    [
      'cred all',
      (s) => {
        s.about.cred = { rent: true, lone: true, carer: true }
        s.about.deps = 1
      },
    ],
    [
      'pSp own full',
      (s) => {
        s.about.partner = true
        s.fin.pSp = 'Own full'
      },
    ],
    [
      'pSp own partial',
      (s) => {
        s.about.partner = true
        s.fin.pSp = 'Own partial'
      },
    ],
    [
      'pSp QA',
      (s) => {
        s.about.partner = true
        s.fin.pSp = 'Qualified adult increase'
      },
    ],
    [
      'pSp none',
      (s) => {
        s.about.partner = true
        s.fin.pSp = 'None'
      },
    ],
    [
      'pSp unset',
      (s) => {
        s.about.partner = true
        delete s.fin.pSp
      },
    ],
    [
      'Not working',
      (s) => {
        s.fin.work = 'Not working'
        s.fin.income = 40000
        s.fin.pensionM = 300
      },
    ],
    [
      'Self-employed',
      (s) => {
        s.fin.work = 'Self-employed'
        s.fin.income = 60000
      },
    ],
    [
      'Employed no pension',
      (s) => {
        s.fin.work = 'Employed'
        s.fin.income = 50000
        s.fin.pensionM = 0
        s.about.age = 40
      },
    ],
    [
      'work unset',
      (s) => {
        delete s.fin.work
        s.fin.income = 30000
      },
    ],
    [
      'spYears 25',
      (s) => {
        s.fin.spYears = 25
      },
    ],
    [
      'spYears 5',
      (s) => {
        s.fin.spYears = 5
      },
    ],
    [
      'spYears 0',
      (s) => {
        s.fin.spYears = '0'
      },
    ],
    [
      'sp expect full',
      (s) => {
        s.fin.sp = 'Expect full'
        delete s.fin.spYears
      },
    ],
    [
      'pensionOwnM 100',
      (s) => {
        s.fin.pensionM = 400
        s.fin.pensionOwnM = 100
      },
    ],
    [
      'pensionOwnM too big',
      (s) => {
        s.fin.pensionM = 400
        s.fin.pensionOwnM = 900
      },
    ],
    [
      'pensionOwnM 0',
      (s) => {
        s.fin.pensionM = 400
        s.fin.pensionOwnM = 0
      },
    ],
    [
      'mortgage terms',
      (s) => {
        s.fin.home = 'Own with mortgage'
        Object.assign(s.fin, { mortBal: 200000, mortYears: 20, mortRate: 4, mortPayM: 900 })
      },
    ],
    [
      'mortgage no pay/years',
      (s) => {
        s.fin.home = 'Own with mortgage'
        Object.assign(s.fin, { mortBal: 200000 })
        delete s.fin.mortPayM
        delete s.fin.mortYears
      },
    ],
  ]
  it('finNums, essM and mort2Nums equal the original on variants of the fixtures', () => {
    for (const [f, st] of fixtures)
      for (const y of [2026, 2027])
        for (const [vn, mut] of V) {
          const s = structuredClone(st)
          s.asm = { ...s.asm, startYear: y }
          s.lists ||= {}
          s.lists.mort2 ||= []
          s.about ||= {}
          s.fin ||= {}
          mut(s)
          original.setState(structuredClone(s))
          original.applyAssume()
          original.syncLists() // lists already synced, as finNums expects
          const mine = structuredClone(original.getState())
          sameFigures(mine, y, `${f} ${y} ${vn}`)
        }
  }, 30_000)
})
