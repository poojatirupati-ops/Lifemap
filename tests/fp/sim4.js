// Option indexes (0-based) per question. Q2,Q4,Q6,Q7,Q8,Q9,Q12 ; u4,u9,u10,u11,u12,u13
const S2 = {'2':[1,2,3,4],'4':[1,2,3,4],'6':[1,2,3,4,2],'7':[4,2,1,1],'8':[1,2,3,4],'9':[1,2,3,4],'12':[1,2,4,1]};
// ---------- CURRENT personality ----------
const W_OLD = {'2':[{A:2},{B:2},{E:2},{C:2}], '4':[{E:1},{A:1},{B:1},{B:1,C:1}]};
function persOld(a){ const t={A:0,B:0,E:0,C:0}; ['2','4'].forEach(id=>{const k=a[id]; if(typeof k==='number') Object.entries(W_OLD[id][k]).forEach(([x,n])=>t[x]+=n);});
  const first = typeof a['2']==='number'? Object.keys(W_OLD['2'][a['2']])[0]:'B';
  const rank = Object.keys(t).sort((x,y)=>(t[y]-t[x])||((y===first)-(x===first))); return t[rank[0]]?rank[0]:'B'; }
// ---------- PROPOSED personality (half-points x2 => integers) ----------
const PW = {
 '2': [{A:4},{B:4},{E:4},{C:4}],
 '4': [{E:2},{A:2},{B:2},{B:1,C:1}],
 '7': [{A:1},{},{},{C:1}],
 '8': [{B:1,C:1},{B:1,A:1},{A:1,E:1},{E:2}],
 '9': [{B:2},{B:1},{A:1,C:1},{E:2}],
 '12':[{B:2},{E:1},{A:2},{C:2}],
 'u4':[{A:1,E:1},{A:1,B:1},{B:2},{C:2}]
};
const ORDER = ['B','A','C','E'];
function persNew(a, um){ const t={A:0,B:0,E:0,C:0}; let n=0;
  ['2','4','7','8','9','12'].forEach(id=>{const k=a[id]; if(typeof k==='number'){n++; Object.entries(PW[id][k]).forEach(([x,v])=>t[x]+=v);} });
  if (um && typeof um.u4==='number') Object.entries(PW.u4[um.u4]).forEach(([x,v])=>t[x]+=v);
  if (n < 4) return {type:null, t};
  const top = Math.max(...Object.values(t)); let tied = Object.keys(t).filter(x=>t[x]===top);
  const own = id => typeof a[id]==='number' ? Object.keys(PW[id][a[id]]).filter(x=>tied.includes(x)) : [];
  let pick = tied.length===1?tied[0]: (own('2')[0] || (own('4').length===1?own('4')[0]:null) || ORDER.find(x=>tied.includes(x)));
  return {type:pick, t};
}
// ---------- CURRENT risk ----------
function suggest(y){ return y<=2?0:y<=5?1:y<=10?2:3; }
function riskOld(a, um, full){
  const d = id => typeof a[id]==='number'? S2[id][a[id]] : null;
  const want = d('8')||2, comp=d('9')||2, q6=d('6')||2, q7=d('7')||2;
  const US = {u10:[1,2,4,2], u12:[1,2,3,4]}; const u = k => um && typeof um[k]==='number'? US[k][um[k]]:null;
  const parts=[q6,q7]; if(full){ if(u('u10')) parts.push(u('u10')); if(u('u12')) parts.push(u('u12')); }
  const can = parts.reduce((x,y)=>x+y,0)/parts.length; const time = (um && typeof um.u9==='number'? um.u9 : 3)+1;
  let score=Math.min(want,can); if(time===1)score=Math.min(score,1.5); if(time===2)score=Math.min(score,2.4);
  return score<=1.5?'Cautious':score<=2.1?'Cautious–balanced':score<=2.7?'Balanced':score<=3.3?'Balanced–growth':'Growth';
}
// ---------- PROPOSED risk ----------
const LBL = ['Cautious','Cautious–balanced','Balanced','Balanced–growth','Growth'];
function riskNew(a, um, fin){
  const d = id => typeof a[id]==='number'? S2[id][a[id]] : null;
  const q8=d('8'), q9=d('9'), q7=d('7');
  if (q8==null || q9==null) return {label:'—'};
  let T = q8 + (q9===4 && q8>=3 ? 1 : 0); T = Math.min(T, q9===1?2:q9===2?3:5);
  let C = 5, why=[];
  const cap = (v, r) => { if (v < C) { C = v; } if (v<5) why.push(r); };
  if (q7===2) cap(3,'cushion'); if (q7===1) cap(2,'cushion');
  const u10 = um && um.u10, u12 = um && um.u12, u9 = um && um.u9, u11 = um && um.u11;
  if (u10===0) cap(2,'loss'); if (u10===1) cap(3,'loss'); if (u10===3) cap(3,'loss');
  if (u12===0) cap(2,'income'); if (u12===1) cap(4,'income');
  if (fin && fin.cashMonths < 3) cap(3,'cash');
  const H = [1,2,4,5][u9];
  const KE = [3,4,5,5][u11];
  const L = Math.min(T, C, H, KE);
  const bound = L===T?'want':L===C?'can':L===H?'time':'experience';
  return {T, C, H, KE, L, label:LBL[L-1], bound};
}
function mis(a, r, full){
  const d = id => typeof a[id]==='number'? S2[id][a[id]] : null; const q8=d('8'), q9=d('9'), q7=d('7'), q6=d('6');
  const wantHi=q8>=3, wantLo=q8<=2, compLo=q9<=2, compHi=q9>=3;
  const capLo = full ? (r.C<=2 || r.H<=2) : q7<=2, capHi = full ? (r.C>=4 && r.H>=4) : (q7===4 && q6>=3);
  if (wantLo && compLo && capLo) return 'K16';
  if (wantHi && capLo) return 'K14';
  if (wantHi && compLo) return 'K13';
  if (wantLo && capHi) return 'K15';
  if (full && wantHi && compHi && capHi) return 'K17';
  return 'aligned';
}
const P = [
 ['1 Anxious starter, 26', {'2':1,'4':3,'6':0,'7':3,'8':0,'9':0,'12':3}, {u4:3,u9:0,u10:0,u11:0,u12:1}],
 ['2 Disciplined saver, 42', {'2':0,'4':1,'6':2,'7':0,'8':1,'9':2,'12':2}, {u4:1,u9:3,u10:1,u11:1,u12:3}],
 ['3 FOMO enthusiast, 29', {'2':2,'4':0,'6':1,'7':2,'8':3,'9':0,'12':1}, {u4:0,u9:2,u10:1,u11:1,u12:1}],
 ['4 Seasoned investor, 51', {'2':1,'4':1,'6':3,'7':0,'8':3,'9':3,'12':2}, {u4:0,u9:3,u10:2,u11:3,u12:3}],
 ['5 Relaxed, avoids money, 45', {'2':3,'4':3,'6':1,'7':1,'8':1,'9':1,'12':3}, {u4:3,u9:3,u10:3,u11:0,u12:2}],
 ['6 Vigilant checker, 58', {'2':1,'4':2,'6':2,'7':0,'8':0,'9':2,'12':0}, {u4:2,u9:2,u10:2,u11:1,u12:3}],
 ['7 Keen but thin cushion, 33', {'2':2,'4':1,'6':1,'7':2,'8':3,'9':3,'12':1}, {u4:0,u9:3,u10:1,u11:2,u12:2}],
 ['8 Budgeter, house in 3 yrs, 31', {'2':0,'4':1,'6':2,'7':0,'8':2,'9':2,'12':1}, {u4:1,u9:1,u10:1,u11:1,u12:3}],
 ['9 Wealthy but cautious, 60', {'2':1,'4':3,'6':3,'7':0,'8':0,'9':2,'12':2}, {u4:2,u9:3,u10:2,u11:2,u12:3}],
 ['10 Novice, calm, long horizon, 35', {'2':0,'4':2,'6':2,'7':0,'8':2,'9':3,'12':1}, {u4:1,u9:3,u10:2,u11:0,u12:3}],
];
const T4 = {A:'Achiever',B:'Balancer',E:'Explorer',C:'Contented',null:'(not enough answers)'};
for (const [n,a,u] of P){ const pn=persNew(a,null), pu=persNew(a,u), r=riskNew(a,u);
  console.log([n, T4[persOld(a)], T4[pn.type], JSON.stringify(pn.t), T4[pu.type], riskOld(a,u,true), r.label+' (T'+r.T+' C'+r.C+' H'+r.H+' KE'+r.KE+'; bound '+r.bound+')', mis(a,r,false), mis(a,r,true)].join(' | ')); }
// exhaustive distribution on the 6 personality answers
const cnt={A:0,B:0,E:0,C:0}, cntO={A:0,B:0,E:0,C:0}; let tot=0, override=0;
const R=[4,4,4,4,4,4];
for(let i=0;i<4**6;i++){ let x=i; const k=[]; for(let j=0;j<6;j++){k.push(x%4); x=Math.floor(x/4);} const a={'2':k[0],'4':k[1],'7':k[2],'8':k[3],'9':k[4],'12':k[5]};
 const t=persNew(a).type; cnt[t]++; cntO[persOld(a)]++; tot++; if (t !== ['A','B','E','C'][k[0]]) override++; }
console.log('new dist', cnt, 'old dist', cntO, 'Q2 overridden in', (override/tot*100).toFixed(1)+'%');
// risk label distribution discover-only with all horizons long
