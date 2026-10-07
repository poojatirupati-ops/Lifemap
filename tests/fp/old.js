const src = require('fs').readFileSync(__dirname + '/sim.js','utf8').split('const P = [')[0];
eval(src);
console.log('Stormy + sell, strong finances ->', riskOld({'6':3,'7':0,'8':3,'9':0}, {u9:3,u10:2,u12:3}, true), '| new', riskNew({'6':3,'7':0,'8':3,'9':0}, {u9:3,u10:2,u11:2,u12:3}).label);
console.log('Stormy + hold, fall would cut essentials ->', riskOld({'6':3,'7':0,'8':3,'9':2}, {u9:3,u10:0,u12:3}, true), '| new', riskNew({'6':3,'7':0,'8':3,'9':2}, {u9:3,u10:0,u11:2,u12:3}).label);
console.log('All Discover skipped except Q6,Q7 -> old uses want=2 comp=2 default:', riskOld({'6':1,'7':0}, {u9:3}, false));
