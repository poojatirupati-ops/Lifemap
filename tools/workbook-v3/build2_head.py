import json, openpyxl, datetime
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.utils import get_column_letter as CL
SC='/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/wb/'
D=json.load(open(SC+'data.json'))
wb=openpyxl.load_workbook('/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/wb3/base_v3.xlsx')
NAVY='0B2545'; TEAL='0F9D8F'
H=Font(bold=True,color='FFFFFF'); HF=PatternFill('solid',fgColor=NAVY); SUB=PatternFill('solid',fgColor='D9F2EE'); INP=PatternFill('solid',fgColor='FFF2CC'); WARN=PatternFill('solid',fgColor='FDE9D9'); GREY=PatternFill('solid',fgColor='EEF2F6')
B=Font(bold=True); T=Font(bold=True,size=16,color=NAVY); thin=Side(style='thin',color='C9D3DD'); BR=Border(left=thin,right=thin,top=thin,bottom=thin)
WR=Alignment(wrap_text=True,vertical='top')
def hdr(ws,r,vals,c0=1):
    for i,v in enumerate(vals):
        c=ws.cell(r,c0+i,v); c.font=H; c.fill=HF; c.alignment=Alignment(wrap_text=True,vertical='center'); c.border=BR
def widths(ws,ws_):
    for i,w in enumerate(ws_,1): ws.column_dimensions[CL(i)].width=w
def put(ws,r,c,v,font=None,fill=None,fmt=None,wrap=True,border=True):
    x=ws.cell(r,c,v)
    if font: x.font=font
    if fill: x.fill=fill
    if fmt: x.number_format=fmt
    if wrap: x.alignment=WR
    if border: x.border=BR
    return x
EUR='#,##0;[Red]-#,##0'; EUR2='#,##0.00'; PCT='0.0%'; PCT2='0.00%'

TAX=wb.create_sheet('Tax')
# ============ Tax figures 2026 (lower part of the Tax sheet) ============
ws=TAX
ws['A52']='Tax figures 2026: every figure the calculators and the plan use'; ws['A52'].font=T
ws['A53']='Every tax figure, in one place. Calculators C29 and C30 read these cells. Status: Verified = confirmed in official guidance · Requires Verification = taken from secondary sources, still to be checked against Revenue / Department of Social Protection. Nothing here has been checked against the official Revenue or DSP pages (they could not be opened when this was built).'
ws['A53'].alignment=WR; ws.merge_cells('A53:I53'); ws.row_dimensions[53].height=48
hdr(ws,54,['Key','Category','Parameter','2026 value','Status','Effective','Source','Note','Used in'])
EXTRA=[ # workbook-only rows (the gift and inheritance sheet)
 ('cat.a.before','Gift and inheritance tax (CAT)','Group A threshold (child from parent): gifts and inheritances before 7 Oct 2026',400000,'Requires Verification','before 7 Oct 2026','https://www.revenue.ie/en/gains-gifts-and-inheritance/','Lifetime total received from parents, since 5 Dec 1991','C30'),
 ('cat.a.after','Gift and inheritance tax (CAT)','Group A threshold: from 7 Oct 2026 (Budget 2027, up 5%)',420000,'Requires Verification','from 7 Oct 2026','https://www.gov.ie/en/department-of-public-expenditure-infrastructure-public-service-reform-and-digitalisation/publications/your-guide-to-budget-2027/','Official guide: Group A up 5%; the euro figure is 400,000 x 1.05','C30'),
 ('cat.b.before','Gift and inheritance tax (CAT)','Group B threshold (parent, sibling, niece, nephew, grandchild): before 7 Oct 2026',40000,'Requires Verification','before 7 Oct 2026','https://www.revenue.ie/en/gains-gifts-and-inheritance/','From memory of the 2025 rules: not checked','C30'),
 ('cat.b.after','Gift and inheritance tax (CAT)','Group B threshold: from 7 Oct 2026 (up 10%)',44000,'Requires Verification','from 7 Oct 2026','https://www.gov.ie/en/department-of-public-expenditure-infrastructure-public-service-reform-and-digitalisation/publications/your-guide-to-budget-2027/','Official guide: Group B up 10%; the euro figure is 40,000 x 1.10','C30'),
 ('cat.c.before','Gift and inheritance tax (CAT)','Group C threshold (everyone else): before 7 Oct 2026',20000,'Requires Verification','before 7 Oct 2026','https://www.revenue.ie/en/gains-gifts-and-inheritance/','From memory of the 2025 rules: not checked','C30'),
 ('cat.c.after','Gift and inheritance tax (CAT)','Group C threshold: from 7 Oct 2026 (up 10%)',22000,'Requires Verification','from 7 Oct 2026','https://www.gov.ie/en/department-of-public-expenditure-infrastructure-public-service-reform-and-digitalisation/publications/your-guide-to-budget-2027/','Official guide: Group C up 10%; the euro figure is 20,000 x 1.10','C30'),
 ('cat.rate','Gift and inheritance tax (CAT)','CAT rate on the amount above the threshold',0.33,'Requires Verification','long-standing','https://www.revenue.ie/en/gains-gifts-and-inheritance/','','C30'),
 ('cat.small','Gift and inheritance tax (CAT)','Small gift exemption: per giver, per year',3000,'Requires Verification','long-standing','https://www.revenue.ie/en/gains-gifts-and-inheritance/','Gifts up to this from one giver in a year are not counted','C30'),
]
r=55; keyrow={}
USED={'sav.cgt':'C29, C30, plan','sav.cgtBefore':'C29, C30, plan','sav.cgtFrom':'C29, C30, plan','sav.cgtExempt':'C29, C30, plan','sav.exit':'C29, C30, plan','sav.deemed':'C29, plan','sav.dirt':'Cash growth in the plan (rates are after DIRT)'}
for x in D['reg']:
    if x['path'].startswith('ia.'): continue
    v=x['v26']; val=v
    if isinstance(v,(list,dict)): val=json.dumps(v).replace('Infinity','no limit')[:120]
    if v is None: continue
    st=x['status26']
    row=[x['path'],x['cat'],x['name'],val,st,x['eff'] or '',x['src'],x['note'] or '',USED.get(x['path'],'Plan engine / calculators')]
    for i,vv in enumerate(row,1):
        c=put(ws,r,i,vv)
        if i==4 and isinstance(vv,(int,float)): c.number_format=(PCT2 if 0<abs(vv)<1 else '#,##0.00' if isinstance(vv,float) and vv!=int(vv) else '#,##0')
        if i==5 and 'Requires' in str(vv): c.fill=WARN
    keyrow[x['path']]=r; r+=1
