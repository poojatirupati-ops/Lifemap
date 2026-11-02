// Aoife and Cian, the sample customers behind the "Not sure? See an example" cards.
import { ITEM_DOCUMENTS } from './itemDocuments.data.ts'

type SampleFigure = readonly [value: string | number, source: string, confidence?: number]

export const SAMPLE_FINANCES = {
  name: ['Aoife', 'pre'],
  age: [38, 'pre'],
  retireAge: [63, 'pre'],
  pAge: [37, 'typed'],
  work: ['Employed', 'doc', 99],
  income: [58000, 'doc', 98],
  pIncome: [22000, 'typed'],
  otherM: [0, 'typed'],
  costsM: [3600, 'typed'],
  oneOffY: [1800, 'doc', 81],
  home: ['Own with mortgage', 'doc', 99],
  homeValue: [420000, 'typed'],
  cash: [9000, 'doc', 97],
  invest: [6200, 'doc', 88],
  mortBal: [203700, 'doc', 96],
  mortRate: [3.85, 'doc', 94],
  mortPayM: [1180, 'doc', 93],
  mortYears: [21, 'doc', 90],
  cardBal: [400, 'doc', 86],
  cardPayM: [40, 'doc', 80],
  loanBal: [3500, 'doc', 88],
  loanPayM: [100, 'doc', 84],
  life: ['Yes', 'doc', 95],
  ip: ['No', 'typed'],
  ci: ['Not sure', 'typed'],
  workCover: ['Yes', 'doc', 90],
  health: ['Yes', 'typed'],
  pension: [72000, 'doc', 95],
  pensionM: [520, 'doc', 91],
  sp: ['Expect full', 'typed'],
} as const satisfies Record<string, SampleFigure>

export const sampleValue = (key: keyof typeof SAMPLE_FINANCES) => SAMPLE_FINANCES[key][0]

// Aoife's own share of her pension contributions, from her pension statement
const pensionFigure = (field: string) =>
  Number(ITEM_DOCUMENTS.pens.figures.find(([key]) => key === field)?.[1])
export const SAMPLE_OWN_SHARE = pensionFigure('own') / pensionFigure('monthly')

// her death-in-service cover, in times her salary
export const SAMPLE_WORK_COVER_MULTIPLE = 3

export const SAMPLE_RATES = { cardRate: 0.2, loanRate: 0.08 }
