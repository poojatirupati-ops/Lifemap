// The saved plan: the durable part of the prototype's S object (fresh() in LifeGoals-Customer-Journey-Prototype.html).
// v2 (spec 12-29): dob and partnerDob replace the stored age; retireSet, pRet and pRetSet are gone (null means not chosen).
//
// Stored here (rebuild the plan after a reload): why, whyNote, ans, about, goals, gid, iid (list-item id counter: a restart
//   would collide with stored ids), retireAge, planUntil, partnerRetireAge (v2: null until chosen), asm, assume, infl, inflOther, fin + src + conf + fix + man +
//   docOf + look + ack + lists + lt + saved (finance values and provenance: without src a reloaded fin value reads as
//   unanswered), um, acct (incl. consent flags), save, partner, versions, safetyWanted, safetyOff, rank (goal priority),
//   pref (saved preferred what-if), understood, book (adviser shares/agree/slot/done: consent record), entry,
//   penExtra, needs (plan edits from goal suggestions), advRate, toolPick, missingDocs, adjInfl.
// Session-only, NOT stored (UI position or transient, rebuilt on load): scr, app, tab, planSeg, planGo, planEdit, me, exp,
//   di, tlOpen, tlHl, calcT, calcDoc, calcV, calcSrc, calcWO, calcExK, fsec, fmode, upl, checked, from, wi (what-if
//   slider position), advQs, view, chapOpen, inflEdit, pst, pdocs, after, saveM, saveNote, saveUp, setMsg, rankMsg,
//   shell, pb, xs, xf, play, vf, ask, meEdit, sheet, toast, asmOpen, asmBack, mp* (money-picture UI), csel, csave,
//   nbH, elig, wantPlan, admin, plus derived dv.

export type GoalKind = 'spend' | 'retire' | 'mfree' | 'pot' | 'legacy'
/** Goal tile keys from the prototype GOALCAT. */
export type GoalKey =
  | 'home' | 'retire' | 'family' | 'edu' | 'travel' | 'business' | 'mfree' | 'safety'
  | 'wealth' | 'helpfam' | 'legacy' | 'wedding' | 'car' | 'health' | 'other'
export type GoalSpec = 'mortgage' | 'pension' | 'protection' | 'planner' | 'investment'

export interface Goal {
  id: number
  k: GoalKey
  kind: GoalKind
  spec: GoalSpec
  name: string
  e: string               // emoji
  age: number
  amount: number
  saved: number
  who: string             // 'Me' by default
  prio: string            // 'Must have' by default
  flex: string            // 'Can move' by default
  auto?: boolean          // emergency fund that follows essential spending
  autoAdded?: boolean     // added automatically rather than chosen
}

export type FinValue = number | string          // strings: mortYN, home, sp, name, ...
export type Provenance = 'typed' | 'doc' | 'pre'

/** One balance-sheet list row; fin totals are derived from these (syncLists). */
export interface ListItem {
  id: number
  f: Record<string, number | string>
  src: Record<string, Provenance>
  conf: Record<string, number>
  man: Record<string, unknown>
  fix: Record<string, boolean>
  docFrom: string | null
  fromDoc?: boolean
}

export interface Plan {
  why: string[]
  whyNote: string
  ans: Record<string, number>
  dob: string | null                // ISO date (sec 29); age today and age in a year are derived, never stored
  partnerDob: string | null
  about: { partner: boolean | null; deps: number | null; married: boolean | null; legacyAge: number | null; cred?: { rent?: boolean; lone?: boolean; carer?: boolean } }   // cred: rent, lone-parent, carer credits (no input screen yet); legacyAge: v1 age, kept until a dob is entered
  goals: Goal[]
  gid: number
  iid: number                       // last list-item id handed out
  retireAge: number | null          // null until the customer chooses (sec 14/27)
  planUntil: number | null          // life expectancy, null until chosen
  partnerRetireAge: number | null   // null until chosen (needed only when the partner has income)
  builderStep: number               // plan builder resume point (sec 12)
  emergencyMonths: number | null    // stored once (sec 19.8); null = LifeMap's figure
  privacy: { analytics: boolean; marketing: boolean }   // Me > Privacy; unticked by default (sec 17)
  sustainability: 'yes' | 'little' | 'none' | 'unsure' | null   // adviser-question chip (sec 13)
  fromPublic: boolean               // plan started from the public local-only flow, not yet carried to the account
  asm: Record<string, number>       // assumption overrides, by assumption key
  assume: 'standard' | 'cautious'
  infl: number | null
  safetyWanted: boolean
  safetyOff: boolean
  fin: Record<string, FinValue>     // income, expenses, balance sheet, protection, pension
  src: Record<string, Provenance>   // where each fin value came from
  conf: Record<string, number>      // document-read confidence per fin key
  fix: Record<string, boolean>
  man: Record<string, unknown>
  docOf: Record<string, string>
  look: Record<string, boolean>
  ack: Record<string, boolean>
  lists: Record<string, ListItem[]>
  saved: Record<string, boolean>    // finances section complete
  lt: Record<string, boolean>       // list touched: stops an emptied list re-adding a blank row
  rank: number[] | null             // goal ids in the customer's priority order
  pref: { g: number | null; m: number; l: number } | null   // saved preferred what-if
  understood: boolean
  book: { stage: string | null; adv: number; share: { report: boolean; fin: boolean; docs: boolean; um: boolean }; agree: boolean; mode: string; slot: string | null; done: boolean; from: string; day?: string }
  entry: string
  penExtra: number
  needs: { life?: number; ip?: number }
  advRate: Record<string, boolean>
  toolPick: Record<string, Record<string, number>>
  missingDocs: string[]
  adjInfl: Record<string, boolean>
  inflOther: boolean
  um: { a: Record<string, number>; chips: string[]; done: Record<string, boolean> }
  acct: { name: string; email: string; mobile: string; c1: boolean; c2: boolean; ev: boolean; sv: boolean; pk: boolean }
  save: { email: string; comms: boolean; done: boolean; asked: boolean }
  partner: { mode: string | null; email: string; sent: boolean; name: string }
  versions: { note: string; date: string }[]
}

export const defaultPlan = (): Plan => ({
  why: [], whyNote: '', ans: {},
  dob: null, partnerDob: null,
  about: { partner: null, deps: null, married: null, legacyAge: null },
  goals: [], gid: 1, iid: 0, retireAge: null, planUntil: null, partnerRetireAge: null, builderStep: 0, emergencyMonths: null,
  privacy: { analytics: false, marketing: false }, sustainability: null, fromPublic: false, asm: {}, assume: 'standard', infl: null,
  safetyWanted: false, safetyOff: false,
  fin: {}, src: {}, conf: {}, fix: {}, man: {}, docOf: {}, look: {}, ack: {}, lists: {}, saved: {},
  lt: {}, rank: null, pref: null, understood: false,
  book: { stage: null, adv: 0, share: { report: false, fin: false, docs: false, um: false }, agree: false, mode: 'Video', slot: null, done: false, from: 'plan' },
  entry: 'direct', penExtra: 0, needs: {}, advRate: {}, toolPick: {}, missingDocs: [], adjInfl: {}, inflOther: false,
  um: { a: {}, chips: [], done: {} },
  acct: { name: '', email: '', mobile: '', c1: false, c2: false, ev: false, sv: false, pk: false },
  save: { email: '', comms: false, done: false, asked: false },
  partner: { mode: null, email: '', sent: false, name: '' },
  versions: [],
})
