import re, urllib.parse, sys
p = sys.argv[1]; s = open(p, encoding='utf-8').read(); n = {}
def rep(a, b, cnt=1):
    global s
    c = s.count(a)
    if c != cnt: raise SystemExit('count %d != %d for %r' % (c, cnt, a[:80]))
    s = s.replace(a, b)
# 1. LifeMap rebrand: customer-facing strings only (keeps "LifeGoals 2.0" reference notes and deliverables/LifeGoals-Calculators.xlsx file names)
s, k = re.subn(r'LifeGoals(?! 2\.0)(?!-Calculators)', 'LifeMap', s); n['LifeGoals->LifeMap'] = k
rep("a.download = 'lifegoals-meeting.ics'", "a.download = 'lifemap-meeting.ics'")
# 2. Cover D0 (journey-spec §16)
svg = open(sys.argv[2], encoding='utf-8').read()
uri = 'data:image/svg+xml,' + urllib.parse.quote(svg, safe=' =:/,.-()')
rep("  --fh:'Bricolage Grotesque'", "  /* Cover photo slot (journey-spec §16): the ONE place to put the licensed photo, e.g. url(\"data:image/jpeg;base64,...\").\n     Until it is supplied this is a drawn placeholder of a winding road through green hills. */\n  --cover-photo:url(\"" + uri.replace('"', '%22') + "\");\n  --fh:'Bricolage Grotesque'")
css = """/* cover (D0, journey-spec §16): full-bleed photo slot, dark gradient at the bottom so white text stays at 4.5:1 or better */
.cover{position:absolute;inset:0;display:flex;flex-direction:column;color:#fff;background:#24543A}
.cover-photo{position:absolute;inset:0;background:var(--cover-photo) center 30%/cover no-repeat}
.cover-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,37,69,0) 34%,rgba(11,37,69,.6) 50%,rgba(11,37,69,.9) 66%,rgba(11,37,69,.96) 100%)}
.cover .qtop,.cover .qbody{position:relative}
.cover .brand{color:var(--ink)}
.cover .cover-inv{background:rgba(255,255,255,.9);color:var(--ink);border-radius:22px;padding:0 14px}
.cover-body{display:flex;flex-direction:column;padding:12px 22px 28px}.cover-body>:first-child{margin-top:auto}
.cover .cover-body h2{color:#fff;font-size:34px;line-height:1.08;margin:auto 0 10px;text-shadow:0 1px 12px rgba(11,37,69,.45)}
.cover-line{font-size:17.5px;line-height:1.4;margin:0 0 22px;color:#fff}
.cover-body .wbtn{width:100%}
.cover-under{font-size:15px;font-weight:700;line-height:1.4;color:#fff;text-align:center;margin:10px 0 0}
.cover-small{font-size:13px;line-height:1.45;color:#fff;text-align:center;margin:12px 0 0}
.cover .link{color:#fff;font-size:13px;padding:10px 4px;min-height:44px}
@media (max-height:700px){.cover-shade{background:linear-gradient(180deg,rgba(11,37,69,0) 22%,rgba(11,37,69,.66) 40%,rgba(11,37,69,.92) 58%,rgba(11,37,69,.96))}}
@media (max-height:560px){.cover-shade{background:linear-gradient(180deg,rgba(11,37,69,.15),rgba(11,37,69,.82) 34%,rgba(11,37,69,.95))}.cover .qtop{padding-top:14px;padding-right:118px}.cover .cover-body h2{font-size:28px}}
"""
rep("/* question screens */\n", css + "/* question screens */\n")
old_d0 = re.search(r"V\.D0 = \(\) => \(\{id:'D0'.*?\n.*?\n.*?\n.*?Guidance, not advice\.</p></div>'\}\);", s, re.S).group(0)
new_d0 = """V.D0 = () => ({id:'D0', note:'Cover (journey-spec §16). Photo slot: --cover-photo (drawn placeholder until the licensed photo of a winding road through Irish countryside is supplied). No sign-up. Entry source captured silently.', kind:'quiz', html:
  '<div class="cover"><div class="cover-photo" aria-hidden="true"></div><div class="cover-shade" aria-hidden="true"></div>' +
  '<div class="qtop"><div class="brand"><span class="mark"></span>LifeMap</div><span style="flex:1"></span><button class="qback cover-inv" data-a="sheet" data-p="invite">I have an invite</button></div>' +
  '<div class="qbody cover-body"><h2 tabindex="-1">The life you\\'d like, mapped out.</h2><p class="cover-line">A life map that guides you, step by step.</p>' +
  '<button class="wbtn" data-a="go" data-p="D1">Let\\'s start</button><p class="cover-under">An easy tool, built for you.</p>' +
  '<p class="cover-small"><button class="link" data-a="sheet" data-p="whyask">Why we ask</button></p></div></div>'});"""
s = s.replace(old_d0, new_d0)
# 3. Goal tile and the Emergency fund calculator hand-off use the same name
rep("{k:'safety', t:'Build a safety net', e:'🪂'", "{k:'safety', t:'Emergency fund', e:'🪂'")
rep("kind:'safety', name:'Safety net', em:'🪂'", "kind:'safety', name:'Emergency fund', em:'🪂'")
# 4. Discover Q8, road version (scoring, tags and line shapes unchanged)
rep("q:'Pick a forecast for your long-term money.', sub:'Sunny means steady growth. Stormy means bigger ups and downs, with more growth potential.'", "q:'Pick a road for your long-term money.', sub:'A flat road is steady but slower. A hilly road has bigger ups and downs, with more growth potential.'")
rep("{e:'☀️', tag:'Low risk', t:'Calm and steady'", "{e:'🛣️', tag:'Low risk', t:'Flat and steady'")
rep("{e:'🌤️', tag:'Cautious', t:'Mostly sunny'", "{e:'🏞️', tag:'Cautious', t:'Gentle hills'")
rep("{e:'🌦️', tag:'Balanced', t:'Sunshine and showers'", "{e:'⛰️', tag:'Balanced', t:'Hills and dips'")
rep("{e:'⛈️', tag:'High risk', t:'Stormy, but exciting'", "{e:'🏔️', tag:'High risk', t:'Mountain road, but exciting'")
rep("// Calm · Mostly sunny · Sunshine and showers · Stormy", "// Flat and steady · Gentle hills · Hills and dips · Mountain road")
rep("['D5','Question 4 (forecast)'", "['D5','Question 4 (road)'")
open(p, 'w', encoding='utf-8').write(s); print(n)
