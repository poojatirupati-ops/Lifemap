const RX = { eur:'−?€\\d{1,3}(?:,\\d{3})*', seur:'(?:\\+|−)€\\d{1,3}(?:,\\d{3})*', int:'-?\\d+', num:'-?\\d+(?:\\.\\d+)?', d1:'-?\\d+\\.\\d', d2:'-?\\d+\\.\\d{2}', pct:'-?\\d+(?:\\.\\d{1,2})?%', yrs:'(?:\\d+ yrs?(?: \\d+ mo)?|\\d+ months?)', yrn:'-?\\d+(?:\\.\\d+)? years?', raw:'[^ ]+', eurw:'€\\d+(?:\\.\\d{2})?' };
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// parse template with {ph} and nested «a|b» into regex source
function compile(t, ph){ let i = 0;
  function seq(stop){ let out = ''; while (i < t.length){ const ch = t[i];
      if (stop.includes(ch)) return out;
      if (ch === '«'){ i++; const alts = [seq('|»')]; while (t[i] === '|'){ i++; alts.push(seq('|»')); } if (t[i] !== '»') throw new Error('unclosed « in ' + t); i++; out += '(?:' + alts.join('|') + ')'; continue; }
      if (ch === '{'){ const j = t.indexOf('}', i); const name = t.slice(i + 1, j); const p = ph[name]; if (!p) throw new Error('unknown placeholder {' + name + '} in ' + t); out += '(' + RX[p[0]] + ')'; i = j + 1; continue; }
      out += esc(ch); i++; }
    return out; }
  const src = seq(''); return new RegExp('^' + src.replace(/ +/g, ' +') + '$'); }
const norm = s => String(s).replace(/\s+/g, ' ').trim();
function matchAny(list, s, ph){ return list.some(([t]) => compile(t, ph).test(norm(s))); }
module.exports = { compile, norm, matchAny, RX };
