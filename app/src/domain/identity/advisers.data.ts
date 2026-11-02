export type Expert = { title: string; blurb: string; icon: string }

export const EXPERTS = {
  mortgage: {
    title: 'Mortgage expert',
    blurb: 'Buying, switching or paying off a home loan',
    icon: '🏡',
  },
  pension: {
    title: 'Pension & retirement expert',
    blurb: 'Pensions, tax relief and retirement income',
    icon: '🌅',
  },
  protection: {
    title: 'Protection expert',
    blurb: 'Life cover, income protection, serious illness',
    icon: '🛡️',
  },
  investment: {
    title: 'Investment expert',
    blurb: 'Risk, charges and long-term investing',
    icon: '📈',
  },
  planner: {
    title: 'Financial planner',
    blurb: 'Your whole picture: goals, money and plans',
    icon: '🧭',
  },
} satisfies Record<string, Expert>

export type ExpertKind = keyof typeof EXPERTS
export const isExpertKind = (kind: string): kind is ExpertKind => kind in EXPERTS

// the sustainability preference (MiFID II) is captured here, not as a profile question
export const SUSTAINABLE_QUESTION = "I'd like sustainable / ethical options"

export const ADVISER_QUESTIONS = [
  'Can I retire earlier?',
  'Am I saving enough?',
  'How do I protect my family?',
  'Should I clear my mortgage early?',
  'What about my pension?',
  SUSTAINABLE_QUESTION,
]
