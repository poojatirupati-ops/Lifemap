(async () => {
  const z = await JSZip.loadAsync(fs.readFileSync(DOCX)); const secs = parseDoc(await z.file('word/document.xml').async('string'));
  const { browser, page, errors } = await open(); const D = require('./drive')(page);
  const R = { pass: 0, fail: [], perCalc: [], expectedDefects: [] };
  const ok = (cond, what) => { if (cond) R.pass++; else R.fail.push(what); return cond; };
  const fmtNum = v => typeof v === 'number' ? String(+v.toFixed(4)) : String(v);
  const calcs = await page.evaluate(() => CALCS.map(c => ({ id: c.id, cat: c.cat, name: c.name, q: c.q, tip: c.tip || null, inputs: c.inputs.concat(c.wi || []) })));
  const shared = secs.filter(s => /^(Purpose|1\.|2\.|3\.|Appendix A)/.test(s.title)).map(s => s.text).join(' ## ');
  const boxOf = f => f.kind === 'chip' ? f.box : F.boxText(f.pre, f.box, f.suf);
  for (const [n, c] of calcs.entries()) { const N = 'C' + String(n + 1).padStart(2, '0'), sec = secs.find(s => s.title === N + ' ' + c.name), f0 = R.fail.length, p0 = R.pass, X = XL[N];
    if (!ok(sec, N + ': section missing')) continue;
    const tbls = h => sec.blocks.filter(b => b.t === 'tbl' && b.h2 === N + ' ' + h), has = s => sec.text.includes(norm(s));
    const states = [['default', 'fresh'], ['chosen', 'chosen']]; if (INFL_ONLY.includes(c.id)) states.push(['noInfl', 'chosenNoInfl']);
    if (ADJ.includes(c.id)) { states.push(['adjUnset', 'chosenNoInfl', 'adj']); states.push(['adjSet', 'chosen', 'adj']); }
    states.push(['plan', 'sample']); if (STMT_FOR[c.id]) states.push(['stmt', 'stmt:' + STMT_FOR[c.id]]);
    const COL = { default: 'Default (nothing chosen)', chosen: 'Choices made', noInfl: 'No inflation yet', adjUnset: 'Switch on, no rate', adjSet: 'Switch on, 2%', plan: 'Plan pre-fill', stmt: 'Statement' };
    const [partsT, rowsT, phT] = tbls('Result card'); const ph = {}; phT.rows.slice(1).forEach(r => { ph[r[0].replace(/[{}]/g, '')] = TYPE_BY_NAME[r[1]]; });
    const lblT = partsT.rows.filter(r => r[0] === 'Label (eyebrow)').map(r => r[1]), valT = partsT.rows.filter(r => r[0] === 'Headline value').map(r => r[1]), lineT = partsT.rows.filter(r => r[0] === 'Line').map(r => r[1]);
    const rowSpecs = rowsT.rows.slice(1).map(r => ({ l: r[0], v: r[1].split(' / ').map(v => v.replace(/ \([^()]*(?:\([^()]*\)[^()]*)*\)$/, '')) }));
    const mt = (list, s) => list.some(t => compile(t, ph).test(norm(s)));
    const checkResult = (r, tag) => { ok(mt(lblT, r.lbl), N + ' ' + tag + ': label "' + r.lbl + '" matches no template'); ok(mt(valT, r.val), N + ' ' + tag + ': value "' + r.val + '" matches no template'); ok(mt(lineT, r.line), N + ' ' + tag + ': line "' + r.line + '" matches no template');
      r.rows.forEach(([a, b]) => ok(rowSpecs.some(rs => compile(rs.l, ph).test(norm(a)) && rs.v.some(v => compile(v, ph).test(norm(b)))), N + ' ' + tag + ': row "' + a + ' = ' + b + '" matches no template')); };
    const inTs = tbls('Inputs'), inT1 = inTs.find(t => t.rows[0][1] === 'Unit shown'), inT2 = inTs.find(t => t.rows[0][1] === 'Typed above max'); const valsT = tbls('Screen values in the screenshots')[0]; const head = valsT.rows[0];
    const vcell = (label, col) => { const ci = head.indexOf(col); const row = valsT.rows.find(r => r[0] === label); return ci < 0 || !row ? undefined : row[ci]; };
    const lineBullets = sec.blocks.filter(b => b.t === 'p' && b.h2 === N + ' Screen values in the screenshots').map(b => b.text);
    const wbT = tbls('Workbook sheet "' + X.sheet + '"'); const outT = wbT.find(t => t.rows[0][0] === 'Workbook output name');
    ok(wbT.length && sec.text.includes('sheet "' + X.sheet + '"'), N + ': workbook sheet pointer "' + X.sheet + '"');
    const choiceT = sec.blocks.find(b => b.t === 'tbl' && b.h2 === N + ' Inputs' && b.rows[0][0] === 'Label' && b.rows[0][2] === 'Guidance under the input'), asmT = sec.blocks.find(b => b.t === 'tbl' && b.rows[0][0] === 'Plan-wide input (Your assumptions)');
    for (const [key, b, act] of states) { await D.base(b); await D.calc(c.id, /^chosen/.test(b)); if (act === 'adj') await page.click('[data-a="adjinfl"]');
      const d = await page.evaluate(extract), col = COL[key], nm = (await D.num(c.id)).num || {}; const R0 = d.result || { lbl: d.gate.eyebrow, val: d.gate.b, line: d.gate.also || '', rows: [] };
      if (key === 'plan' && head.indexOf(col) < 0) { await D.base('chosen'); await D.calc(c.id, true); const d0 = await page.evaluate(extract); ok(d.fields.every((f, i) => f.box === d0.fields[i].box), N + ' plan: inputs differ but no plan screenshot'); continue; }
      ok(head.indexOf(col) >= 0, N + ' ' + key + ': no column "' + col + '"');
      // workbook alignment: every output name the screen computes is a defined name in the sheet
      const xn = new Set([...X.results, ...X.plan, ...X.inputs].map(r => r.name)); Object.keys(nm).forEach(k => ok(xn.has(k), N + ' ' + key + ': output ' + k + ' not a workbook name'));
      if (key === 'chosen' || key === 'noInfl') { const ci = key === 'chosen' ? 2 : 3; outT.rows.slice(1).forEach(r => ok(r[ci] === fmtNum(nm[r[0]]), N + ' ' + key + ': workbook value ' + r[0] + ' doc "' + r[ci] + '" vs live "' + fmtNum(nm[r[0]]) + '"')); ok(outT.rows.length - 1 === X.results.concat(X.plan).filter(r => r.name in nm).length, N + ': workbook output table complete'); }
      if (key === 'default') { if (d.gate) ok(has(d.gate.b) && sec.text.includes(d.gate.b + (d.gate.also ? ' · ' + d.gate.also : '')), N + ': gate text "' + d.gate.b + '"'); else ok(has('No gate: the result shows straight away'), N + ': no-gate note');
        for (const f of d.fields.filter(f => f.guide || f.look)) { const r = choiceT && choiceT.rows.find(x => x[0] === f.label); ok(r && r[2] === (f.guide || '—') && r[3] === (f.stdChip || '—'), N + ': choice row "' + f.label + '"'); }
        if (d.calcAsm) { ok(sec.text.includes(d.calcAsm.summary) && sec.text.includes(d.calcAsm.note), N + ': assumptions card summary/note'); d.calcAsm.fields.forEach(f => { const r = asmT && asmT.rows.find(x => x[0] === f.label); ok(r && r[1] === (f.guide || '—') && r[2] === (f.std || '—'), N + ': tool assumption "' + f.label + '"'); }); }
        for (const f of d.fields) { const r1 = inT1.rows.find(r => r[0].replace(/^\[What if\] /, '') === f.label); const exp = f.look && !f.box ? 'blank · ' + f.look : boxOf(f); ok(r1 && r1[3].replace(/ ⚠$/, '') === exp, N + ' ' + f.label + ': on-screen default "' + (r1 && r1[3]) + '" vs "' + exp + '"'); }
        ok(has(d.title), N + ': title "' + d.title + '"'); ok(norm(d.sub) === norm(c.q) && has(c.q), N + ': question'); if (d.tip) ok(has(d.tip), N + ': tip "' + d.tip + '"'); else ok(!c.tip, N + ': tip missing');
        ok(has(d.eyebrow), N + ': eyebrow'); ok(shared.includes(d.back), N + ': back'); ok(has(d.disc), N + ': disclaimer'); d.buttons.forEach(bt => ok(has(bt.t) || shared.includes(bt.t), N + ': button "' + bt.t + '"'));
        if (d.whatIfTitle) ok(shared.includes(d.whatIfTitle), N + ': what-if title'); if (d.adj) { ok(shared.includes(d.adj.text) && shared.includes(d.adj.help), N + ': switch strings'); ok(d.adj.role === 'switch' && d.adj.checked === 'false', N + ': switch default off'); }
        if (d.infl) { ok(shared.includes(d.infl.title) && shared.includes(d.infl.help), N + ': inflation title/help'); d.infl.chips.forEach(ch => ok(shared.includes(ch.t) && ch.pressed === 'false', N + ': chip "' + ch.t + '" (unpressed)')); }
        }
      if (key === 'chosen') { for (const f of d.fields) { const i = c.inputs.find(x => x.k === f.k), r1 = inT1.rows.find(r => r[0].replace(/^\[What if\] /, '') === f.label), r2 = inT2.rows.find(r => r[0] === f.label);
          if (!ok(r1 && r2, N + ': input "' + f.label + '" not in inputs tables')) continue;
          ok(f.labelledby === f.lid, N + ' ' + f.label + ': control not labelled by its label');
          if (f.kind === 'chip') { ok(r1[1] === 'Chips: ' + f.chips.map(x => '"' + x.t + '"').join(' / ') && r1[1] === F.unitDisplay(i.u), N + ' ' + f.label + ': chips ' + r1[1]); ok(r1[2] === F.chipLabel(i.u, i.v), N + ' ' + f.label + ': CALCS default chip');  ok(f.role === 'group', N + ' ' + f.label + ': chip group role'); ok(r1[4] === '—' && r1[7] === 'tap (chips)' && r2[1] === 'Not possible (chips)', N + ' ' + f.label + ': chip limits'); continue; }
          ok(r1[1] === F.unitDisplay(i.u) && F.PARTS[i.u][0] === f.pre && F.PARTS[i.u][1] === f.suf, N + ' ' + f.label + ': unit ' + r1[1] + ' vs DOM "' + f.pre + '"/"' + f.suf + '"');
          ok(r1[2] === F.boxText(F.PARTS[i.u][0], F.nbFmt(i.v), F.PARTS[i.u][1]), N + ' ' + f.label + ': CALCS default');
          ok(f.valuetext && f.valuetext.length > 0, N + ' ' + f.label + ': slider aria-valuetext');
          ok(r1[4] === F.nbFmt(+f.min) && r1[5] === F.nbFmt(+f.max) && r1[6] === F.nbFmt(+f.step), N + ' ' + f.label + ': min/max/step ' + r1.slice(4, 7) + ' vs ' + [f.min, f.max, f.step]);
          ok(r1[7] === f.inputmode, N + ' ' + f.label + ': keyboard'); } }
      for (const f of d.fields) { const exp = (f.look && !f.box ? 'blank · ' + f.look : boxOf(f)) + (f.tag ? ' ★' : ''); ok(vcell(f.label, col) === exp, N + ' ' + key + ': "' + f.label + '" doc "' + vcell(f.label, col) + '" vs screen "' + exp + '"'); if (f.tag) ok(f.tag === 'From your statement' && shared.includes(f.tag), N + ': tag'); }
      ok(vcell('Result label', col) === R0.lbl, N + ' ' + key + ': result label'); ok(vcell('Headline value', col) === R0.val, N + ' ' + key + ': headline "' + R0.val + '"');
      R0.rows.forEach(([a, bb]) => ok(vcell('Row: ' + a, col) === bb, N + ' ' + key + ': row "' + a + '" doc "' + vcell('Row: ' + a, col) + '" vs "' + bb + '"'));
      ok(vcell('Inflation line', col) === (d.inflNote || '—'), N + ' ' + key + ': inflation line');
      ok(lineBullets.includes(col + ': ' + (R0.line || '(none)')), N + ' ' + key + ': verbatim line missing: ' + R0.line);
      if (d.result) checkResult(d.result, key); }
    for (const e of EDGES[c.id] || []) { const eb = e.base || 'chosen'; await D.base(eb); await D.calc(c.id, eb === 'chosen'); for (const [k, v] of Object.entries(e.set)) await D.set(k, v); const d = await page.evaluate(extract);
      const ets = sec.blocks.filter(b => b.t === 'tbl' && b.rows.some(r => r[0] === 'Line' && r[1] === d.result.line) && b.rows.some(r => r[0] === 'Headline value' && r[1] === d.result.val));
      ok(ets.some(et => d.result.rows.every(([a, bb]) => et.rows.some(r => r[0] === 'Row: ' + a && r[1] === bb)) && et.rows.some(r => r[0] === 'Label' && r[1] === d.result.lbl)), N + ' edge "' + e.t + '": result not in doc ' + JSON.stringify(d.result));
      checkResult(d.result, 'edge "' + e.t + '"'); }
    for (const i of c.inputs) { const r2 = inT2.rows.find(r => r[0] === i.l);
      if (F.CHIPS[i.u]) { for (const [v, l] of F.CHIPS[i.u]) { await D.base('chosen'); await D.calc(c.id, true); await D.set(i.k, v); const pr = await page.evaluate(([k, v]) => { const b = document.querySelector('[data-a="ckset"][data-p="' + k + '|' + v + '"]'); return [b.getAttribute('aria-pressed'), b.textContent.trim()]; }, [i.k, v]); ok(pr[0] === 'true' && pr[1] === l, N + ' ' + i.l + ': chip "' + l + '" selects'); const d = await page.evaluate(extract); checkResult(d.result, 'chip ' + l); } continue; }
      if (['y', 'm', 'age'].includes(i.u) && i.step % 1 === 0) { await D.base('chosen'); await D.calc(c.id, true); const dv = Math.min(i.max, i.min + 1) - 0.5; await D.set(i.k, dv); const hv = await page.evaluate(k => [document.getElementById('nh-ck-' + k).textContent, document.getElementById('co-' + k).value], i.k); ok(hv[0] === 'Whole numbers only' && hv[1] === String(Math.round(dv)) && r2[1].includes('hint "Whole numbers only"'), N + ' ' + i.l + ': whole numbers only (' + hv + ')'); }
      for (const [dir, v] of [['max', i.u === '€' ? i.max * 10 + 1000 : i.max + 1], ['min', i.min - 1]]) { await D.base('chosen'); await D.calc(c.id, true); await D.set(i.k, v);
        const hv = await page.evaluate(k => [document.getElementById('nh-ck-' + k).textContent, document.getElementById('co-' + k).value], i.k), cellTxt = dir === 'max' ? r2[1] : r2[2];
        ok(hv[0] !== '' && cellTxt.includes('hint "' + hv[0] + '"'), N + ' ' + i.l + ' ' + dir + ' hint "' + hv[0] + '" not in "' + cellTxt + '"');
        ok(hv[1] === F.nbFmt(dir === 'max' ? (i.u === '€' ? i.max * 10 : i.max) : i.min), N + ' ' + i.l + ' ' + dir + ' clamp ' + hv[1]); checkResult((await page.evaluate(extract)).result, i.l + ' ' + dir); }
      if (i.u === '€') { await D.base('chosen'); await D.calc(c.id, true); const w = Math.round(i.max * 1.5); await D.set(i.k, w); const hv = await page.evaluate(k => [document.getElementById('nh-ck-' + k).textContent, document.getElementById('c-' + k).max], i.k); ok(hv[0] === '' && +hv[1] === w, N + ' ' + i.l + ': € widen'); } }
    R.perCalc.push([N, c.name, R.pass - p0, R.fail.length - f0]); console.log(N, R.pass - p0, 'passed', R.fail.length - f0, 'failed'); }
  // ---------- Inflation chips, rules, Your assumptions ----------
  const s1 = secs.find(s => s.title === '1. Design system').text, s3 = secs.find(s => s.title === '3. Rules and Your assumptions'), p1 = R.pass, f1 = R.fail.length;
  await D.base('chosenNoInfl'); await D.calc('compound', true); const iu = await page.evaluate(() => { const ic = document.querySelector('.infl'), t = e => e.textContent.replace(/\s+/g, ' ').trim(); return { title: t(ic.querySelector('b')), tag: t(ic.querySelector('.tag')), help: t(ic.querySelector('p.small')), chips: [...ic.querySelectorAll('.chip')].map(c => [t(c), c.getAttribute('aria-pressed'), c.dataset.p]) }; });
  ok(s1.includes(iu.title) && s1.includes(iu.help) && iu.tag === 'Not chosen yet', 'Inflation chips: title, tag, help'); iu.chips.forEach(ch => ok(s1.includes(ch[0]) && ch[1] === 'false', 'Inflation state 1: "' + ch[0] + '" unpressed'));
  ok(/3\.9% a year right now \(CSO HICP flash, Sep 2026\)/.test(iu.help) && iu.chips[1][0] === '3.9% · Ireland now (CSO HICP flash, Sep 2026)' && iu.chips[0][0] === 'Use the standard (2%)', 'Inflation: one "Ireland today" figure 3.9% (CSO HICP flash, Sep 2026); standard chip');
  await page.click('[data-a="infl"][data-p="' + iu.chips[0][2] + '"]'); const col = await page.evaluate(() => ({ card: !!document.querySelector('.infl'), note: (([...document.querySelectorAll('#main p.small')].find(p => /Prices rising/.test(p.textContent)) || {}).textContent || '').replace(/\s+/g, ' ').trim() }));
  ok(!col.card && s1.includes(col.note), 'Inflation state 2: card closes, line "' + col.note + '"');
  await page.click('[data-a="infledit"]'); ok(await page.evaluate(() => document.querySelector('[data-a="infl"]').getAttribute('aria-pressed') === 'true' && document.querySelector('.infl .tag').textContent === 'Your choice'), 'Inflation state 2: chosen chip pressed, tag "Your choice"');
  await page.click('[data-a="infl"][data-p="other"]'); const oth = await page.evaluate(() => ({ card: !!document.querySelector('.infl'), l: (document.querySelector('.infl .flabel span') || {}).textContent, p: (document.querySelector('[data-a="infl"][data-p="other"]') || {}).getAttribute && document.querySelector('[data-a="infl"][data-p="other"]').getAttribute('aria-pressed') }));
  ok(oth.card && oth.p === 'true' && s1.includes(oth.l), 'Inflation state 3: Other keeps the card open with "' + oth.l + '"');
  const rv = await page.evaluate(() => RULES_VERSION); ok(rv === 'Irish rules 2026 · checked 2 Oct 2026' && s3.text.includes(rv) && s3.text.includes('Budget 2027') && s3.text.includes('6 October 2026'), 'Rules version note');
  const rules = await page.evaluate(() => { const out = []; const walk = (o, p) => Object.entries(o).forEach(([k, x]) => { if (x && typeof x === 'object' && 'v' in x && 'src' in x) out.push([p + k, x.eff]); else walk(x, p + k + '.'); }); walk(RULES_IE_2026, ''); return out; });
  const regT = s3.blocks.find(b => b.t === 'tbl' && b.rows[0][0] === 'Key'); rules.forEach(([k, eff]) => ok(regT.rows.some(r => r[0] === k && r[2] === eff), 'Register row ' + k));
  const T = s3.blocks.filter(b => b.t === 'tbl' && b.rows[0][0] === 'Code').flatMap(b => b.rows), tyOf = await page.evaluate(() => Object.fromEntries(Object.entries(ASM).map(([k, d]) => [k, d.ty === 2 ? '2 · Usual range' : d.own ? '3 · Choose yourself' : '3 · Personal choice'])));
  for (const [g] of await page.evaluate(() => ASM_GRP)) { await page.evaluate(g => { S = fresh(); S.shell = true; S.tab = 'me'; S.me = 'asm'; S.asmOpen = g; lastId = null; render(); }, g);
    const A = await page.evaluate(extractAsm), G = A.groups[0]; ok(s3.text.includes(G.title), 'Assumptions group "' + G.title + '"');
    if (A.top) ok(s3.text.includes(A.top.p) && s3.text.includes(A.top.btn) && s3.text.includes(A.top.note), 'Assumptions top card');
    for (const f of G.fields) { const r = T.find(x => x[1] === f.label); if (!ok(r, 'Assumptions: "' + f.label + '" not in doc')) continue;
      ok(r[6].startsWith((f.guide || '—') + ' · ' + (f.std ? 'Chip "' + f.std + '"' : 'No standard chip')), 'Assumptions ' + f.k + ': guidance and standard chip');
      ok(f.tag === 'Not chosen yet' || f.tag == null, 'Assumptions ' + f.k + ': blank by default (tag "' + f.tag + '")'); if (f.box) ok(f.box.val === '', 'Assumptions ' + f.k + ': empty box');
      if (tyOf[f.k]) ok(r[2] === tyOf[f.k], 'Assumptions ' + f.k + ': type ' + r[2]);
      if (f.chips.length) ok(r[3] === 'Chips' && r[4] === f.chips.map(x => '"' + x.t + '"').join(' / ') && f.chips.every(x => x.pressed === 'false'), 'Assumptions ' + f.k + ': chips, none pressed'); } }
  await page.evaluate(() => { S = fresh(); S.shell = true; S.tab = 'me'; S.me = 'asm'; S.asmOpen = 'law'; lastId = null; render(); }); const LW = (await page.evaluate(extractAsm)).groups[0].law, lawT = s3.blocks.find(b => b.t === 'tbl' && b.rows[0][0] === 'Row' && b.rows[0][1] === 'Value shown (verbatim)');
  LW.rows.forEach(([a, b]) => ok(lawT && lawT.rows.some(r => r[0] === a && r[1] === b), 'Set by Government row "' + a + '"')); ok(s3.text.includes(LW.note), 'Set by Government note');
  await page.evaluate(() => { S = fresh(); S.shell = true; S.tab = 'me'; S.me = 'asm'; S.asmOpen = 'prices'; lastId = null; render(); }); await page.click('[data-a="useall"]');
  const ua = await page.evaluate(() => ({ t: document.getElementById('toast').innerText.replace(/\W+/, '').trim(), retire: S.retireSet, planEnd: asmMine('planEnd'), infl: S.infl, left: planMissing().map(m => m.k) }));
  ok(ua.retire === false && ua.planEnd === false && ua.infl === 0.02 && s3.text.includes(ua.t), '"Use the standard for all" never sets retirement or plan-until age (' + JSON.stringify(ua) + ')');
  await page.evaluate(() => { loadSample(); S.asm = {}; S.infl = null; S.retireSet = false; S.app = false; S.shell = true; S.pb = true; S.tab = 'plan'; S.scr = 'P4'; lastId = null; render(); });
  const st7 = await page.evaluate(() => ({ h: document.querySelector('#p4-asm h3').textContent, p: document.querySelector('#p4-asm h3 + p').textContent, need: (document.getElementById('p4-need') || {}).textContent, dis: document.getElementById('seeres').disabled }));
  ok(s3.text.includes(st7.h) && s3.text.includes(st7.p) && s3.text.includes(st7.need) && st7.dis, 'Step 7 "Your assumptions" card');
  await page.evaluate(() => { loadSample(); S.sheet = 'assume'; render(); }); const AR = await page.evaluate(() => { const t = e => e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; return [...document.querySelectorAll('.sheet .mini')].map(m => { const sp = m.querySelector('span'), tg = sp && sp.querySelector('.tag'), c = sp ? sp.cloneNode(true) : null; if (c) [...c.querySelectorAll('.tag')].forEach(x => x.remove()); return [t(c), tg ? t(tg) : '', t(m.querySelector('b'))]; }); });
  const asT = s3.blocks.find(b => b.t === 'tbl' && b.rows[0][0] === 'Row' && b.rows[0][1] === 'Tag (type)'); AR.forEach(r => ok(asT && asT.rows.some(x => x[0] === r[0] && x[1] === r[1] && x[2] === r[2]), 'What your plan assumes: "' + r[0] + '"'));
  ok(AR.some(r => r[1] === 'Set by Government · 2026') && AR.some(r => /^Usually /.test(r[1])) && AR.some(r => r[1] === 'Your choice'), 'What your plan assumes: three type tags');
  R.perCalc.push(['Components', 'Inflation chips, rules register, Your assumptions', R.pass - p1, R.fail.length - f1]);
  // ---------- Explore structure, statement cards, sheets ----------
  const s2 = secs.find(s => s.title === '2. Explore structure').text, p0 = R.pass, f0 = R.fail.length;
  const x = await page.evaluate(() => ({ cats: CATS.map(c => ({ name: c.name, blurb: c.blurb, n: CALCS.filter(x => x.cat === c.id).length })), topics: TOPICS, tt: TOPIC_TOOLS, doct: Object.keys(DOCT) }));
  await D.base('fresh'); const xp = await page.evaluate(() => document.getElementById('main').innerText);
  x.cats.forEach(c => ok(s2.includes(c.name) && s2.includes(c.blurb) && s2.includes(c.n + ' tools') && xp.includes(c.n + ' tools'), 'Explore group ' + c.name));
  for (const t of x.topics) { ok(s2.includes(t[1]) && s2.includes(t[2]) && xp.includes(t[2]), 'Topic ' + t[1]); await D.base('fresh'); await page.evaluate(p => ACT.topic(p), t[1]); const tx = await page.evaluate(() => [...document.querySelectorAll('#main .link')].map(l => l.textContent.trim()));
    tx.filter(l => !/Remind me/.test(l)).forEach(l => ok(s2.includes(norm(l)), 'Topic ' + t[1] + ' link "' + l + '"')); ok(s2.includes(x.tt[t[1]].map(id => { const i = calcs.findIndex(c => c.id === id); return 'C' + String(i + 1).padStart(2, '0') + ' ' + calcs[i].name; }).join('; ')), 'Topic ' + t[1] + ' calculators'); }
  for (const k of x.doct) { await D.base('fresh'); await page.evaluate(k => ACT.cat(k), k); const card = await page.evaluate(() => [...document.querySelectorAll('.card.pst b, .card.pst p, .card.pst label, .card.pst button')].map(e => e.textContent.replace(/\s+/g, ' ').trim()));
    card.forEach(t => ok(s2.includes(norm(t)) || s2.includes(norm(t.replace(/^We can read: /, '').replace(/\.$/, ''))), 'Statement card ' + k + ': "' + t + '"'));
    await D.base('sample'); await page.evaluate(k => { const T = DOCT[k]; S.pst = { cat: k, stage: 'confirm', files: [T.title + ' · ' + T.date + '.pdf'], edit: {} }; S.xs.push({ v: 'PST' }); lastId = null; render(); }, k);
    const rows = await page.evaluate(() => [...document.querySelectorAll('#main .mini')].map(m => ({ l: (m.querySelector('b') || {}).textContent, tag: (m.querySelector('.tag') || {}).textContent || '', v: (m.querySelector('input') || {}).value })));
    rows.filter(r => r.l && r.v != null).forEach(r => ok(s2.includes(r.l) && s2.includes(r.tag) && s2.includes('| ' + r.v + ' |'), 'Confirm ' + k + ': "' + r.l + '" ' + r.tag + ' ' + r.v)); }
  for (const [id, b] of [['borrow','chosen'], ['compound','chosenNoInfl'], ['compound','chosen'], ['overpay','chosen'], ['emergency','chosen'], ['retirement','chosen'], ['contrib','chosen'], ['lifecover','chosen'], ['incomegap','chosen'], ['ratechange','chosen'], ['debtpay','chosen']]) {
    await D.base(b); await D.calc(id, true); await page.click('[data-a="calcadd"]'); const t = await page.evaluate(() => [...document.querySelectorAll('.sheet .eyebrow, .sheet h2, .sheet p.sub, .sheet .btn')].map(e => e.textContent.replace(/\s+/g, ' ').trim()));
    ok(s2.includes(t.join(' | ')), 'Add sheet ' + id + ' (' + b + '): "' + t.join(' | ') + '"'); }
  R.perCalc.push(['Explore', 'Explore structure, statement cards, Add to my plan sheets', R.pass - p0, R.fail.length - f0]);
  // ---------- §15 Your finances and §16 LifeMap (independent: re-driven live, compared with the docx) ----------
  { const s4 = secs.find(s => s.title === '4. Your finances: "Not sure? See an example"'), s5 = secs.find(s => s.title === '5. LifeMap name and cover'), p4 = R.pass, f4 = R.fail.length;
    if (ok(s4 && s5, 'sections 4 and 5 present')) {
    const cardT = s4.blocks.filter(b => b.t === 'tbl' && b.rows[0][0] === 'Card title').flatMap(b => b.rows.slice(1));
    const keys = await page.evaluate(() => Object.keys(EXAMPLES)); ok(cardT.length === keys.length, 'card table has ' + cardT.length + ' rows for ' + keys.length + ' cards');
    for (const k of keys) { await page.evaluate(k => { loadSample(); if (k === 'ae') { delete S.fin.pensionM; delete S.src.pensionM; delete S.fin.pensionOwnM; delete S.src.pensionOwnM; } lastId = null; render(); openSec(FSEC.findIndex(s => s.f.includes(k))); }, k);
      const before = await page.evaluate(k => JSON.stringify([S.fin[k], S.src[k]]), k); const link = page.locator('[data-a="fex"][data-p="' + k + '"]');
      if (!ok(await link.count() === 1 && norm(await link.textContent()) === 'Not sure? See an example', 'card ' + k + ': link')) continue; await link.click();
      const c = await page.evaluate(() => { const sh = document.querySelector('.sheet'), t = e => e ? e.textContent.replace(/\s+/g, ' ').trim() : null, ps = [...sh.querySelectorAll(':scope > p')];
        return { title: t(sh.querySelector('#ex-t')), opts: [...sh.querySelectorAll('ul li')].map(li => t(li).replace(/: /, ': ')).join(' · ') || '—', sentence: t(sh.querySelector('#ex-s')), where: t(ps.find(p => /Where to find yours/.test(p.textContent))).replace(/^📍 Where to find yours: /, ''), zero: ps.some(p => /Nothing to add\? Enter 0\./.test(p.textContent)) ? 'Yes' : '—', small: t(ps.find(p => /Example only/.test(p.textContent))), btn: t(sh.querySelector('.btn')), role: sh.getAttribute('role'), lb: sh.getAttribute('aria-labelledby'), db: sh.getAttribute('aria-describedby') }; });
      const r = cardT.find(x => x[0] === c.title);
      ok(r && r[1] === c.opts && r[2] === c.sentence && r[3] === c.where && r[4] === c.zero, 'card ' + k + ': doc row ' + JSON.stringify(r) + ' vs live ' + JSON.stringify([c.title, c.opts, c.sentence, c.where, c.zero]));
      ok(s4.text.includes(c.small) && s4.text.includes('"' + c.btn + '"') && c.role === 'dialog' && c.lb === 'ex-t' && c.db === 'ex-s', 'card ' + k + ': small print, button, dialog semantics');
      await page.keyboard.press('Escape'); const after = await page.evaluate(k => JSON.stringify([S.fin[k], S.src[k], !!document.querySelector('.sheet'), document.activeElement.dataset.p]), k);
      ok(after === JSON.stringify(JSON.parse(before).concat([false, k])), 'card ' + k + ': Escape closes, focus back on the link, field unchanged'); }
    const tg = await page.evaluate(() => { const r = []; const t = h => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent; }; S.src.zz = 'doc'; S.conf.zz = 95; r.push(t(tagFor('zz'))); S.fix.zz = 1; r.push(t(tagFor('zz'))); delete S.fix.zz; S.src.zz = 'typed'; r.push(t(tagFor('zz'))); S.src.zz = 'pre'; r.push(t(tagFor('zz'))); delete S.src.zz; r.push(t(tagFor('zz'))); S.look.zz = 'x'; r.push(t(tagFor('zz'))); delete S.look.zz; return r; });
    const stT = s4.blocks.find(b => b.t === 'tbl' && b.rows[0][0] === 'Tag (verbatim)'); tg.forEach(x => ok(stT && stT.rows.some(r => r[0] === x), 'status tag "' + x + '"'));
    ok(!/≈ Estimated|Confirmed none/.test(await page.evaluate(() => document.documentElement.innerHTML.replace(/<script[\s\S]*?<\/script>/g, ''))), 'no removed statuses on screen');
    await page.evaluate(() => { loadSample(); delete S.fin.mortPayM; delete S.src.mortPayM; delete S.fin.ip; delete S.src.ip; S.look.homeValue = 'This looks high for the area'; S.app = false; S.pb = true; S.tab = 'plan'; S.scr = 'P4'; S.checked = false; lastId = null; render(); });
    const ck = await page.evaluate(() => [...document.querySelectorAll('#main .ck')].map(c => { const t = e => e ? e.textContent.replace(/\s+/g, ' ').trim() : null; return [t(c.querySelector('.i')), t(c.querySelector('b')), t(c.querySelector(':scope > div > div.small'))]; }));
    const ckT = s4.blocks.find(b => b.t === 'tbl' && b.rows[0][0] === 'Icon'); ck.forEach(r => ok(ckT && ckT.rows.some(x => x[0] === r[0] && x[1] === r[1] && x[3] === r[2]), 'checklist row "' + r[1] + '"'));
    ok(ck.every(r => ['⚠️', '❓'].includes(r[0])), 'checklist only ⚠️ / ❓');
    for (const id of ['repayment', 'overpay', 'ratechange', 'term', 'mortgageprotect']) { await page.evaluate(id => { loadSample(); delete S.fin.mortYears; delete S.src.mortYears; delete S.conf.mortYears; S.tab = 'explore'; S.xs = []; lastId = null; render(); ACT.calc(id); }, id); const g = await page.evaluate(() => ({ b: document.querySelector('#cgate b').textContent, f: (document.querySelector('.field .tag.look') || {}).textContent }));
      const N = 'C' + String(calcs.findIndex(c => c.id === id) + 1).padStart(2, '0'), sec = secs.find(s => s.title.startsWith(N + ' '));
      ok(/^Add .+ to see this$/.test(g.b) && s4.text.includes(g.b) && sec.text.includes(g.b), N + ': missing years gate "' + g.b + '" in 4.7 and the calculator section'); }
    for (const [id, del] of [['surplus', ['mortPayM', 'cardPayM']], ['debtpay', ['cardPayM']]]) { await page.evaluate(([id, del]) => { loadSample(); del.forEach(k => { delete S.fin[k]; delete S.src[k]; delete S.conf[k]; }); S.tab = 'explore'; S.xs = []; lastId = null; render(); ACT.calc(id); }, [id, del]);
      const w = await page.evaluate(() => [...document.querySelectorAll('#main .field')].filter(f => f.querySelector('.tag.pre')).map(f => [f.querySelector('.tag.pre').textContent, [...f.querySelectorAll(':scope > span.small')].map(x => x.textContent).join(' ')]));
      const N = 'C' + String(calcs.findIndex(c => c.id === id) + 1).padStart(2, '0'), sec = secs.find(s => s.title.startsWith(N + ' '));
      ok(w.length > 0, N + ': worked-out tag shown'); w.forEach(([tag, line]) => ok(tag === 'Worked out from your figures' && s4.text.includes(norm(line)) && sec.text.includes(norm(line)), N + ': worked-out line "' + line + '"')); }
    // §16
    await page.evaluate(() => { S = fresh(); lastId = null; render(); });
    const cv = await page.evaluate(() => ({ els: [...document.querySelectorAll('.cover .brand, .cover-inv, .cover h2, .cover-line, .cover .wbtn, .cover-under, .cover .link')].map(e => e.textContent.trim()), all: document.querySelector('.cover').innerText.replace(/\s+/g, ' ').trim(), title: document.title }));
    const cvT = s5.blocks.find(b => b.t === 'tbl' && b.rows[0][0] === 'Part');
    cv.els.forEach(t => ok(cvT && cvT.rows.some(r => r[1] === t || r[1].startsWith(t + ' (') || r[1].startsWith('"' + t + '"')), 'cover text "' + t + '" in 5.1'));
    ok(cv.all === cv.els.join(' '), 'cover shows only the agreed copy'); ok(!/Guidance, not advice|Free · About a minute/.test(cv.all), 'no trust line or disclaimer on the cover');
    ok(secs.find(s => s.title === 'Appendix A. Copy deck').text.includes(cv.els.join(' · ')), 'cover strings in Appendix A');
    await page.evaluate(() => { S = fresh(); S.scr = 'D5'; S.di = 3; lastId = null; render(); }); const q8 = await page.evaluate(() => [document.querySelector('#screen h2').textContent, document.querySelector('.qsub').textContent].concat([...document.querySelectorAll('.opt')].map(e => e.querySelector('.em').textContent + ' ' + e.querySelector('.tx').textContent + ' (' + e.querySelector('.otag').textContent.replace(/^◆ /, '') + ')')));
    q8.forEach(t => ok(s5.text.includes(t), 'Q8 "' + t + '"'));
    await page.evaluate(() => { S = fresh(); S.shell = true; S.pb = true; S.tab = 'plan'; S.scr = 'F1'; lastId = null; render(); }); const tile = await page.evaluate(() => document.querySelector('.gtile[data-p="safety"] .nm').textContent); ok(tile === 'Emergency fund' && s5.text.includes('🪂 ' + tile), 'goal tile "' + tile + '"');
    await page.evaluate(() => { S = fresh(); S.scr = 'D1'; lastId = null; render(); }); const d1 = await page.evaluate(() => document.querySelector('#screen h2').textContent); ok(s5.text.includes(d1), 'D1 title "' + d1 + '"');
    const all = secs.map(s => s.title + ' ' + s.text).join(' '), stray = (all.match(/LifeGoals(?!-Customer-Journey-Prototype\.html|-Calculators\.xlsx|-Calculators-UIUX-Spec)[^ ]{0,20}/g) || []).filter(x => !/^LifeGoals" for now/.test(x));
    ok(stray.length === 0, 'no customer-facing "LifeGoals" in the docx: ' + stray.slice(0, 5).join(', '));
    ok(!/Start · about 1 min|Your life\. Your plan\.|Pick a forecast|Build a safety net"? ?\(C|≈ Estimated ·|Also still to choose:/.test(all), 'no old wording in the docx'); }
    R.perCalc.push(['§15 / §16', 'Example cards, statuses, checklist, gaps in calculators; LifeMap cover, Q8, tile', R.pass - p4, R.fail.length - f4]); }
  R.errors = errors; await browser.close();
  fs.writeFileSync(path.join(__dirname, process.env.DOCX ? 'check-mut.json' : 'check.json'), JSON.stringify(R, null, 1));
  console.log('PASS', R.pass, 'FAIL', R.fail.length, 'console errors', errors.length); R.fail.slice(0, 80).forEach(f => console.log(' -', f));
})();
