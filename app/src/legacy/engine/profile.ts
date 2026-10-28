// Money personality, the customer's own terms and the indicative risk profile (spec sec 3, 12, 13; fp-review-round1).
// Pure: answers in, results out. Guidance, not advice.
import { DISCOVER, TYPES, type Answers, type Opt, type SectKey, type TypeKey } from '../content/discover.data.ts'
import { MONEY } from '../content/moneyProfile.data.ts'

export const QUESTIONS = [...DISCOVER, ...MONEY]
/** Drops answers that are not a valid option index (stale or tampered store/API values). Every public function starts here. */
const clean = (a: Answers): Answers => {
  const out: Answers = {}
  for (const q of QUESTIONS) if (Number.isInteger(a[q.id]) && a[q.id]! >= 0 && a[q.id]! < q.o.length) out[q.id] = a[q.id]
  return out
}
const opt = (a: Answers, id: string): Opt | undefined => {
  const k = a[id]
  return k === undefined ? undefined : QUESTIONS.find(q => q.id === id)?.o[k]
}
const score = (a: Answers, id: string) => opt(a, id)?.s

// Personality weights per option, in option order (0.5 steps). q6, u9 to u14 carry none.
const PW: Record<string, Partial<Record<TypeKey, number>>[]> = {
  q2: [{ A: 2 }, { B: 2 }, { E: 2 }, { C: 2 }],
  q4: [{ E: 1 }, { A: 1 }, { B: 1 }, { B: .5, C: .5 }],
  q7: [{ A: .5 }, {}, {}, { C: .5 }],
  q8: [{ B: .5, C: .5 }, { A: .5, B: .5 }, { A: .5, E: .5 }, { E: 1 }],
  q9: [{ B: 1 }, { B: .5 }, { A: .5, C: .5 }, { E: 1 }],
  q12: [{ B: 1 }, { E: .5 }, { A: 1 }, { C: 1 }],
  u4: [{ A: .5, E: .5 }, { A: .5, B: .5 }, { B: 1 }, { C: 1 }],
}
const ORDER: TypeKey[] = ['B', 'A', 'C', 'E']

/** Null until 4 of the 6 Discover answers exist: never guess a type. Ties go to the q2 answer, then q4, then B, A, C, E. */
export function personality(raw: Answers) {
  const a = clean(raw)
  const t: Record<TypeKey, number> = { A: 0, B: 0, E: 0, C: 0 }
  let n = 0
  for (const id of Object.keys(PW)) {
    const k = a[id]
    if (k === undefined) continue
    if (id !== 'u4') n++
    for (const [x, v] of Object.entries(PW[id][k]) as [TypeKey, number][]) t[x] += v
  }
  if (n < 4) return null
  const top = Math.max(...Object.values(t))
  const tied = ORDER.filter(x => t[x] === top)
  const from = (id: string) => (a[id] === undefined ? [] : (Object.keys(PW[id][a[id]!]) as TypeKey[]).filter(x => tied.includes(x)))
  const q4 = from('q4')
  const key = tied.length === 1 ? tied[0] : from('q2')[0] ?? (q4.length === 1 ? q4[0] : tied[0])
  return { key, ...TYPES[key] }
}

const GROUPS: [SectKey, string[]][] = [['mindset', ['q2', 'q12']], ['behaviour', ['q4', 'q9']], ['appetite', ['q8']], ['safety', ['q7']], ['capacity', ['q6']]]

/** The customer's own terms with their plain line, grouped by section. u4 and u11 add their behaviour trait. */
export function* myTerms(raw: Answers): Generator<{ section: SectKey; tag: string; line: string }> {
  const a = clean(raw)
  for (const [section, ids] of GROUPS) {
    for (const id of ids) {
      const o = opt(a, id)
      if (o) yield { section, tag: o.tag, line: o.line }
    }
    if (section === 'behaviour') {
      for (const id of ['u4', 'u11']) {
        const o = opt(a, id)
        if (o?.trait) yield { section, tag: o.trait, line: o.line }
      }
    }
  }
}

