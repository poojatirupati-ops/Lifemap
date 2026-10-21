import sys,json
sys.path.insert(0,'/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/c26/tools/plan-vs-xlsx')
from xl import XL
import harness
W='/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/'
path,allj,name,y0,y1=sys.argv[1],sys.argv[2],sys.argv[3],int(sys.argv[4]),int(sys.argv[5])
L=json.load(open(W+'wb3/letters.json')); hc=L['hc']; cf=L['cf']
x=XL(path); allv=json.load(open(allj))
sc=[s for s in allv if s['sc']['name']==name][0]
harness.apply_sc(x,sc['sc'],sc['out']); x.calc()
for t in range(y0,y1+1):
    r=8+t; g=lambda k: round(x.getcell('Plan holdings',f'{hc[k]}{r}') or 0)
    c=lambda k: round(x.getcell('Plan cashflow',f'{cf[k]}{r}') or 0)
    print('wb t',t,'inflow',c('inflow'),'living',c('living'),'fixed',c('fixed'),'used',c('used'),'saved',c('saved'),'spent',c('spent'),'liquid',c('liquid'),'| cash',g('cashE'),'sav',g('savE'),'inv',g('invE'),'oth',g('othE'),'alt',g('altE'),'| take',g('take'),'avail',g('avail'),'addPost',g('addPost'),'netInv',g('netInv'),'xInv',g('xInv'),'deemed',g('deemed'),'saleTax',g('saleTax'))
x.close()
