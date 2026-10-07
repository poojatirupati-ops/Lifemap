import re
p='/home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'; s=open(p).read()
def R(a,b,cnt=1):
    global s
    n=s.count(a)
    assert n==cnt, (n, a[:90])
    s=s.replace(a,b)
def entry(id_, new):
    global s
    m = re.search(r"\n \{id:'" + id_ + r"',.*?(?=\n \{id:'|\n\];)", s, re.S)
    assert m, id_
    s = s[:m.start()] + "\n" + new + s[m.end():]
# helpers
R("const fvA = (m, r, y) => { const i = r / 100 / 12, n = y * 12; return i ? m * (Math.pow(1 + i, n) - 1) / i : m * n; };",
  "const fvA = (m, r, y) => { const i = Math.pow(1 + r / 100, 1 / 12) - 1, n = y * 12; return i ? m * (Math.pow(1 + i, n) - 1) / i : m * n; };   // FP round 6: monthly rate equivalent to the annual growth rate (same basis as fvL and the plan)")
R("function lasts(pot, w, g, inf){ let y = 0; while (pot > 0 && y < 60){ pot = pot * (1 + g / 100) - w; w *= 1 + inf / 100; y++; } return y; }",
  "function lasts(pot, w, g, inf){ let y = 0; while (y < 60){ pot = pot * (1 + g / 100) - w; if (pot < 0) break; w *= 1 + inf / 100; y++; } return y; }   // FP round 6: counts full years paid only")
R("const yrs = m => {", """// FP round 6: the customer's own figure, if the tool still shows the figures we pre-filled (not moved by the customer)
const mine = (id, keys) => !keys.some(k => ((S.calcT || {})[id] || {})[k]);
const statedM = k => S.src && S.src[k] && S.src[k] !== 'est' && +S.fin[k] > 0 ? +S.fin[k] : null;   // a stated (statement or typed) monthly figure
const srcWord = k => S.src[k] === 'doc' ? 'your statement' : 'your figures';
const yrs = m => {""")
entry('borrow', """ {id:'borrow', cat:'home', name:'How much could I borrow?', q:'What home price could be within reach?', em:'🏡',
  inputs:[I('inc','Your gross income',60000,15000,250000,1000,'€'),I('inc2','Partner income',0,0,250000,1000,'€'),I('dep','Deposit saved',25000,0,200000,1000,'€'),I('ftb','First-time buyer (1 = yes, 0 = no)',1,0,1,1,''),I('rate','Interest rate',4,1,8,0.1,'%'),I('term','Term',30,10,35,1,'y')],
  wi:[I('xdep','Save extra towards deposit',0,0,50000,1000,'€')],
  run(v){ const lti = v.ftb ? 4 : 3.5, dep = v.dep + (v.xdep || 0), byInc = (v.inc + v.inc2) * lti, byDep = dep * 9, loan = Math.min(byInc, byDep), price = loan + dep, m = pmt(loan, v.rate, v.term);   // FP round 6: CBI 4x / 3.5x income and 90% LTV (10% deposit)
    return {lbl:'Homes up to about', val:eur(price), line:'Central Bank rules: up to ' + lti + '× income for ' + (v.ftb ? 'first-time' : 'second and subsequent') + ' buyers, and at least a 10% deposit (90% loan-to-value). Here the ' + (byDep < byInc ? 'deposit' : 'income limit') + ' sets the amount. Lenders can make some exceptions [confirm current Central Bank rules].',
      rows:[['Borrowing by income (' + lti + '×)', eur(byInc)],['Borrowing by deposit (90% LTV)', eur(byDep)],['Your deposit', eur(dep)],['Monthly repayment (illustrative)', eur(m)]], goal:{name:'Buy a home', em:'🏡', amount:Math.round(price * 0.1), years:3}}; }},""")
