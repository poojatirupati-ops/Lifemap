from e_common import *
# new Plan inputs (appended below the goals): the assets, home and policy figures of engine v3.0, and four assumption choices
def build_inputs(wb):
    ws=wb['Plan inputs']; r=134
    def head(t):
        nonlocal r
        for c,h in zip(range(2,9),[t,'Your figure','Unit','Prototype state key','Example (sample)','Used by the plan','Given?']):
            x=ws.cell(r,c,h); x.fill=HEAD; x.font=WH
        r+=1
    def row(key,label,unit,kind,lo=None,hi=None,note='',opts=None,integer=False,ex=None):
        nonlocal r
        ws.cell(r,2,label); ws.cell(r,4,unit); ws.cell(r,5,note).font=GREYF
        c=ws.cell(r,3); c.fill=YEL; c.font=BLUE
        if ex is not None: ws.cell(r,6,ex).font=GREYF
        if kind=='n':
            V=f'IF(ISNUMBER(C{r}),AND(C{r}>={lo},C{r}<={hi}{",C%d=INT(C%d)"%(r,r) if integer else ""}),FALSE())'
            g=f'=IF(ISBLANK(C{r}),IF(AND(Fill_Example="Yes",F{r}<>""),F{r},0),IF({V},C{r},0))'
            h=f'=IF(ISBLANK(C{r}),IF(AND(Fill_Example="Yes",F{r}<>""),1,0),IF({V},1,0))'
            dv=DataValidation(type='whole' if integer else 'decimal',operator='between',formula1=str(lo),formula2=str(hi),allow_blank=True,showErrorMessage=True,errorTitle='Not allowed',error=f'Enter a number from {lo} to {hi}, or leave it blank.')
        else:
            lst=','.join(opts); V=f'ISNUMBER(MATCH(C{r},{{{",".join(chr(34)+o+chr(34) for o in opts)}}},0))'
            g=f'=IF(ISBLANK(C{r}),IF(Fill_Example="Yes",F{r},""),IF({V},C{r},""))'; h=f'=IF(G{r}="",0,1)'
            dv=DataValidation(type='list',formula1='"'+lst+'"',allow_blank=True,showErrorMessage=True,errorTitle='Not in the list',error='Pick one from the list, or leave it blank.')
        ws.add_data_validation(dv); dv.add(f'C{r}')
        ws.cell(r,7,g).fill=GRN; ws.cell(r,8,h).fill=GRN
        cellname(wb,'In_'+key,ws,f'G{r}'); cellname(wb,'Has_'+key,ws,f'H{r}'); r+=1
    ws.cell(r,2,'MORE ABOUT YOUR ASSETS, HOME AND POLICIES (engine v3.0, all optional: blank = none, or "not known" for what you paid)').font=BOLD; r+=1
    head('YOUR ASSETS')
    row('savings','Savings accounts (deposit, notice, fixed-term, State Savings)','€','n',0,100000000,'S.fin.savings')
    row('otherAssets','Other assets you would sell if needed (land, a business share; not your home, not rented property)','€','n',0,100000000,'S.fin.otherAssets')
    row('altInv','Alternative investments (crypto, gold, art, collectables)','€','n',0,100000000,'S.fin.altInv')
    row('invCost','What you paid for your investments in total (blank = assumed bought at today\'s value)','€','n',0,100000000,'S.fin.invCost (blank stays unknown)')
    row('invYears','Years you have held your investments (blank = the 8 years start today)','years','n',0,60,'S.fin.invYears',integer=False)
    row('othCost','What you paid for your other assets (blank = a share of the value is assumed to be gain)','€','n',0,100000000,'S.fin.othCost')
    row('altCost','What you paid for your alternative investments (blank = a share of the value is assumed to be gain)','€','n',0,100000000,'S.fin.altCost')
    row('capLoss','Capital losses you can use against gains (reported to Revenue, not yet used)','€','n',0,100000000,'S.fin.capLoss')
    row('divY','Dividends you receive a year from shares held directly (before tax, today\'s money; blank for funds and ETFs)','€ a year','n',0,100000000,'S.fin.divY')
    row('rentCostM','Other property: costs a month (agent, repairs, insurance, mortgage interest); tax is on rent less costs','€ a month','n',0,1000000,'S.fin.rentCostM')
    row('assetsJoint','Do you own these assets together with your partner? (Yes/No/Not sure; Yes = two yearly CGT exemptions)','','t',note='S.fin.assetsJoint',opts=['Yes','No','Not sure'])
    r+=1; head('YOUR HOME AND POLICIES')
    row('homeUse','Would you ever use your home to fund your plan? (No, never / Yes, I\'d downsize / Only as a last resort)','','t',note='S.fin.homeUse (only counted if you own your home)',opts=["No, never","Yes, I'd downsize","Only as a last resort"])
    row('downAge','Age you would downsize','age','n',50,95,'S.fin.downAge',integer=False)
    row('downValue','Value of the smaller home (today\'s money)','€','n',0,100000000,'S.fin.downValue')
    row('polLump','Savings or endowment policy: amount it pays out, after any tax','€','n',0,100000000,'S.fin.polLump')
    row('polLumpAge','Your age when it pays out','age','n',18,100,'S.fin.polLumpAge',integer=False)
    row('polInc','Policy or annuity paying a regular income: € a year, before tax','€ a year','n',0,100000000,'S.fin.polInc')
    row('polIncAge','Your age when it starts','age','n',18,100,'S.fin.polIncAge',integer=False)
    r+=1; head('EMERGENCY FUND GOAL AND INVESTMENT CHOICES')
    row('safetyWanted','You asked for an Emergency fund goal to be added (Yes/No)','','t',note='S.safetyWanted ("Add an Emergency fund goal")',opts=['Yes','No'])
    row('safetyOff','You removed the Emergency fund goal and do not want it added again (Yes/No)','','t',note='S.safetyOff',opts=['Yes','No'])
    row('a_invWrapper','Your investments are held as (fund = funds/ETFs with exit tax and the 8-year rule; shares = held directly, CGT when sold)','','t',note='S.asm.invWrapper (blank = fund)',opts=['fund','shares'])
    row('a_cgtGain','Other assets, crypto, gold, art: share of their value that is a gain, when you did not enter a cost (a rate, 0.4 = 40%)','rate: 0.4 = 40%','n',0,1,'S.asm.cgtGain (blank = the standard, 40%)')
    return r
