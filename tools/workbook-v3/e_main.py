import sys
from e_common import *
import e_inputs, e_holdings
BASE='/home/user/lifemap/deliverables/LifeGoals-Calculators.xlsx'
OUT=sys.argv[1] if len(sys.argv)>1 else SC+'base_v3.xlsx'
META=json.load(open('/home/user/lifemap/tools/plan-vs-xlsx/plan-meta.json'))
wb=openpyxl.load_workbook(BASE)
r_end=e_inputs.build_inputs(wb)
pi=wb['Plan inputs']
# ---- emergency fund goal added automatically (the prototype's autoSafety) in the first free goal row
r=r_end+1
pi.cell(r,2,'EMERGENCY FUND GOAL ADDED AUTOMATICALLY (worked out; not typed)').font=BOLD; r+=1
pi.cell(r,2,'Row of the Emergency fund goal if one is added (the first goal row after your last goal; 0 = none)'); pi.cell(r,7,'=IF(AutoSafety_On=1,SUMPRODUCT(MAX((K111:K132<>"")*(ROW(K111:K132)-110)))+1,0)').fill=GRN; cellname(wb,'AutoSafety_Row',pi,f'G{r}'); r+=1
pi.cell(r,2,'An Emergency fund goal is added (1/0): none typed, not removed, and cash is below the months you chose (or you asked for it)'); 
pi['G%d'%r]='=IF(AND(In_safetyOff<>"Yes",COUNTIF(K111:K132,"safety")=0,OR(In_safetyWanted="Yes",AND(Has_cash=1,IF(Has_costsM=1,F_EssM,0)>0,F_Cash<AS_Months*F_EssM-0.5)),SUMPRODUCT(MAX((K111:K132<>"")*(ROW(K111:K132)-110)))+1<=22),1,0)'
pi['G%d'%r].fill=GRN; cellname(wb,'AutoSafety_On',pi,f'G{r}'); r+=1
pi.cell(110,11,'Typed or example key (before the automatic Emergency fund goal)'); pi.cell(110,12,'Auto goal here (1/0)')
for c in (11,12): pi.cell(110,c).fill=HEAD; pi.cell(110,c).font=WH; pi.cell(110,c).alignment=Alignment(wrap_text=True)
for i in range(1,23):
    rr=110+i
    origN=pi.cell(rr,14).value; assert isinstance(origN,str) and origN.startswith('=IF(ISBLANK(C')
    pi.cell(rr,11,origN)
    pi.cell(rr,12,f'=IF(AND(K{rr}="",AutoSafety_On=1,AutoSafety_Row={i}),1,0)')
    pi.cell(rr,14,f'=IF(K{rr}<>"",K{rr},IF(L{rr}=1,"safety",""))')
    for col,auto in ((16,'MIN(PR_GoalMaxAge,In_age+IFERROR(INDEX(Goal_DefYrs,MATCH("safety",Goal_Keys,0)),0))'),
                     (17,'IF(AND(Has_costsM=1,F_EssM>0),ROUND(F_EssM*AS_Months,0),IFERROR(INDEX(Goal_DefAmt,MATCH("safety",Goal_Keys,0)),0))'),
                     (18,'0'),(19,'"Must have"'),(20,'""'),(21,'"Yes"')):
        o=pi.cell(rr,col).value; assert o.startswith('=')
        pi.cell(rr,col,f'=IF(L{rr}=1,{auto},{o[1:]})')
# ---- Plan cashflow: new columns at the right
cfm=META['C']['cols']; cf=dict(cfm); ws=wb['Plan cashflow']; NC=ws.max_column
def newcol(key,header):
    global NC
    NC+=1; cf[key]=CL(NC); c=ws.cell(6,NC,header); c.fill=HEAD; c.font=WH; c.alignment=Alignment(wrap_text=True,vertical='top'); ws.column_dimensions[CL(NC)].width=12
