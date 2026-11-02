// The Discover questions and the Understand Me money-profile questions, as in the original.

export interface Option {
  emoji: string
  tag: string
  text: string
  /** 1 (most cautious) to 4 */
  score?: number
  /** the road drawn on a 'ride' card */
  path?: string
  /** a behavioural trait the adviser should see */
  trait?: string
}

interface QuestionBase {
  id: string
  /** shown above it when the money profile asks it again */
  section: [title: string, plain: string]
  chapter: number
  title: string
  subtitle: string
  options: Option[]
}

/** A 'scenario' shows an investment falling from one amount to another above the answers. */
export type DiscoverQuestion =
  | (QuestionBase & { type: 'cards' | 'ride' })
  | (QuestionBase & { type: 'scenario'; from: number; to: number })

export interface MoneyQuestion {
  id: string
  section: [title: string, plain: string]
  title: string
  help?: string
  /** a before and after amount shown above the options */
  panel?: [from: number, to: number]
  /** products the customer can tick besides the options */
  chips?: string[]
  options: Option[]
}

export interface MoneyProfileStep {
  step: number
  title: string
  term: string
  plain: string
  emoji: string
  intro: string
  /** a string is the id of a Discover question asked again here */
  questions: (string | MoneyQuestion)[]
}

export const CHAPTERS: Record<number, string> = {
  1: 'Your money mindset',
  2: 'How you decide',
  3: 'Your investment capacity',
  4: 'Your risk appetite',
  5: 'Your next chapter',
}

/** The picture behind each chapter's questions (a CSS custom property). */
export const CHAPTER_ART: Record<number, string> = {
  1: 'art-savings',
  2: 'art-investing',
  3: 'art-rain',
  4: 'art-map',
  5: 'art-pension',
}

/** The €1,000 surprise: how the customer would cover it. */
export const SURPRISE_QUESTION = '7'
/** The road they would enjoy: their risk appetite. */
export const APPETITE_QUESTION = '8'

