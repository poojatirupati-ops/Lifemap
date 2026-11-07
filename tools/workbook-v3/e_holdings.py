from e_common import *
NL=91            # lots: lot 0 is the holding you have today; lot j (1..90) is the new money put in during plan year j-1
R7=7; R0=8; NR=90   # row 7 = funding of goals from savings today (before year 0); rows 8..97 = plan years 0..89 (same rows as Plan cashflow)
def build_holdings(wb, cf, pg):
    """cf: dict of Plan cashflow column letters by key; pg: dict of Plan goals cell addresses"""
    if 'Plan holdings' in wb.sheetnames: del wb['Plan holdings']
    ws=wb.create_sheet('Plan holdings'); ws.sheet_properties.tabColor='2E8B57'
    ws['B1']='Plan holdings: cash, savings accounts, investments (lot by lot), other assets and alternative investments, year by year'; ws['B1'].font=Font(bold=True,size=14)
    ws['B2']=('Where the plan\'s own money sits. Each year the money needed for goals and for short years is taken in the funding order: cash, savings accounts, investments, other assets, alternative investments. '
              'Investments are kept as lots (the holding you have today, then the new money put in each year). Funds and ETFs pay exit tax when sold and at each 8-year anniversary of a lot (the cost resets); '
              'shares held directly, other assets and alternative investments pay capital gains tax when sold (losses first, then the yearly exemption). Nothing is taxed because it rises in value. '
              'Row 7 is the funding of goals from savings today (before year 0); rows 8 on are plan years 0, 1, 2, ... (same rows as Plan cashflow). Parameters are below the table (row 101 on).')
    ws['B2'].alignment=Alignment(wrap_text=True,vertical='top'); ws.merge_cells('B2:L2'); ws.row_dimensions[2].height=88
    cols={}; order=[]
    def add(key,header,width=11):
        cols[key]=len(order)+2; order.append((key,header,width))
    def blk(key,header):
        cols[key]=len(order)+2
        for j in range(NL): order.append((f'{key}{j}',f'{header} (lot {j})',9))
    def C(key,r): return f'{CL(cols[key])}{r}'
    def L(key,j,r): return f'{CL(cols[key]+j)}{r}'
    rowkeys=[('t','Year (t); -1 = today'),('act','In the plan (1/0)'),('age','Your age'),('yr','Calendar year'),('infl','Prices index'),
     ('rate','CGT rate on sales this year'),('left0','Yearly CGT exemption available this year'),('loss0','Capital losses carried in'),
     ('cashS','Cash at the start'),('savS','Savings accounts at the start'),
     ('polIn','Policy lump sum paid out'),('downIn','Money freed by downsizing'),('lsN','Pension lump sum, net'),('aCash','Added to cash before goals'),('aInv','Added to investments before goals'),
     ('freed','Goal pots freed this year (added before later goals are paid)'),('fCash','... to cash'),('fInv','... to investments'),('easyAvail','Cash and savings available at the start'),('easyAvailC','Cash and savings available when goals are paid'),('capInv','Investments: money you would receive if all were sold'),('capOth','Other assets: money if sold'),('capAlt','Alternative investments: money if sold'),('avail','Money available in total (after tax on sales)'),
     ('take','Money taken this year (goals and short years)'),('takeE','Taken from cash and savings'),('takeR','Taken from investments and assets'),
     ('cashT','Taken from cash'),('savT','Taken from savings accounts'),('cashA','Cash after taking'),('savA','Savings accounts after taking'),
     ('netInv','Received from investments'),('xInv','Investments sold (value)'),
     ('needO','Still needed from other assets'),('vo','Other assets: value at the start'),('bo','Other assets: cost at the start'),('goG','Other assets: gain share'),('netO','Received from other assets'),('xO','Other assets sold (value)'),('loO','CGT exemption left after other assets'),('lsO','Losses after other assets'),
     ('needA','Still needed from alternative investments'),('va','Alternative investments: value at the start'),('ba','Alternative investments: cost at the start'),('gaG','Alt: gain share'),('netA','Received from alternative investments'),('xA','Alternative investments sold (value)'),('loA','CGT exemption left at the end'),('lsA','Losses carried out'),
     ('capL0','Capacity pass: exemption after investments'),('capS0','Capacity pass: losses after investments'),('capOthL','Capacity pass: exemption after other assets'),('capOthS','Capacity pass: losses after other assets'),
     ('addPost','New money added after goals'),('postCash','... to cash'),('postInv','... to investments'),
     ('cashE','Cash at the end of the year'),('savE','Savings accounts at the end'),('invE','Investments at the end'),('othE','Other assets at the end'),('othBE','Other assets: cost at the end'),('altE','Alternative investments at the end'),('altBE','Alt: cost at the end'),('wTot','All holdings at the end of the year'),
     ('saleTax','Tax on sales (exit tax or CGT)'),('dirt','DIRT taken from interest this year (already inside the cash growth rate)'),('deemed','Exit tax at the 8-year anniversaries'),('invG','Investment growth used')]
    for k,h in rowkeys: add(k,h)
    for k,h in [('gf','Gain share'),('cn','Money if all sold'),('cl','Cap pass: exemption left'),('cs','Cap pass: losses'),('nt','Received'),('x','Sold (value)'),('lf','Exemption left'),('ls','Losses'),('vg','Value after growth'),('bg','Cost after sale and additions'),('ve','Value at the end'),('be','Cost at the end'),('ae','Years on the 8-year clock'),('dt','Exit tax at the anniversary')]: blk(k,h)
    prm=[('H_Exit','Exit tax on funds',"=Exit_Tax",'0%','Assumptions: 38% in 2026'),('H_Deemed','Deemed disposal every (years)',"=Deemed_Disposal_Years",'0','Assumptions: 8'),('H_DIRT','DIRT',"=DIRT",'0%','Assumptions: 33%'),
     ('H_CGT0','CGT rate before the change',0.33,'0%','33% (until 6 Oct 2026)'),('H_CGT1','CGT rate from the change',0.31,'0%','31% from 7 Oct 2026 (Revenue eBrief 142/26, seen in search results only)'),('H_CGTfrom','Date the lower CGT rate starts','=DATE(2026,10,7)','dd/mm/yyyy','Requires Verification'),
     ('H_Exempt','Yearly CGT exemption per person (€)',1270,'#,##0','Requires Verification: the Revenue page could not be opened'),
     ('H_GainSh','Share of other assets and alternative investments treated as gain when no cost is given','=IF(Has_a_cgtGain=1,In_a_cgtGain,0.4)','0%','Your choice, else the 40% standard'),
     ('H_Direct','Investments held as shares directly (1) or funds / ETFs (0)','=IF(In_a_invWrapper="shares",1,0)','0',''),
     ('H_TaxEvt','Tax taken as events (1); 0 if you chose your own investment growth rate','=IF(AND(NOT(ISBLANK('+chr(39)+'Plan inputs'+chr(39)+'!C82)),'+chr(39)+'Plan inputs'+chr(39)+'!G82='+chr(39)+'Plan inputs'+chr(39)+'!C82),0,1)','0','The prototype: !asmMine("inv")'),
     ('H_InvG','Investment growth after charges, before tax','=ROUND(Set_invGross-Set_fundChg,3)','0.0%','Settings: growth before fees less charges'),
     ('H_Persons','People who own the assets (CGT exemptions)','=IF(AND(F_Partner=1,In_assetsJoint="Yes"),2,1)','0',''),
     ('H_Sh','Share of new spare money that is invested','=AS_InvShare','0%',''),
     ('H_Inv0','Investments today','=F_Invest','#,##0',''),
     ('H_InvB0','What you paid for the investments','=IF(Has_invCost=1,In_invCost,IF(H_Direct=1,F_Invest*(1-H_GainSh),F_Invest))','#,##0','Blank cost: bought at today\'s value (a share of it is gain for shares held directly)'),
     ('H_InvA0','Years already on the 8-year clock','=IF(H_Direct=1,0,MOD(MAX(0,INT(IF(Has_invYears=1,In_invYears,0))),H_Deemed))','0',''),
     ('H_Oth0','Other assets today','=In_otherAssets','#,##0',''),('H_OthB0','What you paid for other assets','=IF(Has_othCost=1,In_othCost,In_otherAssets*(1-H_GainSh))','#,##0',''),
     ('H_Alt0','Alternative investments today','=In_altInv','#,##0',''),('H_AltB0','What you paid for alternative investments','=IF(Has_altCost=1,In_altCost,In_altInv*(1-H_GainSh))','#,##0',''),
     ('H_CapLoss','Capital losses you can use','=In_capLoss','#,##0',''),('H_Sav0','Savings accounts today','=In_savings','#,##0','')]
    PR0=101
    ws.cell(PR0-1,2,'PARAMETERS').font=BOLD
    for i,(nm,lab,val,fmt,note) in enumerate(prm):
        rr=PR0+i; ws.cell(rr,2,lab); c=ws.cell(rr,3,val); c.fill=PLN; c.number_format=fmt; ws.cell(rr,4,note).font=GREYF; cellname(wb,nm,ws,f'C{rr}')
    cells={}
    def put(key,r,v,off=0): cells[(r,cols[key]+off)]=v
    for r in range(R7,R0+NR):
        t=r-8; pre=(r==R7); p=r-1
        put('t',r,t); put('act',r,1 if pre else f"='Plan cashflow'!C{r}")
        put('age',r,'=F_Age' if pre else f"='Plan cashflow'!D{r}")
        put('yr',r,'=AS_Year0' if pre else f'=AS_Year0+{t}'); put('infl',r,1 if pre else f"='Plan cashflow'!{cf['infl']}{r}")
        put('rate',r,f'=IF(MAX(TODAY(),DATE({C("yr",r)},1,1))>=H_CGTfrom,H_CGT1,H_CGT0)')
        put('left0',r,'=H_Exempt*H_Persons')
        put('loss0',r,'=H_CapLoss' if pre else '='+C('lsA',p))
        put('cashS',r,f"='Plan goals'!{pg['cashAfterBuf']}" if pre else '='+C('cashE',p))
        put('savS',r,'=H_Sav0' if pre else '='+C('savE',p))
        if pre:
            for k in ('polIn','downIn','lsN','aCash','aInv'): put(k,r,0)
        else:
            put('polIn',r,f'=IF(AND(In_polLump>0,In_polLumpAge>0,{C("age",r)}=In_polLumpAge),In_polLump,0)')
            put('downIn',r,f"=IF(AND(In_homeUse=\"Yes, I'd downsize\",In_downAge>0,{C('age',r)}=In_downAge,OR(In_home=\"Own outright\",In_home=\"Own with mortgage\"),In_homeValue>0),MAX(0,MAX(0,In_homeValue-In_downValue)*{C('infl',r)}*0.9-'Plan cashflow'!{cf['mbE']}{p}),0)")
            put('lsN',r,f"='Plan pay & tax'!Y{r+226}")
            put('aCash',r,f'={C("polIn",r)}+{C("downIn",r)}+(1-H_Sh)*{C("lsN",r)}'); put('aInv',r,f'=H_Sh*{C("lsN",r)}')
        if pre: put('freed',r,0)
        else: put('freed',r,f"='Plan cashflow'!{cf['potFreed']}{r}")
        put('fCash',r,f'=(1-H_Sh)*{C("freed",r)}'); put('fInv',r,f'=H_Sh*{C("freed",r)}')
        put('easyAvail',r,f'={C("cashS",r)}+{C("savS",r)}+{C("aCash",r)}'); put('easyAvailC',r,f'={C("easyAvail",r)}+{C("fCash",r)}')
        for j in range(NL):
            created=(j-1==t) and not pre
            notyet=(j>=1) and (j-1>t or pre)
            Lf_cap = L('cl',j-1,r) if j>0 else C('left0',r); Ls_cap = L('cs',j-1,r) if j>0 else C('loss0',r)
            Lf_act = L('lf',j-1,r) if j>0 else C('left0',r); Ls_act = L('ls',j-1,r) if j>0 else C('loss0',r)
            if notyet:
                for k in ('gf','cn','nt','x','vg','bg','ve','be','ae','dt'): put(k,r,0,j)
                put('cl',r,'='+Lf_cap,j); put('cs',r,'='+Ls_cap,j); put('lf',r,'='+Lf_act,j); put('ls',r,'='+Ls_act,j)
                continue
            if j==0: Vs=('H_Inv0' if pre else L('ve',0,p)); Bs=('H_InvB0' if pre else L('be',0,p)); As=('H_InvA0' if pre else L('ae',0,p))
            elif created: Vs=f'({C("aInv",r)}+{C("fInv",r)})'; Bs=Vs; As='0'
            else: Vs=L('ve',j,p); Bs=L('be',j,p); As=L('ae',j,p)
            gf=L('gf',j,r); put('gf',r,f'=IF({Vs}>0,({Vs}-{Bs})/{Vs},0)',j)
            rate=C('rate',r)
            capdir=f'IF({Vs}<=0,0,IF({gf}<=0,{Vs},{Vs}-{rate}*MAX(0,{gf}*{Vs}-({Lf_cap}+{Ls_cap}))))'
            put('cn',r,f'=IF(H_Direct=1,{capdir},{Vs}*(1-MAX(0,{gf})*H_Exit))',j)
            usedc=f'MIN({gf}*{Vs},{Lf_cap}+{Ls_cap})'
            put('cl',r,f'=IF(AND(H_Direct=1,{gf}>0),MAX(0,{Lf_cap}-({usedc}-MIN({usedc},{Ls_cap}))),{Lf_cap})',j)
            put('cs',r,f'=IF(H_Direct=1,IF({gf}<=0,{Ls_cap}-{gf}*{Vs},{Ls_cap}-MIN({usedc},{Ls_cap})),{Ls_cap})',j)
            needj=f'MAX(0,{C("takeR",r)})' if j==0 else f'MAX(0,{C("takeR",r)}-SUM({L("nt",0,r)}:{L("nt",j-1,r)}))'
            shj=f'({Lf_act}+{Ls_act})'
            dirnet=f'IF({Vs}<=0,0,IF({gf}<=0,MIN({needj},{Vs}),MIN({needj},{Vs}-{rate}*MAX(0,{gf}*{Vs}-{shj}))))'
            nt=L('nt',j,r); x=L('x',j,r)
            put('nt',r,f'=IF(H_Direct=1,{dirnet},MIN({L("cn",j,r)},{needj}))',j)
            put('x',r,f'=IF({Vs}<=0,0,IF(H_Direct=1,IF({gf}<=0,{nt},IF({nt}<={shj}/{gf},{nt},({nt}-{rate}*{shj})/(1-{rate}*{gf}))),{nt}/(1-MAX(0,{gf})*H_Exit)))',j)
            used=f'MIN({gf}*{x},{shj})'
            put('lf',r,f'=IF(AND(H_Direct=1,{gf}>0),MAX(0,{Lf_act}-({used}-MIN({used},{Ls_act}))),{Lf_act})',j)
            put('ls',r,f'=IF(H_Direct=1,IF({gf}<=0,{Ls_act}-{gf}*{x},{Ls_act}-MIN({used},{Ls_act})),{Ls_act})',j)
            Bsold=f'IF({Vs}>0,{Bs}-{Bs}*{x}/{Vs},0)'
            if pre:
                put('vg',r,f'={Vs}-{x}',j); put('bg',r,f'={Bsold}',j); put('ve',r,f'={L("vg",j,r)}',j); put('be',r,f'={L("bg",j,r)}',j); put('ae',r,f'={As}',j); put('dt',r,0,j)
            else:
                add=C('postInv',r) if created else '0'
                put('vg',r,f'=({Vs}-{x}+{add})*(1+{C("invG",r)})',j); put('bg',r,f'={Bsold}+{add}',j)
                hit=f'AND(H_Direct=0,H_TaxEvt=1,{As}+1>=H_Deemed)'
                put('dt',r,f'=IF({hit},MAX(0,{L("vg",j,r)}-{L("bg",j,r)})*H_Exit,0)',j)
                put('ve',r,f'={L("vg",j,r)}-{L("dt",j,r)}',j)
                put('be',r,f'=IF({hit},{L("ve",j,r)},{L("bg",j,r)})',j)
                put('ae',r,f'=IF(AND(H_Direct=0,H_TaxEvt=1),IF({As}+1>=H_Deemed,0,{As}+1),{As})',j)
        put('invG',r,'=IF(H_TaxEvt=1,H_InvG,AS_Inv)')
        put('capInv',r,f'=SUM({L("cn",0,r)}:{L("cn",NL-1,r)})')
        put('capL0',r,'='+L('cl',NL-1,r)); put('capS0',r,'='+L('cs',NL-1,r))
        vo='H_Oth0' if pre else C('othE',p); bo='H_OthB0' if pre else C('othBE',p)
        va='H_Alt0' if pre else C('altE',p); ba='H_AltB0' if pre else C('altBE',p)
        put('vo',r,'='+vo); put('bo',r,'='+bo); put('va',r,'='+va); put('ba',r,'='+ba)
        rate=C('rate',r); VO=C('vo',r); BO=C('bo',r); VA=C('va',r); BA=C('ba',r)
        put('goG',r,f'=IF({VO}>0,({VO}-{BO})/{VO},0)'); put('gaG',r,f'=IF({VA}>0,({VA}-{BA})/{VA},0)')
        goG=C('goG',r); gaG=C('gaG',r)
        Lc,Sc=C('capL0',r),C('capS0',r)
        put('capOth',r,f'=IF({VO}<=0,0,IF({goG}<=0,{VO},{VO}-{rate}*MAX(0,{goG}*{VO}-({Lc}+{Sc}))))')
        usedO=f'MIN({goG}*{VO},{Lc}+{Sc})'
        put('capOthL',r,f'=IF({goG}>0,MAX(0,{Lc}-({usedO}-MIN({usedO},{Sc}))),{Lc})'); put('capOthS',r,f'=IF({goG}<=0,{Sc}-{goG}*{VO},{Sc}-MIN({usedO},{Sc}))')
        Lc2,Sc2=C('capOthL',r),C('capOthS',r)
        put('capAlt',r,f'=IF({VA}<=0,0,IF({gaG}<=0,{VA},{VA}-{rate}*MAX(0,{gaG}*{VA}-({Lc2}+{Sc2}))))')
        put('avail',r,f'={C("easyAvail",r)}+{C("capInv",r)}-{C("fInv",r)}+{C("capOth",r)}+{C("capAlt",r)}')
        if pre:
            put('take',r,f"='Plan goals'!{pg['preTakeE']}+'Plan goals'!{pg['preTakeR']}"); put('takeE',r,f"='Plan goals'!{pg['preTakeE']}"); put('takeR',r,f"='Plan goals'!{pg['preTakeR']}")
        else:
            put('take',r,f"='Plan cashflow'!{cf['potTake']}{r}"); put('takeE',r,f'=MIN({C("take",r)},{C("easyAvailC",r)})'); put('takeR',r,f'={C("take",r)}-{C("takeE",r)}')
        put('cashT',r,f'=MIN({C("takeE",r)},{C("cashS",r)}+{C("aCash",r)}+{C("fCash",r)})'); put('savT',r,f'={C("takeE",r)}-{C("cashT",r)}')
        put('cashA',r,f'={C("cashS",r)}+{C("aCash",r)}+{C("fCash",r)}-{C("cashT",r)}'); put('savA',r,f'={C("savS",r)}-{C("savT",r)}')
        put('netInv',r,f'=SUM({L("nt",0,r)}:{L("nt",NL-1,r)})'); put('xInv',r,f'=SUM({L("x",0,r)}:{L("x",NL-1,r)})')
        put('needO',r,f'=MAX(0,{C("takeR",r)}-{C("netInv",r)})')
        Lf,Ls=L('lf',NL-1,r),L('ls',NL-1,r)
        put('netO',r,f'=IF({VO}<=0,0,IF({goG}<=0,MIN({C("needO",r)},{VO}),MIN({C("needO",r)},{VO}-{rate}*MAX(0,{goG}*{VO}-({Lf}+{Ls})))))')
        NO=C('netO',r); shO=f'({Lf}+{Ls})'
        put('xO',r,f'=IF({VO}<=0,0,IF({goG}<=0,{NO},IF({NO}<={shO}/{goG},{NO},({NO}-{rate}*{shO})/(1-{rate}*{goG}))))')
        XO=C('xO',r); usedo=f'MIN({goG}*{XO},{shO})'
        put('loO',r,f'=IF({goG}>0,MAX(0,{Lf}-({usedo}-MIN({usedo},{Ls}))),{Lf})'); put('lsO',r,f'=IF({goG}<=0,{Ls}-{goG}*{XO},{Ls}-MIN({usedo},{Ls}))')
        put('needA',r,f'=MAX(0,{C("needO",r)}-{NO})')
        LfO,LsO=C('loO',r),C('lsO',r)
        put('netA',r,f'=IF({VA}<=0,0,IF({gaG}<=0,MIN({C("needA",r)},{VA}),MIN({C("needA",r)},{VA}-{rate}*MAX(0,{gaG}*{VA}-({LfO}+{LsO})))))')
        NA=C('netA',r); shA=f'({LfO}+{LsO})'
        put('xA',r,f'=IF({VA}<=0,0,IF({gaG}<=0,{NA},IF({NA}<={shA}/{gaG},{NA},({NA}-{rate}*{shA})/(1-{rate}*{gaG}))))')
        XA=C('xA',r); usedA=f'MIN({gaG}*{XA},{shA})'
        put('loA',r,f'=IF({gaG}>0,MAX(0,{LfO}-({usedA}-MIN({usedA},{LsO}))),{LfO})'); put('lsA',r,f'=IF({gaG}<=0,{LsO}-{gaG}*{XA},{LsO}-MIN({usedA},{LsO}))')
        put('addPost',r,0 if pre else f"='Plan cashflow'!{cf['potAdd']}{r}")
        put('postCash',r,f'=(1-H_Sh)*{C("addPost",r)}'); put('postInv',r,f'=H_Sh*{C("addPost",r)}')
        g=('' if pre else '*(1+AS_Cash)')
        put('cashE',r,f'=({C("cashA",r)}+{C("postCash",r)}){g}'); put('savE',r,f'={C("savA",r)}{g}')
        put('invE',r,f'=SUM({L("ve",0,r)}:{L("ve",NL-1,r)})')
        put('othE',r,f'=({VO}-{XO})'+('' if pre else '*(1+AS_Infl)')); put('othBE',r,f'=IF({VO}>0,{BO}-{BO}*{XO}/{VO},0)')
        put('altE',r,f'=({VA}-{XA})'+('' if pre else f'*(1+{C("invG",r)})')); put('altBE',r,f'=IF({VA}>0,{BA}-{BA}*{XA}/{VA},0)')
        put('wTot',r,f'={C("cashE",r)}+{C("savE",r)}+{C("invE",r)}+{C("othE",r)}+{C("altE",r)}')
        put('saleTax',r,f'=({C("xInv",r)}-{C("netInv",r)})+({XO}-{NO})+({XA}-{NA})')
        put('deemed',r,f'=SUM({L("dt",0,r)}:{L("dt",NL-1,r)})')
        put('dirt',r,0 if pre else f"=({C('cashA',r)}+{C('postCash',r)}+{C('savA',r)}+MAX(0,'Plan cashflow'!{cf['buf3']}{r})+IF(Slot1_Rate=AS_Cash,'Plan cashflow'!{cf['s1_pE']}{r}/(1+AS_Cash),0)+IF(Slot2_Rate=AS_Cash,'Plan cashflow'!{cf['s2_pE']}{r}/(1+AS_Cash),0)+IF(Slot3_Rate=AS_Cash,'Plan cashflow'!{cf['s3_pE']}{r}/(1+AS_Cash),0)+IF(Slot4_Rate=AS_Cash,'Plan cashflow'!{cf['s4_pE']}{r}/(1+AS_Cash),0)+IF(Slot5_Rate=AS_Cash,'Plan cashflow'!{cf['s5_pE']}{r}/(1+AS_Cash),0)+IF(Slot6_Rate=AS_Cash,'Plan cashflow'!{cf['s6_pE']}{r}/(1+AS_Cash),0)+IF(Slot7_Rate=AS_Cash,'Plan cashflow'!{cf['s7_pE']}{r}/(1+AS_Cash),0)+IF(Slot8_Rate=AS_Cash,'Plan cashflow'!{cf['s8_pE']}{r}/(1+AS_Cash),0)+IF(Slot9_Rate=AS_Cash,'Plan cashflow'!{cf['s9_pE']}{r}/(1+AS_Cash),0)+IF(Slot10_Rate=AS_Cash,'Plan cashflow'!{cf['s10_pE']}{r}/(1+AS_Cash),0)+IF(Slot11_Rate=AS_Cash,'Plan cashflow'!{cf['s11_pE']}{r}/(1+AS_Cash),0)+IF(Slot12_Rate=AS_Cash,'Plan cashflow'!{cf['s12_pE']}{r}/(1+AS_Cash),0)+IF(Slot13_Rate=AS_Cash,'Plan cashflow'!{cf['s13_pE']}{r}/(1+AS_Cash),0)+IF(Slot14_Rate=AS_Cash,'Plan cashflow'!{cf['s14_pE']}{r}/(1+AS_Cash),0)+IF(Slot15_Rate=AS_Cash,'Plan cashflow'!{cf['s15_pE']}{r}/(1+AS_Cash),0)+IF(Slot16_Rate=AS_Cash,'Plan cashflow'!{cf['s16_pE']}{r}/(1+AS_Cash),0)+IF(Slot17_Rate=AS_Cash,'Plan cashflow'!{cf['s17_pE']}{r}/(1+AS_Cash),0)+IF(Slot18_Rate=AS_Cash,'Plan cashflow'!{cf['s18_pE']}{r}/(1+AS_Cash),0)+IF(Slot19_Rate=AS_Cash,'Plan cashflow'!{cf['s19_pE']}{r}/(1+AS_Cash),0)+IF(Slot20_Rate=AS_Cash,'Plan cashflow'!{cf['s20_pE']}{r}/(1+AS_Cash),0))*AS_Cash*H_DIRT/(1-H_DIRT)")
    for i,(k,h,w) in enumerate(order):
        cc=i+2; x=ws.cell(6,cc,h); x.fill=HEAD; x.font=WH; x.alignment=Alignment(wrap_text=True,vertical='top'); ws.column_dimensions[CL(cc)].width=w
    ws.cell(6,1,'row').fill=HEAD; ws.cell(6,1).font=WH; ws.cell(7,1,'today'); ws.row_dimensions[6].height=60
    for (r,c),v in cells.items(): ws.cell(r,c,v)
    for k in ('cashS','savS','cashE','savE','invE','othE','altE','wTot','avail','take','capInv','capOth','capAlt','saleTax','deemed'):
        for r in range(R7,R0+NR): ws.cell(r,cols[k]).number_format='#,##0'
    ws.freeze_panes='E8'
    return ws,{k:CL(v) for k,v in cols.items()}
