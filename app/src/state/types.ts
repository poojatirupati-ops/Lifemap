// The customer's plan, grouped by context. Field names follow the original so captured fixtures load as they are.
// TODO(Q-01): rename the prototype names (k, e, f, di, tlHl, fsec, upl, um, wi, xs, vf, ...) once every
// caller has moved off them; map them only in load/toSnapshot, as listsFedTotals <-> dv already is.
import type { Upload } from '../domain/finances/upload.ts'
import type { StatementUpload } from '../domain/calc/statements.ts'
import type { ExpertKind } from '../domain/identity/advisers.data.ts'

export type Provenance = 'typed' | 'doc' | 'pre'

export interface Dob {
  day: string
  month: string
  year: string
}

export interface Goal {
  id: number
  key: string
  name: string
  emoji: string
  kind: string
  spec: string
  amount: number
  saved: number
  who: string
  priority: string
  flex: string
  age: number
  auto?: boolean
  autoAdded?: boolean
  need?: string
}

export interface ManualValue {
  value: unknown
  source?: Provenance
}

export interface ListItem {
  id: number
  fields: Record<string, number | string>
  sources: Record<string, Provenance>
  confidence: Record<string, number>
  manual: Record<string, ManualValue>
  fixed: Record<string, boolean>
  docFrom: string | null
  fromDoc?: boolean
}

export interface About {
  age: number | null
  partner: boolean | null
  dependants: number | null
  married?: boolean | null
  dob?: Partial<Dob>
  partnerDob?: Partial<Dob>
  /** The age last set from the date of birth; an age typed since then wins. */
  dobAge?: number | null
  ageToday?: number | null
  /** The tax credits the customer said apply (rent, lone, carer). */
  taxCredits?: Record<string, boolean>
}

/** Who the customer is: discovery answers, about-you and account details. */
interface Identity {
  entry: string
  why: string[]
  whyNote: string
  discoverStep: number
  answers: Record<string, number>
  about: About
  account: {
    name: string
    email: string
    mobile: string
    termsAccepted: boolean
    marketingConsent: boolean
    emailVerified: boolean
    mobileVerified: boolean
    passkey: boolean
    photo?: string
  }
  partner: { mode: string | null; email: string; sent: boolean; name: string }
  adminView?: boolean
}

/** Goals, the timeline and the planning assumptions. */
interface Goals {
  goals: Goal[]
  nextGoalId: number
  retireAge: number
  retireSet: boolean
  partnerRetireAge?: number
  partnerRetireSet?: boolean
  assumptions: Record<string, number | string | null>
  savedSections: Record<string, boolean>
  rank: number[] | null
  whatIf: { goalId: number | null; monthlyExtra: number; lumpSum: number }
  preferredWhatIf: Goals['whatIf'] | null
  inflation: number | null
  inflOther: boolean
  editingInflation: boolean
  assumptionSet: string
  monthlySaving: number | null
  /** The chosen saving reaches the rule's saving, so the plan saves at least that. */
  savingAtRule?: boolean
  /** The last + tap hit the spare money, so the saving stopped there. */
  savingCapped: boolean
  safetyWanted?: boolean
  safetyOff?: boolean
  /** Extra pension contribution a month, added from the Retirement calculator. */
  pensionExtra?: number
  /** A tool-local standard the customer picked (years you might wait, style), by tool and input. */
  toolPick?: Record<string, Record<string, number>>
  versions: { note: string; date: string }[]
}

/** The customer's money: totals, list items and where each value came from. */
interface Finances {
  // ponytail: numbers plus a few answers kept as text (work, ...); split when finances get a typed model
  figures: Record<string, any>
  sources: Record<string, Provenance>
  confidence: Record<string, number>
  warnings: Record<string, string>
  acknowledged: Record<string, boolean>
  manual: Record<string, ManualValue>
  fixed: Record<string, boolean>
  documentOf: Record<string, string>
  lists: Record<string, ListItem[]>
  /** The last list item id given out. */
  nextItemId?: number
  /** Lists the customer added to or removed from: they get no starter item again. */
  listsChanged?: Record<string, boolean>
  /** Documents that could not be read; they stay on the checklist. */
  missingDocs?: string[]
  listsFedTotals?: Record<string, boolean>
  financeSection: number | null
  entryMode: Record<string, string>
  upload: Upload | null
  checked: boolean
  moneyProfile: {
    answers: Record<string, number>
    chips: string[]
    done: Record<string, boolean>
    section: number | null
    /** The money profile was checked again after it was first finished. */
    rechecked?: boolean
    /** Where the money profile returns to when it closes. */
    returnTo?: string | null
  }
  /** The Explore statement being read or confirmed. */
  statement: StatementUpload | null
  /** Statements uploaded, by calculator group. */
  statements: Record<string, UploadedStatement>
  /** Rates the customer doesn't know, left for their adviser. */
  ratesForAdviser?: Record<string, boolean>
}

/** A statement the customer uploaded and confirmed; `v` holds the figures read from it. */
export interface UploadedStatement {
  name: string
  date: string
  figures: object
}

/** The My Plan sections a link can scroll to. */
export type PlanSection = 'timeline' | 'results' | 'wi' | 'fnd'

/** Where the customer is in the app, plus open/closed UI flags that the original kept in its state. */
interface Navigation {
  hasResults: boolean
  inShell: boolean
  planBuilder: boolean
  tab: string
  planSegment: string
  planScrollTo: PlanSection | null
  editingGoals: boolean
  mePage: string
  expertsPage: string
  resultsView: 'journey' | 'chapters' | 'detail'
  cameFrom: string | null
  returnTo?: string
  timelineOpen: Record<string, boolean>
  highlightedGoal: number | null
  /** index of the open life chapter */
  openChapter: number | null
  understood: boolean
  explorePages: { page: string; param?: string }[]
  /** The focus area Explore's card shows. */
  focusArea?: number
  videoFilter: string
  playing: boolean
  afterGate: Record<string, unknown> | null
  /** Calculators showing their result in today's money ("Adjust for inflation"). */
  todaysMoney?: Record<string, boolean>
  /** Per tool: the inputs the customer moved, their figures, a statement's figures and keys. */
  calcTouched: Record<string, Record<string, boolean>>
  calcStatementFigures: Record<string, Record<string, number>>
  calcStatementKeys: Record<string, string[]>
  calcValues: Record<string, Record<string, number>>
  editingAnswers: Record<string, unknown>
}

/** Saving the plan and booking an adviser. */
interface Booking {
  save: { email: string; comms: boolean; done: boolean; asked: boolean }
  adviserQuestions: string[]
  booking: {
    stage: string | null
    adviser: number
    share: { report: boolean; finances: boolean; docs: boolean; moneyProfile: boolean }
    agree: boolean
    mode: string
    day?: string
    slot: string | null
    done: boolean
    from: string
    /** The kind of expert picked on the Experts tab. */
    spec?: ExpertKind | null
  }
  /** Protection needs from the calculators, noted for the adviser. */
  needs?: { life?: number; incomeProtection?: number }
}

export type Plan = Identity & Goals & Finances & Navigation & Booking

/** A plan in the original's saved shape (fixtures, reviewer jumps, view-equal): it also carries the screen and sheet. */
export type Snapshot = Plan & { screen?: string; sheet?: string | null }

// TODO(Q-01): old name; callers move to Plan
export type State = Plan
