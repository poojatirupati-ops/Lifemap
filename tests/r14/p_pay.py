from lib import *
NR = 90   # plan years t = 0..89 (the longest plan: age 18 to 105)

def consts():
    I, U, P, N, S, A = RI['RI']['it'], RI['RI']['usc'], RI['RI']['prsi'], RI['RI']['pen'], RI['RI']['sp'], RI['RI']['ae']
    pth = P['path']
    L = [
     ('PR_Band', I['band'], 'Income tax: 20% band, single (Band_Single)'), ('PR_BandSPCCC', I['bandSPCCC'], '20% band, lone parent with SPCCC'), ('PR_BandM', I['bandMarried'], '20% band, married one earner'), ('PR_Uplift', I['bandUplift'], 'Second-earner uplift, at most'),
     ('PR_r1', I['r1'], 'Standard rate'), ('PR_r2', I['r2'], 'Higher rate'), ('PR_Personal', I['personal'], 'Personal credit, single'), ('PR_PersonalM', I['personalMarried'], 'Personal credit, married'), ('PR_PAYE', I['paye'], 'Employee (PAYE) credit'), ('PR_PAYEcap', I['payeCapPct'], 'PAYE credit cap, share of pay'),
     ('PR_Rent', I['rent'], 'Rent Tax Credit, single'), ('PR_RentJoint', I['rentJoint'], 'Rent Tax Credit, joint'), ('PR_RentLast', I['rentLastYear'], 'Last year of the Rent Tax Credit'), ('PR_SPCCC', I['spccc'], 'Single Person Child Carer Credit'),
     ('PR_HomeCarer', I['homeCarer'], 'Home Carer Credit'), ('PR_HCLimit', I['homeCarerLimit'], 'Home Carer income limit'), ('PR_AgeCrAge', I['ageCreditAge'], 'Age credit from'), ('PR_AgeCr', I['ageCredit'], 'Age credit'),
     ('PR_AgeEx', I['ageExempt'], 'Age exemption limit, single'), ('PR_AgeExM', I['ageExemptMarried'], 'Age exemption limit, married'), ('PR_AgeMarg', I['ageMarginal'], 'Age exemption marginal rate'),
     ('PR_USCex', U['exempt'], 'USC exemption'), ('PR_USCb1', U['bands'][0][0], 'USC band 1 top'), ('PR_USCb2', U['bands'][1][0], 'USC band 2 top'), ('PR_USCb3', U['bands'][2][0], 'USC band 3 top'),
     ('PR_USCr1', U['bands'][0][1], 'USC rate 1'), ('PR_USCr2', U['bands'][1][1], 'USC rate 2'), ('PR_USCr3', U['bands'][2][1], 'USC rate 3'), ('PR_USCr4', U['bands'][3][1], 'USC rate 4'),
     ('PR_USCredAge', U['reducedAge'], 'Reduced USC from age'), ('PR_USCredMax', U['reducedMax'], 'Reduced USC income limit'), ('PR_USCredB1', U['reducedBands'][0][0], 'Reduced USC band 1 top'), ('PR_USCredR1', U['reducedBands'][0][1], 'Reduced USC rate 1'), ('PR_USCredR2', U['reducedBands'][1][1], 'Reduced USC rate 2'),
     ('PR_USCse', U['seSurcharge'], 'Self-employed USC surcharge'), ('PR_USCseOver', U['seSurchargeOver'], 'Surcharge on self-employed income over'),
     ('PR_PRSIr0', pth[0]['r'], 'PRSI rate, from Oct 2025'), ('PR_PRSIr1', pth[1]['r'], 'PRSI rate, from Oct 2026'), ('PR_PRSIr2', pth[2]['r'], 'PRSI rate, from Oct 2027'), ('PR_PRSIr3', pth[3]['r'], 'PRSI rate, from Oct 2028'),
     ('PR_PRSIt1', pth[1]['y'] * 12 + pth[1]['m'] - 1, 'Month index of the Oct 2026 change (year x 12 + month - 1)'), ('PR_PRSIt2', pth[2]['y'] * 12 + pth[2]['m'] - 1, 'Month index of the Oct 2027 change'), ('PR_PRSIt3', pth[3]['y'] * 12 + pth[3]['m'] - 1, 'Month index of the Oct 2028 change'),
     ('PR_PRSIfree', P['wkFree'], 'PRSI: weekly earnings with no PRSI'), ('PR_PRSIcreditMax', P['creditMax'], 'PRSI credit, maximum a week'), ('PR_PRSIcreditTo', P['creditTo'], 'PRSI credit ends above (a week)'), ('PR_PRSItaper', P['creditTaper'], 'PRSI credit taper'),
     ('PR_PRSIend', P['endAge'], 'No PRSI from age'), ('PR_PRSIsMinInc', P['sMinIncome'], 'Class S: income above which PRSI applies'), ('PR_PRSIsMin', P['sMin'], 'Class S minimum'), ('PR_PRSIunearned', P['unearnedMin'], 'Unearned income above which PRSI applies'),
     ('PR_RelA1', N['relief'][0][0], 'Pension relief: under 30'), ('PR_RelP1', N['relief'][0][1], ''), ('PR_RelA2', N['relief'][1][0], 'under 40'), ('PR_RelP2', N['relief'][1][1], ''), ('PR_RelA3', N['relief'][2][0], 'under 50'), ('PR_RelP3', N['relief'][2][1], ''),
     ('PR_RelA4', N['relief'][3][0], 'under 55'), ('PR_RelP4', N['relief'][3][1], ''), ('PR_RelA5', N['relief'][4][0], 'under 60'), ('PR_RelP5', N['relief'][4][1], ''), ('PR_RelP6', N['relief'][5][1], '60 and over'),
     ('PR_EarnCap', N['earnCap'], 'Pension relief earnings cap'), ('PR_LSmax', N['lsMaxPct'], 'Lump sum: at most this share'), ('PR_LSfree', N['lsTaxFree'], 'Lump sum tax-free up to'), ('PR_LScap', N['lsCap'], 'Lump sum counted up to'), ('PR_LSrate', N['lsBandRate'], 'Lump sum tax rate on the next band'),
     ('PR_SFT2026', N['sft']['2026'], 'Standard Fund Threshold 2026'), ('PR_SFT2027', N['sft']['2027'], '2027'), ('PR_SFT2028', N['sft']['2028'], '2028'), ('PR_SFT2029', N['sft']['2029'], '2029 and after'), ('PR_SFTrate', N['sftRate'], 'Tax above the threshold'),
     ('PR_ARF61', N['arfMin61'], 'Minimum draw from 61'), ('PR_ARF71', N['arfMin71'], 'Minimum draw from 71'), ('PR_ARFbigRate', N['arfMinBig'], 'Minimum draw over the big-fund limit'), ('PR_ARFbig', N['arfBig'], 'Big-fund limit'), ('PR_Earliest', N['earliestAge'], 'Earliest pension age'),
     ('PR_SPweek', S['week'], 'State Pension a week'), ('PR_Weeks', S['weeks'], 'Weeks a year'), ('PR_SPage', S['age'], 'State Pension age'), ('PR_Over80', S['over80'], 'Over-80 increase a week'), ('PR_QA66', S['qa66'], 'Qualified Adult rate, 66+'), ('PR_QAunder', S['qaUnder66'], 'Qualified Adult rate, under 66'),
     ('PR_SPfull', S['fullYears'], 'PRSI years for the full State Pension'), ('PR_SPmin', S['minYears'], 'Minimum PRSI years'),
     ('PR_AEageMin', A['ageMin'], 'Auto-enrolment: from age'), ('PR_AEageMax', A['ageMax'], 'up to age'), ('PR_AEearnMin', A['earnMin'], 'earning over'), ('PR_AEcap', A['earnCap'], 'on pay up to'), ('PR_AEee', A['ee'], 'employee rate'), ('PR_AEer', A['er'], 'employer rate'), ('PR_AEst', A['state'], 'State top-up rate'),
     ('PR_SaveB1', 50, 'Q6 band 1 (today\'s money a month)'), ('PR_SaveB2', 200, 'Q6 band 2'), ('PR_SaveB3', 500, 'Q6 band 3'), ('PR_SaveB4', 1000, 'Q6 band 4 ("Over €750" counts as €1,000)'), ('PR_ShareVaries', 0.33, 'Q6 "it changes": a third of spare money'),
     ('PR_ARFage1', 61, 'Minimum ARF draw starts at this age'), ('PR_ARFage2', 71, 'Higher minimum ARF draw from this age'), ('PR_Over80Age', 80, 'State Pension over-80 increase from this age'),
     ('PR_SFTfrom', 2026, 'First year the Standard Fund Threshold is set by law'), ('PR_SFTto', 2029, 'Last year it is set by law; later years rise with prices'),
     ('PR_GoalMaxAge', 89, 'A new goal is never put later than this age'), ('PR_PctCap', 99, 'A goal is never shown as 100% unless it is covered: the most shown otherwise'),
     ('PR_LowPct', 50, 'Level 4: a goal under this % counts as low'), ('PR_NudgeStep', 50, 'The "you can save more" nudge needs the try-this saving at least this much above what you save'),
     ('PR_BalDone', 0.5, 'A debt balance at or below this (euro) counts as cleared'), ('PR_MinShort', 0.5, 'A shortfall below this (euro) is ignored'), ('PR_SortBig', 1000000, 'Sort key: a goal with no rank sorts after every ranked goal'),
     ('PR_FbCard', 0.2, 'Planning rate: credit-card rate if the customer gives none (no published average; labelled "Assumed: add yours")'),
     ('PR_FbDrawFixed', 20000, 'Internal fallback: fixed draw a year if "fixed" is chosen without an amount'), ('PR_FbRetireAge', 66, 'Internal fallback: the retirement age used while none is chosen (the plan is gated; the app starts at 66)'), ('PR_FbMortYears', 25, 'Internal fallback: years left on a mortgage when none is given (the missing-details banner says so)'), ('PR_FbPenChg', 0.01, 'Internal fallback: typical pension charges'),
     ('PR_FbSpPartly', 0.6, 'Your State Pension if "Partly": share of the full rate when no PRSI years or weekly rate are given'), ('PR_FbSpOther', 0.8, 'Your State Pension if "Not sure": share of the full rate'),
     ('PR_FbPlanEnd1', 90, 'Internal fallback: plan-until age, alone'), ('PR_FbPlanEnd2', 95, 'Internal fallback: plan-until age, with a partner'),
     ('PR_Short1', 500, 'A shortfall year: more than this euro amount ...'), ('PR_Short2', 0.02, '... or this share of the year\'s needs'), ('PR_Good', 95, 'On track from (%)'), ('PR_Nudge', 70, 'Needs a nudge from (%)'),
    ]
    return L

