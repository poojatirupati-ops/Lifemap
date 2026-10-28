/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { beforeAll, expect, test } from 'vitest'
import { defaultPlan, type Plan } from '../state/types.ts'
import { missingChoices, projectAll, projectYears, type YearRow } from './project.ts'

// Parity: the prototype's own project() runs in jsdom on the same customer; the TypeScript port must give the same rows, results and goal figures.
const { JSDOM, VirtualConsole } = createRequire(import.meta.url)('jsdom')
const html = readFileSync(new URL('../../../../LifeGoals-Customer-Journey-Prototype.html', import.meta.url), 'utf8')
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let w: any
beforeAll(async () => { w = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/', virtualConsole: new VirtualConsole() }).window; await new Promise(r => setTimeout(r, 600)) }, 20000)

const ASM_KEYS = ['wage', 'cash', 'inv', 'pen', 'penRet', 'mortRate', 'cardRate', 'loanRate', 'safetyMonths', 'cashYears', 'saveShare', 'noAnswer', 'investShare', 'cgtGain', 'accessAge', 'lumpSum', 'drawRule', 'drawFixed', 'spGrow', 'bands', 'retireSpend', 'ownShare', 'penChg', 'spYears', 'spWeek', 'pSpWeek', 'startYear']
const V5 = `S = fresh(); Object.assign(S.ans, {'2':2,'4':3,'7':0,'9':2,'12':3}); S.um = S.um || {}; S.um.a = S.um.a || {}; S.um.a.u14 = 2; S.about = {age:27, partner:false, deps:0, married:null}; S.acct.name='Pooja';
 const put=(k,v)=>{S.fin[k]=v;S.src[k]='typed'}; put('work','Employed');put('income',79000);put('costsM',3000);put('home','Rent');
 S.goals=[]; const g1=mkGoal('family'); g1.age=30; g1.amount=15000; S.goals.push(g1); const g2=mkGoal('retire'); g2.amount=40000; S.goals.push(g2);
 ['life','health'].forEach(k=>put(k,'Yes')); ['ip','ci','workCover'].forEach(k=>put(k,'No')); prefillAbout(); S.retireSet=true; setRetireAge(50); g2.age=50; S.asm.startYear=2026; S.asm.spWeek=0; S.ans['6']=3; S.fin.ae='No'; S.src.ae='typed'; S.about.cred={rent:true}; S.asm.planEnd=80; S.infl=0.039; S.shell=true; S.app=true; applyAssume();`
const CASES: Record<string, string> = {
  sample: `loadSample(); S.asm.startYear = 2026; applyAssume()`,   // 2026 start: the Budget 2027 tax rules are not applied (T3), so a 2027 start cannot match
 
  v5: V5,
  variant: `loadSample(); S.asm.startYear = 2026; setRetireAge(55); Object.assign(S.asm, {accessAge:50, drawRule:'fixed', drawFixed:25000, lumpSum:0.2}); S.assume='cautious'; S.fin.pSp='Qualified adult increase'; S.penExtra = 100; S.about.cred = {carer:true}; S.about.married = true;
    S.rank = S.goals.slice().reverse().map(g => g.id); S.ans['6'] = 1; applyAssume()`,
}

// The prototype's customer as a v2 Plan. explicit: every judgement value is copied into plan.asm (so only the engine is compared); otherwise the register's standards resolve them.
function planOf(code: string, explicit: boolean, wiCode = '') {
  const out = JSON.parse(w.eval(`(() => { ${code}; ${wiCode ? 'S.saveM = 300;' : ''} const P = project(${wiCode}), asm = {}; ${JSON.stringify(ASM_KEYS)}.forEach(k => { const v = asmV(k); if (v != null) asm[k] = v; });
    return JSON.stringify({ S:{ fin:S.fin, src:S.src, goals:S.goals, lists:S.lists, about:S.about, ans:S.ans, rank:S.rank || null, penExtra:S.penExtra || 0, assume:S.assume || 'standard', infl:S.infl, retireAge:S.retireAge, pRet:S.pRetSet ? S.pRet : null, asm:S.asm, gid:S.gid, safetyOff:!!S.safetyOff, safetyWanted:!!S.safetyWanted }, asm, end:AS.end, y0:YEAR0, P }) })()`))
  const s = out.S, a0 = s.about.age, iso = (age: number) => `${out.y0 - age}-06-15`
  const plan: Plan = {
    ...defaultPlan(), dob: iso(a0), partnerDob: s.about.partner && s.fin.pAge ? iso(s.fin.pAge) : null,
    about: { partner: !!s.about.partner, deps: s.about.deps ?? null, married: s.about.married ?? null, legacyAge: null, ...(s.about.cred ? { cred: s.about.cred } : {}) } as Plan['about'],
    goals: s.goals, gid: s.gid, retireAge: s.retireAge, planUntil: out.end, partnerRetireAge: s.pRet, infl: s.infl, ans: s.ans, rank: s.rank, penExtra: s.penExtra, assume: s.assume,
    safetyOff: s.safetyOff, safetyWanted: s.safetyWanted, fin: s.fin, src: s.src, lists: s.lists, asm: explicit ? { ...s.asm, ...out.asm } : { ...s.asm },
  }
  plan.asm.startYear = out.y0
  return { plan, P: out.P }
}

const close = (x: unknown, y: unknown) => (typeof y === 'number' ? typeof x === 'number' && Math.abs(x - y) <= 1e-6 * Math.max(1, Math.abs(y)) : JSON.stringify(x) === JSON.stringify(y))
const diffs = (got: Record<string, unknown>, want: Record<string, unknown>, where: string): string[] => Object.keys(want).filter(k => !close(got[k], want[k])).map(k => `${where}.${k}: ${JSON.stringify(got[k])} vs ${JSON.stringify(want[k])}`)

// What-if: extra a month and a lump towards the first spending goal, plus the customer's own saving (S.saveM) of 300 a month.
test('parity with the prototype: what-if (goal extra, lump sum, own saving override)', () => {
  const wiCode = '{ g: S.goals.find(g => g.k !== "retire" && g.kind === "spend").id, m: 150, l: 2000 }'
  const { plan, P } = planOf(CASES.sample, true, wiCode), g = plan.goals.find(x => x.kind === 'spend')!
  const wi = { g: g.id, m: 150, l: 2000, saveM: 300 }, r = projectAll(plan, wi), base = projectAll(plan)
  if (r.blocked || base.blocked) throw new Error('blocked')
  expect(r.rows.length).toBe(P.rows.length)
  const bad: string[] = []
  P.rows.forEach((p: Record<string, unknown>, i: number) => bad.push(...diffs(r.rows[i] as unknown as Record<string, unknown>, { saved: p.saved, spent: p.spent, liquid: p.liquid, pen: p.pen, inflow: p.inflow, used: p.used, short: p.short }, `row${i}`)))
  for (const [id, v] of Object.entries(P.pct)) if (r.pct[+id] !== v) bad.push(`pct${id}: ${r.pct[+id]} vs ${v}`)
  bad.push(...diffs(r.save, P.save, 'save'))
  expect(bad.slice(0, 12)).toEqual([])
  expect(r.rows.map(x => x.saved)).not.toEqual(base.rows.map(x => x.saved))   // the what-if really changed something
})

test('a plan-until age at or below today blocks: no empty success', () => {
  const p = planOf(CASES.sample, true).plan, now = (p.asm.startYear as number) - +p.dob!.slice(0, 4)
  expect(projectAll({ ...p, planUntil: 20 })).toEqual({ blocked: true, missing: ['planUntil'] })
  expect(projectAll({ ...p, planUntil: now })).toEqual({ blocked: true, missing: ['planUntil'] })
})

for (const [name, code] of Object.entries(CASES))
  for (const explicit of name === 'v5' ? [true, false] : [true]) {
    test(`parity with the prototype: ${name}${explicit ? '' : ' (register standards)'}`, () => {
      const { plan, P } = planOf(code, explicit), r = projectAll(plan)
      if (r.blocked) throw new Error(`blocked: ${r.missing}`)
      expect(r.rows.length).toBe(P.rows.length)
      const bad: string[] = []
      P.rows.forEach((p: Record<string, unknown>, i: number) => {
        const { a, yr, dueG, rmark, retired, goalShort, due, ...rest } = p, g = r.rows[i]
        bad.push(...diffs(g as unknown as Record<string, unknown>, { age: a, year: yr, rmark, retired, due, goalShort: goalShort ?? undefined, ...rest, dueG }, `row${i}`))
      })
      for (const [id, v] of Object.entries(P.pct)) if (r.pct[+id] !== v) bad.push(`pct${id}: ${r.pct[+id]} vs ${v}`)
      for (const [id, v] of Object.entries(P.goal as Record<string, Record<string, unknown>>)) bad.push(...diffs(r.goal[+id] as unknown as Record<string, unknown>, v, `goal${id}`))
      bad.push(...diffs(r.save, P.save, 'save'))
      expect(bad.slice(0, 12)).toEqual([])
    })
  }

const short = (r: YearRow) => r.shortLiving + r.goalGap > 0.5
test('v5 regression customer: savings run out at 52, 29 gap years, 54 appendix years', () => {
  const r = projectAll(planOf(CASES.v5, false).plan)
  if (r.blocked) throw new Error('blocked')
  expect(r.rows.length).toBe(54)
  expect(r.rows.find(short)?.age).toBe(52)
  expect(r.rows.filter(short).length).toBe(29)
})

test('a missing required choice blocks: nothing projected, no invented figure', () => {
  const base = planOf(CASES.sample, true).plan
  for (const [key, patch] of [['retireAge', { retireAge: null }], ['planUntil', { planUntil: null }], ['infl', { infl: null }], ['dob', { dob: null }], ['partnerRetireAge', { partnerRetireAge: null }]] as const) {
    const p = { ...base, ...patch }, r = projectAll(p)
    expect(r).toEqual({ blocked: true, missing: [key] })
    expect([...projectYears(p)]).toEqual([])
  }
  expect(missingChoices({ ...base, retireAge: null, infl: null })).toEqual(['retireAge', 'infl'])
  expect(projectAll(base).blocked).toBe(false)
})

test('events apply for the whole year reached: income stops in the retirement year, one row per calendar year', () => {
  const r = projectAll(planOf(CASES.v5, false).plan)
  if (r.blocked) throw new Error('blocked')
  expect(r.rows.map(x => x.year - x.age).every(d => d === 1999)).toBe(true)
  expect(r.rows.find(x => x.age === 49)?.retired).toBe(false)
  expect(r.rows.find(x => x.age === 50)?.retired).toBe(true)
  expect(r.rows.filter(x => x.rmark).map(x => x.age)).toEqual([50])
})

test('goal ranking decides who is funded first', () => {
  const { plan } = planOf(CASES.sample, true), spend = plan.goals.filter(g => g.kind !== 'retire' && g.kind !== 'legacy').map(g => g.id)
  const pcts = (rank: number[] | null) => { const r = projectAll({ ...plan, rank }); return r.blocked ? {} : r.pct }
  expect(pcts(spend)).not.toEqual(pcts(spend.slice().reverse()))
})
