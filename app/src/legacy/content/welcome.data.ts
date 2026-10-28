// Cover and "What brings you" copy (spec sec 12.2, 16). Chips stay exactly as the prototype WHY list plus "Something else".
export const cover = {
  headline: "The life you'd like, mapped out.",
  line: 'A life map that guides you, step by step.',
  start: "Let's start",
  under: 'An easy tool, built for you.',
}

export const whyAsk =
  "Your answers help us show goals and results that fit you. We don't save anything unless you choose to, and nothing is shared with an adviser without your say. This is guidance, not advice."

export const links = { invite: 'I have an invite', why: 'Why we ask' }

export const invite = {
  title: 'Enter your invite code',
  sub: 'From your adviser or employer.',
  label: 'Code',
  placeholder: 'e.g. ABC123',
  max: 20,
  next: 'Continue',
  linked: 'Invite linked',
}

export const why = {
  title: 'What brings you to LifeMap today?',
  sub: 'Choose any that fit, or skip. It only helps us start in the right place.',
  other: 'other',
  otherLabel: 'Something else',
  otherMax: 60,
  otherPlaceholder: 'Tell us in a few words',
  next: 'Continue',
  skip: 'Skip',
}

export const whyChips: { k: string; e: string; t: string }[] = [
  { k: 'track', e: '🧭', t: 'Where I stand' },
  { k: 'home', e: '🏡', t: 'Home & mortgage' },
  { k: 'safety', e: '🛟', t: 'Emergency fund' },
  { k: 'retire', e: '🌅', t: 'Retirement plan' },
  { k: 'goal', e: '🎯', t: 'Save for something' },
  { k: 'invest', e: '📈', t: 'Invest my money' },
  { k: 'debt', e: '💳', t: 'Clear my debt' },
  { k: 'change', e: '🔄', t: 'Big life change' },
  { k: 'curious', e: '👀', t: 'Just exploring' },
]