newcol('potTake','Money taken from savings this year (goals paid from spare money + short year)')
newcol('potFreed','Goal pots freed this year, added to savings before later goals are paid')
newcol('potAdd','New money added to savings after the goals this year (saving not needed by a goal, a retired year\'s leftover)')
newcol('downDone','Home downsized this year or before (1/0)')
K=20
for r in range(8,98):
    p=r-1
    tops='+'.join(f"{cf[f's{k}_top']}{r}" for k in range(1,K+1))
    ws[f"{cf['potTake']}{r}"]=f"={tops}+{cf['takeF']}{r}"
    fr='+'.join(f"{cf[f's{k}_due']}{r}*IF(Slot{k}_SpendLike=1,{cf[f's{k}_potS']}{r}-{cf[f's{k}_pay0']}{r},IF(Slot{k}_PotFree=1,{cf[f's{k}_potS']}{r},0))" for k in range(1,K+1))
    ws[f"{cf['potFreed']}{r}"]=f"={fr}"
    ws[f"{cf['potAdd']}{r}"]=f"={cf['free3']}{r}-{cf['free0']}{r}+{cf['potTake']}{r}-{cf['potFreed']}{r}"
    prev=f"{cf['downDone']}{p}" if r>8 else '0'
    ws[f"{cf['downDone']}{r}"]=f"=IF(OR({prev}=1,AND(In_homeUse=\"Yes, I'd downsize\",In_downAge>0,{cf['a']}{r}=In_downAge,OR(In_home=\"Own outright\",In_home=\"Own with mortgage\"),In_homeValue>0)),1,0)"
    # mortgage is cleared in the year the home is downsized
    ws[f"{cf['mbS']}{r}"]=f"=IF({cf['downDone']}{r}=1,0,{cf['mbE']}{p})"
# ---- Plan goals Part 2: two availability chains
pg=wb['Plan goals']
for r in range(53,74):
    for c in range(25,29): assert pg.cell(r,c).value is None,(r,c)
for c,h in zip(range(25,29),['Taken from cash and savings accounts','Taken from investments and assets','Cash and savings left','Investments and assets left (after tax)']):
    x=pg.cell(53,c,h); x.fill=HEAD; x.font=WH; x.alignment=Alignment(wrap_text=True,vertical='top')
for K_ in range(1,21):
    rr=53+K_; pr=rr-1
    prevE='PG_Easy0' if K_==1 else f'AA{pr}'; prevR='PG_Rest0' if K_==1 else f'AB{pr}'
    pg[f'Y{rr}']=f'=IF(D{rr}=1,MIN(U{rr},{prevE}),0)'
    pg[f'Z{rr}']=f'=IF(AND(D{rr}=1,O{rr}=0),MIN(U{rr}-Y{rr},{prevR}),0)'
    pg[f'AA{rr}']=f'={prevE}-Y{rr}'; pg[f'AB{rr}']=f'={prevR}-Z{rr}'
    pg[f'V{rr}']=f'=Y{rr}+Z{rr}'; pg[f'W{rr}']=f'=AA{rr}+AB{rr}'
pg['U53']='Wanted from savings'; pg['V53']='Taken from savings (cash, savings accounts, investments, other assets)'; pg['W53']='Savings left (after tax)'
for rr,(lab,nm,f) in zip(range(75,80),[('Cash left after the buffer','PG_CashAfterBuf','=$T$73-Init_Buf0'),('Cash and savings accounts available for goals today','PG_Easy0','=PG_CashAfterBuf+H_Sav0'),
    ('Investments and assets available for goals today (after tax on selling)','PG_Rest0',None),('Taken for goals today from cash and savings accounts','PG_PreTakeE','=SUM($Y$54:$Y$73)'),('Taken for goals today from investments and assets','PG_PreTakeR','=SUM($Z$54:$Z$73)')]):
    pg.cell(rr,7,lab); c=pg.cell(rr,10,f); c.fill=PLN; cellname(wb,nm,pg,f'J{rr}')
pg['B77']='Savings available for goals today (cash after the buffer, savings accounts, investments and assets after tax)'
pg['B78']='Holdings after the goals are topped up today (all pots)'
pgd={'cashAfterBuf':'J75','preTakeE':'J78','preTakeR':'J79'}
hws,hc=e_holdings.build_holdings(wb,cf,pgd)
pg['J77']=f"='Plan holdings'!{hc['capInv']}7+'Plan holdings'!{hc['capOth']}7+'Plan holdings'!{hc['capAlt']}7"
pg['D77']='=PG_Easy0+PG_Rest0'; pg['D78']=f"='Plan holdings'!{hc['wTot']}7"
# ---- Plan cashflow: the savings pots now come from Plan holdings
for r in range(8,98):
    ws[f"{cf['free0']}{r}"]=f"='Plan holdings'!{hc['avail']}{r}"
    ws[f"{cf['freeP']}{r}"]=f"='Plan holdings'!{hc['wTot']}{r-1}"
    ws[f"{cf['freeE']}{r}"]=f"='Plan holdings'!{hc['wTot']}{r}"