export const DISCOVER_QUESTIONS: DiscoverQuestion[] = [
  {
    id: '2',
    section: ['Money mindset', 'how you handle money day to day'],
    chapter: 1,
    title: "Your friends would say you're always…",
    subtitle: '',
    type: 'cards',
    options: [
      { emoji: '📊', tag: 'The Budgeter', text: 'Sticking to a budget' },
      { emoji: '🔍', tag: 'Money Vigilant', text: 'Checking your balance' },
      { emoji: '📱', tag: 'The Opportunist', text: 'Trying something new' },
      { emoji: '🧘', tag: 'The Money Monk', text: 'Relaxed about money' },
    ],
  },
  {
    id: '4',
    section: ['Investor behaviour', 'how you react to a hot tip'],
    chapter: 2,
    title: "A friend's investment doubled in a month. What do you do?",
    subtitle: '',
    type: 'cards',
    options: [
      { emoji: '🏃', tag: 'FOMO · Herd behaviour', text: 'Buy in quickly, before I miss out' },
      { emoji: '🔎', tag: 'Due diligence', text: 'Research it before I decide' },
      { emoji: '🧑‍💼', tag: 'Advice-seeker', text: 'Ask an expert first' },
      { emoji: '🙅', tag: 'Loss aversion', text: 'Stay away. Sounds too risky' },
    ],
  },
  {
    id: '6',
    section: ['Investment capacity', 'what you can put to work'],
    chapter: 3,
    title: 'How much could you comfortably invest each month?',
    subtitle: 'Without cutting back on everyday life.',
    type: 'cards',
    options: [
      { emoji: '🪙', tag: 'Starter capacity', text: 'Under €100', score: 1 },
      { emoji: '💶', tag: 'Moderate capacity', text: '€100 to €300', score: 2 },
      { emoji: '💰', tag: 'Good capacity', text: '€300 to €750', score: 3 },
      { emoji: '🏦', tag: 'High capacity', text: 'Over €750', score: 4 },
      { emoji: '🎢', tag: 'Variable income', text: 'It changes month to month', score: 2 },
    ],
  },
  {
    id: '7',
    section: ['Cushion', 'money for surprises'],
    chapter: 3,
    title: 'Your car needs a €1,000 repair tomorrow. How would you cover it?',
    subtitle: '',
    type: 'cards',
    options: [
      { emoji: '✅', tag: 'Liquidity reserve', text: 'From liquid or emergency fund', score: 4 },
      { emoji: '🐷', tag: 'Goal leakage', text: 'From savings', score: 2 },
      { emoji: '💳', tag: 'Credit-funded', text: 'Put it on credit card or borrow it', score: 1 },
      { emoji: '😬', tag: 'Not planned yet', text: 'I am not sure', score: 1 },
    ],
  },
  {
    id: '8',
    section: ['Risk appetite', 'how much risk you want'],
    chapter: 4,
    title: 'Which road would you enjoy most for your long-term money?',
    subtitle: '',
    type: 'ride',
    options: [
      { emoji: '🛣️', tag: 'Low risk', text: 'Motorway', score: 1, path: 'M0 40 L140 28' },
      {
        emoji: '🏞️',
        tag: 'Cautious',
        text: 'Country road',
        score: 2,
        path: 'M0 42 L20 36 L40 40 L60 30 L80 34 L100 26 L120 28 L140 20',
      },
      {
        emoji: '🌊',
        tag: 'Balanced',
        text: 'Coast road',
        score: 3,
        path: 'M0 44 L20 26 L40 44 L60 18 L80 36 L100 12 L120 28 L140 8',
      },
      {
        emoji: '🏔️',
        tag: 'Adventurous',
        text: 'Mountain pass',
        score: 4,
        path: 'M0 46 L20 20 L40 48 L60 10 L80 42 L100 4 L120 30 L140 2',
      },
    ],
  },
  {
    id: '9',
    section: ['Investor behaviour', 'how you act when prices fall'],
    chapter: 4,
    title: 'Your €10,000 investment drops to €8,500. What do you do?',
    subtitle: '',
    type: 'scenario',
    from: 10000,
    to: 8500,
    options: [
      { emoji: '😱', tag: 'Panic selling', text: 'Sell before it drops more', score: 1 },
      {
        emoji: '😬',
        tag: 'Anchoring',
        text: "Wait until it's back to €10,000, then sell",
        score: 2,
      },
      { emoji: '😌', tag: 'Long-term investor', text: 'Stay calm and hold on', score: 3 },
      { emoji: '🛒', tag: 'Buy the dip', text: "Buy more while it's cheaper", score: 4 },
    ],
  },
  {
    id: '12',
    section: ['Money mindset', 'how you feel about money'],
    chapter: 5,
    title: 'How do you feel about your financial future?',
    subtitle: 'Every answer is normal.',
    type: 'cards',
    options: [
      { emoji: '😟', tag: 'Financial anxiety', text: 'Worried', score: 1 },
      { emoji: '🤞', tag: 'Cautious optimism', text: 'Hopeful', score: 2 },
      { emoji: '😌', tag: 'Financially confident', text: 'Confident', score: 4 },
      { emoji: '🙈', tag: 'Money avoidance', text: 'I avoid thinking about it', score: 1 },
    ],
  },
]

export const discoverQuestion = (id: string) => DISCOVER_QUESTIONS.find((q) => q.id === id)

/** Discover asks six of them; the capacity question (6) waits for the money profile. */
export const DISCOVER_SIX = DISCOVER_QUESTIONS.filter((q) => q.id !== '6')

