const fs = require('fs'), path = require('path');
const D = require('docx');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, ShadingType, ImageRun, PageBreak, AlignmentType, LevelFormat, TableOfContents, Footer, Header, PageNumber, BorderStyle, VerticalAlign } = D;
const { SPEC, TYPES, PF } = require('./spec');
const F = require('./fmt');
const data = require('./data.json');
const SH = path.join(__dirname, 'shots');
const HTML = fs.readFileSync(path.join(__dirname, 'proto-head.html'), 'utf8');
const OUT = '/home/user/lifegoals-prototype/deliverables/LifeGoals-Calculators-UIUX-Spec.docx';

const INK = '0B2545', SEA_D = '0B7A70', MUTED = '51627A', LINE = 'DCE4EC', MIST = 'F3F7F9', SUN_L = 'FDF0D2';
const W = 9866; // content width in DXA (A4 11906 − 2 × 1020)
const FONT = 'Arial';

// ---------- primitives ----------
const run = (t, o = {}) => new TextRun({ text: String(t), font: FONT, size: o.size || 20, bold: o.bold, italics: o.it, color: o.color, break: o.br });
function rich(t, o = {}) { // **bold** support
  const parts = String(t).split(/(\*\*[^*]+\*\*)/); return parts.filter(Boolean).map(p => p.startsWith('**') ? run(p.slice(2, -2), Object.assign({}, o, { bold: true })) : run(p, o)); }
const P = (t, o = {}) => new Paragraph({ children: Array.isArray(t) ? t : rich(t, o), spacing: { after: o.after == null ? 100 : o.after, before: o.before || 0, line: o.line || 276 }, alignment: o.align, keepNext: o.keepNext });
const H1 = t => { const p = new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: t, font: FONT })], spacing: { before: 0, after: 160 }, pageBreakBefore: true }); p.__h1 = t; return p; };
const H2 = t => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: t, font: FONT })], spacing: { before: 240, after: 100 }, keepNext: true });
const H3 = t => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: t, font: FONT })], spacing: { before: 160, after: 80 }, keepNext: true });
const B = (t, lvl = 0) => new Paragraph({ numbering: { reference: 'bul', level: lvl }, children: rich(t), spacing: { after: 60 } });
const N = t => new Paragraph({ numbering: { reference: 'num', level: 0 }, children: rich(t), spacing: { after: 60 } });
const brk = () => new Paragraph({ children: [new PageBreak()] });
const border = { style: BorderStyle.SINGLE, size: 4, color: 'C9D3DC' };
const borders = { top: border, bottom: border, left: border, right: border };
function cell(content, w, o = {}) {
  const paras = (Array.isArray(content) ? content : [content]).map(c => c instanceof Paragraph || c instanceof Table ? c :
    new Paragraph({ children: rich(c == null ? '' : c, { size: o.size || 16, bold: o.bold, color: o.color }), spacing: { after: 20, line: 240 }, alignment: o.align }));
  return new TableCell({ children: paras, width: { size: w, type: WidthType.DXA }, borders, shading: o.fill ? { type: ShadingType.CLEAR, color: 'auto', fill: o.fill } : undefined,
    margins: { top: 50, bottom: 50, left: 80, right: 80 }, verticalAlign: o.vAlign, columnSpan: o.span });
}
function table(widths, head, rows, o = {}) {
  const tot = widths.reduce((a, b) => a + b, 0); if (Math.abs(tot - W) > 2 && !o.free) throw new Error('widths ' + tot);
  const hr = head ? [new TableRow({ tableHeader: true, cantSplit: true, children: head.map((h, i) => cell(h, widths[i], { fill: INK, color: 'FFFFFF', bold: true, size: o.size || 16 })) })] : [];
  const br = rows.map((r, ri) => new TableRow({ cantSplit: o.cantSplit !== false, children: r.map((c, i) => c instanceof TableCell ? c : cell(c, widths[i], { size: o.size || 16, fill: o.zebra && ri % 2 ? MIST : (o.firstFill && i === 0 ? MIST : undefined), bold: o.firstBold && i === 0 })) }));
  return new Table({ width: { size: tot, type: WidthType.DXA }, columnWidths: widths, rows: hr.concat(br) });
}
const kv = (rows, w1 = 2600) => table([w1, W - w1], null, rows, { firstFill: true, firstBold: true, size: 17 });
function pngSize(f) { const b = fs.readFileSync(f); return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }; }
function img(file, maxW, maxH) { const f = path.join(SH, file), s = pngSize(f); let w = maxW, h = Math.round(s.h * maxW / s.w); if (h > maxH) { h = maxH; w = Math.round(s.w * maxH / s.h); }
  return new ImageRun({ type: 'png', data: fs.readFileSync(f), transformation: { width: w, height: h }, altText: { title: file, description: file, name: file } }); }