ws[f"{cf['freeE']}7"]=f"='Plan holdings'!{hc['wTot']}7"
for k in ('free0','freeP','freeE'): ws[f"{cf[k]}6"]={'free0':'Savings available at the start (cash, savings, investments and assets after tax, plus any lump sum, policy or downsizing money)','freeP':'All holdings, previous year end','freeE':'All holdings at the end of the year (Plan holdings)'}[k]
# ---- Plan pay & tax: policy income
pp=wb['Plan pay & tax']
for r in range(234,324):
    v=pp[f'AF{r}'].value
    if isinstance(v,str) and v.startswith('=(F_OtherM+F_RentM)*12*'): pp[f'AF{r}']=v+f'+IF(AND(In_polInc>0,In_polIncAge>0,C{r}>=In_polIncAge),In_polInc,0)'
# ---- this workbook holds the 2026 rules only: the plan always starts in 2026
pi['F101']='=Rules_Year'
v=pi['G101'].value; assert 'OR(C101=Rules_Year,C101=Rules_Year_Next)' in v; pi['G101']=v.replace('OR(C101=Rules_Year,C101=Rules_Year_Next)','C101=Rules_Year')
pi['E101']='S.asm.startYear (this workbook holds the 2026 rules only, so the plan starts in 2026)'
wb['Plan pay & tax']['C140']='=Rules_Year'
# ---- engine v3.0 words on the Results sheet: the line under the date of birth, and the Emergency fund foundation
def cell_of(n):
    a=wb.defined_names[n].attr_text; sh,c=a.split('!'); return wb[sh.strip("'")][c.replace('$','')]
c=cell_of('DOB_Msg')
c.value='=IF(Has_age=0,"","✓ "&DOB_AgeToday&" today"&IF(AS_Year0>YEAR(TODAY())," · your plan starts Jan "&AS_Year0," · turns "&(DOB_AgeToday+1)&" on "&TEXT(DOB_NextBirthday,"d mmmm yyyy")))'
c=cell_of('PDOB_Msg'); v=c.value
for a_,b_ in (('"Thanks. They\'re "&','"✓ "&'),('&" today and turn "&','&" today · turns "&'),('&".")',')')):
    assert a_ in v,(a_,v[:120]); v=v.replace(a_,b_,1)
c.value=v
EGP='IFERROR(INDEX(\'Plan goals\'!$G$110:$G$131,MATCH("safety",GL_Key,0)),-1)'
st=cell_of('Fnd2_St'); base=st.value[1:]
st.value=f'=IF(OR(AND({base}="bad",{EGP}>=95),AND({base}="mid",{EGP}>=95)),"mid",{base})'
sx=cell_of('Fnd2_S'); sv=sx.value
sx.value=sv+f'&IF(AND(Fnd2_St="mid",{EGP}>=95),IF(OR(Has_cash=0,Has_costsM=0)," "," · your plan builds it by "&(AS_Year0+INDEX(GL_AgeRaw,MATCH("safety",GL_Key,0))-F_Age)),"")'
# ---- engine v3.0 money profile: the cushion is cash / essential spending when the figures are given; Q7 is its own "safety net" term
pf=wb['Plan profile']
for r_,t_ in zip(range(36,40),['Liquidity reserve','Goal leakage','Credit-funded','Not planned yet']): pf.cell(r_,8,t_)
def pcell(n): return cell_of(n)
rr=137
for lab,nm,f in [('Money terms: safety net (Q7)','Prof_TermsSafety','=IF(PA_7>0,INDEX(\'Plan profile\'!$H$23:$H$75,MATCH("7|"&PA_7,Prof_Key,0)),"")'),
                 ('Cushion figures given (cash and living costs both given) (1/0)','Prof_CuFig','=IF(AND(Has_cash=1,Has_costsM=1,F_EssM>0),1,0)'),
                 ('Months of essential spending held in cash (rounded down to 0.1)','Prof_CuM','=IF(Prof_CuFig=1,INT(F_Cash/F_EssM*10)/10,"")'),
                 ('Cushion level (v3.0: from the figures, else from the Q7 answer)','Prof_CuLevel','=IF(Prof_CuFig=1,IF(Prof_CuM>=AS_Months,"In place",IF(Prof_CuM>=1,"Thin","None")),IF(PA_7>0,CHOOSE(PA_7,"In place","Thin","None: relies on credit","Not set up yet"),""))')]:
    pf.cell(rr,2,lab); pf.cell(rr,3,f).fill=GRN; cellname(wb,nm,pf,f'C{rr}'); rr+=1
