let _mcv = null;
function textW(t, px){ // width of a bold label, measured with whatever font is rendering now
  try { _mcv = _mcv || document.createElement('canvas').getContext('2d'); _mcv.font = '700 ' + px + 'px Figtree, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'; return _mcv.measureText(t).width * 1.06 + 4; } catch (e) { return t.length * px * 0.62 + 4; } }
function journeySVG(P, W, land){
  // land = landscape phone: flatter road so the whole road fits the short screen
  const rows = P.rows, n = rows.length, wide = W > 500, H = land ? 324 : wide ? 380 : 300, pad = 18, mid = land ? 162 : wide ? 186 : 148, amp = land ? 20 : wide ? 34 : 24;
  const X = i => pad + i / (n - 1) * (W - 2 * pad), Y = i => mid + amp * Math.sin(i / (n - 1) * Math.PI * 2.4) - i / (n - 1) * 8;
  const Yx = x => { const f = clamp((x - pad) / (W - 2 * pad) * (n - 1), 0, n - 1), i = Math.floor(f), j = Math.min(n - 1, i + 1); return Y(i) + (Y(j) - Y(i)) * (f - i); };
  let base = '', road = '', ticks = '';
  for (let i = 0; i < n - 1; i++){ base += '<line x1="' + X(i) + '" y1="' + Y(i) + '" x2="' + X(i + 1) + '" y2="' + Y(i + 1) + '" stroke="#DCE4EC" stroke-width="' + (wide ? 16 : 13) + '" stroke-linecap="round"/>'; road += '<line x1="' + X(i) + '" y1="' + Y(i) + '" x2="' + X(i + 1) + '" y2="' + Y(i + 1) + '" stroke="' + rowCol(rows[i]) + '" stroke-width="' + (wide ? 9 : 7) + '" stroke-linecap="round"/>'; }
  rows.forEach((r, i) => { if (r.a % 10 === 0) ticks += '<text x="' + X(i) + '" y="' + (H - 6) + '" font-size="10.5" fill="#51627A" text-anchor="middle">age ' + r.a + '</text>'; });
  const a0 = rows[0].a, ri = rows.findIndex(r => r.rmark), fx = ri >= 0 ? X(ri) : null;
  // fixed items that milestones must keep clear of: "You, today", the retirement flag + label, the sunset
  const busy = [], box = (l, t, r, b) => ({l, t, r, b});
  let marks = '<circle cx="' + X(0) + '" cy="' + Y(0) + '" r="6.5" fill="var(--ink)" stroke="#fff" stroke-width="2"/><text x="' + (X(0) - 6) + '" y="' + (Y(0) + 24) + '" font-size="11" font-weight="800" fill="var(--ink)">You, today</text>';
  busy.push(box(X(0) - 9, Y(0) - 9, X(0) - 6 + textW('You, today', 11), Y(0) + 28));
  if (ri >= 0){ const fr = fx > W - 90, fl = 'Retire ' + rows[ri].a, fw = textW(fl, 11);
    marks += '<line x1="' + fx + '" y1="' + Y(ri) + '" x2="' + fx + '" y2="' + (Y(ri) - 44) + '" stroke="var(--ink)" stroke-width="2.5"/><path d="M' + fx + ' ' + (Y(ri) - 44) + ' l24 7 l-24 7 z" fill="#E4518A"/><text x="' + (fx + (fr ? -6 : 4)) + '" y="' + (Y(ri) - 50) + '" font-size="11" font-weight="800" fill="var(--ink)" text-anchor="' + (fr ? 'end' : 'start') + '">' + fl + '</text>';
    busy.push(box(fr ? fx - 6 - fw : fx - 3, Y(ri) - 64, fr ? fx + 27 : Math.max(fx + 27, fx + 4 + fw), Y(ri) + 4)); }
  const sx = X(n - 1) - 8, sy = Y(n - 1) - 12;
  marks += '<text x="' + sx + '" y="' + sy + '" font-size="18" aria-hidden="true">🌅</text>'; busy.push(box(sx - 2, sy - 22, sx + 26, sy + 6));
  // milestones: strictly alternate above / below the road in age order; each hangs on a dashed leader from its exact age point.
  // If a neighbour on the same side is in the way, step out to the next tier and/or nudge sideways (leader angles back).
  const gs = S.goals.filter(g => g.kind !== 'retire').slice().sort((a, b) => a.age - b.age || a.id - b.id);
  const R = wide ? 18 : 13, LH = wide ? 15 : 0, gapV = 4, first = R + (wide ? 12 : 10), step = 2 * R + LH + gapV + (wide ? 2 : 4);
  const top = 4, bottom = H - 20, hit = (a, c) => a.l < c.r && c.l < a.r && a.t < c.b && c.t < a.b;
  const placed = [];
  gs.forEach((g, k) => { const i = clamp(g.age - a0, 0, n - 1), cx = X(i), cy = Y(i), up = k % 2 === 0;
    const nm = g.name.length > 16 ? g.name.slice(0, 15) + '…' : g.name, lw = wide ? textW(nm, 11) : 0;
    const cands = [], ns = wide ? 22 : 16, ringU = (2 * R + 4) / ns;
    for (let t = 0; t < 6; t++) for (let s = -Math.ceil(W / ns); s <= Math.ceil(W / ns); s++) cands.push({t, dx:s * ns, c:t + Math.abs(s) / ringU + (s < 0 ? 0.35 : 0)});
    cands.sort((a, b) => a.c - b.c || a.t - b.t);
    let best = null;
    for (const c of cands){ const x = cx + c.dx; if (x - R < 2 || x + R > W - 2) continue;
      let ext = cy; for (let xx = x - R - 4; xx <= x + R + 4; xx += 4){ const yy = Yx(xx); ext = up ? Math.min(ext, yy) : Math.max(ext, yy); }
      const y = up ? ext - first - c.t * step : ext + first + c.t * step;
      const lx = wide ? clamp(x, lw / 2 + 2, W - lw / 2 - 2) : x, ly = up ? y - R - 5 : y + R + 14;
      const rb = box(x - R - 2, y - R - 2, x + R + 2, y + R + 2), lb = wide ? box(lx - lw / 2, up ? y - R - LH - 3 : y + R + 1, lx + lw / 2, up ? y - R - 1 : y + R + LH + 3) : null;
      const bb = [rb].concat(lb ? [lb] : []);
      if (bb.some(b => b.t < top || b.b > bottom)) continue;
      if (bb.some(b => busy.some(o => hit(b, o)))) continue;
      best = {x, y, lx, ly, bb}; break; }
    if (!best) best = {x:cx, y:up ? cy - first : cy + first, lx:cx, ly:up ? cy - first - R - 5 : cy + first + R + 14, bb:[]};
    best.bb.forEach(b => busy.push(b)); placed.push({g, cx, cy, nm, ...best}); });
  let lead = '', ms = '';
  placed.forEach(m => { const p = P.pct[m.g.id], col = 'var(--' + band(p) + ')';
    lead += '<line x1="' + m.cx.toFixed(1) + '" y1="' + m.cy.toFixed(1) + '" x2="' + m.x.toFixed(1) + '" y2="' + m.y.toFixed(1) + '" stroke="#9FB3C4" stroke-width="1.5" stroke-dasharray="3 3"/><circle cx="' + m.cx.toFixed(1) + '" cy="' + m.cy.toFixed(1) + '" r="3" fill="#fff" stroke="var(--ink)" stroke-width="1.5"/>';
    ms += '<g><circle cx="' + m.x.toFixed(1) + '" cy="' + m.y.toFixed(1) + '" r="' + R + '" fill="#fff" stroke="' + col + '" stroke-width="3.5"/><text x="' + m.x.toFixed(1) + '" y="' + (m.y + (wide ? 6 : 4.5)).toFixed(1) + '" font-size="' + (wide ? 16 : 12.5) + '" text-anchor="middle">' + m.g.e + '</text>' +
      (wide ? '<text x="' + m.lx.toFixed(1) + '" y="' + m.ly.toFixed(1) + '" font-size="11" font-weight="700" fill="var(--ink)" text-anchor="middle">' + esc(m.nm) + '</text>' : '') + '<title>' + esc(m.g.name) + ', age ' + m.g.age + ': ' + p + '% covered, ' + BANDW[band(p)].toLowerCase() + '</title></g>'; });
  const desc = 'Road from age ' + a0 + ' to 90. ' + (rows.some(isShort) ? 'Some purple shortfall years.' : 'No shortfall years.');
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="' + desc + '"' + (land ? ' class="road-land"' : '') + ' style="display:block;margin-top:6px">' + base + road + lead + marks + ms + ticks + '</svg>' +
    (wide ? '' : '<div class="mlist">' + gs.map(g => { const p = P.pct[g.id]; return '<div><span class="sw" style="border-radius:6px;background:var(--' + band(p) + ')"></span><span aria-hidden="true">' + g.e + '</span> ' + esc(g.name) + ' <span class="small">· age ' + g.age + ' · <b style="color:var(--' + band(p) + '-t)">' + p + '% · ' + BANDW[band(p)] + '</b></span></div>'; }).join('') + '</div>');
}