for x in EXTRA:
    for i,vv in enumerate(x,1):
        c=put(ws,r,i,vv)
        if i==4: c.number_format=PCT2 if vv<1 else '#,##0'
        if i==5: c.fill=WARN
    keyrow[x[0]]=r; r+=1
def TA(key): return f"VLOOKUP(\"{key}\",Tax!$A$55:$D${r},4,FALSE)"

# ============ C29 Investment tax ============
c=wb.create_sheet('C29 Investment tax')
c['A1']='C29 Investment tax: growth first, tax on the events'; c['A1'].font=T
c['A2']='Shows what tax a fund, ETF or share holding pays, and when. Growth is kept separate from tax. Funds and ETFs: exit tax is charged when you sell AND every 8 years (deemed disposal), whether or not you sell; the tax is taken from the fund and the cost resets. Shares held directly: no tax while you hold; capital gains tax (CGT) when you sell, on the gain after your yearly exemption. Yellow cells are inputs. All tax rates come from the "Tax" sheet (Tax figures 2026).'
c['A2'].alignment=WR; c.merge_cells('A2:C2'); c.row_dimensions[2].height=100
put(c,2,4,'Choose here →',B,SUB); put(c,2,5,'Sample example',B,INP,wrap=False)
dvM=DataValidation(type='list',formula1='"Sample example,My own numbers"',allow_blank=False); c.add_data_validation(dvM); dvM.add('E2')
hdr(c,3,['Input','Used in the sums','What it means','Sample example','My own numbers (yellow)'])
ins=[('Amount invested today (€)',100000,EUR,'Current value of the holding'),('What you paid in total, incl. fees (€)',100000,EUR,'Your cost. Equal to the amount if you bought it today'),
 ('Growth a year before charges',0.05,PCT,'A planning figure, not a prediction'),('Charges a year',0.01,PCT,'Fund or platform charges'),
 ('Years already held',0,'0','Sets where you are on the 8-year clock for a fund'),('Type of holding','Fund or ETF','@','Fund or ETF = exit tax; Shares held directly = CGT'),
 ('Years until you sell (1 to 30)',20,'0','The table below runs 30 years; results are read at this year'),('Today\'s date',datetime.date(2026,10,21),'dd mmm yyyy','Sale date = today + years. CGT is 33% before 7 Oct 2026 and 31% from then'),
 ('Number of people who own it (1 or 2)',1,'0','Each person has the yearly CGT exemption, on what they own'),('Capital losses brought forward (€)',0,EUR,'Losses already reported to Revenue, used before the exemption')]
for i,(l,v,fm,n) in enumerate(ins):
    rr=4+i; put(c,rr,1,l,B); put(c,rr,2,f'=IF($E$2="Sample example",D{rr},E{rr})',fill=GREY,fmt=fm,wrap=False); put(c,rr,3,n); put(c,rr,4,v,fmt=fm,wrap=False); put(c,rr,5,v,fill=INP,fmt=fm,wrap=False)
