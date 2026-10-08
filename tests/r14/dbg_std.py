import json,sys
sys.argv=['x']
from harness import *
d=json.load(open('scen_rnd3.json')); k=[i for i,x in enumerate(d) if x['sc'].get('name')=='rnd-82'][0]
sc,out=d[k]['sc'],d[k]['out']
x=XL('/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/r14/out.xlsx')
apply_sc(x,sc); feed_typed(x,sc,out); x.calc()
print(x.val('Std_Need'), x.val('Std_Left'))
import openpyxl
wb=openpyxl.load_workbook('out.xlsx')
for n in wb.defined_names.keys():
    if n.startswith('Std_') or n.startswith('ASMN'): print(n, wb.defined_names[n].attr_text)

for n in ['In_pensionM','Has_pensionOwnM','In_pensionOwnM','In_work','RG_Exists','Has_spYears','Has_a_spYears']: print(n, x.val(n))
x.close()
