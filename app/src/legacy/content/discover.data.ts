// Discover: the 6 public questions (spec sec 2, 12, 16, 17). Wording verbatim; tags are the Lifecast terms
// (Q2 option 3 = "The Opportunist"). `line` is the plain-English meaning shown beside each term, worded neutrally.
export interface Opt { e: string; t: string; tag: string; line: string; s?: number; trait?: string }
export interface Question {
  id: string
  q: string
  sub?: string
  panel?: [number, number]
  chips?: string[]
  section: [term: string, plain: string]
  o: Opt[]
}
/** Answers are option indexes, keyed by question id. */
export type Answers = Partial<Record<string, number>>

export const DISCOVER: Question[] = [
  { id: 'q2', q: "Your friends would say you're always…", section: ['Money mindset', 'how you handle money day to day'], o: [
    { e: '📊', t: 'Sticking to a budget', tag: 'The Budgeter', line: 'You like to know where every euro goes.' },
    { e: '🔍', t: 'Checking your balance', tag: 'Money Vigilant', line: 'You keep a close eye on your money.' },
    { e: '📱', t: 'Trying something new', tag: 'The Opportunist', line: 'You are quick to spot and try new chances.' },
    { e: '🧘', t: 'Relaxed about money', tag: 'The Money Monk', line: "Money isn't the point for you." }] },
  { id: 'q4', q: "A friend's investment doubled in a month. What do you do?", section: ['Investor behaviour', 'how you react to a hot tip'], o: [
    { e: '🏃', t: 'Buy in quickly, before I miss out', tag: 'FOMO · Herd behaviour', line: "You're tempted to follow the crowd." },
    { e: '🔎', t: 'Research it before I decide', tag: 'Due diligence', line: 'You check the facts before you act.' },
    { e: '🧑‍💼', t: 'Ask an expert first', tag: 'Advice-seeker', line: "You like an expert's view before you decide." },
    { e: '🙅', t: 'Stay away. Sounds too risky', tag: 'Loss aversion', line: 'Losses feel bigger than gains.' }] },
  { id: 'q7', q: 'A €1,000 bill arrives tomorrow. How do you pay it?', section: ['Emergency fund', 'money for surprises'], o: [
    { e: '✅', t: 'From my emergency savings', tag: 'Emergency fund', line: 'You have money set aside for surprises.', s: 4 },
    { e: '🐷', t: 'From money saved for something else', tag: 'Thin buffer', line: 'Surprises come out of money saved for your goals.', s: 2 },
    { e: '💳', t: 'Credit card or a loan', tag: 'Relies on credit', line: 'Surprises go on a card or a loan.', s: 1 },
    { e: '😬', t: "I'm not sure", tag: 'No safety net', line: 'Nothing is clearly set aside for surprises yet.', s: 1 }] },
  { id: 'q8', q: 'Pick your road for your long-term money.', sub: 'The motorway is steady but slower. The mountain pass has more twists and turns, and more room to grow.',
    section: ['Risk appetite', 'how much risk you want'], o: [
    { e: '🛣️', t: 'Straight up the motorway', tag: 'Low risk', line: 'You want your money to stay steady.', s: 1 },
    { e: '🏞️', t: 'A quiet country road', tag: 'Cautious', line: 'You accept small ups and downs.', s: 2 },
    { e: '🌿', t: 'Up and down the boreens', tag: 'Balanced', line: 'You accept some ups and downs for growth.', s: 3 },
    { e: '🏔️', t: 'Over the Healy Pass, hairpins and all', tag: 'High risk', line: 'You accept big ups and downs for more growth.', s: 4 }] },
  { id: 'q9', q: 'Your €10,000 investment drops to €8,500. What do you do?', panel: [10000, 8500], section: ['Investor behaviour', 'how you act when prices fall'], o: [
    { e: '😱', t: 'Sell before it drops more', tag: 'Panic selling', line: 'Selling when prices fall locks in the loss.', s: 1 },
    { e: '😬', t: "Wait until it's back to €10,000, then sell", tag: 'Anchoring', line: 'Fixing on the price you paid.', s: 2 },
    { e: '😌', t: 'Stay calm and hold on', tag: 'Long-term investor', line: 'You ride out the dips.', s: 3 },
    { e: '🛒', t: "Buy more while it's cheaper", tag: 'Buy the dip', line: 'You see a fall as a chance to buy.', s: 4 }] },
  { id: 'q12', q: 'How do you feel about your financial future?', sub: 'Every answer is normal.', section: ['Money mindset', 'how you feel about money'], o: [
    { e: '😟', t: 'Worried', tag: 'Financial anxiety', line: 'Money worries weigh on you.', s: 1 },
    { e: '🤞', t: 'Hopeful', tag: 'Cautious optimism', line: "You're hopeful, with some doubts.", s: 2 },
    { e: '😌', t: 'Confident', tag: 'Financially confident', line: 'You feel in control of your future.', s: 4 },
    { e: '🙈', t: 'I avoid thinking about it', tag: 'Money avoidance', line: "You'd rather not look at money." , s: 1 }] },
]

export const TYPES = {
  A: { name: 'Achiever', e: '🎯', strap: 'In control, goal-driven, disciplined with money.', str: ['Clear about what you want', 'You stick to a plan'], watch: 'Being too hard on yourself when life changes the plan.' },
  B: { name: 'Balancer', e: '⚖️', strap: 'Value-seeking, vigilant, careful with risk.', str: ['Careful with money', 'You weigh things up'], watch: 'Playing so safe that cash quietly loses value to rising prices.' },
  E: { name: 'Explorer', e: '🧭', strap: 'Curious, open to new ideas, comfortable with risk.', str: ['Open to new ideas', 'Comfortable with change'], watch: 'Jumping in before your emergency fund is in place.' },
  C: { name: 'Contented', e: '🛋️', strap: 'Comfortable, steady, low-maintenance with money.', str: ['Calm about money', 'Not easily rattled'], watch: 'Putting off decisions, such as pension top-ups.' },
} as const
export type TypeKey = keyof typeof TYPES

/** Section names pair the term with a plain label (sec 12). */
export const SECT = {
  mindset: ['Money mindset', 'how you feel about money'],
  behaviour: ['Investor behaviour', 'how you tend to act'],
  appetite: ['Risk appetite', 'how much risk you want'],
  safety: ['Emergency fund', 'money for surprises'],
  capacity: ['Investment capacity', 'what you can put to work'],
} as const
export type SectKey = keyof typeof SECT