entry('repayment', """ {id:'repayment', cat:'home', name:'Monthly mortgage repayment', q:'What would my monthly repayment be?', em:'🧾',
  inputs:[I('loan','Mortgage amount',300000,50000,1000000,1000,'€'),I('rate','Interest rate',4,1,8,0.05,'%'),I('term','Term',30,5,35,1,'y')],
  wi:[I('dr','If rates changed by',0,-2,3,0.25,'%')],
  run(v){ const calc = pmt(v.loan, v.rate, v.term), own = mine('repayment', ['loan','rate','term']) ? statedM('mortPayM') : null, base = own || calc, r = v.rate + (v.dr || 0);
    const m = v.dr ? base + pmt(v.loan, r, v.term) - calc : base, po = payoff(v.loan, v.rate, base), diff = own && Math.abs(own - calc) >= 5;
    if (v.dr) return {lbl:'If your rate changed to ' + r.toFixed(2) + '%', val:eur(m), line:'What-if: your repayment would be about ' + eur(m) + ' a month, ' + eur(Math.abs(m - base)) + (m >= base ? ' more' : ' less') + ' than ' + (own ? 'the ' + eur(own) + ' on ' + srcWord('mortPayM') : 'now') + '.', rows:[['Repayment now', eur(base)],['Change over a year', eur((m - base) * 12)]], goal:{name:'Buy a home', em:'🏡', amount:v.loan, years:3}};
    return {lbl:own ? 'Your monthly repayment' : 'Monthly repayment', val:eur(base), line:own ? 'From ' + srcWord('mortPayM') + '.' + (diff ? ' The standard formula on these figures gives about ' + eur(calc) + '; we use your lender\\'s figure.' : '') : 'Over ' + v.term + ' years at ' + v.rate.toFixed(2) + '%, using the standard repayment formula.',
      rows:[['Mortgage free in', po.m === Infinity ? 'Not at this repayment' : yrs(po.m)],['Total interest', po.m === Infinity ? '—' : eur(po.int)],['Total repaid', po.m === Infinity ? '—' : eur(v.loan + po.int)]], goal:{name:'Buy a home', em:'🏡', amount:v.loan, years:3}}; }},""")
entry('overpay', """ {id:'overpay', cat:'home', name:'Mortgage overpayment', q:'What if I paid a little extra each month?', em:'⏩',
  inputs:[I('bal','Mortgage balance',250000,20000,1000000,1000,'€'),I('rate','Interest rate',4,1,8,0.05,'%'),I('yrs','Years left',25,3,35,1,'y'),I('x','Extra each month',200,0,2000,25,'€')],
  run(v){ const own = mine('overpay', ['bal','rate','yrs']) ? statedM('mortPayM') : null, p = own || pmt(v.bal, v.rate, v.yrs), a = payoff(v.bal, v.rate, p), b = payoff(v.bal, v.rate, p + v.x);
    return {lbl:'Mortgage free sooner by', val:a.m === Infinity ? '—' : yrs(Math.max(0, a.m - b.m)), line:'Paying ' + eur(v.x) + ' extra a month on top of ' + eur(p) + (own ? ' (from ' + srcWord('mortPayM') + ')' : '') + ' could save about ' + eur(a.int - b.int) + ' in interest (illustrative; check your lender\\'s overpayment terms).', rows:[['Mortgage free now in', a.m === Infinity ? '—' : yrs(a.m)],['With the extra', yrs(b.m)],['Interest saved', eur(a.int - b.int)]], goal:{name:'Mortgage free', em:'🔑', amount:v.bal, years:Math.ceil(b.m / 12)}}; }},""")
entry('ratechange', """ {id:'ratechange', cat:'home', name:'Interest-rate impact', q:'What if my mortgage rate changed?', em:'📊',
  inputs:[I('loan','Mortgage balance',300000,50000,1000000,1000,'€'),I('rate','Current rate',4,1,8,0.05,'%'),I('term','Years left',25,5,35,1,'y'),I('d','Rate change',1,-2,3,0.25,'%')],
  run(v){ const calc = pmt(v.loan, v.rate, v.term), own = mine('ratechange', ['loan','rate','term']) ? statedM('mortPayM') : null, a = own || calc, b = a + pmt(v.loan, v.rate + v.d, v.term) - calc;
    return {lbl:'Monthly change', val:(b >= a ? '+' : '') + eur(b - a), line:'What-if: if your rate changed to ' + (v.rate + v.d).toFixed(2) + '%, your repayment would be about ' + eur(b) + ' a month instead of ' + eur(a) + (own ? ' (from ' + srcWord('mortPayM') + ')' : '') + '.', rows:[['Now', eur(a)],['After change', eur(b)],['Change over a year', eur((b - a) * 12)]]}; }},""")
