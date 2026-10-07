import sys,re
F='/home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'
h=open(F).read()
def rep(old,new,cnt=1):
    global h
    n=h.count(old)
    if n!=cnt: sys.exit('anchor %d x: %s'%(n,old[:100]))
    h=h.replace(old,new)
def cut(start, end_marker):
    global h
    a=h.index(start); e=h.index(end_marker,a)+len(end_marker); old=h[a:e]; return a,e,old
# spYears range
rep("rng:() => [0, 45], by:'a full State Pension needs ' + RI.sp.fullYears + '; at least ' + RI.sp.minYears + ' to qualify'", "rng:() => [RI.sp.minYears, RI.sp.fullYears], by:'DSP: ' + RI.sp.fullYears + ' for the full rate, at least ' + RI.sp.minYears + ' to qualify'")
# old asmFmt / asmInput / asmScreen → new UI block
a=h.index("// FP round 7: \"Your assumptions\" (audit §3, B1–B27).")
e=h.index("V.ME = () => {", a)
h=h[:a]+open('ui.js').read()+h[e:]
# inflation chooser: §14 type 3 wording, standard chip, Other opens the box (no hidden 2.5%)
a=h.index("function inflChoice(ctx){")
e=h.index("\n", h.index("nbHint('infl', 'r') : '') + '</div>'; }", a))
h=h[:a]+"""function inflChoice(ctx){ const v = S.infl, std = v === INFL_STD && !S.inflOther, ie = v === INFL_IE && !S.inflOther, oth = !!S.inflOther || (v != null && !std && !ie);
  return '<div class="infl" id="infl-' + ctx + '"><b style="font-size:14px" id="infl-l-' + ctx + '">Prices rising (inflation)</b> ' + asmTag(inflSet(), true) + '<p class="small" style="margin:2px 0 6px">Generally the standard is ' + pcs(INFL_STD) + ' (' + STB.infl.by + '). Prices in Ireland are rising ' + pcs(INFL_IE) + ' a year right now (' + INFL_SRC + '), mostly because of energy. Choose what you want to use.</p>' +
    '<div class="chips" role="group" aria-labelledby="infl-l-' + ctx + '"><button class="chip sm' + (std ? ' sel' : '') + '" aria-pressed="' + std + '" data-a="infl" data-p="' + INFL_STD + '">Use the standard (' + pcs(INFL_STD) + ')</button><button class="chip sm' + (ie ? ' sel' : '') + '" aria-pressed="' + ie + '" data-a="infl" data-p="' + INFL_IE + '">' + pcs(INFL_IE) + ' · Ireland now (' + INFL_SRC + ')</button><button class="chip sm' + (oth ? ' sel' : '') + '" aria-pressed="' + oth + '" data-a="infl" data-p="other">Other</button></div>' +
    (oth ? '<div class="flabel" style="margin-top:6px"><span id="infl-o-' + ctx + '">My own rate (0–10%)</span>' + nbox('infl', 'r', v != null ? +(v * 100).toFixed(2) : '', '%', 'infl-o-' + ctx, {id:'infl-v-' + ctx, dec:true}) + '</div>' + nbHint('infl', 'r') : '') + '</div>'; }"""+h[e:]
# growth set toggle: choosing a set chooses its five rates (an explicit choice)
rep("' Growth is never guaranteed. Inflation is your own choice, below.' + '</p></div>'; }", "' Choosing a set fills pay rises, cash, investment and pension growth with its rates. Growth is never guaranteed.' + '</p></div>'; }")
rep("  assume:p => { if (S.assume === p) return; S.assume = p; version(", "  assume:p => { S.assume = p; S.asm = Object.assign({}, S.asm); ['wage', 'cash', 'inv', 'pen', 'penRet'].forEach(k => { S.asm[k] = AS_SETS[p][k]; }); applyAssume(); version(")
# actions
rep("  asmall:() => { S.asm = {}; applyAssume(); render(); toast('All assumptions back to the suggested values'); },",
    "  asmall:() => ACT.useall('asm'),\n  useall:p => { const n = useAllStd(); version('Standard used for the choices not made yet'); focusKey = p === 'p4' ? '#p4-asm h3' : null; render(); toast(n ? 'Standard used for ' + n + (n === 1 ? ' choice' : ' choices') : 'Every choice is already made'); },\n  asmstd:p => { S.asm = Object.assign({}, S.asm, {[p]:ASM[p].sug()}); applyAssume(); focusKey = '[data-k=\"' + p + '\"] .flabel'; render(); },")
