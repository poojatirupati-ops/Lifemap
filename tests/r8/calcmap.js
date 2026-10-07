/* ================= Calculators and §14 =================
   CALC_A: a visible input that is an assumption. A string = a "Your assumptions" key (type 2 or 3): blank until the customer has chosen it
   (or their own data gives it); type 3 shows "Use the standard (X)". An object = a type 2 value local to the tool (range shown), or ret:true =
   a retirement age (never defaulted). CALC_X: the assumptions a tool reads that are not one of its sliders; shown in "Assumptions this tool uses". */
const FEE = {ty:2, n:'yearly fees', rng:() => [GD.chgLo, GD.chgHi], by:GDB.chgLo.by, t:'pct'}, RET = {ret:true, n:'retirement age'}, RET_W = {ret:true, n:'age when withdrawals start'},
  SPY = {ty:2, n:'State Pension (other yearly income)', rng:() => [0, RI.sp.week * RI.sp.weeks], by:'DSP 2026: the full State Pension is ' + eur(RI.sp.week * RI.sp.weeks) + ' a year; it depends on your PRSI record', t:'eur'};
const CALC_A = {borrow:{rate:'mortRate'}, repayment:{rate:'mortRate'}, overpay:{rate:'mortRate'}, ratechange:{rate:'mortRate'}, term:{rate:'mortRate'}, mortgageprotect:{rate:'mortRate'}, rentbuy:{rate:'mortRate', g:'houseGrow'},
  goalplanner:{r:'cash'}, compound:{r:'invGross'}, lumpsum:{r:'invGross', f:FEE}, regularinvest:{g:'invGross', f:FEE}, fees:{g:'invGross', a:FEE, b:FEE}, realreturn:{r:'invGross'},
  emergency:{mt:'safetyMonths'}, retirement:{g:'pen', ra:RET, o:SPY}, contrib:{g:'pen'}, avc:{g:'pen'}, lastmoney:{g:'penRet', age:RET_W}, lifecover:{y:'lifeYears', surv:'survivor'}, debtpay:{apr:'cardRate'}, loan:{apr:'loanRate'}};
const CALC_X = {borrow:['buyFees'], deposit:['buyFees'], rentbuy:['rentRise', 'upkeep', 'buyFees', 'depEarn'], retirement:['wage', 'retireMult', 'lumpSum'], lastmoney:['ddTiming', 'planEnd'], drawdown:['ddTiming', 'riskMu1', 'riskMu2', 'riskMu3'],
  riskreturn:['riskMu1', 'riskMu2', 'riskMu3', 'riskVol1', 'riskVol2', 'riskVol3'], lifecover:['lifeShare'], budget:['budgetNeeds', 'budgetWants', 'budgetSave']};
const calcA = (id, k) => { const s = (CALC_A[id] || {})[k]; return s == null ? null : typeof s === 'string' ? {a:s, n:ASM[s].n, ty:ASM[s].ty} : s; };
const aCalc = (a, v) => v == null ? null : ASM[a].t === 'pct' ? +(v * 100).toFixed(4) : +v;   // assumption value in the tool's units
function calcMissing(c){ const v = calcVals(c), out = [];
  c.inputs.forEach(i => { if (v[i.k] == null){ const s = calcA(c.id, i.k); out.push(s ? s.n : i.l.toLowerCase()); } });
  (CALC_X[c.id] || []).forEach(k => { if (!asmMine(k)) out.push(ASM[k].n); }); return out.filter((x, i, a) => a.indexOf(x) === i); }
function calcGuide(cid, k){ const s = calcA(cid, k); if (!s) return ''; if (s.ret) return RETIRE_HELP; if (s.a) return asmGuide(ASM[s.a]);
  const [lo, hi] = s.rng(), f = x => s.t === 'pct' ? pcs(x) : eur(x); return 'Usually between ' + f(lo) + ' and ' + f(hi) + ' (' + s.by + ').'; }
function fieldBlank(i, cid){ const s = calcA(cid, i.k) || {}, d = s.a ? ASM[s.a] : null, std = d && asmStd(s.a) ? d.sug() : null;
  return '<div class="field"><div class="flabel"><label id="cl-' + i.k + '" for="co-' + i.k + '">' + esc(i.l) + ' <span class="tag look">Not chosen yet</span></label>' + nbox('ck', i.k, '', i.u, 'cl-' + i.k, {id:'co-' + i.k, dec:i.step % 1 !== 0 || i.u === '%'}) + '</div>' +
    (std != null ? '<button class="chip sm" data-a="ckstd" data-p="' + i.k + '">Use the standard (' + esc(asmFmt(d, std)) + ')</button>' : '') + '<span class="small" style="display:block;margin-top:4px">' + esc(calcGuide(cid, i.k)) + '</span>' + nbHint('ck', i.k) + '</div>'; }
function calcAsmBlock(c){ const ks = CALC_X[c.id]; if (!ks) return ''; const left = ks.filter(k => !asmMine(k)), g = 'c-' + c.id;
  return '<details class="card asmg" data-g="' + g + '"' + (left.length || S.asmOpen === g ? ' open' : '') + ' style="margin-bottom:12px"><summary style="cursor:pointer;font-weight:800;min-height:32px">Assumptions this tool uses' + (left.length ? ' · ' + left.length + ' to choose' : '') + '</summary><div style="margin-top:10px">' +
    ks.map(k => asmInput(k, true)).join('') + (left.some(asmStd) ? useAllBtn('calc') : '') + '<p class="small" style="margin:6px 0 0">These are your plan-wide choices: changing one here changes it everywhere.</p></div></details>'; }
const moTxt = x => { const r = Math.round(x * 10) / 10; return (r % 1 ? r.toFixed(1) : String(r)) + (r === 1 ? ' month' : ' months'); };
