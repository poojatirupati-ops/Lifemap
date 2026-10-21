# ============ READ ME (new, first sheet) ============
m=wb.create_sheet('READ ME',0)
m['A1']='LifeMap calculators v2.9 (2026 tax rules)'; m['A1'].font=T
put(m,2,1,'2026 rules only: the 2027 Budget rules are not in this workbook. Every figure marked "Requires Verification" on the Tax sheet has not yet been checked against Revenue or the Department of Social Protection.',border=False); m.merge_cells('A2:D2'); m.row_dimensions[2].height=34
put(m,3,1,'Fill example values? (Yes / No)',B,SUB); put(m,3,2,'Yes',B,INP,wrap=False)
put(m,3,3,'Yes: every blank input on the Plan inputs sheet shows the example customer (Aoife and Cian), so all the plan sheets show a worked example. Anything you type replaces the example. No: start empty.',border=False); m.merge_cells('C3:D3'); m.row_dimensions[3].height=48
dvF=DataValidation(type='list',formula1='"Yes,No"',allow_blank=False); m.add_data_validation(dvF); dvF.add('B3')
wb.defined_names['Fill_Example'].attr_text="'READ ME'!$B$3"
row=5
def sec(title):
    global row
    put(m,row,1,title,H,HF); 
    for cc in (2,3,4): put(m,row,cc,'',H,HF)
    row+=1
