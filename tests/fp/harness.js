const fs = require('fs');
const S2 = {'6':[1,2,3,4,2],'7':[4,2,1,1],'8':[1,2,3,4],'9':[1,2,3,4],'12':[1,2,4,1],'2':[0,0,0,0],'4':[0,0,0,0]};
const TYPES = {A:{name:'Achiever'},B:{name:'Balancer'},E:{name:'Explorer'},C:{name:'Contented'}};
let S; const dsc = id => typeof S.ans[id]==='number' ? S2[id][S.ans[id]] : null;
let SUG = 3; const suggestU9 = () => SUG; const finNums = () => S._fin;
eval(fs.readFileSync(__dirname + '/paste.js','utf8'));
const opt = {'2':['Budget','Balance','New','Relaxed'],'4':['Buy fast','Research','Expert','Stay away'],'6':['<100','100-300','300-750','>750','Varies'],'7':['Emergency','Other savings','Credit','Not sure'],'8':['Calm','Mostly sunny','Showers','Stormy'],'9':['Sell','Wait-back','Hold','Buy more'],'12':['Worried','Hopeful','Confident','Avoid'],
 u4:['Research self','Basics+expert','Expert first','Simple'],u9:['<2y','2-5y','5-10y','10+y'],u10:['Cut essentials','Change plans','Fine','Not sure'],u11:['None','Basics','Fairly','Very'],u12:['Uncertain','Varies','Fairly','Very']};
const P = [
 ['1 Anxious starter, 26, renting', {'2':1,'4':3,'6':0,'7':3,'8':0,'9':0,'12':0}, {u4:3,u9:0,u10:0,u11:0,u12:1}],
 ['2 Disciplined saver, 42', {'2':0,'4':1,'6':2,'7':0,'8':1,'9':2,'12':2}, {u4:1,u9:3,u10:1,u11:1,u12:3}],
 ['3 FOMO enthusiast, 29', {'2':2,'4':0,'6':1,'7':2,'8':3,'9':0,'12':1}, {u4:0,u9:2,u10:1,u11:1,u12:1}],
 ['4 Seasoned investor, 51', {'2':1,'4':1,'6':3,'7':0,'8':3,'9':3,'12':2}, {u4:0,u9:3,u10:2,u11:3,u12:3}],
 ['5 Relaxed, avoids money, 45', {'2':3,'4':3,'6':1,'7':1,'8':1,'9':1,'12':3}, {u4:3,u9:3,u10:3,u11:0,u12:2}],
 ['6 Vigilant checker, 58', {'2':1,'4':2,'6':2,'7':0,'8':0,'9':2,'12':0}, {u4:2,u9:2,u10:2,u11:1,u12:3}],
 ['7 Keen, thin cushion, 33', {'2':2,'4':1,'6':1,'7':2,'8':3,'9':3,'12':1}, {u4:0,u9:3,u10:1,u11:2,u12:2}],
 ['8 Budgeter, home in 3 yrs, 31', {'2':0,'4':1,'6':2,'7':0,'8':2,'9':2,'12':1}, {u4:1,u9:1,u10:1,u11:1,u12:3}],
 ['9 Wealthy but cautious, 60', {'2':1,'4':3,'6':3,'7':0,'8':0,'9':2,'12':2}, {u4:2,u9:3,u10:2,u11:2,u12:3}],
 ['10 Novice, calm, 30 yrs to go, 35', {'2':0,'4':2,'6':2,'7':0,'8':2,'9':3,'12':1}, {u4:1,u9:3,u10:2,u11:0,u12:3}],
 ['11 Self-employed, skips Q2, 40', {'4':0,'6':4,'7':1,'8':3,'9':3,'12':1}, {u4:0,u9:3,u10:1,u11:2,u12:1}],
 ['12 Only 4 answered', {'6':1,'7':0,'8':1,'9':2}, null],
];
console.log('| Persona | Key answers | Old type | New type (Discover) | New type (+u4) | Scores A/B/E/C | D10: comfort / cushion / hint | First read (7 answers) | Full profile: want / can / time / K&E -> label (set by) | Full hint |');
for (const [n,a,u] of P){
  S = {ans:a, um:{a:{}, chips:[]}, src:{}, _fin:null}; SUG = 3;
  const p0 = personality(), sc = personalityScores().t, r0 = riskRead(false);
  S.um.a = u || {}; const p1 = personality(), r1 = u ? riskRead(true) : null;
  const key = Object.entries(a).map(([q,k])=>'Q'+q+' '+opt[q][k]).join(', ') + (u ? '; ' + Object.entries(u).map(([q,k])=>q+' '+opt[q][k]).join(', ') : '');
  console.log('| ' + [n, key, '', p0?p0.name:'(none: fewer than 4)', p1?p1.name:'—', ['A','B','E','C'].map(x=>sc[x]).join('/'),
    (r0.comfort||'—')+' / '+(r0.cushion||'—')+' / '+(r0.misKey||'—'), r0.label ? r0.label : '—',
    r1 ? r1.want+' / '+r1.can+' / '+r1.time+' / '+(u.u11!=null?[3,4,5,5][u.u11]:'-')+' -> '+r1.label+' ('+r1.limit+')' : '—', r1 ? r1.misKey : '—'].join(' | ') + ' |');
}