def build_pay(bk, ws_inputs):
    wb = bk.wb
    if 'Plan pay & tax' in wb.sheetnames: del wb['Plan pay & tax']
    ws = wb.create_sheet('Plan pay & tax'); ws.sheet_properties.tabColor = '5B9BD5'
    ws['B1'] = 'Plan pay & tax: the figures the plan uses, and each year\'s pay, pension and tax (same rules as the prototype\'s finNums, netPay and hhTax)'; ws['B1'].font = Font(bold=True, size=14)
    ws.column_dimensions['B'].width = 62; ws.column_dimensions['C'].width = 14; ws.column_dimensions['D'].width = 60
    r = 3
    def sec(t):
        nonlocal r
        c = ws.cell(r, 2, t); c.fill = HEAD; c.font = WH; ws.cell(r, 3, 'Value').fill = HEAD; ws.cell(r, 3).font = WH; ws.cell(r, 4, 'How it is worked out').fill = HEAD; ws.cell(r, 4).font = WH; r += 1
    def fact(name, label, formula, note='', fmt=None):
        nonlocal r
        ws.cell(r, 2, label); c = ws.cell(r, 3, formula); c.fill = PLN
        if fmt: c.number_format = fmt
        ws.cell(r, 4, note).font = GREYF; bk.cellname(name, ws, f'C{r}'); r += 1
    sec('RULES the plan uses (set by law; the same values as the prototype\'s RULES_IE_2026)')
    import openpyxl as _ox
    _wbv = _ox.load_workbook('/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/r14/base.xlsx', data_only=True)
    def _asval(nm):
        ref = bk.wb.defined_names[nm].attr_text; sh, cell = ref.split('!'); return _wbv[sh.strip("'")][cell.replace('$', '')].value
    LINK = {'PR_Band': 'Band_Single', 'PR_BandSPCCC': 'Band_Single_Parent', 'PR_BandM': 'Band_Married', 'PR_Uplift': 'Band_Second_Earner_Max', 'PR_r1': 'Rate_Standard', 'PR_r2': 'Rate_Higher',
            'PR_Personal': 'Credit_Personal_Single', 'PR_PersonalM': 'Credit_Personal_Married', 'PR_PAYE': 'Credit_PAYE', 'PR_Rent': 'Credit_Rent_Single', 'PR_RentJoint': 'Credit_Rent_Joint',
            'PR_SPCCC': 'Credit_SPCCC', 'PR_HomeCarer': 'Credit_Home_Carer', 'PR_USCex': 'USC_Exempt', 'PR_USCb1': 'USC_Band_1', 'PR_USCb2': 'USC_Band_2', 'PR_USCb3': 'USC_Band_3',
            'PR_USCr1': 'USC_Rate_1', 'PR_USCr2': 'USC_Rate_2', 'PR_USCr3': 'USC_Rate_3', 'PR_USCr4': 'USC_Rate_4', 'PR_PRSIfree': 'PRSI_Free_Week', 'PR_PRSIcreditMax': 'PRSI_Credit_Max',
            'PR_PRSIcreditTo': 'PRSI_Credit_Top', 'PR_PRSItaper': 'PRSI_Credit_Taper', 'PR_EarnCap': 'Relief_Earnings_Cap', 'PR_LSmax': 'Lump_Sum_Max_Pct', 'PR_LSfree': 'Lump_Sum_Tax_Free',
            'PR_LScap': 'Lump_Sum_Cap', 'PR_LSrate': 'Lump_Sum_Rate', 'PR_SFT2026': 'SFT_2026', 'PR_SFTrate': 'SFT_Tax', 'PR_SPweek': 'State_Pension_Week', 'PR_SPage': 'State_Pension_Age'}
    LINKED, UNLINKED = [], []
    for n, v, lab in consts():
        an = LINK.get(n); a = None
        if an:
            try: a = _asval(an)
            except Exception: a = None
        if an and isinstance(a, (int, float)) and abs(a - v) < 1e-9: fact(n, lab, '=' + an, 'Assumptions: ' + an); LINKED.append(n)
        else:
            fact(n, lab, v, n + (' (typed copy of the prototype value; Assumptions differs or has no matching cell)' if an else '')); 
            if an: UNLINKED.append((n, an, a, v))
    fact('PR_StartSwitch', 'From the day after this date the plan starts in 2027 (the app\'s own switch)', '=DATE(2026,9,30)', 'PR_StartSwitch (a date typed in the app\'s code)', fmt='dd/mm/yyyy')
    print('PR linked to Assumptions:', len(LINKED), 'differing:', UNLINKED)
    r += 1; sec('YOUR CHOICES the plan reads (an unchosen choice falls back to the standard in Settings, exactly like the prototype\'s asmV)')
    F = fact
    F('AS_Cautious', 'Growth set is Cautious (1) or Standard (0)', '=IF(In_assumeSet="Cautious",1,0)')
    F('AS_Infl', 'Inflation used', '=IF(Has_infl=1,In_infl,Set_infl)', 'S.infl, else the Settings standard (an internal fallback only: the plan is gated until chosen)')
    for k in ['wage', 'cash', 'inv', 'pen', 'penRet']:
        F('AS_' + k[0].upper() + k[1:], f'{k} growth used', f'=IF(Has_a_{k}=1,In_a_{k},IF(AS_Cautious=1,Set_{k}_Cautious,Set_{k}))')
    F('AS_MortRate', 'Mortgage rate assumption', '=IF(Has_a_mortRate=1,In_a_mortRate,Set_mortRate)', 'if none is given: the suggested Central Bank average on Settings (labelled "Assumed: add yours" in the app)')
    F('AS_CardRate', 'Credit-card rate assumption', '=IF(Has_a_cardRate=1,In_a_cardRate,PR_FbCard)', 'if none is given: the 20% planning rate ("Assumed: add yours")')
    F('AS_LoanRate', 'Other loans rate assumption', '=IF(Has_a_loanRate=1,In_a_loanRate,Set_loanRate)', 'if none is given: the suggested Central Bank average on Settings ("Assumed: add yours")')
    F('AS_End', 'Plan until age', '=IF(Has_a_planEnd=1,In_a_planEnd,IF(In_partner="Yes",PR_FbPlanEnd2,PR_FbPlanEnd1))', 'fallback 90 (95 with a partner), never shown')
    F('AS_Year0', 'First plan year', '=IF(Has_a_startYear=1,In_a_startYear,IF(TODAY()>PR_StartSwitch,Rules_Year_Next,Rules_Year))')
    F('AS_TwoSecure', 'Two secure incomes (1/0)', '=IF(AND(In_partner="Yes",In_income>0,In_pIncome>0,In_work="Employed"),1,0)')
    F('AS_Months', 'Emergency fund months', '=IF(Has_a_safetyMonths=1,In_a_safetyMonths,IF(AS_TwoSecure=1,Set_safetyMonthsTwo,Set_safetyMonths))')
    F('AS_LongYrs', 'Years kept as cash', '=IF(Has_a_cashYears=1,In_a_cashYears,Set_cashYears)')
    F('AS_SaveShare', 'Share of spare money saved, at most', '=IF(Has_a_saveShare=1,In_a_saveShare,Set_saveShare)')
    F('AS_NoAnswer', 'Monthly saving if Q6 not answered', '=IF(Has_a_noAnswer=1,In_a_noAnswer,Set_noAnswer)')
    F('AS_InvShare', 'Spare savings invested (share)', '=IF(Has_a_investShare=1,In_a_investShare,Set_investShare)')
    F('AS_AccessAge', 'Pension access age', '=IF(Has_a_accessAge=1,In_a_accessAge,Set_accessAge)')
    F('AS_LumpPct', 'Lump sum share', '=IF(Has_a_lumpSum=1,In_a_lumpSum,Set_lumpSum)')
    F('AS_DrawRule', 'Drawdown rule', '=IF(Has_a_drawRule=1,In_a_drawRule,Set_drawRule)')
    F('AS_DrawFixed', 'Fixed draw a year (today\'s money)', '=IF(Has_a_drawFixed=1,In_a_drawFixed,PR_FbDrawFixed)')
    F('AS_Bands', 'Tax bands in future', '=IF(Has_a_bands=1,In_a_bands,Set_bands)')
    F('AS_SpGrow', 'State Pension in future', '=IF(Has_a_spGrow=1,In_a_spGrow,Set_spGrow)')
    F('AS_RetireSpend', 'Retirement spending share', '=IF(Has_a_retireSpend=1,In_a_retireSpend,Set_retireSpend)')
    F('AS_OwnShare', 'Share of pension you pay yourself', '=IF(Has_a_ownShare=1,In_a_ownShare,IF(In_work="Self-employed",1,Set_ownShare))')
    F('AS_PenChgTyp', 'Typical pension charges in the growth rate', '=IF(Has_a_penChg=1,In_a_penChg,PR_FbPenChg)')
    F('AS_SpOwn', "Your State Pension answer ('Not sure' if blank)", '=IF(In_sp="","Not sure",In_sp)')
    F('AS_SpWeek', 'Your State Pension a week (if no PRSI years)', '=IF(Has_a_spWeek=1,In_a_spWeek,PR_SPweek*IF(AS_SpOwn="Partly",PR_FbSpPartly,PR_FbSpOther))')
    F('AS_PSpOwn', "Partner's State Pension answer ('Not sure' if blank)", '=IF(In_pSp="","Not sure",In_pSp)')
    F('AS_PSpWeek', "Partner's State Pension a week", '=IF(Has_a_pSpWeek=1,In_a_pSpWeek,PR_SPweek*IF(AS_PSpOwn="Own partial",PR_FbSpPartly,PR_FbSpOther))')
    F('AS_SP', 'State Pension a year, full rate (weekly rate x 52)', '=PR_SPweek*PR_Weeks')
    r += 1; sec('YOUR FIGURES the plan uses (the prototype\'s finNums: a skipped figure counts as €0)')
    F('F_Work', 'Your work (Employed if not said and you have an income)', '=IF(In_work<>"",In_work,IF(In_income>0,"Employed",""))')
    F('F_Age', 'Your age', '=In_age'); F('F_R', 'Retirement age', '=IF(Has_retireAge=1,In_retireAge,PR_FbRetireAge)')
    F('F_Partner', 'Partner (1/0)', '=IF(In_partner="Yes",1,0)'); F('F_Married', 'Joint assessment (1/0)', '=IF(AND(F_Partner=1,In_married="Yes"),1,0)')
    F('F_Income', 'Your income (0 if not working)', '=IF(In_work="Not working",0,In_income)'); F('F_PIncome', "Partner's income", '=IF(F_Partner=1,In_pIncome,0)')
    F('F_PAge', "Partner's age (your own age if not given)", '=IF(F_Partner=1,IF(In_pAge>0,In_pAge,In_age),0)'); F('F_PRet', "Partner's retirement age (0 = not given)", '=IF(Has_pRet=1,In_pRet,0)')
    F('F_OtherM', 'Other income a month', '=In_otherM'); F('F_CostsM', 'Living costs a month', '=In_costsM'); F('F_OneOffY', 'One-off costs a year', '=In_oneOffY')
    F('F_Cash', 'Cash', '=In_cash'); F('F_Invest', 'Investments', '=In_invest'); F('F_RentM', 'Rental income a month', '=In_rentM')
    F('F_MortOn', 'Own with mortgage (1/0)', '=IF(In_home="Own with mortgage",1,0)')
    F('F_MR', 'Mortgage rate used', '=IF(In_mortRate>0,In_mortRate,AS_MortRate)')
    F('F_MStated', 'Mortgage repayment given', '=IF(F_MortOn=1,In_mortPayM,0)')
    F('F_MortBal', 'Mortgage left', '=IF(F_MortOn=1,In_mortBal,0)')
    F('F_MortPayM', 'Mortgage repayment used (given, else worked out from balance, rate and years; 25 years if none, gated)',
      '=IF(F_MortOn=1,IF(F_MStated<>0,F_MStated,IF(F_MortBal>0,IF(F_MR/12<>0,F_MortBal*(F_MR/12)/(1-(1+F_MR/12)^-MAX(1,ROUND(IF(In_mortYears<>0,In_mortYears,PR_FbMortYears)*12,0))),F_MortBal/MAX(1,ROUND(IF(In_mortYears<>0,In_mortYears,PR_FbMortYears)*12,0))),0)),0)')
    F('F_MortPayEst', 'Mortgage repayment was worked out (1/0)', '=IF(AND(F_MortOn=1,F_MStated=0),1,0)')
    F('F_MortPayLow', 'Mortgage repayment too low to clear it (1/0)', '=IF(AND(F_MortOn=1,F_MStated>0,F_MortBal>0,In_mortYears>0,F_MStated<IF(F_MR/12<>0,F_MortBal*(F_MR/12)/(1-(1+F_MR/12)^-MAX(1,ROUND(In_mortYears*12,0))),F_MortBal/MAX(1,ROUND(In_mortYears*12,0)))-1),1,0)')
    r += 1; sec('DEBTS (the prototype\'s debtNums; a mortgage on another property is folded into other loans)')
    F('M2_Bal', 'Other-property mortgages: balance', '=Mort2_Bal'); F('M2_Pay', 'Other-property mortgages: repayment', '=Mort2_Pay'); F('M2_Rate', 'Other-property mortgages: weighted rate', '=Mort2_Rate')
    F('D_cR', 'Card rate used', '=IF(In_cardRate>0,In_cardRate,AS_CardRate)')
    F('D_lR0', 'Loan rate used (before other-property mortgages)', '=IF(In_loanRate>0,In_loanRate,AS_LoanRate)')
    F('D_lB0', 'Loans owed (before other-property mortgages)', '=In_loanBal+In_debt')
    F('D_lR', 'Loan rate used, weighted', '=IF(M2_Bal>0,IF(D_lB0>0,(D_lB0*D_lR0+M2_Bal*M2_Rate)/(D_lB0+M2_Bal),M2_Rate),D_lR0)')
    F('F_CardBal', 'Cards owed', '=In_cardBal'); F('F_LoanBal', 'Loans owed (incl. other-property mortgages)', '=D_lB0+M2_Bal')
    F('D_lp', 'Loan repayment given', '=In_loanPayM+In_debtPayM+M2_Pay')
    F('D_iC', 'Card monthly rate (APR as effective yearly rate)', '=(1+D_cR)^(1/12)-1'); F('D_iL', 'Loan monthly rate', '=(1+D_lR)^(1/12)-1')
    F('D_okC', 'Card repayment covers the interest (1/0)', '=IF(AND(F_CardBal>0,In_cardPayM>F_CardBal*D_iC),1,0)')
    F('D_okL', 'Loan repayment covers the interest (1/0)', '=IF(AND(F_LoanBal>0,D_lp>F_LoanBal*D_iL),1,0)')
    F('F_CardPayM', 'Card repayment used (given if it covers the interest, else a 5-year repayment)', '=IF(F_CardBal>0,IF(D_okC=1,In_cardPayM,IF(D_iC<>0,F_CardBal*D_iC/(1-(1+D_iC)^-60),F_CardBal/60)),0)')
    F('F_LoanPayM', 'Loan repayment used', '=IF(F_LoanBal>0,IF(D_okL=1,D_lp,IF(D_iL<>0,F_LoanBal*D_iL/(1-(1+D_iL)^-60),F_LoanBal/60)),0)')
    F('F_CardPayEst', 'Card repayment worked out (1/0)', '=IF(AND(F_CardBal>0,D_okC=0),1,0)'); F('F_LoanPayEst', 'Loan repayment worked out (1/0)', '=IF(AND(F_LoanBal>0,D_okL=0),1,0)')
    F('F_Debt', 'Debt (cards + loans)', '=F_CardBal+F_LoanBal'); F('F_DebtPayM', 'Debt repayments a month', '=F_CardPayM+F_LoanPayM')
    F('F_EssM', 'Essential spending a month (living + mortgage + loan repayments)', '=F_CostsM+F_MortPayM+IF(F_Debt>0,F_DebtPayM,0)')
    r += 1; sec('PENSION, STATE PENSION, TAX STATUS')
    F('F_PenM', 'Paid into pension each month (you + employer)', '=IF(AND(In_work<>"Not working",F_Income>0),In_pensionM,0)')
    F('F_Own', 'Of that, paid by you', '=IF(Has_pensionOwnM=1,MIN(F_PenM,In_pensionOwnM),F_PenM*AS_OwnShare)')
    F('F_PenG', 'Pension growth used while working', '=AS_Pen+IF(Has_penChg=1,AS_PenChgTyp-In_penChg,0)')
    F('F_YrsSP', 'PRSI years used (blank = not known)', '=IF(Has_spYears=1,In_spYears,IF(Has_a_spYears=1,In_a_spYears,""))')
    F('F_SpF', 'Your State Pension, share of the full rate', '=IF(F_YrsSP<>"",IF(F_YrsSP<PR_SPmin,0,MIN(1,F_YrsSP/PR_SPfull)),IF(In_sp="Expect full",1,MIN(1,AS_SpWeek/PR_SPweek)))')
    F('F_PSpO', "Partner's State Pension answer used", '=IF(F_Partner=1,AS_PSpOwn,"None")')
    F('F_PSpQA', 'Partner on a Qualified Adult increase (1/0)', '=IF(F_PSpO="Qualified adult increase",1,0)')
    F('F_PSpF', "Partner's State Pension, share of the full rate", '=IF(F_PSpO="Own full",1,IF(OR(F_PSpO="Own partial",F_PSpO="Not sure"),MIN(1,AS_PSpWeek/PR_SPweek),0))')
    F('F_AE', 'Auto-enrolment counted (1/0)', '=IF(AND(F_Work="Employed",In_age>=PR_AEageMin,In_age<=PR_AEageMax,F_Income>PR_AEearnMin,F_PenM=0,In_ae<>"No"),1,0)')
    F('F_RentCred', 'Rent Tax Credit claimed (1/0)', '=IF(AND(In_credRent="Yes",In_home="Rent"),1,0)')
    F('F_Spccc', 'Single Person Child Carer Credit (1/0)', '=IF(AND(In_credLone="Yes",In_deps>0,F_Partner=0),1,0)')
    F('F_Carer', 'Home Carer Credit (1/0)', '=IF(AND(In_credCarer="Yes",F_Partner=1,In_married="Yes"),1,0)')
    F('F_Pension0', 'Pension value at the start (plus a what-if lump sum if it is for retirement)', '=In_pension+IF(WI_Retire=1,In_wiL,0)')
    F('F_V', 'Age from which the pension is drawn (retirement age, at least the pension access age)', '=MAX(F_R,AS_AccessAge)')
    F('F_N', 'Last plan year, counting from today (plan-until age less your age)', '=AS_End-F_Age')
    F('F_SelfEmp', 'Self-employed (1/0)', '=IF(In_work="Self-employed",1,0)')
    F('WI_Retire', 'What-if goal is the retirement goal (1/0)', '=IF(AND(In_wiGoal>0,INDEX(Goal_Kind_List,MAX(1,In_wiGoal))="retire"),1,0)', 'set on Plan goals')
    F('WI_M', 'What-if monthly', '=In_wiM'); F('WI_L', 'What-if lump', '=In_wiL')
    r += 2
    return ws, r

