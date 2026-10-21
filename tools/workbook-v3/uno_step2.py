import uno, time, sys, json
from com.sun.star.beans import PropertyValue
def pv(n,v): p=PropertyValue(); p.Name=n; p.Value=v; return p
L=json.load(open('/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/wb3/letters.json')); hc=L['hc']
ctx=uno.getComponentContext(); res=ctx.ServiceManager.createInstanceWithContext("com.sun.star.bridge.UnoUrlResolver",ctx)
for _ in range(80):
    try: c=res.resolve("uno:socket,host=localhost,port=2002;urp;StarOffice.ComponentContext"); break
    except Exception: time.sleep(0.5)
desk=c.ServiceManager.createInstanceWithContext("com.sun.star.frame.Desktop",c)
src='file://'+sys.argv[1]; out='file://'+sys.argv[2]
doc=desk.loadComponentFromURL(src,"_blank",0,(pv("Hidden",True),))
sh=doc.Sheets.getByName('Plan cashflow')
sh.Columns.insertByIndex(4,1)       # new column E: references everywhere update automatically
sh.getCellRangeByName('E6').setString("TAXES APPLIED THIS YEAR (today's money)")
H="$'Plan holdings'."; P="$'Plan pay & tax'."
for r in range(8,98):
    p=r+226; inf=f"$F{r}"
    def money(x): return f'TEXT(({x})/{inf};"#,##0")'
    f=(f'=IF($C{r}=1;"Income tax "&TEXT(N({P}BK{p});"#,##0")&"; USC "&TEXT(N({P}BM{p})+N({P}BO{p});"#,##0")&"; PRSI "&TEXT(N({P}BP{p})+N({P}BQ{p});"#,##0")'
       f'&IF(N({H}{hc["dirt"]}{r})>=0.5;"; DIRT "&{money(H+hc["dirt"]+str(r))}&" (already taken from the interest earned)";"")'
       f'&IF(N({H}{hc["deemed"]}{r})>=0.5;"; exit tax at an 8-year anniversary "&{money(H+hc["deemed"]+str(r))};"")'
       f'&IF(N({H}{hc["saleTax"]}{r})>=0.5;"; tax on assets sold (exit tax or capital gains tax) "&{money(H+hc["saleTax"]+str(r))};"")'
       f'&IF(N({P}X{p})-N({P}Y{p})>=0.5;"; tax on the pension lump sum "&{money(P+"X"+str(p)+"-"+P+"Y"+str(p))};"")'
       f'&IF(N({P}V{p})>=0.5;"; chargeable excess tax on the pension "&{money(P+"V"+str(p))};"")&".";"")')
    sh.getCellRangeByName('E%d'%r).setFormula(f)
sh.Columns.getByIndex(4).Width=12000
doc.calculateAll()
doc.storeToURL(out,(pv("FilterName","Calc MS Excel 2007 XML"),))
doc.close(True); print('stored')
