// Shared state recipes for capture.js and check.js (both drive the live prototype).
const BASES = {
  fresh: () => { S = fresh(); S.shell = true; S.tab = 'explore'; S.xs = []; lastId = null; render(); },
  // every choice made: the standards ("Use the standard for all of these"), plus the choices "use all" never makes
  chosen: () => { S = fresh(); S.shell = true; S.tab = 'explore'; S.xs = []; useAllStd(); S.retireSet = true; Object.assign(S.asm, {planEnd:90, buyFees:3000, depEarn:0.01, mortRate:0.0375, cardRate:0.20, loanRate:0.08, survivor:259.5}); applyAssume(); lastId = null; render(); },
  chosenNoInfl: () => { S = fresh(); S.shell = true; S.tab = 'explore'; S.xs = []; useAllStd(); S.infl = null; S.retireSet = true; Object.assign(S.asm, {planEnd:90, buyFees:3000, depEarn:0.01, mortRate:0.0375, cardRate:0.20, loanRate:0.08, survivor:259.5}); applyAssume(); lastId = null; render(); },
  sample: () => { loadSample(); S.tab = 'explore'; S.xs = []; lastId = null; render(); },
};
const STMT_FOR = { retirement:'retire', contrib:'retire', avc:'retire', lastmoney:'retire', drawdown:'retire', repayment:'home', overpay:'home', ratechange:'home', term:'home', regularinvest:'invest', lumpsum:'invest', realreturn:'invest', fees:'invest', riskreturn:'invest' };
const INFL_ONLY = ['realreturn','compound','retirement','avc','contrib','goalplanner','lastmoney','drawdown'];
const ADJ = ['lumpsum','regularinvest'];
// edge states: values typed into the boxes (or chips tapped) on a base state; crop = result card
const EDGES = {
  borrow:[{t:'Income limit sets the amount; not a first-time buyer', set:{dep:100000, ftb:0}}],
  repayment:[{t:'What-if: rates change by +1%', set:{dr:1}}, {t:'What-if on a stated repayment (sample customer)', base:'sample', set:{dr:1}}, {t:'Statement repayment differs from the formula', base:'stmt:home|pay=1300', set:{}}],
  deposit:[{t:'Deposit already saved', set:{saved:60000}}],
  overpay:[{t:'No extra payment', set:{x:0}}],
  ratechange:[{t:'Rate falls by 1%', set:{d:-1}}],
  term:[{t:'Same term in A and B', set:{a:35}}],
  rentbuy:[{t:'Deposit below 10% of the price', set:{dep:10000}}],
  goalplanner:[{t:'Already saved covers the goal (inflation 2%)', base:'chosen', set:{s:20000}}],
  lumpsum:[{t:'Yearly fees above 0', set:{f:1}}],
  emergency:[{t:'Cushion already covers the target', set:{s:20000}}, {t:'Exactly 1 month covered', set:{s:2500}}],
  retirement:[{t:'What-if: retire later by 2 years (inflation 2%)', base:'chosen', set:{later:2}}, {t:'Retiring before 60 (inflation 2%)', base:'chosen', set:{ra:55}}, {t:'Fund above the Standard Fund Threshold (inflation 2%)', base:'chosen', set:{pot:1500000, m:5000}}],
  lastmoney:[{t:'Money lasts 60+ years (inflation 2%)', base:'chosen', set:{w:1000}}],
  drawdown:[{t:'Money lasts 60+ years (inflation 2%)', base:'chosen', set:{w:1000}}],
  riskreturn:[{t:'Style 3 (Growth)', set:{s:3}}],
  lifecover:[{t:'Existing cover meets the estimate', set:{ex:1500000}}, {t:'Mortgage not covered by mortgage protection', set:{mp:0}}],
  incomegap:[{t:'Illness Benefit covers essential spending', set:{e:1000}}],
  networth:[{t:'Owe more than you own', set:{mort:3000000}}],
  surplus:[{t:'Spending above income', set:{life:5000}}, {t:'Nothing left over', set:{life:1300}}],
  debtpay:[{t:'Payment does not cover the interest', set:{p:50}}, {t:'Payment clears the debt in over 100 years', set:{b:100000, apr:0.5, p:50}}],
  loan:[{t:'1-year loan', set:{y:1}}],
};
module.exports = { BASES, STMT_FOR, INFL_ONLY, ADJ, EDGES };
