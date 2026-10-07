import sys,re
F='/home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'
h=open(F).read()
def rep(old,new,cnt=1):
    global h
    n=h.count(old)
    if n!=cnt: sys.exit('anchor %d x: %s'%(n,old[:110]))
    h=h.replace(old,new)
# 1. delete every est: in FF (values may be functions with nested brackets)
a=h.index('const FF = {'); e=h.index('\n};', a)
blk=h[a:e]; out=''; i=0; n_est=0
while True:
    j=blk.find(', est:', i)
    if j<0: out+=blk[i:]; break
    out+=blk[i:j]; k=j+6; depth=0
    while k<len(blk):
        c=blk[k]
        if c in '([{': depth+=1
        elif c in ')]}':
            if depth==0: break
            depth-=1
        elif c==',' and depth==0: break
        elif c in "'\"":
            q=c; k+=1
            while blk[k]!=q:
                if blk[k]=='\\': k+=1
                k+=1
        k+=1
    i=k; n_est+=1
h=h[:a]+out+h[e:]
print('est removed', n_est, 'left', h[a:h.index('\n};', a)].count('est:'))
rep("hint:'Optional. Only your own share gets tax relief. If you leave it blank we assume half (all of it if self-employed); change that in Your assumptions'", "hint:'Optional. Only your own share gets tax relief. If you leave it blank, you choose your share in Your assumptions'")
# 2. example cards + sample figures, after FF
rep("/* mocked document reader output */", open('ex.js').read() + "/* mocked document reader output */")
# 3. field links: "Not sure? See an example" on every eur / num / choice field; no "Estimate for me", no "I don't have this"
EXL = """'<div class="fhelp"><button class="link" data-a="fex" data-p="' + k + '" aria-haspopup="dialog">Not sure? See an example</button></div>'"""
rep("""(d.type === 'choice' && d.est ? '<div class="fhelp"><button class="link" data-a="fest" data-p="' + k + '">Not sure? Estimate for me</button></div>' : '') + '</div>'; }""", "(EXAMPLES[k] ? " + EXL + " : '') + '</div>'; }")
rep("""(d.pre || d.type === 'text' ? '' : '<div class="fhelp"><button class="link" data-a="fest" data-p="' + k + '">Not sure? Estimate for me</button><button class="link" data-a="fnone" data-p="' + k + '">I don\\'t have this</button></div>') + '</div>';""",
    """(workedNote(k) ? '<span class="small" id="wo-' + k + '" style="display:block;color:var(--sea-d)">' + esc(workedNote(k)) + '</span>' : '') + (d.type === 'text' || !EXAMPLES[k] ? '' : """ + EXL + """) + '</div>';""")
# 4. actions: example card opens a dialog; closing returns focus to its link
rep("""  fest:p => { const d = FF[p]; setManual(p, val(d.est), 'est'); focusKey = '[data-a="fest"][data-p="' + p + '"]'; render(); },
  fnone:p => { setManual(p, 0, 'none'); focusKey = '[data-a="fnone"][data-p="' + p + '"]'; render(); },""",
    """  fex:p => { S.sheet = 'ex|' + p; render(); },   // §15: shows an example; never fills the field""")
rep("""closesheet:() => { S.sheet = null; render(); },""", """closesheet:() => closeSheet(),""")
rep("""document.addEventListener('keydown', e => { if (e.key === 'Escape'){ if (document.getElementById('report').classList.contains('on')) { document.getElementById('report').classList.remove('on'); return; } if (S.sheet){ S.sheet = null; render(); } } });""",
    """function closeSheet(){ const s = S.sheet; S.sheet = null; if (s && s.startsWith('ex|')) focusKey = '[data-a="fex"][data-p="' + s.slice(3) + '"]'; render(); }   // §15: focus goes back to the link
document.addEventListener('keydown', e => { if (e.key === 'Escape'){ if (document.getElementById('report').classList.contains('on')) { document.getElementById('report').classList.remove('on'); return; } if (S.sheet) closeSheet(); }
  if (e.key === 'Tab' && S && S.sheet){ const sh = document.querySelector('#screen .sheet'); if (!sh) return; const f = [...sh.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(x => !x.disabled && x.offsetParent !== null); if (!f.length) return;
    const first = f[0], last = f[f.length - 1]; if (!sh.contains(document.activeElement)){ e.preventDefault(); first.focus(); } else if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); } } });   // dialogs keep focus inside""")
