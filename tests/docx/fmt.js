// Display rules transcribed from the prototype (nbFmt, nbParts, eur, nbCommit hint text)
const eur = n => (n < 0 ? '−€' : '€') + Math.round(Math.abs(n)).toLocaleString('en-IE');
const nbFmt = v => { const n = +v; return Math.abs(n % 1) > 1e-9 ? (+n.toFixed(4)).toLocaleString('en-IE', { maximumFractionDigits: 4 }) : Math.round(n).toLocaleString('en-IE'); };
const PARTS = { '€': ['€', ''], '%': ['', '%'], y: ['', 'yrs'], m: ['', 'mo'], age: ['age ', ''], '': ['', ''], yn: ['', ''], style: ['', ''], tax: ['', ''] };
const CHIPS = { yn: [[1, 'Yes'], [0, 'No']], style: [[1, '1 · Cautious'], [2, '2 · Balanced'], [3, '3 · Growth']], tax: [[20, '20%'], [40, '40%']] };
const UNIT_NAME = { '€': 'Euro amount', '%': 'Percent', y: 'Years', m: 'Months', age: 'Age', '': 'Plain number', yn: 'Yes / No chips', style: 'Style chips', tax: 'Tax-rate chips' };
// the box as the customer sees it: prefix + value + suffix
const boxText = (pre, val, suf) => (pre || '') + val + (suf ? (suf === '%' ? '%' : ' ' + suf) : '');
const unitDisplay = u => { if (CHIPS[u]) return 'Chips: ' + CHIPS[u].map(c => '"' + c[1] + '"').join(' / '); const [p, s] = PARTS[u]; return p ? 'Prefix "' + p.trim() + '"' : s ? 'Suffix "' + s + '"' : 'None'; };
const maxHint = i => i.u === '€' ? 'Max ' + eur(i.max * 10) : 'Max ' + nbFmt(i.max) + (i.u === '%' ? '%' : PARTS[i.u][1] ? ' ' + PARTS[i.u][1] : '');
const minHint = i => 'Min ' + (i.u === '€' ? eur(i.min) : nbFmt(i.min));
const keyboard = i => (i.step % 1 !== 0 || i.u === '%') ? 'decimal' : 'numeric';
const chipLabel = (u, v) => (CHIPS[u].find(c => c[0] === +v) || [0, ''])[1];
module.exports = { CHIPS, chipLabel, eur, nbFmt, PARTS, UNIT_NAME, boxText, unitDisplay, maxHint, minHint, keyboard };