rep("  infl:p => { if (p === 'other'){ S.inflOther = true; if (S.infl == null) S.infl = 0.025; focusKey = '[data-nb^=\"infl|\"]'; }",
    "  infl:p => { if (p === 'other'){ S.inflOther = true; S.inflEdit = true; focusKey = '[data-nb^=\"infl|\"]'; render(); return; }")
# P4: the assumptions step next to the inflation choice; results only when every choice is made
rep("""'<div class="card" id="p4-infl">' + inflChoice('p4') + '<p class="small" style="margin:6px 0 0">An assumption for your plan, not one of your questions. You can change it later in What if or Assumptions.</p></div>',""", "p4Asm(),")
rep("""  foot:(inflSet() ? '' : '<p class="small" style="margin:0;text-align:center">Pick an inflation rate above to see your results.</p>') + '<button class="btn" data-a="toresults" id="seeres"' + (S.checked && inflSet() ? '' : ' disabled') + '>See my results</button>'};""",
    """  foot:(planReady() ? '' : '<p class="small" style="margin:0;text-align:center" id="p4-need">' + esc(chooseTxt(planMissing()[0]).replace(/ to see this$/, '')) + ' above to see your results.</p>') + '<button class="btn" data-a="toresults" id="seeres"' + (S.checked && planReady() ? '' : ' disabled') + '>See my results</button>'};""")
rep("  toresults:() => { if (!S.checked || !inflSet()) return; toResults(); },", "  toresults:() => { if (!S.checked || !planReady()) return; toResults(); },")
rep("document.getElementById('seeres').disabled = !(i.checked && inflSet()); }", "document.getElementById('seeres').disabled = !(i.checked && planReady()); }")
# checkItems: retirement age is asked in the assumptions step
rep("FSEC.forEach(s => s.f.filter(fieldVisible).forEach(k => { const src = S.src[k], look = S.look[k];", "FSEC.forEach(s => s.f.filter(fieldVisible).filter(k => k !== 'retireAge').forEach(k => { const src = S.src[k], look = S.look[k];")
# retirement age: chosen only by the customer
rep("function setRetireAge(a){ S.retireAge = a;", "function setRetireAge(a){ S.retireAge = a; S.retireSet = true;")
rep("S.fin.retireAge = S.retireAge; S.src.retireAge = S.src.retireAge || 'pre'; }", "if (S.retireSet){ S.fin.retireAge = S.retireAge; S.src.retireAge = S.src.retireAge || 'pre'; } }")
rep("goals:[], gid:1, retireAge:66,", "goals:[], gid:1, retireAge:66, retireSet:false, asm:{},")
rep("""  return g.kind === 'retire' ? '<span aria-hidden="true">🏁</span>Retire <span class="yr">' + g.age + '</span>'""", """  return g.kind === 'retire' ? '<span aria-hidden="true">🏁</span>Retire <span class="yr">' + (S.retireSet ? g.age : '?') + '</span>'""")
rep("if (g.kind === 'legacy') return 'At the end of your plan (' + AS.end + ')'; return (g.kind === 'retire' ? 'Age ' + g.age :", "if (g.kind === 'legacy') return 'At the end of your plan' + (asmMine('planEnd') ? ' (' + AS.end + ')' : ''); return (g.kind === 'retire' ? (S.retireSet ? 'Age ' + g.age : 'Age not chosen yet') :")
rep("yearsTxt(g){ const n = g.age - S.about.age; return g.kind === 'legacy' ? 'at the end of your plan (' + AS.end + ')' : g.kind === 'retire' ? 'at ' + g.age :", "yearsTxt(g){ const n = g.age - S.about.age; return g.kind === 'legacy' ? 'at the end of your plan' + (asmMine('planEnd') ? ' (' + AS.end + ')' : '') : g.kind === 'retire' ? (S.retireSet ? 'at ' + g.age : 'at an age you haven\\'t chosen yet') :")
rep("['Retirement age', S.retireAge]].map(", "['Retirement age', S.retireSet ? S.retireAge : 'Not chosen yet']].map(")
rep("<div class=\"small\">Age ' + b.age + ' · retiring at ' + S.retireAge + '</div>", "<div class=\"small\">Age ' + b.age + (S.retireSet ? ' · retiring at ' + S.retireAge : ' · retirement age not chosen yet') + '</div>")
# number boxes: blank stays blank; whole numbers for years / months / ages; Enter-then-leave keeps the hint; retirement-age box
rep("""function nbox(kind, key, v, u, lab, o){ o = o || {}; const [pre, suf] = nbParts(u), txt = (o.sign && v > 0 ? '+' : '') + nbFmt(v);""",
    """function nbox(kind, key, v, u, lab, o){ o = o || {}; const [pre, suf] = nbParts(u), txt = v === '' || v == null ? '' : (o.sign && v > 0 ? '+' : '') + nbFmt(v);""")
