import sys, json, re, subprocess
sys.path.insert(0,'.')
import art
p=sys.argv[1]; s=open(p,encoding='utf-8').read()
def rep(a,b,cnt=1):
    global s
    c=s.count(a)
    if c!=cnt: raise SystemExit('count %d != %d for %r'%(c,cnt,a[:90]))
    s=s.replace(a,b)
KEYS=[('Mortgages','mortgage'),('Pensions','pension'),('Protection','protection'),('Investing','investing'),('Savings','savings'),('Everyday money','everyday')]
# ---- CSS ----
root=''.join('  --art-%s:%s;\n'%(k,art.uri(art.S[k])) for _,k in KEYS)
css = """/* Experts: specialist boxes (journey-spec §21) */
.goal.spec.sel{box-shadow:0 0 0 2.5px var(--sea-d),0 6px 18px rgba(14,47,51,.08)}.goal.spec .ic{background:var(--sea-l)}
.goal.spec .ck2{display:none;width:22px;height:22px;border-radius:11px;background:var(--sea-d);color:#fff;font-size:12px;font-weight:900;align-items:center;justify-content:center;flex-shrink:0}.goal.spec.sel .ck2{display:flex}.goal.spec.sel .chev{display:none}
/* Explore: Focus on one area, illustrated square tiles (journey-spec §21). Each tile's art is ONE replaceable slot: the custom property --art-{topic} on :root
   (a picture or a data URI). Set --fx:none on a tile to hide the animated overlay when a photo replaces the drawn scene. */
.tgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-bottom:10px}
.tgrid>.ttile:last-child:nth-child(odd){grid-column:1/-1;aspect-ratio:2/1}
.ttile{position:relative;aspect-ratio:1/1;border:0;border-radius:22px;overflow:hidden;padding:0;cursor:pointer;color:#fff;text-align:left;background:var(--ink);box-shadow:0 8px 20px rgba(14,47,51,.14);isolation:isolate;transition:transform .15s,box-shadow .15s;font:inherit}
.ttile:hover{transform:translateY(-2px);box-shadow:0 12px 24px rgba(14,47,51,.2)}.ttile:focus-visible{outline:3px solid var(--ink);outline-offset:3px}
.ttile .art{position:absolute;inset:0;background:var(--art) center/cover no-repeat;z-index:-3}
.ttile .fx{position:absolute;inset:0;width:100%;height:100%;z-index:-2;display:var(--fx,block);pointer-events:none}
.ttile .scrim{position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(11,37,69,0) 22%,rgba(11,37,69,.82) 48%,rgba(11,37,69,.96) 100%)}
.ttile .em{position:absolute;top:10px;left:10px;width:34px;height:34px;border-radius:17px;background:rgba(255,255,255,.92);display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px rgba(11,37,69,.18)}
.ttile .go{position:absolute;top:10px;right:10px;width:30px;height:30px;border-radius:15px;background:rgba(255,255,255,.94);color:var(--ink);display:flex;align-items:center;justify-content:center;font-size:21px;font-weight:800;line-height:1;box-shadow:0 2px 8px rgba(11,37,69,.18)}
.ttile .tx{position:absolute;left:12px;right:10px;bottom:11px}.ttile b{display:block;font-family:var(--fh);font-size:16.5px;line-height:1.12}.ttile .s{display:block;font-size:12px;line-height:1.3;margin-top:3px;font-weight:600}
.fx *{transform-box:fill-box;transform-origin:center}
.fx-cloud{animation:fxdrift 22s linear infinite alternate}.fx-cloud.b{animation-duration:30s;animation-delay:-9s}.fx-cloud.c{animation-duration:26s;animation-delay:-4s}
.fx-glow{opacity:0;animation:fxglow 5s ease-in-out infinite}.fx-glow.d{animation-delay:-2.4s}
.fx-sun{animation:fxsun 14s ease-in-out infinite alternate}.fx-glint{animation:fxglint 3.6s ease-in-out infinite}
.fx-shine{animation:fxshine 4.6s ease-in-out infinite}.fx-ring{opacity:0;animation:fxring 4.6s ease-out infinite}
.fx-draw{stroke-dasharray:100;stroke-dashoffset:100;animation:fxdraw 6s ease-in-out infinite}.fx-dot{animation:fxpulse 3s ease-in-out infinite}
.fx-coin{animation:fxcoin 3.8s ease-in infinite}.fx-star{animation:fxtwinkle 3s ease-in-out infinite}.fx-star.b{animation-delay:-1.4s}
@keyframes fxdrift{from{transform:translateX(-14px)}to{transform:translateX(26px)}}
@keyframes fxglow{0%,100%{opacity:0}45%,60%{opacity:.75}}
@keyframes fxsun{from{transform:translateY(5px)}to{transform:translateY(-5px)}}
@keyframes fxglint{0%,100%{opacity:.25}50%{opacity:1}}
@keyframes fxshine{0%{transform:translateX(0)}60%,100%{transform:translateX(150px)}}
@keyframes fxring{0%{opacity:.7;transform:scale(.8)}100%{opacity:0;transform:scale(1.12)}}
@keyframes fxdraw{0%{stroke-dashoffset:100}55%,85%{stroke-dashoffset:0}100%{stroke-dashoffset:-100}}
@keyframes fxpulse{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.5);opacity:.2}}
@keyframes fxcoin{0%{transform:translateY(-6px);opacity:0}15%{opacity:1}70%{transform:translateY(22px);opacity:1}85%,100%{transform:translateY(26px);opacity:0}}
@keyframes fxtwinkle{0%,100%{opacity:.2;transform:scale(.7)}50%{opacity:1;transform:scale(1.15)}}
"""
rep("/* sheets & toast */\n", css+"/* sheets & toast */\n")
rep("  --fh:'Bricolage Grotesque'", "  /* Focus on one area: the art slots (journey-spec §21). Replace any of these with a licensed or generated picture. */\n"+root+"  --fh:'Bricolage Grotesque'")
# ---- JS: topic tiles ----
fx=art.FX
fxjs=json.dumps({k:'<svg class="fx" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">'+v+'</svg>' for k,v in fx.items()},ensure_ascii=False)
old="""'<div class="sec"><h3>Focus on one area</h3></div>' + TOPICS.map(t => '<button class="goal" data-a="topic" data-p="' + t[1] + '"><span class="ic" aria-hidden="true">' + t[0] + '</span><span style="flex:1"><b>' + t[1] + '</b><br><span class="small">' + t[2] + '</span></span><span class="chev" aria-hidden="true">›</span></button>').join('') +"""
new="""'<div class="sec"><h3>Focus on one area</h3></div><div class="tgrid">' + TOPICS.map(t => topicTile(t)).join('') + '</div>' +"""
rep(old,new)
helper = "/* Focus on one area: illustrated square tiles. The picture is the custom property --art-{key} (see :root); the animated overlay is TOPIC_FX. */\nconst TOPIC_ART = {Mortgages:'mortgage', Pensions:'pension', Protection:'protection', Investing:'investing', Savings:'savings', 'Everyday money':'everyday'};\nconst TOPIC_FX = "+fxjs+";\nfunction topicTile(t){ const k = TOPIC_ART[t[1]]; return '<button class=\"ttile\" data-a=\"topic\" data-p=\"' + t[1] + '\" style=\"--art:var(--art-' + k + ')\"><span class=\"art\" aria-hidden=\"true\"></span>' + TOPIC_FX[k] + '<span class=\"scrim\" aria-hidden=\"true\"></span><span class=\"em\" aria-hidden=\"true\">' + t[0] + '</span><span class=\"go\" aria-hidden=\"true\">›</span><span class=\"tx\"><b>' + t[1] + '</b><span class=\"s\">' + t[2] + '</span></span></button>'; }\n"
rep("const xTop = () =>", helper+"const xTop = () =>")
# ---- Experts: specialist boxes ----
SPEC = "const EXPERT_BLURB = {mortgage:'Buying, switching or paying off a home loan', pension:'Pensions, tax relief and retirement income', protection:'Life cover, income protection, serious illness', investment:'Risk, charges and long-term investing', planner:'Your whole picture: goals, money and plans'}, EXPERT_ICON = {mortgage:'🏡', pension:'🌅', protection:'🛡️', investment:'📈', planner:'🧭'};\n"
spec_fn = "function specBoxes(sp){ return '<div class=\"sec\"><h3>Talk to a specialist</h3></div><div role=\"group\" aria-label=\"Talk to a specialist\">' + Object.entries(EXPERT_FOR).map(([k, x]) => '<button class=\"goal spec' + (sp.key === k ? ' sel' : '') + '\" aria-pressed=\"' + (sp.key === k) + '\" data-a=\"spec\" data-p=\"' + k + '\"><span class=\"ic\" aria-hidden=\"true\">' + EXPERT_ICON[k] + '</span><span style=\"flex:1;min-width:0\"><b>' + x + '</b><br><span class=\"small\">' + EXPERT_BLURB[k] + '</span></span><span class=\"ck2\" aria-hidden=\"true\">✓</span><span class=\"chev\" aria-hidden=\"true\">›</span></button>').join('') + '</div>'; }\n"
rep("V.EXP = () => {", SPEC+spec_fn+"V.EXP = () => {")
i=s.index("  const specRow = '<div class=\"sec\"><h3>Find an expert by topic</h3></div>"); j=s.index("\n",i)
s=s[:i]+"  const specRow = specBoxes(sp);"+s[j:]
# C0: below the card; C1: after the matched card (keeps the flow)
rep("<p class=\"small\">You can choose to share this with your adviser, so you won\\'t repeat yourself. ' + discCount() + ' of your answers are already filled in.</p></div>', foot:","<p class=\"small\">You can choose to share this with your adviser, so you won\\'t repeat yourself. ' + discCount() + ' of your answers are already filled in.</p></div>' + specRow, foot:")
rep("advCard + '<button class=\"link\" data-a=\"advnext\">See another match</button> · <button class=\"link\" data-a=\"toast\"","advCard + '<button class=\"link\" data-a=\"advnext\">See another match</button> · <button class=\"link\" data-a=\"toast\"")
rep("Request a call back</button>', foot:'<button class=\"btn\" data-a=\"exp\" data-p=\"c2\">Choose","Request a call back</button>' + specRow, foot:'<button class=\"btn\" data-a=\"exp\" data-p=\"c2\">Choose")
open(p,'w',encoding='utf-8').write(s)
m=re.search(r'<script>(.*)</script>',s,re.S); open('/tmp/_chk.js','w').write(m.group(1))
print('syntax', subprocess.run(['node','--check','/tmp/_chk.js'],capture_output=True).returncode)
