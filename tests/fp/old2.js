const src = require('fs').readFileSync(__dirname + '/sim.js','utf8').split('const P = [')[0]; eval(src);
const h = require('fs').readFileSync(__dirname + '/harness.js','utf8'); const P = eval('[' + h.split('const P = [')[1].split('];')[0] + ']');
for (const [n,a,u] of P) console.log(n, '| old type', persOld(a), '| old full label', u ? riskOld(a,u,true) : '-', '| old first read', riskOld(a,{u9:3},false));