rep("""  age:{ lim(){ return {min:18, max:80, smax:80, widen:false, u:'age'}; },""",
    """  ret:{ lim(){ return {min:Math.max(50, S.about.age + 1), max:75, smax:75, widen:false, u:'age', int:true}; },
    apply(k, v){ const r = retireGoal(); if (r) r.age = Math.round(v); setRetireAge(Math.round(v)); S.src.retireAge = 'typed'; S.fin.retireAge = S.retireAge; } },
  age:{ lim(){ return {min:18, max:80, smax:80, widen:false, u:'age', int:true}; },""")
rep("""  asm:{ lim(k){ const d = ASM[k]; return d ? {min:d.min, max:d.max, smax:d.max, widen:false, u:d.t === 'pct' ? '%' : d.t === 'eur' ? '€' : d.t === 'yrs' ? 'y' : d.t === 'age' ? 'age' : ''} : null; },""",
    """  asm:{ lim(k){ const d = ASM[k]; return d ? {min:d.min, max:d.max, smax:d.max, widen:false, u:nbUnit(d), int:d.t !== 'pct' && d.step % 1 === 0} : null; },""")
rep("""    lim(k){ const c = this.calc(), i = c && c.inputs.concat(c.wi || []).find(x => x.k === k); return i ? {min:i.min, max:i.u === '€' ? i.max * 10 : i.max, smax:i.max, widen:i.u === '€', u:i.u} : null; },""",
    """    lim(k){ const c = this.calc(), i = c && c.inputs.concat(c.wi || []).find(x => x.k === k); return i ? {min:i.min, max:i.u === '€' ? i.max * 10 : i.max, smax:i.max, widen:i.u === '€', u:i.u, int:['y', 'm', 'age'].includes(i.u) && i.step % 1 === 0} : null; },""")
rep("""  if (kind === 'age') v = Math.round(v);""", """  if (L.int && v !== Math.round(v)){ v = Math.round(v); msg = msg || 'Whole numbers only'; }""")
rep("""if (kind === 'save' || kind === 'age' || kind === 'infl' || kind === 'asm') render(); } }""", """if (kind === 'save' || kind === 'age' || kind === 'infl' || kind === 'asm' || kind === 'ret') render(); } }""")
rep("""i.addEventListener('change', () => nbCommit(i, true));""", """i.addEventListener('change', () => { if (i.dataset.last != null && i.value === i.dataset.last) return; nbCommit(i, true); });   // Enter, then leaving the box, keeps the max / min hint""")
open(F,'w').write(h); print('ok')
