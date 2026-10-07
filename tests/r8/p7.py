import sys
F='/home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'
h=open(F).read()
def rep(old,new,cnt=1):
    global h
    n=h.count(old)
    if n!=cnt: sys.exit('anchor %d x: %s'%(n,old[:100]))
    h=h.replace(old,new)
rep("""const ruleCount = () =>""", """// Law figures quoted in copy, built once from the register (§14: every figure quoted once, from the single rules register)
const LAW = {ls:'up to ' + '€' + RI.pen.lsTaxFree.toLocaleString('en-IE') + ' tax-free and the next €' + (RI.pen.lsCap - RI.pen.lsTaxFree).toLocaleString('en-IE') + ' taxed at ' + Math.round(RI.pen.lsBandRate * 100) + '%',
  arf:'from 61 you must take at least ' + Math.round(RI.pen.arfMin61 * 100) + '% a year (' + Math.round(RI.pen.arfMin71 * 100) + '% from 71)',
  sp:'A full State Pension needs ' + RI.sp.fullYears + ' years (' + (RI.sp.fullYears * 52).toLocaleString('en-IE') + ' weeks) of PRSI contributions and credits. You need at least ' + RI.sp.minYears + ' years of paid contributions to qualify.',
  ae:'Employees aged ' + RI.ae.ageMin + '–' + RI.ae.ageMax + ' earning over €' + RI.ae.earnMin.toLocaleString('en-IE') + ' with no pension are enrolled from ' + RI.ae.start + ': you pay ' + RI.ae.ee * 100 + '% of pay, your employer ' + RI.ae.er * 100 + '% and the State ' + RI.ae.state * 100 + '%.',
  stamp:Math.round(RI.home.stamp[0][1] * 100) + '% up to €' + (RI.home.stamp[0][0] / 1e6) + 'm'};
const ruleCount = () =>""")
rep("""hint:'Employees aged 23–60 earning over €20,000 with no pension are enrolled from 2026: you pay 1.5% of pay, your employer 1.5% and the State 0.5%. We assume yes unless you say no'""", """hint:LAW.ae + ' Set by law, so we count you in unless you say no'""")
rep("""hint:'A full State Pension needs 40 years (2,080 weeks) of PRSI contributions and credits. You need at least 10 years of paid contributions to qualify. Check your record on MyWelfare'""", """hint:LAW.sp + ' Check your record on MyWelfare'""")
rep(""">A full State Pension needs 40 years (2,080 weeks) of PRSI contributions and credits. You need at least 10 years of paid contributions to qualify. Check your record on MyWelfare.""", """>' + LAW.sp + ' Check your record on MyWelfare.""")
rep("""pays the stamp duty (1% up to €1m)""", """pays the stamp duty (' + LAW.stamp + ')""")
rep("""help:'Stamp duty is set by law and added on top: 1% up to €1m.'""", """help:'Stamp duty is set by law and added on top: ' + LAW.stamp + '.'""")
rep("""'Most pensions can\\'t be taken before 60""", """'Most pensions can\\'t be taken before ' + RI.pen.earliestAge + '""")
rep("""About 25% of the fund can be taken as a lump sum: the first €200,000 tax-free, the next €300,000 at 20%.'""", """About ' + Math.round(RI.pen.lsMaxPct * 100) + '% of the fund can be taken as a lump sum: ' + LAW.ls + '.'""")
rep("""From 61 you must take at least 4% a year (5% from 71)""", """' + LAW.arf.charAt(0).toUpperCase() + LAW.arf.slice(1) + '""")
rep("""lump sum: up to €200,000 tax-free and the next €300,000 taxed at 20%. '""", """lump sum: ' + LAW.ls + '. '""")
rep("""help:'Set by law: up to €200,000 is tax-free and the next €300,000 is taxed at 20%. Your adviser can compare it with leaving it invested.'""", """help:'Set by law: ' + LAW.ls + '. Your adviser can compare it with leaving it invested.'""")
rep("""help:'Set by law: from 61 you must take at least 4% a year from an ARF (5% from 71).'""", """help:'Set by law: ' + LAW.arf + ' from an ARF.'""")
open(F,'w').write(h); print('ok')
