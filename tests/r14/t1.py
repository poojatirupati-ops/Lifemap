import sys, json
sys.path.insert(0, '/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/r14')
from xl import XL
x = XL('/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/r14/out.xlsx')
x.setname('Fill_Example', 'Yes'); x.calc()
M = x.meta['C']; r0 = M['r0']
for n in ['F_EssM', 'F_MortPayM', 'F_CardPayM', 'F_LoanPayM', 'F_PenG', 'AS_Inv', 'F_N', 'Init_Free0', 'Init_Buf0', 'GR', 'Slot1_Cost', 'Slot1_Age', 'Slot2_Cost', 'Slot3_Cost', 'Slot4_Cost']:
    print(n, x.val(n))
for t in (0, 1, 2):
    row = r0 + t
    print(t, {k: x.getcell(M['sheet'], f"{M['cols'][k]}{row}") for k in ['inflow', 'living', 'fixed', 'goalPaid', 'short', 'saved', 'spent', 'liquid', 'pen']})
x.close()
