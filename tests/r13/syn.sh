python3 - <<'P'
import re
s=open('/home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html').read()
open('/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/r13/chk.js','w').write(max(re.findall(r'<script>(.*?)</script>',s,re.S),key=len))
P
node --check /tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/r13/chk.js && echo SYNTAX OK
