const E = require(process.env.ENG || './engine_i.js');
const base = () => ({about:{age:35, partner:false, deps:0}, retireAge:66, ans:{'6':2}, assume:'standard', saveM:null, fin:{work:'Employed', income:50000, costsM:2200, oneOffY:1500, cash:10000, invest:0, pension:30000, pensionM:400, sp:'Expect full', home:'Rent'}, goals:[], gid:1});
function run(name, mod, goals){
  const c = base(); mod(c); E.setS(c); (goals || [['home', 5]]).forEach(([k, yrs, amt]) => { const g = E.mkGoal(k); if (yrs != null) g.age = c.about.age + yrs; if (amt != null) g.amount = amt; c.goals.push(g); });
  if (!c.noRet){ const g = E.mkGoal('retire'); g.amount = 30000; c.goals.push(g); } E.setS(c);
  let P; try { P = E.project(); } catch (e) { console.log(name.padEnd(42), 'CRASH', e.message); return; }
  const bad = P.rows.some(r => Object.values(r).some(v => typeof v === 'number' && !Number.isFinite(v)));
  const sh = P.rows.filter(E.isShort).map(r => r.a), g = c.goals.map(g => g.name.split(' ').pop() + '@' + g.age + ':' + P.pct[g.id] + '%' + (P.goal[g.id] ? '(needs ' + P.goal[g.id].needM + ' / now ' + P.goal[g.id].nowM + ')' : '')).join(' ');
  console.log(name.padEnd(42), (bad ? 'NaN! ' : '') + 'save ' + P.save.saveM + '/' + P.save.surplusM + ' | ' + g + ' | purple ' + (sh.length ? sh[0] + '-' + sh[sh.length - 1] + ' (' + sh.length + ')' : 'none') + ' | minInflow ' + Math.round(Math.min(...P.rows.map(r => r.inflow))));
  return P;
}
run('baseline', c => {});
run('zero income (Not working)', c => { c.fin.work = 'Not working'; });
run('zero income, pensionM 400 still paid', c => { c.fin.income = 0; });
run('huge goal €5m home in 5y', c => {}, [['home', 5, 5000000]]);
run('goal at age+1', c => {}, [['car', 1]]);
run('goal at current age (age+0)', c => {}, [['car', 0]]);
run('goal in the past (age-3)', c => {}, [['car', -3]]);
run('goal after 90 (age 95)', c => {}, [['helpfam', 60]]);
run('goal at 90', c => {}, [['helpfam', 55]]);
run('negative surplus (costs 4,000 on 50k)', c => { c.fin.costsM = 4000; });
run('partner invited, no income yet', c => { c.about.partner = true; c.fin.costsM = 3000; });
run('all sections skipped', c => { c.fin = {}; c.ans = {}; });
run('all skipped, no retirement goal', c => { c.fin = {}; c.ans = {}; c.noRet = true; });
run('already retired: age 70, retireAge 66', c => { c.about.age = 70; c.fin.pension = 300000; });
run('age 80 (max), retire 75', c => { c.about.age = 80; c.retireAge = 75; });
run('no retirement goal', c => { c.noRet = true; });
run('debt 20k, repayments skipped', c => { c.fin.debt = 20000; c.fin.debtPayM = 0; });
run('mortgage, payment below interest', c => { c.fin.home = 'Own with mortgage'; c.fin.mortBal = 300000; c.fin.mortPayM = 500; c.fin.mortYears = 25; });
run('mortgage skipped payment (0)', c => { c.fin.home = 'Own with mortgage'; c.fin.mortBal = 200000; c.fin.mortPayM = 0; c.fin.mortYears = 20; });
run('mortgage-free goal, no mortgage', c => {}, [['mfree', 10]]);
run('saveM custom 2,000 > spare', c => { c.saveM = 2000; });
run('Q6 varies', c => { c.ans = {'6':4}; });
run('8 goals same year', c => {}, [['car',3],['travel',3],['wedding',3],['family',3],['health',3],['other',3],['helpfam',3],['business',3]]);
run('legacy at 85', c => { c.fin.pension = 400000; }, [['legacy']]);
