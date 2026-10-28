import { defaultPlan, type Plan } from './types.ts'

export const KEY_V1 = 'lifemap.plan.v1'

type Rec = Record<string, unknown>
const isRec = (v: unknown): v is Rec => typeof v === 'object' && v !== null && !Array.isArray(v)

/** v1 -> v2: age becomes legacyAge (a dob cannot be guessed), retireSet/pRetSet fold into null-until-chosen. */
function v1ToV2(o: Rec): Rec {
  const { retireSet, pRet, pRetSet, retireAge, about, ...rest } = o
  const a = isRec(about) ? about : {}
  const { age, ...aboutRest } = a
  return {
    ...rest,
    about: { ...aboutRest, legacyAge: typeof age === 'number' ? age : null },
    retireAge: retireSet === true ? retireAge : null,
    partnerRetireAge: pRetSet === true ? pRet : null,
  }
}

// null-default keys accept null or this kind
const NULLABLE: Rec = { infl: 'number', rank: 'array', pref: 'object', retireAge: 'number', planUntil: 'number', partnerRetireAge: 'number',
  emergencyMonths: 'number', dob: 'string', partnerDob: 'string', sustainability: 'string' }

const SUSTAIN = ['yes', 'little', 'none', 'unsure']
const isIso = (v: unknown) => typeof v === 'string' && /^\d{4}-\d\d-\d\d$/.test(v) && !isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v

/** Trust boundary: any stored value (parsed JSON) to a valid Plan. Unknown, wrong-typed or corrupt data keeps the default.
 *  ponytail: top-level type check only; add zod if nested shapes start crashing consumers */
export function migrate(saved: unknown, from: 1 | 2 = 2): Plan {
  const d = defaultPlan()
  if (!isRec(saved)) return d
  const s = from === 1 ? v1ToV2(saved) : saved
  const kind = (v: unknown) => (Array.isArray(v) ? 'array' : v === null ? 'null' : typeof v)
  const dr = d as unknown as Rec
  const out: Rec = { ...dr }
  for (const [k, v] of Object.entries(s))
    if (Object.hasOwn(d, k) && (v === null && kind(dr[k]) === 'null' || kind(v) === (NULLABLE[k] ?? kind(dr[k])))) out[k] = v
  for (const k of ['dob', 'partnerDob']) if (out[k] !== null && !isIso(out[k])) out[k] = null
  if (out.sustainability !== null && !SUSTAIN.includes(out.sustainability as string)) out.sustainability = null
  if (!Number.isInteger(out.builderStep) || (out.builderStep as number) < 0) out.builderStep = 0
  // consent: strict booleans over the defaults, unticked unless exactly true
  const pv = isRec(out.privacy) ? out.privacy : {}
  out.privacy = { analytics: pv.analytics === true, marketing: pv.marketing === true }
  if (isRec(out.about)) out.about = { ...d.about, ...out.about }   // partial about from older data
  return out as unknown as Plan
}
