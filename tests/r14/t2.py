import sys, json
sys.path.insert(0, '/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/r14')
from xl import XL
x = XL('/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/r14/out.xlsx')
x.setname('Fill_Example', 'Yes'); x.calc()
M = x.meta['D']; r0 = M['r0']
for k in ['mS','mB1','mB2','mP1','mEnd','mPaid','cS','cPaid','pS','pEnd','path']:
    print(k, x.getcell(M['sheet'], f"{M['cols'][k]}{r0}"), x.getcell(M['sheet'], f"{M['cols'][k]}{r0+1}"))
print(x.getcell('Plan debt months', 'A5'), x.getcell('Plan debt months','B6'), x.getcell('Plan debt months','C7'))
x.close()
