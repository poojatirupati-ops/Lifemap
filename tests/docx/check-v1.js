// Independent check: drive the live prototype again, extract every visible label and number, and compare with the strings in the .docx.
const fs = require('fs'), path = require('path'), JSZip = require('jszip');
const { open } = require('./lib');
const { BASES, STMT_FOR, INFL_ONLY, ADJ, EDGES } = require('./states');
const extract = require('./extract');
const F = require('./fmt');
const { RX } = require('./tmpl');
const DOCX = process.env.DOCX || '/home/user/lifegoals-prototype/deliverables/LifeGoals-Calculators-UIUX-Spec.docx';
const norm = s => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
const ent = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#39;/g, "'").replace(/&amp;/g, '&');

// ---------- read the docx ----------
function parseDoc(xml) {
  const body = xml.slice(xml.indexOf('<w:body>'));
  const ptext = p => norm(ent([...p.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>|<w:tab\/>/g)].map(m => m[1] == null ? '\t' : m[1]).join('')));
  const blocks = []; const re = /<w:tbl>[\s\S]*?<\/w:tbl>|<w:p[ >][\s\S]*?<\/w:p>/g; let m;
  while ((m = re.exec(body))) { const s = m[0];
    if (s.startsWith('<w:tbl>')) blocks.push({ t: 'tbl', rows: [...s.matchAll(/<w:tr[ >][\s\S]*?<\/w:tr>/g)].map(r => [...r[0].matchAll(/<w:tc>[\s\S]*?<\/w:tc>/g)].map(c => norm([...c[0].matchAll(/<w:p[ >][\s\S]*?<\/w:p>/g)].map(p => ptext(p[0])).join(' ')))) });
    else { const st = (s.match(/<w:pStyle w:val="([^"]+)"/) || [])[1]; blocks.push({ t: 'p', style: st, text: ptext(s) }); } }
  const secs = []; let cur = null, h2 = null;
  for (const b of blocks) { if (b.t === 'p' && b.style === 'Heading1') { cur = { title: b.text, blocks: [] }; secs.push(cur); h2 = null; continue; }
    if (!cur) continue; if (b.t === 'p' && b.style === 'Heading2') h2 = b.text; b.h2 = h2; cur.blocks.push(b); }
  secs.forEach(s => { s.text = s.blocks.map(b => b.t === 'p' ? b.text : b.rows.map(r => r.join(' | ')).join(' || ')).join(' ## '); s.cells = new Set(s.blocks.filter(b => b.t === 'tbl').flatMap(b => b.rows.flat())); });
  return secs; }

// template → regex using the doc's own placeholder table
const TYPE_BY_NAME = { '€ amount': 'eur', 'Signed € amount': 'seur', 'Whole number': 'int', 'Number as entered': 'num', '1 decimal': 'd1', '2 decimals': 'd2', 'Inflation %': 'pct', 'Duration': 'yrs', 'Word': 'raw', 'Pay growth %': 'wage' };
function compile(t, ph) { let i = 0; const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  function seq(stop) { let out = ''; while (i < t.length) { const ch = t[i]; if (stop.includes(ch)) return out;
    if (ch === '«') { i++; const alts = [seq('|»')]; while (t[i] === '|') { i++; alts.push(seq('|»')); } if (t[i] !== '»') throw new Error('unclosed « in ' + t); i++; out += '(?:' + alts.join('|') + ')'; continue; }
    if (ch === '{') { const j = t.indexOf('}', i), name = t.slice(i + 1, j); if (!ph[name]) throw new Error('placeholder {' + name + '} not in the doc table: ' + t); out += '(' + RX[ph[name]] + ')'; i = j + 1; continue; }
    out += esc(ch); i++; } return out; }
  return new RegExp('^' + seq('').replace(/ +/g, ' +') + '$'); }

(async () => {
  const z = await JSZip.loadAsync(fs.readFileSync(DOCX)); const secs = parseDoc(await z.file('word/document.xml').async('string'));
  const allText = secs.map(s => s.text).join(' ## ');
  const { browser, page, errors } = await open();
  const R = { pass: 0, fail: [], perCalc: [], expectedDefects: [] };
  const ok = (cond, what) => { if (cond) R.pass++; else R.fail.push(what); return cond; };
  const base = async b => { await page.setViewportSize({ width: 390, height: 844 }); await page.evaluate(`(${BASES[b].toString()})()`); };
  const stmt = async cat => { await base('sample'); await page.evaluate(cat => { const T = DOCT[cat]; S.pst = { cat, stage: 'confirm', files: [T.title + ' · ' + T.date + '.pdf'], edit: {} }; pstConfirm(); }, cat); };
  const type = async (k, v) => { await page.fill('#co-' + k, String(v)); await page.evaluate(() => document.activeElement && document.activeElement.blur()); };
  const calcs = await page.evaluate(() => CALCS.map(c => ({ id: c.id, cat: c.cat, name: c.name, q: c.q, tip: c.tip || null, inputs: c.inputs.concat(c.wi || []) })));
  const shared = secs.filter(s => /^(1\.|2\.|Appendix A)/.test(s.title)).map(s => s.text).join(' ## ');
  for (const [n, c] of calcs.entries()) { const N = 'C' + String(n + 1).padStart(2, '0'), sec = secs.find(s => s.title === N + ' ' + c.name), f0 = R.fail.length, p0 = R.pass;
    if (!ok(sec, N + ': section "' + N + ' ' + c.name + '" missing')) continue;
    const tbls = h => sec.blocks.filter(b => b.t === 'tbl' && b.h2 === N + ' ' + h), has = s => sec.text.includes(norm(s)), inCells = s => sec.cells.has(norm(s));
    // states recreated independently
    const states = [['default', async () => { await base('fresh'); }]];
    if (INFL_ONLY.includes(c.id)) states.push(['infl', async () => { await base('freshInfl'); }]);
    if (ADJ.includes(c.id)) { states.push(['adjUnset', async () => { await base('fresh'); }, 'adj']); states.push(['adjSet', async () => { await base('freshInfl'); }, 'adj']); }
    states.push(['plan', async () => { await base('sample'); }]);
    if (STMT_FOR[c.id]) states.push(['stmt', async () => { await stmt(STMT_FOR[c.id]); }]);
    const COL = { default: 'Default', infl: 'Inflation 2%', adjUnset: 'Switch on, no rate', adjSet: 'Switch on, 2%', plan: 'Plan pre-fill', stmt: 'Statement' };
    // result templates from the doc
    const [partsT, rowsT, phT] = tbls('Result card'); const ph = {}; phT.rows.slice(1).forEach(r => { ph[r[0].replace(/[{}]/g, '')] = TYPE_BY_NAME[r[1]]; });
    const lblT = partsT.rows.filter(r => r[0] === 'Label (eyebrow)').map(r => r[1]), valT = partsT.rows.filter(r => r[0] === 'Headline value').map(r => r[1]), lineT = partsT.rows.filter(r => r[0] === 'Line').map(r => r[1]);
    const rowSpecs = rowsT.rows.slice(1).map(r => ({ l: r[0], v: r[1].split(' / ').map(v => v.replace(/ \([^()]*(?:\([^()]*\)[^()]*)*\)$/, '')) }));
    const mt = (list, s) => list.some(t => compile(t, ph).test(norm(s)));
    const checkResult = (r, tag) => { const defect = c.id === 'riskreturn' && /NaN/.test(r.val);
      if (defect) { R.expectedDefects.push(N + ' ' + tag + ': "' + r.lbl + '" / ' + r.val + ' (documented defect, Appendix B)'); ok(has('undefined · middle outcome') && has('€NaN'), N + ' ' + tag + ': defect strings not documented'); return; }
      ok(mt(lblT, r.lbl), N + ' ' + tag + ': label "' + r.lbl + '" matches no template'); ok(mt(valT, r.val), N + ' ' + tag + ': value "' + r.val + '" matches no template'); ok(mt(lineT, r.line), N + ' ' + tag + ': line "' + r.line + '" matches no template');
      r.rows.forEach(([a, b]) => ok(rowSpecs.some(rs => compile(rs.l, ph).test(norm(a)) && rs.v.some(v => compile(v, ph).test(norm(b)))), N + ' ' + tag + ': row "' + a + ' = ' + b + '" matches no template')); };
    const [inT1, inT2] = tbls('Inputs'); const valsT = tbls('Screen values in the screenshots')[0]; const head = valsT.rows[0];
    const vcell = (label, col) => { const ci = head.indexOf(col); const row = valsT.rows.find(r => r[0] === label); return ci < 0 || !row ? undefined : row[ci]; };
    const lineBullets = sec.blocks.filter(b => b.t === 'p' && b.h2 === N + ' Screen values in the screenshots').map(b => b.text);
    for (const [key, setup, act] of states) { await setup(); await page.evaluate(id => ACT.calc(id), c.id); if (act === 'adj') await page.click('[data-a="adjinfl"]');
      const d = await page.evaluate(extract), col = COL[key];
      if (key === 'plan' && head.indexOf(col) < 0) { // no plan screenshot: pre-fill must not change any input
        await base('fresh'); await page.evaluate(id => ACT.calc(id), c.id); const d0 = await page.evaluate(extract); ok(d.fields.every((f, i) => f.box === d0.fields[i].box), N + ' plan: inputs differ from default but no plan screenshot'); continue; }
      ok(head.indexOf(col) >= 0, N + ' ' + key + ': no column "' + col + '" in screen-values table');
      if (key === 'default') { ok(has(d.title), N + ': title "' + d.title + '"'); ok(has(c.q) && norm(d.sub) === norm(c.q), N + ': question "' + d.sub + '"'); if (d.tip) ok(has(d.tip), N + ': tip "' + d.tip + '"'); else ok(!c.tip, N + ': tip missing on screen');
        ok(has(d.eyebrow), N + ': eyebrow "' + d.eyebrow + '"'); ok(shared.includes(d.back), N + ': back "' + d.back + '"'); ok(has(d.disc), N + ': disclaimer'); d.buttons.forEach(b => ok(has(b.t) || shared.includes(b.t), N + ': button "' + b.t + '"'));
        if (d.whatIfTitle) ok(shared.includes(d.whatIfTitle), N + ': what-if title'); if (d.adj) { ok(shared.includes(d.adj.text) && shared.includes(d.adj.help), N + ': switch strings'); ok(d.adj.role === 'switch' && d.adj.checked === 'false', N + ': switch default off'); }
        if (d.infl) { ok(shared.includes(d.infl.title) && shared.includes(d.infl.help), N + ': inflation title/help'); d.infl.chips.forEach(ch => ok(shared.includes(ch.t), N + ': chip "' + ch.t + '"')); }
        // inputs tables
        for (const f of d.fields) { const i = c.inputs.find(x => x.k === f.k), r1 = inT1.rows.find(r => r[0].replace(/^\[What if\] /, '') === f.label), r2 = inT2.rows.find(r => r[0] === f.label);
          if (!ok(r1 && r2, N + ': input "' + f.label + '" not in inputs tables')) continue;
          ok(r1[1] === F.unitDisplay(i.u) && (F.PARTS[i.u][0] === f.pre) && (F.PARTS[i.u][1] === f.suf), N + ' ' + f.label + ': unit ' + r1[1] + ' vs DOM pre "' + f.pre + '" suf "' + f.suf + '"');
          ok(r1[2] === F.boxText(F.PARTS[i.u][0], F.nbFmt(i.v), F.PARTS[i.u][1]), N + ' ' + f.label + ': CALCS default');
          ok(r1[3].replace(/ ⚠$/, '') === F.boxText(f.pre, f.box, f.suf), N + ' ' + f.label + ': on-screen default "' + r1[3] + '" vs DOM "' + F.boxText(f.pre, f.box, f.suf) + '"');
          ok(r1[4] === F.nbFmt(+f.min) && r1[5] === F.nbFmt(+f.max) && r1[6] === F.nbFmt(+f.step), N + ' ' + f.label + ': min/max/step ' + r1.slice(4, 7) + ' vs DOM ' + [f.min, f.max, f.step]);
          ok(r1[7] === f.inputmode, N + ' ' + f.label + ': keyboard ' + r1[7] + ' vs ' + f.inputmode);
          ok(f.labelledby === 'cl-' + f.k, N + ' ' + f.label + ': box not labelled by its label'); } }
      // per-state values
      for (const f of d.fields) { const exp = F.boxText(f.pre, f.box, f.suf) + (f.tag ? ' ★' : ''); ok(vcell(f.label, col) === exp, N + ' ' + key + ': "' + f.label + '" doc "' + vcell(f.label, col) + '" vs screen "' + exp + '"'); if (f.tag) ok(f.tag === 'From your statement' && shared.includes(f.tag), N + ': tag text "' + f.tag + '"'); }
      ok(vcell('Result label', col) === d.result.lbl, N + ' ' + key + ': result label'); ok(vcell('Headline value', col) === d.result.val, N + ' ' + key + ': headline "' + d.result.val + '"');
      d.result.rows.forEach(([a, b]) => ok(vcell('Row: ' + a, col) === b, N + ' ' + key + ': row "' + a + '" doc "' + vcell('Row: ' + a, col) + '" vs "' + b + '"'));
      ok(vcell('Inflation line', col) === (d.inflNote || '—'), N + ' ' + key + ': inflation line'); if (d.inflNote) ok(shared.includes('Prices rising {infl} a year (your choice) · Change'), 'shared inflation line');
      ok(lineBullets.includes(col + ': ' + d.result.line), N + ' ' + key + ': verbatim line missing: ' + d.result.line);
      checkResult(d.result, key); }
    // edge states
    for (const e of EDGES[c.id] || []) { await base('fresh'); await page.evaluate(id => ACT.calc(id), c.id); for (const [k, v] of Object.entries(e.set)) await type(k, v); const d = await page.evaluate(extract);
      const ets = sec.blocks.filter(b => b.t === 'tbl' && b.rows.some(r => r[0] === 'Line' && r[1] === d.result.line) && b.rows.some(r => r[0] === 'Headline value' && r[1] === d.result.val));
      ok(ets.some(et => d.result.rows.every(([a, b]) => et.rows.some(r => r[0] === 'Row: ' + a && r[1] === b)) && et.rows.some(r => r[0] === 'Label' && r[1] === d.result.lbl)), N + ' edge "' + e.t + '": result not in doc ' + JSON.stringify(d.result));
      checkResult(d.result, 'edge "' + e.t + '"'); }
    // every field: above max and below min
    for (const i of c.inputs) { for (const [dir, v] of [['max', i.u === '€' ? i.max * 10 + 1000 : i.max + 1], ['min', i.min - 1]]) {
        await base('fresh'); await page.evaluate(id => ACT.calc(id), c.id); await type(i.k, v); const hv = await page.evaluate(k => [document.getElementById('nh-ck-' + k).textContent, document.getElementById('co-' + k).value, document.getElementById('c-' + k).max], i.k);
        const r2 = inT2.rows.find(r => r[0] === i.l); const cellTxt = dir === 'max' ? r2[1] : r2[2];
        ok(cellTxt.includes('hint "' + hv[0] + '"') && hv[0] !== '', N + ' ' + i.l + ' ' + dir + ' hint "' + hv[0] + '" not in "' + cellTxt + '"');
        ok(hv[1] === F.nbFmt(dir === 'max' ? (i.u === '€' ? i.max * 10 : i.max) : i.min), N + ' ' + i.l + ' ' + dir + ' clamp box ' + hv[1]); }
      if (i.u === '€') { await base('fresh'); await page.evaluate(id => ACT.calc(id), c.id); const w = Math.round(i.max * 1.5); await type(i.k, w); const hv = await page.evaluate(k => [document.getElementById('nh-ck-' + k).textContent, document.getElementById('c-' + k).max], i.k);
        ok(hv[0] === '' && +hv[1] === w, N + ' ' + i.l + ': € above slider top should widen without hint'); } }
    R.perCalc.push([N, c.name, R.pass - p0, R.fail.length - f0]); console.log(N, R.pass - p0, 'passed', R.fail.length - f0, 'failed'); }
  // ---------- Explore structure ----------
  const s2 = secs.find(s => s.title === '2. Explore structure').text, p0 = R.pass, f0 = R.fail.length;
  const x = await page.evaluate(() => ({ cats: CATS.map(c => ({ name: c.name, em: c.em, blurb: c.blurb, n: CALCS.filter(x => x.cat === c.id).length })), topics: TOPICS, tt: TOPIC_TOOLS, doct: Object.fromEntries(Object.entries(DOCT).map(([k, T]) => [k, { what: T.what, title: T.title, date: T.date, reads: T.reads, f: T.f, text: T.text || [], extra: T.extra || null }])) }));
  await base('fresh'); const xp = await page.evaluate(() => document.getElementById('main').innerText);
  x.cats.forEach(c => { ok(s2.includes(c.name) && s2.includes(c.blurb) && s2.includes(c.n + ' tools') && xp.includes(c.n + ' tools'), 'Explore: group ' + c.name); });
  x.topics.forEach(t => ok(s2.includes(t[1]) && s2.includes(t[2]) && xp.includes(t[2]), 'Explore: topic ' + t[1]));
  for (const t of x.topics) { await base('fresh'); await page.evaluate(p => ACT.topic(p), t[1]); const tx = await page.evaluate(() => [...document.querySelectorAll('#main .link')].map(l => l.textContent.trim()));
    tx.filter(l => !/Remind me/.test(l)).forEach(l => ok(s2.includes(norm(l)), 'Topic ' + t[1] + ': link "' + l + '"')); ok(s2.includes(x.tt[t[1]].map(id => calcs.findIndex(c => c.id === id)).map(i => 'C' + String(i + 1).padStart(2, '0') + ' ' + calcs[i].name).join('; ')), 'Topic ' + t[1] + ': calculator list/order'); }
  for (const k of Object.keys(x.doct)) { const T = x.doct[k]; await base('fresh'); await page.evaluate(k => ACT.cat(k), k); const card = await page.evaluate(() => [...document.querySelectorAll('.card.pst b, .card.pst p, .card.pst label, .card.pst button')].map(e => e.textContent.replace(/\s+/g, ' ').trim()));
    card.forEach(t => ok(s2.includes(norm(t)) || s2.includes(norm(t.replace(/^We can read: /, '').replace(/\.$/, ''))), 'Statement card ' + k + ': "' + t + '"'));
    await stmt(k); await page.evaluate(k => { S.xs = []; ACT.cat(k); }, k); const up = await page.evaluate(() => document.querySelector('.card.pst .mini').innerText.replace(/\s+/g, ' ').trim());
    ok(s2.includes('Uploaded: {statement title} · {date}') && s2.includes(T.title + ' · ' + T.date), 'Statement uploaded state ' + k + ': ' + up);
    await base('sample'); await page.evaluate(k => { const T = DOCT[k]; S.pst = { cat: k, stage: 'confirm', files: [T.title + ' · ' + T.date + '.pdf'], edit: {} }; S.xs.push({ v: 'PST' }); lastId = null; render(); }, k);
    const rows = await page.evaluate(() => [...document.querySelectorAll('#main .mini')].map(m => ({ l: (m.querySelector('b') || {}).textContent, tag: (m.querySelector('.tag') || {}).textContent || '', v: (m.querySelector('input') || {}).value })));
    rows.filter(r => r.l && r.v != null).forEach(r => ok(s2.includes(r.l) && s2.includes(r.tag) && (s2.includes('| ' + r.v + ' |')), 'Confirm ' + k + ': "' + r.l + '" ' + r.tag + ' ' + r.v));
    const foot = await page.evaluate(() => document.querySelector('.foot').innerText.split('\n').map(s => s.trim()).filter(Boolean)); foot.forEach(t => ok(s2.includes(t), 'Confirm foot "' + t + '"')); }
  await base('fresh'); await page.evaluate(() => ACT.cat('home')); await page.click('[data-a="pstup"]'); const gate = await page.evaluate(() => [document.querySelector('h2.t').textContent, document.querySelector('header p.sub').textContent]);
  ok(s2.includes(gate[0]) && s2.includes(gate[1]), 'Gate screen copy');
  for (const [id, sel] of [['borrow', '.sheet'], ['ratechange', '.sheet']]) { await base('fresh'); await page.evaluate(id => ACT.calc(id), id); await page.click('[data-a="calcadd"]'); const t = await page.evaluate(s => [...document.querySelectorAll(s + ' h2, ' + s + ' .btn, ' + s + ' .eyebrow')].map(e => e.textContent.trim()), sel);
    t.filter(s => !/^🏡/.test(s)).forEach(s => ok(s2.includes(s), 'Add sheet (' + id + '): "' + s + '"')); }
  R.perCalc.push(['Explore', 'Explore structure, statement cards, sheets', R.pass - p0, R.fail.length - f0]);
  R.errors = errors; await browser.close();
  fs.writeFileSync(path.join(__dirname, process.env.DOCX ? 'check-mut.json' : 'check.json'), JSON.stringify(R, null, 1));
  console.log('PASS', R.pass, 'FAIL', R.fail.length, 'console errors', errors.length); R.fail.slice(0, 60).forEach(f => console.log(' -', f));
})();
