/** The plan builder's 8 steps: the pages (paths) that belong to each, and how My Plan describes it. */
export const PLAN_BUILDER_STEPS = [
  {
    icon: '🙂',
    label: 'About you & family',
    detail: 'Name, age, partner and family',
    paths: /^\/build\/about/,
  },
  { icon: '🎯', label: 'Your goals', detail: 'Pick what matters to you', paths: /^\/build\/goals/ },
  {
    icon: '🗓️',
    label: 'Your timeline',
    detail: 'Drag goals to when you want them',
    paths: /^\/build\/(timeline|review)/,
  },
  {
    icon: '🧭',
    label: 'Your money profile',
    detail: 'A few questions about risk',
    paths: /^\/build\/profile/,
  },
  {
    icon: '🔐',
    label: 'Secure your account',
    detail: 'A quick email check',
    paths: /^\/(sign-in|account)/,
    optional: true,
  },
  {
    icon: '💶',
    label: 'Your finances',
    detail: 'Income, savings, home and pension',
    paths: /^\/build\/finances/,
  },
  {
    icon: '✅',
    label: 'Check your details',
    detail: 'A short review before results',
    paths: /^\/build\/check/,
  },
  {
    icon: '📈',
    label: 'Your results',
    detail: 'See what is on track and what to do next',
    paths: /^\/build\/results/,
  },
]

/** The 1-based plan builder step a page belongs to; any other page counts as step 1. */
export function planBuilderStep(path: string) {
  const index = PLAN_BUILDER_STEPS.findIndex((step) => step.paths.test(path))
  return index === -1 ? 1 : index + 1
}