rep("""  if (t === 'fnd') h = fndSheet(p);""", """  if (t === 'fnd') h = fndSheet(p);
  if (t === 'ex') h = exHTML(p);""")
rep("""<div class="sheet" role="dialog" aria-modal="true" aria-label="' + esc(t) + '" data-a="noop">""", """<div class="sheet" role="dialog" aria-modal="true"' + (t === 'ex' ? ' aria-labelledby="ex-t" aria-describedby="ex-s"' : ' aria-label="' + esc(t) + '"') + ' data-a="noop">""")
# 5. statuses: Your figure (typed, incl. 0) / From document / Missing
rep("""s === 'typed' ? '<span class="tag typed">✏️ Your figure</span>' : s === 'est' ? '<span class="tag est">≈ Estimated</span>' : s === 'none' ? '<span class="tag none">Confirmed none</span>' : s === 'pre' ? '<span class="tag pre">From your answers</span>' : '<span class="tag none">❓ Missing</span>'; }""",
    """s === 'typed' ? '<span class="tag typed">✏️ Your figure</span>' : s === 'pre' ? '<span class="tag pre">✏️ Your figure · from your answers</span>' : '<span class="tag none">❓ Missing</span>'; }""")
rep("""if (fieldVisible(k) && !FF[k].opt && (S.src[k] === 'est' || !S.src[k])) n++;""", """if (fieldVisible(k) && !FF[k].opt && !S.src[k]) n++;""")
rep("""(!sk.length ? 'Some figures are estimated or missing. ' : '')""", """(!sk.length ? 'Some figures are missing, so they count as €0. ' : '')""")
rep("""  const st = look ? 'look' : src === 'est' ? 'est' : !src ? (FF[k].opt ? null : 'miss') : src === 'doc' ? 'ok' : 'typed';""", """  const st = look ? 'look' : !src ? (FF[k].opt ? null : 'miss') : src === 'doc' ? 'ok' : 'typed';""")
rep("""V.P4 = () => { const it = checkItems(), flag = it.filter(x => ['look','est','miss'].includes(x.st)), good = it.filter(x => !['look','est','miss'].includes(x.st));
  const ic = {look:'⚠️', est:'≈', miss:'❓'}, lb = {look:'Needs a look', est:'Estimated for you', miss:'Missing'};""",
    """V.P4 = () => { const it = checkItems(), flag = it.filter(x => ['look','miss'].includes(x.st)), good = it.filter(x => !['look','miss'].includes(x.st));
  const ic = {look:'⚠️', miss:'❓'}, lb = {look:'Needs a look', miss:'Missing'};""")
rep("""lb[x.st] + (x.st === 'look' ? ': ' + esc(S.look[x.k]) : x.st === 'est' ? ' (' + fmtField(x.k) + ')' : '')""", """lb[x.st] + (x.st === 'look' ? ': ' + esc(S.look[x.k]) : '') + (workedNote(x.k) ? '. ' + esc(workedNote(x.k)) : '')""")
rep("""  if (m === 'money'){ const flags = checkItems().filter(x => ['look','est','miss'].includes(x.st));""", """  if (m === 'money'){ const flags = checkItems().filter(x => ['look','miss'].includes(x.st));""")
rep("""checklist of missing / estimated items, add a document.""", """checklist of missing items and ones that need a look, add a document.""")
rep("""({look:'⚠️', est:'≈', miss:'❓'})[x.st] + ' ' + esc(FF[x.k].l)""", """({look:'⚠️', miss:'❓'})[x.st] + ' ' + esc(FF[x.k].l)""")
rep("""  const flags = checkItems().filter(x => ['look','est','miss'].includes(x.st));""", """  const flags = checkItems().filter(x => ['look','miss'].includes(x.st));""")
rep("""(flags.length ? '<p>' + flags.length + ' item(s) are estimated, missing or need a look.</p>' : '')""", """(flags.length ? '<p>' + flags.length + (flags.length === 1 ? ' item is' : ' items are') + ' missing or need a look.</p>' : '') + workedList().map(x => '<p>' + esc(FF[x[0]].l) + ': ' + esc(x[1].replace(/ Type yours to replace it\\.$/, '')) + '</p>').join('')""")
rep("""const statedM = k => S.src && S.src[k] && S.src[k] !== 'est' && +S.fin[k] > 0 ? +S.fin[k] : null;""", """const statedM = k => S.src && S.src[k] && +S.fin[k] > 0 ? +S.fin[k] : null;""")
# 6. Ask / FAQ / context copy
rep("""  ['estimate', 'What happens if I estimate a figure?', 'We fill in a typical figure so you can see results straight away. It is marked "≈ Estimated". Swap in your real figure any time to sharpen your plan.'],""",
    """  ['estimate', 'What if I don\\'t know a figure?', '"Not sure? See an example" shows how our example customers, Aoife and Cian, filled it in, and where to find yours. It never fills in a figure for you: every customer\\'s money is different. Nothing to add? Enter 0. Leave it blank and it shows as Missing and counts as €0 until you add it.'],""")
