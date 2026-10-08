from lib import *
from p_pay import NR
from p_goals import NS

def build_debt(bk, hdr):
    wb = bk.wb
    if 'Plan debt months' in wb.sheetnames: del wb['Plan debt months']
    ws = wb.create_sheet('Plan debt months'); ws.sheet_properties.tabColor = '5B9BD5'
    ws['B1'] = 'Plan debt months: each loan, card and the mortgage month by month inside each plan year (the prototype\'s amortYear)'; ws['B1'].font = Font(bold=True, size=14)
    ws['B2'] = ('A debt is paid month by month: interest is added, then the repayment is taken (never more than what is owed), until the balance is 0.50 or less. '
                'Columns B1..B12 are the balance after each month and P1..P12 the repayments. "path" is the mortgage with no goal payments, used to price a Be-mortgage-free goal.')
    ws['B2'].alignment = Alignment(wrap_text=True, vertical='top'); ws.merge_cells('B2:L2'); ws.row_dimensions[2].height = 40
    T = YT(ws, 'D', hdr, NR); A = T.add
    A('t', 'Year (t)', None, width=6)
    specs = [('m', 'mortgage', '{C.mbS}', 'F_MR/12', 'F_MortPayM'), ('c', 'credit cards', '{C.cbS}', 'D_iC', 'F_CardPayM'), ('l', 'other loans', '{C.lbS}', 'D_iL', 'F_LoanPayM'), ('p', 'mortgage path', '{pS}', 'F_MR/12', 'F_MortPayM')]
    for p, nm, start, i, pay in specs:
        if p == 'p': A('pS', 'path: balance at the start of the year', '=IF({pS@-1}>1,{pEnd@-1},{pS@-1})', init='=F_MortBal', width=12)
        else: A(p + 'S', nm + ': balance at the start of the year', '=' + start, width=12)
        s = start if p == 'p' else '{' + p + 'S}'
        for m in range(1, 13):
            prev = s if m == 1 else '{' + f'{p}B{m - 1}' + '}'
            A(f'{p}B{m}', f'{nm} B{m}', f'=IF({prev}>PR_BalDone,{prev}+{prev}*({i})-MIN({pay},{prev}+{prev}*({i})),{prev})', width=10)
        for m in range(1, 13):
            prev = s if m == 1 else '{' + f'{p}B{m - 1}' + '}'
            A(f'{p}P{m}', f'{nm} P{m}', f'=IF({prev}>PR_BalDone,MIN({pay},{prev}+{prev}*({i})),0)', width=10)
        A(p + 'End', nm + ': balance after the year', f'=MAX(0,{{{p}B12}})', init=('=F_MortBal' if p == 'p' else None), width=12)
        A(p + 'Paid', nm + ': paid in the year', '=SUM({' + p + 'P1}:{' + p + 'P12})', width=12)
    A('path', 'path: balance counted at the start of the year (mPath)', '=MAX(0,{pS})', width=12)
    return ws, T

