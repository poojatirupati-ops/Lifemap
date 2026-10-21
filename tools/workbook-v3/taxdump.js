// dumps, per scenario, the app's yearly tax events and pot balances (nominal)
const { chromium } = require('playwright'); const fs=require('fs'); const C='/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/c26/';
const { PAGE_FNS } = require(C+'tools/plan-vs-xlsx/oracle_lib.js');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();await p.goto('file://'+C+'LifeGoals-Customer-Journey-Prototype.html');await p.waitForTimeout(300);await p.evaluate(PAGE_FNS+';1');
const list=JSON.parse(fs.readFileSync(process.argv[2])); const out={};
for(const s of list){ const sc=s.sc||s; if(sc.fill) continue;
 out[sc.name]=await p.evaluate(sc=>{applyScenario(sc);const P=project(S.wi);return P.rows.map(x=>({exitDeemed:x.exitDeemed,taxOnSales:x.taxOnSales,dirt:x.cf.dirt,lumpTax:x.cf.lumpTax,sft:x.cf.sft,cash:x.cf.bal.cash,sav:x.cf.bal.sav,inv:x.cf.bal.inv,oth:x.cf.bal.oth,alt:x.cf.bal.alt,sold:x.cf.sold}))},sc);}
fs.writeFileSync(process.argv[3],JSON.stringify(out));console.log('wrote',Object.keys(out).length);await b.close()})();
