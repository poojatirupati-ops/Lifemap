import sys,subprocess,re
f=sys.argv[1]; s=open(f).read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt,(s.count(a),a[:80])
    s=s.replace(a,b)
# A useAllStd
rep("function useAllStd(){ S.asm = Object.assign({}, S.asm); let n = 0;","function useAllStd(keepInfl){ S.asm = Object.assign({}, S.asm); let n = 0;")
rep("  if (!inflSet()){ S.infl = ST.infl; S.inflOther = false; n++; } applyAssume(); return n; }","  if (!keepInfl && !inflSet()){ S.infl = ST.infl; S.inflOther = false; n++; } applyAssume(); return n; }   // keepInfl: step 7 (§22), where inflation is one of the 3 choices only the customer makes\nconst REQ3 = ['infl', 'retireAge', 'planEnd'];   // §22: the only choices that block results\nconst req3Missing = () => planMissing().filter(m => REQ3.includes(m.k));")
rep("  useall:p => { const n = useAllStd();","  useall:p => { const n = useAllStd(p === 'p4');")
rep("focusKey = p === 'p4' ? '#p4-asm h3' : null;","focusKey = p === 'p4' ? '#p4-rest h3' : null;")
# useAllBtn
rep("""const useAllBtn = where => '<button class="btn ghost sm" data-a="useall" data-p="' + where + '">Use the standard for all of these</button>""","""const useAllBtn = where => where === 'p4' ? '<button class="btn sm" data-a="useall" data-p="p4">Use the standards for the rest</button><p class="small" style="margin:4px 0 0">Fills every other choice you haven\\'t made yet with its standard. It never sets your retirement age, inflation or plan-until age: those are yours to choose. You can still change any of them below.</p>' : '<button class="btn ghost sm" data-a="useall" data-p="' + where + '">Use the standard for all of these</button>""")
# p4Asm
i=s.index("function p4Asm(){"); j=s.index("// \"Choose your [item] to see this\"")
new = r'''function p4Asm(){ const ty2 = ASM_KEYS().filter(k => ASM[k].ty === 2 && ASM[k].need()), own = ASM_KEYS().filter(k => ASM[k].own && k !== 'planEnd' && ASM[k].need()),
    rest = ASM_KEYS().filter(k => asmStd(k) && ASM[k].need()), left = rest.filter(k => !asmMine(k)).length, got = 3 - req3Missing().length, extra = ty2.concat(own);
  return '<div class="card" id="p4-asm"><h3 style="margin:0 0 4px;font-size:17px">Choose 3 things</h3><p class="small" style="margin:0 0 6px">Your results need these three. Only you can choose them, so we never fill them in for you.</p><p class="small" style="margin:0 0 12px" role="status" id="p4-count"><b>' + got + ' of 3 chosen</b></p>' +
    '<div id="p4-infl" class="field" style="margin:0 0 14px">' + inflChoice('p4') + '</div>' + retireField() + asmInput('planEnd') + '</div>' +
    '<div class="card" id="p4-rest"><h3 style="margin:0 0 4px;font-size:17px">Everything else</h3><p class="small" style="margin:0 0 10px">' + (left ? left + ' of ' + rest.length + ' other choices not made yet.' : (rest.length ? 'All ' + rest.length + ' other choices made.' : 'No other choices needed.')) + '</p>' + (left ? useAllBtn('p4') : '') +
    (extra.length ? '<div style="margin-top:12px">' + extra.map(k => asmInput(k)).join('') + '</div>' : '') +
    '<details class="asmg" data-g="p4"' + (S.asmOpen === 'p4' ? ' open' : '') + ' style="margin-top:8px"><summary style="cursor:pointer;font-weight:800;min-height:32px">See or change each one</summary><div style="margin-top:10px">' + rest.map(k => asmInput(k)).join('') + '</div></details></div>'; }
// §22: nothing blocks except the 3 choices. Shown above the results when details are missing or need a look; the count is the My money checklist's.
function missingFlags(){ return checkItems().filter(x => ['look', 'miss'].includes(x.st)); }
function detailsBanner(){ const n = missingFlags().length; if (!n) return '';
  return '<div class="nudge" id="miss-banner" role="status"><span aria-hidden="true">ℹ️</span><span>Based on what you\'ve told us. <b>' + n + (n === 1 ? ' detail' : ' details') + ' missing:</b></span><button class="link" data-a="addmiss">' + (n === 1 ? 'Add it' : 'Add them') + '</button></div>'; }
'''
s=s[:i]+new+s[j:]
# P4 view: remove tick, new foot
a=s.index("""    '<div class="card"><label class="check"><input type="checkbox" data-chk="1\"""")
b=s.index("\n",a)
line=s[a:b]
s=s[:a]+"    p4Asm(),"+s[b:]
# reorder: put p4Asm before the checklist: handled below
a=s.index("  foot:(planReady() ? '' : '<p class=\"small\" style=\"margin:0;text-align:center\" id=\"p4-need\">'")
b=s.index("\n",a)
s=s[:a]+"""  foot:(req3Missing().length ? '<p class="small" style="margin:0;text-align:center" id="p4-need">' + esc(chooseTxt(req3Missing()[0]).replace(/ to see this$/, '')) + ' above to see your results.</p>' : '') + '<button class="btn" data-a="toresults" id="seeres"' + (req3Missing().length ? ' disabled' : '') + '>See my results</button><button class="btn ghost" data-a="skipres" id="skipres"' + (req3Missing().length ? ' disabled' : '') + '>Skip, show my results</button>'};"""+s[b:]
rep("  toresults:() => { if (!S.checked || !planReady()) return; toResults(); },","  toresults:() => { if (req3Missing().length) return; S.checked = true; toResults(); },\n  skipres:() => { if (req3Missing().length) return; S.checked = false; toResults(); },\n  addmiss:() => { const f = missingFlags(); if (f.length === 1) return ACT.fix(FSEC.indexOf(f[0].s)); S.tab = 'me'; S.me = 'money'; S.fsec = null; S.sheet = null; render(); },")
rep("  ph.querySelectorAll('[data-chk]').forEach(i => i.addEventListener('change', () => { S.checked = i.checked; document.getElementById('seeres').disabled = !(i.checked && planReady()); }));\n","")
rep("<h3 style=\"font-size:21px\">Your results</h3></div>' + resultsHTML()","<h3 style=\"font-size:21px\">Your results</h3></div>' + detailsBanner() + resultsHTML()")
rep("Required accuracy tick starts unticked.","Step 7 is skippable (§22): choose 3 things, optional standards for the rest, then See my results or Skip.")
rep("</details>' +\n    p4Asm(),","</details>',")
rep("  html:(flag.length ? '<div class=\"card\">' + skipped","  html:p4Asm() + (flag.length ? '<div class=\"card\" style=\"margin-top:12px\">' + skipped")
open(f,'w').write(s)
m=re.search(r'<script>(.*)</script>\s*</body>',s,re.S) or re.search(r'<script>(.*)</script>',s,re.S)
open('/tmp/_chk.js','w').write(re.findall(r'<script>(.*?)</script>',s,re.S)[-1])
print(subprocess.run(['node','--check','/tmp/_chk.js'],capture_output=True,text=True))
