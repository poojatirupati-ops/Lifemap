// The sections of Your finances, and what the demo "upload" reads from each section's documents.
export type FinanceSection = {
  id: string
  title: string
  emoji: string
  documents: [emoji: string, label: string][]
  fields: string[]
}

export type SectionUpload = {
  values: Record<string, [value: string | number, confidence: number]>
  // read but not shown as a field of the section
  hidden?: Record<string, [value: number, confidence: number]>
  documents: string[]
  staleNotes?: Record<string, string>
}

export const FINANCE_SECTIONS: FinanceSection[] = [
  {
    id: 'about',
    title: 'About you',
    emoji: '🙋',
    documents: [],
    fields: ['name', 'age', 'retireAge', 'pAge'],
  },
  {
    id: 'income',
    title: 'Income and expenses',
    emoji: '💶',
    documents: [
      ['🧾', 'Payslips (last 3)'],
      ['🏛️', 'Employment Detail Summary'],
      ['🏦', 'Current-account statements'],
      ['📑', 'Form 11 / Notice of Assessment'],
    ],
    fields: ['work', 'income', 'pIncome', 'otherM', 'costsM', 'oneOffY'],
  },
  {
    id: 'assets',
    title: 'Assets',
    emoji: '🏠',
    documents: [
      ['🐷', 'Savings or credit-union statement'],
      ['📈', 'Investment statement'],
      ['🪙', 'Share scheme or crypto statement'],
      ['🏡', 'Property valuation or LPT record'],
    ],
    fields: [
      'home',
      'homeValue',
      'homeUse',
      'downAge',
      'downValue',
      'cash',
      'savings',
      'invest',
      'otherAssets',
      'altInv',
      'propValue',
      'rentM',
    ],
  },
  {
    id: 'liab',
    title: 'Liabilities',
    emoji: '💳',
    documents: [
      ['🏠', 'Mortgage statement'],
      ['📄', 'Loan statement'],
      ['💳', 'Credit-card statement'],
      ['🗂️', 'Central Credit Register report'],
    ],
    fields: [
      'mortYN',
      'mortBal',
      'mortPayM',
      'mortYears',
      'mortRate',
      'cardBal',
      'cardPayM',
      'cardRate',
      'loanBal',
      'loanPayM',
      'loanRate',
      'mort2',
    ],
  },
  {
    id: 'prot',
    title: 'Protection',
    emoji: '🛡️',
    documents: [],
    fields: ['life', 'ip', 'ci', 'workCover', 'health'],
  },
  {
    id: 'pension',
    title: 'Pension',
    emoji: '🌅',
    documents: [
      ['📊', 'Pension statement'],
      ['🏢', 'Employer scheme details'],
      ['🏛️', 'State Pension record (MyWelfare)'],
    ],
    fields: [
      'pension',
      'pensionM',
      'pensionOwnM',
      'ae',
      'sp',
      'pSp',
      'polLump',
      'polLumpAge',
      'polInc',
      'polIncAge',
    ],
  },
]

export const SECTION_UPLOADS: Record<string, SectionUpload> = {
  income: {
    values: {
      work: ['Employed', 99],
      income: [58000, 98],
      costsM: [3100, 74],
      oneOffY: [1800, 81],
    },
    documents: ['Payslip · Aug 2026', 'Current-account statement · Jun–Aug 2026'],
  },
  assets: {
    values: { cash: [9000, 97], invest: [6200, 88] },
    documents: ['Savings statement · Sep 2026', 'Investment statement · Jun 2026'],
  },
  liab: {
    values: {
      home: ['Own with mortgage', 99],
      mortBal: [203700, 96],
      mortPayM: [1180, 93],
      mortYears: [21, 90],
      cardBal: [400, 86],
      cardPayM: [40, 80],
      loanBal: [3500, 88],
      loanPayM: [100, 84],
    },
    hidden: { mortRate: [3.85, 94] },
    documents: [
      'Mortgage statement · Aug 2026',
      'Credit-card statement · Sep 2026',
      'Car loan statement · Aug 2026',
    ],
  },
  prot: {
    values: { life: ['Yes', 95], ip: ['No', 82], workCover: ['Yes', 90], health: ['Yes', 97] },
    documents: ['Life cover policy · 2021', 'Employer benefits statement · 2026'],
  },
  pension: {
    values: { pension: [72000, 95], pensionM: [520, 91], pensionOwnM: [260, 91] },
    documents: ['Pension statement · Jul 2025'],
    staleNotes: { pension: 'Statement is over 12 months old' },
  },
}
