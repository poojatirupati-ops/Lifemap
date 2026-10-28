// Plan variants that reach the profile, goal and normaliser branches: dates of birth, costs, mortgage, debt.
const safetyGoal = { k: 'safety', auto: true, amount: 1, kind: 'pot', age: 40 }

const listItem = (fields: object) => ({
  id: 1,
  f: fields,
  src: {},
  conf: {},
  man: {},
  fix: {},
  docFrom: null,
})

export const variant = (plan: any, change: (copy: any) => void) => {
  const copy = structuredClone(plan)
  change(copy)
  return copy
}

// today is TODAY = 2026-10-26, so the 2008 and 1940s dates sit on the age limits
export const planVariants = (plan: any): any[] => [
  plan,
  variant(plan, (p) => {
    p.about.dob = { d: '21', m: '8', y: '1989' }
    p.about.pdob = { d: '3', m: '3', y: '1990' }
    p.about.partner = true
  }),
  variant(plan, (p) => {
    p.about.dob = { d: '29', m: '2', y: '2008' }
    p.about.pdob = { d: '1', m: '1', y: '1900' }
    p.about.partner = true
  }),
  variant(plan, (p) => {
    p.about.dob = { d: '21', m: '8', y: '1989' }
    p.about._dobAge = 99
    p.about.age = 40
  }),
  variant(plan, (p) => {
    p.asm = { ...p.asm, startYear: 2026 }
    p.about.dob = { d: '21', m: '8', y: '1989' }
  }),
  variant(plan, (p) => {
    p.src.costsM = 'typed'
    p.fin = {
      ...p.fin,
      costsM: 2000,
      home: 'Own with mortgage',
      mortBal: 200000,
      mortYears: 20,
      cardBal: 3000,
      loanBal: 8000,
    }
    p.goals.push({ ...safetyGoal, id: 99 })
  }),
  variant(plan, (p) => {
    p.src.costsM = 'typed'
    p.fin = {
      ...p.fin,
      costsM: 1800,
      home: 'Own with mortgage',
      mortBal: 150000,
      mortPayM: 900,
      mortRate: 4,
      cardBal: 1000,
      cardPayM: 10,
      loanBal: 5000,
      loanPayM: 200,
    }
    p.goals.push({ ...safetyGoal, id: 98 })
    p.asm = { ...p.asm, safetyMonths: 4 }
  }),
  variant(plan, (p) => {
    p.src.costsM = 'typed'
    p.fin = { ...p.fin, costsM: 2500, income: 4000, pIncome: 3000, work: 'Employed' }
    p.about.partner = true
    p.lists = { ...p.lists, mort2: [listItem({ owed: 90000 })] }
    p.goals.push({ ...safetyGoal, id: 97 })
  }),
  variant(plan, (p) => {
    p.src.costsM = 'typed'
    p.fin = {
      ...p.fin,
      costsM: 1500,
      home: 'Own with mortgage',
      mortBal: 180000,
      mortYears: '',
      mortPayM: '',
    }
    p.goals.push({ ...safetyGoal, id: 96 })
  }),
  variant(plan, (p) => {
    p.src.costsM = 'typed'
    p.fin.costsM = 1700
    p.lists = {
      ...p.lists,
      mort2: [
        listItem({ owed: 50000, rate: 0 }),
        listItem({ owed: 40000, rate: 3, years: 10 }),
        listItem({ owed: 20000, pay: 300, rate: 2 }),
      ],
    }
    p.goals.push({ ...safetyGoal, id: 95 })
  }),
  // 18 and 85
  variant(plan, (p) => {
    p.about.dob = { d: '26', m: '10', y: '2008' }
    p.about.pdob = { d: '26', m: '10', y: '1941' }
    p.about.partner = true
  }),
  // 17 and 86
  variant(plan, (p) => {
    p.about.dob = { d: '27', m: '10', y: '2008' }
    p.about.pdob = { d: '26', m: '10', y: '1940' }
    p.about.partner = true
  }),
  // 80
  variant(plan, (p) => {
    p.about.dob = { d: '26', m: '10', y: '1946' }
    p.about.deps = 1
  }),
  // 81
  variant(plan, (p) => {
    p.about.dob = { d: '26', m: '10', y: '1945' }
    p.about.deps = 3
  }),
  variant(plan, (p) => {
    p.about.dob = { d: '21', m: '8', y: '1989' }
    delete p.about._dobAge
    p.src.age = 'typed'
    p.src.retireAge = 'typed'
    p.about.deps = 4
  }),
  variant(plan, (p) => {
    p.src.costsM = 'typed'
    p.fin = { ...p.fin, costsM: 2500, income: 4000, pIncome: 0, work: 'Employed' }
    p.about.partner = true
    p.goals.push({ ...safetyGoal, id: 94 })
  }),
  variant(plan, (p) => {
    p.src.costsM = 'typed'
    p.fin = { ...p.fin, costsM: 2500, income: 4000, pIncome: 3000, work: 'Self-employed' }
    p.about.partner = true
    p.goals.push({ ...safetyGoal, id: 93 })
  }),
]

export const pensionItem = (fields: object) => ({ ...listItem(fields), src: { monthly: 'typed' } })
