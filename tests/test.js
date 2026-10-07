const fs=require('fs'); let S;
eval(fs.readFileSync('base.js','utf8')+'\n'+fs.readFileSync('newproj.js','utf8'));
let id=1; const G=(k,name,amount,age,kind,prio='Must have',saved=0)=>({id:id++,k,name,amount,age,kind,prio,saved});
const P=[
 {name:'A Pooja example: 30, single, €55k, costs €2,400, cash €6k, Q6 €100-300',
  about:{age:30,partner:false}, retireAge:66, q6:1,
  fin:{work:'Employed',income:55000,costsM:2400,cash:6000,invest:0,pension:12000,pensionM:300,sp:'Expect full'},
  goals:a=>[G('safety','Safety net',10000,a+2,'pot'),G('home','Buy a home',40000,a+18,'spend'),G('business','Start a business',25000,a+26,'spend','Nice to have'),G('wealth','Grow my wealth',50000,a+27,'pot','Nice to have')]},
 {name:'B Couple 40, €75k+€45k, costs €4,000, mortgage, cash €30k, inv €20k, Q6 Over €750',
  about:{age:40,partner:true}, retireAge:65, q6:3,
  fin:{work:'Employed',income:75000,pIncome:45000,pAge:40,costsM:4000,cash:30000,invest:20000,pension:90000,pensionM:900,home:'Own with mortgage',mortBal:220000,mortPayM:1300,mortYears:22,sp:'Expect full'},
  goals:a=>[G('car','Change the car',30000,a+3,'spend','Nice to have'),G('edu',"Kids' education",60000,a+10,'spend'),G('mfree','Be mortgage-free',220000,a+15,'mfree','Nice to have'),G('retire','Retire comfortably',45000,65,'retire')]},
 {name:'C 26, single, €32k, costs €2,000, cash €1.5k, Q6 Under €100',
  about:{age:26,partner:false}, retireAge:66, q6:0,
  fin:{work:'Employed',income:32000,costsM:2000,cash:1500,invest:0,pension:0,pensionM:0,sp:'Expect full'},
  goals:a=>[G('travel','Travel',8000,a+2,'spend','Nice to have'),G('wedding','Wedding',25000,a+3,'spend'),G('home','Buy a home',40000,a+5,'spend'),G('retire','Retire comfortably',30000,66,'retire')]},
 {name:'D 50, €120k, costs €4,500, cash €80k, inv €250k, pension €400k, Q6 Over €750',
  about:{age:50,partner:false}, retireAge:63, q6:3,
  fin:{work:'Employed',income:120000,costsM:4500,cash:80000,invest:250000,pension:400000,pensionM:1500,sp:'Expect full'},
  goals:a=>[G('helpfam','Help my family',20000,a+8,'spend'),G('wealth','Grow my wealth',50000,a+10,'pot'),G('retire','Retire comfortably',50000,63,'retire'),G('legacy','Leave a legacy',100000,85,'legacy','Nice to have')]},
];
for (const assume of ['standard','cautious']) for(const p of P){
  S={about:p.about,retireAge:p.retireAge,fin:p.fin,ans:{'6':p.q6},assume,goals:p.goals(p.about.age)};
  const o=projectOld(), n=project(), n2=project({g:S.goals[1].id,m:200,l:0});
  console.log('\n'+assume+' | '+p.name+' | save '+n.save.saveM+'/m of surplus '+n.save.surplusM+'/m');
  S.goals.forEach(g=>{const x=n.goal[g.id]; console.log('  '+g.name.padEnd(20)+' old '+String(o.pct[g.id]).padStart(3)+'%  new '+String(n.pct[g.id]).padStart(3)+'%'+(x?'  cost '+Math.round(x.cost)+' needs '+x.needM+'/m now '+x.nowM+'/m avg '+x.avgM+'/m':'')+'  | +200/m to goal2: '+n2.pct[g.id]+'%');});
  const sh=n.rows.filter(isShort).map(r=>r.a); console.log('  short years: '+(sh.length?sh[0]+'..'+sh[sh.length-1]+' ('+sh.length+')':'none')+'; old short: '+o.rows.filter(isShort).length);
}
// extra checks on persona A
const p=P[0]; S={about:p.about,retireAge:p.retireAge,fin:p.fin,ans:{'6':p.q6},assume:'standard',goals:p.goals(30)};
const show=(lbl,x)=>console.log(lbl.padEnd(28)+S.goals.map(g=>x.pct[g.id]+'%').join(' / ')+'  save '+x.save.saveM+'/m; short yrs '+x.rows.filter(isShort).map(r=>r.a).join(','));
show('A base',project()); show('A what-if -100/m',project({g:S.goals[1].id,m:-100,l:0})); show('A lump +10k to wealth',project({g:S.goals[3].id,m:0,l:10000}));
S.ans={}; show('A Q6 unanswered',project()); S.ans={'6':4}; show('A Q6 varies',project()); S.ans={'6':3}; show('A Q6 over 750',project());
