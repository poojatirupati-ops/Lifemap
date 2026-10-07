import re,sys
F='/home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'
h=open(F).read()
def rep(old,new,cnt=1):
    global h
    n=h.count(old)
    if n!=cnt: sys.exit('anchor %d x: %s'%(n,old[:90]))
    h=h.replace(old,new)
reg=open('reg.js').read().rstrip('\n')
rep("\n  }\n};\n// RI: plain values", "\n"+reg+"\n// RI: plain values")
rep("const RV_ = (v, src, eff, verify) => ({v, src, eff, verify:verify !== false});", "const RV_ = (v, src, eff, verify, by) => ({v, src, eff, verify:verify !== false, by});   // by = the source as the customer sees it")
a=h.index("const twoSecure = () =>")
e0=h.index("SAVE.noAnswer = +asmV('noAnswer'); }", a)
e=e0+len("SAVE.noAnswer = +asmV('noAnswer'); }")
asm=open('asm.js').read().rstrip('\n')
h=h[:a]+"const pcs = x => +(x * 100).toFixed(2) + '%';\n"+asm+h[e:]
rep("\nconst pcs = x => +(x * 100).toFixed(2) + '%';\nfunction inflChoice","\nfunction inflChoice")
rep("const AS_SETS = {standard:{wage:0.03, cash:0.01, inv:0.035, pen:0.045, penRet:0.0315}, cautious:","const AS_SETS = {standard:{wage:RI.std.wage, cash:RI.std.cash, inv:RI.std.inv, pen:RI.std.pen, penRet:RI.std.penRet}, cautious:")
open(F,'w').write(h)
print('ok')
