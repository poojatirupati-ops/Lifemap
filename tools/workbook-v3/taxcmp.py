import sys,json
sys.path.insert(0,'/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/c26/tools/plan-vs-xlsx')
from xl import XL
import harness
S='/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/'
path,allj,appj=sys.argv[1],sys.argv[2],sys.argv[3]
hc=json.load(open(S+'wb3/letters.json'))['hc']
app=json.load(open(appj)); allv=json.load(open(allj)); x=XL(path); bad=0
for s in allv:
    nm=s['sc']['name']
    if nm not in app: continue
    harness.apply_sc(x,s['sc'],s['out']); x.calc()
    N=s['out']['N']; diffs=[]
    for t in range(N+1):
        r=8+t; a=app[nm][t]
        g=lambda k: x.getcell('Plan holdings',f'{hc[k]}{r}') or 0
        pairs=[('exitDeemed',a['exitDeemed'],g('deemed')),('taxOnSales',a['taxOnSales'],g('saleTax')),('dirt',a['dirt'],g('dirt')),('cash',a['cash'],g('cashE')),('sav',a['sav'],g('savE')),('inv',a['inv'],g('invE')),('oth',a['oth'],g('othE')),('alt',a['alt'],g('altE')),
               ('sold_inv',a['sold']['inv'],g('netInv')),('sold_oth',a['sold']['oth'],g('netO')),('sold_alt',a['sold']['alt'],g('netA')),('sold_cash',a['sold']['cash'],g('cashT')),('sold_sav',a['sold']['sav'],g('savT'))]
        for k,av,wv in pairs:
            if abs((av or 0)-(wv or 0))>1.0: diffs.append((t,k,round(av,1),round(wv,1)))
    if diffs: bad+=1; print('DIFF',nm,len(diffs),diffs[:6])
print('compared',len([s for s in allv if s['sc']['name'] in app]),'with diffs',bad)
x.close()
