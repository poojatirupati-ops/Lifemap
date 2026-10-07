import sys
F='/home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'
h=open(F).read()
def rep(old,new,cnt=1):
    global h
    n=h.count(old)
    if n!=cnt: sys.exit('anchor %d x: %s'%(n,old[:100]))
    h=h.replace(old,new)
D='/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/r8/'
rep("// calcVals (FP round 6): pre-filled every time", open(D+'calcmap.js').read()+"// calcVals (FP round 6): pre-filled every time")
# asmInput: 'req' marks a tool's assumption as needed there
rep("function asmInput(k){ const d = ASM[k], v = asmGet(k),", "function asmInput(k, req){ const d = ASM[k], v = asmGet(k),")
rep("<span class=\"flabel\" id=\"' + id + '\">' + esc(d.l) + ' ' + asmTag(v != null, d.need()) + '</span>'", "<span class=\"flabel\" id=\"' + id + '\">' + esc(d.l) + ' ' + asmTag(v != null, req || d.need()) + '</span>'")
# calcPre: no assumption pre-fills; only the customer's own data and choices
rep("""  // Defaults from the customer's assumptions (audit B13–B15, B16, B24–B26): mortgage, card and loan rates, safety-net months, life cover
  const mr = +(AS.mortRate * 100).toFixed(2); ['borrow','repayment','overpay','ratechange','term','mortgageprotect','rentbuy'].includes(c.id) && (p.rate = mr);
  if (c.id === 'debtpay') p.apr = +(AS.cardRate * 100).toFixed(2); if (c.id === 'loan') p.apr = +(AS.loanRate * 100).toFixed(2);
  if (c.id === 'emergency') p.mt = +asmV('safetyMonths'); if (c.id === 'lifecover'){ p.y = +asmV('lifeYears'); p.surv = +asmV('survivor'); } if (c.id === 'rentbuy') p.g = +(asmV('houseGrow') * 100).toFixed(2);
""", """  // §14: assumptions come from the customer's own choices (CALC_A in calcVals), never a default. Here only their own data: a stated mortgage rate, their retirement age, their State Pension.
  const mRate = finN('mortRate') > 0 ? finN('mortRate') : undefined, penG = asmMine('pen') ? +(penGrowth() * 100).toFixed(2) : undefined;
""")
rep("case 'repayment': case 'ratechange': if (mort){ p.loan = F.mortBal; p.rate = F.mortRate * 100; p.term = F.mortYears || 25; } break;", "case 'repayment': case 'ratechange': if (mort){ p.loan = F.mortBal; p.rate = mRate; p.term = F.mortYears || 25; } break;")
rep("case 'term': if (mort){ p.loan = F.mortBal; p.rate = F.mortRate * 100; p.a = F.mortYears || 25; } break;", "case 'term': if (mort){ p.loan = F.mortBal; p.rate = mRate; p.a = F.mortYears || 25; } break;")
rep("case 'overpay': if (mort){ p.bal = F.mortBal; p.rate = F.mortRate * 100; p.yrs = F.mortYears || 25; } break;", "case 'overpay': if (mort){ p.bal = F.mortBal; p.rate = mRate; p.yrs = F.mortYears || 25; } break;")
rep("case 'mortgageprotect': if (mort){ p.bal = F.mortBal; p.rate = F.mortRate * 100; p.y = F.mortYears || 25; } break;", "case 'mortgageprotect': if (mort){ p.bal = F.mortBal; p.rate = mRate; p.y = F.mortYears || 25; } break;")
rep("p.ra = S.retireAge; p.o = Math.round(AS.sp * F.sp); p.g = +(penGrowth() * 100).toFixed(2); if (rg) p.d = rg.amount; break;", "if (S.retireSet) p.ra = S.retireAge; if (F.spKnown) p.o = Math.round(AS.sp * F.sp); p.g = penG; if (rg) p.d = rg.amount; break;")
rep("p.y = Math.max(1, S.retireAge - S.about.age); p.g = +(penGrowth() * 100).toFixed(2); break;", "if (S.retireSet) p.y = Math.max(1, S.retireAge - S.about.age); p.g = penG; break;", 2)
rep("case 'lastmoney': case 'drawdown': if (has('pension') || has('pensionM')) p.pot = Math.round(pensionAt(", "case 'lastmoney': case 'drawdown': if ((has('pension') || has('pensionM')) && S.retireSet && asmMine('pen') && asmMine('wage')) p.pot = Math.round(pensionAt(")
rep("if (c.id === 'lastmoney'){ p.g = +(AS.penRet * 100).toFixed(2); p.age = Math.max(S.retireAge, RI.pen.earliestAge); } break;", "if (c.id === 'lastmoney' && S.retireSet) p.age = Math.max(S.retireAge, RI.pen.earliestAge); break;")
rep("if (cm >= lm){ p.b = F.cardBal; p.p = F.cardPayM; p.apr = F.cardRate * 100; } else { p.b = F.loanBal; p.p = F.loanPayM; p.apr = F.loanRate * 100; } } break;",
    "if (cm >= lm){ p.b = F.cardBal; p.p = F.cardPayM; p.apr = F.cardRateKnown ? F.cardRate * 100 : undefined; } else { p.b = F.loanBal; p.p = F.loanPayM; p.apr = F.loanRateKnown ? F.loanRate * 100 : undefined; } } break;")
