// Translates between the original's state and names and our small typed profile inputs.
import {
  profileAnswers as ourProfileAnswers,
  suggestedHorizon,
} from '../../src/domain/discovery/profile'
import type { RiskRead } from '../../src/domain/discovery/riskRead'
import type { Cushion } from '../../src/domain/discovery/riskMismatch'

// the original's plan can lack um.chips
export const profileAnswers = (plan: any) =>
  ourProfileAnswers({ ...plan, moneyProfile: { ...plan.um, chips: plan.um.chips ?? [] } })

/** The original's cushionM() result. */
export const cushion = (originalCushion: any): Cushion => ({
  hasFigures: originalCushion.fig,
  months: originalCushion.m,
  targetMonths: originalCushion.T,
  shortfall: originalCushion.need,
  level: originalCushion.level,
  answer: originalCushion.ans,
})

export const riskContext = (plan: any, complete: boolean, originalCushion: any) => ({
  complete,
  cushion: cushion(originalCushion),
  suggestedHorizon: suggestedHorizon(plan.goals, plan.about.age, plan.retireAge),
})

/** Our risk read under the original's field names. */
export const asOriginalRead = ({ cushionNote, ...r }: RiskRead) => ({
  comfort: r.comfort,
  cushion: r.cushion,
  want: r.willingness,
  can: r.capacity,
  time: r.horizon,
  level: r.level,
  label: r.label,
  limit: r.limitedBy,
  provisional: r.provisional,
  mis: r.mismatch,
  misKey: r.mismatchKey,
  adv: r.adviserNote,
  keNote: r.experienceNote,
  ...(cushionNote == null ? {} : { cushionNote }),
})
