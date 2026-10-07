// Independent check: drive the live prototype again, extract every visible label and number, and compare with the strings in the .docx.
const fs = require('fs'), path = require('path'), JSZip = require('jszip');
const { open } = require('./lib');
const { STMT_FOR, INFL_ONLY, ADJ, EDGES } = require('./states');
const extractAsm = require('./extract-asm');
const XL = require('./xl.json');
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
const TYPE_BY_NAME = { '€ amount': 'eur', 'Signed € amount': 'seur', 'Whole number': 'int', 'Number as entered': 'num', '1 decimal': 'd1', '2 decimals': 'd2', 'Percent': 'pct', 'Duration': 'yrs', 'Years': 'yrn', 'Weekly € amount': 'eurw' };
function compile(t, ph) { let i = 0; const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  function seq(stop) { let out = ''; while (i < t.length) { const ch = t[i]; if (stop.includes(ch)) return out;
    if (ch === '«') { i++; const alts = [seq('|»')]; while (t[i] === '|') { i++; alts.push(seq('|»')); } if (t[i] !== '»') throw new Error('unclosed « in ' + t); i++; out += '(?:' + alts.join('|') + ')'; continue; }
    if (ch === '{') { const j = t.indexOf('}', i), name = t.slice(i + 1, j); if (!ph[name]) throw new Error('placeholder {' + name + '} not in the doc table: ' + t); out += '(' + RX[ph[name]] + ')'; i = j + 1; continue; }
    out += esc(ch); i++; } return out; }
  return new RegExp('^' + seq('').replace(/ +/g, ' +') + '$'); }