entry('mortgageprotect', """ {id:'mortgageprotect', cat:'protect', name:'Mortgage protection', q:'What cover would clear my mortgage?', em:'🏠',
  inputs:[I('bal','Mortgage balance',250000,20000,1000000,5000,'€'),I('rate','Interest rate',4,1,8,0.05,'%'),I('y','Years left',25,5,35,1,'y')],
  run(v){ const p = (mine('mortgageprotect', ['bal','rate','y']) ? statedM('mortPayM') : null) || pmt(v.bal, v.rate, v.y), after = n => { let b = v.bal; for (let k = 0; k < n * 12 && b > 0; k++) b -= p - b * v.rate / 1200; return Math.max(0, b); };
    return {lbl:'Cover needed today', val:eur(v.bal), line:'Mortgage protection usually reduces as your mortgage does. Illustrative balance over time, repaying ' + eur(p) + ' a month:', rows:[['In 5 years', eur(after(5))],['In 10 years', eur(after(10))],['In 15 years', eur(after(15))]]}; }},""")
entry('retirement', """ {id:'retirement', cat:'retire', name:'Retirement projection', q:'Could your current path fund the retirement you want?', em:'🌅',
  inputs:[I('age','Your age',40,20,70,1,'age'),I('ra','Target retirement age',65,50,75,1,'age'),I('pot','Pension value today',60000,0,1500000,1000,'€'),I('m','Monthly contributions',500,0,5000,10,'€'),I('d','Desired yearly income',40000,10000,150000,1000,'€'),I('o','Other yearly income (e.g. State Pension)',15000,0,50000,500,'€'),I('g','Growth after charges',4.5,1,7,0.25,'%')],
  wi:[I('later','Retire later by',0,0,5,1,'y'),I('more','Save more each month',0,0,1500,50,'€'),I('less','Spend less in retirement (per year)',0,0,20000,500,'€')],
  run(v){ const ra = v.ra + (v.later || 0), y = Math.max(1, ra - v.age), ours = pensionAt(y, v.pot, v.m + (v.more || 0), v.g / 100, AS.wage), d = S.pdocs && S.pdocs.retire ? S.pdocs.retire.v : null;
    const useSt = d && d.proj != null && ra === d.nra && !v.more && mine('retirement', ['pot','m','g','age']), f = useSt ? d.proj : ours, target = Math.max(0, (v.d - (v.less || 0) - v.o)) * 25, gap = target - f;   // FP round 6: the statement's own projection is used as stated
    return {lbl:useSt ? 'Projected fund (from your statement)' : 'Projected fund', val:eur(f), line:(gap > 0 ? 'Illustrative gap of ' + eur(gap) + '. See how different assumptions affect the illustration.' : 'On these assumptions your projected fund meets the illustrative target.') + ' Contributions are assumed to rise with pay (' + pc(AS.wage) + ' a year), as in your plan.',
      rows:[['Illustrative target (25 × the income you need)', eur(target)],['Illustrative gap', gap > 0 ? eur(gap) : 'None'],['Retiring at', String(ra)]].concat(d && d.proj != null ? [['Your statement projects (age ' + d.nra + ')', eur(d.proj)], ['On our assumptions (age ' + ra + ')', eur(ours)]] : []), goal:{name:'Comfortable retirement', em:'🌅', amount:Math.round(target), years:y}}; }},""")
entry('regularinvest', """ {id:'regularinvest', cat:'invest', name:'Regular investing', q:'What could investing monthly build?', em:'🔁',
  inputs:[I('m','Monthly amount',300,25,5000,25,'€'),I('y','Years',15,1,40,1,'y'),I('g','Growth assumption',5,0,8,0.5,'%'),I('f','Yearly fees',1,0,3,0.05,'%')],
  run(v){ const gross = fvA(v.m, v.g, v.y), net = fvA(v.m, ((1 + v.g / 100) * (1 - v.f / 100) - 1) * 100, v.y); return {lbl:'Could grow to (after fees)', val:eur(net), line:'Fees of ' + v.f + '% a year could cost about ' + eur(gross - net) + ' over ' + v.y + ' years.', rows:[['Paid in', eur(v.m * 12 * v.y)],['Before fees', eur(gross)],['Fees cost', eur(gross - net)]], goal:{name:'Build wealth', em:'📈', amount:Math.round(net), years:v.y}}; }},""")