for r_ in range(23,76):
    if pf.cell(r_,2).value=='8|4': assert pf.cell(r_,8).value=='High risk'; pf.cell(r_,8,'Adventurous')
pcell('Prof_TermsCapacity').value='=IF(PA_6>0,INDEX(\'Plan profile\'!$H$23:$H$75,MATCH("6|"&PA_6,Prof_Key,0)),"")'
pcell('Prof_Cushion').value='=IF(OR(Prof_CuFig=1,PA_7>0),Prof_CuLevel,"")'
v=pcell('Prof_C').value
a1='IF(Prof_q7=2,3,5),IF(Prof_q7=1,2,5)'; a2='IF(AND(Has_cash=1,Has_costsM=1,F_CostsM>0,F_Cash<3*F_CostsM),3,5)'
assert a1 in v and a2 in v
pcell('Prof_C').value=v.replace(a1,'IF(AND(Prof_CuFig=0,Prof_q7=2),3,5),IF(AND(Prof_CuFig=0,Prof_q7=1),2,5)').replace(a2,'IF(Prof_CuFig=1,IF(Prof_CuM<1,2,IF(Prof_CuM<3,3,5)),5)')
v=pcell('Prof_Thin').value; pcell('Prof_Thin').value='=IF(Prof_CuFig=1,IF(Prof_CuLevel<>"In place",1,0),'+v[1:]+')'
# ---- engine v3.0: the new optional figures are part of "My money" (sections, checklist, "N details look good")
pr_=wb['Plan results']
NEW=[('homeUse','Would you use your home to fund your plan?','OR(In_home="Own outright",In_home="Own with mortgage")',3),('downAge','Age you would downsize','AND(OR(In_home="Own outright",In_home="Own with mortgage"),In_homeUse="Yes, I\'d downsize")',3),
 ('downValue','Value of the smaller home','AND(OR(In_home="Own outright",In_home="Own with mortgage"),In_homeUse="Yes, I\'d downsize")',3),('savings','Savings accounts','1',3),('invCost','What you paid for your investments','In_invest>0',3),('invYears','Years you have held your investments','In_invest>0',3),
 ('otherAssets','Other assets you would sell if needed','1',3),('othCost','What you paid for your other assets','In_otherAssets>0',3),('altInv','Alternative investments','1',3),('altCost','What you paid for your alternative investments','In_altInv>0',3),
 ('capLoss','Capital losses you can use','OR(In_otherAssets>0,In_altInv>0,In_invest>0)',3),('assetsJoint','Assets owned together with your partner','AND(F_Partner=1,OR(In_otherAssets>0,In_altInv>0,In_invest>0))',3),
 ('polLump','Policy lump sum','1',6),('polLumpAge','Age the policy pays out','In_polLump>0',6),('polInc','Policy or annuity income','1',6),('polIncAge','Age the policy income starts','In_polInc>0',6)]
R0n=250; pr_.cell(R0n-2,2,'MY MONEY: the optional figures added in engine v3.0 (same columns as the table above, rows 101 to 139)').font=BOLD
for i,(k,lab,show,sec_) in enumerate(NEW):
    r=R0n+i
    row_={2:lab,3:f'=IF({show},1,0)',4:'1',5:f'=IF(Has_{k},1,0)',6:'0',7:f'=IF(ISNUMBER(SEARCH(","&"{k}"&",",","&SUBSTITUTE(In_lookKeys," ","")&",")),1,0)',8:f'=IF(ISNUMBER(SEARCH(","&"{k}"&",",","&SUBSTITUTE(In_ackKeys," ","")&",")),1,0)',
      9:f'=C{r}*(1-D{r})',10:f'=I{r}*E{r}',11:f'=C{r}*G{r}*(1-H{r})',12:f'=C{r}*E{r}*(1-F{r})',13:f'=C{r}*MAX(E{r},G{r})',14:str(sec_),15:f'=C{r}*IF(G{r}=1,1,IF(AND(D{r}=0,E{r}=0),1,0))',16:f'=C{r}*E{r}*(1-G{r})',17:k}
    for c,v in row_.items():
        pr_.cell(r,c, int(v) if c in (4,6,14) else v)
