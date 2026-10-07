#!/bin/bash
# recalc the deliverable (cached values), then put calcMode=auto fullCalcOnLoad=1 back (LibreOffice drops them)
cd /home/user/lifegoals-prototype
python3 /mnt/skills/public/xlsx/scripts/recalc.py deliverables/LifeGoals-Calculators.xlsx 120 | grep -E "status|total_errors|total_formulas"
python3 - <<'P'
import zipfile,shutil,re,os
src='/home/user/lifegoals-prototype/deliverables/LifeGoals-Calculators.xlsx'; tmp=src+'.tmp'
zi=zipfile.ZipFile(src); zo=zipfile.ZipFile(tmp,'w',zipfile.ZIP_DEFLATED)
for it in zi.infolist():
    b=zi.read(it.filename)
    if it.filename=='xl/workbook.xml':
        x=b.decode(); x=re.sub(r'<calcPr[^>]*/>','<calcPr calcMode="auto" fullCalcOnLoad="1" iterateCount="100" refMode="A1" iterate="false" iterateDelta="0.0001"/>',x); b=x.encode()
    zo.writestr(it,b)
zo.close(); zi.close(); os.replace(tmp,src)
x=zipfile.ZipFile(src).read('xl/workbook.xml').decode(); print(re.findall(r'<calcPr[^>]*>',x))
P
