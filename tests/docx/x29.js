const { open } = require('./lib');
(async () => { const { browser, page } = await open();
const R = await page.evaluate(() => { 
 const run = (id, over, plan) => { if (plan) { loadSample(); S.app = true; } else { S = fresh(); S.shell = true; S.app = false; useAllStd && 0; } S.infl = 0.02; S.retireSet = true; S.retireAge = 66; S.asm = Object.assign({}, S.asm, {planEnd: 90, cardRate: 0.2, loanRate: 0.08, mortRate: 0.0375, fundChg: 0.01, buyFees: 3000, depEarn: 0.01}); applyAssume(); const c = C(id); S.xs = [{v:'CALC', p:id}]; S.calcV = S.calcV || {}; const v = Object.assign({}, calcVals(c), over || {}); try { const r = c.run(v); return {val: r.val, lbl: r.lbl, line: r.line, rows: r.rows}; } catch (e) { return String(e); } };
 const o = {};
 o.c12 = run('retirement', {}, false); o.c12_sft = run('retirement', {pot: 3000000, m: 3000}, false); o.c12_early = run('retirement', {ra: 55}, false); o.c12_age = run('retirement', {ra: 30, age: 38}, false);
 o.c22cap = run('incomegap', {e: 1000, s: 1000000}, false); o.c22 = run('incomegap', {}, false);
 o.c20 = run('riskreturn', {s: 2}, false); o.c20_3 = run('riskreturn', {s: 1, y: 30}, false);
 o.c15big = run('lastmoney', {w: 600000, pot: 400000}, false); o.c15early = run('lastmoney', {age: 55}, false); o.c16big = run('drawdown', {w: 600000, pot: 400000}, false);
 o.c10 = run('lumpsum', {f: 0, r: 0}, false); o.c10b = run('lumpsum', {}, false);
 o.c07 = run('rentbuy', {dep: 600000, price: 300000}, false);
 o.c01 = run('borrow', {}, false); o.c03 = run('deposit', {}, false);
 o.c02 = run('repayment', {}, false); o.c28 = run('loan', {}, false); o.c23 = run('mortgageprotect', {}, false);
 o.c13 = run('contrib', {}, false);
 return o; });
for (const [k,v] of Object.entries(R)) console.log('==',k, JSON.stringify(v,null,0).slice(0,900));
await browser.close()})();
