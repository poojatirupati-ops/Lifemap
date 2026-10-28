export const copy = {
  createTitle: 'Create your account',
  signInTitle: 'Welcome back',
  createLead: "To add your money safely, let's set up your account.",
  signInLead: 'Enter your email and we will send you a code.',
  codeLead: (email: string) => `We sent a 6-digit code to ${email}. It can take a minute to arrive.`,
  sendFailed: "We couldn't send the code. Check your connection and try again.",
  badCode: "That code didn't work. Check it and try again, or ask for a new one.",
  resent: 'A new code is on its way.',
  makesMoneyLink: 'How LifeMap makes money',
  makesMoney: 'LifeMap is free to use. If you choose a product or an adviser later, the provider may pay us. It never changes what we show you first, and we never sell your details.',
  consentsLegend: 'Your choices',
}

export const SIGNUP_KEY = 'lifemap.signup'

export const consents = [
  { key: 'plan', label: 'Use my details to build my plan', required: true },
  { key: 'updates', label: 'Send me reminders and updates', required: false },
] as const

export type ConsentKey = (typeof consents)[number]['key']