def para(a,b_,h=None):
    global row
    put(m,row,1,a,B,SUB); put(m,row,2,b_); m.merge_cells(start_row=row,start_column=2,end_row=row,end_column=4)
    m.row_dimensions[row].height=h or max(32,15*(len(b_)//110+1)); row+=1
sec('THE FLOW OF THIS WORKBOOK (tab order, left to right)')
flow=[('1. READ ME (this sheet)','The example switch above, this flow, the known differences, the assumptions list and a list of the calculators.'),
('2. Sample walkthrough','A story with live numbers to explain the workbook to your team: investing in an ETF, selling property, gifting, inheriting, and a year of cash flow.'),
('3. Tax','One sheet. Top: which tax applies when you hold, sell, buy, give or receive (pick a situation in the yellow cell). Below: every 2026 tax figure with its status, effective date and source.'),
('4. Plan inputs','The yellow input block for the plan: about you and your family, goals, income, assets, debts and your assumptions. With "Fill example values" = Yes the blanks show the example customer.'),
('5. Plan pay & tax','Turns the inputs into the figures the plan uses (pay, pension, State Pension, mortgage repayment) and works out the tax each year: income tax, USC, PRSI and pension relief.'),
('6. Plan goals','Your goals in funding order, and for each goal what it costs, what has been put aside and how much is covered.'),
('7. Plan cashflow','THE cash flow. One row per year from today to the plan-until age: money in after tax and pension contributions, living costs, mortgage and loan repayments, goals paid, what is saved and what balances are left. Column E, "TAXES APPLIED THIS YEAR", says which taxes were charged that year and how much (today\'s money).'),
('8. Plan holdings','Where the plan\'s own money sits, year by year: cash, savings accounts, investments (lot by lot, so each lot has its own 8-year clock and cost), other assets and alternative investments. Money for goals and for short years is taken in the funding order, and the tax on selling (exit tax or capital gains tax, with losses and the yearly exemption) and at each 8-year anniversary is worked out here and flows into Plan cashflow.'),
('9. Plan results','What the Results screens in the app show, worked out by formulas: the saving numbers (spare money, what you save a month), the "To see your results we need N things" check, the % of each goal covered, the findings (main strength, main gap, biggest decision), retirement at a glance, the five foundations and the next best step.'),
('10. Plan profile','The money personality and the risk profile, scored from the Discover and Understand Me answers exactly as the app scores them (each answer adds weight to a type; the highest wins). The cushion comes from your cash and living costs when you gave them.'),
('11. Plan debt months','Each loan, card and the mortgage is paid month by month inside each plan year: interest is added, then the repayment is taken (never more than is owed), until the balance is 50 cent or less. It feeds the debt columns of Plan cashflow.'),
('12. C01 to C28 (orange tabs)','The 28 calculators. C10 and C13 now use the app\'s method (waiting money earns the cash rate; contributions rise with pay). Where a calculator asks for something you already gave on Plan inputs, it fills in by itself.'),
('13. C29, C30','New tax calculators: C29 Investment tax (funds with the 8-year rule, shares), C30 Sale, gift and inheritance tax. Sample example switch in cell E2 of each.'),
('Hidden tabs (right-click, Unhide)','Settings, Assumptions, Your lists, Tax engine, Report spec and the original README. Formulas depend on them, so they are kept but hidden. Do not delete them.'),
('Separate file','LifeGoals-Calculators-Reference.xlsx holds the reference sheets that nothing depends on: Calculation register, Document reader spec and Plan how it works.')]
for a,b_ in flow: para(a,b_)
row+=1; sec('KNOWN DIFFERENCES (please read)')
for a,b_ in [('Plan sheets','They follow the prototype\'s engine v3.0 for 2026: emergency fund goal added first when cash is below the months you chose, the funding order (cash, savings accounts, investments, other assets, alternative investments), the 8-year clock per holding, capital gains with losses and the yearly exemption, downsizing the home, policy payouts and policy income. The plan always starts in 2026 here, because only the 2026 rules are in this workbook. Checked: every year of the plan (18 figures, within 1 euro), the amount taken from each pot and the tax events matched the app for 215 customers (random and edge cases), with the app held to the 2026 rules. The two figures the app finds by searching have to be typed for your own plan (see Two figures you type).'),
('Two figures you type','Two sentences need the plan to be re-run many times (the extra a month that takes a goal to 100%, and the extra that closes the main gap). A spreadsheet without macros cannot do that, so they are typed cells: Plan goals column L, one cell per goal ("none" if it needs over 5,000 a month), and Plan results, the cell named Find_ExtraFor. Blank = not tried. The sample customer\'s figures are already filled in. Everything else, including "where each goal\'s money comes from" (Plan goals column AC), is worked out by formulas. A plan can carry up to 20 funded goals (the app has no limit); a red warning shows if you add more. The 2027 Budget rules are not here.'),
('Growth calculators','C09, C10, C17, C18, C19 and C20 use ONE net growth rate that already includes exit tax smoothed over 8 years. C29 is the better view of the tax; the Plan sheets use the explicit 8-year events.'),
('Verification','Nothing here has been checked against the official Revenue or Department of Social Protection pages. PRSI on pension (ARF) withdrawals is UNRESOLVED.'),
('Not modelled','Dividends and fund distributions; tax on a life-policy lump sum; rental costs and mortgage interest relief; the tax-free part of a purchased annuity; Local Property Tax; business and farm reliefs; stamp duty on gifts.')]: para(a,b_)
row+=1; sec('ASSUMPTIONS LIST 2026 (everything the plan assumes, with its type)')
put(m,row,1,'Law = set by Government (figures on the Tax sheet). Standard = LifeMap suggestion the customer can change. Your choice = entered by the customer. Assumed = a planning figure used because nothing better is known. Values below are for the example customer.',border=False); m.merge_cells(start_row=row,start_column=1,end_row=row,end_column=4); m.row_dimensions[row].height=34; row+=1
hdr(m,row,['Item','What the plan assumes','Type','Note']); row+=1
for x in D['asm']:
    for i,v in enumerate(x[:4],1): put(m,row,i,v.replace('with Budget 2027 changes applied from their dates','2026 values only: the Budget 2027 changes are not in this workbook').replace('Each year of your plan uses its own rules: 2026 rules to the end of 2026, announced 2027 rules from 1 January 2027 (figures not announced keep their 2026 value)','This workbook uses the 2026 rules in every year of the plan (tax bands, credits and the State Pension grow with your inflation choice, or stay flat if you chose flat). The Budget 2027 rules are not in this workbook') if isinstance(v,str) else v)
    row+=1
row+=1; put(m,row,1,'LifeMap standards (the customer can change each one)',B,SUB,border=False); row+=1
hdr(m,row,['Standard','Value and basis','As at','Source']); row+=1
for grp,nm,val,by,src,asat in D['std']:
    put(m,row,1,f'{grp}: {nm}'); put(m,row,2,f'{val}  ({by})'); put(m,row,3,asat); put(m,row,4,src); row+=1
row+=1; sec('CALCULATORS (click to open)')
calc_names=[n for n in wb.sheetnames if n[0]=='C' and n[1:3].isdigit()]
for n in sorted(calc_names):
    put(m,row,1,n[:3],B); c=put(m,row,2,f'=HYPERLINK("#\'{n}\'!A1","{n[4:]}")',Font(color='0563C1',underline='single'),wrap=False); row+=1
widths(m,[46,100,22,50]); m.freeze_panes='A4'


# ============ link calculators to Plan inputs (and fix dead links) ============
import re as _re
PAT=_re.compile(r'pre-filled from ([^.]*?)\.')
LINKS=[ # phrase -> (is this input given on Plan inputs?, the Plan inputs figure)
 ('Your finances: income','Has_income=1','In_income'),
 ("Your finances: partner's income",'Has_pIncome=1','In_pIncome'),
 ('Your finances: home status (owner = No)','Has_home=1','IF(OR(In_home="Own outright",In_home="Own with mortgage"),"No","Yes")'),
 ('Years left (25 if not given)','Has_mortYears=1','In_mortYears'),
 ('Your finances / statement: balance','Has_mortBal=1','In_mortBal'),('Your finances / mortgage statement: balance','Has_mortBal=1','In_mortBal'),('Your finances: mortgage balance','Has_mortBal=1','In_mortBal'),
 ('Your finances / statement: rate','Has_mortRate=1','In_mortRate'),('Your finances / mortgage statement: rate','Has_mortRate=1','In_mortRate'),
 ('Your finances / statement: investments','Has_invest=1','In_invest'),('Your finances: investments','Has_invest=1','In_invest'),
 ('Your finances: cash','Has_cash=1','In_cash'),
 ('About you: age','Has_age=1','F_Age'),
 ('Plan: retirement age − age','AND(Has_retireAge=1,Has_age=1)','F_R-F_Age'),
 ('Your finances: costs + mortgage + debt repayments','Has_costsM=1','In_costsM+In_mortPayM+In_cardPayM+In_loanPayM'),
 ('Your finances / pension statement',None,None),   # decided by the label below
 ('Plan: pension projected to retirement',"ISNUMBER('Plan results'!$C$45)","'Plan results'!$C$45"),
 ('Your finances: debts','OR(Has_cardBal=1,Has_loanBal=1,Has_debt=1)','In_cardBal+In_loanBal+In_debt'),
 ('Your finances: cash + investments','OR(Has_cash=1,Has_invest=1)','In_cash+In_invest'),
 ('Your finances: pension','Has_pension=1','In_pension'),
 ('Your finances: home + other property','OR(Has_homeValue=1,Has_propValue=1)','In_homeValue+In_propValue'),
 ('Your finances: costs + one-offs ÷ 12 + mortgage','Has_costsM=1','In_costsM+In_oneOffY/12+In_mortPayM'),
 ('Your finances: debt repayments','OR(Has_cardPayM=1,Has_loanPayM=1)','In_cardPayM+In_loanPayM'),
 ('Your finances / statement: stated repayment','Has_mortPayM=1','In_mortPayM')]
LK={a:(b,c) for a,b,c in LINKS}
linked=[]; manual=[]
for ws_ in wb.worksheets:
    if not (ws_.title[0]=='C' and ws_.title[1:3].isdigit()): continue
    for r_ in range(1,ws_.max_row+1):
        note=ws_.cell(r_,5).value
        if not isinstance(note,str): continue
        mm=PAT.search(note)
        if not mm or mm.group(1) not in LK: continue
        has,val=LK[mm.group(1)]
        lab=str(ws_.cell(r_,2).value)
        if mm.group(1)=='Your finances / pension statement':
            if lab.startswith('Pension value'): has,val='Has_pension=1','In_pension'
            elif lab.startswith('Monthly contributions'): has,val='Has_pensionM=1','In_pensionM'
            else: continue
        g=ws_.cell(r_,7); orig=g.value
        expect=f'=IF(ISBLANK(C{r_}),IF(Fill_Example="Yes",F{r_},""),C{r_})'
        fb=f'IF(Fill_Example="Yes",F{r_},"")'
        if not (isinstance(orig,str) and orig.count(fb)==1): manual.append((ws_.title,r_,lab,str(orig)[:100])); continue
        g.value=orig.replace(fb,f'IF({has},{val},{fb})')   # typed figure first, then Plan inputs, then the example
        linked.append((ws_.title[:3],r_,lab,val))
print('linked',len(linked),'manual',len(manual)); print(manual[:10])
json.dump(linked,open(SC+'linked.json','w'))

c23=wb['C23 Mortgage protection']
if c23['G17'].value=='=IF(ISBLANK(C17),F17,C17)': c23['G17'].value='=IF(ISBLANK(C17),IF(Has_mortPayM=1,In_mortPayM,F17),C17)'; linked.append(('C23',17,'Your actual monthly repayment','In_mortPayM'))
json.dump(linked,open(SC+'linked.json','w'))
# C29: the amount invested follows Plan inputs when given
c29=wb['C29 Investment tax']; c29['E4']='=IF(Has_invest=1,In_invest,100000)'; c29['E5']='=E4'
c29['C4']='What the holding is worth today. In "My own numbers" it comes from Plan inputs (Investments) when given; you can type over it.'
c29['C5']='Your cost. In "My own numbers" it starts equal to the amount; type over it with what you paid.'
# dead links in the hidden original README (sheets that moved to the reference file, or never existed here)
rd=wb['README']
for row_ in rd.iter_rows():
    for c_ in row_:
        if isinstance(c_.value,str) and c_.value.startswith('=HYPERLINK("#') and any(t in c_.value for t in ("Document reader spec","Plan how it works","Calculation register","UI Guide","UI Calculators","UI Screens","UI Make my plan")):
            mt=_re.search(r',"([^"]*)"\)\s*$',c_.value); c_.value=(mt.group(1) if mt else '')+' (in the reference file)'

exec(open(SC+'build2_links2.py').read())
# ============ order, hide, remove, move ============
FRONT=['READ ME','Sample walkthrough','Tax']
PLAN=['Plan inputs','Plan pay & tax','Plan goals','Plan cashflow','Plan holdings','Plan results','Plan profile','Plan debt months']
CALCS=sorted([n for n in wb.sheetnames if n[0]=='C' and n[1:3].isdigit()])
HIDE=['Settings','Assumptions','Your lists','Tax engine','Report spec','README']
MOVE=['Calculation register','Document reader spec','Plan how it works']
for n in MOVE: del wb[n]
order=FRONT+PLAN+CALCS+HIDE
assert sorted(order)==sorted(wb.sheetnames), (set(order)^set(wb.sheetnames))
wb._sheets=[wb[n] for n in order]
for n in HIDE: wb[n].sheet_state='hidden'
for n in FRONT: wb[n].sheet_properties.tabColor='0F9D8F'
for n in PLAN: wb[n].sheet_properties.tabColor='2E8B57'
for n in CALCS: wb[n].sheet_properties.tabColor='F2B134'
wb.active=0
for ws_ in wb.worksheets: ws_.sheet_view.tabSelected=(ws_.title=='READ ME')
wb.save(SC+'stage1.xlsx'); print('stage1 saved', len(wb.sheetnames),'sheets')

# ---- reference workbook (values only) ----
ref=openpyxl.load_workbook('/home/user/lifemap/deliverables/LifeGoals-Calculators.xlsx',data_only=True)
keep=['Calculation register','Document reader spec','Plan how it works','Report spec','Settings','Assumptions','Your lists','Tax engine','README']
for n in list(ref.sheetnames):
    if n not in keep: del ref[n]
for n in keep: ref[n].sheet_state='visible'
ref._sheets=[ref[n] for n in ['Plan how it works','Calculation register','Document reader spec','Report spec','Settings','Assumptions','Your lists','Tax engine','README']]
# plain-English notes for the new Plan engine (v3.0, 2026) in the reference file
hw=ref['Plan how it works']
hw['C6']=("One row per year from today to the plan-until age. Order inside a year: money in (after tax and pension contributions) -> living costs and one-offs -> any policy payout or money from downsizing -> mortgage, card and loan repayments -> goals due this year are paid from their own pot, then from savings in the funding order (a goal that cannot be paid leaves a goal gap) -> if money is left over, the saving amount is put towards the goals still to come, and the rest is assumed spent while working (kept as savings once retired) -> if the year is short, savings are used, then the emergency buffer, then the goal pots (latest goals first) give way -> growth. "
          "Savings are no longer one pot: they sit on Plan holdings (cash, savings accounts, investments by lot, other assets, alternative investments). The what-if extra, one-off and \"save less\" change this table the same way as in the app.")
hw['C7']=hw['C7'].value.replace("and its starting pot (saved so far, the what-if one-off, then a share of spare savings in order)","and its starting pot (saved so far, the what-if one-off, then money from savings in the funding order: cash and savings accounts first, then investments, other assets and alternative investments, after any tax on selling; an Emergency fund goal is built from cash and savings accounts only). If you have no Emergency fund goal and cash is below the months you chose, one is added automatically in the first free goal row on Plan inputs unless you removed it")
r=hw.max_row+2
hw.cell(r,2,'Engine v3.0 (2026 rules) on the Plan sheets').font=openpyxl.styles.Font(bold=True); r+=1
for a_,b_ in [('Plan holdings','Cash and savings accounts grow at the cash rate. Investments are kept as lots: the holding you have today (with what you paid and the years already on the 8-year clock) and the new money put in each year. A fund or ETF lot pays exit tax on the gain share when sold, and at each 8-year anniversary (the tax is taken from the lot and its cost resets); shares held directly pay capital gains tax when sold (no 8-year rule). Other assets and alternative investments pay capital gains tax when sold. Capital gains tax: 33% before 7 Oct 2026, 31% from then; the yearly exemption (per owner) is used after any capital losses. Nothing is taxed because it rises in value. Missing costs: funds and shares are assumed bought at today\'s value (a gain share for shares held directly), other assets and alternative investments assume a share of their value is gain (your choice, standard 40%).'),
  ('Funding order','Money for a goal or a short year comes from: the goal\'s own pot, cash above the emergency fund, savings accounts, investments, other assets, alternative investments. The pension is used only from the access age, for retirement. The emergency fund is ring-fenced.'),
  ('Home and policies','"Yes, I would downsize": at the age you choose, the home value less the smaller home (grown with prices, less 10% costs and any mortgage left) is added to cash and the mortgage is cleared. A savings or endowment policy adds its lump sum to cash at an age; a policy or annuity income is taxed with your other income from its age.'),
  ('Two assumptions only the 2026 workbook has','The plan always starts in 2026 and every year uses the 2026 tax rules, because the 2027 Budget rules are not in this workbook. PRSI on ARF withdrawals is applied before 66, and from 66 to 70 if there is no contributory State Pension (UNRESOLVED: sources conflict).'),
  ('Checked against the app','Every year of the plan (18 figures, within 1 euro) was compared with the prototype for 215 customers (random and edge cases, with the new assets, shares, losses, joint ownership, downsizing, policies and the automatic emergency fund), plus the amount taken from each pot, the exit tax and capital gains tax events and DIRT. The two figures the app finds by searching still have to be typed (see above).')]:
    hw.cell(r,2,a_); hw.cell(r,3,b_).alignment=openpyxl.styles.Alignment(wrap_text=True,vertical='top'); r+=1
r+=1; hw.cell(r,2,'New Plan inputs (rows 134 on) -> prototype state key').font=openpyxl.styles.Font(bold=True); r+=1
for a_,b_ in [('In_savings / Has_savings','Savings accounts   [S.fin.savings]'),('In_otherAssets / Has_otherAssets','Other assets you would sell if needed   [S.fin.otherAssets]'),('In_altInv / Has_altInv','Alternative investments   [S.fin.altInv]'),('In_invCost / Has_invCost','What you paid for your investments   [S.fin.invCost, blank = unknown]'),('In_invYears / Has_invYears','Years you have held your investments   [S.fin.invYears]'),('In_othCost / Has_othCost','What you paid for other assets   [S.fin.othCost]'),('In_altCost / Has_altCost','What you paid for alternative investments   [S.fin.altCost]'),('In_capLoss / Has_capLoss','Capital losses you can use   [S.fin.capLoss]'),('In_assetsJoint / Has_assetsJoint','Assets owned with your partner   [S.fin.assetsJoint]'),('In_homeUse / Has_homeUse','Would you use your home to fund your plan   [S.fin.homeUse]'),('In_downAge / Has_downAge','Age you would downsize   [S.fin.downAge]'),('In_downValue / Has_downValue','Value of the smaller home   [S.fin.downValue]'),('In_polLump / Has_polLump','Policy lump sum   [S.fin.polLump]'),('In_polLumpAge / Has_polLumpAge','Age the lump sum is paid   [S.fin.polLumpAge]'),('In_polInc / Has_polInc','Policy or annuity income a year   [S.fin.polInc]'),('In_polIncAge / Has_polIncAge','Age the income starts   [S.fin.polIncAge]'),('In_safetyWanted / Has_safetyWanted','Asked for an Emergency fund goal   [S.safetyWanted]'),('In_safetyOff / Has_safetyOff','Removed the Emergency fund goal   [S.safetyOff]'),('In_a_invWrapper / Has_a_invWrapper','Investments held as funds (fund) or shares   [S.asm.invWrapper]'),('In_a_cgtGain / Has_a_cgtGain','Gain share when no cost is given   [S.asm.cgtGain]')]:
    hw.cell(r,2,a_); hw.cell(r,3,b_); r+=1
ref.active=0
ref.save('/home/user/lifemap/deliverables/LifeGoals-Calculators-Reference.xlsx'); print('reference saved')