# calcVals: assumption inputs blank until chosen
rep("""  c.inputs.concat(c.wi || []).forEach(i => { if (T[i.k] && v[i.k] != null) return; const x = pre[i.k] != null ? pre[i.k] : i.v; v[i.k] = clamp(+(+x).toFixed(4), i.min, i.max); });""",
    """  c.inputs.concat(c.wi || []).forEach(i => { if (T[i.k] && v[i.k] != null) return; const s = calcA(c.id, i.k), x = pre[i.k] != null ? pre[i.k] : s ? (s.a ? aCalc(s.a, asmGet(s.a)) : null) : i.v; v[i.k] = x == null ? null : clamp(+(+x).toFixed(4), i.min, i.max); });""")
# fields
rep("""const fieldR = (i, v, src) => CHIP_OPTS[i.u] ? fieldC(i, v, src) : '<div class="field">""", """const fieldR = (i, v, src, cid) => CHIP_OPTS[i.u] ? fieldC(i, v, src) : v == null ? fieldBlank(i, cid) : '<div class="field">""")
rep("""<input type="range" id="c-' + i.k + '" data-ck="' + i.k + '" min="' + i.min + '" max="' + Math.max(i.max, v) + '" step="' + i.step + '" value="' + v + '" aria-labelledby="cl-' + i.k + '">' + nbHint('ck', i.k) + '</div>';""",
    """<input type="range" id="c-' + i.k + '" data-ck="' + i.k + '" min="' + i.min + '" max="' + Math.max(i.max, v) + '" step="' + i.step + '" value="' + v + '" aria-labelledby="cl-' + i.k + '" aria-valuetext="' + esc(fmtIn(i, v)) + '">' + nbHint('ck', i.k) + (cid && calcA(cid, i.k) && calcA(cid, i.k).ty === 2 ? '<span class="small" style="display:block;margin-top:2px">' + esc(calcGuide(cid, i.k)) + '</span>' : '') + '</div>';""")
rep("""c.inputs.map(i => fieldR(i, v[i.k], (S.calcSrc || {})[p])).join('') + '</div><div id="cout" aria-live="polite">'""", """c.inputs.map(i => fieldR(i, v[i.k], (S.calcSrc || {})[p], c.id)).join('') + '</div>' + calcAsmBlock(c) + '<div id="cout" aria-live="polite">'""")
rep("""c.wi.map(i => fieldR(i, v[i.k], (S.calcSrc || {})[p])).join('')""", """c.wi.map(i => fieldR(i, v[i.k], (S.calcSrc || {})[p], c.id)).join('')""")
# result: "Choose your [item] to see this" until every choice the tool needs is made
rep("""function calcOut(c){ const v = calcVals(c), r = c.run(v); return""", """function calcOut(c){ const miss = calcMissing(c); if (miss.length) return '<div class="card" id="cgate" style="background:var(--ink);color:#fff"><div class="eyebrow" style="color:var(--sun)">Your result</div><b style="font-size:18px;display:block;margin:4px 0">' + esc('Choose your ' + miss[0] + ' to see this') + '</b>' + (miss.length > 1 ? '<p style="margin:0;font-size:13.5px;color:#DCE7F2">Also still to choose: ' + esc(miss.slice(1).join(', ')) + '.</p>' : '') + '</div>';
  const v = calcVals(c), r = c.run(v); return""")
rep("""  calcadd:p => { S.sheet = 'calcadd|' + p; render(); },""", """  calcadd:p => { const m = calcMissing(C(p)); if (m.length){ toast('Choose your ' + m[0] + ' first'); return; } S.sheet = 'calcadd|' + p; render(); },
  ckstd:p => { const t = xTop(); if (!t || t.v !== 'CALC') return; const c = C(t.p), s = calcA(c.id, p), v = calcVals(c); v[p] = aCalc(s.a, ASM[s.a].sug()); S.calcT = S.calcT || {}; (S.calcT[c.id] = S.calcT[c.id] || {})[p] = true; focusKey = '#co-' + p; render(); },""")
