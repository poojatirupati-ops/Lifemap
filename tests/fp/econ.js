const E = require(process.env.ENG || './engine_i.js'); const {netPay, incomeTax, usc, prsi, netRet, AS} = E;
console.log('gross | tax | USC | PRSI | net | net/gross');
for (const g of [20000, 30000, 45000, 60000, 80000, 100000, 120000, 150000]) console.log(g, Math.round(incomeTax(g)), Math.round(usc(g)), Math.round(prsi(g)), Math.round(netPay(g)), (netPay(g) / g * 100).toFixed(1) + '%');
// self-employed surcharge check
console.log('SE 150k USC engine', Math.round(usc(150000)), 'with 3% surcharge >100k', Math.round(usc(150000) + 0.03 * 50000));
// one-earner married couple
console.log('one-earner couple 80k: engine net', Math.round(netPay(80000)), ' married one-earner (band 53k, credits 6k):', Math.round(80000 - Math.max(0, .2 * 53000 + .4 * 27000 - 6000) - usc(80000) - prsi(80000)));
// retirement draws
const base = {about:{age:55, partner:false, deps:0}, retireAge:60, ans:{'6':2}, assume:'standard', fin:{work:'Employed', income:60000, costsM:2500, cash:10000, invest:0, pension:300000, pensionM:500, sp:'Expect full', home:'Rent'}, goals:[], gid:1};
for (const R of [55, 60, 63, 66, 70]){ const c = JSON.parse(JSON.stringify(base)); c.about.age = Math.min(54, R - 1); c.retireAge = R; E.setS(c); const g = E.mkGoal('retire'); g.amount = 30000; c.goals.push(g); E.setS(c);
  const P = E.project(); const rows = P.rows; const out = [];
  rows.forEach((r, i) => { if (r.retired && i > 0){ const potBefore = rows[i - 1].pen - (r.a === R ? P.LS[0][1] : 0); } });
  // reproduce draw % from pen path: draw = pen_before / (90 - a + 1)
  const a = [61, 66, 71, 80, 89, 90].filter(x => x >= R).map(x => x + ':' + (100 / (AS.end - x + 1)).toFixed(1) + '%');
  const inc = rows.filter(r => r.retired).map(r => Math.round(r.inflow / Math.pow(1 + AS.infl, r.t)));
  console.log('retire', R, 'draw% by age', a.join(' '), '| real retired income first/at66/85/89/90:', inc[0], inc[Math.max(0, 66 - R)], inc[85 - R], inc[89 - R], inc[90 - R], '| SP jump at 66:', inc[Math.max(0,66 - R)] - inc[Math.max(0, 65 - R)]);
}
