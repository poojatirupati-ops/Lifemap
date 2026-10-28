// What Explore features: focus areas, live sessions and the statements that fill in tools.
import type { VideoKind } from './videos.data.ts'
import type { CategoryId } from './tools.data.ts'

// The calculator list is in its own file; other areas import everything Explore from here.
export * from './tools.data.ts'

export interface Topic {
  emoji: string
  name: string
  blurb: string
  expert: VideoKind
  category: CategoryId
  /** The --art-* picture and, for photos, where the photo is centred. */
  art: string
  photoPosition?: string
  tools: string[]
}

export const TOPICS: Topic[] = [
  {
    emoji: '🏡',
    name: 'Mortgages',
    blurb: 'Buying, switching and paying off faster',
    expert: 'mortgage',
    category: 'home',
    art: 'mortgage',
    photoPosition: '50% 45%',
    tools: ['repayment', 'borrow', 'overpay', 'deposit'],
  },
  {
    emoji: '🌅',
    name: 'Pensions',
    blurb: 'Tax relief, PRSAs and retirement income',
    expert: 'pension',
    category: 'retire',
    art: 'pension',
    photoPosition: '50% 35%',
    tools: ['retirement', 'contrib', 'lastmoney'],
  },
  {
    emoji: '🛡️',
    name: 'Protection',
    blurb: 'Life cover, income protection, serious illness',
    expert: 'protection',
    category: 'protect',
    art: 'protection',
    photoPosition: '50% 35%',
    tools: ['lifecover', 'incomegap', 'mortgageprotect'],
  },
  {
    emoji: '📈',
    name: 'Investing',
    blurb: 'Risk, time and fees, explained simply',
    expert: 'investment',
    category: 'invest',
    art: 'investing',
    photoPosition: '50% 50%',
    tools: ['regularinvest', 'lumpsum', 'realreturn', 'fees'],
  },
  {
    emoji: '🐷',
    name: 'Savings',
    blurb: 'Emergency fund and goal saving',
    expert: 'planner',
    category: 'savings',
    art: 'savings',
    photoPosition: '50% 50%',
    tools: ['goalplanner', 'emergency', 'compound'],
  },
  {
    emoji: '💶',
    name: 'Everyday money',
    blurb: 'Budget, surplus and debt',
    expert: 'planner',
    category: 'everyday',
    art: 'everyday',
    photoPosition: '40% 62%',
    tools: ['budget', 'surplus', 'debtpay'],
  },
]

export interface LiveSession {
  when: string
  title: string
  expert: VideoKind
}

export const LIVE_SESSIONS: LiveSession[] = [
  { when: 'Thu 7pm', title: 'First-time buyers: your questions answered', expert: 'mortgage' },
  { when: 'Tue 1pm', title: 'Pensions in 20 minutes', expert: 'pension' },
  { when: 'Sat 11am', title: 'Protecting your family, simply', expert: 'protection' },
]

/** The groups whose tools a statement can fill in, and what the statement is. */
export const STATEMENTS: Partial<Record<CategoryId, { what: string; reads: string[] }>> = {
  retire: {
    what: 'pension',
    reads: [
      'Pension benefit statement',
      'Annual pension statement',
      'PRSA statement',
      'Employer scheme / Occupational pension statement',
      'State Pension record (MyWelfare)',
    ],
  },
  home: {
    what: 'mortgage',
    reads: [
      'Mortgage statement',
      'Annual mortgage statement',
      'Mortgage offer letter',
      'Property valuation',
      'LPT record',
    ],
  },
  invest: {
    what: 'investment',
    reads: [
      'Investment / brokerage statement',
      'Fund statement',
      'Share scheme / ESPP / RSU statement',
      'Crypto holdings statement',
    ],
  },
}

/** "a mortgage", "an investment". */
export const withArticle = (word: string) => (/^[aeiou]/i.test(word) ? 'an ' : 'a ') + word
