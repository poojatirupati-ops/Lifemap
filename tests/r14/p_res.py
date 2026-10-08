from lib import *
from p_goals import NGOALS, NS

def eur(x): return f'"€"&TEXT(ROUND({x},0),"#,##0")'
def eurs(x): return f'IF({x}<0,"−€","€")&TEXT(ROUND(ABS({x}),0),"#,##0")'
ASMN = {'inv': 'investment growth', 'cash': 'cash growth', 'pen': 'pension growth', 'penRet': 'pension growth once retired', 'penChg': 'typical pension charges', 'wage': 'pay rises', 'bands': 'tax bands in future', 'spGrow': 'State Pension in future', 'spWeek': 'State Pension',
        'pSpWeek': "partner's State Pension", 'ownShare': 'share of your pension you pay', 'retireSpend': 'retirement spending', 'lumpSum': 'retirement lump sum', 'drawRule': 'how you draw your pension', 'drawFixed': 'fixed yearly amount',
        'safetyMonths': 'emergency fund months', 'mortRate': 'mortgage rate', 'cardRate': 'credit-card rate', 'loanRate': 'loan rate', 'cashYears': 'years kept as cash', 'investShare': 'share of spare savings invested',
        'saveShare': 'share of spare money saved', 'noAnswer': 'monthly saving', 'planEnd': 'plan-until age', 'startYear': 'plan start year'}
# the gate (journey-spec section 27): only these four choices block results, in the order the prototype asks and lists them.
# (key, text in "Choose your ... to see this", display name on the card, the condition that makes it still to choose)
GATE = [
 ('retireAge', 'retirement age', 'Retirement age', 'Has_retireAge=0'),
 ('planEnd', 'plan-until age', 'Plan until age', 'Has_a_planEnd=0'),
 ('infl', 'inflation rate', 'Inflation', 'Has_infl=0'),
 ('pRetireAge', "partner's retirement age", "Partner's retirement age", 'AND(F_Partner=1,In_pIncome>0,Has_pRet=0)'),
]

