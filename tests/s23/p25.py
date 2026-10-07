import sys,subprocess,re,base64
f=sys.argv[1]; s=open(f).read(); M='/home/user/lifegoals-prototype/media/'
def rp(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:90]); s=s.replace(a,b)
PH={'mortgage':('house-for-sale','50% 22%'),'pension':('retired-reading','56% 30%'),'investing':('team-with-charts','50% 40%'),'savings':('money-plant','50% 18%'),'everyday':('car-and-calculator','40% 62%')}
for k,(fn,pos) in PH.items():
    b=base64.b64encode(open(M+fn+'.jpg','rb').read()).decode()
    m=re.search(r'\n  --art-'+k+r':url\("[^\n]*\);',s); assert m,k
    s=s[:m.start()]+'\n  --art-'+k+':url("data:image/jpeg;base64,'+b+'");'+s[m.end():]
rp("  /* Focus on one area: the art slots (journey-spec §21). Replace any of these with a licensed or generated picture. */","  /* Focus on one area: the art slots (journey-spec §21, §25). Five hold Pooja's photos (media/*.jpg as data URIs); Protection keeps its drawn shield. Replace any one with another picture. */")
rp(".ttile .art{position:absolute;inset:0;background:var(--art) center/cover no-repeat;z-index:-3}",".ttile .art{position:absolute;inset:0;background:var(--art) var(--pos,center)/cover no-repeat;z-index:-3}.ttile.ph .art{animation:kenb 24s ease-in-out infinite alternate}@keyframes kenb{from{transform:scale(1)}to{transform:scale(1.07)}}")
# topicTile
i=s.index("function topicTile(t){"); j=s.index("\n",i)
line=s[i:j]
assert 'class=\\"ttile\\"' in line or "class=\"ttile\"" in line
new=line.replace("'<button class=\"ttile\" data-a=\"topic\" data-p=\"' + t[1] + '\" style=\"--art:var(--art-' + k + ')\">","'<button class=\"ttile' + (TOPIC_PHOTO[k] ? ' ph' : '') + '\" data-a=\"topic\" data-p=\"' + t[1] + '\" style=\"--art:var(--art-' + k + ')' + (TOPIC_PHOTO[k] ? ';--pos:' + TOPIC_PHOTO[k] + ';--fx:none' : '') + '\">")
assert new!=line
s=s[:i]+"const TOPIC_PHOTO = {mortgage:'50% 22%', pension:'56% 30%', investing:'50% 40%', savings:'50% 18%', everyday:'40% 62%'};   // §25: object-position per photo; Protection has no photo (drawn shield)\n"+new+s[j:]
# videos
rp("const VIDEOS = [\n","const VIDEOS = [\n  {id:'v7', t:'What is auto-enrolment?', mins:2, dur:'1:14', kind:'pension', who:'LifeMap · Pensions explainer', tool:'retirement', src:'media/auto-enrolment-explained.mp4', poster:'media/money-plant.jpg', art:'savings', cc:'Auto-enrolment: how the workplace pension scheme works.'},\n  {id:'v8', t:'Your retirement plan: how it works', mins:2, dur:'1:22', kind:'pension', who:'LifeMap · Pensions explainer', tool:'retirement', src:'media/retirement-plan-how-it-works.mp4', poster:'media/retired-reading.jpg', art:'pension', cc:'How your retirement plan works, step by step.'},\n")
rp("function vThumb(v, grid){ return '<button class=\"vthumb\" style=\"' + (grid ? 'min-height:150px' : 'flex-shrink:0;width:172px;min-height:150px') + '\" data-a=\"video\" data-p=\"' + v.id + '\"><span class=\"play\" aria-hidden=\"true\">▶</span><span class=\"len\">' + v.mins + ' min</span>",
 "function vThumb(v, grid){ return '<button class=\"vthumb' + (v.art ? ' vph' : '') + '\" style=\"' + (grid ? 'min-height:150px' : 'flex-shrink:0;width:172px;min-height:150px') + (v.art ? ';--vart:var(--art-' + v.art + ')' : '') + '\" data-a=\"video\" data-p=\"' + v.id + '\"><span class=\"play\" aria-hidden=\"true\">▶</span><span class=\"len\">' + (v.dur || v.mins + ' min') + '</span>")
