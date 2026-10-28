// The short videos, shared by Explore, the video library and the player.
export type VideoKind = 'mortgage' | 'pension' | 'planner' | 'protection' | 'investment'

export interface Video {
  id: string
  title: string
  mins: number
  /** Running time shown on the card; videos without one show their minutes. */
  duration?: string
  kind: VideoKind
  /** "Presenter · role". */
  who: string
  /** The calculator the video leads to. */
  tool: string
  art: string
  src?: string
  poster?: string
  captions?: string
  caption: string
  transcript?: string
}

export const VIDEO_KIND_LABEL: Record<VideoKind, string> = {
  mortgage: 'Mortgages',
  pension: 'Pensions',
  planner: 'Savings & money',
  protection: 'Protection',
  investment: 'Investing',
}

export const VIDEOS: Video[] = [
  {
    id: 'v7',
    title: 'What is auto-enrolment?',
    mins: 2,
    duration: '1:14',
    kind: 'pension',
    who: 'LifeMap · Pensions explainer',
    tool: 'retirement',
    art: 'savings',
    src: 'media/auto-enrolment-explained.mp4',
    poster: 'media/money-plant.jpg',
    caption: 'Auto-enrolment: how the workplace pension scheme works.',
  },
  {
    id: 'v8',
    title: 'Your retirement plan: how it works',
    mins: 2,
    duration: '1:22',
    kind: 'pension',
    who: 'LifeMap · Pensions explainer',
    tool: 'retirement',
    art: 'pension',
    src: 'media/retirement-plan-how-it-works.mp4',
    poster: 'media/retired-reading.jpg',
    caption: 'How your retirement plan works, step by step.',
  },
  {
    id: 'v9',
    title: 'How much can I borrow? A first-time buyer’s guide',
    mins: 3,
    duration: '2:56',
    kind: 'mortgage',
    who: 'LifeMap · Mortgage guide',
    tool: 'borrow',
    art: 'mortgage',
    src: 'media/how-much-can-i-borrow.mp4',
    poster: 'media/how-much-can-i-borrow-poster.jpg',
    captions: 'media/how-much-can-i-borrow.vtt',
    caption: 'The five checks lenders make, with a real-life example…',
    transcript:
      'Hey there, I’m John Nugent, and welcome to LifeMap. I’m going to answer the question I get asked more than any other… how much can I actually borrow? Don’t worry, we’ll keep it simple. And we’ll follow a real-life example, so you can see exactly how it works. Let’s meet Aoife and Conor. They’re renting at the moment, paying €1,500 a month… and they’re dreaming of their own front door. Between them, they earn €85,000 a year. So… how much could they borrow? Lenders look at five things. Let’s take them one by one. First… loan to income. As a rule, you can borrow up to four times your combined income. For Aoife and Conor, that’s €85,000 times four… which is €340,000. Some lenders can stretch a little further for high earners. But you’d need to be approved at four times first. Second… your deposit. Every lender asks for at least ten percent of the house price. So we add that to Aoife and Conor’s €340,000. And that gives us a house price of €377,778. That’s €340,000 to borrow, plus a deposit of about €37,778. That’s ten percent of the price. Now, here’s some good news. There’s a Help to Buy scheme that can go towards your deposit. It’s for first-time buyers of a new home priced under €500,000… and you’ll need to have paid income tax and DIRT in Ireland over the last four years. You can claim the lowest of three things: ten percent of the property value, the tax you’ve paid over those four years, or €30,000. Whichever comes out smallest. Third… net disposable income. That’s simply whether you’d have enough left over to live on each month. Lenders work this out with a formula based on your family size, not your actual spending. Fourth… your debt servicing ratio. Lenders limit how much of your income can go on repaying debts, like loans or credit cards. If you’ve already got a lot of borrowing, adding a mortgage could push you over that limit. The good news? Aoife and Conor only have one small loan, so neither of these is a worry for them. Fifth… repayment capacity. Lenders need to be sure you can comfortably afford the monthly payment. Over thirty-five years, a mortgage of €340,000 comes to roughly €1,350 to €1,450 a month, depending on the lender. Some lenders also offer cashback, usually one to two percent when you draw down. That can make the monthly payment a touch higher… but you get some money back at the start. Now… Aoife and Conor are paying €1,500 a month in rent, and they’re saving €300 a month on top. That’s €1,800 a month they’ve shown they can manage. And that comfortably covers the repayment. They could even look at a shorter mortgage term than thirty-five years. So there you have it. Five checks, and a clear picture of what Aoife and Conor could borrow. Your own numbers will be different… and that’s completely okay. That’s what we’re here for. Pop your details into LifeMap, and we’ll talk you through your own options. Book your expert appointment today with us.',
  },
  {
    id: 'v1',
    title: 'Your first home: deposit to keys',
    mins: 1,
    duration: '0:53',
    kind: 'mortgage',
    who: 'Example video · Mortgage guide',
    tool: 'deposit',
    art: 'mortgage',
    src: 'media/first-home-deposit-to-keys.mp4',
    poster: 'media/first-home-deposit-to-keys-poster.jpg',
    captions: 'media/first-home-deposit-to-keys.vtt',
    caption: 'Most buyers need a 10% deposit. Here’s how to get there faster…',
    transcript:
      'Buying your first home in Ireland? Stop. Watch this before you sign anything. One. You can borrow up to four times your income, with a ten percent deposit. But choose a repayment you can sleep on. Two. Add stamp duty, legal fees and a survey to your budget. Three. Claim every benefit: Help to Buy, and the First Home Scheme. Four. Fixed gives certainty, variable can move. Five. Get approval in principle before you view a single house. Six. Protect your family with mortgage protection. Do this, and eight months later, you’re holding the keys. Time to put the kettle on.',
  },
  {
    id: 'v2',
    title: 'Pensions made simple: tax relief explained',
    mins: 3,
    kind: 'pension',
    who: 'Conor Walsh · Pension expert',
    tool: 'retirement',
    art: 'investing',
    caption: 'For every €100 you pay in, the real cost to you can be much less…',
  },
  {
    id: 'v3',
    title: 'How much emergency money do you need?',
    mins: 2,
    kind: 'planner',
    who: 'Aisling Doyle · Financial planner',
    tool: 'emergency',
    art: 'savings',
    caption: 'A simple rule: three to six months of your essential spending…',
  },
  {
    id: 'v4',
    title: 'Protecting your family, simply',
    mins: 3,
    kind: 'protection',
    who: 'Mark Byrne · Protection expert',
    tool: 'lifecover',
    art: 'protection',
    caption: 'If your income stopped tomorrow, what would keep your plan going?…',
  },
  {
    id: 'v5',
    title: 'Investing for beginners: risk, time and fees',
    mins: 4,
    kind: 'investment',
    who: 'Sarah Kelly · Investment expert',
    tool: 'riskreturn',
    art: 'investing',
    caption: 'Time in the market matters more than timing the market…',
  },
  {
    id: 'v6',
    title: 'Why we spend the way we do',
    mins: 2,
    kind: 'planner',
    who: 'Aisling Doyle · Financial planner',
    tool: 'surplus',
    art: 'everyday',
    caption: 'Your money story shapes every choice. Let’s look at yours…',
  },
]
