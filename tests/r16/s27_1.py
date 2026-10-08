from ed import Ed
e = Ed()
# --- (4) only four choices block results; the order the gate card lists them
a = e.t.index("function planMissing(){")
b = e.t.index("const planReady = () =>")
e.t = e.t[:a] + """function planMissing(){ if (!S) return []; const out = [];   // §27.4: only these four block results; everything else has a labelled default and never blocks
  if (!S.retireSet) out.push({k:'retireAge', n:'retirement age', t:'Retirement age', ty:3, own:true});
  if (!asmMine('planEnd')) out.push({k:'planEnd', n:ASM.planEnd.n, t:'Plan until age', ty:3, own:true});
  if (!inflSet()) out.push({k:'infl', n:'inflation rate', t:'Inflation', ty:3});
  if (pInc() && !S.pRetSet) out.push({k:'pRetireAge', n:'partner\\'s retirement age', t:'Partner\\'s retirement age', ty:3, own:true});   // M2: never defaulted
  return out; }
""" + e.t[b:]
e.rep("const reqKeys = () => ['infl', 'retireAge', 'planEnd'].concat(pInc() ? ['pRetireAge'] : []);","const reqKeys = () => ['retireAge', 'planEnd', 'infl'].concat(pInc() ? ['pRetireAge'] : []);")
# --- finNums defaults that used to block: work, partner's age, other-property mortgage term
e.rep("const mortOn = f.home === 'Own with mortgage', mR = n('mortRate') > 0","const wk = f.work || (n('income') > 0 ? 'Employed' : f.work), mortOn = f.home === 'Own with mortgage', mR = n('mortRate') > 0")
e.rep("inc = f.work === 'Not working' ? 0 : n('income');\n  const penM = f.work !== 'Not working'","inc = wk === 'Not working' ? 0 : n('income');\n  const penM = wk !== 'Not working'")
e.rep("const aeElig = f.work === 'Employed' && S.about.age","const aeElig = wk === 'Employed' && S.about.age")
e.rep("return {age:S.about.age, R:S.retireAge, work:f.work, married:!!S.about.partner && S.about.married === true, partner:!!S.about.partner, pAge:n('pAge'),","return {age:S.about.age, R:S.retireAge, work:wk, married:!!S.about.partner && S.about.married === true, partner:!!S.about.partner, pAge:S.about.partner ? (n('pAge') || S.about.age) : 0,")
e.rep(": hasVal(it.f.years) && +it.f.years > 0 ? mPmt(b, r, +it.f.years) : 0; }); /* H2: no hidden term; planMissing() asks for the years left or the repayment */","/* §27: no term and no repayment given: 25 years is assumed (the same as the main mortgage) and the missing-details banner says so */ : mPmt(b, r, hasVal(it.f.years) && +it.f.years > 0 ? +it.f.years : 25); });")
open('/dev/null','w')
e.save()
