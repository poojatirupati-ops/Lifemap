// Whole-number inputs shown as chips, never sliders.
import type { Unit } from './types.ts'

export interface Choice {
  value: number
  label: string
}

export const STYLE_CHOICES: Choice[] = [
  { value: 1, label: '1 · Cautious' },
  { value: 2, label: '2 · Balanced' },
  { value: 3, label: '3 · Growth' },
]

export const CHOICES: Partial<Record<Unit, Choice[]>> = {
  yn: [
    { value: 1, label: 'Yes' },
    { value: 0, label: 'No' },
  ],
  style: STYLE_CHOICES,
  tax: [
    { value: 20, label: '20%' },
    { value: 40, label: '40%' },
  ],
}
