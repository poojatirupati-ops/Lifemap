export type PersonalityType = {
  name: string
  emoji: string
  strapline: string
  strengths: string[]
  watchOut: string
  /** the reveal's hero photo; without one the cover photo shows */
  photo?: string
}

type Reason = { key: string; emoji: string; label: string; goals?: string[] }

export const PERSONALITY_TYPES = {
  A: {
    name: 'Achiever',
    emoji: '🎯',
    strapline: 'In control, goal-driven, disciplined with money.',
    strengths: ['Clear about what you want', 'You stick to a plan'],
    watchOut: 'Being too hard on yourself when life changes the plan.',
    photo: '/media/graduation.jpg',
  },
  B: {
    name: 'Balancer',
    emoji: '⚖️',
    strapline: 'Value-seeking, vigilant, careful with risk.',
    strengths: ['Careful with money', 'You weigh things up'],
    watchOut: 'Playing so safe that cash quietly loses value to rising prices.',
    photo: '/media/savings-jar.jpg',
  },
  E: {
    name: 'Explorer',
    emoji: '🧭',
    strapline: 'Curious, open to new ideas, comfortable with risk.',
    strengths: ['Open to new ideas', 'Comfortable with change'],
    watchOut: 'Jumping in before your emergency fund is in place.',
  },
  C: {
    name: 'Contented',
    emoji: '🛋️',
    strapline: 'Comfortable, steady, low-maintenance with money.',
    strengths: ['Calm about money', 'Not easily rattled'],
    watchOut: 'Putting off decisions, such as pension top-ups.',
    photo: '/media/retired-reading.jpg',
  },
} satisfies Record<string, PersonalityType>

// "What brought you here" chips. goals: tiles quietly moved to the front of "Suggested for you"
export const REASONS: Reason[] = [
  { key: 'track', emoji: '🧭', label: 'Where I stand' },
  { key: 'home', emoji: '🏡', label: 'Home & mortgage', goals: ['home'] },
  { key: 'safety', emoji: '🛟', label: 'Emergency fund', goals: ['safety'] },
  { key: 'retire', emoji: '🌅', label: 'Retirement plan', goals: ['retire'] },
  { key: 'goal', emoji: '🎯', label: 'Save for something', goals: ['travel', 'car', 'wedding'] },
  { key: 'invest', emoji: '📈', label: 'Invest my money', goals: ['wealth'] },
  { key: 'debt', emoji: '💳', label: 'Clear my debt', goals: ['mfree'] },
  { key: 'change', emoji: '🔄', label: 'Big life change', goals: ['home', 'family', 'business'] },
  { key: 'curious', emoji: '👀', label: 'Just exploring' },
]

export const DISCOVERY_DISCLAIMER =
  'This tool is designed to help you explore your preferences. It does not replace a formal suitability or risk assessment where financial advice is provided.'
