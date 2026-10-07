const { SPEC } = require('./spec'); const { matchAny, norm, compile } = require('./tmpl'); const d = require('./data.json');
let bad = 0;
for (const c of d.calcs){ const S = SPEC[c.id]; for (const s of c.states){ const r = s.dom.result, ph = S.ph; if (!r) continue;
  const chk = (what, list, v) => { if (!matchAny(list, v, ph)){ bad++; console.log('MISMATCH', c.n, s.key, what, JSON.stringify(v)); } };
  chk('lbl', S.lbl, r.lbl); chk('val', S.val, r.val); chk('line', S.line, r.line);
  for (const [a, b] of r.rows){ const ok = S.rows.some(([lt, vals]) => compile(lt, ph).test(norm(a)) && vals.some(([vt]) => compile(vt, ph).test(norm(b)))); if (!ok){ bad++; console.log('ROW MISMATCH', c.n, s.key, a, b); } } } }
console.log('bad', bad);
