from lib import *
from p_goals import NS, NGOALS

def eur(x): return f'"€"&TEXT(ROUND({x},0),"#,##0")'
def cf(T, key, row=None):
    """absolute range of a Plan cashflow column over the plan years"""
    yt = YT.reg[T]; c = yt.col(key); return f"'{yt.ws.title}'!${c}${yt.r0}:${c}${yt.r0 + 89}"

def build_goal_results(bk, ws, start_row, g0, s0):
    """Part 3 on Plan goals: per slot and per goal results, from the Plan cashflow year table"""
    r = start_row + 1
    ws.cell(r, 2, 'Part 3. Results per funded goal (from Plan cashflow)').font = B; r += 1
    heads = ['Slot', 'Goal paid (€)', 'Goal cost (€)', '% covered', 'Below 95% (1/0)', 'Need in year 0 (a year)', 'Saved in year 0', 'Saving given over the plan (today\'s money)', 'Years saved to', 'Need a month', 'Putting in now a month', 'On average a month']
    for j, h in enumerate(heads):
        c = ws.cell(r, 2 + j, h); c.fill = HEAD; c.font = WH; c.alignment = Alignment(wrap_text=True, vertical='top')
    ws.row_dimensions[r].height = 46; r += 1; q0 = r
    act = cf('C', 'active')
    for K in range(1, NS + 1):
        rr = q0 + K - 1
        paidcol = cf('C', f's{K}_paid')
        f = {2: K,
             3: f'=IF(Slot{K}_On=1,INDEX({paidcol},Slot{K}_Age-F_Age+1),0)', 4: f'=Slot{K}_Cost',
             5: f'=IF(Slot{K}_On=1,IF(D{rr}>0,IF(C{rr}>=D{rr}-1,100,MIN(PR_PctCap,MAX(0,INT(C{rr}/D{rr}*100)))),100),"")',
             6: f'=IF(AND(Slot{K}_On=1,E{rr}<PR_Good),1,0)',
             7: f'=INDEX({cf("C", f"s{K}_n0")},1)', 8: f'=INDEX({cf("C", f"s{K}_c0")},1)',
             9: f'=SUMIFS({cf("C", f"s{K}_cSum")},{act},1)', 10: f'=SUMIFS({cf("C", f"s{K}_live")},{act},1)',
             11: f'=ROUND(G{rr}/12,0)', 12: f'=ROUND(H{rr}/12,0)', 13: f'=IF(J{rr}>0,ROUND(I{rr}/J{rr}/12,0),0)'}
        for c, v in f.items(): ws.cell(rr, c, v)
        bk.cellname(f'Slot{K}_PctLow', ws, f'F{rr}')
        bk.cellname(f'Slot{K}_Pct', ws, f'E{rr}'); bk.cellname(f'Slot{K}_Paid', ws, f'C{rr}')
        bk.cellname(f'Slot{K}_NeedM', ws, f'K{rr}'); bk.cellname(f'Slot{K}_NowM', ws, f'L{rr}'); bk.cellname(f'Slot{K}_AvgM', ws, f'M{rr}')
    q1 = q0 + NS - 1
    r = q1 + 2
    ws.cell(r, 2, 'Part 4. Results per goal (the goal list on the Results screen)').font = B; r += 1
    heads = ['Goal', 'Name', 'Kind', 'Cost (€)', 'Covered (€)', '% covered', 'Band', 'Funding position', 'Needs a month, no search (Option B)', 'On average you put (a month)',
             'Extra a month to reach 100%: type what the what-if search finds ("none" if it needs over 5,000; blank = not tried)', 'Goal line as shown', 'Age (ties)', 'Best-strength score', 'Worst-gap score', 'Type (key)', 'Pct as a number', 'Expert it points to', 'Pct, 9999 if no goal', 'When (as on screen)', 'Emergency fund amount in months of essential spending']
    for j, h in enumerate(heads):
        c = ws.cell(r, 2 + j, h); c.fill = HEAD; c.font = WH; c.alignment = Alignment(wrap_text=True, vertical='top')
    ws.row_dimensions[r].height = 90; r += 1; h0 = r
    ws.column_dimensions['M'].width = 70; ws.column_dimensions['L'].width = 24
    sl = lambda k: ','.join(f'Slot{K}_{k}' for K in range(1, NS + 1))
    for i in range(1, NGOALS + 1):
        rr = h0 + i - 1
        kind = f'$D{rr}'; pos = f'$I{rr}'
        cost = (f'=IF($Q{rr}="","",IF(OR({kind}="spend",{kind}="mfree",{kind}="pot"),CHOOSE({pos},{sl("Cost")}),'
                f'IF({kind}="retire",SUMIFS({cf("C", "rgCost")},{act},1),IF({kind}="legacy",INDEX(GL_Amount,{i})*(1+AS_Infl)^F_N,0))))')
        cov = (f'=IF($Q{rr}="","",IF(OR({kind}="spend",{kind}="mfree",{kind}="pot"),CHOOSE({pos},{sl("Paid")}),'
               f'IF({kind}="retire",SUMIFS({cf("C", "rgCov")},{act},1),IF({kind}="legacy",MIN(E{rr},INDEX({cf("C", "freeE")},F_N+1)+INDEX({cf("C", "bufE")},F_N+1)),0))))')
        pct0 = f'IF(E{rr}>0,IF(F{rr}>=E{rr}-1,100,MIN(PR_PctCap,MAX(0,INT(F{rr}/E{rr}*100)))),100)'
        fund = f'OR({kind}="spend",{kind}="mfree",{kind}="pot")'
        APOS = "\'"  # apostrophe inside an Excel string is plain; keep as a normal quote
        e_avg = eur(f'K{rr}'); e_nl = eur(f'K{rr}+AB{rr}'); e_big = eur(f'IF(AB{rr}="none",MAX(J{rr},K{rr}+5),K{rr}+AB{rr})')
        put = " · on average you'll put "
        line = ('=IF(NOT(' + fund + '),"",IF(AND(' + kind + '="mfree",In_home<>"",In_home<>"Own with mortgage"),"No mortgage in Your finances: remove this goal, or add your mortgage",'
                'IF(G' + str(rr) + '>=100,"Fully funded"&IF(K' + str(rr) + '>0,"' + put + '"&' + e_avg + '&" a month",""),'
                'IF(AB' + str(rr) + '="","Type the extra the what-if search finds in column L to see this line",'
                'IF(IF(AB' + str(rr) + '="none",TRUE,K' + str(rr) + '+AB' + str(rr) + '>Save_SurplusM),"Needs about "&' + e_big + '&" a month, more than your spare money' + put + '"&' + e_avg + '&" a month",'
                '"Needs about "&' + e_nl + '&" a month' + put + '"&' + e_avg + '&" a month")))))')
        vals = {2: i, 3: f'=IF($Q{rr}="","",INDEX(GL_Name,{i}))', 4: f'=INDEX(GL_Kind,{i})', 5: cost, 6: cov,
                7: f'=IF($Q{rr}="","",IF({kind}="retire",IF(SUM({cf("C", "retShort")})>0,MIN({pct0},94),{pct0}),{pct0}))',
                8: f'=IF(G{rr}="","",IF(G{rr}>=PR_Good,"good",IF(G{rr}>=PR_Nudge,"nudge","alert")))',
                9: f'=IF({fund},INDEX(GL_Pos,{i}),"")',
                10: f'=IF({fund},CHOOSE({pos},{sl("NeedM")}),"")', 11: f'=IF({fund},CHOOSE({pos},{sl("AvgM")}),"")',
                13: line, 14: f'=IF($Q{rr}="","",INDEX(GL_AgeT,{i}))',
                18: f'=IF(G{rr}="",0,G{rr})',
                19: f'=IF($Q{rr}="","",IFERROR(INDEX(Goal_Specs,MATCH($Q{rr},Goal_Keys,0)),""))', 20: f'=IF($Q{rr}="",9999,G{rr})',
                22: f'=IF(AND($Q{rr}="safety",F_EssM>0,INDEX(GL_Amount,{i})>0),ROUND(INDEX(GL_Amount,{i})/F_EssM*10,0)/10,"")',
                21: f'=IF($Q{rr}="","",IF({kind}="legacy","at the end of your plan"&IF(Has_a_planEnd=1," ("&AS_End&")",""),IF(INDEX(GL_AgeT,{i})<F_Age,"Date has passed",IF({kind}="retire",IF(Has_retireAge=1,"at "&INDEX(GL_AgeT,{i}),"at an age you haven\'t chosen yet"),"in "&(INDEX(GL_AgeRaw,{i})-F_Age)&IF(INDEX(GL_AgeRaw,{i})-F_Age=1," year"," years")))))',
                15: f'=IF(AND($Q{rr}<>"",G{rr}>=PR_Good,Findings_Over=0),G{rr}*1000000-N{rr}*1000-{i},"")',
                16: f'=IF($Q{rr}="","",G{rr}*1000000+N{rr}*1000+{i})', 17: f'=INDEX(GL_Key,{i})'}
        EXV = {1: 255, 2: '"none"'}.get(i, None)
        exs = ('' if EXV is None else (f'{EXV}'))
        vals[28] = f'=IF(ISBLANK(L{rr}),IF(AND(Fill_Example="Yes",{"TRUE" if EXV is not None else "FALSE"}),{exs if EXV is not None else chr(34)*2},""),L{rr})'
        vals.update({23: f'=IF($Q{rr}="","",AS_Year0+INDEX(GL_AgeT,{i})-F_Age)',
                     24: f'=IF($Q{rr}="","",IF(AND({kind}<>"legacy",INDEX(GL_AgeT,{i})<F_Age),"Date has passed",IF({kind}="retire","Age ","age ")&INDEX(GL_AgeT,{i})&" · "&W{rr}))',
                     25: f'=IF($Q{rr}="","",G{rr}*1000+IF({kind}="legacy",AS_End,INDEX(GL_AgeT,{i})))',
                     27: f'=IF($Q{rr}="","",IF(IF(Z{rr}<>"",Z{rr},IF(AND(WI_M=0,WI_L=0),G{rr},""))="","",IF(IF(Z{rr}<>"",Z{rr},G{rr})<>G{rr},C{rr}&" goes from "&IF(Z{rr}<>"",Z{rr},G{rr})&"% to "&G{rr}&"%","")))'})
        for c, v in vals.items(): ws.cell(rr, c, v)
        ws.cell(rr, 12).fill = YEL; ws.cell(rr, 12).font = BLUE; ws.cell(rr, 26).fill = YEL; ws.cell(rr, 26).font = BLUE
        bk.cellname(f'GR{i}_Year', ws, f'W{rr}'); bk.cellname(f'GR{i}_ExtraUsed', ws, f'AB{rr}'); bk.cellname(f'GR{i}_AgeYear', ws, f'X{rr}'); bk.cellname(f'GR{i}_PctBefore', ws, f'Z{rr}'); bk.cellname(f'GR{i}_WiTxt', ws, f'AA{rr}')
        bk.cellname(f'GR{i}_Pct', ws, f'G{rr}'); bk.cellname(f'GR{i}_Band', ws, f'H{rr}'); bk.cellname(f'GR{i}_Line', ws, f'M{rr}')
        bk.cellname(f'GR{i}_Extra', ws, f'L{rr}'); bk.cellname(f'GR{i}_When', ws, f'U{rr}'); bk.cellname(f'GR{i}_Months', ws, f'V{rr}')
    for j, h in enumerate(['Calendar year of the goal', 'Age and year as shown (e.g. age 41 · 2030)', 'Sort key for the next best step (% x 1000 + age)', 'Type: % covered with the what-if OFF (blank = the same as the % covered when the what-if is zero)', 'What-if sentence for this goal']):
        c = ws.cell(h0 - 1, 23 + j, h); c.fill = HEAD; c.font = WH; c.alignment = Alignment(wrap_text=True, vertical='top')
    c = ws.cell(h0 - 1, 28, 'Extra a month used (typed in L, or the sample customer\'s figure when Fill example values = Yes)'); c.fill = HEAD; c.font = WH; c.alignment = Alignment(wrap_text=True, vertical='top')
    for col in ('W', 'X', 'Y', 'Z', 'AA', 'AB'): ws.column_dimensions[col].width = 22
    h1 = h0 + NGOALS - 1
    for n, col in [('GR_PctN', 'R'), ('GR_Spec', 'S'), ('GR_PctB', 'T'), ('GR_When', 'U'), ('GR_Name', 'C'), ('GR_Kind', 'D'), ('GR_Pct', 'G'), ('GR_Best', 'O'), ('GR_Worst', 'P'), ('GR_AgeT', 'N'), ('GR_Key', 'Q'), ('GR_Year', 'W'), ('GR_NextKey', 'Y'), ('GR_WiTxt', 'AA')]:
        bk.name(n, f"'Plan goals'!${col}${h0}:${col}${h1}")
    return ws, q0, h0, h1 + 2
