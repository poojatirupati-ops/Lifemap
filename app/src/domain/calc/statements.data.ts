// The demo statements Explore reads (a mock reader): the figures with how sure the reader is.

export interface StatementFigure {
  key: string
  label: string
  /** The figure as read. */
  read: number
  /** How sure the reader is, in %. */
  confidence: number
  unit: '€' | '%' | 'y' | 'age'
  /** Charges, a projection, holdings or a valuation: applies only when shown; cleared = not shown. */
  optional?: true
}

interface StatementText {
  label: string
  text: string
  confidence: number
}

export interface StatementKind {
  emoji: string
  title: string
  /** "pension", "mortgage", "investment": what the statement is about. */
  what: string
  date: string
  /** Over 12 months old. */
  old: boolean
  figures: StatementFigure[]
  /** Read as text. */
  texts?: StatementText[]
  /** A second card read from the same upload (the State Pension record). */
  extra?: { title: string; figures: StatementFigure[] }
  /** The tool the customer lands on after confirming. */
  opens: string
  /** Where the figures go in Your finances (for the toast). */
  where: string
  /** The reader's "projection is in today's money?" flag (workbook C12). */
  projectionInTodaysMoney?: 'Yes' | 'No'
}

type FigureRow = [
  key: string,
  label: string,
  read: number,
  confidence: number,
  unit: StatementFigure['unit'],
  optional?: true,
]

const figures = (rows: FigureRow[]): StatementFigure[] =>
  rows.map(([key, label, read, confidence, unit, optional]) => ({
    key,
    label,
    read,
    confidence,
    unit,
    ...(optional && { optional }),
  }))

// [key, label, as read, % sure, unit, optional]
export const STATEMENT_KINDS: Record<string, StatementKind> = {
  retire: {
    emoji: '🌅',
    title: 'Pension benefit statement',
    what: 'pension',
    date: 'Jul 2025',
    old: true,
    projectionInTodaysMoney: 'No',
    texts: [
      { label: 'Projection basis', text: "Future money (not today's money)", confidence: 86 },
    ],
    opens: 'retirement',
    where: 'pension',
    figures: figures([
      ['pot', 'Current pension value', 72000, 95, '€'],
      ['youM', 'Your monthly contribution', 260, 93, '€'],
      ['empM', 'Employer monthly contribution', 260, 91, '€'],
      ['nra', 'Normal retirement age on the statement', 66, 96, 'age'],
      ['proj', 'Projected value at retirement', 722000, 84, '€', true],
      ['chg', 'Annual charges', 1.0, 76, '%', true],
    ]),
    extra: {
      title: '🏛️ State Pension record (MyWelfare)',
      figures: figures([['prsi', 'State Pension record: PRSI years', 28, 88, 'y']]),
    },
  },
  home: {
    emoji: '🏡',
    title: 'Mortgage statement',
    what: 'mortgage',
    date: 'Aug 2026',
    old: false,
    opens: 'repayment',
    where: 'liabilities and assets',
    figures: figures([
      ['bal', 'Outstanding balance', 203700, 96, '€'],
      ['rate', 'Interest rate', 3.85, 94, '%'],
      ['pay', 'Monthly repayment', 1180, 93, '€'],
      ['yrs', 'Term remaining', 21, 90, 'y'],
      ['hval', 'Property value (from the valuation)', 420000, 82, '€', true],
    ]),
    texts: [
      { label: 'Rate type', text: 'Fixed until Mar 2028', confidence: 88 },
      { label: 'Lender', text: 'Demo Bank A', confidence: 97 },
    ],
  },
  invest: {
    emoji: '📈',
    title: 'Investment statement',
    what: 'investment',
    date: 'Jun 2026',
    old: false,
    opens: 'regularinvest',
    where: 'assets',
    figures: figures([
      ['tot', 'Total value', 6200, 93, '€'],
      ['mon', 'Monthly amount invested', 150, 90, '€'],
      ['sh', 'Holdings: shares', 70, 85, '%', true],
      ['bo', 'Holdings: bonds', 20, 85, '%', true],
      ['ca', 'Holdings: cash', 10, 85, '%', true],
      ['chg', 'Annual charges', 0.6, 80, '%', true],
    ]),
  },
}

export const OLD_STATEMENT = 'Statement is over 12 months old'
