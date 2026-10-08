from ed import Ed
e = Ed()
# --- §27.1: "Date has passed" (option C) and a "Change the date" button, never "in -4 years"
old = "function yearsTxt(g){ const n = g.age - S.about.age; return g.kind === 'legacy' ?"
assert old in e.t
e.rep(old, "const PASSED = 'Date has passed', passedG = g => g.kind !== 'legacy' && g.age < S.about.age;   // §27.1: a goal whose age is before today's age\nconst dateBtn = g => passedG(g) ? ' <button class=\"link\" style=\"font-size:12.5px\" data-a=\"gdate\" data-p=\"' + g.id + '\">Change the date</button>' : '';\nfunction yearsTxt(g){ if (passedG(g)) return PASSED; const n = g.age - S.about.age; return g.kind === 'legacy' ?")
e.rep("function whenTxt(g){ const n = g.age - S.about.age; if (g.kind === 'legacy') return 'At the end of your plan' + (asmMine('planEnd') ? ' (' + AS.end + ')' : ''); return (g.kind === 'retire'",
      "function whenTxt(g, edit){ const n = g.age - S.about.age; if (g.kind === 'legacy') return 'At the end of your plan' + (asmMine('planEnd') ? ' (' + AS.end + ')' : ''); if (passedG(g)) return edit ? 'Age ' + g.age + ' · ' + (YEAR0 + n) + ' · ' + PASSED.toLowerCase() : PASSED; return (g.kind === 'retire'")
e.rep("stepper('gyr', g.id, '<span id=\"when-' + g.id + '\">' + whenTxt(g) + '</span>', 'When')","stepper('gyr', g.id, '<span id=\"when-' + g.id + '\">' + whenTxt(g, true) + '</span>', 'When')")
e.rep("if (w) w.textContent = whenTxt(g); } };","if (w) w.textContent = whenTxt(g, true); } };")
e.rep("<span class=\"yr\">in ' + n + ' yr' + (n === 1 ? '' : 's') + '</span>'; }","<span class=\"yr\">' + (passedG(g) ? 'date passed' : 'in ' + n + ' yr' + (n === 1 ? '' : 's')) + '</span>'; }")
# results rows, Home glance, Plan list, recap
e.rep("<div class=\"nm\">' + esc(g.name) + ' <span>· ' + yearsTxt(g) + '</span></div>","<div class=\"nm\">' + esc(g.name) + ' <span>· ' + yearsTxt(g) + '</span>' + dateBtn(g) + '</div>")
e.rep("<span class=\"small\">· ' + yearsTxt(g) + '</span></span><span class=\"pill\"","<span class=\"small\">· ' + yearsTxt(g) + '</span>' + dateBtn(g) + '</span><span class=\"pill\"")
e.rep("<span class=\"small\">' + whenTxt(g) + ' · ' + eur(g.amount) + (g.kind === 'retire' ? ' a year' : '') + '</span></span></div>').join('')","<span class=\"small\">' + whenTxt(g) + ' · ' + eur(g.amount) + (g.kind === 'retire' ? ' a year' : '') + '</span>' + dateBtn(g) + '</span></div>').join('')")
# report
e.rep("(g.kind === 'retire' ? 'from age ' + g.age + ', ' + eur(g.amount) + ' a year' : 'age ' + g.age + ' (' + (YEAR0 + g.age - S.about.age) + '), ' + eur(g.amount)) + ' in today\\'s money","(passedG(g) ? 'date has passed, ' + eur(g.amount) + (g.kind === 'retire' ? ' a year' : '') : g.kind === 'retire' ? 'from age ' + g.age + ', ' + eur(g.amount) + ' a year' : 'age ' + g.age + ' (' + (YEAR0 + g.age - S.about.age) + '), ' + eur(g.amount)) + ' in today\\'s money")
# ask
e.rep("'When ' + esc(w.name.toLowerCase()) + ' comes up (age ' + w.age + '), your income and savings","'When ' + esc(w.name.toLowerCase()) + ' comes up' + (passedG(w) ? ' (its date has passed, so we count it from next year: change the date in My plan)' : ' (age ' + w.age + ')') + ', your income and savings")
# the action
e.rep("  gofix:p =>","  gdate:p => { S.tab = 'plan'; S.planSeg = ''; S.planEdit = false; S.tlHl = +p; S.sheet = null; render(); const r = document.getElementById('row-' + p); if (r){ r.scrollIntoView({block:'center', behavior:'instant'}); const b = r.querySelector('.stepper button'); if (b) b.focus({preventScroll:true}); } },\n  gofix:p =>")
e.save()
