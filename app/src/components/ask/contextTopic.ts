import type { Topic } from './topics.tsx'

// [the screens it is for, question, answer]; the first match wins
const BY_SCREEN: [RegExp, string, string][] = [
  [
    /^DR$/,
    'What are my "money terms"?',
    'They\'re the words an adviser would use for your answers, such as "Loss aversion" (losses feel bigger than gains). Each comes with a plain-English line. They describe you. They aren\'t advice.',
  ],
  [
    /^DS$/,
    'Do I have to give my email?',
    'No. Your email just lets us send you a secure link to come back. Tap "Skip for now" to go straight in. We ask again only when you make your plan and add money figures.',
  ],
  [
    /^(HOME|PLAN)-0$/,
    'What happens when I make my plan?',
    'Eight short steps: you and your family, goals, timeline, money profile, a quick account check, your finances, a final check, then your results. Leave any time. Your progress is saved.',
  ],
  [
    /^B1$/,
    'Why do you ask about my family?',
    'Your age, partner and the people who rely on you shape which goals we suggest and how far your money needs to go. No money figures yet.',
  ],
  [
    /^B4$/,
    'What is my money profile?',
    'Three things: risk appetite (how much risk you want), capacity for loss (how much you can afford to lose) and time horizon (how long you can wait), plus how you tend to act. Together they give an indicative risk profile your adviser confirms with you.',
  ],
  [
    /^(CALC|XPL|VID)/,
    'Are these calculators advice?',
    'No. They show what could happen with the figures on screen and simple assumptions. They are illustrations, not a guarantee and not a recommendation. An adviser can look at your full situation.',
  ],
  [
    /^D1$/,
    "Why do you ask what's going on?",
    'So we can put the goals that matter to you first, like a home, a family or retirement. Pick as many as you like, or skip. Nothing is saved unless you choose.',
  ],
  [
    /^D/,
    'Why do you ask these questions?',
    'They help us understand how you feel about money, so the goals and results we show fit you. There are no right or wrong answers, and nothing is saved unless you choose.',
  ],
  [
    /^(F1|PLAN-ADD)$/,
    'How do I choose goals?',
    'Tap any that matter to you. You can add or remove goals later. Retirement is a goal like any other: add it if you want us to check your later years. Without it, we still assume work income stops at your retirement age in About you (66 unless you change it).',
  ],
  [
    /^(F2|PLAN)$/,
    'How does the timeline work?',
    "Each goal sits at the age you'd like it to happen. Drag it left for sooner or right for later, or use the − and + buttons. Rough is fine. You can change it any time.",
  ],
  [
    /^F4$/,
    'What is my LifeMap?',
    'It is your list of goals with when and how much. Next, we add your money so we can check how far it goes.',
  ],
  [
    /^P1/,
    'Why do I need an account?',
    'So your money details are stored safely and only you can see them. We check your email and mobile to keep your account secure.',
  ],
  [
    /^(P[234]|PU)/,
    'Why do you need my figures?',
    'Your income, savings, debts and pension let us work out how far your money can go. Rough figures are fine. "Not sure? See an example" shows where to find each one; we never fill in a figure for you. We don\'t connect to your bank.',
  ],
  [
    /^HOME$/,
    'What is "overall readiness"?',
    'The average of how much each goal is covered. 100% means your income and savings should cover every goal. My Plan shows the detail.',
  ],
  [
    /^ME/,
    'Why does my profile matter?',
    "Your answers set the indicative risk profile shown on My Plan and in your report. Your adviser sees it only if you choose to share it, so you won't have to repeat yourself.",
  ],
  [
    /^(C|EXP)/,
    'What happens at the adviser meeting?',
    "It's free, about 45 minutes, with no obligation. The adviser goes through your plan and answers your questions. Only they can give you advice.",
  ],
]

/** The question that fits the screen Ask was opened from, if any. */
export function contextTopic(screenId: string): Topic | null {
  const found = BY_SCREEN.find(([screens]) => screens.test(screenId))
  return found ? { key: 'ctx', question: found[1], answer: found[2] } : null
}
