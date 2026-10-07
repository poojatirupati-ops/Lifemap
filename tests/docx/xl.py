import openpyxl, json, re
wb=openpyxl.load_workbook('/home/user/lifegoals-prototype/deliverables/LifeGoals-Calculators.xlsx')
wbv=openpyxl.load_workbook('/home/user/lifegoals-prototype/deliverables/LifeGoals-Calculators.xlsx',data_only=True)
names={}
dn = wb.defined_names
items = dn.items() if hasattr(dn,'items') else [(d.name,d) for d in dn.definedName]
for n,d in items:
    for sh,ref in d.destinations:
        ref=ref.replace('$','')
        names[(sh,ref)]=n
for ws in wb.worksheets:
    for n,d in ws.defined_names.items() if hasattr(ws,'defined_names') else []:
        for sh,ref in d.destinations: names[(sh,ref.replace('$',''))]=n

out={}
for ws in wb.worksheets:
    if not re.match(r'C\d\d ',ws.title): continue
    sec=None; grp=None; ins=[]; res=[]; plan=[]
    for row in ws.iter_rows(min_row=1,max_row=ws.max_row):
        b=row[1].value; c=row[2].value
        if c=='Your figure': sec='in'; grp=b; continue
        if c=='Result': sec='res'; continue
        if isinstance(b,str) and b.startswith('FROM YOUR STATEMENT'): sec='in'; grp='FROM YOUR STATEMENT'; continue
        if isinstance(b,str) and b.startswith('ADD TO MY PLAN'): sec='plan'; continue
        if isinstance(b,str) and b.isupper() and len(b)>3: sec=None; continue
        if b is None: continue
        nm=names.get((ws.title,'C%d'%row[0].row))
        if sec=='in' and (row[4].value or row[3].value): ins.append({'group':grp,'label':b,'value':row[2].value,'unit':row[3].value,'allowed':(wbv[ws.title].cell(row=row[0].row,column=5).value if str(row[4].value or '').startswith('=') else row[4].value),'allowedF':(row[4].value if str(row[4].value or '').startswith('=') else None),'name':nm})
        elif sec=='res' and nm: res.append({'label':b,'unit':row[3].value if not str(row[3].value or '').startswith('=') else None,'name':nm})
        elif sec=='plan' and nm: plan.append({'label':b,'name':nm})
    out[ws.title[:3]]={'sheet':ws.title,'title':ws['B1'].value,'inputs':ins,'results':res,'plan':plan}
import collections
allnames=collections.defaultdict(list)
for n,d in items:
    for sh,ref in d.destinations: allnames[(sh,ref.replace('$',''))].append(n)
from openpyxl.utils import get_column_letter as CL
def dump(sh,r0,r1,ncol):
    ws=wbv[sh]; rows=[]
    for r in range(r0,r1+1):
        cells=[]
        for c in range(1,ncol+1):
            v=ws.cell(row=r,column=c).value
            cells.append(['' if v is None else str(v), allnames.get((sh,'%s%d'%(CL(c),r)),[])])
        rows.append(cells)
    return rows
out['_settings']={'rows':dump('Settings',1,wbv['Settings'].max_row,13),'intro':wbv['Settings']['A2'].value or wbv['Settings']['B2'].value}
out['_lists']={'rows':dump('Your lists',1,wbv['Your lists'].max_row,7),'intro':wbv['Your lists']['B2'].value}
import re as _re
pat=_re.compile(r'(?:Cards_|Loans_|Debts_|Pens_|Cover_|IP_Listed|CI_Listed|Health_Listed)\w*')
fb={}
for ws in wb.worksheets:
    if not _re.match(r'C\d\d ',ws.title): continue
    for row in ws.iter_rows():
        for c in row:
            if isinstance(c.value,str) and c.value.startswith('=') and pat.search(c.value) and c.column_letter=='G':
                fb.setdefault(ws.title[:3],[]).append([c.coordinate, str(ws.cell(row=c.row,column=2).value), sorted(set(pat.findall(c.value)))])
out['_fallback']=fb
out['_partner']={'rows':[]}
json.dump(out,open('xl.json','w'),indent=1,default=str)
for k,v in [kv for kv in out.items() if not kv[0].startswith('_')]: print(k, v['sheet'], len(v['inputs']), len(v['results']), len(v['plan']), sum(1 for i in v['inputs'] if not i['name']), set(i['group'] for i in v['inputs']))
