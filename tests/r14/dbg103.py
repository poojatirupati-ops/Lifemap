import json,sys
sys.argv=['x']
from harness import *
d=json.load(open('scen_all2.json')); k=[i for i,x in enumerate(d) if x['sc'].get('name')=='rnd-103'][0]
sc,out=d[k]['sc'],d[k]['out']
x=XL('/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/r14/final_run.xlsx')
apply_sc(x,sc); feed_typed(x,sc,out); feed_before(x,sc,out); x.calc()
for K in range(1,5):
    print(K, [x.val(f'Slot{K}_{n}') for n in ('Key','Age','Amount','Cost','Paid','Pct')])
r=out['rows']
age=sc['about']['age']
for i,g in enumerate(sc['goals']):
    if g['k']=='wealth':
        t=g['age']-age; print('wealth due t',t, 'row goalCost',r[t]['goalCost'],'goalPaid',r[t]['goalPaid'])
x.close()
