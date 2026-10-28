// The calculator groups and the calculators Explore lists.

export type CategoryId = 'home' | 'savings' | 'retire' | 'invest' | 'protect' | 'everyday'

export interface Category {
  id: CategoryId
  name: string
  emoji: string
  color: string
  blurb: string
}

export const CATEGORIES: Category[] = [
  {
    id: 'home',
    name: 'Home & Mortgage',
    emoji: '🏡',
    color: 'var(--c2)',
    blurb: 'Borrowing, deposits, repayments',
  },
  {
    id: 'savings',
    name: 'Savings & Goals',
    emoji: '🎯',
    color: 'var(--c3)',
    blurb: 'Plan any goal, see growth',
  },
  {
    id: 'retire',
    name: 'Pensions & Retirement',
    emoji: '🌅',
    color: 'var(--c7)',
    blurb: 'Projections and income',
  },
  {
    id: 'invest',
    name: 'Investments',
    emoji: '📈',
    color: 'var(--c5)',
    blurb: 'Growth, fees, ups and downs',
  },
  {
    id: 'protect',
    name: 'Protection',
    emoji: '🛡️',
    color: 'var(--c4)',
    blurb: 'Cover for you and your family',
  },
  {
    id: 'everyday',
    name: 'Everyday Money',
    emoji: '💶',
    color: 'var(--c1)',
    blurb: 'Budget, surplus, debt, net worth',
  },
]

export interface Tool {
  id: string
  category: CategoryId
  name: string
  question: string
  emoji: string
}

const tool = (
  id: string,
  category: CategoryId,
  name: string,
  question: string,
  emoji: string,
): Tool => ({
  id,
  category,
  name,
  question,
  emoji,
})

/** Every calculator, in the order the groups list them. The maths lives with the calculator screen. */
export const TOOLS: Tool[] = [
  tool(
    'borrow',
    'home',
    'How much could I borrow?',
    'What home price could be within reach?',
    '🏡',
  ),
  tool(
    'repayment',
    'home',
    'Monthly mortgage repayment',
    'What would my monthly repayment be?',
    '🧾',
  ),
  tool('deposit', 'home', 'Deposit calculator', 'How long until I have my deposit?', '🐷'),
  tool(
    'overpay',
    'home',
    'Mortgage overpayment',
    'What if I paid a little extra each month?',
    '⏩',
  ),
  tool('ratechange', 'home', 'Interest-rate impact', 'What if my mortgage rate changed?', '📊'),
  tool(
    'term',
    'home',
    'Mortgage term comparison',
    'Shorter or longer term: what is the trade-off?',
    '⚖️',
  ),
  tool('rentbuy', 'home', 'Rent vs buy', 'How do renting and buying compare over time?', '🔄'),
  tool('goalplanner', 'savings', 'Goal planner', 'How much a month to reach my goal?', '🎯'),
  tool('compound', 'savings', 'Compound growth', 'What could regular saving grow into?', '🌱'),
  tool('lumpsum', 'invest', 'Lump-sum growth', 'What could a one-off amount become?', '💎'),
  tool('emergency', 'savings', 'Emergency fund', 'How strong is my emergency fund?', '🪂'),
  tool(
    'retirement',
    'retire',
    'Retirement projection',
    'Could your current path fund the retirement you want?',
    '🌅',
  ),
  tool(
    'contrib',
    'retire',
    'Contribution impact',
    'What difference would a small increase make?',
    '➕',
  ),
  tool('avc', 'retire', 'AVC impact', 'What could extra voluntary contributions add?', '🧩'),
  tool(
    'lastmoney',
    'retire',
    'Will my money last?',
    'How long could my retirement savings last?',
    '⏳',
  ),
  tool(
    'drawdown',
    'retire',
    'Retirement drawdown scenarios',
    'How do different growth rates change things?',
    '🧭',
  ),
  tool(
    'realreturn',
    'invest',
    'Inflation-adjusted return',
    'What is my money really worth in future?',
    '🔍',
  ),
  tool('regularinvest', 'invest', 'Regular investing', 'What could investing monthly build?', '🔁'),
  tool('fees', 'invest', 'Fees impact', 'How much do fees really cost over time?', '🧮'),
  tool(
    'riskreturn',
    'invest',
    'Risk & return simulator',
    'What range of outcomes might each style have?',
    '🎢',
  ),
  tool(
    'lifecover',
    'protect',
    'Life cover estimator',
    'How much cover might my family need?',
    '🛡️',
  ),
  tool(
    'incomegap',
    'protect',
    'Income protection gap',
    "How long could I cope if I couldn't work?",
    '🩺',
  ),
  tool(
    'mortgageprotect',
    'protect',
    'Mortgage protection',
    'What cover would clear my mortgage?',
    '🏠',
  ),
  tool('networth', 'everyday', 'Net worth', 'What am I worth, all in?', '🧾'),
  tool('surplus', 'everyday', 'Monthly surplus', 'What is left at the end of the month?', '➗'),
  tool('budget', 'everyday', 'Budget (50/30/20)', 'A simple way to split your pay', '🥧'),
  tool('debtpay', 'everyday', 'Debt repayment', 'How fast can I clear my debt?', '✂️'),
  tool('loan', 'everyday', 'Loan repayment', 'What would a loan cost me?', '🚗'),
]

export const toolById = (id: string) => TOOLS.find((t) => t.id === id)!
export const categoryById = (id: string) => CATEGORIES.find((c) => c.id === id)!
