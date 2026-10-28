// Wording and tables for the money personality and the risk read, as in the original.
/** Personality codes: A Achiever, B Balancer, E Explorer, C Contented. */
export type PersonalityCode = 'A' | 'B' | 'E' | 'C'
type Weights = Partial<Record<PersonalityCode, number>>

/** How much each option of a question points to each personality, by option index. */
export const PERSONALITY_WEIGHTS: Record<string, Weights[]> = {
  '2': [{ A: 2 }, { B: 2 }, { E: 2 }, { C: 2 }],
  '4': [{ E: 1 }, { A: 1 }, { B: 1 }, { B: 0.5, C: 0.5 }],
  '7': [{ A: 0.5 }, {}, {}, { C: 0.5 }],
  '8': [{ B: 0.5, C: 0.5 }, { A: 0.5, B: 0.5 }, { A: 0.5, E: 0.5 }, { E: 1 }],
  '9': [{ B: 1 }, { B: 0.5 }, { A: 0.5, C: 0.5 }, { E: 1 }],
  '12': [{ B: 1 }, { E: 0.5 }, { A: 1 }, { C: 1 }],
  u4: [{ A: 0.5, E: 0.5 }, { A: 0.5, B: 0.5 }, { B: 1 }, { C: 1 }],
}

/** Who wins a tie the answers cannot break. */
export const PERSONALITY_TIE_ORDER: PersonalityCode[] = ['B', 'A', 'C', 'E']

/** Risk levels 1 to 5. */
export const RISK_LABELS = [
  'Cautious',
  'Cautious–balanced',
  'Balanced',
  'Balanced–growth',
  'Growth',
]

/** The comfort tile reads the road answer (Q8) only, deliberately not the five risk levels. */
export const COMFORT_LABELS = ['Steady', 'Mostly steady', 'Balanced', 'Adventurous']

export type RiskLimit = 'want' | 'can' | 'time' | 'experience'

export const RISK_SET_BY: Record<RiskLimit, string> = {
  want: 'how much risk you want to take',
  can: 'how much you can afford to lose',
  time: 'how long you can wait',
  experience: 'your investing experience',
}

export const EXPERIENCE_NOTE =
  'Investing is new to you, so this stays at Balanced for now. An adviser can explain how investments rise and fall.'

/** The xlsx mismatch rows (K13 to K17), one line for the customer, safety first. */
export type MismatchKey = 'K13' | 'K14c' | 'K14l' | 'K14t' | 'K15' | 'K16' | 'K17' | 'OK'

export const MISMATCH_MESSAGES: Record<MismatchKey, string> = {
  K16: 'An emergency fund often comes first, along with the right cover. It is a good place to start with an adviser.',
  K14c: "You're open to ups and downs, but your emergency fund is thin. Many people build an emergency fund before taking more risk.",
  K14l: "You're open to ups and downs, but a fall would hit everyday life right now. Many people build an emergency fund before taking more risk.",
  K14t: "You're open to ups and downs, but you'll need this money within 5 years. Money needed soon has less time to recover from a fall.",
  K13: 'You like the idea of growth, but falls may unsettle you. A calmer approach might feel more comfortable. Worth talking through with an adviser.',
  K15: "Your finances could handle more ups and downs than you'd choose. That's fine. It's worth seeing what playing very safe can cost as prices rise.",
  K17: "You're comfortable with ups and downs, you can afford them and you have time. A good basis for a growth conversation with an adviser.",
  OK: 'How you feel about risk and what you can afford are broadly in line. A good starting point.',
}

/** For the adviser only (xlsx column M), never shown to the customer. */
export const ADVISER_NOTES: Partial<Record<MismatchKey, string>> = {
  K13: 'Route to a calmer plan than they picked; flag for a call if markets fall.',
  K14c: 'Build the emergency fund first; explain why risk waits, not that they are wrong.',
  K14l: 'Build the emergency fund first; explain why risk waits, not that they are wrong.',
  K14t: 'Short horizon: explain why risk waits.',
  K15: 'Respect the preference; gently show what over-caution costs over time.',
  K16: 'Protection and emergency fund first; investing conversation comes later.',
  K17: 'Ready for a growth conversation; route to the investment expert.',
}

/** Why the emergency fund is thin, by the option picked for the €1,000 repair (Q7). */
export const THIN_CUSHION_REASONS = [
  'your emergency fund is thin',
  'a surprise would come out of money saved for your goals',
  'a €1,000 surprise would go on a card or a loan',
  "you haven't set up an emergency fund yet",
]