rp("'<button class=\"vthumb\" style=\"width:100%;min-height:180px\" data-a=\"video\" data-p=\"' + f.id + '\"><span class=\"play\" aria-hidden=\"true\">▶</span><span class=\"len\">' + f.mins + ' min</span>","'<button class=\"vthumb' + (f.art ? ' vph' : '') + '\" style=\"width:100%;min-height:180px' + (f.art ? ';--vart:var(--art-' + f.art + ')' : '') + '\" data-a=\"video\" data-p=\"' + f.id + '\"><span class=\"play\" aria-hidden=\"true\">▶</span><span class=\"len\">' + (f.dur || f.mins + ' min') + '</span>")
rp(".vthumb::before{",".vthumb.vph{background:linear-gradient(180deg,rgba(11,37,69,.12) 0%,rgba(11,37,69,.86) 62%,rgba(11,37,69,.96) 100%),var(--vart) center 30%/cover no-repeat}.vthumb.vph::before{display:none}\n.vthumb::before{")
# player
old="html:'<div class=\"player' + (S.play ? ' on' : '') + '\"><button class=\"play\" data-a=\"vplay\" aria-label=\"' + (S.play ? 'Pause' : 'Play') + '\">' + (S.play ? '❚❚' : '▶') + '</button>' + (S.play ? '<div class=\"cc\">' + esc(v.cc) + '</div>' : '') + '<div class=\"ctl\" aria-hidden=\"true\"><span>' + (S.play ? '0:14' : '0:00') + '</span><span class=\"tr\"><i></i></span><span>' + v.mins + ':00</span><span>CC</span><span>1×</span></div></div>' +"
assert old in s
new="html:(v.src ? videoReal(v) : '<div class=\"player' + (S.play ? ' on' : '') + '\"><button class=\"play\" data-a=\"vplay\" aria-label=\"' + (S.play ? 'Pause' : 'Play') + '\">' + (S.play ? '❚❚' : '▶') + '</button>' + (S.play ? '<div class=\"cc\">' + esc(v.cc) + '</div>' : '') + '<div class=\"ctl\" aria-hidden=\"true\"><span>' + (S.play ? '0:14' : '0:00') + '</span><span class=\"tr\"><i></i></span><span>' + v.mins + ':00</span><span>CC</span><span>1×</span></div></div>') +"
s=s.replace(old,new)
rp("<div class=\"small\">' + esc(v.who) + ' · ' + v.mins + ' min · ' + VKIND[v.kind] + '</div>' +","<div class=\"small\">' + esc(v.who) + ' · ' + (v.dur || v.mins + ' min') + ' · ' + VKIND[v.kind] + '</div>' +")
rp("   '<details class=\"card\" style=\"margin-top:12px\"><summary style=\"font-weight:800;cursor:pointer;min-height:32px\">Transcript</summary>","   (v.src ? '<p class=\"small\" id=\"vid-cap\" style=\"margin:12px 0 0\"><b>Captions not available yet.</b> A transcript will be added. If you can\\'t listen, talk to an expert or try the calculator above.</p>' : '<details class=\"card\" style=\"margin-top:12px\"><summary style=\"font-weight:800;cursor:pointer;min-height:32px\">Transcript</summary>")
rp("[Full transcript appears here.]</p></details>' +","[Full transcript appears here.]</p></details>') +")
# helper
rp("V.VID = id => {","""/* §25: the two real videos (MP4, H.264 + AAC) are loaded from media/ by relative path, never embedded. Native controls (play/pause, seek, volume, full screen) are keyboard accessible.
   There are no captions for these files yet: the page says so. If the file can't load or play, a clear message replaces the blank player (with Try again). */
const VID_FAIL = 'This video can\\'t play right now. Check your connection, or that the media folder is next to this page, then try again.';
function videoReal(v){ return '<div class="player real" data-vwrap="' + v.id + '"><video id="vid-el" data-vid="' + v.id + '" controls preload="metadata" playsinline poster="' + esc(v.poster) + '" src="' + esc(v.src) + '" aria-label="' + esc(v.t) + '" aria-describedby="vid-cap"></video>' +
  '<div class="vfail" id="vid-fail" role="alert" hidden><b>' + VID_FAIL + '</b><button class="btn sm" data-a="vretry" data-p="' + v.id + '" style="margin-top:8px">Try again</button></div></div>'; }
document.addEventListener('error', e => { const el = e.target; if (!el || el.tagName !== 'VIDEO' || !el.dataset.vid) return; el.hidden = true; const f = document.getElementById('vid-fail'); if (f) f.hidden = false; }, true);
V.VID = id => {""")
rp("  vplay:() => {","  vretry:() => { const el = document.getElementById('vid-el'), f = document.getElementById('vid-fail'); if (!el) return; el.hidden = false; if (f) f.hidden = true; el.load(); },\n  vplay:() => {")
rp(".vthumb::before{content",".player.real{background:#000;border-radius:18px;overflow:hidden;position:relative;aspect-ratio:auto}.player.real video{display:block;width:100%;max-height:60vh;background:#000}.vfail{background:var(--ink);color:#fff;padding:18px 16px;min-height:160px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center}.vfail[hidden],.player.real video[hidden]{display:none}\n.vthumb::before{content") if ".vthumb::before{content" in s else None
open(f,'w').write(s)
m=re.findall(r'<script>(.*?)</script>',s,re.S)[-1]
open('/tmp/_chk.js','w').write(m)
print(subprocess.run(['node','--check','/tmp/_chk.js'],capture_output=True,text=True).stderr[:800] or 'syntax ok')