dv=DataValidation(type='list',formula1='"Fund or ETF,Shares held directly"',allow_blank=False); c.add_data_validation(dv); dv.add('E9'); dv.add('D9')
dv2=DataValidation(type='whole',operator='between',formula1='1',formula2='30'); c.add_data_validation(dv2); dv2.add('E10'); dv2.add('D10')
dv3=DataValidation(type='whole',operator='between',formula1='1',formula2='2'); c.add_data_validation(dv3); dv3.add('E12'); dv3.add('D12')
hdr(c,15,['Rates used (from the Tax sheet)','Value','Where it comes from'])
rates=[('Exit tax rate (funds, ETFs, life policies)','='+TA('sav.exit'),PCT,'sav.exit'),('Deemed disposal period (years)','='+TA('sav.deemed'),'0','sav.deemed'),
 ('CGT rate before the change date','='+TA('sav.cgtBefore'),PCT,'sav.cgtBefore'),('CGT rate from the change date (7 Oct 2026)','='+TA('sav.cgt'),PCT,'sav.cgt'),
 ('CGT rate that applies to your sale date','=IF(EDATE(B11,12*B10)>=DATE(2026,10,7),B19,B18)',PCT,'by sale date'),('CGT yearly exemption per person (€)','='+TA('sav.cgtExempt'),EUR,'sav.cgtExempt (Requires Verification)')]
for i,(l,f,fm,k) in enumerate(rates):
    rr=16+i; put(c,rr,1,l,B); put(c,rr,2,f,fmt=fm,wrap=False); put(c,rr,3,k)
# rates rows: 16 exit, 17 deemed, 18 cgt before, 19 cgt after, 20 cgt applicable, 21 exemption
hdr(c,23,['Result at your sale year','Value','How it is worked out'])
TOP=36; BOT=TOP+29
res=[('Value if nothing were taxed (€)','=B4*(1+B6-B7)^B10',EUR,'Amount x (1 + growth - charges) ^ years'),
 ('Value in the holding at the sale, after any 8-year tax (€)',f'=INDEX($J${TOP}:$J${BOT},B10)',EUR,'Table column J at the sale year'),
 ('Cost basis at the sale (€)',f'=INDEX($K${TOP}:$K${BOT},B10)',EUR,'Resets to the value at each 8-year event for a fund'),
 ('Gain on the sale (€)','=MAX(0,B25-B26)',EUR,'Value less cost basis; a loss gives 0'),
 ('Exit tax already paid at 8-year events (€)',f'=INDEX($M${TOP}:$M${BOT},B10)',EUR,'Sum of column I up to the sale year'),
 ('Tax on the sale (€)','=IF(B9="Fund or ETF",B27*B16,B20*MAX(0,B27-B13-B21*B12))',EUR,'Fund: gain x exit tax. Shares: CGT rate x (gain - losses - exemption x owners)'),
 ('Money you receive after all tax (€)','=B25-B29',EUR,'Value less tax on the sale'),
 ('Total tax paid over the years (€)','=B28+B29',EUR,'8-year events plus the sale'),
 ('Growth a year before tax','=B6-B7',PCT2,'Growth less charges'),
 ('Growth a year after tax','=IF(B30>0,(B30/B4)^(1/B10)-1,"n/a")',PCT2,'(Money received / amount today) ^ (1/years) - 1')]
for i,(l,f,fm,n) in enumerate(res):
    rr=24+i; put(c,rr,1,l,B); put(c,rr,2,f,fmt=fm,wrap=False); put(c,rr,3,n)
# note rows 24..33 -> value rows start at 24: B24 value if nothing taxed, B25 value in holding,... ok
hdr(c,TOP-1,['Year','Value at start (€)','Cost basis at start (€)','Years on 8-year clock at start','Growth after charges (€)','Value after growth (€)','8-year event this year?','Gain taxed (€)','Exit tax paid (€)','Value at end (€)','Cost basis at end (€)','Years on clock at end','Exit tax paid so far (€)'])
for i in range(30):
    rr=TOP+i; put(c,rr,1,i+1,wrap=False)
    if i==0: put(c,rr,2,'=B4',fmt=EUR,wrap=False); put(c,rr,3,'=B5',fmt=EUR,wrap=False); put(c,rr,4,'=MOD(B8,$B$17)',wrap=False)
    else: put(c,rr,2,f'=J{rr-1}',fmt=EUR,wrap=False); put(c,rr,3,f'=K{rr-1}',fmt=EUR,wrap=False); put(c,rr,4,f'=L{rr-1}',wrap=False)
    put(c,rr,5,f'=B{rr}*($B$6-$B$7)',fmt=EUR,wrap=False); put(c,rr,6,f'=B{rr}+E{rr}',fmt=EUR,wrap=False)
    put(c,rr,7,f'=IF(AND($B$9="Fund or ETF",D{rr}+1>=$B$17),"Yes","No")',wrap=False)
    put(c,rr,8,f'=IF(G{rr}="Yes",MAX(0,F{rr}-C{rr}),0)',fmt=EUR,wrap=False); put(c,rr,9,f'=H{rr}*$B$16',fmt=EUR,wrap=False)
    put(c,rr,10,f'=F{rr}-I{rr}',fmt=EUR,wrap=False); put(c,rr,11,f'=IF(G{rr}="Yes",J{rr},C{rr})',fmt=EUR,wrap=False)
    put(c,rr,12,f'=IF(G{rr}="Yes",0,D{rr}+1)',wrap=False)
    put(c,rr,13,(f'=I{rr}' if i==0 else f'=M{rr-1}+I{rr}'),fmt=EUR,wrap=False)
