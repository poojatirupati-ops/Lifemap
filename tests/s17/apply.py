import sys
p = sys.argv[1]; s = open(p, encoding='utf-8').read()
def rep(a, b, cnt=1):
    global s
    c = s.count(a)
    if c != cnt: raise SystemExit('count %d != %d for %r' % (c, cnt, a[:90]))
    s = s.replace(a, b)
# 1. Discover Q8, Irish tone (journey-spec §17; scores, tags and line shapes unchanged)
rep("q:'Pick a road for your long-term money.', sub:'A flat road is steady but slower. A hilly road has bigger ups and downs, with more growth potential.'",
    "q:'Pick your road for your long-term money.', sub:'The motorway is steady but slower. The mountain pass has more twists and turns, and more room to grow.'")
rep("{e:'🛣️', tag:'Low risk', t:'Flat and steady'", "{e:'🛣️', tag:'Low risk', t:'Straight up the motorway'")
rep("{e:'🏞️', tag:'Cautious', t:'Gentle hills'", "{e:'🏞️', tag:'Cautious', t:'A quiet country road'")
rep("{e:'⛰️', tag:'Balanced', t:'Hills and dips'", "{e:'🌿', tag:'Balanced', t:'Up and down the boreens'")
rep("{e:'🏔️', tag:'High risk', t:'Mountain road, but exciting'", "{e:'🏔️', tag:'High risk', t:'Over the Healy Pass, hairpins and all'")
rep("// Flat and steady · Gentle hills · Hills and dips · Mountain road", "// Motorway · Quiet country road · Boreens · Healy Pass")
# 2. Explore order (§17): what-ifs → Focus on one area → Tools for you → videos → Calculators (same box/list style as the topics)
old_cat = """   '<div class="sec"><h3>Calculators</h3></div><div class="grid2">' + CATS.map(c => '<button class="tile ctile" style="background:' + c.color + '" data-a="cat" data-p="' + c.id + '"><span class="e" aria-hidden="true">' + c.em + '</span><span>' + esc(c.name) + '<br><small style="opacity:.92;font-weight:600">' + CALCS.filter(x => x.cat === c.id).length + ' tools</small></span></button>').join('') + '</div>' +
   '<div class="sec"><h3>Tools for you</h3></div><div class="hstrip">' + toolsForYou().map(toolTile).join('') + '</div>' + watchHTML() +
   '<div class="sec"><h3>Focus on one area</h3></div>' + TOPICS.map(t => '<button class="goal" data-a="topic" data-p="' + t[1] + '"><span class="ic" aria-hidden="true">' + t[0] + '</span><span style="flex:1"><b>' + t[1] + '</b><br><span class="small">' + t[2] + '</span></span><span class="chev" aria-hidden="true">›</span></button>').join('') +
"""
new_cat = """   '<div class="sec"><h3>Focus on one area</h3></div>' + TOPICS.map(t => '<button class="goal" data-a="topic" data-p="' + t[1] + '"><span class="ic" aria-hidden="true">' + t[0] + '</span><span style="flex:1"><b>' + t[1] + '</b><br><span class="small">' + t[2] + '</span></span><span class="chev" aria-hidden="true">›</span></button>').join('') +
   '<div class="sec"><h3>Tools for you</h3></div><div class="hstrip">' + toolsForYou().map(toolTile).join('') + '</div>' + watchHTML() +
   '<div class="sec"><h3>Calculators</h3></div>' + CATS.map(c => { const n = CALCS.filter(x => x.cat === c.id).length; return '<button class="goal" data-a="cat" data-p="' + c.id + '"><span class="ic" aria-hidden="true">' + c.em + '</span><span style="flex:1"><b>' + esc(c.name) + '</b><br><span class="small">' + esc(c.blurb) + ' · ' + n + ' tools</span></span><span class="chev" aria-hidden="true">›</span></button>'; }).join('') +
"""
rep(old_cat, new_cat)
rep("note:'Explore (from Lifecast): what-ifs for slipping goals first (after a plan), tools by life need (6 groups, 28 calculators), tools for you, short videos + live sessions, topics that lead to the right expert. Works before a plan.'",
    "note:'Explore (journey-spec §17 order): what-ifs for slipping goals first (after a plan), Focus on one area (topics that lead to the right expert), tools for you, short videos + live sessions, then Calculators: 6 groups as list rows, 28 calculators. Works before a plan.'")
