// "Not sure? See an example" cards: how Aoife and Cian (the sample customers) fill in each field.
import { euro } from '../../lib/format.ts'
import { ITEM_DOCUMENTS } from './itemDocuments.data.ts'
import {
  SAMPLE_FINANCES,
  SAMPLE_OWN_SHARE,
  SAMPLE_RATES,
  SAMPLE_WORK_COVER_MULTIPLE,
  sampleValue,
} from './sample.data.ts'

type ExampleOption = [choice: string, meaning: string]
type SampleKey = keyof typeof SAMPLE_FINANCES

// text: the example sentence; where: where to find your own figure; options: the choices explained
type FieldExample = { text: string; where: string; options?: ExampleOption[] }

type ExampleContext = {
  statePensionAge: number
  fullPrsiYears: number
  planStartYear: number
}

const YES_NO_NOT_SURE: ExampleOption[] = [
  ['Yes', 'you have it'],
  ['No', "you don't"],
  ['Not sure', 'check your documents, then come back'],
]

const sampleNumber = (key: SampleKey) => Number(sampleValue(key))
const sampleEuros = (key: SampleKey) => euro(sampleNumber(key))
// the figures an uploaded document fills in, in order
const documentValues = (list: keyof typeof ITEM_DOCUMENTS) =>
  ITEM_DOCUMENTS[list].figures.map(([, value]) => value)
const percent = (rate: number) => +(rate * 100).toFixed(2)

