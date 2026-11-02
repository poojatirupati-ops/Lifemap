// The original script's reportData() and renderer in node:vm, and plans to feed both.
import { runOriginal, TODAY } from '../golden/origSlice'
import { fixtures } from '../golden/origProfile'
import { prepared as preparedBy, chooser } from '../golden/helpers'

export const original = runOriginal('applyAssume, syncLists, autoSafety, reportData, LifeMapReport')
export const today = new Date(TODAY + 'T12:00:00')

// the original's state after what it runs before the report
export const prepared = (state: any) => preparedBy(original, state)

const base = fixtures.find(([name]) => name === 'finances-complete.json')![1]

/** A plan ready for the report, varied where the report branches. */
export function randomPlan(seed: number) {
  const { pick, between } = chooser(seed)
  const s = structuredClone(base)
  s.infl = pick(0.01, 0.02, 0.035)
  s.retireAge = between(50, 68)
  s.pRetSet = true
  s.about.age = between(25, 66)
  s.about.ageToday = pick(null, s.about.age)
  s.about.partner = pick(true, false)
  s.about.deps = pick(0, 2)
  s.acct.name = pick('', 'Aoife', "Seán O'Brien")
  s.rank = pick(null, s.goals.map((goal: any) => goal.id).reverse())
  s.asm.planEnd = between(85, 100)
  s.saveM = pick(null, between(0, 1500))
  Object.assign(s.fin, {
    income: between(0, 150000),
    work: pick('Employed', 'Employed', 'Self-employed', 'Not working'),
    costsM: between(1000, 6000),
    cash: between(0, 80000),
    invest: pick(0, between(0, 100000)),
    pension: between(0, 400000),
    pensionM: pick(0, between(100, 1500)),
    pensionOwnM: pick(0, between(50, 500)),
    sp: pick('Expect full', 'Partly', 'Not sure', 'None'),
    home: pick('Rent', 'Own with mortgage', 'Own outright'),
    mortBal: pick(0, between(50000, 300000)),
    cardBal: pick(0, between(0, 8000)),
    loanBal: pick(0, between(0, 20000)),
    life: pick('Yes', 'No', undefined),
    ip: pick('Yes', 'No', undefined),
  })
  if (pick(true, false)) for (const key of ['cash', 'invest', 'life', 'ip']) delete s.src[key]
  for (const goal of s.goals) {
    goal.age = goal.kind === 'retire' ? s.retireAge : between(s.about.age - 3, 95)
    goal.amount = between(1000, 200000)
  }
  if (pick(true, false)) s.goals = s.goals.filter((goal: any) => goal.kind !== 'retire')
  return s
}
