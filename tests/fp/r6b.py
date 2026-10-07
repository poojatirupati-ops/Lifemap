p='/home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'; s=open(p).read()
def R(a,b,cnt=1):
    global s
    n=s.count(a)
    assert n==cnt, (n, a[:90])
    s=s.replace(a,b)
R("const annPay = (bal, r, yrs) => bal > 0 ? bal * r / (1 - Math.pow(1 + r, -Math.max(1, yrs))) : 0;   // level yearly repayment (FP round 4)\n", "")
# ---- precedence helpers + tag
R("""function tagFor(k){ const s = S.src[k]; if (S.look[k] && !S.ack[k]) return '<span class="tag look">⚠️ Needs a look</span>';
  return s === 'doc' ? '<span class="tag doc">✅ From document' + (S.conf[k] ? ' · ' + S.conf[k] + '%' : '') + '</span>'""",
"""/* FP round 6: data precedence, everywhere: document > customer-typed > "Estimate for me" > tool default.
   A statement figure is never overwritten by a later manual entry: the entry is kept (S.man) and shown, and the statement value is used
   until the customer replaces or removes the statement. Corrections on "We read these values" are reading corrections: still the statement. */
const isDoc = k => !!S.src && S.src[k] === 'doc';
function setManual(k, v, src){ S.man = S.man || {}; const empty = v == null || v === '';
  if (isDoc(k)){ if (empty) delete S.man[k]; else S.man[k] = {v, src}; return false; }
  if (empty){ delete S.fin[k]; delete S.src[k]; } else { S.fin[k] = v; S.src[k] = src; } delete S.look[k]; return true; }
function setDoc(k, v, conf, fixed, from){ S.man = S.man || {}; S.fix = S.fix || {}; S.docOf = S.docOf || {};
  if (!isDoc(k) && S.src[k] && S.fin[k] != null && S.fin[k] !== '') S.man[k] = {v:S.fin[k], src:S.src[k]};   // kept, so "Remove statement" can go back to it
  S.fin[k] = v; S.src[k] = 'doc'; if (conf != null && !fixed) S.conf[k] = conf; else delete S.conf[k]; if (fixed) S.fix[k] = true; else delete S.fix[k]; if (from) S.docOf[k] = from; }
function removeDoc(keys){ (keys || []).forEach(k => { if (!isDoc(k)) return; const m = (S.man || {})[k];
  if (m){ S.fin[k] = m.v; S.src[k] = m.src; } else { delete S.fin[k]; delete S.src[k]; }
  delete S.conf[k]; delete S.look[k]; delete S.ack[k]; ['fix', 'man', 'docOf'].forEach(x => { if (S[x]) delete S[x][k]; }); }); }
function docNote(k){ const m = (S.man || {})[k]; if (!isDoc(k) || !m || String(m.v) === String(S.fin[k])) return '';
  const f = x => FF[k] && FF[k].type === 'eur' ? eur(+x) : esc(String(x));
  return 'You typed ' + f(m.v) + '. Your statement says ' + f(S.fin[k]) + '; we\\'re using that.'; }
function tagFor(k){ const s = S.src[k]; if (S.look[k] && !S.ack[k]) return '<span class="tag look">⚠️ Needs a look</span>';
  return s === 'doc' ? '<span class="tag doc">✅ ' + ((S.fix || {})[k] ? 'From your statement (corrected)' : 'From document' + (S.conf[k] ? ' · ' + S.conf[k] + '%' : '')) + '</span>'""")
# ---- finances field: note
R("""  return '<div class="field">' + lab + inp + (d.hint ? '<span class="small" id="h-' + k + '">' + esc(d.hint) + '</span>' : '')""",
  """  return '<div class="field">' + lab + inp + '<span class="small dnote" id="dn-' + k + '" role="status" style="display:block;color:var(--acc-d)">' + docNote(k) + '</span>' + (d.hint ? '<span class="small" id="h-' + k + '">' + esc(d.hint) + '</span>' : '')""")
R("""    return '<div class="field"><span class="flabel">' + esc(d.l) + ' <span id="tag-' + k + '">' + tagFor(k) + '</span></span><div class="chips" role="group" aria-label="' + esc(d.l) + '">' + os.map(o => '<button class="chip sm' + (v === o ? ' sel' : '') + '" aria-pressed="' + (v === o) + '" data-a="fchoice" data-p="' + k + '|' + o + '">' + esc(o) + '</button>').join('') + '</div>'""",
  """    return '<div class="field"><span class="flabel">' + esc(d.l) + ' <span id="tag-' + k + '">' + tagFor(k) + '</span></span><div class="chips" role="group" aria-label="' + esc(d.l) + '">' + os.map(o => '<button class="chip sm' + (v === o ? ' sel' : '') + '" aria-pressed="' + (v === o) + '" data-a="fchoice" data-p="' + k + '|' + o + '">' + esc(o) + '</button>').join('') + '</div>' + (docNote(k) ? '<span class="small" style="display:block;color:var(--acc-d)" role="status">' + docNote(k) + '</span>' : '')""")
