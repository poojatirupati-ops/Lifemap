import sys
HTML='/home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'
class Ed:
    def __init__(s): s.t=open(HTML,encoding='utf-8').read(); s.n=0
    def rep(s,a,b,count=1):
        c=s.t.count(a)
        if c==0: raise SystemExit('NOT FOUND: '+a[:120])
        if count==1 and c!=1: raise SystemExit('AMBIGUOUS (%d): %s'%(c,a[:120]))
        s.t=s.t.replace(a,b); s.n+=1
    def save(s): open(HTML,'w',encoding='utf-8').write(s.t); print('saved',s.n,'edits')
