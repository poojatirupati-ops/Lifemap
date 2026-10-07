import sys,subprocess,re
f=sys.argv[1]; s=open(f).read()
def rp(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:90]); s=s.replace(a,b)
rp(".wi-out{background:var(--mist)",".wisec{border:1.5px solid #D5E0EA;border-radius:16px;padding:12px 14px;margin:14px 0 0}.wisec .wih{margin:0 0 4px;font-family:var(--fh);font-size:16px}.wi-live{background:var(--sea-l);border-radius:12px;padding:10px 12px;font-size:14px;line-height:1.45;margin-top:12px;color:var(--ink)}.wi-live.over{background:var(--dip-l)}.wi-live .wn{display:block;margin-top:4px;font-weight:700;color:var(--dip-t)}\n.wi-out{background:var(--mist)")
rp('<span class="flabel" id="sv-l">My monthly saving</span>','<span class="flabel" id="sv-l">Your saving today</span>')
# wiLive + new wiCard
a=s.index("function wiCard(){"); b=s.index("function resultsHTML(){")
new = r'''/* §24.2: the base saving ("Your monthly saving") and the what-if extra are separate sections, and a live line adds them up so they can't be confused. */
function wiLive(){ const P = project(), base = P.save.saveM, sp = Math.max(0, P.save.surplusM), m = +S.wi.m || 0, tot = Math.max(0, base + m), over = m !== 0 && tot > sp + 0.5;
  const h = !m ? 'Your saving today is <b>' + eur(base) + ' a month</b> · spare money about ' + eur(sp) + '. Add an extra amount to see what changes.'
    : 'With this what-if you\'d save <b>' + eur(tot) + ' a month</b> (' + eur(base) + (m > 0 ? ' + ' + eur(m) + ' extra' : ' − ' + eur(-m) + ' less') + ') · spare money about ' + eur(sp);
  return {h:h + (over ? '<span class="wn">⚠️ That\'s more than your spare money of about ' + eur(sp) + ' a month. It may only work if you cut back elsewhere.</span>' : ''), over, base, tot, sp, m}; }
function wiCard(){ const w = S.wi, gs = S.goals.slice().sort((a, b) => a.age - b.age), g = gById(w.g), L = wiLive();
  return '<div class="card" id="r-wi"><h3 class="h">What if…?</h3><p class="small" style="margin:0 0 10px">Try saving a bit more or less, or adding a one-off amount.</p>' +
    '<div class="fl" style="font-size:12px;font-weight:800;margin-bottom:6px">Growth assumptions</div>' + assumeToggle() + '<div style="height:10px"></div>' + inflChoice('wi') + '<p class="small" style="margin:8px 0 0"><button class="link" style="padding:0;font-size:13px" data-a="asmopen">Your assumptions</button> · prices, growth, retirement and emergency fund settings</p>' +
    '<div class="wisec" id="wi-base"><h4 class="wih">Your monthly saving</h4><p class="small" style="margin:0 0 2px">What you save now. Change it here, or leave it.</p>' + saveCtl() + saveNudge() + '</div>' +
    '<div class="wisec" id="wi-extra"><h4 class="wih" id="wi-extra-h">Try an extra amount for ' + esc(g ? g.name.toLowerCase() : 'a goal') + '</h4><p class="small" style="margin:0 0 8px">This is on top of your saving above. It only changes the what-if.</p>' +
    '<div class="fl" style="font-size:12px;font-weight:800;margin-bottom:6px">Put it towards</div><div class="chips" role="group" aria-label="Goal for the what-if">' + gs.map(x => '<button class="chip sm' + (w.g === x.id ? ' sel' : '') + '" aria-pressed="' + (w.g === x.id) + '" data-a="wig" data-p="' + x.id + '">' + x.e + ' ' + esc(x.name) + '</button>').join('') + '</div>' +
    '<div class="field" style="margin:14px 0 6px"><span class="flabel" id="wim-l">Extra each month</span><div class="wi-row"><button class="rb" data-a="wim" data-p="-25" aria-label="25 euro less">−</button><div class="wi-val">' + nbox('wi', 'm', w.m, '€', 'wim-l', {id:'wim-v', sign:true}) + '</div><button class="rb" data-a="wim" data-p="25" aria-label="25 euro more">+</button></div><input type="range" min="' + Math.min(-500, w.m) + '" max="' + Math.max(1000, w.m) + '" step="25" value="' + w.m + '" data-wi="m" aria-labelledby="wim-l" aria-valuetext="' + eur(w.m) + ' a month">' + nbHint('wi', 'm') + '<span class="small" id="wim-h">' + (w.m < 0 ? 'Saving less each month (affects your whole plan)' : w.m > 0 ? 'Extra each month towards ' + esc(g ? g.name.toLowerCase() : 'your goal') + (g && g.kind === 'retire' ? ' (counted as retirement saving)' : ' until it happens') : '−€500 to +€1,000 a month') + '</span></div>' +
    '<div class="field" style="margin:10px 0 0"><div class="flabel"><span id="wil-l">One-off amount</span>' + nbox('wi', 'l', w.l, '€', 'wil-l', {id:'wil-v'}) + '</div><input type="range" min="0" max="' + Math.max(50000, w.l) + '" step="500" value="' + w.l + '" data-wi="l" aria-labelledby="wil-l" aria-valuetext="' + eur(w.l) + '">' + nbHint('wi', 'l') + '<span class="small">Once, e.g. from savings or a bonus</span></div>' +
    '<div class="wi-live' + (L.over ? ' over' : '') + '" id="wi-live" role="status" aria-live="polite">' + L.h + '</div></div>' +
    '<div class="wi-out" id="wi-out" aria-live="polite"></div><div class="grid2" style="margin-top:12px"><button class="btn sm" style="width:100%" data-a="wisave">Save as my preferred plan</button><button class="btn sm ghost" style="width:100%" data-a="wireset">Back to my plan</button></div></div>'; }
'''
s=s[:a]+new+s[b:]
rp("  set('r-goals', goalsBox(P)); set('wi-out', wiText(P0, P));","  { const L = wiLive(), e = document.getElementById('wi-live'); if (e){ e.innerHTML = L.h; e.classList.toggle('over', L.over); } const gg = gById(S.wi.g), eh = document.getElementById('wi-extra-h'); if (eh) eh.textContent = 'Try an extra amount for ' + (gg ? gg.name.toLowerCase() : 'a goal'); }\n  set('r-goals', goalsBox(P)); set('wi-out', wiText(P0, P));")
open(f,'w').write(s)
m=re.findall(r'<script>(.*?)</script>',s,re.S)[-1]
open('/tmp/_chk.js','w').write(m)
print(subprocess.run(['node','--check','/tmp/_chk.js'],capture_output=True,text=True).stderr[:600] or 'syntax ok')
