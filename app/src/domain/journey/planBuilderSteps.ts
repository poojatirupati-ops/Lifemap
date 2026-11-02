/** The plan builder's 8 steps: the screen ids that belong to each, and how My Plan describes it. */
// prettier-ignore
export const PLAN_BUILDER_STEPS = [
  { icon: '🙂', label: 'About you & family', detail: 'Name, age, partner and family', screens: /^B1/ },
  { icon: '🎯', label: 'Your goals', detail: 'Pick what matters to you', screens: /^F1$/ },
  { icon: '🗓️', label: 'Your timeline', detail: 'Drag goals to when you want them', screens: /^F[24]/ },
  { icon: '🧭', label: 'Your money profile', detail: 'A few questions about risk', screens: /^B4$/ },
  { icon: '🔐', label: 'Secure your account', detail: 'A quick email check', screens: /^P1/, optional: true },
  { icon: '💶', label: 'Your finances', detail: 'Income, savings, home and pension', screens: /^P[23]|^PU/ },
  { icon: '✅', label: 'Check your details', detail: 'A short review before results', screens: /^P4$/ },
  { icon: '📈', label: 'Your results', detail: 'See what is on track and what to do next', screens: /^U1$/ },
]

/** The 1-based plan builder step a screen belongs to; any other screen counts as step 1. */
export function planBuilderStep(screen: string) {
  const index = PLAN_BUILDER_STEPS.findIndex((step) => step.screens.test(screen))
  return index === -1 ? 1 : index + 1
}
