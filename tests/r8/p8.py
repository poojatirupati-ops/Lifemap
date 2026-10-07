import sys,re
F='/home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'
h=open(F).read()
def rep(old,new,cnt=1):
    global h
    n=h.count(old)
    if n!=cnt: sys.exit('anchor %d x: %s'%(n,old[:100]))
    h=h.replace(old,new)
# register: loan range as in the workbook (CBI); buying fees range; no "standard" for type-2 items
rep("""    loanLo:RV_(0.07, 'https://www.anpost.com/Money/Loans (CCPC comparison, 27 Apr 2026)', 'Apr 2026', true, 'CCPC comparison, Apr 2026; credit unions average about 10.4%'),
    loanHi:RV_(0.13, 'https://www.creditunion.ie/what-we-offer/loans/cu-loan-rates/', 'Apr 2026', true, 'CCPC comparison, Apr 2026; credit unions average about 10.4%'),""",
"""    loanLo:RV_(0.06, 'https://centralbank.ie/statistics/data-and-analysis/credit-and-banking-statistics/retail-interest-rates', 'Jun 2026', true, 'Central Bank of Ireland: new personal loans averaged 7.48% in Jun 2026'),
    loanHi:RV_(0.10, 'https://centralbank.ie/statistics/data-and-analysis/credit-and-banking-statistics/retail-interest-rates', 'Jun 2026', true, 'Central Bank of Ireland: new personal loans averaged 7.48% in Jun 2026'),
    buyLo:RV_(2500, 'deliverables/LifeGoals-Calculators.xlsx C01 (verify: solicitor and survey quotes)', '2026', true, 'legal and survey fees; stamp duty is added for you'),
    buyHi:RV_(3500, 'deliverables/LifeGoals-Calculators.xlsx C01 (verify: solicitor and survey quotes)', '2026', true, 'legal and survey fees; stamp duty is added for you'),""")
for k in ['penChg','buyFees','depEarn']:
    h,n=re.subn(r"\n    %s:RV_\([^\n]*\),"%k, "", h)
    if n!=1: sys.exit('std '+k)
# ASM: type 2 for pension charges, buying fees and what the deposit could earn (as in the workbook)
rep("""  penChg:{g:'prices', b:'B6', ty:3, n:'typical pension charges', l:'Typical pension charges already allowed for in the pension growth above', t:'pct', min:0, max:2.5, step:0.05, sug:() => ST.penChg, by:STB.penChg.by + ' (usually between ' + pcs(GD.chgLo) + ' and ' + pcs(GD.chgHi) + ')',""",
    """  penChg:{g:'prices', b:'B6', ty:2, n:'typical pension charges', l:'Typical pension charges already allowed for in the pension growth above', t:'pct', min:0, max:2.5, step:0.05, rng:() => [GD.chgLo, GD.chgHi], by:'pension charges; your statement shows yours', fb:() => 0.01,""")
rep("""  buyFees:{g:'prices', b:'B25', ty:3, n:'buying fees', l:'Buying fees (legal and survey), plus stamp duty', t:'eur', min:0, max:10000, step:250, sug:() => ST.buyFees, by:STB.buyFees.by,""",
    """  buyFees:{g:'prices', b:'B25', ty:2, n:'buying fees', l:'Buying fees (legal and survey), plus stamp duty', t:'eur', min:0, max:10000, step:250, rng:() => [GD.buyLo, GD.buyHi], by:GDB.buyLo.by, fb:() => 3000,""")
rep("""  depEarn:{g:'prices', b:'B25', ty:3, n:'what the deposit could earn', l:'Rent vs buy: what the deposit could earn instead (a year, after tax)', t:'pct', min:0, max:6, step:0.25, sug:() => ST.depEarn, by:STB.depEarn.by,""",
    """  depEarn:{g:'prices', b:'B25', ty:2, n:'what the deposit could earn', l:'Rent vs buy: what the deposit could earn instead (a year, after tax)', t:'pct', min:0, max:6, step:0.25, rng:() => [+(GD.depLo * (1 - RI.sav.dirt)).toFixed(3), +(GD.depHi * (1 - RI.sav.dirt)).toFixed(3)], by:'after 33% DIRT; deposits pay about ' + pcs(GD.depLo) + '–' + pcs(GD.depHi) + ' before tax', fb:() => 0.01,""")
# calculators: Illness Benefit back as a type-2 input (as the State Pension: the full rate is law, yours depends on PRSI and earnings);
# the lump sum's waiting years and the risk style are type-3 choices with a standard
rep("""  SPY = {ty:2,""", """  IBW = {ty:2, n:'Illness Benefit', rng:() => [0, RI.sp.illness], by:'DSP 2026 maximum; lower if you earned under €300 a week; needs enough PRSI', t:'eurw'},
  WAIT = {ty:3, n:'years you might wait', sug:() => WAIT_YEARS, by:'an illustration of the cost of waiting', t:'yrs'}, STYLE = {ty:3, n:'investment style', sug:() => 2, by:'Balanced; an adviser checks your attitude to risk', t:'style'},
  SPY = {ty:2,""")