n0=TOP+31
notes=['How to read this: growth happens first (column E). Then, only for a fund in its 8th year on the clock, the gain over the cost basis is taxed (columns H, I) and the tax is taken out of the fund. The cost basis then resets to the new value and the clock restarts.',
 'Funds and ETFs: no loss relief (a fall in value cannot be set against other gains). The tax paid at an 8-year event is credited against the later tax: this is why the basis resets (only growth since the reset is taxed again).',
 'Shares held directly: no 8-year rule and no tax while held. CGT arises on the sale only. Dividends (income tax, USC, PRSI) are not modelled here.',
 'Simplifications: one holding, one purchase date, growth the same every year, no further contributions. The plan engine in the prototype handles several purchases (each with its own 8-year clock).']
for i,t in enumerate(notes): put(c,n0+i,1,t,border=False); c.merge_cells(start_row=n0+i,start_column=1,end_row=n0+i,end_column=13); c.row_dimensions[n0+i].height=34
widths(c,[44,18,20,18,18,18,16,16,16,18,18,16,18]); c.freeze_panes='A4'

# ============ C30 Sale, gift, inheritance ============
d=wb.create_sheet('C30 Sale gift inheritance')
d['A1']='C30 Tax when you sell, give away or inherit'; d['A1'].font=T
d['A2']='Three small calculators on one sheet. A: tax when you SELL an asset. B: tax the GIVER pays when they give an asset away (CGT). C: tax the RECEIVER pays on a gift or inheritance (CAT). Yellow cells are inputs. Rates and thresholds come from the "Tax" sheet (Tax figures 2026). Requires Verification items are marked there.'
d['A2'].alignment=WR; d.merge_cells('A2:C2'); d.row_dimensions[2].height=62
put(d,2,4,'Choose here →',B,SUB); put(d,2,5,'Sample example',B,INP,wrap=False)
dvM2=DataValidation(type='list',formula1='"Sample example,My own numbers"',allow_blank=False); d.add_data_validation(dvM2); dvM2.add('E2')
def block(r0,title,items):
    put(d,r0,1,title,H,HF); put(d,r0,2,'Used in the sums',H,HF); put(d,r0,3,'What it means',H,HF); put(d,r0,4,'Sample example',H,HF); put(d,r0,5,'My own numbers (yellow)',H,HF)
    for i,(l,v,fm,n,inp) in enumerate(items):
        rr=r0+1+i; put(d,rr,1,l,B); put(d,rr,3,n)
        if inp: put(d,rr,2,f'=IF($E$2="Sample example",D{rr},E{rr})',fill=GREY,fmt=fm,wrap=False); put(d,rr,4,v,fmt=fm,wrap=False); put(d,rr,5,v,fill=INP,fmt=fm,wrap=False)
        else: put(d,rr,2,v,fill=GREY,fmt=fm,wrap=False)
TYPES='"Main home (principal private residence),Other property or land,Shares held directly,Crypto gold art or other assets,Fund or ETF (exit tax),Development land"'
# A rows 4..
block(4,'A. You SELL an asset',[
 ('Type of asset','Other property or land','@','Choose the type: the tax is different for each',True),
 ('Sale price (€)',400000,EUR,'What you receive',True),('What you paid (€)',250000,EUR,'Original cost',True),
 ('Allowable costs (€)',15000,EUR,'Buying and selling costs (solicitor, agent, stamp duty) and improvements (not repairs)',True),
 ('Losses brought forward (€)',0,EUR,'Capital losses already reported and unused',True),('Number of owners (1 or 2)',1,'0','Each owner has a yearly exemption on their share',True),
 ('Date of sale',datetime.date(2026,12,1),'dd mmm yyyy','CGT rate depends on the sale date (33% before 7 Oct 2026, 31% from then)',True),
 ('Gain or loss (€)','=B6-B7-B8',EUR,'Sale price less cost less allowable costs',False),
 ('Tax rate that applies','=IF(B5="Main home (principal private residence)",0,IF(B5="Fund or ETF (exit tax)",'+TA('sav.exit')+',IF(B5="Development land",0.33,IF(B11>=DATE(2026,10,7),'+TA('sav.cgt')+','+TA('sav.cgtBefore')+'))))',PCT,'Main home 0% (relief, see note); fund 38% exit tax; development land 33%; other CGT 33% / 31% by date',False),
 ('Yearly exemption available (€)','=IF(OR(B5="Main home (principal private residence)",B5="Fund or ETF (exit tax)"),0,'+TA('sav.cgtExempt')+'*B10)',EUR,'Not available for funds or the main home. Per person x owners',False),
 ('Tax payable (€)','=IF(B5="Main home (principal private residence)",0,IF(B5="Fund or ETF (exit tax)",MAX(0,B12)*B13,B13*MAX(0,B12-B9-B14)))',EUR,'Fund: gain x rate (no losses or exemption). Others: rate x (gain - losses - exemption)',False),
 ('Money you keep after tax (€)','=B6-B15',EUR,'Sale price less tax (before repaying any loan)',False)])
