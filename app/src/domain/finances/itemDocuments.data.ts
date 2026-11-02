// The example statement for each kind of item (a mock reader): what reading it fills in.
import type { ListKey } from './lists.data.ts'

// what reading an uploaded statement fills in: [field, value, confidence %]
type ItemDocument = {
  title: string
  figures: [field: string, value: number, confidence: number][]
  texts?: [field: string, text: string][]
  staleNote?: string
}

export const ITEM_DOCUMENTS = {
  cards: {
    title: 'Credit-card statement · Sep 2026',
    figures: [
      ['owed', 400, 86],
      ['pay', 40, 80],
    ],
    texts: [['lender', 'Demo Bank B']],
  },
  loans: {
    title: 'Car loan statement · Aug 2026',
    figures: [
      ['owed', 3500, 88],
      ['pay', 100, 84],
    ],
    texts: [['lender', 'Demo Credit Union']],
  },
  mort2: {
    title: 'Mortgage statement (other property) · Aug 2026',
    figures: [
      ['owed', 185000, 92],
      ['pay', 950, 90],
      ['years', 18, 88],
      ['rate', 4.1, 90],
    ],
  },
  pens: {
    title: 'Pension statement · Jul 2025',
    figures: [
      ['value', 72000, 95],
      ['monthly', 520, 91],
      ['own', 260, 91],
    ],
    staleNote: 'Statement is over 12 months old',
  },
  life: {
    title: 'Life cover policy · 2021',
    figures: [
      ['amount', 250000, 95],
      ['term', 21, 90],
    ],
  },
  ip: {
    title: 'Income protection policy · 2022',
    figures: [
      ['amount', 1800, 90],
      ['term', 20, 88],
    ],
  },
  ci: {
    title: 'Serious illness policy · 2022',
    figures: [
      ['amount', 50000, 90],
      ['term', 15, 88],
    ],
  },
  workCover: { title: 'Employer benefits statement · 2026', figures: [['amount', 174000, 90]] },
  health: { title: 'Health insurance policy · 2026', figures: [['amount', 2400, 92]] },
} satisfies Record<ListKey, ItemDocument>

/** What reading one item's statement fills in. */
export const itemDocumentOf = (list: ListKey): ItemDocument => ITEM_DOCUMENTS[list]
