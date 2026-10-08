from lib import *
from p_inputs import GOALKEYS, NGOALS
NS = 20   # funded goals the workbook can carry (spend, mortgage-free, savings pots); the app has no cap

def build_goals_static(bk):
    wb = bk.wb
    if 'Plan goals' in wb.sheetnames: del wb['Plan goals']
    ws = wb.create_sheet('Plan goals'); ws.sheet_properties.tabColor = '5B9BD5'
    ws['B1'] = 'Plan goals: the goal list in funding order, and how much of each goal is covered'; ws['B1'].font = Font(bold=True, size=14)
    ws['B2'] = ('Part 1 reads your goals from Plan inputs and puts the funded ones in funding order (your ranking; Emergency fund first unless moved; then must-haves before nice-to-haves, then soonest). '
                'Part 2 gives each funded goal its starting savings. Part 3 (further down) turns the year table on Plan cashflow into the % covered for each goal and the Option B goal line.')
    ws['B2'].alignment = Alignment(wrap_text=True, vertical='top'); ws.merge_cells('B2:L2'); ws.row_dimensions[2].height = 48
    for i, w in enumerate([2, 30, 14, 12, 26, 12, 14, 12, 12, 12, 14, 12, 14, 14, 14, 16, 14, 14, 14, 14, 14, 14, 14, 14, 14]): ws.column_dimensions[CL(i + 1)].width = w
    def hdr(r, labels, c0=2):
        for j, h in enumerate(labels):
            c = ws.cell(r, c0 + j, h); c.fill = HEAD; c.font = WH; c.alignment = Alignment(wrap_text=True, vertical='top')
        ws.row_dimensions[r].height = 46
    r = 4; ws.cell(r, 2, 'Goal types (the prototype\'s GOALCAT)').font = B; r += 1
    hdr(r, ['Key', 'Title', 'Default amount', 'Default years', 'Kind', 'Expert it points to']); r += 1; k0 = r
    SPEC = {'home': 'mortgage', 'retire': 'pension', 'family': 'protection', 'edu': 'planner', 'travel': 'planner', 'business': 'planner', 'mfree': 'mortgage', 'safety': 'planner', 'wealth': 'investment', 'helpfam': 'planner', 'legacy': 'planner', 'wedding': 'planner', 'car': 'planner', 'health': 'protection', 'other': 'planner'}
    for k, t, amt, yrs, kind in GOALKEYS:
        for j, v in enumerate([k, t, amt, yrs, kind, SPEC[k]]): ws.cell(r, 2 + j, v)
        r += 1
    k1 = r - 1
    for n, col in [('Goal_Keys', 'B'), ('Goal_Titles', 'C'), ('Goal_DefAmt', 'D'), ('Goal_DefYrs', 'E'), ('Goal_Kinds', 'F'), ('Goal_Specs', 'G')]: bk.name(n, f"'Plan goals'!${col}${k0}:${col}${k1}")
    r += 1; ws.cell(r, 2, 'Part 1. Your goals').font = B; r += 1
    hdr(r, ['Goal', 'Type (key)', 'Kind', 'Name', 'Age typed', 'Funded from savings (1/0)', 'Age used for funding', 'Age (ties)', 'Amount used', 'Saved so far', 'Priority', 'Rank typed', 'Rank order', 'Sort key', 'Funding position']); r += 1; g0 = r
    for i in range(1, NGOALS + 1):
        rr = g0 + i - 1
        f = {
         2: f'=IF(C{rr}="","","Goal {i}")' if False else f'Goal {i}',
         3: f'=Goal{i}_key', 4: f'=IFERROR(INDEX(Goal_Kinds,MATCH(C{rr},Goal_Keys,0)),"")', 5: f'=Goal{i}_name', 6: f'=Goal{i}_age',
         7: f'=IF(OR(D{rr}="spend",D{rr}="mfree",D{rr}="pot"),1,0)',
         8: f'=IF(G{rr}=1,MAX(F_Age+1,MIN(AS_End,F{rr})),"")',
         9: f'=IF(D{rr}="retire",F_R,IF(D{rr}="legacy",AS_End,F{rr}))',
         10: f'=IF(AND(C{rr}="safety",Goal{i}_auto="Yes",Has_costsM=1),ROUND(F_EssM*AS_Months,0),Goal{i}_amount)',
         11: f'=Goal{i}_saved', 12: f'=Goal{i}_prio', 13: f'=Goal{i}_rank',
         14: f'=IF(Goal_RankSet=1,IF(M{rr}<>"",M{rr}-1,IF(C{rr}="safety",-1,PR_SortBig)),0)',
         15: f'=IF(G{rr}=1,(N{rr}+1)*100000000+IF(C{rr}="safety",0,1)*10000000+IF(L{rr}="Nice to have",1,0)*1000000+H{rr}*1000+{i},1E+15)',
         16: f'=IF(G{rr}=1,1+SUMPRODUCT(($G${g0}:$G${g0 + NGOALS - 1}=1)*($O${g0}:$O${g0 + NGOALS - 1}<O{rr})),"")',
        }
        for c, v in f.items(): ws.cell(rr, c, v)
    g1 = g0 + NGOALS - 1
    for n, col in [('GL_Key', 'C'), ('GL_Kind', 'D'), ('GL_Name', 'E'), ('GL_AgeRaw', 'F'), ('GL_Fund', 'G'), ('GL_Age', 'H'), ('GL_AgeT', 'I'), ('GL_Amount', 'J'), ('GL_Saved', 'K'), ('GL_Prio', 'L'), ('GL_Rank', 'M'), ('GL_Pos', 'P')]:
        bk.name(n, f"'Plan goals'!${col}${g0}:${col}${g1}")
    bk.name('Goal_Kind_List', f"'Plan goals'!$D${g0}:$D${g1}")
    r = g1 + 2
    def scal(name, label, formula, note=''):
        nonlocal r
        ws.cell(r, 2, label); c = ws.cell(r, 4, formula); c.fill = PLN; ws.cell(r, 5, note).font = GREYF; bk.cellname(name, ws, f'D{r}'); r += 1
    scal('Goal_RankSet', 'The customer has ranked their goals (1/0)', '=IF(COUNT(' + f'$M${g0}:$M${g1}' + ')>0,1,0)')
    scal('RG_Exists', 'There is a retirement goal (1/0)', '=IF(COUNTIF(GL_Kind,"retire")>0,1,0)')
    scal('RG_Row', 'Retirement goal is goal number', '=IFERROR(MATCH("retire",GL_Kind,0),0)')
    scal('RG_Amount', 'Retirement goal: income a year in today\'s money', '=IF(RG_Row>0,INDEX(GL_Amount,RG_Row),0)')
    r += 1; ws.cell(r, 2, 'Part 2. The funded goals in funding order, and their starting savings').font = B; r += 1
    hdr(r, ['Slot', 'Goal number', 'On (1/0)', 'Type (key)', 'Kind', 'Age (when it is paid)', 'Amount today', 'Saved so far', 'Years to go', 'Growth rate', 'Cost (inflated; mortgage-free = the balance then)', 'Paid from pot or savings (1/0)', 'Pot kind, not emergency (1/0)', 'Emergency pot (1/0)', 'Mortgage-free (1/0)', 'What-if goal (1/0)', 'Saved so far taken from cash', 'What-if one-off added', 'Cash left', 'Wanted from spare money', 'Taken from spare money', 'Spare money left', 'Pot at the start']); r += 1; s0 = r
    for K in range(1, NS + 1):
        rr = s0 + K - 1; pr = rr - 1
        cashPrev = 'F_Cash' if K == 1 else f'T{pr}'; freePrev = 'Init_Free0' if K == 1 else f'W{pr}'
        f = {2: K,
         3: f'=IFERROR(MATCH({K},GL_Pos,0),0)', 4: f'=IF(C{rr}>0,1,0)',
         5: f'=IF(D{rr}=1,INDEX(GL_Key,C{rr}),"")', 6: f'=IF(D{rr}=1,INDEX(GL_Kind,C{rr}),"")', 7: f'=IF(D{rr}=1,INDEX(GL_Age,C{rr}),0)',
         8: f'=IF(D{rr}=1,INDEX(GL_Amount,C{rr}),0)', 9: f'=IF(D{rr}=1,INDEX(GL_Saved,C{rr}),0)',
         10: f'=IF(D{rr}=1,MAX(0,G{rr}-F_Age),0)', 11: f'=IF(J{rr}>=AS_LongYrs,AS_Inv,AS_Cash)',
         12: f'=IF(D{rr}=1,IF(F{rr}="mfree",IF(F_MortBal>0,INDEX(Plan_mPath,MIN(J{rr}+1,F_N)+1),H{rr}*(1+AS_Infl)^J{rr}),H{rr}*(1+AS_Infl)^J{rr}),0)',
         13: f'=IF(OR(F{rr}="spend",F{rr}="mfree"),1,0)', 14: f'=IF(AND(F{rr}="pot",E{rr}<>"safety"),1,0)', 15: f'=IF(AND(F{rr}="pot",E{rr}="safety"),1,0)', 16: f'=IF(F{rr}="mfree",1,0)',
         17: f'=IF(AND(D{rr}=1,In_wiGoal>0,C{rr}=In_wiGoal),1,0)',
         18: f'=IF(D{rr}=1,MIN(I{rr},{cashPrev}),0)', 19: f'=IF(AND(Q{rr}=1,WI_Retire=0),WI_L,0)', 20: f'={cashPrev}-R{rr}',
         21: f'=IF(D{rr}=1,MAX(0,L{rr}/(1+K{rr})^J{rr}-(R{rr}+S{rr})),0)', 22: f'=MIN(U{rr},{freePrev})', 23: f'={freePrev}-V{rr}', 24: f'=R{rr}+S{rr}+V{rr}'}
        # columns shifted by one vs the header: fix letters (B=2 ... ) handled below by explicit map
        for c, v in f.items(): ws.cell(rr, c, v)
    s1 = s0 + NS - 1
    for K in range(1, NS + 1):
        rr = s0 + K - 1
        for nm, col in [('On', 'D'), ('Key', 'E'), ('Kind', 'F'), ('Age', 'G'), ('Amount', 'H'), ('Saved', 'I'), ('N', 'J'), ('Rate', 'K'), ('Cost', 'L'), ('SpendLike', 'M'), ('PotFree', 'N'), ('BufPot', 'O'), ('IsMfree', 'P'), ('IsWG', 'Q'), ('Pot0', 'X')]:
            bk.cellname(f'Slot{K}_{nm}', ws, f'{col}{rr}')
    r = s1 + 2
    def scal(name, label, formula, note=''):
        nonlocal r
        ws.cell(r, 2, label); c = ws.cell(r, 4, formula); c.fill = PLN; ws.cell(r, 5, note).font = GREYF; bk.cellname(name, ws, f'D{r}'); r += 1
    scal('HasSafety', 'There is an Emergency fund goal (1/0)', f'=IF(SUM($O${s0}:$O${s1})>0,1,0)')
    scal('Init_Buf0', 'Buffer held back from cash (months x essential spending, if no Emergency fund goal)', f'=IF(HasSafety=1,0,MIN($T${s1},AS_Months*F_EssM))')
    scal('Init_Free0', 'Spare money at the start (cash left + investments)', f'=$T${s1}-Init_Buf0+F_Invest')
    scal('Init_Free1', 'Spare money after the starting top-ups of each goal pot', f'=$W${s1}')
    scal('GR', 'Growth of spare money (cash / invested mix)', '=(1-AS_InvShare)*AS_Cash+AS_InvShare*AS_Inv')
    scal('Slots_Funded', 'Funded goals (the workbook carries up to 20)', f'=SUM($G${g0}:$G${g1})')
    scal('Slots_TooMany', 'More funded goals than the workbook carries (1 = results are not complete)', f'=IF(Slots_Funded>{NS},1,0)')
    scal('Goal_RowsUsed', 'Goal rows used on Plan inputs', '=COUNTIF(GL_Key,"?*")')
    scal('Warn_Goals', 'Warning shown on Plan inputs and Plan results when there are more goals than the workbook can carry',
         f'=IF(Slots_TooMany=1,"TOO MANY GOALS: the app has no limit, but this workbook funds at most {NS} goals from savings ("&Slots_Funded&" are set), so the goal results, savings left and the Results numbers are NOT complete. Remove goals to match the app.",IF(Goal_RowsUsed>={NGOALS},"ALL {NGOALS} GOAL ROWS ARE USED: the app has no limit. If you have more goals than this, the extra ones are missing here and the results are not complete.",""))')
    return ws, g0, s0, r