export const RISK_LABELS = ['Cautious', 'Cautious–balanced', 'Balanced', 'Balanced–growth', 'Growth']
export const CUSHION = ['In place', 'Thin', 'None: relies on credit', 'Not set up yet'] // by q7 option
const MIS = {
  K16: 'An emergency fund often comes first, along with the right cover. It is a good place to start with an adviser.',
  K14c: "You're open to ups and downs, but your emergency fund is thin. Build 3 to 6 months of essential spending first. Many people do this before taking more risk.",
  K14l: "You're open to ups and downs, but a fall would hit everyday life right now. Many people build an emergency fund before taking more risk.",
  K14t: "You're open to ups and downs, but you'll need this money within 5 years. Money needed soon has less time to recover from a fall.",
  K13: 'You like the idea of growth, but falls may unsettle you. A calmer approach might feel more comfortable. Worth talking through with an adviser.',
  K15: "Your finances could handle more ups and downs than you'd choose. That's fine. It's worth seeing what playing very safe can cost as prices rise.",
  K17: "You're comfortable with ups and downs, you can afford them and you have time. A good basis for a growth conversation with an adviser.",
  OK: 'How you feel about risk and what you can afford are broadly in line. A good starting point.',
}

/**
 * Indicative profile 1..5 = the lowest of want (appetite, pulled down by composure), can afford (weakest link),
 * time (horizon) and experience. `horizon` is the u9 option index to assume until u9 is answered (default 10+ years;
 * the app suggests it from the timeline). Provisional until every money-profile question is answered.
 */
export function riskProfile(raw: Answers, { horizon = 3, chips = [] as string[] } = {}) {
  const a = clean(raw)
  const q6 = score(a, 'q6'), q7 = score(a, 'q7'), q8 = score(a, 'q8'), q9 = score(a, 'q9')
  const { u10, u11, u12, u14 } = { u10: a.u10, u11: a.u11, u12: a.u12, u14: a.u14 }
  const full = MONEY.every(q => a[q.id] !== undefined)
  const comfort = q8 === undefined ? null : ['Steady', 'Mostly steady', 'Balanced', 'Adventurous'][q8 - 1]
  const none = { comfort, keNote: false, cushion: a.q7 === undefined ? null : CUSHION[a.q7], want: null, can: null, time: null, level: null, label: null, limit: null, provisional: !full, mis: null }
  if (q8 === undefined || q9 === undefined) return none

  const want = Math.min(q8 + (q9 === 4 && q8 >= 3 ? 1 : 0), q9 === 1 ? 2 : q9 === 2 ? 3 : 5)
  let can = 5
  const cap = (v: number) => { can = Math.min(can, v) }
  if (q7 === 2) cap(3)
  if (q7 === 1) cap(2)
  if (full) {
    if (u10 !== undefined && u10 <= 2) cap(u10 + 2)
    if (u12 === 0) cap(2)
    if (u12 === 1) cap(4)
    if (u14 === 0) cap(2)
    if (u14 === 1) cap(3)
  }
  const time = [1, 2, 4, 5][a.u9 ?? horizon]
  let ke = !full || u11 === undefined ? 3 : [3, 4, 5, chips.includes('Shares or funds') ? 5 : 4][u11]
  // Don't rely on self-rating alone: "fairly/very experienced" with only savings or nothing held is capped at 4.
  if (full && u11! >= 2 && chips.length && chips.every(c => c === 'None' || c === 'Savings account')) ke = Math.min(ke, 4)

  const level = Math.min(want, can, time, ke)
  const limit = level === want ? 'want' : level === can ? 'can' : level === time ? 'time' : 'experience'
  const keNote = full && ke === 3 && level === ke && ke < Math.min(time, can, want) // beginners only: KE_NOTE says investing is new to you
  const thin = (q7 !== undefined && q7 <= 2) || (full && u14 !== undefined && u14 <= 1)
  const wantHi = q8 >= 3, wantLo = q8 <= 2, compHi = q9 >= 3, compLo = q9 <= 2
  const lossLo = full && can <= 2, shortT = full && time <= 2
  const capLo = thin || lossLo || shortT
  const capHi = full ? can >= 4 && time >= 4 : q7 === 4 && q6 !== undefined && q6 >= 3
  const k: keyof typeof MIS =
    wantLo && compLo && capLo ? 'K16'
    : wantHi && capLo ? (thin ? 'K14c' : lossLo ? 'K14l' : 'K14t')
    : wantHi && compLo ? 'K13'
    : wantLo && capHi ? 'K15'
    : full && wantHi && compHi && capHi && u11 !== undefined && u11 >= 1 && u11 !== 3 ? 'K17' : 'OK' // a self-rated expert never gets K17
  return { ...none, want, keNote, can, time, level, label: RISK_LABELS[level - 1], limit, mis: MIS[k] }
}