dvA=DataValidation(type='list',formula1=TYPES); d.add_data_validation(dvA); dvA.add('E5'); dvA.add('D5')
dvO=DataValidation(type='whole',operator='between',formula1='1',formula2='2'); d.add_data_validation(dvO); dvO.add('E10'); dvO.add('D10')
# B rows start 19
block(19,'B. You GIVE an asset away (tax on the GIVER)',[
 ('Is the receiver your spouse or civil partner?','No','@','Yes: no CGT (the asset passes at your cost: no gain, no loss). No: treated as a sale at market value',True),
 ('Market value on the day (€)',300000,EUR,'Gifts count as a sale at market value',True),('What you paid (€)',150000,EUR,'Original cost',True),('Allowable costs (€)',10000,EUR,'As above',True),
 ('Losses brought forward (€)',0,EUR,'',True),('Date of the gift',datetime.date(2026,12,1),'dd mmm yyyy','',True),
 ('Gain (€)','=B21-B22-B23',EUR,'Market value less cost less allowable costs',False),
 ('CGT rate that applies','=IF(B20="Yes",0,IF(B25>=DATE(2026,10,7),'+TA('sav.cgt')+','+TA('sav.cgtBefore')+'))',PCT,'33% before 7 Oct 2026, 31% from then',False),
 ('CGT the giver pays (€)','=IF(B20="Yes",0,B27*MAX(0,B26-B24-'+TA('sav.cgtExempt')+'))',EUR,'Rate x (gain - losses - one yearly exemption)',False)])
dvY=DataValidation(type='list',formula1='"Yes,No"'); d.add_data_validation(dvY); dvY.add('E20'); dvY.add('D20')
# C rows start 30
block(30,'C. You RECEIVE a gift or inheritance (tax on the RECEIVER: CAT)',[
 ('Relationship to the giver','Group A: child receiving from a parent','@','Spouse or civil partner: exempt. Group A: child from parent. Group B: parent, brother, sister, niece, nephew, grandchild. Group C: everyone else',True),
 ('Value of the gift or inheritance (€)',500000,EUR,'Market value less any debt taken on',True),
 ('Small gift exemption claimed? (Yes or No)','No','@','Up to €3,000 a year from one giver is ignored. Only one claim per giver per year',True),
 ('Earlier gifts and inheritances in the same group since 5 Dec 1991 (€)',0,EUR,'Thresholds are lifetime totals, not yearly',True),
 ('Date received',datetime.date(2026,12,1),'dd mmm yyyy','Thresholds changed on 7 Oct 2026',True),
 ('Threshold for the group (€)','=IF(LEFT(B31,7)="Spouse ",1E+99,IF(LEFT(B31,7)="Group A",IF(B35>=DATE(2026,10,7),'+TA('cat.a.after')+','+TA('cat.a.before')+'),IF(LEFT(B31,7)="Group B",IF(B35>=DATE(2026,10,7),'+TA('cat.b.after')+','+TA('cat.b.before')+'),IF(B35>=DATE(2026,10,7),'+TA('cat.c.after')+','+TA('cat.c.before')+'))))',EUR,'From the Tax sheet. Group B and C amounts are Requires Verification',False),
 ('Taxable amount after the small gift exemption (€)','=MAX(0,B32-IF(B33="Yes",'+TA('cat.small')+',0))',EUR,'',False),
 ('Threshold still available (€)','=MAX(0,B36-B34)',EUR,'Threshold less earlier benefits in the group',False),
 ('CAT payable (€)','=IF(LEFT(B31,7)="Spouse ",0,'+TA('cat.rate')+'*MAX(0,B37-B38))',EUR,'33% x the amount above the threshold still available',False),
 ('You keep (€)','=B32-B39',EUR,'Value less CAT',False)])
dvG=DataValidation(type='list',formula1='"Group A: child receiving from a parent,Group B: parent / sibling / niece / nephew / grandchild,Group C: everyone else,Spouse or civil partner (exempt)"'); d.add_data_validation(dvG); dvG.add('E31'); dvG.add('D31')
dvS=DataValidation(type='list',formula1='"Yes,No"'); d.add_data_validation(dvS); dvS.add('E33'); dvS.add('D33')
nn=['Notes (all Requires Verification against Revenue):',
 'Main home: CGT relief applies when it was your only or main home for the whole time you owned it (the garden up to 1 acre is included). Part-relief if you did not live there all the time or let it. This sheet treats the main home as 0%.',
 'Selling at a loss: no tax, and the loss can be set against later gains of the same type of tax (CGT losses). Fund / ETF losses cannot be set against other gains.',
 'Giving an asset away: the giver may owe CGT (as if sold at market value) AND the receiver may owe CAT. Gifts between spouses or civil partners pay neither. A parent giving a home to a child may have the "dwelling house" CAT exemption if strict conditions are met (not modelled).',
 'Inheriting: no CGT on death. The receiver may owe CAT above the threshold. The asset\'s cost for a later sale is its market value on the day it is inherited.',
 'Business and farm reliefs (CGT retirement relief, agricultural and business CAT relief) are not modelled.']