// keyed by finances field, or "list.field" for items in a list
export function fieldExamples({
  statePensionAge,
  fullPrsiYears,
  planStartYear,
}: ExampleContext): Record<string, FieldExample> {
  const age = sampleValue('age')
  const retireAge = sampleValue('retireAge')
  const partnerBirthYear = planStartYear - sampleNumber('pAge')
  const ownPensionM = euro(sampleNumber('pensionM') * SAMPLE_OWN_SHARE)
  const [lifeAmount, lifeYears] = documentValues('life')
  const healthCost = euro(documentValues('health')[0])
  const [ipAmount, ipYears] = documentValues('ip')
  const [ciAmount, ciYears] = documentValues('ci')
  const cardLender = ITEM_DOCUMENTS.cards.texts[0][1]
  const loanLender = ITEM_DOCUMENTS.loans.texts[0][1]
  const mortgageRate = sampleNumber('mortRate')
  // an imagined buy-to-let mortgage
  const [otherOwed, otherPay, otherYears, otherRate] = documentValues('mort2')

  const fields: Record<string, FieldExample> = {
    age: {
      text: `Aoife is ${age}. She enters ${age}.`,
      where: 'your date of birth, on your passport or driving licence.',
    },
    retireAge: {
      text: `Aoife wants to retire at ${retireAge}, before her State Pension starts at ${statePensionAge}. She enters ${retireAge}.`,
      where: 'the normal retirement age on your annual pension benefit statement.',
    },
    pAge: {
      text: `Aoife's partner Cian was born on 3 March ${partnerBirthYear}. She enters 3, 3 and ${partnerBirthYear}.`,
      where: "your partner's passport, driving licence or birth certificate.",
    },
    work: {
      options: [
        ['Employed', 'you get a payslip'],
        ['Self-employed', 'you file a Form 11'],
        ['Not working', 'no earnings right now'],
      ],
      text: `Aoife has a payslip, so she picks ${sampleValue('work')}.`,
      where: 'your payslip, or your Form 11 if self-employed.',
    },
    income: {
      text: `Aoife earns ${sampleEuros('income')} a year before tax. She enters ${sampleEuros('income')}.`,
      where: 'gross pay on your payslip, or your Employment Detail Summary in Revenue myAccount.',
    },
    pIncome: {
      text: `Cian earns ${sampleEuros('pIncome')} a year before tax. Aoife enters ${sampleEuros('pIncome')}.`,
      where: "your partner's payslip or Employment Detail Summary (Revenue myAccount).",
    },
    otherM: {
      text: `Aoife and Cian have no other income, such as rent or maintenance. They enter ${sampleEuros('otherM')}.`,
      where: 'your bank statements, or Revenue myAccount for rental income.',
    },
    costsM: {
      text: `Aoife and Cian spend ${sampleEuros('costsM')} a month on bills, food and extras, not counting the mortgage or loans. They enter ${sampleEuros('costsM')}.`,
      where: "your banking app's spending summary, or 3 months of current-account statements.",
    },
    oneOffY: {
      text: `Aoife and Cian's yearly one-off costs, such as car tax, insurance and holidays, come to ${sampleEuros('oneOffY')}. They enter ${sampleEuros('oneOffY')}.`,
      where: "last year's bank statements.",
    },
    home: {
      options: [
        ['Own outright', 'no mortgage'],
        ['Own with mortgage', 'still paying it off'],
        ['Rent', 'you pay a landlord'],
        ['Live with family', 'no rent or mortgage'],
      ],
      text: `They're paying off a mortgage, so Aoife picks ${sampleValue('home')}.`,
      where: 'your mortgage statement or tenancy agreement.',
    },
    homeValue: {
      text: `Aoife and Cian think their home is worth about ${sampleEuros('homeValue')}. They enter ${sampleEuros('homeValue')}.`,
      where: 'sale prices of similar homes on the Property Price Register, or your LPT valuation.',
    },
    cash: {
      text: `Aoife and Cian have ${sampleEuros('cash')} in savings, including the credit union. They enter ${sampleEuros('cash')}.`,
      where: 'your banking and credit union apps, or An Post State Savings.',
    },
    invest: {
      text: `Aoife's investment statement shows ${sampleEuros('invest')}. She enters ${sampleEuros('invest')}.`,
      where: 'your investment, share-scheme or broker statement or app.',
    },
    propValue: {
      text: "Aoife and Cian don't own another property. They enter €0.",
      where: 'for a property you own, the Property Price Register or your LPT return.',
    },
    rentM: {
      text: "Aoife and Cian don't rent out a property, so no rent comes in. They enter €0.",
      where: 'your tenancy agreement or RTB registration.',
    },
    rentCostM: {
      text: "Aoife and Cian don't rent out a property, so there are no rental costs.",
      where:
        "your agent's statements, insurance and repair bills, and the mortgage statement for the rented property.",
    },
    divY: {
      text: 'Aoife holds funds, so there are no dividends to enter.',
      where: 'your broker or share-scheme statement, or the dividend vouchers.',
    },
    mortBal: {
      text: `Aoife and Cian owe ${sampleEuros('mortBal')} on their mortgage. They enter ${sampleEuros('mortBal')}.`,
      where: "your annual mortgage statement or your lender's app.",
    },
    mortPayM: {
      text: `Aoife and Cian repay ${sampleEuros('mortPayM')} a month. They enter ${sampleEuros('mortPayM')}.`,
      where: 'your mortgage statement, or the direct debit on your bank statement.',
    },
    mortYears: {
      text: `Aoife and Cian's mortgage has ${sampleValue('mortYears')} years left. They enter ${sampleValue('mortYears')}.`,
      where: 'the remaining term on your annual mortgage statement.',
    },
    cardBal: {
      text: `Aoife and Cian owe ${sampleEuros('cardBal')} on their credit card. They enter ${sampleEuros('cardBal')}.`,
      where: 'your latest credit-card statement or banking app.',
    },
    cardPayM: {
      text: `They pay ${sampleEuros('cardPayM')} a month off the card. They enter ${sampleEuros('cardPayM')}.`,
      where: 'your card statement or banking app: what you actually pay.',
    },
    loanBal: {
      text: `Aoife and Cian owe ${sampleEuros('loanBal')} on a car loan. They enter ${sampleEuros('loanBal')}.`,
      where: 'your loan statement, credit union app or Central Credit Register report.',
    },
    loanPayM: {
      text: `They repay ${sampleEuros('loanPayM')} a month on the car loan. They enter ${sampleEuros('loanPayM')}.`,
      where: 'your loan agreement, or the payment on your bank statement.',
    },
    life: {
      options: YES_NO_NOT_SURE,
      text: `Aoife has life cover, so she picks ${sampleValue('life')}.`,
      where: 'your policy schedule, or HR for cover through work.',
    },
    ip: {
      options: YES_NO_NOT_SURE,
      text: `Aoife has no income protection, so she picks ${sampleValue('ip')}.`,
      where: "your policy documents or your employer's benefits booklet.",
    },
    ci: {
      options: YES_NO_NOT_SURE,
      text: `Aoife isn't sure about serious illness cover, so she picks ${sampleValue('ci')}.`,
      where: 'your policy documents, or ask your insurer.',
    },
    workCover: {
      options: YES_NO_NOT_SURE,
      text: `Aoife's job includes cover, such as death-in-service, so she picks ${sampleValue('workCover')}.`,
      where: "your employer's benefits booklet or HR.",
    },
    health: {
      options: YES_NO_NOT_SURE,
      text: `Aoife and Cian have health insurance, so Aoife picks ${sampleValue('health')}.`,
      where: "your health insurer's renewal letter or app.",
    },
    pension: {
      text: `Aoife's pension statement shows ${sampleEuros('pension')}. She enters ${sampleEuros('pension')}.`,
      where: "your annual pension benefit statement or the provider's app. Add all pots together.",
    },
    pensionM: {
      text: `${sampleEuros('pensionM')} goes into Aoife's pension each month, including her employer's share. She enters ${sampleEuros('pensionM')}.`,
      where: "your payslip (your share) and annual benefit statement (your employer's).",
    },
    pensionOwnM: {
      text: `Of the ${sampleEuros('pensionM')}, Aoife pays ${ownPensionM} herself. She enters ${ownPensionM}.`,
      where: 'the pension deduction on your payslip.',
    },
    ae: {
      options: [
        ['Yes', 'My Future Fund comes off your pay'],
        ['No', "you're not enrolled"],
        ['Not sure', 'check your payslip'],
      ],
      text: 'Aoife already pays into a workplace pension, so she picks No.',
      where: 'a My Future Fund deduction on your payslip.',
    },
    sp: {
      options: [
        ['Expect full', `about ${fullPrsiYears} years of PRSI by ${statePensionAge}`],
        ['Partly', 'fewer years'],
        ['Not sure', 'check first'],
      ],
      text: `Aoife expects the full rate, so she picks ${sampleValue('sp')}.`,
      where: 'your PRSI record and State Pension statement on MyWelfare.ie.',
    },
    pSp: {
      options: [
        ['Own full', 'their own full rate'],
        ['Own partial', 'a reduced rate'],
        ['Qualified adult increase', 'an addition to yours'],
        ['None', ''],
        ['Not sure', ''],
      ],
      text: "Cian isn't sure of his rate yet, so Aoife picks Not sure.",
      where: "your partner's MyWelfare.ie record.",
    },
    mortYN: {
      options: [
        ['Yes', 'you owe money on the home you live in'],
        ['No', 'you own it outright, rent, or live with family'],
      ],
      text: 'Aoife and Cian are still paying off their home, so Aoife picks Yes.',
      where: "your mortgage statement, or your lender's app.",
    },
    mortRate: {
      text: `Their mortgage statement shows ${mortgageRate}% APR. They enter ${mortgageRate}.`,
      where: 'the interest rate (APR) on your annual mortgage statement.',
    },
  }

  const listItems: Record<string, FieldExample> = {
    'mort2.owed': {
      text: `Imagine Aoife and Cian also rented out a flat with a mortgage of ${euro(otherOwed)}. They would enter ${euro(otherOwed)}.`,
      where: "your annual mortgage statement or your lender's app for that property.",
    },
    'mort2.pay': {
      text: `They would repay ${euro(otherPay)} a month on the flat. They would enter ${euro(otherPay)}.`,
      where: 'that mortgage statement, or the direct debit on your bank statement.',
    },
    'mort2.years': {
      text: `The flat's mortgage would have ${otherYears} years left. They would enter ${otherYears}.`,
      where: 'the remaining term on that mortgage statement.',
    },
    'mort2.rate': {
      text: `The flat's mortgage statement would show ${otherRate}% APR. They would enter ${otherRate}.`,
      where: 'the interest rate (APR) on that mortgage statement.',
    },
    'cards.owed': fields.cardBal,
    'cards.pay': fields.cardPayM,
    'cards.lender': {
      text: `Their card statement names the lender: ${cardLender}. They enter ${cardLender}.`,
      where: 'the top of your credit-card statement.',
    },
    'cards.rate': {
      text: `Their card statement shows ${percent(SAMPLE_RATES.cardRate)}% APR. They enter ${percent(SAMPLE_RATES.cardRate)}.`,
      where: 'the interest rate (APR) on your credit-card statement.',
    },
    'loans.owed': fields.loanBal,
    'loans.pay': fields.loanPayM,
    'loans.lender': {
      text: `Their car loan is with ${loanLender}. They enter ${loanLender}.`,
      where: 'your loan agreement or statement.',
    },
    'loans.rate': {
      text: `Their car loan charges ${percent(SAMPLE_RATES.loanRate)}% APR. They enter ${percent(SAMPLE_RATES.loanRate)}.`,
      where: 'the APR on your loan agreement.',
    },
    'pens.name': {
      text: 'Aoife has one pension, through her job. She enters Work pension.',
      where: "your annual pension benefit statement or the provider's app.",
    },
    'pens.value': {
      ...fields.pension,
      where: "your annual pension benefit statement or the provider's app.",
    },
    'pens.monthly': fields.pensionM,
    'pens.own': fields.pensionOwnM,
    'life.amount': {
      text: `Aoife and Cian's life cover pays out ${euro(lifeAmount)}. They enter ${euro(lifeAmount)}.`,
      where: "your policy schedule, or your insurer's online account.",
    },
    'life.term': {
      text: `Their policy has ${lifeYears} years to run, to match the mortgage. They enter ${lifeYears}.`,
      where: 'the end date on your policy schedule.',
    },
    'ip.amount': {
      text: `Aoife has no income protection. With a policy paying ${euro(ipAmount)} a month, she would enter ${euro(ipAmount)}.`,
      where: "your policy schedule or your insurer's online account.",
    },
    'ip.term': {
      text: `Aoife has no income protection. With a policy with ${ipYears} years to run, she would enter ${ipYears}.`,
      where: 'the end date on your policy schedule.',
    },
    'ci.amount': {
      text: `Aoife isn't sure she has serious illness cover. With a policy covering ${euro(ciAmount)}, she would enter ${euro(ciAmount)}.`,
      where: 'your policy schedule, or ask your insurer.',
    },
    'ci.term': {
      text: `Aoife isn't sure she has serious illness cover. With a policy with ${ciYears} years to run, she would enter ${ciYears}.`,
      where: 'the end date on your policy schedule.',
    },
    'workCover.amount': {
      text: `Aoife's benefits booklet says her death-in-service is ${SAMPLE_WORK_COVER_MULTIPLE} times her ${sampleEuros('income')} salary. She enters ${euro(SAMPLE_WORK_COVER_MULTIPLE * sampleNumber('income'))}.`,
      where: 'your employer benefits booklet, or ask HR.',
    },
    'workCover.mult': {
      text: `Aoife's benefits booklet says death-in-service is ${SAMPLE_WORK_COVER_MULTIPLE} times salary. She enters ${SAMPLE_WORK_COVER_MULTIPLE}.`,
      where: 'your employer benefits booklet, or ask HR.',
    },
    'health.amount': {
      text: `Aoife and Cian's health insurance costs ${healthCost} a year. They enter ${healthCost}.`,
      where: fields.health.where,
    },
  }

  return { ...fields, ...listItems }
}
