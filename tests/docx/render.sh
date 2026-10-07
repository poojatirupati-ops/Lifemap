set -e
D=/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/docx
cd $D && node build.js
cp /home/user/lifegoals-prototype/deliverables/LifeGoals-Calculators-UIUX-Spec.docx pdf/spec.docx
cd pdf && timeout 600 python /root/.claude/skills/synced/849805a0-1896-4a49-87bc-2f01ccbb7dae_a4e27067-8324-46de-8d01-0f71917b608e/docx/scripts/office/soffice.py --headless --convert-to pdf spec.docx >/dev/null 2>&1
pdftotext -layout spec.pdf spec.txt
cd $D && node -e "
const fs=require('fs'); const pages=fs.readFileSync('pdf/spec.txt','utf8').split('\f'); const h=JSON.parse(fs.readFileSync('h1.json','utf8')); const toc={};
const norm=s=>s.replace(/\s+/g,' ').trim();
h.forEach(t=>{ for(let i=1;i<pages.length;i++){ const first=norm((pages[i].split('\n').filter(l=>l.trim())[1]||'')); if(first.startsWith(norm(t))){ toc[t]=i+1; break; } } if(!toc[t]) console.log('NOT FOUND',t); });
fs.writeFileSync('toc.json',JSON.stringify(toc,null,1)); console.log('pages',pages.length-1);"
