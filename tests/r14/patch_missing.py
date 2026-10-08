s=open('oracle_lib.js').read()
s=s.replace("  S.partner = {mode:'manual', email:'', sent:false, name:'P'};","  S.partner = {mode:'manual', email:'', sent:false, name:'P'}; S.fin.name = 'X'; S.src.name = 'pre'; S.fin.age = ab.age; S.src.age = 'pre';")
open('oracle_lib.js','w').write(s)
r=open('p_res.py').read()
add='''
    r += 1; sec('DETAILS MISSING (the "n details missing" banner and the My money checklist: optional fields never count; a "needs a look" flag counts once)')
    fields = [('pAge', "Partner's age", 'F_Partner=1'), ('work', 'Your work', '1'), ('income', 'Your gross yearly income', '1'), ('pIncome', "Partner's gross yearly income", 'F_Partner=1'), ('costsM', 'Monthly living costs', '1'),
              ('home', 'Your home', '1'), ('homeValue', 'Home value', 'LEFT(In_home,3)="Own"'), ('cash', 'Cash savings', '1'), ('invest', 'Investments', '1'),
              ('mortBal', 'Mortgage left', 'In_home="Own with mortgage"'), ('mortPayM', 'Monthly repayment', 'In_home="Own with mortgage"'), ('mortYears', 'Years left', 'In_home="Own with mortgage"'),
              ('cardBal', 'Credit cards: total owed', '1'), ('cardPayM', 'Credit cards: monthly repayment', '1'), ('loanBal', 'Other loans: total owed', '1'), ('loanPayM', 'Other loans: monthly repayment', '1'),
              ('life', 'Life cover', '1'), ('ip', 'Income protection', '1'), ('ci', 'Serious illness cover', '1'), ('workCover', 'Cover through work', '1'), ('health', 'Health insurance', '1'),
              ('pension', 'Pension value today', '1'), ('pensionM', 'Paid in each month', '1'), ('sp', 'State Pension', '1')]
    cr = 'IF(In_cardRate>0,In_cardRate/100,IF(Has_a_cardRate=1,In_a_cardRate,0))'; lr = 'IF(In_loanRate>0,In_loanRate/100,IF(Has_a_loanRate=1,In_a_loanRate,0))'
    looks = {'mortPayM': 'F_MortPayLow=1',
             'cardPayM': f'AND(In_cardBal>0,In_cardPayM>0,{cr}>0,In_cardPayM<In_cardBal*({cr}/12+0.01))',
             'loanPayM': f'AND(In_loanBal>0,In_loanPayM>0,{lr}>0,In_loanPayM<In_loanBal*({lr}/12+0.01))'}
    ws.cell(r, 2, 'Field').font = B; ws.cell(r, 3, 'Counts as a missing detail or one to look at (1/0)').font = B; r += 1; m0 = r
    for k, lab, vis in fields:
        look = looks.get(k)
        f = f'=IF(AND({vis},Has_{k}=0),1,0)' if not look else f'=IF({look},1,IF(AND({vis},Has_{k}=0),1,0))'
        ws.cell(r, 2, lab); ws.cell(r, 3, f).fill = PLN; r += 1
    row('Missing_Count', 'Details missing (the banner and the checklist)', f'=SUM(C{m0}:C{r - 1})')
'''
i=r.rindex("    return ws\n")
r=r[:i]+add+r[i:]
open('p_res.py','w').write(r)
h=open('harness.py').read()
idx=h.rindex("    return bad\n")
h=h[:idx]+"    if not sc.get('fill') and x.val('Missing_Count') != out['missingFlags']: bad.append(('missing', 'count', out['missingFlags'], x.val('Missing_Count')))\n"+h[idx:]
open('harness.py','w').write(h)
