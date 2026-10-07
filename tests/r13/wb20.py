import json,openpyxl
from openpyxl.worksheet.datavalidation import DataValidation
P='/home/user/lifegoals-prototype/deliverables/LifeGoals-Calculators.xlsx'
wb=openpyxl.load_workbook(P)
d=json.load(open('r12/settings_dump.json'))['s']
ws=wb['Settings']
def row(n): return int(wb.defined_names[n].attr_text.split('$')[-1])
for k,v in d.items():
    r=row('Set_'+k)
    if k not in ('mortRate','loanRate','cardRate','depRate','buyFees','fundChg'):
        ws.cell(r,7).value=v.get('by','')
    ws.cell(r,8).value=v.get('src','');ws.cell(r,10).value=v.get('guide',v.get('note',''))
# H3: derive inv from the same inputs, as the prototype does
r=row('Set_inv'); chg='IF(ISNUMBER(Suggest_Fund_Charges),Suggest_Fund_Charges,0.01)'
def f(extra): 
    g=f'(1+Set_invGross{extra}-{chg})^Deemed_Disposal_Years'
    return f'=ROUND(({g}-Exit_Tax*({g}-1))^(1/Deemed_Disposal_Years)-1,3)'
ws.cell(r,3).value=f('');ws.cell(r,6).value=f('-0.01')
ws.cell(r,3).fill=openpyxl.styles.PatternFill('solid',fgColor='EDEDED');ws.cell(r,3).font=openpyxl.styles.Font(color='000000')
ws.cell(r,6).fill=openpyxl.styles.PatternFill('solid',fgColor='EDEDED');ws.cell(r,6).font=openpyxl.styles.Font(color='000000')
ws.cell(r,7).value='a planning assumption, not a forecast: derived from the growth before fees and tax (Set_invGross), the charges (Suggest_Fund_Charges) and the exit tax every 8 years (Exit_Tax, Deemed_Disposal_Years). Edit those, not this cell.'
ws.cell(r,10).value=d['inv']['guide']
# Budget 2027 block (README and Assumptions): the §23 note, no amounts, no guesses
NOTE="Budget 2027 changes (announced 6 Oct 2026) aren't included yet. We'll update LifeMap once they're final."
DET=("Nothing from Budget 2027 is used in any calculation. The values below stay at their 2026 figures until the changes are final and official (Revenue, the Finance Act, the Department of Social Protection). Then update each named constant with its effective date and re-run the Tax engine checks. No Budget 2027 amount is written here on purpose.")
def block(sh,r0):
    w=wb[sh]
    w.cell(r0,2).value='BUDGET 2027 (announced 6 Oct 2026): not applied yet'
    w.cell(r0+1,2).value=NOTE+' '+DET
    w.cell(r0+2,2).value='Constant (2026 value, unchanged)';w.cell(r0+2,4).value='Status'
    for i in range(3,14):
        c=w.cell(r0+i,5 if sh=='Assumptions' else 4)
        if sh=='Assumptions': c=w.cell(r0+i,5)
    return w
# README: B..D (name in C, watch in D); Assumptions: names in D, watch in E
w=wb['README']; r0=64
w.cell(r0,2).value='BUDGET 2027 (announced 6 Oct 2026): not applied yet';w.cell(r0+1,2).value=NOTE+' '+DET
w.cell(r0+2,2).value='Constant (2026 value, unchanged)';w.cell(r0+2,4).value='Status'
for r in range(r0+3,r0+14): 
    if w.cell(r,4).value is not None: w.cell(r,4).value='2026 value kept until final and official'
w.cell(r0+13,4).value='Guidance text shows the latest CSO figure'
w=wb['Assumptions']; r0=108
w.cell(r0,2).value='BUDGET 2027 (announced 6 Oct 2026): not applied yet';w.cell(r0+1,2).value=NOTE+' '+DET
w.cell(r0+2,2).value='Constant (2026 value, unchanged)';w.cell(r0+2,5).value='Status'
for r in range(r0+3,r0+14):
    if w.cell(r,5).value is not None: w.cell(r,5).value='2026 value kept until final and official'
w.cell(r0+13,5).value='Guidance text shows the latest CSO figure'
# README version line and notes
rd=wb['README']
rd['B2']='Version 2.4 · 6 Oct 2026 · built from LifeMap-Customer-Journey prototype (CALCS and Settings). Since 2.3: Settings and Your lists sheets (§19), the investment standard derived from its own inputs, Budget 2027 not applied, cached values saved.'
rd['B14']='• The workbook recalculates automatically, including when it is opened. No sheet or workbook protection is applied: this is an engineering template, so formulas and inputs can be edited. Keep the yellow cells for typing and leave formulas alone.'
# C3 error alert
for dv in rd.data_validations.dataValidation:
    if 'C3' in str(dv.sqref):
        dv.showErrorMessage=True;dv.errorStyle='stop';dv.errorTitle='Yes or No';dv.error='Choose Yes or No.';dv.allowBlank=False
wb.calculation.calcMode='auto';wb.calculation.fullCalcOnLoad=True
wb.save(P);print('ok')
