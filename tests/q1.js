const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file:///home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html');
console.log(JSON.stringify(await p.evaluate(()=>{S=fresh();applyAssume();return {m:asmV('mortRate'),AS:AS.mortRate,c:AS.cardRate,l:AS.loanRate,dep:asmV('depEarn')}})));
console.log(JSON.stringify(await p.evaluate(()=>{loadSample();render();const P=project();return {pct:S.goals.map(g=>P.pct[g.id]),mort:AS.mortRate}})));await b.close()})()