rep("""Rough figures are fine. "Estimate for me" fills in a typical figure you can change later. We don\\'t connect to your bank.'];""", """Rough figures are fine. "Not sure? See an example" shows where to find each one; we never fill in a figure for you. We don\\'t connect to your bank.'];""")
rep("""[/estimat/, 'estimate']""", """[/estimat|example|don.?t know|not sure/, 'estimate']""")
rep("""Before tax. Leave it blank and we\\'ll ask in Income, or estimate it.""", """Before tax. Leave it blank and we\\'ll ask in Income.""")
rep("""Upload vs Type it; every field has Estimate for me / I don\\'t have this.""", """Upload vs Type it; every field has "Not sure? See an example" (§15), which never fills the field.""")
# 7. safety goal: no invented living costs; the goal's own target until costs are known
rep("""const F = finNums(), e = S.src && S.src.costsM ? essM(F) : val(FF.costsM.est); g.amount = Math.round(e * SAVE.buffer / 1000) * 1000; }""",
    """const F = finNums(); if (S.src && S.src.costsM) g.amount = Math.round(essM(F) * SAVE.buffer / 1000) * 1000; }   // §15: no invented costs; without them the goal keeps its own target, which the customer can change""")
# 8. mortgage repayment is worked out only from the customer's own years left
rep("""mortPayM:mortOn ? (mStated || mPmt(n('mortBal'), mR, n('mortYears') || 25)) : 0, mortPayEst:mortOn && !mStated, mortPayLow:mortOn && mStated > 0 && n('mortBal') > 0 && mStated < mPmt(n('mortBal'), mR, n('mortYears') || 25) - 1,""",
    """mortPayM:mortOn ? (mStated || mPmt(n('mortBal'), mR, n('mortYears') || 25)) : 0, mortPayEst:mortOn && !mStated, mortYearsKnown:n('mortYears') > 0, mortPayLow:mortOn && mStated > 0 && n('mortBal') > 0 && n('mortYears') > 0 && mStated < mPmt(n('mortBal'), mR, n('mortYears')) - 1,""")
# 9. missing personal figures that the plan needs: "Add your … to see this" (never a made-up figure)
rep("""  ASM_KEYS().filter(k => ASM[k].need() && !asmMine(k)).sort(""", """  if (S.about && S.about.partner && FF.pAge.show() && !(finN('pAge') > 0)) out.push({k:'pAge', n:'partner\\'s age', add:true});
  if (S.fin && S.fin.home === 'Own with mortgage' && finN('mortBal') > 0 && !(finN('mortPayM') > 0) && !(finN('mortYears') > 0)) out.push({k:'mortYears', n:'mortgage years left (or your monthly repayment)', add:true});
  ASM_KEYS().filter(k => ASM[k].need() && !asmMine(k)).sort(""")
