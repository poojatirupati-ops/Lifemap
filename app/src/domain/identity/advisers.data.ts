export type Adviser = {
  name: string
  initials: string
  qualifications: string
  languages: string
  location: string
  meetingMode: string
}

export const ADVISERS: Adviser[] = [
  {
    name: 'Niamh Byrne',
    initials: 'NB',
    qualifications: 'QFA, CFP®',
    languages: 'English, Irish',
    location: 'Dublin 2',
    meetingMode: 'Video or in person',
  },
  {
    name: 'Ciarán Walsh',
    initials: 'CW',
    qualifications: 'QFA, APA',
    languages: 'English',
    location: 'Cork',
    meetingMode: 'Video',
  },
  {
    name: 'Aisling Murphy',
    initials: 'AM',
    qualifications: 'CFP®, QFA',
    languages: 'English, Polish',
    location: 'Galway',
    meetingMode: 'Video or in person',
  },
]

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
