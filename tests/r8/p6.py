import sys
F='/home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'
h=open(F).read()
def rep(old,new,cnt=1):
    global h
    n=h.count(old)
    if n!=cnt: sys.exit('anchor %d x: %s'%(n,old[:100]))
    h=h.replace(old,new)
# side panel: no internal notes
rep("""<p><b>Clickable customer-journey prototype.</b> Follows <i>docs/journey-spec.md</i> §12: 6 Discover questions → money personality → save or skip → app (Home · Explore · My Plan · Me · Experts) → Make my plan (8 steps). Everything is simulated; no data leaves this page.</p>""",
    """<p><b>Clickable customer-journey prototype.</b> 6 Discover questions → money personality → save or skip → app (Home · Explore · My Plan · Me · Experts) → Make my plan (8 steps). Everything is simulated; no data leaves this page.</p>""")
rep("""<p style="margin-top:16px"><b>Reviewer notes:</b> the revenue model in "How LifeGoals makes money" is to be confirmed; the assumptions and risk scoring are to be confirmed by the Financial Planner.</p><p>Guidance, not advice. Projections are illustrative and use simple assumptions. Demo codes: <b>123456</b>.</p>""",
    """<p style="margin-top:16px">Prototype for demonstration. Figures are illustrative, not financial advice.</p><p>Demo codes: <b>123456</b>.</p>""")
rep("tools by life need (6 groups, 29 calculators)", "tools by life need (6 groups, 28 calculators)")
rep("""    : g.kind === 'need' ? 'We note a ' + (g.need === 'life' ? 'life cover' : 'income protection') + ' need of '""", """    : g.kind === 'need' ? 'We note ' + (g.need === 'life' ? 'a life cover' : 'an income protection') + ' need of '""")
# sliders announce the formatted value and unit while dragging
rep("""v[k] = +inp.value; S.calcT = S.calcT || {}; (S.calcT[c.id] = S.calcT[c.id] || {})[k] = true;
    const o = document.getElementById('co-' + k);""", """v[k] = +inp.value; S.calcT = S.calcT || {}; (S.calcT[c.id] = S.calcT[c.id] || {})[k] = true; inp.setAttribute('aria-valuetext', fmtIn(i, v[k]));
    const o = document.getElementById('co-' + k);""")
rep("""step="500" value="' + w.l + '" data-wi="l" aria-labelledby="wil-l">'""", """step="500" value="' + w.l + '" data-wi="l" aria-labelledby="wil-l" aria-valuetext="' + eur(w.l) + '">'""")
rep("""<input type="range" min="18" max="80" value="' + b.age + '" data-in="age" aria-labelledby="lab-age">'""", """<input type="range" min="18" max="80" value="' + b.age + '" data-in="age" aria-labelledby="lab-age" aria-valuetext="Age ' + b.age + '">'""")
rep("""ph.querySelectorAll('input[data-in="age"]').forEach(r => r.addEventListener('input', () => { S.about.age = +r.value;""", """ph.querySelectorAll('input[data-in="age"]').forEach(r => r.addEventListener('input', () => { S.about.age = +r.value; r.setAttribute('aria-valuetext', 'Age ' + S.about.age);""")
# an optional box (PRSI years) can be cleared back to blank
rep("""  if (n == null){ if (final){ inp.value = inp.dataset.last || inp.defaultValue; } return; }""", """  if (n == null){ if (final){ if (kind === 'asm' && ASM[key] && ASM[key].opt && inp.value.trim() === ''){ S.asm = Object.assign({}, S.asm); delete S.asm[key]; applyAssume(); render(); return; } inp.value = inp.dataset.last || inp.defaultValue; } return; }""")
open(F,'w').write(h); print('ok')
