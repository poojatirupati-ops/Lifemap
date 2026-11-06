const { chromium } = require('playwright'); const fs=require('fs'); const C='/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/c26/';
const { PAGE_FNS } = require(C+'tools/plan-vs-xlsx/oracle_lib.js');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();await p.goto('file://'+C+'LifeGoals-Customer-Journey-Prototype.html');await p.waitForTimeout(300);await p.evaluate(PAGE_FNS+';1');
const sc=JSON.parse(fs.readFileSync(process.argv[2])).find(s=>s.name===process.argv[3]);const y0=+process.argv[4],y1=+process.argv[5];
const r=await p.evaluate(([sc,y0,y1])=>{applyScenario(sc);const P=project(S.wi);return P.rows.slice(y0,y1+1).map(x=>({t:x.t,a:x.a,inflow:x.inflow,living:x.living,fixed:x.fixed,goalPaid:x.goalPaid,used:x.used,saved:x.saved,spent:x.spent,liquid:x.liquid,short:x.short,bal:x.cf.bal,sold:x.cf.sold,exitDeemed:x.exitDeemed,taxOnSales:x.taxOnSales,dirt:x.cf.dirt,polIn:x.polIn,downIn:x.downIn}))},[sc,y0,y1]);
for(const x of r) console.log(JSON.stringify(x));await b.close()})();