// Understand Me (§13, 1 Oct 2026): every option carries a term tag; option order is score 1 to 4.
export const MONEY_PROFILE: MoneyProfileStep[] = [
  {
    step: 1,
    title: 'Your risk',
    term: 'Risk appetite & time horizon',
    plain: 'how much risk you want, and how long you can wait',
    emoji: '🌦️',
    intro: 'How much risk you <b>want</b> to take, and <b>how long</b> you can wait.',
    questions: [
      '8',
      '9',
      {
        id: 'u9',
        section: ['Time horizon', 'how long your money can stay invested'],
        title: 'If you put money away to grow, when might you need it back?',
        options: [
          { emoji: '⏱️', text: 'Within 2 years', tag: 'Short horizon', score: 1 },
          { emoji: '📆', text: 'In 2 to 5 years', tag: 'Medium horizon', score: 2 },
          { emoji: '🗓️', text: 'In 5 to 10 years', tag: 'Long horizon', score: 3 },
          {
            emoji: '🌳',
            text: 'Not for 10+ years',
            tag: 'Very long horizon · time in the market',
            score: 4,
          },
        ],
      },
    ],
  },
  {
    step: 2,
    title: 'Your capacity',
    term: 'Capacity for loss',
    plain: 'how much you can afford to lose',
    emoji: '🛟',
    intro: 'How much risk you <b>can</b> afford to take, without it hurting everyday life.',
    questions: [
      '6',
      '7',
      {
        id: 'u10',
        section: ['Capacity for loss', 'what a fall would really cost you'],
        title:
          'Your €25,000 investment falls by 20% over a year, to €20,000. What would that mean for your life?',
        help: "Not how you'd feel. What would really change for you.",
        panel: [25000, 20000],
        options: [
          {
            emoji: '😟',
            text: "I'd struggle with everyday bills",
            tag: 'Low capacity for loss',
            score: 1,
          },
          {
            emoji: '⏸️',
            text: "I'd have to put a plan on hold",
            tag: 'Limited capacity for loss',
            score: 2,
          },
          {
            emoji: '🙂',
            text: "It would hurt, but I'd be fine",
            tag: 'Moderate capacity for loss',
            score: 3,
          },
          {
            emoji: '😎',
            text: "No change. I won't need that money for years",
            tag: 'High capacity for loss',
            score: 4,
          },
        ],
      },
      {
        id: 'u12',
        section: ['Income stability', 'how steady your pay is'],
        title: 'How steady is your income?',
        options: [
          { emoji: '🌪️', text: 'Uncertain right now', tag: 'Income risk', score: 1 },
          { emoji: '🌦️', text: 'It changes month to month', tag: 'Variable income', score: 2 },
          { emoji: '⛅', text: 'Fairly steady', tag: 'Stable income', score: 3 },
          {
            emoji: '☀️',
            text: 'Very steady (e.g. permanent job or pension)',
            tag: 'Very stable income',
            score: 4,
          },
        ],
      },
      {
        id: 'u14',
        section: ['Emergency fund', 'your emergency fund'],
        title: 'If your income stopped tomorrow, how long could your savings keep you going?',
        options: [
          { emoji: '😬', text: 'Less than a month', tag: 'No emergency fund', score: 1 },
          { emoji: '🐷', text: '1 to 3 months', tag: 'Thin buffer', score: 2 },
          { emoji: '🛟', text: '3 to 6 months', tag: 'Emergency fund in place', score: 3 },
          { emoji: '🏰', text: '6 months or more', tag: 'Strong safety net', score: 4 },
        ],
      },
    ],
  },
  {
    step: 3,
    title: 'Your investor behaviour',
    term: 'Investor behaviour',
    plain: 'how you tend to act',
    emoji: '🧭',
    intro: 'How you tend to act and decide with money. There are no right or wrong answers.',
    questions: [
      '2',
      '12',
      '4',
      {
        id: 'u4',
        section: ['Decision style', 'how you make big money calls'],
        title:
          "A big money decision lands on your desk, like switching your pension. What's your move?",
        options: [
          {
            emoji: '🔬',
            text: 'Dig into every detail myself',
            tag: 'Self-directed · Due diligence',
          },
          { emoji: '🧭', text: 'Get the gist, then check with an expert', tag: 'Validator' },
          { emoji: '🤝', text: 'Hand it to an expert I trust', tag: 'Delegator · Advice-seeker' },
          {
            emoji: '⏳',
            text: 'Leave it for another day',
            tag: 'Procrastination · Status quo bias',
            trait: 'Procrastination · Status quo bias',
          },
        ],
      },
      {
        id: 'u11',
        section: ['Knowledge & experience', "what you've done before"],
        title: 'How would you describe your investing know-how?',
        options: [
          { emoji: '🌱', text: 'Total beginner', tag: 'Novice investor', score: 1 },
          {
            emoji: '📘',
            text: 'I know the basics: savings and pension',
            tag: 'Basic knowledge',
            score: 2,
          },
          {
            emoji: '📈',
            text: "I've invested in funds or shares",
            tag: 'Some investing experience',
            score: 3,
          },
          {
            emoji: '🏆',
            text: "I'm confident I can beat the market",
            tag: 'Self-rated expert · watch for overconfidence bias',
            trait: 'Overconfidence bias',
            score: 4,
          },
        ],
        chips: ['Savings account', 'Pension', 'Shares or funds', 'Crypto', 'None'],
      },
    ],
  },
]

export const moneyQuestion = (id: string) =>
  MONEY_PROFILE.flatMap((step) => step.questions).find(
    (q): q is MoneyQuestion => typeof q !== 'string' && q.id === id,
  )
