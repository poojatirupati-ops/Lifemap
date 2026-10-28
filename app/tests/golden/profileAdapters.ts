// Translates between the original's state and names and our small typed profile inputs.
import { suggestedHorizon, type ProfileAnswers } from '../../src/domain/discovery/profile'
import type { RiskRead } from '../../src/domain/discovery/riskRead'
import type { Cushion } from '../../src/domain/discovery/riskMismatch'

export const profileAnswers = (s: any): ProfileAnswers => ({
  discover: s.ans,
  money: s.um.a,
  products: s.um.chips ?? [],
})

/** The original's cushionM() result. */
export const cushion = (c: any): Cushion => ({
  hasFigures: c.fig,
  months: c.m,
  targetMonths: c.T,
  shortfall: c.need,
  level: c.level,
  answer: c.ans,
})

export const riskContext = (s: any, complete: boolean, originalCushion: any) => ({
  complete,
  cushion: cushion(originalCushion),
  suggestedHorizon: suggestedHorizon(s.goals, s.about.age, s.retireAge),
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
