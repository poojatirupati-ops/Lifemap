from ed import Ed
e = Ed()
# ---------- tags: Set by LifeMap / Your choice / Assumed: add yours / Not chosen yet
e.rep("const T_GOV = 'Set by Government · 2026', T_MINE = 'Your choice', T_HOW = 'How the plan works';","const T_GOV = 'Set by Government · 2026', T_MINE = 'Your choice', T_HOW = 'How the plan works', T_SET = 'Set by LifeMap', T_ASSUMED = 'Assumed: add yours';")
e.rep("const asmTag = (on, need) => on ? '<span class=\"tag doc\">' + T_MINE + '</span>' : need ? '<span class=\"tag look\">Not chosen yet</span>' : '';",
"""const asmTag = (on, need) => on ? '<span class="tag doc">' + T_MINE + '</span>' : need ? '<span class="tag look">Not chosen yet</span>' : '';
// §27.5-6: what an assumption is until the customer sets it. req = theirs to choose (plan-until age); std = a LifeMap standard, applied from the start; assumed = a market rate or figure LifeMap assumes, "add yours"
const asmKind = k => k === 'planEnd' ? 'req' : (ASM[k].ty === 3 && !ASM[k].own && ASM[k].sug) ? 'std' : 'assumed';
const asmTagK = k => asmMine(k) ? '<span class="tag doc">' + T_MINE + '</span>' : asmKind(k) === 'req' ? '<span class="tag look">Not chosen yet</span>' : asmKind(k) === 'std' ? '<span class="tag pre">' + T_SET + '</span>' : (ASM[k].opt ? '<span class="tag typed">Optional</span>' : '<span class="tag look">' + T_ASSUMED + '</span>');
// the label for the source of an assumption row (What your plan assumes, Step 7 list)
const asmSrcLbl = k => asmMine(k) ? T_MINE : asmKind(k) === 'std' ? T_SET : asmKind(k) === 'req' ? T_MINE : T_ASSUMED;""")
# ---------- asmGuide: the standard is applied; saying so
e.rep("  return d.own ? '' : 'Generally the standard is ' + asmFmt(d, d.sug()) + ' (' + d.by + '). Choose what you want to use.'; }",
      "  return d.own ? '' : 'LifeMap uses ' + asmFmt(d, d.sug()) + ' (' + d.by + '). Change it if you want to use your own.'; }")
