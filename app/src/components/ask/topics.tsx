// What Ask LifeMap can explain (help only: plain-English explanations, never advice).
import type { ReactNode } from 'react'

export interface Topic {
  key: string
  question: string
  answer: ReactNode
}

/** Topics that hold for everyone, in the order offered. */
export const GENERAL_TOPICS: Topic[] = [
  {
    key: 'advice',
    question: 'Is this financial advice?',
    answer:
      'No. LifeMap gives guidance: it explains your situation and shows what could happen. Only an authorised adviser who knows your full situation can give advice.',
  },
  {
    key: 'covered',
    question: 'What does "% covered" mean?',
    answer:
      "How much of a goal's cost your future income and savings should cover when it comes up. 100% means fully covered. 70% leaves about 30% to plan for.",
  },
  {
    key: 'today',
    question: 'What is "today\'s money"?',
    answer:
      'Prices rise over time. We show amounts as they would feel today, so €10,000 means what €10,000 buys now, not in 20 years.',
  },
  {
    key: 'risk',
    question: 'What is a risk profile?',
    answer: (
      <>
        A short summary of how much ups and downs suit you. It combines the risk you <b>want</b> to
        take, the risk you <b>can</b> afford and <b>how long</b> you can wait. It's a guide: your
        adviser confirms it with you.
      </>
    ),
  },
  {
    key: 'capacity',
    question: 'What does "capacity" mean?',
    answer:
      'Capacity for loss is how big a fall you could live with without hurting everyday life. Could you still pay your bills if your investments dropped for a while?',
  },
  {
    key: 'behaviour',
    question: 'What is "investor behaviour"?',
    answer:
      'How you tend to act with money, such as researching, asking an expert or acting fast. It helps your adviser explain things your way.',
  },
  {
    key: 'estimate',
    question: "What if I don't know a figure?",
    answer:
      '"Not sure? See an example" shows how Aoife and Cian filled it in, and where to find yours. It never fills in a figure for you: everyone\'s money is different. Nothing to add? Leave it blank. It counts as €0 and stays on your list as optional.',
  },
  {
    key: 'data',
    question: 'Is my data safe?',
    answer:
      'Your data is stored in the EU and never sold. Nothing is shared with an adviser unless you tick what to share. You can delete everything in Me › Privacy & preferences.',
  },
  {
    key: 'partner',
    question: 'Can my partner join?',
    answer:
      'Yes. In Me you can invite your partner to add their own details, or add their name, age and income yourself.',
  },
  {
    key: 'free',
    question: 'Does it cost anything?',
    answer:
      'LifeMap is free for you. If you work with an adviser, their firm may pay us a fee. Your adviser will tell you how they are paid before you agree to anything.',
  },
]

export const ADVICE_GUARD =
  "I can't tell you what to do with your money: that would be advice. I can explain what your results mean. For a personal recommendation, book a free adviser meeting."
