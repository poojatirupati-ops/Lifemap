// The risk read: willingness, capacity, horizon and experience, the weakest wins.
import {
  ADVISER_NOTES,
  COMFORT_LABELS,
  MISMATCH_MESSAGES,
  RISK_LABELS,
  EXPERIENCE_BY_KNOWHOW,
  FALL_CAP,
  HORIZON_LEVEL,
  INCOME_CAP,
  LOW_SCORE_CAP,
  SAVINGS_CAP,
  type MismatchKey,
  type RiskLimit,
} from './profile.data.ts'
import { discoverQuestion } from './questions.data.ts'
import { optionScore, type Answers, type ProfileAnswers } from './profile.ts'
import {
  cushionMismatchNote,
  isCushionThin,
  mismatchKey,
  thinCushionMessage,
  type Cushion,
  type CushionLevel,
} from './riskMismatch.ts'

export interface RiskRead {
  comfort: string | null
  cushion: CushionLevel | null
  willingness: number | null
  capacity: number | null
  horizon: number | null
  level: number | null
  label: string | null
  limitedBy: RiskLimit | null
  /** a first read, before Understand Me is done */
  provisional: boolean
  mismatch: string | null
  mismatchKey: MismatchKey | null
  adviserNote: string | null
  experienceNote: boolean
  cushionNote: string | null
}

export const riskLabelText = (read: { label: string | null; provisional: boolean }) =>
  read.label == null ? 'Not answered yet' : read.label + (read.provisional ? ' (first read)' : '')

const capFor = (caps: Record<number, number>, index: number | null | undefined) =>
  caps[index ?? -1] ?? 5

// in the order a tie is credited
const LIMITS: RiskLimit[] = ['want', 'can', 'time', 'experience']

const EMPTY_READ: Omit<RiskRead, 'comfort' | 'cushion' | 'provisional'> = {
  willingness: null,
  capacity: null,
  horizon: null,
  level: null,
  label: null,
  limitedBy: null,
  mismatch: null,
  mismatchKey: null,
  adviserNote: null,
  experienceNote: false,
  cushionNote: null,
}

interface RiskContext {
  /** Understand Me is done */
  complete: boolean
  cushion: Cushion
  /** used while u9 is unanswered */
  suggestedHorizon: number
}

export function riskRead(answers: ProfileAnswers, context: RiskContext): RiskRead {
  const { complete, cushion } = context
  const discoverScore = (id: string) => optionScore(discoverQuestion(id), answers.discover[id])
  const appetite = discoverScore('8')
  const composure = discoverScore('9')
  const surprise = discoverScore('7')
  const surpriseOption = answers.discover['7']
  const shown = {
    comfort: appetite ? COMFORT_LABELS[appetite - 1] : null,
    cushion: cushion.hasFigures || surprise != null ? cushion.level : null,
    provisional: !complete,
  }
  if (appetite == null || composure == null) return { ...EMPTY_READ, ...shown } // no made-up profile

  // the capacity and experience answers count once Understand Me is done
  const understood: Answers = complete ? answers.money : {}
  const want = willingness(appetite, composure)
  const can = capacityForLoss(cushion, surprise, understood)
  const time = HORIZON_LEVEL[answers.money.u9 ?? context.suggestedHorizon]
  const experience = experienceLevel(understood.u11, answers.products)
  const level = Math.min(want, can, time, experience)
  const key = mismatchKey({
    appetite,
    composure,
    thinCushion: isCushionThin(cushion, surprise, understood.u14),
    lowCapacity: complete && can <= 2,
    shortHorizon: complete && time <= 2,
    canAfford: complete ? can >= 4 && time >= 4 : surprise === 4 && (discoverScore('6') ?? 0) >= 3,
    // a self-rated expert (u11 option 3) never gets K17
    readyForGrowth: understood.u11 != null && understood.u11 >= 1 && understood.u11 !== 3,
  })
  return {
    ...shown,
    willingness: want,
    capacity: can,
    horizon: time,
    level,
    label: RISK_LABELS[level - 1],
    limitedBy: LIMITS[[want, can, time, experience].indexOf(level)],
    mismatchKey: key,
    mismatch: key === 'K14c' ? thinCushionMessage(cushion, surpriseOption) : MISMATCH_MESSAGES[key],
    adviserNote: ADVISER_NOTES[key] ?? null,
    experienceNote: complete && level === experience && experience < Math.min(want, can, time),
    cushionNote: cushionMismatchNote(cushion),
  }
}

// The appetite (Q8), lifted by calm when prices fall and capped by unease (Q9).
function willingness(appetite: number, composure: number) {
  const boost = composure === 4 && appetite >= 3 ? 1 : 0
  return Math.min(appetite + boost, capFor(LOW_SCORE_CAP, composure))
}

// The weakest link wins.
function capacityForLoss(cushion: Cushion, surprise: number | null, money: Answers) {
  return Math.min(
    cushionCap(cushion, surprise),
    capFor(FALL_CAP, money.u10),
    capFor(INCOME_CAP, money.u12),
    capFor(SAVINGS_CAP, money.u14),
  )
}

function cushionCap(cushion: Cushion, surprise: number | null) {
  if (!cushion.hasFigures) return capFor(LOW_SCORE_CAP, surprise)
  const months = cushion.months ?? 0
  if (months < 1) return 2
  if (months < 3) return 3
  return 5
}

// Balanced until u11 is answered; self-assessment alone never goes past 4 (ESMA).
function experienceLevel(knowHow: number | undefined, products: string[]) {
  if (knowHow == null) return 3
  if (knowHow === 3 && products.includes('Shares or funds')) return 5
  const onlySavings =
    products.length > 0 && products.every((p) => p === 'None' || p === 'Savings account')
  const level = EXPERIENCE_BY_KNOWHOW[knowHow]
  return knowHow >= 2 && onlySavings ? Math.min(level, 4) : level
}
