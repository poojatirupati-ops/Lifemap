// The customer's plan, grouped by context. Field names follow the original so captured fixtures load as they are.
// TODO(Q-01): rename the prototype names (k, e, f, di, tlHl, fsec, upl, um, wi, xs, vf, ...) once every
// caller has moved off them; map them only in load/toSnapshot, as listsFedTotals <-> dv already is.
export type Provenance = 'typed' | 'doc' | 'pre'

export interface Dob {
  d: string
  m: string
  y: string
}

export interface Goal {
  id: number
  k: string
  name: string
  e: string
  kind: string
  spec: string
  amount: number
  saved: number
  who: string
  prio: string
  flex: string
  age: number
  auto?: boolean
  autoAdded?: boolean
  need?: string
}

export interface ManualValue {
  v: unknown
  src?: Provenance
}

export interface ListItem {
  id: number
  f: Record<string, number | string>
  src: Record<string, Provenance>
  conf: Record<string, number>
  man: Record<string, ManualValue>
  fix: Record<string, boolean>
  docFrom: string | null
  fromDoc?: boolean
}

export interface About {
  age: number | null
  partner: boolean | null
  deps: number | null
  married?: boolean | null
  dob?: Dob
  pdob?: Dob
  /** The age last set from the date of birth; an age typed since then wins. */
  _dobAge?: number | null
  ageToday?: number | null
}

export interface AskMessage {
  who: 'me' | 'bot'
  t?: string
  k?: string | null
  typing?: boolean
}

/** Who the customer is: discovery answers, about-you and account details. */
interface Identity {
  entry: string
  why: string[]
  whyNote: string
  di: number
  ans: Record<string, number>
  about: About
  acct: {
    name: string
    email: string
    mobile: string
    c1: boolean
    c2: boolean
    ev: boolean
    sv: boolean
    pk: boolean
  }
  partner: { mode: string | null; email: string; sent: boolean; name: string }
  admin?: boolean
}

/** Goals, the timeline and the planning assumptions. */
interface Goals {
  goals: Goal[]
  gid: number
  retireAge: number
  retireSet: boolean
  pRet?: number
  pRetSet?: boolean
  asm: Record<string, number | string | null>
  saved: Record<string, boolean>
  rank: number[] | null
  wi: { g: number | null; m: number; l: number }
  pref: Goals['wi'] | null
  infl: number | null
  inflOther: boolean
  inflEdit: boolean
  assume: string
  saveM: number | null
  saveNote: string
  safetyWanted?: boolean
  safetyOff?: boolean
  versions: { note: string; date: string }[]
}

/** The customer's money: totals, list items and where each value came from. */
interface Finances {
  // ponytail: numbers plus a few answers kept as text (work, ...); split when finances get a typed model
  fin: Record<string, any>
  src: Record<string, Provenance>
  conf: Record<string, number>
  look: Record<string, string>
  ack: Record<string, boolean>
  man: Record<string, ManualValue>
  fix: Record<string, boolean>
  docOf: Record<string, string>
  lists: Record<string, ListItem[]>
  listsFedTotals?: Record<string, boolean>
  fsec: number | null
  fmode: Record<string, string>
  upl: Record<string, unknown> | null
  checked: boolean
  um: {
    a: Record<string, number>
    chips: string[]
    done: Record<string, boolean>
    sec: number | null
  }
  pst: Record<string, unknown> | null
  pdocs: Record<string, unknown>
}

/** Where the customer is in the app, plus open/closed UI flags that the original kept in its state. */
interface Navigation {
  app: boolean
  shell: boolean
  pb: boolean
  tab: string
  planSeg: string
  planGo: string | null
  planEdit: boolean
  me: string
  exp: string
  view: string
  from: string | null
  rt?: string
  tlOpen: Record<string, boolean>
  tlHl: number | null
  chapOpen: string | null
  understood: boolean
  xs: { v: string; p?: string }[]
  vf: string
  play: boolean
  after: Record<string, unknown> | null
  calcT: Record<string, unknown>
  calcDoc: Record<string, unknown>
  calcSrc: Record<string, unknown>
  calcV: Record<string, Record<string, unknown>>
  meEdit: Record<string, unknown>
  ask: { open: string | null; q: string; a: string | null; log?: AskMessage[]; more?: boolean }
  toast: string | null
}

/** Saving the plan and booking an adviser. */
interface Booking {
  save: { email: string; comms: boolean; done: boolean; asked: boolean }
  advQs: string[]
  book: {
    stage: string | null
    adv: number
    share: { report: boolean; fin: boolean; docs: boolean; um: boolean }
    agree: boolean
    mode: string
    day?: string
    slot: string | null
    done: boolean
    from: string
  }
}

export type Plan = Identity & Goals & Finances & Navigation & Booking

/** A plan in the original's saved shape (fixtures, reviewer jumps, view-equal): it also carries the screen and sheet. */
export type Snapshot = Plan & { scr?: string; sheet?: string | null }

// TODO(Q-01): old name; callers move to Plan
export type State = Plan
