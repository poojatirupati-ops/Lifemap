// Money profile: Q6 plus six new questions (spec sec 13). With the 6 Discover questions this makes 13, each asked once.
// Option order = score 1 to 4 for u9, u10, u12, u11, u14. u4 and u11 carry a behaviour `trait`.
import type { Question } from './discover.data.ts'

export const MONEY: Question[] = [
  { id: 'q6', q: 'How much could you comfortably invest each month?', sub: 'Without cutting back on everyday life.', section: ['Investment capacity', 'what you can put to work'], o: [
    { e: '🪙', t: 'Under €100', tag: 'Starter capacity', line: 'A small amount to invest each month.', s: 1 },
    { e: '💶', t: '€100 to €300', tag: 'Moderate capacity', line: 'A steady amount to invest each month.', s: 2 },
    { e: '💰', t: '€300 to €750', tag: 'Good capacity', line: 'A healthy amount to invest each month.', s: 3 },
    { e: '🏦', t: 'Over €750', tag: 'High capacity', line: 'A large amount to invest each month.', s: 4 },
    { e: '🎢', t: 'It changes month to month', tag: 'Variable income', line: 'What you can put aside changes month to month.', s: 2 }] },
  { id: 'u9', q: 'If you put money away to grow, when might you need it back?', section: ['Time horizon', 'how long your money can stay invested'], o: [
    { e: '⏱️', t: 'Within 2 years', tag: 'Short horizon', line: 'You may need the money back soon.', s: 1 },
    { e: '📆', t: 'In 2 to 5 years', tag: 'Medium horizon', line: 'You may need it in a few years.', s: 2 },
    { e: '🗓️', t: 'In 5 to 10 years', tag: 'Long horizon', line: 'It can stay invested for 5 to 10 years.', s: 3 },
    { e: '🌳', t: 'Not for 10+ years', tag: 'Very long horizon · time in the market', line: 'It can stay put for 10+ years, so there is time to recover from falls.', s: 4 }] },
  { id: 'u10', q: 'Markets dip and your investments are down 20% for a whole year. What would that actually mean for your life?', sub: "Not how you'd feel. What would really change.", panel: [10000, 8000], section: ['Capacity for loss', 'what a fall would really cost you'], o: [
    { e: '😟', t: "I'd struggle to pay the bills", tag: 'Low capacity for loss', line: 'A fall would hit your everyday bills.', s: 1 },
    { e: '⏸️', t: "I'd have to put a goal on hold", tag: 'Limited capacity for loss', line: 'A fall would put a goal on hold.', s: 2 },
    { e: '🙂', t: 'Annoying, but life goes on', tag: 'Moderate capacity for loss', line: 'A fall would sting, but life goes on.', s: 3 },
    { e: '😎', t: "Nothing changes, I won't need it for years", tag: 'High capacity for loss', line: "A fall wouldn't change your life.", s: 4 }] },
  { id: 'u12', q: 'How steady is your income?', section: ['Income stability', 'how steady your pay is'], o: [
    { e: '🌪️', t: 'Uncertain right now', tag: 'Income risk', line: 'Your pay could stop or change soon.', s: 1 },
    { e: '🌦️', t: 'It changes month to month', tag: 'Variable income', line: 'Your pay changes from month to month.', s: 2 },
    { e: '⛅', t: 'Fairly steady', tag: 'Stable income', line: 'Your pay is fairly steady.', s: 3 },
    { e: '☀️', t: 'Rock solid (permanent job or pension)', tag: 'Secure income', line: 'Your pay is very unlikely to stop.', s: 4 }] },
  { id: 'u14', q: 'If your income stopped tomorrow, how long could your savings keep you going?', section: ['Emergency fund', 'your safety net'], o: [
    { e: '😬', t: 'Less than a month', tag: 'No emergency fund', line: 'Less than a month of savings to fall back on.', s: 1 },
    { e: '🐷', t: '1 to 3 months', tag: 'Thin buffer', line: 'One to three months of savings to fall back on.', s: 2 },
    { e: '🛟', t: '3 to 6 months', tag: 'Emergency fund in place', line: '3 to 6 months of savings to fall back on.', s: 3 },
    { e: '🏰', t: '6 months or more', tag: 'Strong safety net', line: '6 months or more of savings to fall back on.', s: 4 }] },
  { id: 'u4', q: "A big money decision lands on your desk, like switching your pension. What's your move?", section: ['Decision style', 'how you make big money calls'], o: [
    { e: '🔬', t: 'Dig into every detail myself', tag: 'Self-directed · Due diligence', line: 'You research big decisions yourself.' },
    { e: '🧭', t: 'Get the gist, then check with an expert', tag: 'Validator', line: 'You get the gist, then check with an expert.' },
    { e: '🤝', t: 'Hand it to an expert I trust', tag: 'Delegator · Advice-seeker', line: 'You hand big decisions to an expert you trust.' },
    { e: '⏳', t: 'Leave it for another day', tag: 'Procrastination · Status quo bias', line: 'Putting decisions off and sticking with what you have, even when a change could help.', trait: 'Procrastination · Status quo bias' }] },
  { id: 'u11', q: 'How would you describe your investing know-how?', chips: ['Savings account', 'Pension', 'Shares or funds', 'Crypto', 'None'], section: ['Knowledge & experience', "what you've done before"], o: [
    { e: '🌱', t: 'Total beginner', tag: 'Novice investor', line: 'Investing is new to you.', s: 1 },
    { e: '📘', t: 'I know the basics: savings and pension', tag: 'Basic knowledge', line: 'You know savings and pensions.', s: 2 },
    { e: '📈', t: "I've invested in funds or shares", tag: 'Experienced investor', line: 'You have invested in funds or shares.', s: 3 },
    { e: '🏆', t: "I'm confident I can beat the market", tag: 'Very experienced · watch for overconfidence bias', line: 'You rate yourself highly; many investors feel surer than the facts support.', s: 4, trait: 'Overconfidence bias' }] },
]

/** Shown when low investing experience is what caps the profile (riskProfile().keNote). */
export const KE_NOTE = 'Investing is new to you, so this stays at Balanced for now. An adviser can explain how investments rise and fall.'