entry('realreturn', """ {id:'realreturn', cat:'invest', name:'Inflation-adjusted return', q:"What is my money really worth in future?", em:'🔍',
  inputs:[I('p','Amount',20000,500,500000,100,'€'),I('r','Return',4,0,8,0.5,'%'),I('i','Inflation',2.5,0,6,0.5,'%'),I('y','Years',15,1,40,1,'y')],
  run(v){ const n = fvL(v.p, v.r, v.y), real = n / Math.pow(1 + v.i / 100, v.y); return {lbl:"In today's money", val:eur(real), line:'It may show ' + eur(n) + ', but after inflation it buys what ' + eur(real) + ' buys today.', rows:[['Face value', eur(n)],["Today's buying power", eur(real)]]}; }},""")
entry('fees', """ {id:'fees', cat:'invest', name:'Fees impact', q:'How much do fees really cost over time?', em:'🧮',
  inputs:[I('p','Amount invested',50000,1000,1000000,100,'€'),I('y','Years',20,1,40,1,'y'),I('g','Growth before fees',5,0,8,0.5,'%'),I('a','Fee A',0.5,0,3,0.1,'%'),I('b','Fee B',1.5,0,3,0.1,'%')],
  run(v){ const nf = x => v.p * Math.pow((1 + v.g / 100) * (1 - x / 100), v.y), A1 = nf(v.a), B1 = nf(v.b); return {lbl:'Difference', val:eur(Math.abs(A1 - B1)), line:'A ' + Math.abs(v.b - v.a).toFixed(1) + '% difference in yearly fees could change the outcome by about ' + eur(Math.abs(A1 - B1)) + '.', rows:[['With ' + v.a + '% fees', eur(A1)],['With ' + v.b + '% fees', eur(B1)]]}; }},""")
# ---- pension statement pre-fill
R("""    pre(v){ const age = S.about.age, yrs = Math.max(1, v.nra - age), gr = d => v.chg != null ? {g:d - v.chg} : {};   // charges only if the statement shows them
      return {retirement:Object.assign({pot:v.pot, m:v.youM + v.empM, ra:v.nra, o:Math.round(AS.sp * ({'Expect full':1, Partly:0.6}[spFromYears(v.prsi)] || 0.8) / 500) * 500}, gr(4.5)),
        contrib:Object.assign({y:yrs}, gr(4.5)), avc:Object.assign({y:yrs}, gr(4.5)),""",
  """    pre(v){ const age = S.about.age, ra = S.app && retireGoal() ? S.retireAge : v.nra, yrs = Math.max(1, ra - age), gr = () => v.chg != null ? {g:+((AS.pen + PEN_TYP_CHG - v.chg / 100) * 100).toFixed(2)} : {};   // FP round 6: growth after the statement's own charges, same rule as the plan
      return {retirement:Object.assign({pot:v.pot, m:v.youM + v.empM, ra, o:Math.round(AS.sp * ({'Expect full':1, Partly:0.6}[spFromYears(v.prsi)] || 0.8) / 500) * 500}, gr()),
        contrib:Object.assign({y:yrs}, gr()), avc:Object.assign({y:yrs}, gr()),""")