rep("""const chooseTxt = m => 'Choose your ' + m.n + ' to see this';""", """const chooseTxt = m => (m.add ? 'Add your ' : 'Choose your ') + m.n + ' to see this';""")
rep("""'</p><button class="btn sm" data-a="asmopen">Make my choices</button></div>'; }""", """'</p>' + (m[0].add ? '<button class="btn sm" data-a="fix" data-p="' + FSEC.findIndex(s => s.f.includes(m[0].k === 'mortYears' ? 'mortYears' : m[0].k)) + '">Add it</button>' : '<button class="btn sm" data-a="asmopen">Make my choices</button>') + '</div>'; }""")
rep("""esc(chooseTxt(planMissing()[0]).replace(/ to see this$/, '')) + ' above to see your results.</p>'""", """esc(chooseTxt(planMissing()[0]).replace(/ to see this$/, '')) + (planMissing()[0].add ? ' in Your finances' : ' above') + ' to see your results.</p>'""")
# 10. calculators: no 25-year fallback; a missing personal figure shows "Add your … to see this"; worked-out figures are labelled
for a,b in [("p.term = F.mortYears || 25; } break;","p.term = F.mortYears || null; } break;"),("p.a = F.mortYears || 25; } break;","p.a = F.mortYears || null; } break;"),("p.yrs = F.mortYears || 25; } break;","p.yrs = F.mortYears || null; } break;"),("p.y = F.mortYears || 25; } break;","p.y = F.mortYears || null; } break;")]:
    rep(a,b)
rep("""const s = calcA(c.id, i.k), tp = ((S.toolPick || {})[c.id] || {})[i.k], x = pre[i.k] != null ? pre[i.k] :""", """const s = calcA(c.id, i.k), tp = ((S.toolPick || {})[c.id] || {})[i.k], x = pre[i.k] != null ? pre[i.k] : pre[i.k] === null ? null :""")
rep("""  c.inputs.forEach(i => { if (v[i.k] == null){ const s = calcA(c.id, i.k); out.push(s ? s.n : i.l.toLowerCase()); } });""", """  c.inputs.forEach(i => { if (v[i.k] == null){ const s = calcA(c.id, i.k); out.push(s ? s.n : 'add:' + i.l.toLowerCase()); } });""")
rep("""const moTxt = x =>""", """const missTxt = m => m.startsWith('add:') ? 'Add your ' + m.slice(4) : 'Choose your ' + m;   // "Add your years left" for a missing personal figure
const moTxt = x =>""")
rep("""esc('Choose your ' + miss[0] + ' to see this') + '</b>' + (miss.length > 1 ? '<p style="margin:0;font-size:13.5px;color:#DCE7F2">Also still to choose: ' + esc(miss.slice(1).join(', ')) + '.</p>' : '')""",
    """esc(missTxt(miss[0]) + ' to see this') + '</b>' + (miss.length > 1 ? '<p style="margin:0;font-size:13.5px;color:#DCE7F2">Also still to add or choose: ' + esc(miss.slice(1).map(x => x.replace(/^add:/, '')).join(', ')) + '.</p>' : '')""")
