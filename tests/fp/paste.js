/* ===== PASTE-READY (replaces personality() and riskRead() in the prototype) ===== */
// Personality weights per option, in option order. 0.5 steps. Q6 (amount) and u9-u13 carry no personality weight.
const PW = {
  '2':  [{A:2}, {B:2}, {E:2}, {C:2}],                       // Sticking to a budget · Checking your balance · Trying something new · Relaxed about money
  '4':  [{E:1}, {A:1}, {B:1}, {B:.5, C:.5}],                // Buy in quickly · Research it · Ask an expert · Stay away
  '7':  [{A:.5}, {}, {}, {C:.5}],                           // Emergency savings · Other savings · Credit/loan · Not sure
  '8':  [{B:.5, C:.5}, {A:.5, B:.5}, {A:.5, E:.5}, {E:1}],  // Calm · Mostly sunny · Sunshine and showers · Stormy
  '9':  [{B:1}, {B:.5}, {A:.5, C:.5}, {E:1}],               // Sell · Wait until back, then sell · Stay calm · Buy more
  '12': [{B:1}, {E:.5}, {A:1}, {C:1}],                      // Worried · Hopeful · Confident · Avoid thinking about it
  u4:   [{A:.5, E:.5}, {A:.5, B:.5}, {B:1}, {C:1}]          // Research myself · Basics then expert · Expert first · Keep it simple
};
const P_ORDER = ['B', 'A', 'C', 'E'];
function personalityScores(){
  const t = {A:0, B:0, E:0, C:0}; let n = 0;
  const add = w => Object.entries(w).forEach(([x, v]) => { t[x] += v; });
  ['2', '4', '7', '8', '9', '12'].forEach(id => { const k = S.ans[id]; if (typeof k === 'number'){ n++; add(PW[id][k]); } });
  if (typeof S.um.a.u4 === 'number') add(PW.u4[S.um.a.u4]);
  return {t, n};
}
function personality(){
  const {t, n} = personalityScores();
  if (n < 4) return null;                                   // never guess a type (CJ E10)
  const top = Math.max(...Object.values(t)), tied = Object.keys(t).filter(x => t[x] === top);
  const from = id => typeof S.ans[id] === 'number' ? Object.keys(PW[id][S.ans[id]]).filter(x => tied.includes(x)) : [];
  const q4 = from('4');
  const k = tied.length === 1 ? tied[0] : (from('2')[0] || (q4.length === 1 ? q4[0] : null) || P_ORDER.find(x => tied.includes(x)));
  return TYPES[k];
}