for i,t in enumerate(nn): put(d,43+i,1,t,B if i==0 else None,border=False); d.merge_cells(start_row=43+i,start_column=1,end_row=43+i,end_column=5); d.row_dimensions[43+i].height=18 if i==0 else 44
widths(d,[56,30,60,30,30]); d.freeze_panes='A4'

# ============ Tax guide 2026 ============
g=TAX
g['A1']='Tax: which tax applies, on what, and when (2026)'; g['A1'].font=T
g['A2']='Pick a situation in the yellow cell to see the tax in plain words. The full list is below. Status Requires Verification means not yet checked against Revenue / Department of Social Protection. LifeMap column: whether the plan or a calculator takes it off.'
g['A2'].alignment=WR; g.merge_cells('A2:J2'); g.row_dimensions[2].height=34
cols=['Situation','Asset or income','Tax or charge','Who pays','Rate 2026','When it arises','What it is charged on','Exemptions and reliefs','In LifeMap?','Status']
ER='Requires Verification'
G=[
('Earning: employee pay','Salary, bonus','Income tax, USC, PRSI','You (the employer deducts it)','Income tax 20% / 40%; USC 0.5% to 8%; PRSI 4.2% then 4.35% from 1 Oct 2026','Each pay day','Gross pay','Tax credits (personal, employee), standard rate band €44,000','Yes: Tax engine, plan','Requires Verification'),
('Earning: self-employed','Profits','Income tax, USC (+3% over €100,000), PRSI Class S (min €650)','You (self-assessed)','As employee; USC surcharge 3%','Each year, by Revenue deadline','Profits','Earned Income credit','Yes: Tax engine','Requires Verification'),
('Holding: deposit interest','Savings, deposits, credit union','DIRT','The bank (deducted)','33%','When interest is paid or credited','Interest','None for most people','Yes: cash growth is after DIRT','Requires Verification'),
('Holding: funds and ETFs','Irish and EU funds, ETFs','Exit tax with the 8-year rule (deemed disposal)','You (the fund or broker reports; paid by 31 Oct of the next year)','38% (35% from 1 Jan 2027, not in this 2026 sheet)','On sale, and every 8 years from purchase even if not sold','Gain over the cost (cost resets after each 8-year event)','None: no yearly exemption; losses cannot be set against other gains','Yes: C29 and the plan','Requires Verification'),
('Holding: shares held directly','Listed shares','No tax on unrealised gains; income tax on dividends','You','Dividends: income tax, USC, PRSI; Irish dividends also 25% withholding tax','Dividends when paid; gains only when sold','Dividend income','Dividend withholding tax is credited against income tax','Gains: C29, C30. Dividends: not modelled','Requires Verification'),
('Holding: crypto, gold, art','Crypto, gold, art, collectables','No tax while held','You','None while held','Only when sold or exchanged','Nothing while held','','C30 on sale','Requires Verification'),
('Holding: rental property','Rent received','Income tax, USC, PRSI on rental profit','You','Marginal rates','Each year','Rent less allowable costs (and 75% of mortgage interest)','Allowable costs; Rent a Room relief for a room in your home','Partly: plan taxes the whole rent (no costs yet)','Requires Verification'),
('Holding: property (any)','Home or other property','Local Property Tax (LPT)','You','By valuation band, set yearly','Each year','Value band on 1 Nov 2021 (revalued periodically)','Limited exemptions (new homes, some disabilities)','No','Requires Verification'),
('Holding: pension fund','Occupational pension, PRSA, personal pension','No tax inside the fund','','0% inside the fund','On benefits only','','','Yes: plan (growth after charges)','Requires Verification'),
('Holding: life policy','Savings or endowment policy','Exit tax with the 8-year rule','You (the insurer deducts)','38%','On payout, and every 8 years','Gain over the premiums paid','','Partly: noted, payout added as cash','Requires Verification'),
('Selling: main home','Your home','No CGT (principal private residence relief)','You','0%','On sale','Gain on your only or main home','Full relief if it was your main home all the time (up to 1 acre)','C30','Requires Verification'),
('Selling: other property or land','Second home, rental property, land','Capital gains tax (CGT)','You (file and pay by Revenue deadlines)','33% before 7 Oct 2026; 31% from 7 Oct 2026','On the sale date','Sale price less cost less allowable costs','Annual exemption €1,270 per person; losses; development land stays at 33%','C30, plan (other assets)','Requires Verification'),
('Selling: shares held directly','Shares','Capital gains tax (CGT)','You','33% before 7 Oct 2026; 31% from then','On the sale date','Gain over cost','Annual exemption €1,270 per person; losses','C29, C30, plan','Requires Verification'),
('Selling: funds and ETFs','Funds, ETFs','Exit tax','You (the fund reports)','38%','On sale','Gain over the cost basis (after 8-year resets)','None (no exemption, no loss relief)','C29, C30, plan','Requires Verification'),
('Selling: crypto, gold, art','Crypto, gold, art, other','Capital gains tax (CGT)','You','33% before 7 Oct 2026; 31% from then','On sale or exchange','Gain over cost','Annual exemption €1,270; losses','C30, plan (alternative investments)','Requires Verification'),
('Selling: development land','Land with development potential','CGT at a separate rate','You','33% (stays at 33%)','On sale','Gain','Limited','C30','Requires Verification'),
('Selling: your business','Shares or assets of a business','CGT; retirement relief or entrepreneur relief may apply','You','33% / 31% unless a relief applies','On sale','Gain','Reliefs depend on age, length of ownership and the business','No','Requires Verification'),
('Drawing: pension lump sum','Tax-free lump sum at retirement','Income tax on the part above the tax-free limit','You','First €200,000 tax-free (lifetime), next €300,000 at 20%, above that at your marginal rate','At retirement','Up to 25% of the fund','','Yes: plan','Requires Verification'),
('Drawing: ARF / PRSA withdrawals','Pension income after retirement','Income tax and USC; PRSI is UNRESOLVED','You (the provider deducts)','Marginal income tax and USC; PRSI (provider guidance: before 66, and 66 to 70 without the contributory State Pension)','On each withdrawal','The amount withdrawn','Age credit and age exemption from 65','Yes: plan (PRSI unresolved)','Requires Verification'),
('Drawing: State Pension','Contributory or non-contributory','Income tax (taxable); no USC; no PRSI','You','Marginal rate on the pension','Weekly payments','Pension received','Age credit; age exemption limits','Yes: plan','Requires Verification'),
('Buying: property','Home or other property','Stamp duty','You (the solicitor pays)','1% to €1m, 2% to €1.5m, 6% above','On completion','Purchase price','Help to Buy may refund income tax for new homes','Yes: calculators C01, C03','Requires Verification'),
('Buying: shares','Irish company shares','Stamp duty','You','1%','On purchase','Price','','No','Requires Verification'),
('Gifting: to a spouse or civil partner','Any asset','No CGT, no CAT','','0%','On the gift','','Passes at the giver\'s cost','C30','Requires Verification'),
('Gifting: an asset to a child or other person','Property, shares, art','CGT on the GIVER (as if sold at market value) and CAT on the RECEIVER','Giver pays CGT; receiver pays CAT','CGT 33% / 31%; CAT 33% above the threshold','On the gift','CGT: market value less cost. CAT: value less thresholds','CGT annual exemption; CAT thresholds (Group A €400,000 before 7 Oct 2026, €420,000 from); small gift exemption €3,000 a year','C30 B and C','Requires Verification'),
('Gifting: cash','Cash','CAT on the RECEIVER only','Receiver','33% above the threshold','On the gift','Amount received','Thresholds; small gift exemption €3,000 per giver per year','C30 C','Requires Verification'),
('Receiving: inheritance','Any asset','CAT on the RECEIVER; no CGT on death','Receiver','33% above the group threshold','On death','Value received','Spouse exempt; thresholds by group; dwelling house exemption; business and farm reliefs','C30 C','Requires Verification'),
('Receiving: gift from a parent','Any asset','CAT on the RECEIVER','Receiver','33% above the Group A threshold','On the gift','Value received (lifetime total from parents)','Group A threshold; small gift exemption','C30 C','Requires Verification'),
('Receiving: inherited asset later sold','Property, shares','CGT on the later gain','Receiver','33% before 7 Oct 2026; 31% from then','On the later sale','Sale price less market value on the day it was inherited','Annual exemption','C30 A','Requires Verification'),
]
put(g,4,1,'Pick a situation (yellow cell)',H,HF); put(g,4,2,'What it means',H,HF)
put(g,5,1,G[11][0],fill=INP,wrap=False); 
first=20; last=first+len(G)-1
dvT=DataValidation(type='list',formula1=f'=$A${first}:$A${last}'); g.add_data_validation(dvT); dvT.add('A5')
for j,cn in enumerate(cols):
    put(g,6+j,1,cn,B,SUB); put(g,6+j,2,f'=INDEX({CL(j+1)}${first}:{CL(j+1)}${last},MATCH($A$5,$A${first}:$A${last},0))')