# ---------- asmInput
a = e.t.index("function asmInput(k, req){")
b = e.t.index("// Retirement age: never defaulted, never part of \"use all\" (§14)")
e.t = e.t[:a] + """function asmInput(k, req){ const d = ASM[k], mine = asmMine(k), kind = asmKind(k), v = mine ? asmGet(k) : kind === 'req' ? null : asmV(k), id = 'asm-' + k, std = kind === 'std' ? d.sug() : null;
  const ctl = d.t === 'choice' ? '<div class="chips" role="group" aria-labelledby="' + id + '">' + d.o.map(([val, l]) => { const on = v != null && String(v) === String(val); return '<button class="chip sm' + (on ? ' sel' : '') + '" aria-pressed="' + on + '" data-a="asmset" data-p="' + k + '|' + val + '">' + esc(l) + '</button>'; }).join('') + '</div>'
    : nbox('asm', k, v == null ? '' : d.t === 'pct' ? +(v * 100).toFixed(2) : +v, nbUnit(d), id, {dec:d.t === 'pct' || d.t === 'eurw' || (d.step % 1 !== 0)}) + nbHint('asm', k);
  const ms = d.mk ? mkSug(d) : null, chip = mine && std != null ? '<button class="chip sm" style="margin-top:6px" data-a="asmback" data-p="' + k + '">Back to LifeMap\\'s figure (' + esc(asmFmt(d, std)) + ')</button>' : mine && ms ? '<button class="chip sm" style="margin-top:6px" data-a="asmback" data-p="' + k + '">Back to the assumed rate (' + esc(ms.t.replace(/\\) · .*/, '')) + ')</button>' : '';
  // M4: an unknown card or loan rate is not a dead end: the customer chooses, in one tap, a prudent planning rate (and may leave it for their adviser). Never silent.
  const dk = (k === 'cardRate' || k === 'loanRate') && (!mine || advOn(k)) && (d.need() || advOn(k)), idk = dk ? '<div class="chips" style="margin-top:6px">' + (k === 'cardRate' && v !== GD.cardCap ? '<button class="chip sm" data-a="asmcap" data-p="cardRate">Use ' + pcs(GD.cardCap) + ' (the legal limit for new cards): cautious, not typical</button>' : '') + (advOn(k) ? '' : '<button class="chip sm" data-a="asmadv" data-p="' + k + '">I don\\'t know my rate: use a planning rate (' + pcs(d.fb()) + ') and leave it for my adviser</button>') + '</div>' + (advOn(k) ? '<span class="small" style="display:block;margin-top:4px" id="adv-' + k + '">Planning rate ' + pcs(+v) + ', left for your adviser to check. Type your own rate any time.</span>' : '') : '';
  const using = kind === 'assumed' && !mine && !d.opt && v != null ? '<span class="small" style="display:block;margin-top:4px" id="using-' + k + '">We are using ' + esc(asmFmt(d, v)) + (ms ? ' (' + esc(SL(d.mk)) + ')' : ' (a planning figure)') + ' until you add yours.</span>' : '';
  return '<div class="field asmf" data-k="' + k + '" data-kind="' + (mine ? 'mine' : kind) + '" style="margin:0 0 14px"><span class="flabel" id="' + id + '">' + esc(d.l) + ' ' + asmTagK(k) + '</span>' + ctl + chip + idk + using +
    '<span class="small" style="display:block;margin-top:4px">' + esc([asmGuide(d), d.help].filter(Boolean).join(' ')) + '</span></div>'; }
""" + e.t[b:]
# ---------- Your assumptions screen: no "use the standard" card
a = e.t.index("function stdLeft(){")
b = e.t.index("// Plan builder step 7: one place to make the choices the results need")
e.t = e.t[:a] + """function stdLeft(){ return planMissing().length; }
function asmScreen(){ applyAssume(); const open = S.asmOpen === undefined ? 'prices' : S.asmOpen, left = planMissing().length;
  return '<div class="card"><b>' + (left ? 'To see your results we need ' + left + (left === 1 ? ' thing' : ' things') : 'Everything your results need is chosen') + '</b><p class="small" style="margin:2px 0 0">LifeMap sets the figures that are the same for everyone (tagged <b>' + T_SET + '</b>) and uses them from the start. Change any of them and it reads <b>' + T_MINE + '</b>. A rate we don\\'t know is tagged <b>' + T_ASSUMED + '</b>.</p></div>' +
    ASM_GRP.map(([g, t]) => '<details class="card asmg" data-g="' + g + '"' + (open === g ? ' open' : '') + '><summary style="cursor:pointer;font-weight:800;min-height:44px">' + t + '</summary><div style="margin-top:10px">' +
    (g === 'prices' ? '<div class="field" style="margin:0 0 14px">' + inflChoice('asm') + '</div><div class="field" style="margin:0 0 14px"><span class="flabel">Growth assumptions set</span>' + assumeToggle() + '</div>' : '') + (g === 'length' ? retireField() + pRetireField() : '') +
    ASM_KEYS().filter(k => ASM[k].g === g).sort((a, b) => (b === 'planEnd') - (a === 'planEnd')).map(k => asmInput(k)).join('') + (g === 'safety' && [ 'budgetNeeds', 'budgetWants', 'budgetSave'].every(asmMine) && Math.abs(asmV('budgetNeeds') + asmV('budgetWants') + asmV('budgetSave') - 1) > 1e-6 ? '<p class="note">Your budget split adds up to ' + Math.round((asmV('budgetNeeds') + asmV('budgetWants') + asmV('budgetSave')) * 100) + '%. It should total 100%.</p>' : '') + '</div></details>').join('') +
    '<details class="card asmg" data-g="law"' + (open === 'law' ? ' open' : '') + '><summary style="cursor:pointer;font-weight:800;min-height:44px">' + T_GOV + '</summary><div style="margin-top:10px">' + govHTML() + '<p class="small" style="margin:8px 0 0">Set by law and the same for everyone, so you can\\'t change them. ' + RULES_VERSION + '.</p></div></details>'; }
""" + e.t[b:]
# ---------- Step 7: choose N things, then "What we've set for you"
a = e.t.index("function p4Asm(){")
b = e.t.index("// §22: nothing blocks except the 3 choices.")
e.t = e.t[:a] + """function p4Asm(){ const n = reqKeys().length, got = n - req3Missing().length, rest = ASM_KEYS().filter(k => k !== 'planEnd'), mineN = rest.filter(asmMine).length;
  return '<div id="p4-asm"><div class="card" id="p4-3"><h3 style="margin:0 0 4px;font-size:17px">Choose ' + n + ' things</h3><p class="small" style="margin:0 0 6px">Your results need these ' + (n === 3 ? 'three' : 'four') + '. Only you can choose them, so we never fill them in for you.</p><p class="small" style="margin:0 0 12px" role="status" id="p4-count"><b>' + got + ' of ' + n + ' chosen</b></p>' +
    retireField() + asmInput('planEnd') + '<div id="p4-infl" class="field" style="margin:0 0 14px">' + inflChoice('p4') + '</div>' + pRetireField() + '</div>' +
    '<details class="card" id="p4-rest" data-g="p4"' + (S.asmOpen === 'p4' ? ' open' : '') + '><summary style="cursor:pointer;font-weight:800;min-height:44px">What we\\'ve set for you (change any)</summary><p class="small" style="margin:6px 0 10px">Everything else is set from the start, so nothing else blocks your results. Figures that are the same for everyone are tagged <b>' + T_SET + '</b>; a rate we don\\'t know is tagged <b>' + T_ASSUMED + '</b>. Change any one and it reads <b>' + T_MINE + '</b>.' + (mineN ? ' You have changed ' + mineN + '.' : '') + '</p>' +
    '<div style="margin-top:10px">' + rest.map(k => asmInput(k)).join('') + '</div></details></div>'; }
""" + e.t[b:]
# ---------- the gate card (§27.7)
a = e.t.index("// \"Choose your [item] to see this\": shown instead of any result that needs a missing choice (§14)")
b = e.t.index("V.ME = () => { const m = S.me;")
e.t = e.t[:a] + """// §27.7: one calm card for Home, Results, Report and the PDF button: how many things, each by its exact name, and a button that jumps to that box and highlights it
function gateHTML(where){ const m = planMissing(); if (!m.length) return '';
  return '<div class="card" id="gate-' + where + '" style="border:1.5px dashed #B9C9D6;box-shadow:none"><b>To see your results we need ' + m.length + (m.length === 1 ? ' thing' : ' things') + '</b><p class="small" style="margin:4px 0 8px">Only you can choose ' + (m.length === 1 ? 'this' : 'these') + ', so we never fill ' + (m.length === 1 ? 'it' : 'them') + ' in for you. Everything else is set for you and can be changed later.</p>' +
    m.map(x => '<div class="mini" style="align-items:center"><span><b>' + esc(x.t) + '</b></span><button class="btn sm" style="width:auto" data-a="gofix" data-p="' + x.k + '" aria-label="Choose ' + esc(x.t.toLowerCase()) + '">Choose</button></div>').join('') + '</div>'; }
// jump to the box for a required choice and highlight it
const GATE_GRP = {infl:'prices', retireAge:'length', planEnd:'length', pRetireAge:'length'};
function jumpTo(k){ const el = document.querySelector(k === 'infl' ? '[id^="infl-"]' : '.asmf[data-k="' + k + '"]'); if (!el) return; const d = el.closest('details'); if (d) d.open = true;
  el.classList.add('flash'); el.scrollIntoView({block:'center', behavior:'instant'}); const f = el.querySelector('input,button'); if (f) f.focus({preventScroll:true}); setTimeout(() => el.classList.remove('flash'), 4000); }
""" + e.t[b:]
# gofix and asmback actions; useall no longer offered
e.rep("  asmopen:p => { S.tab = 'me'; S.me = 'asm'; S.asmBack = 'meback'; S.sheet = null; render(); },","""  asmopen:p => { S.tab = 'me'; S.me = 'asm'; S.asmBack = 'meback'; S.sheet = null; render(); },
  gofix:p => { S.tab = 'me'; S.me = 'asm'; S.asmBack = 'meback'; S.sheet = null; if (GATE_GRP[p]) S.asmOpen = GATE_GRP[p]; render(); jumpTo(p); },
  asmback:p => { S.asm = Object.assign({}, S.asm); delete S.asm[p]; if (S.advRate) delete S.advRate[p]; applyAssume(); focusKey = '[data-k="' + p + '"] .flabel'; render(); },""")
