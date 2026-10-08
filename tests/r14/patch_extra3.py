r=open('p_res.py').read()
# gate-derived counts: after Gate_Ready
r=r.replace("    row('Gate_Ready', 'Results can be shown (1) or are gated (0)', '=IF(Gate_Count=0,1,0)')","""    row('Gate_Ready', 'Results can be shown (1) or are gated (0)', '=IF(Gate_Count=0,1,0)')
    stdkeys = ['inv', 'cash', 'pen', 'penRet', 'wage', 'bands', 'spGrow', 'ownShare', 'retireSpend', 'lumpSum', 'drawRule', 'safetyMonths', 'cashYears', 'investShare', 'saveShare', 'noAnswer', 'startYear']
    reqkeys = ['infl', 'retireAge', 'planEnd', 'pRetireAge']
    rowof = {k: gr0 + i for i, (k, *_x) in enumerate(items)}
    row('Req_Count', 'Choices only you can make that block results (3, or 4 with a partner who has income)', '=3+IF(AND(F_Partner=1,In_pIncome>0),1,0)')
    row('Req_Got', 'Of those, chosen so far ("n of m chosen" on Step 7)', '=Req_Count-(' + '+'.join(f'C{rowof[k]}' for k in reqkeys) + ')')
    row('Std_Left', 'Standards not chosen yet (the "Use the standards" card counts these)', '=' + '+'.join(f'C{rowof[k]}' for k in stdkeys))
    row('Std_Need', 'Standards the plan needs (chosen or not)', '=' + '+'.join(f'IF(AND({dict(ASMGATE)[k]},1),1,0)' for k in stdkeys))""")
# fnd next + slip + safe months: before the missing section
add='''
    r += 1; sec('NEXT FOUNDATION, EXPLORE AND EMERGENCY FUND NOTE')
    row('Fnd_NextN', 'First level that is not solid (0 = all solid)', '=IF(Fnd1_Fin<>"ok",1,IF(Fnd2_Fin<>"ok",2,IF(Fnd3_Fin<>"ok",3,IF(Fnd4_Fin<>"ok",4,IF(Fnd5_Fin<>"ok",5,0)))))')
    row('L3_Kind', 'Level 3 weakest item is a card or loan (debtpay)', '=IF(L3_Rank=9,"",IF(AND(L3_CardSt<>"",' + rk('L3_CardSt') + '=L3_Rank),"debtpay",IF(AND(L3_LoanSt<>"",' + rk('L3_LoanSt') + '=L3_Rank),"debtpay","")))')
    row('Fnd_NextT', 'Next best step: title', '=IF(Fnd_NextN=0,"",CHOOSE(Fnd_NextN,IF(Fnd1_Fin="bad","Spend less than you earn first","Give yourself more room each month"),"Build your emergency fund first",IF(AND(Fnd3_Fin<>"na",L3_Kind="debtpay"),"Clear your costly debt first","Check your protection first"),"Get your goals on track","Start growing your wealth when you\\'re ready"))')
    sfin = lambda i: f'IF(Fnd{i}_Fin="held",Fnd{i}_S&" · strengthen your foundations first",Fnd{i}_S)'
    row('Fnd_NextD', 'Next best step: description', '=IF(Fnd_NextN=0,"",IF(AND(Fnd_NextN=2,Fnd2_St<>"na"),"You\\'re "&INT(F_Cash/F_EssM*10)/10&" of "&AS_Months&" months there.",CHOOSE(Fnd_NextN,' + ','.join(sfin(i) + '&"."' for i in range(1, 6)) + ')))')
    names = '&'.join(f'IF(AND(INDEX(GR_Key,{i})<>"",INDEX(GR_PctN,{i})<95),IF(LEN(Slip_Tmp)=0,"","")&INDEX(GR_Name,{i})&"|","")' for i in range(1, 11))
    row('Slip_Count', 'Goals that need a what-if on Explore (under 95%)', '=SUMPRODUCT((GR_Key<>"")*(GR_PctN<95))')
    row('Slip_Names', 'Their names', '=' + '&'.join(f'IF(AND(INDEX(GR_Key,{i})<>"",INDEX(GR_PctN,{i})<95),INDEX(GR_Name,{i})&"|","")' for i in range(1, 11)))
'''
r=r.replace("    r += 1; sec('DETAILS MISSING", add.replace("IF(LEN(Slip_Tmp)=0,\"\",\"\")&","")+"\n    r += 1; sec('DETAILS MISSING",1)
open('p_res.py','w').write(r)
# per-goal months equivalent
rs=open('p_results.py').read()
rs=rs.replace("'Pct, 9999 if no goal', 'When (as on screen)']","'Pct, 9999 if no goal', 'When (as on screen)', 'Emergency fund amount in months of essential spending']")
rs=rs.replace("                21: f'=IF($Q{rr}=","                22: f'=IF(AND($Q{rr}=\"safety\",F_EssM>0,INDEX(GL_Amount,{i})>0),ROUND(INDEX(GL_Amount,{i})/F_EssM*10,0)/10,\"\")',\n                21: f'=IF($Q{rr}=",1)
rs=rs.replace("bk.cellname(f'GR{i}_When', ws, f'U{rr}')","bk.cellname(f'GR{i}_When', ws, f'U{rr}'); bk.cellname(f'GR{i}_Months', ws, f'V{rr}')")
open('p_results.py','w').write(rs)
# oracle
o=open('oracle_lib.js').read()
o=o.replace("    out.chapters = chapters(P)","""    { const L = foundations(), fx = fndNext(L), rest = ASM_KEYS().filter(k => asmStd(k) && ASM[k].need()), pm = planMissing(), e = essM(finNums());
      out.misc = {fndNextN:fx ? fx.x.n : 0, fndNextT:fx ? fx.t : '', fndNextD:fx ? fx.d.replace(/&#39;/g, "'") : '', slip:Pb ? S.goals.filter(g => Pb.pct[g.id] < 95).map(g => g.name).join('|') + (S.goals.some(g => Pb.pct[g.id] < 95) ? '|' : '') : '', slipN:S.goals.filter(g => Pb.pct[g.id] < 95).length,
        reqN:reqKeys().length, reqGot:reqKeys().length - req3Missing().length, stdLeft:gateStd().length, stdNeed:rest.length, months:S.goals.map(g => g.k === 'safety' && e > 0 && g.amount > 0 ? Math.round(g.amount / e * 10) / 10 : '')}; }
    out.chapters = chapters(P)""")
