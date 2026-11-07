import uno,sys
from com.sun.star.beans import PropertyValue
ctx=uno.getComponentContext()
r=ctx.ServiceManager.createInstanceWithContext("com.sun.star.bridge.UnoUrlResolver",ctx)
c=r.resolve("uno:socket,host=localhost,port=2002;urp;StarOffice.ComponentContext")
d=c.ServiceManager.createInstanceWithContext("com.sun.star.frame.Desktop",c)
p=PropertyValue();p.Name="Hidden";p.Value=True
doc=d.loadComponentFromURL("file://"+sys.argv[1],"_blank",0,(p,))
doc.calculateAll()
errs=[]
for sh in doc.Sheets:
    cur=sh.createCursor();cur.gotoEndOfUsedArea(False)
    rng=sh.getCellRangeByPosition(0,0,cur.RangeAddress.EndColumn,cur.RangeAddress.EndRow)
    q=rng.queryFormulaCells(4)  # ERROR
    for a in q.RangeAddresses:
        errs.append((sh.Name,a.StartColumn,a.StartRow,a.EndColumn,a.EndRow))
print("errors",errs[:10],len(errs))
S=doc.Sheets
def cell(s,a): return S.getByName(s).getCellRangeByName(a)
pi=S.getByName("Plan inputs")
# find income & Has
nm=doc.NamedRanges
print("names",nm.hasByName("In_income"),nm.getByName("In_income").Content,nm.getByName("Has_income").Content)
cal=[n for n in S.ElementNames if n.startswith("C01")]
print(cal)
sh=S.getByName("C01 Borrowing")
def dump(tag):
    out=[]
    for r in range(1,14):
        out.append((r+1 if False else r, sh.getCellByPosition(1,r).String[:30], sh.getCellByPosition(2,r).String, sh.getCellByPosition(6,r).String))
    print(tag);[print(" ",o) for o in out if o[3] or o[2]]
cell("READ ME","B3").String="Yes"; doc.calculateAll(); dump("Fill=Yes")
cell("READ ME","B3").String="No"; doc.calculateAll(); dump("Fill=No, nothing typed")
cell("Plan inputs","C29").Value=75000; doc.calculateAll(); dump("Fill=No, plan income 75000")
sh.getCellByPosition(2,4).Value=99000 if False else 0
doc.close(True)