# 3. Accessibility (§17): emoji are never read aloud in titles, headings, card titles, tiles, list rows, chips and buttons
helper = """/* ================= Emoji are decoration, never read aloud (journey-spec §17) =================
   In every title, heading, card title, tile, list row, chip, button and link, emoji runs are wrapped in aria-hidden spans,
   so the accessible name is words only. Runs on every render, the report, and any later partial update (MutationObserver). */
const EMO_RUN = /(?:\\p{Extended_Pictographic}|\\p{Regional_Indicator})(?:\\uFE0F|\\u20E3|[\\u{1F3FB}-\\u{1F3FF}]|\\u200D(?:\\p{Extended_Pictographic}|\\p{Regional_Indicator})\\uFE0F?|\\p{Regional_Indicator})*/gu;
const EMO_NAMED = 'h1,h2,h3,h4,h5,h6,[role=heading],.card > b,.card > div > b,.ck b,.mini > span:first-child,.mini > b,button,a,summary,label,.tag,.pill,.eyebrow,.otag';
function hideEmoji(root){ if (!root) return; const els = root.matches && root.matches(EMO_NAMED) ? [root] : []; root.querySelectorAll && els.push(...root.querySelectorAll(EMO_NAMED));
  els.forEach(el => { if (el.hasAttribute('aria-label') || el.closest('[aria-hidden="true"]')) return;
    const words = (() => { const c = el.cloneNode(true); c.querySelectorAll('[aria-hidden="true"]').forEach(x => x.remove()); return c.textContent.replace(EMO_RUN, '').trim(); })(); if (!words) return;   // never leave a control with no name
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {acceptNode:n => n.parentElement.closest('[aria-hidden="true"]') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT}), nodes = [];
    while (tw.nextNode()) { EMO_RUN.lastIndex = 0; if (EMO_RUN.test(tw.currentNode.nodeValue)) nodes.push(tw.currentNode); }
    nodes.forEach(n => { const f = document.createDocumentFragment(); let last = 0; const v = n.nodeValue; EMO_RUN.lastIndex = 0; let m;
      while ((m = EMO_RUN.exec(v))) { if (m.index > last) f.appendChild(document.createTextNode(v.slice(last, m.index))); const sp = document.createElement('span'); sp.setAttribute('aria-hidden', 'true'); sp.textContent = m[0]; f.appendChild(sp); last = m.index + m[0].length; }
      if (last < v.length) f.appendChild(document.createTextNode(v.slice(last))); n.parentNode.replaceChild(f, n); }); }); }
const emoObs = new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) hideEmoji(n.closest && n.closest(EMO_NAMED) ? n.closest(EMO_NAMED) : n); else if (n.nodeType === 3 && n.parentElement && !n.parentElement.closest('[aria-hidden="true"]')) { const h = n.parentElement.closest(EMO_NAMED); if (h) hideEmoji(h); } })));
"""
rep("let lastId = null, focusKey = null;\nfunction render(){", helper + "let lastId = null, focusKey = null;\nfunction render(){")
rep("  scr.innerHTML = html;\n", "  scr.innerHTML = html; hideEmoji(scr);\n")
rep("const R = document.getElementById('report'); R.innerHTML = h; R.classList.add('on');", "const R = document.getElementById('report'); R.innerHTML = h; hideEmoji(R); R.classList.add('on');")
rep("S = fresh(); side(); fit(); render();\n", "S = fresh(); side(); fit(); render();\n['screen', 'report'].forEach(id => emoObs.observe(document.getElementById(id), {childList:true, subtree:true, characterData:false}));\n")
open(p, 'w', encoding='utf-8').write(s); print('ok')
# Q8 layout: the longer Irish-tone answers sit in full-width rows; words, tag and line stack beside the emoji
s = open(p, encoding='utf-8').read()
a1 = """</span><span class="tx">' + esc(o.t) + '</span>' + (o.tag ?"""
a2 = """stroke-linecap="round"/></svg>' : '') + '</button>'"""
assert s.count(a1) == 1 and s.count(a2) == 1, (s.count(a1), s.count(a2))
s = s.replace(a1, """</span>' + (long && q.type === 'ride' ? '<span class="rcol">' : '') + '<span class="tx">' + esc(o.t) + '</span>' + (o.tag ?""").replace(a2, """stroke-linecap="round"/></svg>' : '') + (long && q.type === 'ride' ? '</span>' : '') + '</button>'""")
b = ".opt .otag{"
assert s.count(b) == 1
s = s.replace(b, ".opt.row1 .rcol{display:flex;flex-direction:column;align-items:flex-start;gap:6px;flex:1;min-width:0}.opt.row1 .rcol svg{width:100%;max-width:220px;height:24px}\n.opt .otag{")
open(p, 'w', encoding='utf-8').write(s); print('ok layout')
# Ask button (§17): hidden on onboarding (cover, D1, the 6 Discover questions, the reveal, Save your results, and their sheets)
s = open(p, encoding='utf-8').read()
a = """  html += '<button class="askfab" data-a="ask\""""
assert s.count(a) == 1, 'askfab'
s = s.replace(a, """  const onboarding = /^D([0-7]|R|S)$/.test(s.id);   // journey-spec §17: Ask appears once the customer enters the app
  if (!onboarding) html += '<button class="askfab" data-a="ask\"""")
open(p, 'w', encoding='utf-8').write(s); print('ok ask')