def build_cash(bk, hdr):
    wb = bk.wb
    if 'Plan cashflow' in wb.sheetnames: del wb['Plan cashflow']
    ws = wb.create_sheet('Plan cashflow'); ws.sheet_properties.tabColor = '5B9BD5'
    ws['B1'] = 'Plan cashflow: year by year, from your age today to the plan-until age (the prototype\'s project())'; ws['B1'].font = Font(bold=True, size=14)
    ws['B2'] = ('Each row is one year. Order inside a year: income and tax (Plan pay & tax) -> living costs -> debts repaid (Plan debt months) -> goals due this year are paid from their pot, then from spare money -> '
                'spare money is saved towards goals (or, if the year is short, spare money, the buffer and the goal pots give way) -> growth. Rows below the plan-until age are not used. '
                'The block of goal columns (s1..s20) repeats for each funded goal in funding order.')
    ws['B2'].alignment = Alignment(wrap_text=True, vertical='top'); ws.merge_cells('B2:L2'); ws.row_dimensions[2].height = 48
    T = YT(ws, 'C', hdr, NR); A = T.add
    A('t', 'Year (t)', None, width=6)
    A('active', 'In the plan (1/0)', '=IF({t}<=F_N,1,0)', width=7)
    A('a', 'Your age', '={P.a}', width=7)
    A('infl', 'Prices index', '={P.infl}', fmt='0.0000')
    A('work', 'Working (1/0)', '={P.work}', width=7)
    A('inflow', 'Money in after tax and pension contributions', '={P.gross}-{P.tax}-{P.cashOut}')
    A('living', 'Living costs and one-offs', '=IF({work}=1,F_CostsM*12,IF(RG_Exists=1,RG_Amount,F_CostsM*12*AS_RetireSpend))*{infl}+F_OneOffY*{infl}')
    A('mbS', 'Mortgage at the start of the year', '={mbE@-1}')
    A('fixM', 'Mortgage repaid', '=IF({mbS}>1,{D.mPaid},0)'); A('mbA', 'Mortgage after repayments', '=IF({mbS}>1,{D.mEnd},{mbS})')
    A('cbS', 'Cards at the start', '={cbE@-1}'); A('fixC', 'Cards repaid', '=IF({cbS}>1,{D.cPaid},0)'); A('cbE', 'Cards at the end', '=IF({cbS}>1,{D.cEnd},{cbS})', init='=F_CardBal')
    A('lbS', 'Loans at the start', '={lbE@-1}'); A('fixL', 'Loans repaid', '=IF({lbS}>1,{D.lPaid},0)'); A('lbE', 'Loans at the end', '=IF({lbS}>1,{D.lEnd},{lbS})', init='=F_LoanBal')
    A('fixed', 'Mortgage and loan repayments', '={fixM}+{fixC}+{fixL}')
    A('free0', 'Spare money at the start (after any pension lump sum)', '={freeE@-1}+{P.lsN}', init='=Init_Free0')
    A('freeP', 'Spare money, previous end', '={freeE@-1}', width=7)
    # step 2: goals due
    for K in range(1, NS + 1):
        p = f's{K}_'
        pe = f'{p}pE'
        fIn = '{free0}' if K == 1 else '{' + f's{K - 1}_fr' + '}'; bIn = '{bufS}' if K == 1 else '{' + f's{K - 1}_bf' + '}'; mIn = '{mbA}' if K == 1 else '{' + f's{K - 1}_mb' + '}'
        if K == 1: pass
        A(p + 'due', f'Goal {K} due this year (1/0)', f'=IF(AND(Slot{K}_On=1,{{a}}=Slot{K}_Age),1,0)', width=7)
        A(p + 'live', f'Goal {K} still to come (1/0)', f'=IF(AND(Slot{K}_On=1,Slot{K}_Age>{{a}}),1,0)', width=7)
        A(p + 'potS', f'Goal {K} pot, start', '={' + pe + '@-1}')
        A(p + 'pay0', f'Goal {K} paid from its pot', f'={{{p}due}}*MIN(Slot{K}_Cost,{{{p}potS}})')
        A(p + 'top', f'Goal {K} paid from spare money', f'={{{p}due}}*Slot{K}_SpendLike*MIN(Slot{K}_Cost-{{{p}pay0}},{fIn})')
        A(p + 'paid', f'Goal {K} paid', f'={{{p}pay0}}+{{{p}top}}')
        A(p + 'fr', f'Spare money after goal {K}', f'={fIn}-{{{p}top}}+{{{p}due}}*IF(Slot{K}_SpendLike=1,{{{p}potS}}-{{{p}pay0}},IF(Slot{K}_PotFree=1,{{{p}potS}},0))')
        A(p + 'bf', f'Buffer after goal {K}', f'={bIn}+{{{p}due}}*Slot{K}_BufPot*{{{p}potS}}')
        A(p + 'mb', f'Mortgage after goal {K}', f'=IF(AND({{{p}due}}=1,Slot{K}_IsMfree=1),IF({{{p}paid}}>=Slot{K}_Cost-1,0,MAX(0,{mIn}-{{{p}paid}})),{mIn})')
        A(p + 'gap', f'Goal {K} not covered', f'={{{p}due}}*(Slot{K}_Cost-{{{p}paid}})')
        if K == 1: A('bufS', 'Buffer, start', '={bufE@-1}', init='=Init_Buf0')   # placed after s1 columns is fine: names resolve by key
    A('goalPaid', 'Goals paid this year (from savings)', '=' + '+'.join(f'{{s{K}_due}}*Slot{K}_SpendLike*{{s{K}_paid}}' for K in range(1, NS + 1)))
    A('goalGap', 'Goal amounts not covered this year', '=' + '+'.join(f'{{s{K}_gap}}' for K in range(1, NS + 1)))
    A('goalCost', 'Goals due this year (cost)', '=' + '+'.join(f'{{s{K}_due}}*Slot{K}_Cost' for K in range(1, NS + 1)))
    A('mbE', 'Mortgage at the end of the year', f'={{s{NS}_mb}}', init='=F_MortBal')
    A('net', 'Money left after living costs and repayments', '={inflow}-{living}-{fixed}')
    A('auto0', 'The Q6 rule\'s saving today (a month)', '=IF({t}=0,' + SAVEAUTO('MAX(0,{net})/12') + ',{auto0@-1})', init=0)
    A('pos', 'Money left over (1) or a short year (0)', '=IF({net}>=0,1,0)', width=7)
    A('sp', 'Spare money a month, today\'s money', '=MAX(0,{net}/12/{infl})')
    A('autoSp', 'The Q6 rule on that spare money', '=' + SAVEAUTO('{sp}'))
    A('upF', 'Raising the rule (1) or capping it (0)', '=IF(Has_saveM=1,IF(In_saveUp="Yes",1,IF(In_saveUp="No",0,IF(In_saveM>={auto0}-0.5,1,0))),0)', width=7)
    A('cap', 'Monthly saving, today\'s money', '=IF(Has_saveM=1,MIN({sp},IF({upF}=1,MAX(In_saveM,{autoSp}),MIN(In_saveM,{autoSp}))),{autoSp})')
    A('base', 'Saving this year (nominal)', '=IF({work}=1,{cap}*12*{infl},0)')
    A('budget0', 'Saving this year after "save less"', '=MAX(0,{base}+IF(AND(WI_Retire=0,WI_M<0,{work}=1),WI_M*12*{infl},0))')
    A('wgLive', 'What-if goal still to come (1/0)', '=' + '+'.join(f'Slot{K}_IsWG*{{s{K}_live}}' for K in range(1, NS + 1)), width=7)
    A('extraAmt', 'What-if extra wanted this year', '=IF(AND(WI_Retire=0,WI_M>0,{work}=1,{wgLive}>=1),WI_M*12*{infl},0)')
    A('budget', 'Saving this year, after the money left', '=IF({pos}=1,MIN({budget0},{net}),0)')
    A('ex', 'What-if extra this year', '=IF({pos}=1,MIN({extraAmt},{net}-{budget}),0)')
    for K in range(1, NS + 1):
        p = f's{K}_'; bIn = '{budget}' if K == 1 else '{' + f's{K - 1}_bud' + '}'
        A(p + 'ann', f'Goal {K}: growth factor of saving that rises with pay', f'=IF({{{p}live}}=1,IF(ABS((1+AS_Wage)/(1+Slot{K}_Rate)-1)<1E-12,(Slot{K}_Age-{{a}})*(1+Slot{K}_Rate)^(Slot{K}_Age-{{a}}),(1+Slot{K}_Rate)^(Slot{K}_Age-{{a}})*(1-((1+AS_Wage)/(1+Slot{K}_Rate))^(Slot{K}_Age-{{a}}))/(1-(1+AS_Wage)/(1+Slot{K}_Rate))),1)')
        A(p + 'exneed', f'Goal {K}: needed for the what-if extra', f'=IF(AND({{pos}}=1,{{ex}}>0,Slot{K}_IsWG=1,{{{p}live}}=1),MAX(0,(Slot{K}_Cost-{{{p}potS}}*(1+Slot{K}_Rate)^(Slot{K}_Age-{{a}}))/{{{p}ann}}),0)')
        A(p + 'exgive', f'Goal {K}: what-if extra given', f'=IF(AND({{pos}}=1,{{ex}}>0,Slot{K}_IsWG=1,{{{p}live}}=1),MIN({{ex}},{{{p}exneed}}),0)')
        A(p + 'potE1', f'Goal {K}: pot after the what-if extra', f'={{{p}potS}}+{{{p}exgive}}')
        A(p + 'need', f'Goal {K}: saving needed this year', f'=IF({{{p}live}}=1,MAX(0,(Slot{K}_Cost-{{{p}potE1}}*(1+Slot{K}_Rate)^(Slot{K}_Age-{{a}}))/{{{p}ann}}),0)')
        A(p + 'needN', f'Goal {K}: saving needed in a short year', f'=IF({{{p}live}}=1,MAX(0,(Slot{K}_Cost-{{{p}potS}}*(1+Slot{K}_Rate)^(Slot{K}_Age-{{a}}))/{{{p}ann}}),0)')
        A(p + 'give', f'Goal {K}: saving given', f'=IF(AND({{pos}}=1,{{{p}live}}=1),MIN({bIn},{{{p}need}}),0)')
        A(p + 'bud', f'Saving left after goal {K}', f'={bIn}-{{{p}give}}')
    A('freeEx', 'What-if extra not needed by the goal (goes to spare money)', '={ex}-(' + '+'.join(f'{{s{K}_exgive}}' for K in range(1, NS + 1)) + ')')
    A('spentRaw', 'Left over after saving (assumed spent while working)', '=IF({pos}=1,{net}-{budget}-{ex},0)')
    A('gap0', 'Short by', '=IF({pos}=0,-{net},0)')
    A('takeF', 'Short year: taken from spare money', f'=MIN({{gap0}},{{s{NS}_fr}})')
    A('gapA', 'Still short', '={gap0}-{takeF}')
    A('takeB', 'Short year: taken from the buffer', f'=MIN({{gapA}},{{s{NS}_bf}})')
    A('gapB', 'Still short after the buffer', '={gapA}-{takeB}')
    for K in range(NS, 0, -1):
        p = f's{K}_'; gIn = '{gapB}' if K == NS else '{' + f's{K + 1}_gOut' + '}'
        A(p + 'take', f'Short year: taken from goal {K}\'s pot', f'=IF(AND({{pos}}=0,{{{p}live}}=1,{gIn}>0),MIN({gIn},{{{p}potS}}),0)')
        A(p + 'gOut', f'Still short after goal {K}', f'={gIn}-{{{p}take}}')
    A('short', 'Short for living costs and repayments', '=IF({pos}=0,{s1_gOut},0)')
    A('used', 'Taken from savings to cover a short year', '={takeF}+{takeB}+' + '+'.join(f'{{s{K}_take}}' for K in range(1, NS + 1)))
    A('free3', 'Spare money after saving or shortfall', f'=IF({{pos}}=1,{{s{NS}_fr}}+{{freeEx}}+{{s{NS}_bud}}+IF({{work}}=1,0,{{spentRaw}}),{{s{NS}_fr}}-{{takeF}})')
    A('buf3', 'Buffer after shortfall', f'={{s{NS}_bf}}-{{takeB}}')
    A('saved', 'Saved this year', '=IF({pos}=1,IF({work}=1,{budget}+{ex},{net}),0)')
    A('spent', 'Spare money assumed spent', '=IF({pos}=1,IF({work}=1,{net}-{budget}-{ex},0),0)')
    A('freeE', 'Spare money, end of year', '={free3}*(1+GR)', init='=Init_Free1')
    A('bufE', 'Buffer, end of year', '={buf3}*(1+AS_Cash)', init='=Init_Buf0')
    for K in range(1, NS + 1):
        p = f's{K}_'
        A(p + 'pE', f'Goal {K} pot, end of year', f'=IF({{{p}live}}=1,IF({{pos}}=1,{{{p}potE1}}+{{{p}give}},{{{p}potS}}-{{{p}take}})*(1+Slot{K}_Rate),0)', init=f'=Slot{K}_Pot0')
        A(p + 'cSum', f'Goal {K}: average saving numerator', f'=IF(AND({{pos}}=1,{{{p}live}}=1),({{{p}exgive}}+{{{p}give}})/{{infl}},0)')
        A(p + 'c0', f'Goal {K}: saved in year 0', f'=IF({{t}}=0,{{{p}exgive}}+{{{p}give}},0)')
        A(p + 'n0', f'Goal {K}: need in year 0', f'=IF({{t}}=0,IF({{pos}}=1,{{{p}need}},{{{p}needN}}),0)')
    A('liquid', 'Savings and pots at the end of the year', '={freeE}+{bufE}+' + '+'.join(f'{{s{K}_pE}}' for K in range(1, NS + 1)))
    A('shortTotal', 'Short (living + goals)', '={short}+{goalGap}')
    A('needs', 'Needs (living + repayments)', '={living}+{fixed}')
    A('retired', 'Retired (1/0)', '=1-{work}', width=7)
    A('rgCost', 'Retirement goal: cost this year', '=IF(AND(RG_Exists=1,{work}=0,{active}=1),{living},0)')
    A('rgCov', 'Retirement goal: covered this year', '=IF(AND(RG_Exists=1,{work}=0,{active}=1),{living}-MIN({short},{living}),0)')
    A('pen', 'Pension pot, end of year', '={P.potEnd}')
    A('shortFlag', 'Short for living costs (1/0)', '=IF(AND({active}=1,{short}>MAX(PR_Short1,{needs}*PR_Short2)),1,0)', width=7)
    A('partsInc', 'Chart: from income', '=MIN({inflow},{living}+{fixed})')
    A('partsSav', 'Chart: from savings', '={used}+MAX(0,{goalCost}-{goalGap})')
    A('partsShort', 'Chart: shortfall', '={short}+{goalGap}')
    A('chartShort', 'Chart: a short year (1/0)', '=IF(AND({active}=1,{partsShort}>PR_MinShort),1,0)', width=7)
    A('chartDip', 'Chart: a year using savings, not short (1/0)', '=IF(AND({active}=1,{chartShort}=0,{partsSav}>PR_MinShort),1,0)', width=7)
    A('livShort', 'Everyday costs short (1/0)', '=IF(AND({active}=1,{short}>PR_MinShort),1,0)', width=7)
    A('dipC', 'Chapter: dipping into savings and not short (1/0)', '=IF(AND({active}=1,{used}>1,{isShort}=0),1,0)', width=7)
    A('yrLabel', 'Year label (chapter detail and report table)', '=IF({active}=0,"",IF({isShort}=1,"Gap to plan for: short "&"€"&TEXT(ROUND({shortTotal},0),"#,##0"),IF({used}>1,"Using savings","Comfortable")))', width=24)
    A('dec', 'Chapter decade', '=IF(AND(INT({a}/10)*10=90,{t}>0),80,INT({a}/10)*10)', width=7)
    A('chapNo', 'Chapter number', '=IF({t}=0,1,IF({dec}<>{dec@-1},{chapNo@-1}+1,{chapNo@-1}))', init=0, width=7)
    A('overW', 'Working year short for living costs (1/0)', '=IF(AND({active}=1,{work}=1,{short}>MAX(PR_Short1,{needs}*PR_Short2)),1,0)', width=7)
    A('retShort', 'Retired and short for living costs (1/0)', '={retired}*{shortFlag}', width=7)
    A('gShort', 'A goal short of 95% is due this year (1/0)', '=' + '+'.join(f'IF(AND({{s{K}_due}}=1,Slot{K}_PctLow=1),1,0)' for K in range(1, NS + 1)), width=7)
    A('isShort', 'A short year on the road (1/0)', '=IF({active}=1,IF(OR({shortFlag}=1,{gShort}>0),1,0),0)', width=7)
    return ws, T

def SAVEAUTO(sp):
    # the Q6 rule: monthly saving, today's money, before the what-if
    cap = 'IF(Has_q6=1,CHOOSE(In_q6+1,PR_SaveB1,PR_SaveB2,PR_SaveB3,PR_SaveB4,0),AS_NoAnswer)'
    return f'IF(AND(Has_q6=1,In_q6=4),PR_ShareVaries*({sp}),MIN({cap},AS_SaveShare*({sp})))'