rep("""lumpsum:{r:'invGross', f:FEE},""", """lumpsum:{r:'invGross', f:FEE, wait:WAIT},""")
rep("""lifecover:{y:'lifeYears', surv:'survivor'},""", """lifecover:{y:'lifeYears', surv:'survivor'}, incomegap:{ib:IBW}, riskreturn:{s:STYLE},""")
rep("""function calcGuide(cid, k){ const s = calcA(cid, k); if (!s) return ''; if (s.ret) return RETIRE_HELP; if (s.a) return asmGuide(ASM[s.a]);
  const [lo, hi] = s.rng(), f = x => s.t === 'pct' ? pcs(x) : eur(x); return 'Usually between ' + f(lo) + ' and ' + f(hi) + ' (' + s.by + ').'; }""",
"""const locFmt = (s, x) => s.t === 'pct' ? pcs(x) : s.t === 'eurw' ? eurW(x) + ' a week' : s.t === 'yrs' ? yrN(x) : s.t === 'style' ? CHIP_OPTS.style.find(o => o[0] === x)[1] : eur(x);
function calcGuide(cid, k){ const s = calcA(cid, k); if (!s) return ''; if (s.ret) return RETIRE_HELP; if (s.a) return asmGuide(ASM[s.a]);
  if (s.ty === 3) return 'Generally the standard is ' + locFmt(s, s.sug()) + ' (' + s.by + '). Choose what you want to use.';
  const [lo, hi] = s.rng(); return 'Usually between ' + locFmt(s, lo) + ' and ' + locFmt(s, hi) + ' (' + s.by + ').'; }
const calcStd = (cid, k) => { const s = calcA(cid, k) || {}; return s.a ? (asmStd(s.a) ? {v:aCalc(s.a, ASM[s.a].sug()), t:asmFmt(ASM[s.a], ASM[s.a].sug())} : null) : s.ty === 3 && s.sug ? {v:s.sug(), t:locFmt(s, s.sug())} : null; };""")
rep("""function fieldBlank(i, cid){ const s = calcA(cid, i.k) || {}, d = s.a ? ASM[s.a] : null, std = d && asmStd(s.a) ? d.sug() : null;""", """function fieldBlank(i, cid){ const std = calcStd(cid, i.k);""")
rep("""    (std != null ? '<button class="chip sm" data-a="ckstd" data-p="' + i.k + '">Use the standard (' + esc(asmFmt(d, std)) + ')</button>' : '') + '<span class="small" style="display:block;margin-top:4px">' + esc(calcGuide(cid, i.k)) + '</span>' + nbHint('ck', i.k) + '</div>'; }""",
    """    (std ? '<button class="chip sm" data-a="ckstd" data-p="' + i.k + '">Use the standard (' + esc(std.t) + ')</button>' : '') + '<span class="small" style="display:block;margin-top:4px">' + esc(calcGuide(cid, i.k)) + '</span>' + nbHint('ck', i.k) + '</div>'; }""")
rep("""const c = C(t.p), s = calcA(c.id, p), v = calcVals(c); v[p] = aCalc(s.a, ASM[s.a].sug());""", """const c = C(t.p), std = calcStd(c.id, p), v = calcVals(c); if (!std) return; v[p] = std.v;""")
# chip inputs (style): blank until chosen, with the standard chip
rep("""const fieldC = (i, v, src) => '<div class="field"><span class="flabel" id="cl-' + i.k + '">' + esc(i.l) + (src && src.includes(i.k) ? ' <span class="tag doc">From your statement</span>' : '') + '</span><div class="chips" role="group" aria-labelledby="cl-' + i.k + '">' + CHIP_OPTS[i.u].map(([x, l]) => '<button class="chip sm' + (+v === x ? ' sel' : '') + '" aria-pressed="' + (+v === x) + '" data-a="ckset" data-p="' + i.k + '|' + x + '">' + l + '</button>').join('') + '</div></div>';""",
    """const fieldC = (i, v, src, cid) => { const on = x => v != null && +v === x, std = v == null && cid ? calcStd(cid, i.k) : null; return '<div class="field"><span class="flabel" id="cl-' + i.k + '">' + esc(i.l) + (src && src.includes(i.k) ? ' <span class="tag doc">From your statement</span>' : '') + (v == null ? ' <span class="tag look">Not chosen yet</span>' : '') + '</span><div class="chips" role="group" aria-labelledby="cl-' + i.k + '">' + CHIP_OPTS[i.u].map(([x, l]) => '<button class="chip sm' + (on(x) ? ' sel' : '') + '" aria-pressed="' + on(x) + '" data-a="ckset" data-p="' + i.k + '|' + x + '">' + l + '</button>').join('') + '</div>' + (std ? '<button class="chip sm" style="margin-top:6px" data-a="ckstd" data-p="' + i.k + '">Use the standard (' + esc(std.t) + ')</button>' : '') + (v == null && cid ? '<span class="small" style="display:block;margin-top:4px">' + esc(calcGuide(cid, i.k)) + '</span>' : '') + '</div>'; };""")
rep("""const fieldR = (i, v, src, cid) => CHIP_OPTS[i.u] ? fieldC(i, v, src) :""", """const fieldR = (i, v, src, cid) => CHIP_OPTS[i.u] ? fieldC(i, v, src, cid) :""")
# C22: Illness Benefit is the customer's figure again (type 2)
rep(""",I('inc','Your gross yearly income',60000,0,300000,1000,'€')],
  run(v){ const ibW = RI.sp.illness, ib = ibW * RI.sp.weeks / 12,""", """,I('inc','Your gross yearly income',60000,0,300000,1000,'€'),I('ib','Illness Benefit a week',254,0,500,0.5,'€')],
  run(v){ const ibW = v.ib == null ? RI.sp.illness : v.ib, ib = ibW * RI.sp.weeks / 12,""")
rep("""['Illness Benefit a week (' + T_GOV + ')', eurW(ibW)]]""", """['Illness Benefit a week (your figure; the most is ' + eurW(RI.sp.illness) + ')', eurW(ibW)]]""")
open(F,'w').write(h); print('ok')