const imgP = (file, maxW, maxH, align = AlignmentType.CENTER) => new Paragraph({ children: [img(file, maxW, maxH)], alignment: align, spacing: { after: 40 } });
const cap = t => new Paragraph({ children: [run(t, { size: 15, it: true, color: MUTED })], alignment: AlignmentType.CENTER, spacing: { after: 120 } });
function imgGrid(items, perRow, maxH) { // items: [{file, caption}]
  const cw = Math.floor(W / perRow), widths = Array(perRow).fill(cw); widths[perRow - 1] += W - cw * perRow; const px = Math.floor(cw / 15) - 10; const rows = [];
  for (let i = 0; i < items.length; i += perRow) { const slice = items.slice(i, i + perRow);
    rows.push(new TableRow({ cantSplit: true, children: widths.map((w, j) => { const it = slice[j]; const nb = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
      return new TableCell({ width: { size: w, type: WidthType.DXA }, borders: { top: nb, bottom: nb, left: nb, right: nb }, margins: { top: 40, bottom: 40, left: 60, right: 60 }, verticalAlign: VerticalAlign.TOP,
        children: it ? [imgP(it.file, px, maxH), cap(it.caption)] : [new Paragraph({ children: [] })] }); }) })); }
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: widths, rows }); }
const q = s => '“' + s + '”';

// ---------- CSS tokens (verbatim from :root) ----------
const rootBlocks = [...HTML.matchAll(/:root\{([^}]*)\}/g)].map(m => m[1]);
const tokens = []; rootBlocks.forEach(b => { b.replace(/\/\*[\s\S]*?\*\//g, '').replace(/url\("data:([a-z+\/]+)[^"]*"\)/g, (m, t) => 'url(embedded ' + (/jpeg/.test(t) ? 'photo' : 'drawing') + ', ' + Math.round(m.length / 1024) + ' KB)').split(';').map(s => s.trim()).filter(Boolean).forEach(s => { const i = s.indexOf(':'); tokens.push([s.slice(0, i).trim(), s.slice(i + 1).trim()]); }); });
const cssRule = sel => { const re = new RegExp('(^|[\\n}])' + sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\{([^}]*)\\}'); const m = HTML.match(re); if (!m) throw new Error('no css ' + sel); return m[2]; };
const TOKEN_USE = { '--ink': 'Primary text, navy surfaces (result card, small buttons, tab FAB)', '--ink2': 'Hover for navy buttons', '--muted': 'Secondary text (subtitles, small, disclaimer)', '--line': 'Borders (chips, ghost buttons, inputs, rows)', '--mist': 'App background', '--card': 'Card background', '--sea': 'Brand teal (fills, timeline)', '--sea-d': 'Teal text and controls: eyebrow, links, slider accent, value box, selected chip', '--sea-l': 'Teal tint: focus halo, value box focus background, pre tag', '--sun': 'Gold: main CTA, focus outline, result-card eyebrow', '--sun-l': 'Gold tint: tip note, estimated tag', '--acc-d': 'Text on gold tints', '--sand': 'Icon tile background in list rows', '--sky': 'Sky blue accent', '--sky-l': 'Sky tint', '--storm': 'Storm purple', '--storm-l': 'Storm tint', '--coral': 'Coral accent', '--r': 'Card corner radius', '--ok-l': 'Background of "From your statement" tag', '--ok-t': 'Text of "From your statement" tag', '--gap-l': 'Background of "Check this" tag', '--gap-t': 'Text of "Check this" tag', '--nudge-t': 'Text of max / min hints', '--fh': 'Heading font stack', '--fb': 'Body font stack', '--c1': 'Everyday Money tile', '--c2': 'Home & Mortgage tile', '--c3': 'Savings & Goals tile', '--c4': 'Protection tile', '--c5': 'Investments tile', '--c7': 'Pensions & Retirement tile' };

// ---------- helpers on data ----------
const M = data.meta, CATN = Object.fromEntries(M.CATS.map(c => [c.id, c])), byId = Object.fromEntries(data.calcs.map(c => [c.id, c]));
const NUM = id => byId[id].n;
const EXPK = { home: 'mortgage', retire: 'pension', protect: 'protection', invest: 'investment' };
const expertFor = cat => M.EXPERT_FOR[EXPK[cat] || 'planner'];
const STMT = {}; Object.entries({ retire: ['retirement', 'contrib', 'avc', 'lastmoney', 'drawdown'], home: ['repayment', 'overpay', 'ratechange', 'term'], invest: ['regularinvest', 'lumpsum', 'realreturn', 'fees', 'riskreturn'] }).forEach(([k, l]) => l.forEach(id => STMT[id] = k));
const fieldBox = f => F.boxText(f.pre, f.box, f.suf) + (f.tag ? ' ★' : '');
const allInputs = c => c.inputs.map(i => Object.assign({ wi: false }, i)).concat(c.wi.map(i => Object.assign({ wi: true }, i)));
const inflMode = id => M.ADJ_TOOLS.includes(id) ? 'switch' : M.INFL_TOOLS.includes(id) ? 'chips' : 'none';

