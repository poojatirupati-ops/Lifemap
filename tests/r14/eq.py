import json,sys,subprocess,openpyxl
sys.argv=['x']
from harness import *
from com.sun.star.beans import PropertyValue
d=json.load(open('scen_all.json'))
x=XL('/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/r14/final.xlsx')
names=['Home_Avg','Home_OnTrack','Save_SaveM','Find_Strength','Find_Gap','Find_Decision','Gate_Text','Prof_Label','Fnd1_S','Fnd2_S','Fnd3_S','Fnd4_S','Fnd5_S']+[f'GR{i}_Pct' for i in range(1,9)]+[f'GR{i}_Line' for i in range(1,9)]
res=[]
for k in (3,40,90,150,182):
    sc,out=d[k]['sc'],d[k]['out']; x.clear()
    apply_sc(x,sc); feed_typed(x,sc,out); x.calc()
    ref={n:x.val(n) for n in names}
    p=PropertyValue(); p.Name='FilterName'; p.Value='Calc MS Excel 2007 XML'
    path=f'/tmp/eq{k}.xlsx'; x.doc.storeToURL('file://'+path,(p,))
    subprocess.run(['python3','/mnt/skills/public/xlsx/scripts/recalc.py',path,'120'],capture_output=True)
    wb=openpyxl.load_workbook(path,data_only=True); wbf=openpyxl.load_workbook(path)
    diff=0
    for n in names:
        sh,cell=wbf.defined_names[n].attr_text.rsplit('!',1); v=wb[sh.strip("'")][cell.replace('$','')].value
        a=ref[n]; 
        if v is None: v=''
        if isinstance(a,float) and isinstance(v,(int,float)): ok=abs(a-v)<1e-6
        else: ok=(str(a)==str(v))
        if not ok: diff+=1; print(' diff',sc['name'],n,a,v)
    res.append((sc['name'],diff))
print(res)
x.close()