def build_results(bk, wsI, h0, q0):
    wb = bk.wb
    if 'Plan results' in wb.sheetnames: del wb['Plan results']
    ws = wb.create_sheet('Plan results'); ws.sheet_properties.tabColor = '5B9BD5'
    ws['B1'] = 'Plan results: what the Results screens show (goal %, goal lines, what we found, foundations, gate)'; ws['B1'].font = Font(bold=True, size=14)
    ws['B2'] = ('Everything on this sheet is a formula on the other Plan sheets. The only two typed cells are the figures the prototype finds by searching (the extra a month to reach 100%, and the extra that closes the main gap): '
                'a spreadsheet cannot run that search in one pass, so type the figure the what-if search gives (see Plan how it works).')
    ws['B2'].alignment = Alignment(wrap_text=True, vertical='top'); ws.merge_cells('B2:H2'); ws.row_dimensions[2].height = 48
    for c, w in zip('ABCDEFGH', [2, 62, 34, 14, 14, 14, 14, 30]): ws.column_dimensions[c].width = w
    from openpyxl.formatting.rule import FormulaRule
    ws['B3'] = '=Warn_Goals'; ws['B3'].font = Font(bold=True, color='9C0006'); ws.merge_cells('B3:H3'); ws['B3'].alignment = Alignment(wrap_text=True, vertical='top'); ws.row_dimensions[3].height = 30
    ws.conditional_formatting.add('B3:H3', FormulaRule(formula=['LEN($B$3)>0'], fill=PatternFill('solid', bgColor='FFC7CE', fgColor='FFC7CE'), font=Font(bold=True, color='9C0006')))
    r = 4
    def sec(t):
        nonlocal r
        ws.cell(r, 2, t).fill = HEAD; ws.cell(r, 2).font = WH; ws.cell(r, 3, 'Value').fill = HEAD; ws.cell(r, 3).font = WH; r += 1
    def row(name, label, f, fmt=None):
        nonlocal r
        ws.cell(r, 2, label); c = ws.cell(r, 3, f); c.fill = PLN
        if fmt: c.number_format = fmt
        if name: bk.cellname(name, ws, f'C{r}')
        r += 1
    act = "'Plan cashflow'!$%s$%d:$%s$%d"
    from lib import YT
    TC = YT.reg['C']
    def cc(key):
        c = TC.col(key); return f"'Plan cashflow'!${c}${TC.r0}:${c}${TC.r0 + 89}"
    def c0(key): return f"'Plan cashflow'!${TC.col(key)}${TC.r0}"
    def cN(key, ofs=0): return f"INDEX({cc(key)},F_N+1+({ofs}))"
    sec('SAVING (today\'s money a month)')
    row('Save_SurplusM', 'Spare money a month today', f'=ROUND(IF(F_Age<F_R,({c0("saved")}+{c0("spent")})/12,0),0)')
    row('Save_SaveM', 'What you save a month', f'=ROUND({c0("saved")}/12,0)')
    row('Save_AutoM', 'The Q6 rule\'s saving a month', f'={c0("auto0")}')
    row('Plan_YearsShort', 'Years short on the road', f'=SUM({cc("isShort")})')
    row('Plan_ShortLivingYears', 'Years short for living costs', f'=SUM({cc("shortFlag")})')
    r += 1; sec('THE GATE: "To see your results we need N things" (planMissing: only these four choices block results)')
    ws.cell(r, 2, 'Item').font = B; ws.cell(r, 3, 'Still to choose (1/0)').font = B; ws.cell(r, 4, 'Key').font = B; ws.cell(r, 5, 'Name on the card').font = B; ws.cell(r, 6, 'Keys so far').font = B; ws.cell(r, 7, 'Names so far').font = B; r += 1; gr0 = r
    _praw = wb.defined_names['In_pAge'].attr_text.split('!')[1].replace('$G$', 'C')   # the typed cell of the partner's age
    GATE_ALL = [('age', 'age (18 to 80)', 'Your age', 'Has_age=0'),
                ('pAge', "partner's age (18 to 85)", "Partner's age", f"AND(F_Partner=1,NOT(ISBLANK('Plan inputs'!{_praw})),Has_pAge=0)")] + GATE   # N1: an age outside the allowed range is asked for, never read as 0
    for i, (key, n, t, cond) in enumerate(GATE_ALL):
        rr = gr0 + i
        ws.cell(rr, 2, n); ws.cell(rr, 3, f'=IF({cond},1,0)').fill = PLN; ws.cell(rr, 4, key); ws.cell(rr, 5, t)
        prev = '""' if i == 0 else f'F{rr - 1}'; prevN = '""' if i == 0 else f'G{rr - 1}'
        ws.cell(rr, 6, f'={prev}&IF(C{rr}=1,IF({prev}="","",",")&D{rr},"")')
        ws.cell(rr, 7, f'={prevN}&IF(C{rr}=1,IF({prevN}="","",", ")&E{rr},"")')
    gr1 = gr0 + len(GATE_ALL) - 1; r = gr1 + 1
    rngC = f'$C${gr0}:$C${gr1}'
    row('Gate_Count', 'Choices still to make (N on the card)', f'=SUM({rngC})')
    row('Gate_Keys', 'Keys, in order', f'=F{gr1}')
    row('Gate_Names', 'The names on the card, in order', f'=G{gr1}')
    row('Gate_Card', 'Heading of the card', '=IF(Gate_Count=0,"","To see your results we need "&Gate_Count&IF(Gate_Count=1," thing"," things"))')
    row('Gate_FirstLabel', 'First thing to choose', f'=IF(Gate_Count=0,"",IFERROR(INDEX($B${gr0}:$B${gr1},MATCH(1,{rngC},0)),""))')
    row('Gate_Text', 'The short gate text (Step 7 and the Plan strip)', '=IF(Gate_Count=0,"","Choose your "&Gate_FirstLabel&" to see this")')
    row('Gate_Ready', 'Results can be shown (1) or are gated (0)', '=IF(Gate_Count=0,1,0)')
    rowof = {k: gr0 + i for i, (k, *_x) in enumerate(GATE_ALL)}
    reqkeys = ['infl', 'retireAge', 'planEnd', 'pRetireAge']
    row('Req_Count', 'Choices only you can make that block results (3, or 4 with a partner who has income)', '=3+IF(AND(F_Partner=1,In_pIncome>0),1,0)')
    row('Req_Heading', 'Step 7 heading: "Choose N things" while choosing, "All N chosen" when none is left', '=IF(Req_Got=Req_Count,"All "&Req_Count&" chosen","Choose "&Req_Count&" things")')
    row('Req_Got', 'Of those, chosen so far ("n of m chosen" on Step 7)', '=Req_Count-(' + '+'.join(f'C{rowof[k]}' for k in reqkeys) + ')')
    r += 1; sec('WHAT WE FOUND (findings)')
    gk = f"'Plan goals'!$%s$%d:$%s$%d"
    row('Findings_Over', 'Working-year spending is more than comes in (1/0)', f'=IF(SUM({cc("overW")})>0,1,0)')
    row('Find_BestScore', 'Best score (a fully covered goal, never while overspending)', '=IF(COUNT(GR_Best)>0,MAX(GR_Best),"")')
    row('Find_BestIdx', 'Best goal number', '=IF(Find_BestScore="",0,MATCH(Find_BestScore,GR_Best,0))')
    row('Find_WorstIdx', 'Worst goal number', '=IF(COUNT(GR_Worst)>0,MATCH(MIN(GR_Worst),GR_Worst,0),0)')
    row('Find_WorstPct', 'Worst goal: % covered', '=IF(Find_WorstIdx>0,INDEX(GR_Pct,Find_WorstIdx),"")')
    row('Find_WorstName', 'Worst goal: name', '=IF(Find_WorstIdx>0,INDEX(GR_Name,Find_WorstIdx),"")')
    ws.cell(r, 2, 'Extra a month that closes the main gap (type what the what-if search finds, or "none"; blank = not tried)'); ws.cell(r, 3).fill = YEL; ws.cell(r, 3).font = BLUE; bk.cellname('Find_ExtraFor', ws, f'C{r}'); r += 1
    row('Find_ExtraUsed', 'Extra used for the biggest decision (typed above, or the sample customer\'s "none" when Fill example values = Yes)', '=IF(ISBLANK(Find_ExtraFor),IF(Fill_Example="Yes","none",""),Find_ExtraFor)')
    row('Find_Strength', 'Your main strength', '=IF(Find_BestIdx>0,IF(INDEX(GR_Kind,Find_BestIdx)="retire","Your pension and savings cover retiring at "&INDEX(GR_AgeT,Find_BestIdx),INDEX(GR_Name,Find_BestIdx)&" is "&INDEX(GR_Pct,Find_BestIdx)&"% covered"),IF(Findings_Over=1,"No strength to point to yet: your spending is more than comes in","Nothing is fully covered yet, so closing the gap comes first"))')
    row('Find_Gap', 'Your main gap', '=IF(Find_WorstIdx=0,"",IF(Find_WorstPct>=PR_Good,"No big gaps right now",Find_WorstName&" is "&Find_WorstPct&"% covered"))')
    row('Find_Decision', 'Your biggest decision', '=IF(Find_WorstIdx=0,"",IF(Find_WorstPct>=PR_Good,IF(OR(In_life<>"Yes",In_ip<>"Yes"),"Worth a look: would your plan cope with illness or death? An adviser can check your cover with you","A yearly review keeps it on track"),IF(ISNUMBER(Find_ExtraUsed),"Saving about "&' + eur('Find_ExtraUsed') + '&" more a month could close this gap, on our assumptions",IF(Find_ExtraUsed="","Type the extra the what-if search finds in Find_ExtraFor to see this line","Moving "&LOWER(Find_WorstName)&" later, or changing the amount, would make the biggest difference"))))')
    r += 1; sec('RETIREMENT AT A GLANCE (today\'s money)')
    row('Ret_Year', 'Years until retirement', '=F_R-F_Age')
    TPY = YT.reg['P']
    def pc(key): c = TPY.col(key); return f"'Plan pay & tax'!${c}${TPY.r0}:${c}${TPY.r0 + 89}"
    row('Ret_PotNominal', 'Pension pot at the start of the retirement year', f'=IF(AND(Ret_Year>=0,Ret_Year<=F_N),INDEX({pc("potS")},Ret_Year+1),"")')
    row('Ret_IncomeMonth', 'Money in after tax in the first retired year, a month', f'=IF(AND(Ret_Year>=0,Ret_Year<=F_N),INDEX({cc("inflow")},Ret_Year+1)/INDEX({cc("infl")},Ret_Year+1)/12,"")')
    row('Ret_LumpNet', 'Lump sum after tax (nominal)', f'=IF(AND(Ret_Year>=0,Ret_Year<=F_N),INDEX({pc("lsN")},F_V-F_Age+1),0)')
    r += 1; sec('FOUNDATIONS (the pyramid on Results)')
    # level 1
    row('Fnd1_St', 'Level 1 Spend less than you earn: status', f'=IF(OR(AND(Has_income=0,In_work<>"Not working"),Has_costsM=0),"na",IF(ROUND(({c0("inflow")}-{c0("needs")})/12,0)<0,"bad",IF(ROUND(({c0("inflow")}-{c0("needs")})/12,0)<0.05*MAX(1,{c0("inflow")}/12),"mid","ok")))')
    row('Fnd1_S', 'Level 1: text', f'=IF(Fnd1_St="na","Add your income and spending to check this",IF(ROUND(({c0("inflow")}-{c0("needs")})/12,0)<0,"Spending about "&' + eur(f'-ROUND(({c0("inflow")}-{c0("needs")})/12,0)') + f'&" a month more than comes in","About "&' + eur(f'ROUND(({c0("inflow")}-{c0("needs")})/12,0)') + '&" a month spare"))')
    mon = 'INT(F_Cash/F_EssM*10)/10'
    row('Fnd2_St', 'Level 2 Emergency fund: status', f'=IF(AND(Has_cash=1,Has_costsM=1,F_EssM>0),IF(F_Cash/F_EssM>=AS_Months,"ok",IF(F_Cash/F_EssM>=3,"mid","bad")),"na")')
    row('Fnd2_S', 'Level 2: text', f'=IF(Fnd2_St="na","Add your assets to check this",IF(Fnd2_St="ok",{mon}&" months of essential spending · target of "&AS_Months&" met",{mon}&" of "&AS_Months&" months of essential spending"))')
    # level 3 items
    npu = lambda bal, i, pay: f'IF(OR({pay}<={bal}*{i},{pay}<=0),1E+99,CEILING(ROUND(IF({i}<>0,-LN(1-{bal}*{i}/{pay})/LN(1+{i}),{bal}/{pay})*1000000,0)/1000000,1))'
    row('L3_CardM', 'Level 3: months to clear the cards', '=' + npu('F_CardBal', 'D_iC', 'F_CardPayM'))
    row('L3_LoanM', 'Level 3: months to clear the loans', '=' + npu('F_LoanBal', 'D_iL', 'F_LoanPayM'))
    row('L3_Debt', 'Level 3: debt figures given (1/0)', '=IF(OR(Has_cardBal=1,Has_loanBal=1,Has_debt=1),1,0)')
    why = lambda k: f'IF(In_{k}>0,"the repayment given doesn\'t cover the interest",IF(Has_{k}=1,"a €0 repayment wouldn\'t clear it","no repayment was given"))'
    row('L3_CardSt', 'Level 3 item: credit card status (blank = no item)', '=IF(AND(L3_Debt=1,F_CardBal>1),IF(L3_CardM<=12,"mid","bad"),"")')
    row('L3_CardS', 'Level 3 item: credit card text', f'=IF(L3_CardSt="","","Credit card "&' + eur('F_CardBal') + f'&IF(L3_CardSt="mid"," clears in about "&MAX(1,L3_CardM)&" months",IF(L3_CardM>=1E+99," with no repayment set"," takes about "&L3_CardM&" months to clear"))&IF(F_CardPayEst=1," (repayment worked out from your figures, because "&{why("cardPayM")}&")",""))')
    row('L3_LoanSt', 'Level 3 item: loans status', '=IF(AND(L3_Debt=1,F_LoanBal>1),IF(L3_LoanM<=24,"mid","bad"),"")')
    row('L3_LoanS', 'Level 3 item: loans text', f'=IF(L3_LoanSt="","","Loans of "&' + eur('F_LoanBal') + f'&IF(L3_LoanSt="mid"," clear in about "&MAX(1,L3_LoanM)&" months",IF(L3_LoanM>=1E+99," with no repayment set"," take about "&CEILING(L3_LoanM/12,1)&" years to clear"))&IF(F_LoanPayEst=1," (repayment worked out from your figures, because "&{why("loanPayM")}&")",""))')
    row('L3_NoDebtSt', 'Level 3 item: no costly debt', '=IF(AND(L3_Debt=1,F_Debt<=1),"ok","")')
    row('L3_NoDebtS', 'Level 3 item: text', '=IF(L3_NoDebtSt="","","No costly debt")')
    row('L3_CoverWork', 'Cover through work counted', '=IF(In_workCover="Yes",Cover_Work_Total,0)')
    row('L3_CoverLife', 'Life cover counted', '=IF(In_life="Yes",Cover_Life_Total,0)')
    row('L3_NeedLife', 'Life cover is checked (partner or people rely on you)', '=IF(OR(F_Partner=1,In_deps>0),1,0)')
    row('L3_LifeSt', 'Level 3 item: life cover status', '=IF(L3_NeedLife=0,"",IF(Has_life=0,"na",IF(OR(In_life="Yes",L3_CoverWork>0),"ok",IF(In_life="No","bad","mid"))))')
    row('L3_LifeS', 'Level 3 item: life cover text', '=IF(L3_LifeSt="","",IF(L3_LifeSt="na","Add your protection to check life cover",IF(L3_LifeSt="ok",IF(In_life="Yes","Life cover in place"&IF(L3_CoverLife>0," ("&' + eur('L3_CoverLife') + '&" covered)","")&IF(L3_CoverWork>0,", plus "&' + eur('L3_CoverWork') + '&" through work",""),"Cover through work in place ("&' + eur('L3_CoverWork') + '&")"),IF(In_life="No","No life cover, and ","Not sure about life cover, and ")&IF(In_deps>0,"people rely on you","you plan with a partner"))))')
    row('L3_IpSt', 'Level 3 item: income protection status', '=IF(AND(In_work<>"",In_work<>"Not working"),IF(Has_ip=0,"na",IF(In_ip="Yes","ok","mid")),"")')
    row('L3_IpS', 'Level 3 item: income protection text', '=IF(L3_IpSt="","",IF(L3_IpSt="na","Add your protection to check income protection",IF(L3_IpSt="ok","Income protection in place"&IF(AND(In_ip="Yes",IP_Listed_Total>0)," ("&' + eur('IP_Listed_Total') + '&" a month)",""),"No income protection if you couldn\'t work")))')
    rk = lambda n: f'IF({n}="",9,IF({n}="bad",0,IF({n}="mid",1,IF({n}="na",2,3))))'
    row('L3_Rank', 'Level 3: weakest item rank', '=MIN(' + ','.join(rk(n) for n in ['L3_CardSt', 'L3_LoanSt', 'L3_NoDebtSt', 'L3_LifeSt', 'L3_IpSt']) + ')')
    sts = ['L3_CardSt', 'L3_LoanSt', 'L3_NoDebtSt', 'L3_LifeSt', 'L3_IpSt']; txs = ['L3_CardS', 'L3_LoanS', 'L3_NoDebtS', 'L3_LifeS', 'L3_IpS']
    pick = lambda arr: 'IF(' + f'{rk(sts[0])}=L3_Rank,{arr[0]},IF(' + f'{rk(sts[1])}=L3_Rank,{arr[1]},IF(' + f'{rk(sts[2])}=L3_Rank,{arr[2]},IF(' + f'{rk(sts[3])}=L3_Rank,{arr[3]},{arr[4]}))))'
    row('Fnd3_St', 'Level 3 Clear costly debt and protect your family: status', '=IF(L3_Rank=9,"na",' + pick(sts) + ')')
    row('Fnd3_S', 'Level 3: text', '=IF(L3_Rank=9,"Add your loans and protection to check this",' + pick(txs) + ')')
    # level 4 / 5
    row('L4_N', 'Level 4: goals counted (not legacy)', '=SUMPRODUCT((GR_Key<>"")*(GR_Kind<>"legacy"))')
    row('L4_On', 'Level 4: goals on track', f'=SUMPRODUCT((GR_Key<>"")*(GR_Kind<>"legacy")*(N(+GR_Pct)>=PR_Good))'.replace('N(+GR_Pct)', 'GR_PctN'))
    row('L4_Low', 'Level 4: goals under 50%', '=SUMPRODUCT((GR_Key<>"")*(GR_Kind<>"legacy")*(GR_PctN<PR_LowPct))')
    row('L4_PenOn', 'Level 4: pension saving under way (1/0)', '=IF(OR(F_PenM>0,IF(RG_Exists=1,INDEX(GR_PctN,RG_Row)>=PR_Good,FALSE)),1,0)')
    row('Fnd4_St', 'Level 4 Goals and retirement: status', '=IF(L4_N=0,"na",IF(L4_Low>L4_N/2,"bad",IF(AND(L4_On=L4_N,L4_PenOn=1),"ok","mid")))')
    row('Fnd4_S', 'Level 4: text', '=IF(L4_N>0,L4_On&" of "&L4_N&" goals on track"&IF(L4_PenOn=1," · pension saving under way"," · no pension saving yet"),"Add goals to check this")')
    row('L5_N', 'Level 5: wealth or legacy goals', '=SUMPRODUCT((GR_Key<>"")*((GR_Key="wealth")+(GR_Kind="legacy")>0))')
    row('L5_OnIdx', 'Level 5: first wealth or legacy goal on track', '=IFERROR(MATCH(1,INDEX((GR_Key<>"")*((GR_Key="wealth")+(GR_Kind="legacy")>0)*(GR_PctN>=PR_Good),0),0),0)')
    row('L5_FirstIdx', 'Level 5: first wealth or legacy goal', '=IFERROR(MATCH(1,INDEX((GR_Key<>"")*((GR_Key="wealth")+(GR_Kind="legacy")>0),0),0),0)')
    row('L5_Inv', 'Level 5: investing (1/0)', '=IF(AND(Has_invest=1,F_Invest>0),1,0)')
    row('Fnd5_St', 'Level 5 Grow wealth and legacy: status', '=IF(OR(L5_Inv=1,L5_OnIdx>0),"ok",IF(L5_N>0,"mid","na"))')
    row('Fnd5_S', 'Level 5: text', '=IF(L5_Inv=1,"Investing "&' + eur('F_Invest') + '&IF(L5_OnIdx>0," · "&LOWER(INDEX(GR_Name,L5_OnIdx))&" on track",""),IF(L5_OnIdx>0,INDEX(GR_Name,L5_OnIdx)&" on track",IF(L5_N>0,INDEX(GR_Name,L5_FirstIdx)&" not on track yet","Not started yet")))')
    # held pass
    row('Fnd2_Fin', 'Level 2 after the "strengthen first" rule', '=IF(AND(Fnd2_St="ok",OR(Fnd1_St="bad",Fnd1_St="mid")),"held",Fnd2_St)')
    row('Fnd3_Fin', 'Level 3 after the rule', '=IF(AND(Fnd3_St="ok",OR(Fnd1_St="bad",Fnd1_St="mid",Fnd2_St="bad",Fnd2_St="mid")),"held",Fnd3_St)')
    row('Fnd4_Fin', 'Level 4 after the rule', '=IF(AND(Fnd4_St="ok",OR(Fnd1_St="bad",Fnd1_St="mid",Fnd2_St="bad",Fnd2_St="mid",Fnd3_St="bad",Fnd3_St="mid")),"held",Fnd4_St)')
    row('Fnd5_Fin', 'Level 5 after the rule', '=IF(AND(Fnd5_St="ok",OR(Fnd1_St="bad",Fnd1_St="mid",Fnd2_St="bad",Fnd2_St="mid",Fnd3_St="bad",Fnd3_St="mid",Fnd4_St="bad",Fnd4_St="mid")),"held",Fnd5_St)')
    row('Fnd1_Fin', 'Level 1 after the rule', '=Fnd1_St')


    r += 1; sec('NEXT FOUNDATION, EXPLORE AND EMERGENCY FUND NOTE')
    row('Fnd_NextN', 'First level that is not solid (0 = all solid)', '=IF(Fnd1_Fin<>"ok",1,IF(Fnd2_Fin<>"ok",2,IF(Fnd3_Fin<>"ok",3,IF(Fnd4_Fin<>"ok",4,IF(Fnd5_Fin<>"ok",5,0)))))')
    row('L3_Kind', 'Level 3 weakest item is a card or loan (debtpay)', '=IF(L3_Rank=9,"",IF(AND(L3_CardSt<>"",' + rk('L3_CardSt') + '=L3_Rank),"debtpay",IF(AND(L3_LoanSt<>"",' + rk('L3_LoanSt') + '=L3_Rank),"debtpay","")))')
    row('Fnd_NextT', 'Next best step: title', '=IF(Fnd_NextN=0,"",CHOOSE(Fnd_NextN,IF(Fnd1_Fin="bad","Spend less than you earn first","Give yourself more room each month"),"Build your emergency fund first",IF(AND(Fnd3_Fin<>"na",L3_Kind="debtpay"),"Clear your costly debt first","Check your protection first"),"Get your goals on track","Start growing your wealth when you\'re ready"))')
    sfin = lambda i: f'IF(Fnd{i}_Fin="held",Fnd{i}_S&" · strengthen your foundations first",Fnd{i}_S)'
    row('Fnd_NextD', 'Next best step: description', '=IF(Fnd_NextN=0,"",IF(AND(Fnd_NextN=2,Fnd2_St<>"na"),"You\'re "&INT(F_Cash/F_EssM*10)/10&" of "&AS_Months&" months there.",CHOOSE(Fnd_NextN,' + ','.join(sfin(i) + '&"."' for i in range(1, 6)) + ')))')
    names = '&'.join(f'IF(AND(INDEX(GR_Key,{i})<>"",INDEX(GR_PctN,{i})<PR_Good),INDEX(GR_Name,{i})&"|","")' for i in range(1, NGOALS + 1))
    row('Slip_Count', 'Goals that need a what-if on Explore (under 95%)', '=SUMPRODUCT((GR_Key<>"")*(GR_PctN<PR_Good))')
    row('Slip_Names', 'Their names', '=' + '&'.join(f'IF(AND(INDEX(GR_Key,{i})<>"",INDEX(GR_PctN,{i})<PR_Good),INDEX(GR_Name,{i})&"|","")' for i in range(1, NGOALS + 1)))

    r += 1; sec('MY MONEY: sections, checklist and the "rough picture" note (secStatus, checkItems, qualityCount, roughNote)')
    FLD = [('name', 'First name', 1, '1', 0, '1', 1), ('age', 'Your age', 1, '1', 0, 'Has_age', 1), ('retireAge', 'Retirement age', 1, '1', 0, 'Has_retireAge', 0), ('pAge', "Partner's age", 1, 'F_Partner=1', 0, 'Has_pAge', 0),
           ('work', 'Your work', 2, '1', 0, 'Has_work', 0), ('income', 'Your gross yearly income', 2, '1', 0, 'Has_income', 0), ('pIncome', "Partner's gross yearly income", 2, 'F_Partner=1', 0, 'Has_pIncome', 0),
           ('otherM', 'Other income a month', 2, '1', 1, 'Has_otherM', 0), ('costsM', 'Monthly living costs', 2, '1', 0, 'Has_costsM', 0), ('oneOffY', 'Yearly one-off costs', 2, '1', 1, 'Has_oneOffY', 0),
           ('home', 'Your home', 3, '1', 0, 'Has_home', 0), ('homeValue', 'Home value', 3, 'LEFT(In_home,3)="Own"', 0, 'Has_homeValue', 0), ('cash', 'Cash savings', 3, '1', 0, 'Has_cash', 0), ('invest', 'Investments', 3, '1', 0, 'Has_invest', 0),
           ('propValue', 'Other property: value', 3, '1', 1, 'Has_propValue', 0), ('rentM', 'Other property: rent a month', 3, '1', 1, 'Has_rentM', 0),
           ('mortYN', 'Do you have a mortgage?', 4, '1', 1, '0', 0), ('mortBal', 'Mortgage left', 4, 'In_home="Own with mortgage"', 0, 'Has_mortBal', 0), ('mortPayM', 'Monthly repayment', 4, 'In_home="Own with mortgage"', 0, 'Has_mortPayM', 0),
           ('mortYears', 'Years left', 4, 'In_home="Own with mortgage"', 0, 'Has_mortYears', 0), ('mortRate', 'Interest rate', 4, 'In_home="Own with mortgage"', 0, 'OR(In_mortRate>0,Has_a_mortRate=1)', 0),
           ('cardBal', 'Credit cards: total owed', 4, '1', 0, 'Has_cardBal', 0), ('cardPayM', 'Credit cards: monthly repayment', 4, '1', 0, 'Has_cardPayM', 0), ('cardRate', 'Credit cards: interest rate', 4, 'In_cardBal>0', 0, 'OR(In_cardRate>0,Has_a_cardRate=1)', 0),
           ('loanBal', 'Other loans: total owed', 4, '1', 0, 'Has_loanBal', 0), ('loanPayM', 'Other loans: monthly repayment', 4, '1', 0, 'Has_loanPayM', 0), ('loanRate', 'Other loans: interest rate', 4, 'In_loanBal+In_debt>0', 0, 'OR(In_loanRate>0,Has_a_loanRate=1)', 0), ('mort2', 'Other-property mortgage: years left or repayment', 4, 'Mort2_Bal>0', 0, 'Mort2_NeedsTerm=0', 0),
           ('life', 'Life cover', 5, '1', 0, 'Has_life', 0), ('ip', 'Income protection', 5, '1', 0, 'Has_ip', 0), ('ci', 'Serious illness cover', 5, '1', 0, 'Has_ci', 0), ('workCover', 'Cover through work', 5, '1', 0, 'Has_workCover', 0), ('health', 'Health insurance', 5, '1', 0, 'Has_health', 0),
           ('pension', 'Pension value today', 6, '1', 0, 'Has_pension', 0), ('pensionM', 'Paid in each month', 6, '1', 0, 'Has_pensionM', 0), ('pensionOwnM', 'Of that, paid by you', 6, 'AND(In_pensionM>0,In_work<>"Not working")', 1, 'Has_pensionOwnM', 0),
           ('ae', 'Auto-enrolment answer', 6, 'AND(In_work="Employed",In_age>=PR_AEageMin,In_age<=PR_AEageMax,In_income>PR_AEearnMin,NOT(In_pensionM>0))', 1, 'Has_ae', 0), ('sp', 'State Pension', 6, '1', 0, 'Has_sp', 0), ('pSp', "Partner's State Pension", 6, 'F_Partner=1', 1, 'Has_pSp', 0)]
    cr = 'IF(In_cardRate>0,In_cardRate,IF(Has_a_cardRate=1,In_a_cardRate,0))'; lr = 'IF(In_loanRate>0,In_loanRate,IF(Has_a_loanRate=1,In_a_loanRate,0))'
    looks = {'mortPayM': 'F_MortPayLow=1',
             'cardPayM': f'AND(In_cardBal>0,In_cardPayM>0,{cr}>0,In_cardPayM<In_cardBal*({cr}/12+0.01))',
             'loanPayM': f'AND(In_loanBal>0,In_loanPayM>0,{lr}>0,In_loanPayM<In_loanBal*({lr}/12+0.01))'}
    hd = ['Field', 'Shown (1/0)', 'Optional (1/0)', 'Figure given (1/0)', 'Pre-filled, not typed (1/0)', 'Flagged "needs a look" (1/0)', 'Left for my adviser (1/0)', 'Shown and required', 'Required and given', 'Look, not left for adviser', 'Shown and typed or read', 'Shown and given or flagged', 'Section', 'Counts as missing or to look at', 'Counts as "looks good"', 'Key']
    for j, h in enumerate(hd):
        c = ws.cell(r, 2 + j, h); c.fill = HEAD; c.font = WH; c.alignment = Alignment(wrap_text=True, vertical='top')
    ws.row_dimensions[r].height = 62; r += 1; m0 = r
    for k, lab, sc, vis, opt, got, pre in FLD:
        inlist = f'ISNUMBER(SEARCH(","&"{k}"&",",","&SUBSTITUTE(In_lookKeys," ","")&","))'; inack = f'ISNUMBER(SEARCH(","&"{k}"&",",","&SUBSTITUTE(In_ackKeys," ","")&","))'
        lk = looks.get(k); lkf = f'IF(OR({inlist},{lk}),1,0)' if lk else f'IF({inlist},1,0)'
        vals = {2: lab, 3: f'=IF({vis},1,0)', 4: opt, 5: f'=IF({got},1,0)', 6: pre, 7: '=' + lkf, 8: f'=IF({inack},1,0)', 9: f'=C{r}*(1-D{r})', 10: f'=I{r}*E{r}', 11: f'=C{r}*G{r}*(1-H{r})', 12: f'=C{r}*E{r}*(1-F{r})',
                13: f'=C{r}*MAX(E{r},G{r})', 14: sc, 15: ('=0' if k == 'retireAge' else f'=C{r}*IF(G{r}=1,1,IF(AND(D{r}=0,E{r}=0),1,0))'), 16: ('=0' if k == 'retireAge' else f'=C{r}*E{r}*(1-G{r})'), 17: k}
        for c, v in vals.items(): ws.cell(r, c, v)
        r += 1
    m1 = r - 1; T = lambda col: f'${col}${m0}:${col}${m1}'
    for n, col in [('Fin_Sec', 'N'), ('Fin_Key', 'Q')]: bk.name(n, f"'Plan results'!{T(col)}")
    row('Missing_Count', 'Details missing or to look at (the banner and the checklist)', f'=SUM({T("O")})')
    row('Look_Count', 'Details that need a look and were not left for the adviser', f'=SUMPRODUCT({T("K")}*({T("Q")}<>"retireAge"))')
    row('Good_Count', 'Details that look good ("N details look good")', f'=SUM({T("P")})')
    secn = ['About you', 'Income and expenses', 'Assets', 'Liabilities', 'Protection', 'Pension']
    for n in range(1, 7):
        row(f'Fin{n}_St', f'Section {n} {secn[n - 1]}: status (none / part / done / look)', f'=IF(SUMIFS({T("K")},{T("N")},{n})>0,"look",IF(OR(SUMIFS({T("J")},{T("N")},{n})=SUMIFS({T("I")},{T("N")},{n}),In_saved{n}="Yes"),"done",IF(SUMIFS({T("L")},{T("N")},{n})>0,"part","none")))')
    row('Fin_Done', 'Sections done ("5 of 6 done")', '=' + '+'.join(f'IF(Fin{n}_St="done",1,0)' for n in range(1, 7)))
    row('Fin_MinOK', 'Minimum reached: About you + Income + Assets or Pension (1/0)', '=IF(AND(OR(Fin1_St="done",Fin1_St="look"),OR(Fin2_St="done",Fin2_St="look"),OR(Fin3_St="done",Fin3_St="look",Fin6_St="done",Fin6_St="look")),1,0)')
    row('Fin_Quality', 'Required details with no figure (qualityCount)', f'=SUM({T("I")})-SUM({T("J")})')
    row('Fin_Skipped', 'Sections where nothing was entered (skipped)', '=' + '+'.join(f'IF(AND(SUMIFS({T("C")},{T("N")},{n})>0,SUMIFS({T("M")},{T("N")},{n})=0),1,0)' for n in range(1, 7)))
    row('Home_Rough', 'Home says "· rough" beside Overall readiness (1/0)', '=IF(OR(Fin_Skipped>0,Fin_Quality>2),1,0)')
    row('Rough_Show', 'The "Rough picture" note shows (1/0): only when no detail is already flagged', '=IF(AND(Home_Rough=1,Missing_Count=0),1,0)')
    r += 1; sec('RETIREMENT AGE, THE THREE STATED DEFAULTS (the app\'s words: Step 7, Your assumptions, Check your details)')
    row('Retire_Min', 'Retirement age: youngest allowed (your age + 1)', '=F_Age+1')
    row('Retire_Max', 'Retirement age: oldest allowed (plan-until age - 1)', '=MAX(Retire_Min,AS_End-1)')
    row('Retire_Help', 'Retirement age: guidance (RETIRE_HELP)', '="You can usually draw a pension from "&Pension_Earliest_Age&" (some occupational schemes from "&Scheme_Earliest_Age&"); State Pension is paid from "&State_Pension_Age&"."')
    row('Retire_RangeText', 'Retirement age: the line under the box', '=Retire_Help&" Choose the age you want to plan for, any age from "&Retire_Min&" to "&Retire_Max&"."')
    _t2 = '"Pensions can usually be drawn from "&Pension_Earliest_Age&" (some schemes from "&Scheme_Earliest_Age&") and the State Pension from "&State_Pension_Age&", so until then your plan uses savings and other income. Your results will show any gap honestly."'
    row('Retire_Note', 'Calm note under the retirement age (below 50, or below the pension access age / 60); blank otherwise', f'=IF(Has_retireAge=0,"",IF(F_R<Scheme_Earliest_Age,"Retiring before "&Scheme_Earliest_Age&" is possible. "&{_t2},IF(OR(F_R<AS_AccessAge,F_R<Pension_Earliest_Age),{_t2},"")))')
    row('PRet_Note', 'Calm note under the partner\'s retirement age; blank otherwise', '=IF(OR(F_Partner=0,Has_pRet=0),"",IF(In_pRet<Scheme_Earliest_Age,"Their pay stops at this age. Until their State Pension at "&State_Pension_Age&" your plan uses savings and other income, and the results will show any gap honestly.",IF(In_pRet<Pension_Earliest_Age,"Their pay stops at this age. Their own pension is not modelled, so until their State Pension at "&State_Pension_Age&" your plan relies on savings and other income. Your results will show any gap honestly.","")))')
    _fr = {k: m0 + i for i, (k, *_x) in enumerate(FLD)}
    _miss = lambda k: f'AND(O{_fr[k]}=1,G{_fr[k]}=0)'
    _stat = [('mortYears', 'Years left on the mortgage', '"Assumed: add yours · we use "&PR_FbMortYears&" years"'), ('mort2', 'Years left on the other-property mortgage', '"Assumed: add yours · we use "&PR_FbMortYears&" years"'),
             ('pAge', "Partner's age", '"Assumed: add yours · we use your age"'), ('work', 'Your work', '"Assumed: add yours · we use Employed"'),
             ('mortRate', 'Mortgage rate', '"Assumed: add yours · we use the Central Bank average rate"'), ('loanRate', 'Other loans rate', '"Assumed: add yours · we use the Central Bank average rate"'),
             ('cardRate', 'Credit-card rate', '"Assumed: add yours · we use a planning rate of "&ROUND(AS_CardRate*100,2)&"%"')]
    for k, lab, txt in _stat: row('Use_' + k, f'"We use ..." status beside {lab} on Check your details (blank when you gave it)', f'=IF({_miss(k)},{txt},"")')

    r += 1; sec('HOME, EXPLORE AND EXPERTS (base plan)')
    row('Home_N', 'Goals in the plan', '=SUMPRODUCT((GR_Key<>"")*1)')
    row('Home_Avg', 'Overall readiness (average % covered, rounded)', '=IF(Home_N>0,ROUND(SUM(GR_PctN)/Home_N,0),0)')
    row('Home_OnTrack', 'Goals on track (95% or more): "n of m goals on track" on Home and in the strip', '=SUMPRODUCT((GR_Key<>"")*(GR_PctN>=PR_Good))')
    row('Home_Band', 'Overall band', '=IF(Home_Avg>=PR_Good,"good",IF(Home_Avg>=PR_Nudge,"nudge","alert"))')
    row('Tools_All', 'Tools for you (ids, before the cut to 6)', '=IF(SUMPRODUCT((GR_Spec="mortgage")*1)>0,"borrow,deposit,","")&IF(SUMPRODUCT((GR_Spec="pension")*1)>0,"retirement,contrib,","")&"goalplanner,emergency,surplus,lifecover,compound"')
    row('Tools_List', 'Tools for you shown on Explore (first 6)', '=IF(LEN(Tools_All)-LEN(SUBSTITUTE(Tools_All,",",""))>=6,LEFT(Tools_All,FIND("|",SUBSTITUTE(Tools_All,",","|",6))-1),Tools_All)')
    row('Expert_Idx', 'Weakest goal (lowest %, first in the list on a tie)', '=IF(Home_N>0,MATCH(MIN(GR_PctB),GR_PctB,0),0)')
    row('Expert_Key', 'Specialist it points to', '=IF(Expert_Idx=0,"planner",INDEX(GR_Spec,Expert_Idx))')
    row('Expert_Type', 'Specialist type shown', '=IF(Expert_Key="mortgage","Mortgage expert",IF(Expert_Key="pension","Pension & retirement expert",IF(Expert_Key="protection","Protection expert",IF(Expert_Key="investment","Investment expert","Financial planner"))))')
    row('Save_SaveM_Base', 'What you save a month before any what-if', f'=ROUND(IF({c0("pos")}=1,IF({c0("work")}=1,MIN(MAX(0,{c0("base")}),{c0("net")}),{c0("net")}),0)/12,0)')
    row('Nudge_X', 'Try-this saving (a floor to 25) if it is well above what you save', '=INT(AS_SaveShare*Save_SurplusM/25)*25')
    row('Nudge_Show', 'The "you may be able to save more" nudge shows (1/0)', '=IF(AND(Nudge_X>=Save_SaveM_Base+PR_NudgeStep,Nudge_X>=IF(Has_saveM=1,In_saveM,Save_SaveM_Base)+PR_NudgeStep),1,0)')
    row('Wi_Total', 'What-if: you would save a month', '=MAX(0,Save_SaveM_Base+WI_M)')
    row('Wi_Over', 'What-if: more than your spare money (1/0)', '=IF(AND(WI_M<>0,Wi_Total>MAX(0,Save_SurplusM)+PR_MinShort),1,0)')
    r += 1; sec('THE ROAD AND THE CHART (what-if included, as on screen)')
    row('Chart_ShortYears', 'Years with a shortfall on the chart', f'=SUM({cc("chartShort")})')
    row('Chart_DipYears', 'Years using savings but not short', f'=SUM({cc("chartDip")})')
    row('Chart_FirstShortIdx', 'First short year (row)', f'=IFERROR(MATCH(1,{cc("chartShort")},0),0)')
    row('Chart_FirstShortAge', 'First shortfall at age', f'=IF(Chart_FirstShortIdx>0,F_Age+Chart_FirstShortIdx-1,"")')
    row('Chart_FirstShortAmt', 'First shortfall, about', f'=IF(Chart_FirstShortIdx>0,INDEX({cc("partsShort")},Chart_FirstShortIdx),"")')
    row('Chart_TotalShort', 'Total shortfall across the plan', f'=SUMPRODUCT({cc("chartShort")}*{cc("partsShort")})')
    row('Chart_LivingShortYears', 'Years everyday costs run short', f'=SUM({cc("livShort")})')
    row('Chart_FirstLivingAge', 'First year everyday costs run short, age', f'=IFERROR(F_Age+MATCH(1,{cc("livShort")},0)-1,"")')
    row('Road_FirstShortAge', 'The road turns coral from age', f'=IFERROR(F_Age+MATCH(1,{cc("isShort")},0)-1,"")')
    row('Road_ShortYears', 'Short years on the road', f'=SUM({cc("isShort")})')
    ws.cell(r, 2, 'Chapters (decades)').font = B
    for j, h in enumerate(['Chapter', 'Decade', 'From age', 'To age', 'Years', 'Short years', 'Dipping years', 'Average short a year', 'Weather']): ws.cell(r, 2 + j, h).font = B
    r += 1; ch0 = r
    ws.cell(ch0 - 1, 11, 'Story (as shown)').font = B; ws.column_dimensions['K'].width = 60
    for k in range(1, 11):
        rr = ch0 + k - 1
        n = f'COUNTIFS({cc("chapNo")},{k},{cc("active")},1)'
        vals = {2: k, 3: f'=IF({n}=0,"",INDEX({cc("dec")},MATCH({k},{cc("chapNo")},0)))', 4: f'=IF({n}=0,"",F_Age+MATCH({k},{cc("chapNo")},0)-1)', 5: f'=IF({n}=0,"",D{rr}+{n}-1)', 6: f'={n}',
                7: f'=COUNTIFS({cc("chapNo")},{k},{cc("isShort")},1)', 8: f'=COUNTIFS({cc("chapNo")},{k},{cc("dipC")},1)',
                9: f'=IF(G{rr}>0,SUMIFS({cc("shortTotal")},{cc("chapNo")},{k},{cc("isShort")},1)/G{rr},0)',
                10: f'=IF(F{rr}=0,"",IF(G{rr}>0,"storm",IF(H{rr}>F{rr}/3,"showers",IF(H{rr}>0,"partly","sun"))))'}
        vals[11] = (f'=IF(F{rr}=0,"",IF(G{rr}>0,"Short by about "&' + eur(f'I{rr}') + f'&" a year in "&G{rr}&" of these years.",IF(COUNTIFS({cc("chapNo")},{k},{cc("active")},1,{pc("work")},0)=F{rr},"Living on your pensions and savings, and they hold up.",IF(H{rr}>0,"Some years dip into savings. That\'s what they\'re for.","Income comfortably covers life."))))')
        for c, v in vals.items(): ws.cell(rr, c, v)
    bk.name('Chap_Story', f"'Plan results'!$K${ch0}:$K${ch0 + 9}")
    bk.name('Chap_Dec', f"'Plan results'!$C${ch0}:$C${ch0 + 9}"); bk.name('Chap_From', f"'Plan results'!$D${ch0}:$D${ch0 + 9}"); bk.name('Chap_To', f"'Plan results'!$E${ch0}:$E${ch0 + 9}")
    bk.name('Chap_Short', f"'Plan results'!$G${ch0}:$G${ch0 + 9}"); bk.name('Chap_Dip', f"'Plan results'!$H${ch0}:$H${ch0 + 9}"); bk.name('Chap_Avg', f"'Plan results'!$I${ch0}:$I${ch0 + 9}"); bk.name('Chap_Weather', f"'Plan results'!$J${ch0}:$J${ch0 + 9}")
    r = ch0 + 11
    sec('HOME: YOUR NEXT BEST STEP (nextStep, base plan)')
    row('Next_WIdx', 'Weakest goal for the what-if step (lowest %, then earliest age)', '=IF(COUNT(GR_NextKey)>0,MATCH(MIN(GR_NextKey),GR_NextKey,0),0)')
    row('Next_WPct', 'Its % covered', '=IF(Next_WIdx>0,INDEX(GR_PctN,Next_WIdx),"")')
    row('Next_WName', 'Its name', '=IF(Next_WIdx>0,INDEX(GR_Name,Next_WIdx),"")')
    row('Prof_NeedsProfile', 'Your money profile still needs doing before the meeting (needsProfile)', '=IF(OR(Prof_UmCount<13,In_rechecked<>"Yes"),1,0)')
    row('Next_N', 'Which step shows (1 look, 2 foundation, 3 check profile, 4 what-if, 5 finish profile, 6 book, 7 all set)',
        '=IF(Look_Count>0,1,IF(AND(Fnd_NextN>0,Fnd_NextN<=4),2,IF(AND(In_booked="Yes",Prof_NeedsProfile=1),3,IF(AND(Next_WIdx>0,N(Next_WPct)<PR_Good,In_prefSet<>"Yes"),4,IF(Prof_UmCount<13,5,IF(In_booked<>"Yes",6,7))))))')
    row('Next_T', 'Next best step: title', '=CHOOSE(Next_N,IF(Look_Count=1,"One detail needs a look",Look_Count&" details need a look"),Fnd_NextT,"Check your profile before your adviser meeting","Try a what-if for "&LOWER(Next_WName),"Finish your profile","Talk it through with an adviser","You\'re all set")')
    row('Next_D', 'Next best step: description', '=CHOOSE(Next_N,"So your plan stays accurate. It takes a minute.",Fnd_NextD,In_slot&". About 2 minutes.",Next_WName&" is "&Next_WPct&"% covered. See what a small change would do.","6 quick questions on risk, capacity and how you invest.","Free, no obligation.","Your meeting: "&In_slot&".")')
    row('Next_B', 'Next best step: button', '=CHOOSE(Next_N,"Check it","See why","Check my profile","Try it","Start","Book a meeting","See my meeting")')
    r += 1; sec('WHAT-IF: "What changes" (wiText). The % before needs the typed helper column Z on Plan goals when the what-if is on')
    row('Wi_Text', 'What changes', '=IF(AND(WI_M=0,WI_L=0),"Move the sliders to see what changes.",IF(COUNTIF(GR_WiTxt,"?*")=0,"No change to your goals. Everything that could be covered already is.",_xlfn.TEXTJOIN(CHAR(10),TRUE,GR_WiTxt)))')
    r += 1; sec('EXPLORE: what-ifs for your goals, video reasons, tools per category (base plan)')
    for key, lab in [('mortgage', 'Mortgage'), ('pension', 'Pension'), ('protection', 'Protection'), ('investment', 'Investment'), ('planner', 'Planner')]:
        idx = f'IFERROR(MATCH(1,INDEX((GR_Spec="{key}")*(GR_Kind<>"retire")*(GR_Key<>""),0),0),0)'
        fb = 'IF(RG_Exists=1,INDEX(GR_PctN,RG_Row),"")' if key == 'pension' else '""'
        row(f'Vid_{key}_Idx', f'Videos about {lab.lower()}: the goal named in "Why this is for you" (goal number, 0 = none)', f'={idx}' if key != 'pension' else f'=IF({idx}>0,{idx},IF(RG_Exists=1,RG_Row,0))')
        row(f'Vid_{key}_Pct', f'Videos about {lab.lower()}: "Your goal is N% covered"', f'=IF(Vid_{key}_Idx>0,INDEX(GR_PctN,Vid_{key}_Idx),"")')
    for n, nm in enumerate(['Home & Mortgage', 'Savings & Goals', 'Pensions & Retirement', 'Investments', 'Protection', 'Everyday Money'], start=1):
        row(f'Cat_N{n}', f'Tools in the category {nm} ("N tools" on Explore)', f'=COUNTIF(README!$E$32:$E$59,"{nm}")')
    return ws
