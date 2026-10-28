// What the Mortgages topic page shows for each situation: calculators, story videos, reading and live sessions.

export interface CalculatorCard {
  label: string
  photo: string
  /** The calculator it opens. */
  tool: string
  emoji: string
  /** Shown instead of the calculator's own name. */
  name?: string
}

export const CALCULATOR_CARDS: Record<string, CalculatorCard> = {
  borrow: { label: 'Borrow', photo: 'house-for-sale', tool: 'borrow', emoji: '🏡' },
  repay: { label: 'Repayment', photo: 'home-keys', tool: 'repayment', emoji: '🧾' },
  deposit: { label: 'Deposit', photo: 'savings-jar', tool: 'deposit', emoji: '🐷' },
  overpay: { label: 'Overpay', photo: 'money-plant', tool: 'overpay', emoji: '⏩' },
  rate: { label: 'Rate change', photo: 'invest-charts', tool: 'ratechange', emoji: '📊' },
  term: { label: 'Term', photo: 'couple-planning', tool: 'term', emoji: '⚖️' },
  rent: { label: 'Rent vs buy', photo: 'family-couch', tool: 'rentbuy', emoji: '🔄' },
  topup: {
    label: 'Top-up',
    photo: 'car-key',
    tool: 'repayment',
    emoji: '🧾',
    name: 'Repayment with a top-up',
  },
}

export interface StoryVideo {
  short: string
  title: string
  duration: string
  color: string
  emoji: string
  /** The calculator "Up next" opens. */
  tool: string
  chapters: string[]
  /** The filmed video in the library, when there is one. */
  videoId?: string
}

export interface Reading {
  kind: string
  title: string
  emoji: string
}

export interface Situation {
  name: string
  calculators: string[]
  videos: StoryVideo[]
  reading: Reading[]
  live: { when: string; title: string }[]
}

export const SITUATIONS: Situation[] = [
  {
    name: 'Buying',
    calculators: ['borrow', 'deposit', 'repay', 'rent', 'term', 'rate', 'overpay'],
    videos: [
      {
        short: 'Deposit to keys',
        title: 'Your first home: deposit to keys',
        duration: '0:53',
        color: '#0A7068',
        emoji: '🔑',
        tool: 'deposit',
        chapters: ['Deposit', 'Costs', 'Schemes'],
        videoId: 'v1',
      },
      {
        short: 'How much can I borrow?',
        title: 'How much can I borrow? A first-time buyer’s guide',
        duration: '2:56',
        color: '#0B2545',
        emoji: '🏡',
        tool: 'borrow',
        chapters: ['The limit', 'Deposit', 'Repayments'],
        videoId: 'v9',
      },
      {
        short: 'Help to Buy 2027',
        title: 'Help to Buy: what changed for 2027',
        duration: '1:20',
        color: '#5E548E',
        emoji: '🎁',
        tool: 'deposit',
        chapters: ['The change', 'Who gains', 'How to claim'],
      },
      {
        short: 'Fixed or variable?',
        title: 'Fixed or variable: which suits you?',
        duration: '1:05',
        color: '#13315C',
        emoji: '🔒',
        tool: 'ratechange',
        chapters: ['Fixed', 'Variable', 'Choosing'],
      },
    ],
    reading: [
      { kind: 'Articles', title: 'Help to Buy and First Home Scheme: 2027', emoji: '📄' },
      { kind: 'FAQs', title: 'Can I get help with my deposit?', emoji: '❓' },
      { kind: 'Links', title: 'Help to Buy on Revenue', emoji: '🔗' },
    ],
    live: [
      { when: 'Thu 7pm', title: 'First-time buyers: your questions answered' },
      { when: 'Tue 1pm', title: 'Help to Buy and First Home Scheme in 20 minutes' },
    ],
  },
  {
    name: 'Switching',
    calculators: ['rate', 'repay', 'overpay', 'term', 'borrow', 'deposit', 'rent'],
    videos: [
      {
        short: 'Should I switch?',
        title: 'Should I switch my mortgage?',
        duration: '1:30',
        color: '#A8432B',
        emoji: '🔄',
        tool: 'ratechange',
        chapters: ['Why switch', 'Costs', 'Steps'],
      },
      {
        short: 'Fixed rate ending',
        title: 'Your fixed rate is ending: what now?',
        duration: '1:00',
        color: '#0B2545',
        emoji: '📅',
        tool: 'ratechange',
        chapters: ['Timing', 'Your lender', 'Compare'],
      },
      {
        short: 'Tax credit',
        title: 'Are you owed the mortgage interest tax credit?',
        duration: '0:55',
        color: '#0A7068',
        emoji: '🧾',
        tool: 'repayment',
        chapters: ['Who qualifies', 'How much', 'How to claim'],
      },
      {
        short: 'Overpaying',
        title: 'Is it worth overpaying my mortgage?',
        duration: '1:15',
        color: '#13315C',
        emoji: '⏩',
        tool: 'overpay',
        chapters: ['How it works', 'Limits', 'Or pension?'],
      },
    ],
    reading: [
      { kind: 'Articles', title: 'Are you owed the mortgage interest tax credit?', emoji: '📄' },
      { kind: 'FAQs', title: 'My fixed rate is ending: should I switch?', emoji: '❓' },
      { kind: 'Links', title: 'CCPC mortgage comparison', emoji: '🔗' },
    ],
    live: [
      { when: 'Wed 1pm', title: 'Switching in 2026: is now the time?' },
      { when: 'Mon 7pm', title: 'Fixed rate ending? Ask us anything' },
    ],
  },
  {
    name: 'Borrowing more',
    calculators: ['topup', 'term', 'overpay', 'rate', 'borrow', 'deposit', 'rent'],
    videos: [
      {
        short: 'Top-up costs',
        title: 'What a top-up really costs',
        duration: '1:10',
        color: '#0B2545',
        emoji: '🔨',
        tool: 'repayment',
        chapters: ['How it works', 'Monthly', 'Total cost'],
      },
      {
        short: 'Top-up or loan?',
        title: 'Top-up, loan or savings?',
        duration: '1:05',
        color: '#A8432B',
        emoji: '⚖️',
        tool: 'term',
        chapters: ['Rates', 'Terms', 'Choosing'],
      },
      {
        short: 'Helping your child',
        title: 'Helping your child buy a home',
        duration: '1:20',
        color: '#5E548E',
        emoji: '🤝',
        tool: 'repayment',
        chapters: ['Gifts', 'Lenders', 'Your plan'],
      },
    ],
    reading: [
      { kind: 'Articles', title: 'Helping your child buy a home', emoji: '📄' },
      { kind: 'FAQs', title: 'Can I borrow against my home?', emoji: '❓' },
      { kind: 'Links', title: 'CCPC: mortgage top-up', emoji: '🔗' },
    ],
    live: [{ when: 'Sat 11am', title: 'Extensions and top-ups: what to know' }],
  },
]

/** Pictures for video cards without a poster, and for the reading cards, taken in turn. */
export const VIDEO_PHOTOS = [
  'home-keys',
  'house-for-sale',
  'money-plant',
  'invest-charts',
  'couple-planning',
]
export const READING_PHOTOS = ['home-keys', 'savings-jar', 'invest-charts']

export const photo = (name: string) => `media/${name}.jpg`