rep("""h = m.length ? '<h2 class="t">' + esc('Choose your ' + m[0] + ' first') + '</h2>""", """h = m.length ? '<h2 class="t">' + esc(missTxt(m[0]) + ' first') + '</h2>""")
rep("""if (m.length){ toast('Choose your ' + m[0] + ' first'); return; }""", """if (m.length){ toast(missTxt(m[0]) + ' first'); return; }""")
rep("""function calcPre(c){ applyAssume(); const p = {},""", """function calcPre(c){ applyAssume(); S.calcWO = S.calcWO || {}; S.calcWO[c.id] = {}; const p = {},""")
rep("""p.ess = F.costsM + F.oneOffY / 12 + F.mortPayM; p.life = 0; p.debt = F.debt > 0 ? F.debtPayM : 0; } break;""", """p.ess = F.costsM + F.oneOffY / 12 + F.mortPayM; p.life = 0; p.debt = F.debt > 0 ? F.debtPayM : 0; if (F.mortPayEst && F.mortBal > 0) S.calcWO[c.id].ess = workedNote('mortPayM'); if (F.debtPayEst) S.calcWO[c.id].debt = workedNote(F.cardPayEst ? 'cardPayM' : 'loanPayM'); } break;""")
rep("""if (cm >= lm){ p.b = F.cardBal; p.p = F.cardPayM;""", """if (cm >= lm){ p.b = F.cardBal; p.p = F.cardPayM; if (F.cardPayEst) S.calcWO[c.id].p = workedNote('cardPayM');""")
rep("""} else { p.b = F.loanBal; p.p = F.loanPayM;""", """} else { p.b = F.loanBal; p.p = F.loanPayM; if (F.loanPayEst) S.calcWO[c.id].p = workedNote('loanPayM');""")
rep("""const fieldR = (i, v, src, cid) => CHIP_OPTS[i.u] ? fieldC(i, v, src, cid) : v == null ? fieldBlank(i, cid) : '<div class="field"><div class="flabel"><label id="cl-' + i.k + '" for="c-' + i.k + '">' + esc(i.l) + (src && src.includes(i.k) ? ' <span class="tag doc">From your statement</span>' : '') + '</label>'""",
    """const woC = (cid, k) => cid && S.calcWO && S.calcWO[cid] && S.calcWO[cid][k] && !((S.calcT || {})[cid] || {})[k] ? S.calcWO[cid][k] : '';
const fieldR = (i, v, src, cid) => CHIP_OPTS[i.u] ? fieldC(i, v, src, cid) : v == null ? fieldBlank(i, cid) : '<div class="field"><div class="flabel"><label id="cl-' + i.k + '" for="c-' + i.k + '">' + esc(i.l) + (src && src.includes(i.k) ? ' <span class="tag doc">From your statement</span>' : '') + (woC(cid, i.k) ? ' <span class="tag pre">Worked out from your figures</span>' : '') + '</label>'""")
rep("""nbHint('ck', i.k) + (cid && calcA(cid, i.k) && calcA(cid, i.k).ty === 2 ?""", """nbHint('ck', i.k) + (woC(cid, i.k) ? '<span class="small" style="display:block;margin-top:2px">' + esc(woC(cid, i.k).replace(/ Type yours to replace it\\.$/, '')) + '</span>' : '') + (cid && calcA(cid, i.k) && calcA(cid, i.k).ty === 2 ?""")
# 11. foundations: a worked-out repayment says so
rep("""{st:'bad', s:'Credit card ' + eur(F.cardBal) + (r.m === Infinity ? ' with no repayment set' : ' takes about ' + Math.ceil(r.m) + ' months to clear'), a:'debtpay'}); }""",
    """{st:'bad', s:'Credit card ' + eur(F.cardBal) + (r.m === Infinity ? ' with no repayment set' : ' takes about ' + Math.ceil(r.m) + ' months to clear'), a:'debtpay'}); if (F.cardPayEst) items[items.length - 1].s += ' (repayment worked out from your figures: ' + (finN('cardPayM') > 0 ? 'yours doesn\\'t cover the interest' : 'none given') + ')'; }""")
rep("""{st:'bad', s:'Loans of ' + eur(F.loanBal) + (r.m === Infinity ? ' with no repayment set' : ' take about ' + Math.ceil(r.m / 12) + ' years to clear'), a:'debtpay'}); }""",
    """{st:'bad', s:'Loans of ' + eur(F.loanBal) + (r.m === Infinity ? ' with no repayment set' : ' take about ' + Math.ceil(r.m / 12) + ' years to clear'), a:'debtpay'}); if (F.loanPayEst) items[items.length - 1].s += ' (repayment worked out from your figures: ' + (finN('loanPayM') > 0 ? 'yours doesn\\'t cover the interest' : 'none given') + ')'; }""")
# 12. sample customer from SAMPLE_FIN (Your figure / From document; no "estimated" or "none")
a=h.index("  put('name', 'Aoife', 'pre');"); e=h.index("S.look.pension = 'Statement is over 12 months old';", a)
h=h[:a]+"  Object.entries(SAMPLE_FIN).forEach(([k, [v, src, c]]) => put(k, v, src, c)); "+h[e:]
# 13. comments
rep("""// Skipped figures count as €0 and show as ❓ Missing. Only "Estimate for me" adds a (labelled) typical figure. (spec §11)""", """// Skipped figures count as €0 and show as ❓ Missing. We never fill in a figure for the customer (spec §15).""")
h=h.replace('data precedence, everywhere: document > customer-typed > "Estimate for me" > tool default.', 'data precedence, everywhere: document > customer-typed > (nothing: Missing) (spec §15).')
h=h.replace('Your finances (statement > typed > estimate) > the plan > tool default.', 'Your finances (statement > typed) > the plan > tool default.')
open(F,'w').write(h); print('ok')
