/** The plan builder's 8 steps, each with the screen ids that belong to it. */
export const PLAN_BUILDER_STEPS = [
  { label: 'About you & family', screens: /^B1/ },
  { label: 'Your goals', screens: /^F1$/ },
  { label: 'Your timeline', screens: /^F[24]/ },
  { label: 'Your money profile', screens: /^B4$/ },
  { label: 'Secure your account', screens: /^P1/ },
  { label: 'Your finances', screens: /^P[23]|^PU/ },
  { label: 'Check your details', screens: /^P4$/ },
  { label: 'Your results', screens: /^U1$/ },
]

/** The 1-based plan builder step a screen belongs to; any other screen counts as step 1. */
export function planBuilderStep(screen: string) {
  const index = PLAN_BUILDER_STEPS.findIndex((step) => step.screens.test(screen))
  return index + 1 || 1
}
