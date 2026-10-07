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
    const states = [['default', 'fresh']]; if (INFL_ONLY.includes(c.id)) states.push(['infl', 'freshInfl']);
    if (ADJ.includes(c.id)) { states.push(['adjUnset', 'fresh', 'adj']); states.push(['adjSet', 'freshInfl', 'adj']); }
    states.push(['plan', 'sample']); if (STMT_FOR[c.id]) states.push(['stmt', 'stmt:' + STMT_FOR[c.id]]);
    const COL = { default: 'Default', infl: 'Inflation 2%', adjUnset: 'Switch on, no rate', adjSet: 'Switch on, 2%', plan: 'Plan pre-fill', stmt: 'Statement' };
    const [partsT, rowsT, phT] = tbls('Result card'); const ph = {}; phT.rows.slice(1).forEach(r => { ph[r[0].replace(/[{}]/g, '')] = TYPE_BY_NAME[r[1]]; });
    const lblT = partsT.rows.filter(r => r[0] === 'Label (eyebrow)').map(r => r[1]), valT = partsT.rows.filter(r => r[0] === 'Headline value').map(r => r[1]), lineT = partsT.rows.filter(r => r[0] === 'Line').map(r => r[1]);
    const rowSpecs = rowsT.rows.slice(1).map(r => ({ l: r[0], v: r[1].split(' / ').map(v => v.replace(/ \([^()]*(?:\([^()]*\)[^()]*)*\)$/, '')) }));
    const mt = (list, s) => list.some(t => compile(t, ph).test(norm(s)));
    const checkResult = (r, tag) => { ok(mt(lblT, r.lbl), N + ' ' + tag + ': label "' + r.lbl + '" matches no template'); ok(mt(valT, r.val), N + ' ' + tag + ': value "' + r.val + '" matches no template'); ok(mt(lineT, r.line), N + ' ' + tag + ': line "' + r.line + '" matches no template');
      r.rows.forEach(([a, b]) => ok(rowSpecs.some(rs => compile(rs.l, ph).test(norm(a)) && rs.v.some(v => compile(v, ph).test(norm(b)))), N + ' ' + tag + ': row "' + a + ' = ' + b + '" matches no template')); };
    const [inT1, inT2] = tbls('Inputs'); const valsT = tbls('Screen values in the screenshots')[0]; const head = valsT.rows[0];
    const vcell = (label, col) => { const ci = head.indexOf(col); const row = valsT.rows.find(r => r[0] === label); return ci < 0 || !row ? undefined : row[ci]; };
    const lineBullets = sec.blocks.filter(b => b.t === 'p' && b.h2 === N + ' Screen values in the screenshots').map(b => b.text);
    const wbT = tbls('Workbook sheet "' + X.sheet + '"'); const outT = wbT.find(t => t.rows[0][0] === 'Workbook output name');
    ok(wbT.length && sec.text.includes('sheet "' + X.sheet + '"'), N + ': workbook sheet pointer "' + X.sheet + '"');
    for (const [key, b, act] of states) { await D.base(b); await D.calc(c.id); if (act === 'adj') await page.click('[data-a="adjinfl"]');
      const d = await page.evaluate(extract), col = COL[key], nm = (await D.num(c.id)).num;
      if (key === 'plan' && head.indexOf(col) < 0) { await D.base('fresh'); await D.calc(c.id); const d0 = await page.evaluate(extract); ok(d.fields.every((f, i) => f.box === d0.fields[i].box), N + ' plan: inputs differ but no plan screenshot'); continue; }
      ok(head.indexOf(col) >= 0, N + ' ' + key + ': no column "' + col + '"');
      // workbook alignment: every output name the screen computes is a defined name in the sheet
      const xn = new Set([...X.results, ...X.plan, ...X.inputs].map(r => r.name)); Object.keys(nm).forEach(k => ok(xn.has(k), N + ' ' + key + ': output ' + k + ' not a workbook name'));
      if (key === 'default' || key === 'infl') { const ci = key === 'default' ? 2 : 3; outT.rows.slice(1).forEach(r => ok(r[ci] === fmtNum(nm[r[0]]), N + ' ' + key + ': workbook value ' + r[0] + ' doc "' + r[ci] + '" vs live "' + fmtNum(nm[r[0]]) + '"')); ok(outT.rows.length - 1 === X.results.concat(X.plan).filter(r => r.name in nm).length, N + ': workbook output table complete'); }
      if (key === 'default') { ok(has(d.title), N + ': title "' + d.title + '"'); ok(norm(d.sub) === norm(c.q) && has(c.q), N + ': question'); if (d.tip) ok(has(d.tip), N + ': tip "' + d.tip + '"'); else ok(!c.tip, N + ': tip missing');
        ok(has(d.eyebrow), N + ': eyebrow'); ok(shared.includes(d.back), N + ': back'); ok(has(d.disc), N + ': disclaimer'); d.buttons.forEach(bt => ok(has(bt.t) || shared.includes(bt.t), N + ': button "' + bt.t + '"'));
        if (d.whatIfTitle) ok(shared.includes(d.whatIfTitle), N + ': what-if title'); if (d.adj) { ok(shared.includes(d.adj.text) && shared.includes(d.adj.help), N + ': switch strings'); ok(d.adj.role === 'switch' && d.adj.checked === 'false', N + ': switch default off'); }
        if (d.infl) { ok(shared.includes(d.infl.title) && shared.includes(d.infl.help), N + ': inflation title/help'); d.infl.chips.forEach(ch => ok(shared.includes(ch.t) && ch.pressed === 'false', N + ': chip "' + ch.t + '" (unpressed)')); }
        for (const f of d.fields) { const i = c.inputs.find(x => x.k === f.k), r1 = inT1.rows.find(r => r[0].replace(/^\[What if\] /, '') === f.label), r2 = inT2.rows.find(r => r[0] === f.label);
          if (!ok(r1 && r2, N + ': input "' + f.label + '" not in inputs tables')) continue;
          ok(f.labelledby === f.lid, N + ' ' + f.label + ': control not labelled by its label');
          if (f.kind === 'chip') { ok(r1[1] === 'Chips: ' + f.chips.map(x => '"' + x.t + '"').join(' / ') && r1[1] === F.unitDisplay(i.u), N + ' ' + f.label + ': chips ' + r1[1]); ok(r1[2] === F.chipLabel(i.u, i.v), N + ' ' + f.label + ': CALCS default chip'); ok(r1[3].replace(/ ⚠$/, '') === f.box, N + ' ' + f.label + ': on-screen chip'); ok(f.role === 'group', N + ' ' + f.label + ': chip group role'); ok(r1[4] === '—' && r1[7] === 'tap (chips)' && r2[1] === 'Not possible (chips)', N + ' ' + f.label + ': chip limits'); continue; }
          ok(r1[1] === F.unitDisplay(i.u) && F.PARTS[i.u][0] === f.pre && F.PARTS[i.u][1] === f.suf, N + ' ' + f.label + ': unit ' + r1[1] + ' vs DOM "' + f.pre + '"/"' + f.suf + '"');
          ok(r1[2] === F.boxText(F.PARTS[i.u][0], F.nbFmt(i.v), F.PARTS[i.u][1]), N + ' ' + f.label + ': CALCS default');
          ok(r1[3].replace(/ ⚠$/, '') === F.boxText(f.pre, f.box, f.suf), N + ' ' + f.label + ': on-screen default "' + r1[3] + '" vs "' + F.boxText(f.pre, f.box, f.suf) + '"');
          ok(r1[4] === F.nbFmt(+f.min) && r1[5] === F.nbFmt(+f.max) && r1[6] === F.nbFmt(+f.step), N + ' ' + f.label + ': min/max/step ' + r1.slice(4, 7) + ' vs ' + [f.min, f.max, f.step]);
          ok(r1[7] === f.inputmode, N + ' ' + f.label + ': keyboard'); } }
      for (const f of d.fields) { const exp = boxOf(f) + (f.tag ? ' ★' : ''); ok(vcell(f.label, col) === exp, N + ' ' + key + ': "' + f.label + '" doc "' + vcell(f.label, col) + '" vs screen "' + exp + '"'); if (f.tag) ok(f.tag === 'From your statement' && shared.includes(f.tag), N + ': tag'); }
      ok(vcell('Result label', col) === d.result.lbl, N + ' ' + key + ': result label'); ok(vcell('Headline value', col) === d.result.val, N + ' ' + key + ': headline "' + d.result.val + '"');
      d.result.rows.forEach(([a, bb]) => ok(vcell('Row: ' + a, col) === bb, N + ' ' + key + ': row "' + a + '" doc "' + vcell('Row: ' + a, col) + '" vs "' + bb + '"'));
      ok(vcell('Inflation line', col) === (d.inflNote || '—'), N + ' ' + key + ': inflation line');
      ok(lineBullets.includes(col + ': ' + d.result.line), N + ' ' + key + ': verbatim line missing: ' + d.result.line);
      checkResult(d.result, key); }
    for (const e of EDGES[c.id] || []) { await D.base(e.base || 'fresh'); await D.calc(c.id); for (const [k, v] of Object.entries(e.set)) await D.set(k, v); const d = await page.evaluate(extract);
      const ets = sec.blocks.filter(b => b.t === 'tbl' && b.rows.some(r => r[0] === 'Line' && r[1] === d.result.line) && b.rows.some(r => r[0] === 'Headline value' && r[1] === d.result.val));
      ok(ets.some(et => d.result.rows.every(([a, bb]) => et.rows.some(r => r[0] === 'Row: ' + a && r[1] === bb)) && et.rows.some(r => r[0] === 'Label' && r[1] === d.result.lbl)), N + ' edge "' + e.t + '": result not in doc ' + JSON.stringify(d.result));
      checkResult(d.result, 'edge "' + e.t + '"'); }
    for (const i of c.inputs) { const r2 = inT2.rows.find(r => r[0] === i.l);
      if (F.CHIPS[i.u]) { for (const [v, l] of F.CHIPS[i.u]) { await D.base('fresh'); await D.calc(c.id); await D.set(i.k, v); const pr = await page.evaluate(([k, v]) => { const b = document.querySelector('[data-a="ckset"][data-p="' + k + '|' + v + '"]'); return [b.getAttribute('aria-pressed'), b.textContent.trim()]; }, [i.k, v]); ok(pr[0] === 'true' && pr[1] === l, N + ' ' + i.l + ': chip "' + l + '" selects'); const d = await page.evaluate(extract); checkResult(d.result, 'chip ' + l); } continue; }
      for (const [dir, v] of [['max', i.u === '€' ? i.max * 10 + 1000 : i.max + 1], ['min', i.min - 1]]) { await D.base('fresh'); await D.calc(c.id); await D.set(i.k, v);
        const hv = await page.evaluate(k => [document.getElementById('nh-ck-' + k).textContent, document.getElementById('co-' + k).value], i.k), cellTxt = dir === 'max' ? r2[1] : r2[2];
        ok(hv[0] !== '' && cellTxt.includes('hint "' + hv[0] + '"'), N + ' ' + i.l + ' ' + dir + ' hint "' + hv[0] + '" not in "' + cellTxt + '"');
        ok(hv[1] === F.nbFmt(dir === 'max' ? (i.u === '€' ? i.max * 10 : i.max) : i.min), N + ' ' + i.l + ' ' + dir + ' clamp ' + hv[1]); checkResult((await page.evaluate(extract)).result, i.l + ' ' + dir); }
      if (i.u === '€') { await D.base('fresh'); await D.calc(c.id); const w = Math.round(i.max * 1.5); await D.set(i.k, w); const hv = await page.evaluate(k => [document.getElementById('nh-ck-' + k).textContent, document.getElementById('c-' + k).max], i.k); ok(hv[0] === '' && +hv[1] === w, N + ' ' + i.l + ': € widen'); } }
    R.perCalc.push([N, c.name, R.pass - p0, R.fail.length - f0]); console.log(N, R.pass - p0, 'passed', R.fail.length - f0, 'failed'); }
  // ---------- Inflation chips, rules, Your assumptions ----------
  const s1 = secs.find(s => s.title === '1. Design system').text, s3 = secs.find(s => s.title === '3. Rules and Your assumptions'), p1 = R.pass, f1 = R.fail.length;
  await D.base('fresh'); await D.calc('compound'); const iu = await page.evaluate(() => { const ic = document.querySelector('.infl'), t = e => e.textContent.replace(/\s+/g, ' ').trim(); return { title: t(ic.querySelector('b')), help: t(ic.querySelector('p.small')), chips: [...ic.querySelectorAll('.chip')].map(c => [t(c), c.getAttribute('aria-pressed'), c.dataset.p]) }; });
  ok(s1.includes(iu.title) && s1.includes(iu.help), 'Inflation chips: title and help'); iu.chips.forEach(ch => ok(s1.includes(ch[0]) && ch[1] === 'false', 'Inflation state 1: "' + ch[0] + '" unpressed'));
  ok(/3\.9%/.test(iu.help) && iu.chips[1][0].includes('3.9%'), 'Inflation: CSO label 3.9%');
  await page.click('[data-a="infl"][data-p="' + iu.chips[0][2] + '"]'); const col = await page.evaluate(() => ({ card: !!document.querySelector('.infl'), note: (([...document.querySelectorAll('#main p.small')].find(p => /Prices rising/.test(p.textContent)) || {}).textContent || '').replace(/\s+/g, ' ').trim() }));
  ok(!col.card && s1.includes(col.note), 'Inflation state 2: card closes, line "' + col.note + '"');
  await page.click('[data-a="infledit"]'); ok(await page.evaluate(() => document.querySelector('[data-a="infl"]').getAttribute('aria-pressed') === 'true'), 'Inflation state 2: chosen chip pressed after Change');
  await page.click('[data-a="infl"][data-p="other"]'); if (!(await page.$('.infl'))) await page.click('[data-a="infledit"]'); const oth = await page.evaluate(() => ({ l: document.querySelector('.infl .flabel span').textContent, p: document.querySelector('[data-a="infl"][data-p="other"]').getAttribute('aria-pressed') }));
  ok(oth.p === 'true' && s1.includes(oth.l), 'Inflation state 3: Other with "' + oth.l + '"');
  const rv = await page.evaluate(() => RULES_VERSION); ok(rv === 'Irish rules 2026 · checked 2 Oct 2026' && s3.text.includes(rv) && s3.text.includes('Budget 2027') && s3.text.includes('6 October 2026'), 'Rules version note');
  const rules = await page.evaluate(() => { const out = []; const walk = (o, p) => Object.entries(o).forEach(([k, x]) => { if (x && typeof x === 'object' && 'v' in x && 'src' in x) out.push([p + k, x.eff]); else walk(x, p + k + '.'); }); walk(RULES_IE_2026, ''); return out; });
  const regT = s3.blocks.find(b => b.t === 'tbl' && b.rows[0][0] === 'Key'); rules.forEach(([k, eff]) => ok(regT.rows.some(r => r[0] === k && r[2] === eff), 'Register row ' + k));
  for (const [g] of await page.evaluate(() => ASM_GRP)) { await page.evaluate(g => { S = fresh(); S.shell = true; S.tab = 'me'; S.me = 'asm'; S.asmOpen = g; lastId = null; render(); }, g);
    const [G] = await page.evaluate(extractAsm); const T = s3.blocks.filter(b => b.t === 'tbl' && b.rows[0][0] === 'Code').flatMap(b => b.rows);
    ok(s3.text.includes(G.title), 'Assumptions group "' + G.title + '"');
    for (const f of G.fields) { const r = T.find(x => x[1] === f.label); if (!ok(r, 'Assumptions: "' + f.label + '" not in doc')) continue;
      ok(r[6].startsWith(f.help + ' · Used by'), 'Assumptions ' + f.k + ': guidance');
      ok(f.status === 'Suggested · change if you like' || (f.status === 'Optional' && r[5].includes('"Optional"')), 'Assumptions ' + f.k + ': status "' + f.status + '"');
      if (f.chips.length) { ok(r[2] === 'Chips' && r[3] === f.chips.map(x => '"' + x.t + '"').join(' / ') && r[5] === (f.chips.find(x => x.pressed === 'true') || {}).t, 'Assumptions ' + f.k + ': chips / suggested'); }
      else { const unit = f.box.suf === '%' ? 'Box, suffix "%"' : f.box.pre === '€' ? 'Box, prefix "€"' : f.box.suf === 'yrs' ? 'Box, suffix "yrs"' : f.box.pre === 'age ' ? 'Box, prefix "age"' : 'Box, no unit';
        ok(r[2] === unit, 'Assumptions ' + f.k + ': control ' + r[2] + ' vs ' + unit); const shown = f.box.val === '' ? 'Not set' : f.box.suf === '%' ? f.box.val + '%' : f.box.pre === '€' ? '€' + f.box.val : f.box.pre === 'age ' ? 'age ' + f.box.val : f.box.suf === 'yrs' ? f.box.val + ' years' : f.box.val;
        ok(r[5] === shown || r[5].startsWith(shown + ' (') || r[5].startsWith(shown + '×'), 'Assumptions ' + f.k + ': suggested "' + r[5] + '" vs box "' + shown + '"'); } } }
  const foot = await page.evaluate(() => [...document.querySelectorAll('#main > p.small, #main > .btn')].map(e => e.textContent.replace(/\s+/g, ' ').trim())); foot.forEach(t => ok(s3.text.includes(t), 'Assumptions footer "' + t + '"'));
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
  for (const [id, b] of [['borrow','fresh'], ['compound','fresh'], ['compound','freshInfl'], ['overpay','fresh'], ['emergency','fresh'], ['retirement','freshInfl'], ['contrib','fresh'], ['lifecover','fresh'], ['incomegap','fresh'], ['ratechange','fresh'], ['debtpay','fresh']]) {
    await D.base(b); await D.calc(id); await page.click('[data-a="calcadd"]'); const t = await page.evaluate(() => [...document.querySelectorAll('.sheet .eyebrow, .sheet h2, .sheet p.sub, .sheet .btn')].map(e => e.textContent.replace(/\s+/g, ' ').trim()));
    ok(s2.includes(t.join(' | ')), 'Add sheet ' + id + ' (' + b + '): "' + t.join(' | ') + '"'); }
  R.perCalc.push(['Explore', 'Explore structure, statement cards, Add to my plan sheets', R.pass - p0, R.fail.length - f0]);
  R.errors = errors; await browser.close();
  fs.writeFileSync(path.join(__dirname, process.env.DOCX ? 'check-mut.json' : 'check.json'), JSON.stringify(R, null, 1));
  console.log('PASS', R.pass, 'FAIL', R.fail.length, 'console errors', errors.length); R.fail.slice(0, 80).forEach(f => console.log(' -', f));
})();