o=o.replace("  out.AS = {","  out.ASx = 1; out.AS = {")
open('oracle_lib.js','w').write(o)
h=open('harness.py').read()
idx=h.rindex("    P = out.get('prof')")
h=h[:idx]+"""    M = out.get('misc')
    if M:
        for nm, k in [('Req_Count', 'reqN'), ('Req_Got', 'reqGot'), ('Std_Left', 'stdLeft'), ('Std_Need', 'stdNeed'), ('Slip_Count', 'slipN')]:
            v = x.val(nm)
            if v != M[k] and not (out.get('wiOn') and nm.startswith('Slip')): bad.append(('misc', nm, M[k], v))
        if not out.get('wiOn'):
            v = x.val('Slip_Names') or ''
            if v != M['slip']: bad.append(('misc', 'Slip_Names', M['slip'], v))
            if out.get('fnd'):
                if x.val('Fnd_NextN') != M['fndNextN']: bad.append(('misc', 'Fnd_NextN', M['fndNextN'], x.val('Fnd_NextN')))
                elif M['fndNextN']:
                    for nm, k in [('Fnd_NextT', 'fndNextT'), ('Fnd_NextD', 'fndNextD')]:
                        if x.val(nm) != M[k]: bad.append(('misc', nm, M[k], x.val(nm)))
        for i, m in enumerate(M['months']):
            v = x.val(f'GR{i + 1}_Months'); v = '' if v is None else v
            if v != m: bad.append(('months', i, m, v))
    A = out['AS']
    for nm, k in [('AS_Infl', 'infl'), ('AS_Wage', 'wage'), ('AS_Cash', 'cash'), ('AS_Inv', 'inv'), ('AS_Pen', 'pen'), ('AS_PenRet', 'penRet'), ('AS_End', 'end'), ('AS_Year0', 'year0'), ('AS_Months', 'buffer')]:
        if abs(x.val(nm) - A[k]) > 1e-9: bad.append(('as', nm, A[k], x.val(nm)))
    Fq = out['fin']
    for nm, k in [('F_EssM', 'essM'), ('F_MortPayM', 'mortPayM'), ('F_CardPayM', 'cardPayM'), ('F_LoanPayM', 'loanPayM'), ('F_PenG', 'penG'), ('F_PenM', 'penM'), ('F_Debt', 'debt')]:
        if abs(x.val(nm) - Fq[k]) > 1e-6: bad.append(('fin', nm, Fq[k], x.val(nm)))
"""+h[idx:]
open('harness.py','w').write(h)