def pay_table(ws, hdr):
    T = YT(ws, 'P', hdr, NR)
    A = T.add
    A('t', 'Year (t)', None, init=None, width=6)
    A('a', 'Your age', '=F_Age+{t}', width=7)
    A('yr', 'Year', '=AS_Year0+{t}', width=7)
    A('infl', 'Prices index', '=(1+AS_Infl)^{t}', fmt='0.0000')
    A('wgw', 'Pay index', '=(1+AS_Wage)^{t}', fmt='0.0000')
    A('work', 'Working (1/0)', '=IF({a}<F_R,1,0)', width=7)
    A('tI', 'Tax-band index', '=IF(AS_Bands="flat",1,{infl})', fmt='0.0000')
    A('spI', 'State Pension index', '=IF(AS_SpGrow="pay",{wgw},IF(AS_SpGrow="flat",1,{infl}))', fmt='0.0000')
    A('rate', 'PRSI rate this year', '=(12*PR_PRSIr0+(PR_PRSIr1-PR_PRSIr0)*MAX(0,MIN(12,{yr}*12+12-PR_PRSIt1))+(PR_PRSIr2-PR_PRSIr1)*MAX(0,MIN(12,{yr}*12+12-PR_PRSIt2))+(PR_PRSIr3-PR_PRSIr2)*MAX(0,MIN(12,{yr}*12+12-PR_PRSIt3)))/12', fmt='0.0000')
    A('emp1', 'Your pay (nominal)', '=IF({work}=1,F_Income*{wgw},0)')
    A('E', 'Your own pension contribution', '=IF({work}=1,(F_Own+In_penExtra)*12*{wgw},0)')
    A('Etot', 'Total pension contribution (you + employer)', '=IF({work}=1,(F_PenM+In_penExtra)*12*{wgw},0)')
    A('relPct', 'Relief limit (share of pay) at this age', '=IF({a}<PR_RelA1,PR_RelP1,IF({a}<PR_RelA2,PR_RelP2,IF({a}<PR_RelA3,PR_RelP3,IF({a}<PR_RelA4,PR_RelP4,IF({a}<PR_RelA5,PR_RelP5,PR_RelP6)))))', fmt='0.00')
    A('relief', 'Pension relief (income tax only, nominal)', '=IF({work}=1,MIN({E}/{tI},{relPct}*MIN({emp1}/{tI},PR_EarnCap))*{tI},0)')
    A('aeBase', 'Auto-enrolment pay base', '=IF(AND({work}=1,F_AE=1),MIN({emp1}/{tI},PR_AEcap)*{tI},0)')
    A('contrib', 'Paid into pension this year', '=IF({work}=1,IF(WI_Retire=1,MAX(0,{Etot}+WI_M*12),{Etot})+(PR_AEee+PR_AEer+PR_AEst)*{aeBase},0)')
    A('cashOut', 'Pension contributions out of take-home pay', '={E}+PR_AEee*{aeBase}')
    A('potS', 'Pension pot, start of year', '={potEnd@-1}')
    A('sft', 'Standard Fund Threshold this year (law to 2029, then rising with prices)', '=IF({yr}<=PR_SFTfrom,PR_SFT2026,IF({yr}=PR_SFTfrom+1,PR_SFT2027,IF({yr}=PR_SFTfrom+2,PR_SFT2028,IF({yr}<=PR_SFTto,PR_SFT2029,PR_SFT2029*(1+AS_Infl)^({yr}-PR_SFTto)))))')
    A('atV', 'First drawing year (1/0)', '=IF(AND({work}=0,{a}=F_V),1,0)', width=7)
    A('cet', 'Tax above the Standard Fund Threshold', '=IF({atV}=1,PR_SFTrate*MAX(0,{potS}-{sft}),0)')
    A('potV1', 'Pot after that tax', '={potS}-{cet}')
    A('lsG', 'Lump sum taken (gross, no cap)', '=IF(AND({atV}=1,AS_LumpPct>0),{potV1}*MIN(AS_LumpPct,PR_LSmax),0)')
    A('lsN', 'Lump sum after tax (goes into savings)', '={lsG}-(PR_LSrate*MAX(0,MIN({lsG},PR_LScap)-PR_LSfree)+PR_r2*MAX(0,{lsG}-PR_LScap))')
    A('potV2', 'Pot after the lump sum', '={potV1}-{lsG}')
    A('mn', 'Legal minimum draw (share)', '=IF({a}>=PR_ARFage1,IF({potV2}>PR_ARFbig,PR_ARFbigRate,IF({a}>=PR_ARFage2,PR_ARF71,PR_ARF61)),0)', fmt='0.00')
    A('want', 'Draw wanted', '=IF(AS_DrawRule="min",{potV2}*{mn},IF(AS_DrawRule="fixed",MAX(AS_DrawFixed*{infl},{potV2}*{mn}),{potV2}*MAX(1/MAX(1,AS_End-{a}+1),{mn})))')
    A('draw', 'Drawn from pension', '=IF(AND({work}=0,{a}>=F_V),MIN({potV2},{want}),0)')
    A('potEnd', 'Pension pot, end of year', '=IF({work}=1,{potS}*(1+F_PenG)+{contrib},IF({a}<F_V,{potS}*(1+F_PenG),({potV2}-{draw})*(1+AS_PenRet)))', init='=F_Pension0')
    A('sp1', 'Your State Pension', '=IF({a}>=PR_SPage,AS_SP*F_SpF*{spI}+IF({a}>=PR_Over80Age,PR_Over80*PR_Weeks*{spI},0),0)')
    A('oth1', 'Other and rental income', '=(F_OtherM+F_RentM)*12*{infl}')
    A('pa', "Partner's age", '=F_PAge+{t}', width=7)
    A('emp2', "Partner's pay", '=IF(AND(F_Partner=1,F_PAge>0,{pa}<IF(F_PRet>0,F_PRet,PR_SPage)),F_PIncome*{wgw},0)')
    A('sp2', "Partner's State Pension", '=IF(AND(F_Partner=1,{pa}>=PR_SPage,F_PSpQA=0),AS_SP*F_PSpF*{spI},0)')
    A('qa', 'Qualified Adult increase paid to you', '=IF(AND(F_Partner=1,F_PSpQA=1,{a}>=PR_SPage,{emp2}=0),IF({pa}>=PR_SPage,PR_QA66,PR_QAunder)*PR_Weeks*{spI},0)')
    A('sp1t', 'Your State Pension incl. any Qualified Adult increase', '={sp1}+{qa}')
    for k, src in [('e1', 'emp1'), ('s1', 'sp1t'), ('d1', 'draw'), ('o1', 'oth1'), ('r1', 'relief'), ('e2', 'emp2'), ('s2', 'sp2')]:
        A(k, 'Real (today\'s prices): ' + src, '={' + src + '}/{tI}')
    A('x1', 'Your taxable income for income tax', '=MAX(0,{e1}+{d1}+{o1}+{s1}-{r1})')
    A('x2', "Partner's taxable income", '=MAX(0,{e2}+{s2})')
    A('pay1', 'PAYE credit, you', '=MIN(PR_PAYE,PR_PAYEcap*({e1}+{d1}+{s1}))')
    A('pay2', 'PAYE credit, partner', '=MIN(PR_PAYE,PR_PAYEcap*({e2}+{s2}))')
    A('ac1', 'Age credit, you', '=IF({a}>=PR_AgeCrAge,PR_AgeCr,0)'); A('ac2', 'Age credit, partner', '=IF({pa}>=PR_AgeCrAge,PR_AgeCr,0)')
    A('rentOn', 'Rent credit this year (1/0)', '=IF(AND(F_RentCred=1,{yr}<=PR_RentLast),1,0)', width=7)
    A('xT', 'Joint taxable income', '={x1}+{x2}')
    A('crM', 'Joint credits', '=PR_PersonalM+{pay1}+{pay2}+{ac1}+{ac2}+IF({rentOn}=1,PR_RentJoint,0)')
    A('bandM', 'Joint 20% band', '=PR_BandM+MIN(MIN({x1},{x2}),PR_Uplift)')
    A('itM0', 'Joint income tax', '=MAX(0,PR_r1*MIN({xT},{bandM})+PR_r2*MAX(0,{xT}-{bandM})-{crM})')
    A('hc', 'Home Carer credit', '=MAX(0,PR_HomeCarer-MAX(0,MIN({x1},{x2})-PR_HCLimit)/2)')
    A('itM1', 'Joint tax, better of the band or the Home Carer credit', '=IF(F_Carer=1,MIN({itM0},MAX(0,PR_r1*MIN({xT},PR_BandM)+PR_r2*MAX(0,{xT}-PR_BandM)-{crM}-{hc})),{itM0})')
    A('itM', 'Joint tax after the age exemption', '=IF(OR({a}>=PR_AgeCrAge,{pa}>=PR_AgeCrAge),IF({xT}<=PR_AgeExM,0,MIN({itM1},PR_AgeMarg*({xT}-PR_AgeExM))),{itM1})')
    A('it1a', 'Your income tax, as an individual', '=MAX(0,PR_r1*MIN({x1},IF(F_Spccc=1,PR_BandSPCCC,PR_Band))+PR_r2*MAX(0,{x1}-IF(F_Spccc=1,PR_BandSPCCC,PR_Band))-(PR_Personal+{pay1}+{ac1}+IF(F_Spccc=1,PR_SPCCC,0)+IF({rentOn}=1,PR_Rent,0)))')
    A('it1', 'Your income tax after the age exemption', '=IF({a}>=PR_AgeCrAge,IF({x1}<=PR_AgeEx,0,MIN({it1a},PR_AgeMarg*({x1}-PR_AgeEx))),{it1a})')
    A('it2a', "Partner's income tax, as an individual", '=IF(F_Partner=1,MAX(0,PR_r1*MIN({x2},PR_Band)+PR_r2*MAX(0,{x2}-PR_Band)-(PR_Personal+{pay2}+{ac2}+IF(AND({rentOn}=1,{x2}>0),PR_Rent,0))),0)')
    A('it2', "Partner's income tax after the age exemption", '=IF({pa}>=PR_AgeCrAge,IF({x2}<=PR_AgeEx,0,MIN({it2a},PR_AgeMarg*({x2}-PR_AgeEx))),{it2a})')
    A('it', 'Income tax (real)', '=IF(F_Partner=1,IF(F_Married=1,{itM},{it1}+{it2}),{it1})')
    A('bs1', 'USC base, you (State Pension is exempt)', '={e1}+{d1}+{o1}')
    uscf = lambda g, red: ('IF({g}<=PR_USCex,0,IF({red}=1,PR_USCr1*MIN({g},PR_USCredB1)+PR_USCredR2*MAX(0,{g}-PR_USCredB1),PR_USCr1*MIN({g},PR_USCb1)+PR_USCr2*MAX(0,MIN({g},PR_USCb2)-PR_USCb1)+PR_USCr3*MAX(0,MIN({g},PR_USCb3)-PR_USCb2)+PR_USCr4*MAX(0,{g}-PR_USCb3)))').replace('{g}', g).replace('{red}', red)
    A('usc1', 'USC, you', '=' + uscf('{bs1}', 'IF(AND({a}>=PR_USCredAge,{bs1}<=PR_USCredMax),1,0)') + '+IF(F_SelfEmp=1,PR_USCse*MAX(0,{e1}-PR_USCseOver),0)')
    A('bs2', 'USC base, partner', '={e2}')
    A('usc2', 'USC, partner', '=IF(F_Partner=1,' + uscf('{bs2}', 'IF(AND({pa}>=PR_USCredAge,{bs2}<=PR_USCredMax),1,0)') + ',0)')
    pA = lambda g: 'IF({g}/52<=PR_PRSIfree,0,MAX(0,({g}/52*{rate}-IF({g}/52<=PR_PRSIcreditTo,MAX(0,PR_PRSIcreditMax-({g}/52-(PR_PRSIfree+0.01))/PR_PRSItaper),0))*52))'.replace('{g}', g)
    A('prsi1', 'PRSI, you', '=IF({a}<PR_PRSIend,IF(F_SelfEmp=1,IF({e1}>PR_PRSIsMinInc,MAX(PR_PRSIsMin,{e1}*{rate}),0),' + pA('{e1}') + ')+{rate}*{d1}+IF({o1}>PR_PRSIunearned,{rate}*{o1},0),0)')
    A('prsi2', 'PRSI, partner', '=IF(AND(F_Partner=1,{pa}<PR_PRSIend),' + pA('{e2}') + ',0)')
    A('taxReal', 'Income tax + USC + PRSI (real)', '={it}+{usc1}+{usc2}+{prsi1}+{prsi2}')
    A('tax', 'Total tax (nominal)', '={taxReal}*{tI}')
    A('gross', 'Gross income (nominal)', '={emp1}+{sp1t}+{draw}+{oth1}+{emp2}+{sp2}')
    return T