# section statement bar
R("""  const body = mode === 'upload' ? uploadPick(sec) : '<div class="card">' + sec.f.filter(fieldVisible)""",
  """  const nDoc = sec.f.filter(k => isDoc(k)).length, docBar = nDoc ? '<div class="card" id="docbar" style="background:var(--ok-l);box-shadow:none"><b>📄 ' + nDoc + ' figure' + (nDoc > 1 ? 's' : '') + ' from your statement</b><p class="small" style="margin:4px 0 6px;color:var(--ink)">Statement figures are used ahead of anything typed. To use your own figures instead, remove the statement.</p><div class="row" style="gap:16px"><button class="link" data-a="docrep" data-p="' + S.fsec + '">Replace statement</button><button class="link" data-a="docrem" data-p="' + S.fsec + '">Remove statement</button></div></div>' : '';
  const body = mode === 'upload' ? uploadPick(sec) : docBar + '<div class="card">' + sec.f.filter(fieldVisible)""")
# ---- actions
R("  fchoice:p => { const [k, v] = p.split('|'); S.fin[k] = v; S.src[k] = 'typed'; delete S.look[k];", "  fchoice:p => { const [k, v] = p.split('|'); setManual(k, v, 'typed');")
R("  fest:p => { const d = FF[p]; S.fin[p] = val(d.est); S.src[p] = 'est'; delete S.look[p];", "  fest:p => { const d = FF[p]; setManual(p, val(d.est), 'est');")
R("  fnone:p => { S.fin[p] = 0; S.src[p] = 'none'; delete S.look[p];", "  fnone:p => { setManual(p, 0, 'none');")
R("  pstup:p => pstStart(DOCT[p] ? p : 'retire'), pstok:() => pstConfirm(),",
  """  pstup:p => pstStart(DOCT[p] ? p : 'retire'), pstok:() => pstConfirm(), pstrem:p => { pstRemove(p); toast('Statement removed. Your own figures are used again'); render(); },
  docrep:p => { S.fmode[FSEC[+p].id] = 'upload'; render(); },
  docrem:p => { const sec = FSEC[+p]; removeDoc(sec.f.concat(DOC_HIDDEN[sec.id] || [])); Object.keys(DOCT).forEach(c => { if (S.pdocs[c] && !Object.values(S.docOf || {}).includes('pst:' + c)) pstRemove(c); }); toast('Statement removed. Your own figures are used again'); render(); },""")
# input handler
R("""    if (d.type === 'text') S.fin[k] = i.value; else { const n = parseInt(i.value.replace(/[^\\d]/g, '')); if (isNaN(n)) { delete S.fin[k]; delete S.src[k]; } else { S.fin[k] = d.type === 'num' ? clamp(n, 0, 120) : n; } }
    if (S.fin[k] != null && S.fin[k] !== '') { S.src[k] = 'typed'; delete S.look[k]; }
    if (k === 'age' && S.fin.age >= 18) { S.about.age = S.fin.age; }
    if (k === 'retireAge' && S.fin.retireAge >= 50 && S.fin.retireAge <= 75) setRetireAge(S.fin.retireAge);
    const tg = document.getElementById('tag-' + k); if (tg) tg.innerHTML = tagFor(k); }));""",
"""    let nv; if (d.type === 'text') nv = i.value; else { const n = parseInt(i.value.replace(/[^\\d]/g, '')); nv = isNaN(n) ? null : d.type === 'num' ? clamp(n, 0, 120) : n; }
    const used = setManual(k, nv, 'typed');   // FP round 6: a statement figure is not overwritten; the entry is kept and shown
    if (used && k === 'age' && S.fin.age >= 18) { S.about.age = S.fin.age; }
    if (used && k === 'retireAge' && S.fin.retireAge >= 50 && S.fin.retireAge <= 75) setRetireAge(S.fin.retireAge);
    const tg = document.getElementById('tag-' + k); if (tg) tg.innerHTML = tagFor(k); const dn = document.getElementById('dn-' + k); if (dn) dn.innerHTML = docNote(k); }));""")
