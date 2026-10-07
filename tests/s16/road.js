// Generates the placeholder "photo": a winding road through green hills (390 x 844, sliced to cover)
const bez = (p, t) => { const u = 1 - t; return [0, 1].map(i => u*u*u*p[0][i] + 3*u*u*t*p[1][i] + 3*u*t*t*p[2][i] + t*t*t*p[3][i]); };
// centreline from the horizon (t=0) to the bottom (t=1), as joined cubic segments
const segs = [[[236,352],[246,372],[214,388],[220,410]], [[220,410],[228,440],[292,462],[268,520]], [[268,520],[244,578],[112,610],[150,700]], [[150,700],[166,760],[196,800],[204,860]]];
const pts = []; segs.forEach((s, j) => { for (let i = 0; i <= 40; i++) { if (j && !i) continue; pts.push(bez(s, i / 40)); } });
const N = pts.length, half = k => 2 + 92 * Math.pow(k / (N - 1), 1.9);
const L = [], R = [], nrm = [];
pts.forEach((p, k) => { const a = pts[Math.max(0, k - 1)], b = pts[Math.min(N - 1, k + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, h = half(k);
  nrm.push([nx, ny]); L.push([p[0] + nx * h, p[1] + ny * h]); R.push([p[0] - nx * h, p[1] - ny * h]); });
const f = v => v.toFixed(1), poly = a => a.map(p => f(p[0]) + ',' + f(p[1])).join(' ');
const road = poly(L.concat(R.slice().reverse()));
const verge = (side, w) => poly(side.map((p, k) => [p[0] + nrm[k][0] * half(k) * w * (side === L ? 1 : -1), p[1] + nrm[k][1] * half(k) * w * (side === L ? 1 : -1)]).concat(side.slice().reverse()));
let dashes = ''; for (let k = 6; k < N - 3; k += 6) { const w = Math.max(.4, half(k) * .035), a = pts[k], b = pts[Math.min(N - 1, k + 3)], n = nrm[k];
  dashes += '<polygon points="' + poly([[a[0] + n[0] * w, a[1] + n[1] * w], [b[0] + n[0] * w, b[1] + n[1] * w], [b[0] - n[0] * w, b[1] - n[1] * w], [a[0] - n[0] * w, a[1] - n[1] * w]]) + '"/>'; }
const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">' +
 '<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FD0EA"/><stop offset=".55" stop-color="#D7ECF2"/><stop offset="1" stop-color="#FBE8C6"/></linearGradient>' +
 '<radialGradient id="g" cx=".74" cy=".33" r=".42"><stop offset="0" stop-color="#FFF6DC" stop-opacity=".95"/><stop offset="1" stop-color="#FFF6DC" stop-opacity="0"/></radialGradient>' +
 '<linearGradient id="h1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9DC3B4"/><stop offset="1" stop-color="#86B6A0"/></linearGradient>' +
 '<linearGradient id="h2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7DB47F"/><stop offset="1" stop-color="#5E9A63"/></linearGradient>' +
 '<linearGradient id="h3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5FA066"/><stop offset="1" stop-color="#3C7A47"/></linearGradient>' +
 '<linearGradient id="h4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4A8E55"/><stop offset="1" stop-color="#24543A"/></linearGradient>' +
 '<linearGradient id="rd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B9B7AE"/><stop offset="1" stop-color="#6F7470"/></linearGradient></defs>' +
 '<rect width="390" height="844" fill="url(#s)"/><rect width="390" height="844" fill="url(#g)"/><circle cx="292" cy="268" r="30" fill="#FFF3D0"/>' +
 '<g fill="#fff" opacity=".75"><ellipse cx="88" cy="150" rx="58" ry="13"/><ellipse cx="118" cy="140" rx="34" ry="14"/><ellipse cx="300" cy="96" rx="44" ry="9"/><ellipse cx="200" cy="208" rx="36" ry="7"/></g>' +
 '<path d="M0 330 C60 300 120 312 170 326 C220 338 270 300 330 310 C360 316 380 322 390 326 V420 H0Z" fill="url(#h1)"/>' +
 '<path d="M0 362 C70 340 140 352 200 360 C260 368 320 338 390 348 V470 H0Z" fill="url(#h2)"/>' +
 '<g fill="#8EC48C" opacity=".55"><path d="M20 372 L120 360 L150 392 L40 404Z"/><path d="M262 362 L350 352 L376 380 L280 392Z"/></g>' +
 '<g fill="#2F6A3C" opacity=".55"><path d="M0 404 C60 396 120 398 160 402" stroke="#2F6A3C" stroke-width="3" fill="none"/><path d="M250 400 C300 394 350 392 390 396" stroke="#2F6A3C" stroke-width="3" fill="none"/></g>' +
 '<path d="M0 420 C80 396 150 416 210 430 C270 444 330 410 390 414 V600 H0Z" fill="url(#h3)"/>' +
 '<g fill="#2B6236" opacity=".6"><circle cx="40" cy="438" r="7"/><circle cx="52" cy="436" r="6"/><circle cx="330" cy="430" r="7"/><circle cx="343" cy="433" r="6"/><circle cx="356" cy="430" r="5"/><circle cx="120" cy="452" r="5"/></g>' +
 '<path d="M0 520 C90 486 170 520 250 540 C320 556 360 520 390 516 V844 H0Z" fill="url(#h4)"/>' +
 '<polygon points="' + verge(L, .12) + '" fill="#8A9A72" opacity=".7"/><polygon points="' + verge(R, .12) + '" fill="#8A9A72" opacity=".7"/>' +
 '<polygon points="' + road + '" fill="url(#rd)"/><g fill="#F6F1E3" opacity=".9">' + dashes + '</g>' +
 '<g fill="#1E4A30" opacity=".55"><circle cx="70" cy="560" r="14"/><circle cx="88" cy="556" r="11"/><circle cx="340" cy="590" r="16"/><circle cx="360" cy="584" r="12"/><circle cx="24" cy="640" r="18"/></g></svg>';
require('fs').writeFileSync(__dirname + '/road.svg', svg); console.log(svg.length);