# number box: a blank tool input gets its slider after the first value
rep("""if (kind === 'save' || kind === 'age' || kind === 'infl' || kind === 'asm' || kind === 'ret') render(); } }""", """if (kind === 'save' || kind === 'age' || kind === 'infl' || kind === 'asm' || kind === 'ret' || (kind === 'ck' && !document.getElementById('c-' + key))) render(); } }""")
# C22: Illness Benefit is set by law (type 1), not an input; months read "1 month", "6.2 months"
rep(""",I('inc','Your gross yearly income',60000,0,300000,1000,'€'),I('ib','Illness Benefit a week',254,0,500,0.5,'€')],""", """,I('inc','Your gross yearly income',60000,0,300000,1000,'€')],""")
rep("""  run(v){ const ibW = v.ib == null ? RI.sp.illness : v.ib, ib = ibW * RI.sp.weeks / 12,""", """  run(v){ const ibW = RI.sp.illness, ib = ibW * RI.sp.weeks / 12,""")
rep("""val:typeof cope === 'string' ? cope : cope.toFixed(1) + ' months', line:""", """val:typeof cope === 'string' ? cope : moTxt(cope), line:""")
rep("""['Savings would cover', typeof sm === 'string' ? sm : sm.toFixed(1) + ' months'],['Sick pay', v.sp + (v.sp === 1 ? ' month' : ' months')]]""", """['Savings would cover', typeof sm === 'string' ? sm : moTxt(sm)],['Sick pay', moTxt(v.sp)],['Illness Benefit a week (' + T_GOV + ')', eurW(ibW)]]""")
# C15: at the 60-year cap, say it lasts beyond the plan-until age
rep("""line:'Withdrawing ' + eur(v.w) + ' at the ' + (end ? 'end' : 'start') + ' of each year' + (ok ? ', rising with prices (' + inflTxt() + '): money lasts to about age ' + toAge + (toAge < AS.end ? ', before the end of your plan (' + AS.end + ').' : '.') : '. Pick an inflation rate to see how long it lasts.')""",
    """line:'Withdrawing ' + eur(v.w) + ' at the ' + (end ? 'end' : 'start') + ' of each year' + (ok ? ', rising with prices (' + inflTxt() + '): ' + (y >= CAP_YEARS || toAge > AS.end ? 'money lasts beyond age ' + AS.end + ', your plan-until age.' : 'money lasts to about age ' + toAge + (toAge < AS.end ? ', before the end of your plan (' + AS.end + ').' : '.')) : '. Pick an inflation rate to see how long it lasts.')""")
rep("""rows:[['Money lasts to about age', ok ? String(toAge) : NO_INFL],""", """rows:[['Money lasts to about age', !ok ? NO_INFL : y >= CAP_YEARS || toAge > AS.end ? 'Beyond ' + AS.end + ' (your plan-until age)' : String(toAge)],""")
# C13 / C14: clearer relief-limit wording
rep("""' after tax relief at ' + v.tr + '% (USC and PRSI still apply). Relief only applies within your age limit (' + Math.round(relLim(v.age) * 100) + '% of earnings up to €115,000, less what you already pay in: ' + eur(lim) + ' a year).' + inflLine()""",
    """' after tax relief at ' + v.tr + '% (USC and PRSI still apply). Tax relief has an age limit: at ' + v.age + ' it applies to up to ' + Math.round(relLim(v.age) * 100) + '% of your earnings (earnings counted up to ' + eur(RI.pen.earnCap) + '), which is ' + eur(lim) + ' a year. You already pay in ' + eur(v.ex) + ' a year, so up to ' + eur(Math.max(0, lim - v.ex)) + ' a year more gets relief.' + inflLine()""")
rep("""' after tax relief. The age-related limit (' + Math.round(relLim(v.age) * 100) + '% of earnings up to €115,000) covers your main scheme and AVCs together, so enter what you already pay in.' + inflLine()""",
    """' after tax relief. Tax relief has an age limit: at ' + v.age + ' it applies to up to ' + Math.round(relLim(v.age) * 100) + '% of your earnings (earnings counted up to ' + eur(RI.pen.earnCap) + '), which is ' + eur(lim) + ' a year for your main scheme and AVCs together. You already pay in ' + eur(v.ex) + ' a year, so up to ' + eur(Math.max(0, lim - v.ex)) + ' a year more gets relief.' + inflLine()""")
open(F,'w').write(h); print('ok')