const RISK_LBL = ['Cautious', 'Cautious–balanced', 'Balanced', 'Balanced–growth', 'Growth'];
const COMFORT = ['Steady', 'Mostly steady', 'Balanced', 'Adventurous'];   // D10 tile: Q8 appetite only, deliberately not the 5 profile labels
const MIS = {
  K16:  'A safety net often comes first: an emergency fund and the right cover. It is a good place to start with an adviser.',
  K14c: "You're open to ups and downs, but your cushion is thin. Many people build a safety net before taking more risk.",
  K14l: "You're open to ups and downs, but a fall would hit everyday life right now. Many people build a safety net before taking more risk.",
  K14t: "You're open to ups and downs, but you'll need this money within 5 years. Money needed soon has less time to recover from a fall.",
  K13:  'You like the idea of growth, but falls may unsettle you. A calmer approach might feel more comfortable. Worth talking through with an adviser.',
  K15:  "Your finances could handle more ups and downs than you'd choose. That's fine. It's worth seeing what playing very safe can cost as prices rise.",
  K17:  "You're comfortable with ups and downs, you can afford them and you have time. A good basis for a growth conversation with an adviser.",
  OK:   'How you feel about risk and what you can afford are broadly in line. A good starting point.'
};
const MIS_ADV = {   // adviser-only (xlsx column M). Never shown to the customer.
  K13: 'Route to a calmer plan than they picked; flag for a call if markets fall.',
  K14c: 'Build the safety net first; explain why risk waits, not that they are wrong.', K14l: 'Build the safety net first; explain why risk waits, not that they are wrong.', K14t: 'Short horizon: explain why risk waits.',
  K15: 'Respect the preference; gently show what over-caution costs over time.',
  K16: 'Protection and emergency fund first; investing conversation comes later.',
  K17: 'Ready for a growth conversation; route to the investment expert.'
};
function riskRead(full){
  const q6 = dsc('6'), q7 = dsc('7'), q8 = dsc('8'), q9 = dsc('9');
  const ix = u => typeof S.um.a[u] === 'number' ? S.um.a[u] : null;           // option index, not score
  const u9 = ix('u9') != null ? ix('u9') : suggestU9(), u10 = ix('u10'), u11 = ix('u11'), u12 = ix('u12');
  const r = {comfort: q8 ? COMFORT[q8 - 1] : null, cushion: q7 == null ? null : q7 === 4 ? 'Strong' : 'Thin',
             want:null, can:null, time:null, level:null, label:null, limit:null, provisional:!full, mis:null, misKey:null, adv:null, keNote:false};
  if (q8 == null || q9 == null) return r;                                   // no made-up profile
  // 1. Willingness (attitude to risk): appetite (Q8), composure (Q9) pulls it down one or more steps (xlsx K13)
  let T = q8 + (q9 === 4 && q8 >= 3 ? 1 : 0);
  T = Math.min(T, q9 === 1 ? 2 : q9 === 2 ? 3 : 5);
  // 2. Capacity for loss: weakest link wins
  let C = 5; const cap = v => { C = Math.min(C, v); };
  if (q7 === 2) cap(3); if (q7 === 1) cap(2);                               // other savings / credit or not sure
  if (full){ if (u10 === 0) cap(2); if (u10 === 1 || u10 === 3) cap(3); if (u12 === 0) cap(2); if (u12 === 1) cap(4); }
  if (S.src.cash && S.src.costsM){ const f = finNums(); if (f.costsM > 0 && f.cash < 3 * f.costsM) cap(3); }   // < 3 months' costs in cash
  // 3. Time horizon cap
  const H = [1, 2, 4, 5][u9];
  // 4. Knowledge & experience cap (provisional read is held at Balanced until u10 + u11 are answered)
  let KE = !full || u11 == null ? 3 : [3, 4, 5, 5][u11];
  const ch = S.um.chips || [];                                              // ESMA: don't rely on self-assessment alone
  if (full && u11 >= 2 && ch.length && ch.every(c => c === 'None' || c === 'Savings account')) KE = Math.min(KE, 4);
  const L = Math.min(T, C, H, KE);
  r.want = T; r.can = C; r.time = H; r.level = L; r.label = RISK_LBL[L - 1];
  r.limit = L === T ? 'want' : L === C ? 'can' : L === H ? 'time' : 'experience';
  r.keNote = full && L === KE && KE < Math.min(T, C, H);
  // Mismatch (xlsx K13–K17), one line, safety first
  const wantHi = q8 >= 3, wantLo = q8 <= 2, compHi = q9 >= 3, compLo = q9 <= 2, thin = q7 != null && q7 <= 2;
  const shortT = full && H <= 2, lossLo = full && C <= 2;
  const capLo = thin || lossLo || shortT, capHi = full ? (C >= 4 && H >= 4) : (q7 === 4 && q6 != null && q6 >= 3);
  const k = wantLo && compLo && capLo ? 'K16'
    : wantHi && capLo ? (thin ? 'K14c' : lossLo ? 'K14l' : 'K14t')
    : wantHi && compLo ? 'K13'
    : wantLo && capHi ? 'K15'
    : full && wantHi && compHi && capHi && u11 != null && u11 >= 1 ? 'K17' : 'OK';
  r.misKey = k; r.mis = MIS[k]; r.adv = MIS_ADV[k] || null;
  return r;
}
/* ===== END PASTE ===== */
