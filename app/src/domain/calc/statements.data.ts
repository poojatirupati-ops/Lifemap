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

export interface StatementText {
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
    figures: [
      { key: 'pot', label: 'Current pension value', read: 72000, confidence: 95, unit: '€' },
      { key: 'youM', label: 'Your monthly contribution', read: 260, confidence: 93, unit: '€' },
      { key: 'empM', label: 'Employer monthly contribution', read: 260, confidence: 91, unit: '€' },
      {
        key: 'nra',
        label: 'Normal retirement age on the statement',
        read: 66,
        confidence: 96,
        unit: 'age',
      },
      {
        key: 'proj',
        label: 'Projected value at retirement',
        read: 722000,
        confidence: 84,
        unit: '€',
        optional: true,
      },
      { key: 'chg', label: 'Annual charges', read: 1.0, confidence: 76, unit: '%', optional: true },
    ],
    extra: {
      title: '🏛️ State Pension record (MyWelfare)',
      figures: [
        {
          key: 'prsi',
          label: 'State Pension record: PRSI years',
          read: 28,
          confidence: 88,
          unit: 'y',
        },
      ],
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
    figures: [
      { key: 'bal', label: 'Outstanding balance', read: 203700, confidence: 96, unit: '€' },
      { key: 'rate', label: 'Interest rate', read: 3.85, confidence: 94, unit: '%' },
      { key: 'pay', label: 'Monthly repayment', read: 1180, confidence: 93, unit: '€' },
      { key: 'yrs', label: 'Term remaining', read: 21, confidence: 90, unit: 'y' },
      {
        key: 'hval',
        label: 'Property value (from the valuation)',
        read: 420000,
        confidence: 82,
        unit: '€',
        optional: true,
      },
    ],
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
    figures: [
      { key: 'tot', label: 'Total value', read: 6200, confidence: 93, unit: '€' },
      { key: 'mon', label: 'Monthly amount invested', read: 150, confidence: 90, unit: '€' },
      { key: 'sh', label: 'Holdings: shares', read: 70, confidence: 85, unit: '%', optional: true },
      { key: 'bo', label: 'Holdings: bonds', read: 20, confidence: 85, unit: '%', optional: true },
      { key: 'ca', label: 'Holdings: cash', read: 10, confidence: 85, unit: '%', optional: true },
      { key: 'chg', label: 'Annual charges', read: 0.6, confidence: 80, unit: '%', optional: true },
    ],
  },
}

export const OLD_STATEMENT = 'Statement is over 12 months old'
