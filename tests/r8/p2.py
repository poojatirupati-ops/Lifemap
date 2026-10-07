import sys
F='/home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'
h=open(F).read()
def rep(old,new,cnt=1):
    global h
    n=h.count(old)
    if n!=cnt: sys.exit('anchor %d x: %s'%(n,old[:90]))
    h=h.replace(old,new)
rep("spF = yrsSP != null ? spFrac(+yrsSP) : f.sp === 'Expect full' ? 1 : f.sp === 'Partly' ? +asmV('spPartly') : +asmV('spNotSure');",
    "spF = yrsSP != null ? spFrac(+yrsSP) : f.sp === 'Expect full' ? 1 : Math.min(1, +asmV('spWeek') / RI.sp.week);   // §14 type 2: the customer's own weekly amount when they don't know their years")
rep("pSp = {'Own full':1, 'Own partial':+asmV('spPartly'), 'Not sure':+asmV('spNotSure'), 'Qualified adult increase':'qa', 'None':0}[pSpO];",
    "pSp = {'Own full':1, 'Own partial':Math.min(1, +asmV('pSpWeek') / RI.sp.week), 'Not sure':Math.min(1, +asmV('pSpWeek') / RI.sp.week), 'Qualified adult increase':'qa', 'None':0}[pSpO];")
rep("    pension:n('pension'), pensionM:penM, pensionOwnM:own, penG:penGrowth(), sp:spF, pSp, pSpO, ae:aeElig && f.ae !== 'No', aeElig,",
    "    pension:n('pension'), pensionM:penM, pensionOwnM:own, penG:penGrowth(), sp:spF, spKnown:yrsSP != null || f.sp === 'Expect full' || asmMine('spWeek'), pSp, pSpO, ae:aeElig && f.ae !== 'No', aeElig, mortRateKnown:n('mortRate') > 0 || asmMine('mortRate'),")
rep("  return {cardBal:c, cardRate:cR, cardPayM,", "  return {cardRateKnown:n('cardRate') > 0 || asmMine('cardRate'), loanRateKnown:n('loanRate') > 0 || asmMine('loanRate'), cardBal:c, cardRate:cR, cardPayM,")
open(F,'w').write(h); print('ok')