e.rep("  asmstd:p => { S.asm = Object.assign({}, S.asm, {[p]:ASM[p].sug()}); applyAssume(); focusKey = '[data-k=\"' + p + '\"] .flabel'; render(); },","  asmstd:p => { S.asm = Object.assign({}, S.asm, {[p]:ASM[p].sug()}); applyAssume(); focusKey = '[data-k=\"' + p + '\"] .flabel'; render(); },   // kept for the calculators' older chips")
# ---------- strip and report
e.rep("function tlStrip(){ if (!planReady()) return '<div class=\"card row\" id=\"tl-strip\" style=\"background:var(--sea-l)\"><div style=\"flex:1\"><b>' + esc(chooseTxt(planMissing()[0])) + '</b><div class=\"small\" style=\"color:var(--ink)\">Your goals\\' progress shows once it\\'s chosen.</div></div><button class=\"btn sm\" data-a=\"asmopen\">Choose</button></div>';",
"function tlStrip(){ if (!planReady()){ const m = planMissing(); return '<div class=\"card row\" id=\"tl-strip\" style=\"background:var(--sea-l)\"><div style=\"flex:1\"><b>To see your results we need ' + m.length + (m.length === 1 ? ' thing' : ' things') + '</b><div class=\"small\" style=\"color:var(--ink)\">Your goals\\' progress shows once ' + (m.length === 1 ? 'it is' : 'they are') + ' chosen.</div></div><button class=\"btn sm\" data-a=\"gofix\" data-p=\"' + m[0].k + '\">Choose</button></div>'; }")
e.rep("function openReport(){ if (!planReady()){ toast(chooseTxt(planMissing()[0]).replace(/this$/, 'your report')); ACT.asmopen(); return; }","function openReport(){ if (!planReady()){ S.sheet = 'gate|report'; render(); return; }")
e.rep("  if (t === 'invite') h =","  if (t === 'gate') h = '<h2 class=\"t\">Almost there</h2>' + gateHTML('report').replace(' id=\"gate-report\"', ' id=\"gate-report\"') + '<button class=\"btn ghost\" style=\"margin-top:10px\" data-a=\"closesheet\">Not now</button>';\n  if (t === 'invite') h =")
# ---------- CSS: the highlight when a button jumps to a box
e.rep(".tag.doc{background:var(--ok-l);color:var(--ok-t)}",".flash{outline:3px solid var(--sun);outline-offset:6px;border-radius:12px;animation:flashfade 4s ease-out forwards}@keyframes flashfade{0%,60%{outline-color:var(--sun)}100%{outline-color:transparent}}@media (prefers-reduced-motion:reduce){.flash{animation:none}}\n.tag.doc{background:var(--ok-l);color:var(--ok-t)}")
e.save()