RN1=R0n+len(NEW)-1
import re as _re
def union(f):
    f=_re.sub(r'SUMIFS\((\$[A-Z]\$)101:(\$[A-Z]\$)139,(\$[A-Z]\$)101:(\$[A-Z]\$)139,(\d)\)',lambda m:f'(SUMIFS({m.group(1)}101:{m.group(2)}139,{m.group(3)}101:{m.group(4)}139,{m.group(5)})+SUMIFS({m.group(1)}{R0n}:{m.group(2)}{RN1},{m.group(3)}{R0n}:{m.group(4)}{RN1},{m.group(5)}))',f)
    f=_re.sub(r'(?<![A-Z])SUM\((\$[A-Z]\$)101:(\$[A-Z]\$)139\)',lambda m:f'(SUM({m.group(1)}101:{m.group(2)}139)+SUM({m.group(1)}{R0n}:{m.group(2)}{RN1}))',f)
    f=f.replace('SUMPRODUCT($K$101:$K$139*($Q$101:$Q$139<>"retireAge"))',f'(SUMPRODUCT($K$101:$K$139*($Q$101:$Q$139<>"retireAge"))+SUMPRODUCT($K${R0n}:$K${RN1}*($Q${R0n}:$Q${RN1}<>"retireAge")))')
    return f
for r in (140,141,142,143,144,145,146,147,148,151,152):
    v=pr_.cell(r,3).value; nv=union(v); assert nv!=v,(r,v)
    pr_.cell(r,3).value=nv
pp_=wb['Plan pay & tax']
# ---- ARF / PRSA withdrawals: PRSI (UNRESOLVED in the register; the prototype applies it) and shares held directly grow without the exit-tax smoothing
asm=wb['Assumptions']; rr=135
asm.cell(rr,2,'PRSI ON ARF / PRSA WITHDRAWALS  ·  UNRESOLVED: sources conflict (type 1, not an input; Requires Verification)').font=BOLD; rr+=1
for lab,nm,val,src in [('PRSI applies to ARF / PRSA withdrawals before 66, and 66 to the age below if there is no contributory State Pension (1 = yes)  [PRSI_ARF_Applies]','PRSI_ARF_Applies',1,'Provider and adviser sources say yes; the Revenue / Social Protection wording was not reachable. UNRESOLVED.'),
                       ('Age to which PRSI on ARF withdrawals continues when there is no contributory State Pension  [PRSI_ARF_ToAge]','PRSI_ARF_ToAge',70,'As above. UNRESOLVED.')]:
    asm.cell(rr,2,lab); asm.cell(rr,3,val); asm.cell(rr,4,'Plan pay & tax (PRSI)'); asm.cell(rr,5,src); asm.cell(rr,6,'2026'); cellname(wb,nm,asm,f'C{rr}'); rr+=1
for r in range(234,324):
    v=pp_[f'BP{r}'].value
    assert v.startswith('=IF(C%d<PR_PRSIend'%r)
    pp_[f'BP{r}']=v+f'+IF(AND(PRSI_ARF_Applies=1,AN{r}>0,C{r}>=PR_PRSIend,C{r}<PRSI_ARF_ToAge,NOT(AK{r}>0)),J{r}*AN{r},0)'
st=wb['Settings']
chg='IF(ISNUMBER(Suggest_Fund_Charges),Suggest_Fund_Charges,0.01)'
st['C11']='=IF(In_a_invWrapper="shares",ROUND(Set_invGross-%s,3),%s)'%(chg,st['C11'].value[1:])
st['F11']='=IF(In_a_invWrapper="shares",ROUND(Set_invGross-0.01-%s,3),%s)'%(chg,st['F11'].value[1:])
json.dump({'cf':cf,'hc':hc},open(SC+'letters.json','w'))
wb.save(OUT); print('saved',OUT,len(wb.sheetnames),'sheets')