hdr(g,first-1,cols)
for i,row in enumerate(G):
    for j,v in enumerate(row):
        cc=put(g,first+i,1+j,v)
        if j==9: cc.fill=WARN
for j,w in enumerate([40,56,46,30,40,30,40,46,26,20]): g.column_dimensions[CL(j+1)].width=w
g.freeze_panes='A4'

# ============ Sample walkthrough ============
w=wb.create_sheet('Sample walkthrough')
w['A1']='Sample walkthrough: Aoife and Cian explained step by step'; w['A1'].font=T
w['A2']='A story you can read out to your team. Every number is a live formula linked to the calculators. Both calculators (C29, C30) must be on "Sample example" (cell E2 on each sheet): the box below turns green when they are.'
w['A2'].alignment=WR; w.merge_cells('A2:D2'); w.row_dimensions[2].height=44
put(w,3,1,'Are both calculators on the sample?',B,SUB)
put(w,3,2,'=IF(AND(\'C29 Investment tax\'!E2="Sample example",\'C30 Sale gift inheritance\'!E2="Sample example"),"Yes: the numbers below are the sample","No: set E2 to Sample example on C29 and C30")',B,fill=PatternFill('solid',fgColor='D9F2EE'),wrap=False)
hdr(w,5,['Step','What happens (say this)','Result','Where to look'])
C29="'C29 Investment tax'!"; C30="'C30 Sale gift inheritance'!"; PC="'Plan cashflow'!"; PT="'Plan pay & tax'!"
steps=[
 ('1. Invest €100,000 in an ETF','Aoife puts €100,000 in an ETF for 20 years. It grows 5% a year, less 1% charges. If there were no tax it would reach this value:','='+C29+'B24',EUR,'C29, "Value if nothing were taxed"'),
 ('','But a fund pays exit tax every 8 years even if she does not sell (the "8-year rule"). Tax taken from the fund at those events:','='+C29+'B28',EUR,'C29, table columns G to I'),
 ('','When she sells in year 20 she pays exit tax on the gain since the last reset:','='+C29+'B29',EUR,'C29, "Tax on the sale"'),
 ('','What she receives after all tax:','='+C29+'B30',EUR,'C29, "Money you receive after all tax"'),
 ('','So the growth she really gets each year, after tax, is:','='+C29+'B33',PCT2,'C29 vs 4% before tax'),
 ('2. Sell a rental property','Cian sells a rental property for €400,000. It cost €250,000 and he spent €15,000 on costs. The gain is:','='+C30+'B12',EUR,'C30 section A'),
 ('','Capital gains tax (31% for a sale after 7 Oct 2026) on the gain after the €1,270 yearly exemption:','='+C30+'B15',EUR,'C30, "Tax payable"'),
 ('','What he keeps (before repaying any loan):','='+C30+'B16',EUR,'C30'),
 ('3. Give an asset to a child','They give a €300,000 property to their daughter. A gift counts as a sale at market value, so the giver can owe capital gains tax. Cian\'s gain is:','='+C30+'B26',EUR,'C30 section B'),
 ('','The capital gains tax the giver pays:','='+C30+'B28',EUR,'C30 section B'),
 ('4. A child receives money','The daughter also receives €500,000 from her parents. Tax for the receiver is gift and inheritance tax (CAT), 33% above the threshold for a child from a parent. The threshold is:','='+C30+'B36',EUR,'C30 section C'),
 ('','CAT she pays:','='+C30+'B39',EUR,'C30 section C'),
 ('5. A year of cash flow (Plan cashflow sheet)','In the first plan year, money in after tax and pension contributions (today\'s money):','='+PC+'G8',EUR,'Plan cashflow, first row (needs "Fill example values" = Yes on the READ ME)'),
 ('','Of which income tax, USC and PRSI taken (today\'s money), already deducted from the figure above:','='+PT+'BR234',EUR,'Plan pay & tax, tax columns; Plan cashflow, column "TAXES APPLIED THIS YEAR"'),
 ('','Living costs and one-offs:','='+PC+'H8',EUR,'Plan cashflow'),
 ('','Mortgage and loan repayments:','='+PC+'R8',EUR,'Plan cashflow'),
 ('','What is left (surplus), which goes to saving, goals or spending:','='+PC+'G8-'+PC+'H8-'+PC+'R8',EUR,'Plan cashflow'),
 ('6. The big idea','Tax depends on WHAT you own and WHAT you do with it: holding, selling, giving or receiving. The "Tax guide 2026" sheet answers that for every case.','',None,'Tax guide 2026 (pick a situation)'),
 ('7. Be honest about limits','Every tax figure marked "Requires Verification" has not yet been checked against Revenue or the Department of Social Protection. PRSI on pension withdrawals is unresolved.','',None,'Tax assumptions 2026'),
]
for i,(a,b_,f_,fm,wh) in enumerate(steps):
    rr=6+i; put(w,rr,1,a,B,SUB if a else None); put(w,rr,2,b_); cc=put(w,rr,3,f_,B,fmt=fm,wrap=False); put(w,rr,4,wh)
    w.row_dimensions[rr].height=max(32,16*(len(b_)//80+1))
widths(w,[30,90,18,40])

