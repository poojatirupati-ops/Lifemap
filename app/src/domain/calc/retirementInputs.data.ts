// The retirement projection's inputs and what-ifs.
import type { CalcInput } from './types.ts'

export const RETIREMENT_INPUTS: CalcInput[] = [
  { key: 'age', label: 'Your age', example: 40, min: 20, max: 70, step: 1, unit: 'age' },
  {
    key: 'ra',
    label: 'Target retirement age',
    example: 65,
    min: 21,
    max: 104,
    step: 1,
    unit: 'age',
  },
  {
    key: 'pot',
    label: 'Pension value today',
    example: 60000,
    min: 0,
    max: 1500000,
    step: 1000,
    unit: '€',
  },
  {
    key: 'm',
    label: 'Monthly contributions (you + employer)',
    example: 500,
    min: 0,
    max: 5000,
    step: 10,
    unit: '€',
  },
  {
    key: 'd',
    label: "Desired yearly income in retirement (today's money, before tax)",
    example: 40000,
    min: 10000,
    max: 150000,
    step: 1000,
    unit: '€',
  },
  {
    key: 'o',
    label: "Other yearly income, e.g. State Pension (today's money)",
    example: 15000,
    min: 0,
    max: 50000,
    step: 500,
    unit: '€',
  },
  {
    key: 'g',
    label: 'Growth after charges',
    example: 4.5,
    min: 1,
    max: 7,
    step: 0.25,
    unit: '%',
  },
]

export const RETIREMENT_WHAT_IFS: CalcInput[] = [
  { key: 'later', label: 'Retire later by', example: 0, min: 0, max: 5, step: 1, unit: 'y' },
  {
    key: 'more',
    label: 'Save more each month',
    example: 0,
    min: 0,
    max: 1500,
    step: 50,
    unit: '€',
  },
  {
    key: 'less',
    label: 'Spend less in retirement (a year)',
    example: 0,
    min: 0,
    max: 20000,
    step: 500,
    unit: '€',
  },
]
