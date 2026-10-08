import json,sys
sys.argv=['x']
from harness import *
d=json.load(open('scen_21.json'))
x=XL('/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/r14/out.xlsx')
for k in d:
    sc,out=k['sc'],k['out']; apply_sc(x,sc); feed_typed(x,sc,out); x.calc()
    print(sc['name'], len(sc['goals']), x.val('Slots_Funded'), x.val('Slots_TooMany'), x.val('Goal_RowsUsed'))
    print(x.val('Warn_Goals'))
x.close()