# plan upload confirm
R("""  secs.forEach(sid => { const U = UPL[sid]; Object.entries(U.v).forEach(([k, [v, c]]) => { let nv = u.edit[k] != null ? +u.edit[k] : v; const prev = S.fin[k];
    if (S.src[k] === 'typed' && typeof nv === 'number' && prev && Math.abs(prev - nv) / Math.max(prev, nv) > 0.1) S.look[k] = 'You typed ' + eur(prev) + ', the document says ' + eur(nv);
    else delete S.look[k];
    S.fin[k] = nv; S.src[k] = 'doc'; S.conf[k] = c; if (u.edit[k] != null && +u.edit[k] !== v) S.src[k] = 'typed'; });""",
"""  secs.forEach(sid => { const U = UPL[sid]; Object.entries(U.v).forEach(([k, [v, c]]) => { const fixed = u.edit[k] != null && +u.edit[k] !== v, nv = fixed ? +u.edit[k] : v;
    delete S.look[k]; setDoc(k, nv, c, fixed, 'upl:' + sid); });   // FP round 6: the document wins over a typed figure; a correction here is still the document
    Object.entries(U.hid || {}).forEach(([k, [v, c]]) => setDoc(k, v, c, false, 'upl:' + sid));""")
# Explore statement confirm
R("  const put = (k, x, cf) => { S.fin[k] = x; S.src[k] = cf == null ? 'typed' : 'doc'; if (cf != null) S.conf[k] = cf; else delete S.conf[k]; delete S.look[k]; };",
  "  const put = (k, x, cf) => { delete S.look[k]; setDoc(k, x, cf, cf == null, 'pst:' + u.cat); };   // FP round 6: corrected values stay statement figures")
R("""  Object.entries(pre).forEach(([id, vals]) => { const cc = C(id), cur = Object.assign({}, calcVals(cc)), ins = cc.inputs.concat(cc.wi || []); S.calcSrc[id] = [];
    Object.entries(vals).forEach(([k, x]) => { const i = ins.find(y => y.k === k); if (!i || x == null) return; cur[k] = +clamp(Math.round(x / i.step) * i.step, i.min, i.max).toFixed(3); if (!(vals._notag || []).includes(k)) S.calcSrc[id].push(k); }); S.calcV[id] = cur; });""",
"""  S.calcDoc = S.calcDoc || {}; S.calcT = S.calcT || {};
  Object.entries(pre).forEach(([id, vals]) => { const cc = C(id), ins = cc.inputs.concat(cc.wi || []), keep = {}; S.calcSrc[id] = []; S.calcT[id] = {};   // a new statement resets the tool to the statement
    Object.entries(vals).forEach(([k, x]) => { if (k === '_notag' || x == null || !ins.find(y => y.k === k)) return; keep[k] = x; if (!(vals._notag || []).includes(k)) S.calcSrc[id].push(k); }); S.calcDoc[id] = keep; calcVals(cc); });""")
R("""function pstStart(cat, files){""", """const DOC_HIDDEN = {liab:['mortRate'], pension:['penChg']};   // statement figures with no field of their own in Your finances
function pstRemove(cat){ const d = S.pdocs[cat]; if (!d) return; const ids = Object.keys(DOCT[cat].pre(d.v));
  removeDoc(Object.keys(S.docOf || {}).filter(k => S.docOf[k] === 'pst:' + cat)); delete S.pdocs[cat];
  ids.forEach(id => { if (S.calcDoc) delete S.calcDoc[id]; if (S.calcSrc) delete S.calcSrc[id]; if (S.calcT) delete S.calcT[id]; }); }
function pstStart(cat, files){""")
R("""    (d ? '<div class="mini" style="align-items:center"><span>✅ Uploaded: <b>' + esc(d.name) + ' · ' + esc(d.date) + '</b></span><button class="link" data-a="pstup" data-p="' + cat + '">Replace</button></div>' :""",
  """    (d ? '<div class="mini" style="align-items:center"><span>✅ Uploaded: <b>' + esc(d.name) + ' · ' + esc(d.date) + '</b></span><span class="row" style="gap:12px"><button class="link" data-a="pstup" data-p="' + cat + '">Replace statement</button><button class="link" data-a="pstrem" data-p="' + cat + '">Remove statement</button></span></div>' :""")
# feeds: hidden fields
R("feed(v, c, put){ put('home', 'Own with mortgage', 99); put('mortBal', v.bal, c.bal); put('mortPayM', v.pay, c.pay); put('mortYears', v.yrs, c.yrs);",
  "feed(v, c, put){ put('home', 'Own with mortgage', 99); put('mortBal', v.bal, c.bal); put('mortRate', v.rate, c.rate); put('mortPayM', v.pay, c.pay); put('mortYears', v.yrs, c.yrs);")
R("feed(v, c, put){ put('pension', v.pot, c.pot); put('pensionM', v.youM + v.empM, c.youM == null || c.empM == null ? null : Math.min(c.youM, c.empM)); put('sp', spFromYears(v.prsi), c.prsi);",
  "feed(v, c, put){ put('pension', v.pot, c.pot); put('pensionM', v.youM + v.empM, c.youM == null || c.empM == null ? null : Math.min(c.youM, c.empM)); put('sp', spFromYears(v.prsi), c.prsi); if (v.chg != null) put('penChg', v.chg, c.chg); else removeDoc(['penChg']);")
open(p,'w').write(s); print('ok')