# ---- calcVals: precedence-aware, refreshed every time
m = re.search(r"// calcVals: pre-fill.*?\n    S\.calcV\[c\.id\] = v; \} return S\.calcV\[c\.id\]; \}", s, re.S); assert m
s = s[:m.start()] + """// calcVals (FP round 6): pre-filled every time from what we know, in precedence order:
// the customer's own move of a slider in this tool > the statement's figures for this tool > Your finances (statement > typed > estimate) > the plan > tool default.
function calcPre(c){ const p = {}, f = S.fin, has = k => S.src[k] && f[k] != null && f[k] !== '' && !isNaN(+f[k]), F = finNums(), mort = F.mortBal > 0, home = S.goals.find(g => g.k === 'home');
  const ess = F.costsM + F.mortPayM + (F.debt > 0 ? F.debtPayM : 0), take = () => { const P = project(); return P.rows[0].inflow / 12; }, rg = retireGoal();
  p.age = S.about.age;
  switch (c.id){
    case 'borrow': if (has('income')) p.inc = F.income; if (has('pIncome')) p.inc2 = F.pIncome; if (home && home.saved) p.dep = home.saved; if (f.home) p.ftb = /^Own/.test(f.home) ? 0 : 1; break;
    case 'deposit': if (home && home.saved) p.saved = home.saved; break;
    case 'repayment': case 'ratechange': if (mort){ p.loan = F.mortBal; p.rate = F.mortRate * 100; p.term = F.mortYears || 25; } break;
    case 'term': if (mort){ p.loan = F.mortBal; p.rate = F.mortRate * 100; p.a = F.mortYears || 25; } break;
    case 'overpay': if (mort){ p.bal = F.mortBal; p.rate = F.mortRate * 100; p.yrs = F.mortYears || 25; } break;
    case 'mortgageprotect': if (mort){ p.bal = F.mortBal; p.rate = F.mortRate * 100; p.y = F.mortYears || 25; } break;
    case 'emergency': if (has('costsM')) p.e = ess; if (has('cash')) p.s = F.cash; break;
    case 'incomegap': if (has('costsM')) p.e = ess; if (has('cash')) p.s = F.cash; break;
    case 'retirement': if (has('pension')) p.pot = F.pension; if (has('pensionM')) p.m = F.pensionM; p.ra = S.retireAge; p.o = Math.round(AS.sp * F.sp); p.g = +(penGrowth() * 100).toFixed(2); if (rg) p.d = rg.amount; break;
    case 'contrib': if (has('income')) { p.sal = F.income; p.tr = F.income > TX.band ? 40 : 20; } p.y = Math.max(1, S.retireAge - S.about.age); p.g = +(penGrowth() * 100).toFixed(2); break;
    case 'avc': if (has('income')) p.tr = F.income > TX.band ? 40 : 20; p.y = Math.max(1, S.retireAge - S.about.age); p.g = +(penGrowth() * 100).toFixed(2); break;
    case 'lastmoney': case 'drawdown': if (has('pension') || has('pensionM')) p.pot = Math.round(pensionAt(Math.max(0, S.retireAge - S.about.age), F.pension, F.pensionM, penGrowth(), AS.wage)); if (c.id === 'lastmoney') p.g = +(AS.penRet * 100).toFixed(2); p.i = AS.infl * 100; break;
    case 'inflation': p.i = AS.infl * 100; break;
    case 'realreturn': if (has('invest')) p.p = F.invest; p.i = AS.infl * 100; break;
    case 'lumpsum': case 'fees': case 'riskreturn': if (has('invest')) p.p = F.invest; break;
    case 'lifecover': if (has('income')) p.inc = F.income; if (mort) p.mort = F.mortBal; if (has('debt')) p.debt = F.debt; if (has('cash') || has('invest')) p.sav = F.cash + F.invest; break;
    case 'networth': if (has('cash')) p.sav = F.cash; if (has('invest')) p.inv = F.invest; if (has('pension')) p.pen = F.pension; if (/^Own/.test(f.home || '')) p.prop = (+f.homeValue || 0) + (+f.propValue || 0); if (mort) p.mort = F.mortBal; if (has('debt')) p.loans = F.debt; break;
    case 'surplus': if (has('income')){ p.inc = take(); p.ess = F.costsM + F.oneOffY / 12 + F.mortPayM; p.life = 0; p.debt = F.debt > 0 ? F.debtPayM : 0; } break;   // matches the plan's spare money this year
    case 'budget': if (has('income')) p.inc = take(); break;
    case 'debtpay': if (F.debt > 0){ p.b = F.debt; p.p = F.debtPayM; p.apr = AS.debtRate * 100; } break;
  }
  Object.assign(p, (S.calcDoc || {})[c.id] || {}); return p; }
function calcVals(c){ S.calcV[c.id] = S.calcV[c.id] || {}; S.calcT = S.calcT || {}; const v = S.calcV[c.id], T = S.calcT[c.id] || {}, pre = calcPre(c);
  c.inputs.concat(c.wi || []).forEach(i => { if (T[i.k] && v[i.k] != null) return; const x = pre[i.k] != null ? pre[i.k] : i.v; v[i.k] = clamp(+(+x).toFixed(4), i.min, i.max); });   // stated figures are not rounded to the slider step
  return v; }""" + s[m.end():]
# slider moves are the customer's own what-ifs: remember them
R("const c = C(t.p), v = calcVals(c), k = inp.dataset.ck, i = c.inputs.concat(c.wi || []).find(x => x.k === k); v[k] = +inp.value;",
  "const c = C(t.p), v = calcVals(c), k = inp.dataset.ck, i = c.inputs.concat(c.wi || []).find(x => x.k === k); v[k] = +inp.value; S.calcT = S.calcT || {}; (S.calcT[c.id] = S.calcT[c.id] || {})[k] = true;")
open(p,'w').write(s); print('ok')
