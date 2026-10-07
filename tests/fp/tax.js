function netPayOld(g){ if (g <= 0) return 0; const it = Math.max(0, 0.2 * Math.min(g, 44000) + 0.4 * Math.max(0, g - 44000) - 4000); return g - it - 0.04 * g - (g > 18304 ? 0.042 * g : 0); }
const TX = {band:44000, credits:4000, usc:[[12012,.005],[28700,.02],[70044,.03],[Infinity,.08]], uscExempt:13000, prsi:0.0435, prsiWk:352};
function incomeTax(g, cr){ return Math.max(0, 0.2*Math.min(g,TX.band) + 0.4*Math.max(0,g-TX.band) - (cr==null?TX.credits:cr)); }
function usc(g, reduced){ if (g <= TX.uscExempt) return 0; const b = reduced ? [[12012,.005],[Infinity,.02]] : TX.usc; let t=0, lo=0; for (const [hi,r] of b){ t += Math.max(0, Math.min(g,hi)-lo)*r; lo=hi; if (g<=hi) break; } return t; }
function prsi(g){ const wk=g/52; if (wk<=TX.prsiWk) return 0; const cr = wk<=424 ? Math.max(0, 12-(wk-352.01)/6) : 0; return Math.max(0,(wk*TX.prsi-cr)*52); }
function netPay(g){ return g<=0?0: g-incomeTax(g)-usc(g)-prsi(g); }
function netRet(draw, sp, age){ const g=draw+sp; if (g<=0) return 0; const it = age>=65 && g<=18000 ? 0 : incomeTax(g, TX.credits+(age>=65?245:0)); return g-it-usc(draw, age>=70 && g<=60000); }
const relLim = a => a<30?.15:a<40?.2:a<50?.25:a<55?.3:a<60?.35:.4;
function pensionCost(g, E, age){ const Er = Math.min(E, relLim(age)*Math.min(g,115000)); return E - (incomeTax(g) - incomeTax(g - Er)); }
console.log('gross | old net | new net | diff/yr');
for (const g of [15000,25000,35000,45000,60000,80000,100000,150000]) console.log(g, Math.round(netPayOld(g)), Math.round(netPay(g)), Math.round(netPayOld(g)-netPay(g)));
// fiscal drag: €45k today, t=30, wage 2.5%, infl 2%
const t=30, w=Math.pow(1.025,t), i=Math.pow(1.02,t), G=45000*w;
console.log('t=30 nominal gross', Math.round(G), 'old (fixed bands) net in today€', Math.round(netPayOld(G)/i), 'new indexed net in today€', Math.round(netPay(G/i)), 'net today at t=0', Math.round(netPay(45000)));
// pension cost: total contrib 375/m
for (const [g,work,age] of [[45000,'Employed',40],[45000,'Self-employed',40],[100000,'Employed',45],[30000,'Employed',28]]){ const T=375*12, E = T*(work==='Self-employed'?1:0.5); console.log('pension', g, work, 'old cost', 0.3*T, 'new cost', Math.round(pensionCost(g,E,age))); }
// retirement: draw 20k + SP 15564 at 67; old = draw*0.9 + sp
for (const [d,a] of [[0,67],[10000,67],[20000,67],[40000,67],[20000,72]]) console.log('ret draw', d, 'age', a, 'old', Math.round(d*0.9+15564), 'new', Math.round(netRet(d,15564,a)));
