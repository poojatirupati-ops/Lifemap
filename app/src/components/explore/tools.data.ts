// The calculator groups and the calculators Explore lists.

export type CategoryId = 'home' | 'savings' | 'retire' | 'invest' | 'protect' | 'everyday'

export interface Category {
  id: CategoryId
  name: string
  emoji: string
  color: string
  blurb: string
}

export const CATEGORIES: Category[] = (
  [
    ['home', 'Home & Mortgage', '🏡', 'var(--c2)', 'Borrowing, deposits, repayments'],
    ['savings', 'Savings & Goals', '🎯', 'var(--c3)', 'Plan any goal, see growth'],
    ['retire', 'Pensions & Retirement', '🌅', 'var(--c7)', 'Projections and income'],
    ['invest', 'Investments', '📈', 'var(--c5)', 'Growth, fees, ups and downs'],
    ['protect', 'Protection', '🛡️', 'var(--c4)', 'Cover for you and your family'],
    ['everyday', 'Everyday Money', '💶', 'var(--c1)', 'Budget, surplus, debt, net worth'],
  ] as const
).map(([id, name, emoji, color, blurb]) => ({ id, name, emoji, color, blurb }))

export interface Tool {
  id: string
  category: CategoryId
  name: string
  question: string
  emoji: string
}

// [id, group, name, the question it answers, emoji]
const ROWS: [string, CategoryId, string, string, string][] = [
  ['borrow', 'home', 'How much could I borrow?', 'What home price could be within reach?', '🏡'],
  ['repayment', 'home', 'Monthly mortgage repayment', 'What would my monthly repayment be?', '🧾'],
  ['deposit', 'home', 'Deposit calculator', 'How long until I have my deposit?', '🐷'],
  ['overpay', 'home', 'Mortgage overpayment', 'What if I paid a little extra each month?', '⏩'],
  ['ratechange', 'home', 'Interest-rate impact', 'What if my mortgage rate changed?', '📊'],
  [
    'term',
    'home',
    'Mortgage term comparison',
    'Shorter or longer term: what is the trade-off?',
    '⚖️',
  ],
  ['rentbuy', 'home', 'Rent vs buy', 'How do renting and buying compare over time?', '🔄'],
  ['goalplanner', 'savings', 'Goal planner', 'How much a month to reach my goal?', '🎯'],
  ['compound', 'savings', 'Compound growth', 'What could regular saving grow into?', '🌱'],
  ['lumpsum', 'invest', 'Lump-sum growth', 'What could a one-off amount become?', '💎'],
  ['emergency', 'savings', 'Emergency fund', 'How strong is my emergency fund?', '🪂'],
  [
    'retirement',
    'retire',
    'Retirement projection',
    'Could your current path fund the retirement you want?',
    '🌅',
  ],
  [
    'contrib',
    'retire',
    'Contribution impact',
    'What difference would a small increase make?',
    '➕',
  ],
  ['avc', 'retire', 'AVC impact', 'What could extra voluntary contributions add?', '🧩'],
  [
    'lastmoney',
    'retire',
    'Will my money last?',
    'How long could my retirement savings last?',
    '⏳',
  ],
  [
    'drawdown',
    'retire',
    'Retirement drawdown scenarios',
    'How do different growth rates change things?',
    '🧭',
  ],
  [
    'realreturn',
    'invest',
    'Inflation-adjusted return',
    'What is my money really worth in future?',
    '🔍',
  ],
  ['regularinvest', 'invest', 'Regular investing', 'What could investing monthly build?', '🔁'],
  ['fees', 'invest', 'Fees impact', 'How much do fees really cost over time?', '🧮'],
  [
    'riskreturn',
    'invest',
    'Risk & return simulator',
    'What range of outcomes might each style have?',
    '🎢',
  ],
  ['lifecover', 'protect', 'Life cover estimator', 'How much cover might my family need?', '🛡️'],
  [
    'incomegap',
    'protect',
    'Income protection gap',
    "How long could I cope if I couldn't work?",
    '🩺',
  ],
  [
    'mortgageprotect',
    'protect',
    'Mortgage protection',
    'What cover would clear my mortgage?',
    '🏠',
  ],
  ['networth', 'everyday', 'Net worth', 'What am I worth, all in?', '🧾'],
  ['surplus', 'everyday', 'Monthly surplus', 'What is left at the end of the month?', '➗'],
  ['budget', 'everyday', 'Budget (50/30/20)', 'A simple way to split your pay', '🥧'],
  ['debtpay', 'everyday', 'Debt repayment', 'How fast can I clear my debt?', '✂️'],
  ['loan', 'everyday', 'Loan repayment', 'What would a loan cost me?', '🚗'],
]

/** Every calculator, in the order the groups list them. The maths lives with the calculator screen. */
export const TOOLS: Tool[] = ROWS.map(([id, category, name, question, emoji]) => {
  return { id, category, name, question, emoji }
})

export const toolsIn = (category: CategoryId) => TOOLS.filter((tool) => tool.category === category)

export const toolById = (id: string) => TOOLS.find((t) => t.id === id)!
export const categoryById = (id: string) => CATEGORIES.find((c) => c.id === id)!
