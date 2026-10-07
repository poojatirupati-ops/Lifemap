let S;
const RULES_VERSION = 'Irish rules 2026 · checked 2 Oct 2026';
const RV_ = (v, src, eff, verify) => ({v, src, eff, verify:verify !== false});
const RULES_IE_2026 = {
  it:{   // income tax
    band:RV_(44000, 'https://www.raisin.com/en-ie/taxes/income-tax-rates/', '1 Jan 2026'),
    bandSPCCC:RV_(48000, 'https://www.noonecasey.ie/irish-budget-2026/', '1 Jan 2026'),
    bandMarried:RV_(53000, 'https://www.raisin.com/en-ie/taxes/income-tax-rates/', '1 Jan 2026'),
    bandUplift:RV_(35000, 'https://www.raisin.com/en-ie/taxes/income-tax-rates/', '1 Jan 2026'),
    r1:RV_(0.20, 'https://www.raisin.com/en-ie/taxes/income-tax-rates/', '2026'),
    r2:RV_(0.40, 'https://www.raisin.com/en-ie/taxes/income-tax-rates/', '2026'),
    personal:RV_(2000, 'https://www.raisin.com/en-ie/taxes/income-tax-rates/', '2026'),
    personalMarried:RV_(4000, 'https://www.raisin.com/en-ie/taxes/income-tax-rates/', '2026'),
    paye:RV_(2000, 'https://revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/income-and-employment/employee-tax-credit/index.aspx', '2026'),
    eic:RV_(2000, 'https://revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/income-and-employment/employee-tax-credit/index.aspx', '2026'),
    rent:RV_(1000, 'https://www.noonecasey.ie/irish-budget-2026/', '2025–2028'),
    rentJoint:RV_(2000, 'https://www.noonecasey.ie/irish-budget-2026/', '2025–2028'),
    rentLastYear:RV_(2028, 'https://www.noonecasey.ie/irish-budget-2026/', 'extended to end-2028'),
    spccc:RV_(1900, 'https://www.irishtaxhub.ie/blog/tax-credits-in-ireland-full-list', '1 Jan 2026'),
    homeCarer:RV_(1950, 'https://www.noonecasey.ie/irish-budget-2026/', '2026 (verify rate)'),
    homeCarerLimit:RV_(7200, 'https://www.noonecasey.ie/irish-budget-2026/', '2026 (verify limit and taper)'),
    ageCreditAge:RV_(65, 'https://www.irishtaxhub.ie/blog/retirees-pensioners-what-budget-2026-might-mean-for-you', '2026'),
    ageCredit:RV_(245, 'https://www.irishtaxhub.ie/blog/retirees-pensioners-what-budget-2026-might-mean-for-you', '2026'),
    ageExempt:RV_(18000, 'https://www.irishtaxhub.ie/blog/retirees-pensioners-what-budget-2026-might-mean-for-you', '2026'),
    ageExemptMarried:RV_(36000, 'https://www.irishtaxhub.ie/blog/retirees-pensioners-what-budget-2026-might-mean-for-you', '2026'),
    ageMarginal:RV_(0.40, 'https://www.irishtaxhub.ie/blog/retirees-pensioners-what-budget-2026-might-mean-for-you', 'Law')
  },
  usc:{
    bands:RV_([[12012, 0.005], [28700, 0.02], [70044, 0.03], [Infinity, 0.08]], 'https://www.raisin.com/en-ie/taxes/income-tax-rates/', '1 Jan 2026'),
    exempt:RV_(13000, 'https://www.raisin.com/en-ie/taxes/income-tax-rates/', '2026'),
    reducedAge:RV_(70, 'https://www.irishtaxhub.ie/blog/retirees-pensioners-what-budget-2026-might-mean-for-you', '2026'),
    reducedMax:RV_(60000, 'https://www.irishtaxhub.ie/blog/retirees-pensioners-what-budget-2026-might-mean-for-you', '2026'),
    reducedBands:RV_([[12012, 0.005], [Infinity, 0.02]], 'https://www.irishtaxhub.ie/blog/retirees-pensioners-what-budget-2026-might-mean-for-you', '2026'),
    seSurcharge:RV_(0.03, 'https://www.raisin.com/en-ie/taxes/income-tax-rates/', '2026'),
    seSurchargeOver:RV_(100000, 'https://www.raisin.com/en-ie/taxes/income-tax-rates/', '2026')
  },
  prsi:{
    // Class A/S rate path (Budget 2025 roadmap): {y, m (month it starts), r}
    path:RV_([{y:2025, m:10, r:0.042}, {y:2026, m:10, r:0.0435}, {y:2027, m:10, r:0.045}, {y:2028, m:10, r:0.047}], 'https://www.gov.ie/en/publication/ffa563-prsi-class-a-rates', '1 Oct 2026 (4.35%)'),
    wkFree:RV_(352, 'https://payslipiq.co.uk/ie/methodology/prsi', '2026'),
    creditMax:RV_(12, 'https://payslipiq.co.uk/ie/methodology/prsi', '2026'),
    creditTo:RV_(424, 'https://payslipiq.co.uk/ie/methodology/prsi', '2026'),
    creditTaper:RV_(6, 'https://payslipiq.co.uk/ie/methodology/prsi', '2026'),
    endAge:RV_(66, 'https://www.oireachtas.ie/en/debates/question/2018-11-21/241/', 'Law'),
    sMinIncome:RV_(5000, 'https://www.gov.ie/en/department-of-social-protection/publications/prsi-class-s-rates/', '2026'),
    sMin:RV_(650, 'https://www.gov.ie/en/department-of-social-protection/publications/prsi-class-s-rates/', '2026'),
    unearnedMin:RV_(5000, 'https://www.gov.ie/en/department-of-social-protection/publications/prsi-class-s-rates/', '2026')
  },
  pen:{
    relief:RV_([[30, 0.15], [40, 0.20], [50, 0.25], [55, 0.30], [60, 0.35], [Infinity, 0.40]], 'https://www.irishtaxhub.ie/blog/pension-contributions-income-tax-maximize-your-relief', 'Unchanged'),
    earnCap:RV_(115000, 'https://www.irishtaxhub.ie/blog/pension-contributions-income-tax-maximize-your-relief', 'Unchanged'),
    lsMaxPct:RV_(0.25, 'https://pwc.ie/services/workforce/insights/finance-act-2024-pensions-pulse.html', 'Finance Act 2024'),
    lsTaxFree:RV_(200000, 'https://pwc.ie/services/workforce/insights/finance-act-2024-pensions-pulse.html', 'Finance Act 2024 (lifetime, not indexed)'),
    lsCap:RV_(500000, 'https://pwc.ie/services/workforce/insights/finance-act-2024-pensions-pulse.html', 'Finance Act 2024 (not indexed)'),
    lsBandRate:RV_(0.20, 'https://pwc.ie/services/workforce/insights/finance-act-2024-pensions-pulse.html', 'Finance Act 2024'),
    sft:RV_({2026:2.2e6, 2027:2.4e6, 2028:2.6e6, 2029:2.8e6}, 'https://wtwco.com/en-ie/insights/2024/10/significant-revisions-announced-to-the-standard-fund-threshold', '1 Jan 2026'),
    sftRate:RV_(0.40, 'https://wtwco.com/en-ie/insights/2024/10/significant-revisions-announced-to-the-standard-fund-threshold', 'Law'),
    arfMin61:RV_(0.04, 'https://cantorfitzgerald.ie/wp-content/uploads/2026/06/ARF-6pp-A4-Brochure-6-26.pdf', 'Law'),
    arfMin71:RV_(0.05, 'https://cantorfitzgerald.ie/wp-content/uploads/2026/06/ARF-6pp-A4-Brochure-6-26.pdf', 'Law'),
    arfMinBig:RV_(0.06, 'https://cantorfitzgerald.ie/wp-content/uploads/2026/06/ARF-6pp-A4-Brochure-6-26.pdf', 'Law'),
    arfBig:RV_(2e6, 'https://cantorfitzgerald.ie/wp-content/uploads/2026/06/ARF-6pp-A4-Brochure-6-26.pdf', 'Law'),
    earliestAge:RV_(60, 'https://www.revenue.ie/en/tax-professionals/tdm/pensions/index.aspx', 'Law (PRSA / personal pensions)')
  },
  ae:{   // auto-enrolment (My Future Fund), phase 1
    start:RV_(2026, 'https://www.gov.ie/en/publication/12d1c-auto-enrolment-retirement-savings-system-for-employers', '1 Jan 2026'),
    ageMin:RV_(23, 'https://www.gov.ie/en/publication/12d1c-auto-enrolment-retirement-savings-system-for-employers', '1 Jan 2026'),
    ageMax:RV_(60, 'https://www.gov.ie/en/publication/12d1c-auto-enrolment-retirement-savings-system-for-employers', '1 Jan 2026'),
    earnMin:RV_(20000, 'https://www.gov.ie/en/publication/12d1c-auto-enrolment-retirement-savings-system-for-employers', '1 Jan 2026'),
    earnCap:RV_(80000, 'https://www.gov.ie/en/publication/12d1c-auto-enrolment-retirement-savings-system-for-employers', '1 Jan 2026'),
    ee:RV_(0.015, 'https://www.gov.ie/en/publication/12d1c-auto-enrolment-retirement-savings-system-for-employers', '2026–2028'),
    er:RV_(0.015, 'https://www.gov.ie/en/publication/12d1c-auto-enrolment-retirement-savings-system-for-employers', '2026–2028'),
    state:RV_(0.005, 'https://www.gov.ie/en/publication/12d1c-auto-enrolment-retirement-savings-system-for-employers', '2026–2028')
  },
  sp:{   // State Pension (Contributory) and other DSP payments, weekly
    week:RV_(299.30, 'https://www.gov.ie/en/publication/927721-state-pension-contributory-rates/', '1 Jan 2026'),
    age:RV_(66, 'https://www.gov.ie/en/publication/d8fd8-flexible-pension-options', 'Law'),
    over80:RV_(10, 'https://www.zurich.ie/blog/pension-changes-2026', '2026'),
    qa66:RV_(268.40, 'https://www.zurich.ie/blog/pension-changes-2026', '1 Jan 2026'),
    qaUnder66:RV_(199.40, 'https://www.inou.ie/assets/files/pdf/2026_-_inou_budget_factsheet.pdf', '1 Jan 2026'),
    fullYears:RV_(40, 'https://www.gov.ie/en/publication/b6193-how-to-calculate-your-state-pension-contributory-rate', 'Law'),
    minYears:RV_(10, 'https://www.gov.ie/en/publication/b6193-how-to-calculate-your-state-pension-contributory-rate', 'Law'),
    illness:RV_(254, 'https://www.inou.ie/assets/files/pdf/2026_-_inou_budget_factsheet.pdf', '1 Jan 2026'),
    survivor:RV_(259.50, 'https://www.raisin.com/en-ie/pensions/widow-pensions', '1 Jan 2026'),
    survivor66:RV_(299.30, 'https://www.raisin.com/en-ie/pensions/widow-pensions', '1 Jan 2026'),
    weeks:RV_(52, 'Convention', '—', false)
  },
  sav:{   // savings and investment tax (shown as notes)
    dirt:RV_(0.33, 'https://cantorfitzgerald.ie/budget-2026-key-updates-for-investors-and-savers', '2026'),
    exit:RV_(0.38, 'https://www.revenue.ie/en/tax-professionals/ebrief/2026/no-0162026.aspx', '1 Jan 2026'),
    deemed:RV_(8, 'https://etf.ie/blog/budget-2026-etf/', '2026')
  },
  home:{
    ltiFTB:RV_(4, 'https://www.centralbank.ie/news/article/central-bank-announces-targeted-changes-to-mortgage-measures-framework', '1 Jan 2023'),
    ltiSSB:RV_(3.5, 'https://www.centralbank.ie/news/article/central-bank-announces-targeted-changes-to-mortgage-measures-framework', '1 Jan 2023'),
    ltv:RV_(0.90, 'https://www.centralbank.ie/news/article/central-bank-announces-targeted-changes-to-mortgage-measures-framework', '1 Jan 2023'),
    stamp:RV_([[1e6, 0.01], [1.5e6, 0.02], [Infinity, 0.06]], 'https://www.raisin.com/en-ie/taxes/stamp-duty-ireland/', 'Budget 2025'),
    htbMax:RV_(30000, 'https://charteredaccountants.ie/News/help-to-buy-guidance-updated-for-scheme-extension', 'to 31 Dec 2029')
  },
  infl:{
    ie:RV_(0.039, 'https://www.cso.ie/en/csolatestnews/pressreleases/2026pressreleases/pressstatementflashestimatefortheharmonisedindexofconsumerpricesseptember2026/', 'CSO HICP flash, Sep 2026 (published 1 Oct 2026)'),
    ieSrc:RV_('CSO HICP flash, Sep 2026', 'https://www.cso.ie', '1 Oct 2026'),
    ecb:RV_(0.02, 'https://www.bundesbank.de/en/tasks/topics/european-central-bank-updates-monetary-policy-strategy-970824', '2025 strategy')
  }
};
// RI: plain values read by every function (RI.it.band = 44000 …)
const RI = (function unwrap(o){ const r = {}; Object.keys(o).forEach(k => { const x = o[k]; r[k] = x && typeof x === 'object' && 'v' in x && 'src' in x ? x.v : unwrap(x); }); return r; })(RULES_IE_2026);
const ruleCount = () => { let n = 0, vf = 0; const walk = o => Object.values(o).forEach(x => { if (x && typeof x === 'object' && 'v' in x && 'src' in x){ n++; if (x.verify) vf++; } else if (x && typeof x === 'object') walk(x); }); walk(RULES_IE_2026); return {n, vf}; };
const GOALCAT = [
  {k:'home', t:'Buy a home', e:'🏡', amt:40000, yrs:4, kind:'spend', spec:'mortgage', unit:'Deposit'},
  {k:'retire', t:'Retire comfortably', e:'🌅', amt:40000, kind:'retire', spec:'pension', unit:'Yearly income'},
  {k:'family', t:'Grow my family', e:'👶', amt:15000, yrs:3, kind:'spend', spec:'protection', unit:'One-off'},
  {k:'edu', t:"Kids' education", e:'🎓', amt:30000, yrs:10, kind:'spend', spec:'planner', unit:'Per child'},
  {k:'travel', t:'Travel', e:'✈️', amt:8000, yrs:2, kind:'spend', spec:'planner', unit:'One-off'},
  {k:'business', t:'Start a business', e:'💼', amt:25000, yrs:5, kind:'spend', spec:'planner', unit:'One-off'},
  {k:'mfree', t:'Be mortgage-free', e:'🏦', amt:150000, yrs:15, kind:'mfree', spec:'mortgage', unit:'Mortgage balance'},
  {k:'safety', t:'Build a safety net', e:'🪂', amt:15000, yrs:2, kind:'pot', spec:'planner', unit:'Months of costs'},
  {k:'wealth', t:'Grow my wealth', e:'📈', amt:50000, yrs:10, kind:'pot', spec:'investment', unit:'Target pot'},
  {k:'helpfam', t:'Help my family', e:'🤝', amt:20000, yrs:8, kind:'spend', spec:'planner', unit:'One-off'},
  {k:'legacy', t:'Leave a legacy', e:'🎁', amt:100000, age:85, kind:'legacy', spec:'planner', unit:'Amount'},
  {k:'wedding', t:'Wedding', e:'💍', amt:25000, yrs:3, kind:'spend', spec:'planner', unit:'One-off'},
  {k:'car', t:'Change the car', e:'🚗', amt:30000, yrs:3, kind:'spend', spec:'planner', unit:'One-off'},
  {k:'health', t:'Health & care', e:'🩺', amt:10000, yrs:5, kind:'spend', spec:'protection', unit:'One-off'},
  {k:'other', t:'Something else', e:'⭐', amt:10000, yrs:4, kind:'spend', spec:'planner', unit:'Custom'}
];
const GC = k => GOALCAT.find(g => g.k === k);
const own = () => /^Own/.test(S.fin.home || ''), mort = () => S.fin.home === 'Own with mortgage';
const FF = {
  name:{l:'First name', type:'text', pre:1},
  age:{l:'Your age', type:'num', min:18, max:80, pre:1},
  retireAge:{l:'Retirement age', type:'num', min:50, max:75, pre:1, hint:'From your timeline flag'},
  pAge:{l:"Partner's age", type:'num', min:18, max:85, est:() => S.about.age, show:() => S.about.partner && S.partner.mode !== 'invite'},
  work:{l:'Your work', type:'choice', o:['Employed','Self-employed','Not working'], est:'Employed'},
  income:{l:'Your gross yearly income', type:'eur', est:45000, hint:'Before tax'},
  pIncome:{l:"Partner's gross yearly income", type:'eur', est:38000, show:() => S.about.partner && S.partner.mode !== 'invite'},
  otherM:{l:'Other income a month (before tax)', type:'eur', est:0, opt:1, hint:'Optional. Taxed with your other income'},
  costsM:{l:'Monthly living costs', type:'eur', est:() => 2000 + (S.about.partner ? 800 : 0) + 450 * (S.about.deps || 0), hint:'Rent, bills, food and extras. Leave out mortgage and loan repayments.'},
  oneOffY:{l:'Yearly one-off costs', type:'eur', est:1500, opt:1, hint:'Optional. Car tax, insurance, holidays'},
  home:{l:'Your home', type:'choice', o:['Own outright','Own with mortgage','Rent','Live with family'], est:'Rent'},
  homeValue:{l:'Home value', type:'eur', est:380000, show:own},
  cash:{l:'Cash savings', type:'eur', est:8000, hint:'Incl. credit union and State Savings'},
  invest:{l:'Investments', type:'eur', est:0, hint:'Shares, funds, share schemes, crypto: one total'},
  propValue:{l:'Other property: value', type:'eur', est:0, opt:1, hint:'Optional'},
  rentM:{l:'Other property: rent received a month (before tax)', type:'eur', est:0, opt:1, hint:'Optional. Rental profit is taxed at your marginal rate, with USC and PRSI'},
  mortBal:{l:'Mortgage left', type:'eur', est:200000, show:mort},
  mortPayM:{l:'Monthly repayment', type:'eur', est:1100, show:mort},
  mortYears:{l:'Years left', type:'num', min:1, max:40, est:20, show:mort},
  cardBal:{l:'Credit cards: total owed', type:'eur', est:0},
  cardPayM:{l:'Credit cards: monthly repayment', type:'eur', est:0},
  loanBal:{l:'Other loans (car, personal, credit union): total owed', type:'eur', est:0},
  loanPayM:{l:'Other loans: monthly repayment', type:'eur', est:0},
  life:{l:'Life cover', type:'ynn'}, ip:{l:'Income protection', type:'ynn'}, ci:{l:'Serious illness cover', type:'ynn'}, workCover:{l:'Cover through work', type:'ynn'}, health:{l:'Health insurance', type:'ynn'},
  pension:{l:'Pension value today', type:'eur', est:() => Math.max(0, S.about.age - 25) * 3500, hint:'All pots together'},
  pensionM:{l:'Paid in each month', type:'eur', est:() => Math.round((S.fin.income || 45000) * 0.1 / 12 / 10) * 10, hint:'Including your employer'},
  pensionOwnM:{l:'Of that, paid by you each month', type:'eur', opt:1, est:() => Math.round((+S.fin.pensionM || 0) * (S.fin.work === 'Self-employed' ? 1 : 0.5)), hint:'Optional. Only your own share gets tax relief. If you leave it blank we assume half (all of it if self-employed); change that in Your assumptions', show:() => +S.fin.pensionM > 0 && S.fin.work !== 'Not working'},
  ae:{l:'Have you been auto-enrolled in My Future Fund?', type:'choice', o:['Yes','No','Not sure'], opt:1, hint:'Employees aged 23–60 earning over €20,000 with no pension are enrolled from 2026: you pay 1.5% of pay, your employer 1.5% and the State 0.5%. We assume yes unless you say no', show:() => S.fin.work === 'Employed' && S.about.age >= RI.ae.ageMin && S.about.age <= RI.ae.ageMax && +S.fin.income > RI.ae.earnMin && !(+S.fin.pensionM > 0)},
  sp:{l:'State Pension', type:'choice', o:['Expect full','Partly','Not sure'], est:'Not sure', hint:'A full State Pension needs 40 years (2,080 weeks) of PRSI contributions and credits. You need at least 10 years of paid contributions to qualify. Check your record on MyWelfare'},
  pSp:{l:'Your partner\'s State Pension', type:'choice', o:['Own full','Own partial','Qualified adult increase','None','Not sure'], opt:1, show:() => !!S.about.partner, hint:'Optional. A partner without their own State Pension may get a Qualified Adult increase on yours (means-tested)'}
};
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const eur = n => (n < 0 ? '−€' : '€') + Math.round(Math.abs(n)).toLocaleString('en-IE');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const RM = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
const val = f => typeof f === 'function' ? f() : f;
function mkGoal(k, custom){
  const c = GC(k), a0 = S.about.age;
  const g = {id:S.gid++, k, name:custom ? custom[1] : c.t, e:custom ? custom[0] : c.e, kind:c.kind, spec:c.spec, amount:custom ? custom[2] : c.amt, saved:0, who:'Me', prio:'Must have', flex:'Can move'};
  if (c.kind === 'retire') g.age = S.retireAge;
  else if (c.kind === 'legacy'){ applyAssume(); g.age = AS.end; }   // FP round 4 F9: tested and shown at the end of the plan (90)
  else g.age = Math.min(89, a0 + (custom ? custom[3] : c.yrs));
  if (k === 'edu' && S.about.deps > 1) g.amount = c.amt * Math.min(3, S.about.deps);
  if (k === 'safety'){ applyAssume(); const F = finNums(), e = S.src.costsM ? essM(F) : val(FF.costsM.est); g.amount = Math.round(e * SAVE.buffer / 1000) * 1000; }   // B16: one safety-net setting everywhere
  return g;
}
const retireGoal = () => S.goals.find(g => g.kind === 'retire');
const AS = {infl:0.02, wage:0.03, cash:0.01, inv:0.035, pen:0.045, penRet:0.0315, sp:RI.sp.week * 52, spAge:RI.sp.age, end:90, mortRate:0.0375, cardRate:0.20, loanRate:0.08};
// Growth assumption sets (audit B2–B5, B8): Standard is the default; Cautious is lower on every rate, incl. pay rises (the old set had Cautious pay rises higher).
const AS_SETS = {standard:{wage:0.03, cash:0.01, inv:0.035, pen:0.045, penRet:0.0315}, cautious:{wage:0.025, cash:0.007, inv:0.025, pen:0.04, penRet:0.028}};
const AS_NAME = {standard:'Standard', cautious:'Cautious'};
let YEAR0 = 2026;   // first plan year: the customer's choice (B23), set in applyAssume()
/* ---------- "Your assumptions": every judgement value is a visible, editable input (audit §3, B1–B27) ---------- */
const twoSecure = () => !!(S && S.about.partner && +S.fin.income > 0 && +S.fin.pIncome > 0 && S.fin.work === 'Employed');
const curSet = () => AS_SETS[(S && S.assume) || 'standard'];
const ASM_GRP = [['prices', 'Prices & growth'], ['retire', 'Retirement'], ['safety', 'Safety net & debt'], ['length', 'Plan length']];
const ASM = {
  inv:{g:'prices', b:'B3', l:'Investments grow (a year, after charges and tax)', t:'pct', min:0, max:7, step:0.25, sug:() => curSet().inv, help:'After fund charges (about 1%) and exit tax (38%). A typical mixed fund has grown 5%–6% a year before these over long periods, but not every year.'},
  cash:{g:'prices', b:'B4', l:'Cash savings earn (a year, after DIRT)', t:'pct', min:0, max:4, step:0.05, sug:() => curSet().cash, help:'Irish savings accounts paid about 1.9% on fixed terms in mid-2026, about 1.25% after 33% DIRT. Demand accounts pay less.'},
  pen:{g:'prices', b:'B5', l:'Pension grows while you work (a year, after charges)', t:'pct', min:0, max:7, step:0.05, sug:() => curSet().pen, help:'Pension growth is tax-free inside the fund.'},
  penRet:{g:'prices', b:'B5', l:'Pension grows once you retire (a year, after charges)', t:'pct', min:0, max:7, step:0.05, sug:() => curSet().penRet, help:'The retired rate is lower because most people take less risk then.'},
  penChg:{g:'prices', b:'B6', l:'Typical pension charges (if your statement doesn\'t say)', t:'pct', min:0, max:2.5, step:0.05, sug:() => 0.01, help:'Your pension statement shows your actual charges. We use them when you add it.'},
  wage:{g:'prices', b:'B8', l:'Pay rises (a year)', t:'pct', min:0, max:6, step:0.1, sug:() => curSet().wage, help:'Irish pay has grown about 3%–4% a year recently. Pick lower if your pay is fixed or you expect to work part-time.'},
  bands:{g:'prices', b:'B10', l:'Tax bands in future', t:'choice', o:[['prices', 'Rise with prices'], ['flat', 'Stay as today']], sug:() => 'prices', help:'Irish tax bands are set each Budget and don\'t rise automatically. "Stay as today" is the cautious view (more tax later).'},
  spGrow:{g:'retire', b:'B11', l:'State Pension in future', t:'choice', o:[['prices', 'Rises with prices'], ['pay', 'Rises with pay'], ['flat', 'Stays flat']], sug:() => 'prices', help:'The State Pension is set each Budget. It has broadly kept pace with prices over time.'},
  spYears:{g:'retire', b:'B9', l:'How many years of PRSI will you have at 66? (leave blank if you don\'t know)', t:'yrs', min:0, max:45, step:1, sug:() => null, opt:true, help:'A full State Pension needs 40 years of contributions and credits. You need at least 10 years of paid contributions to qualify. Check your record on MyWelfare.'},
  spPartly:{g:'retire', b:'B9', l:'If you don\'t know your years: "Partly" counts as', t:'pct', min:0, max:100, step:5, sug:() => 0.6, help:'Share of the full State Pension we use for "Partly". "Expect full" counts as 100%.'},
  spNotSure:{g:'retire', b:'B9', l:'If you don\'t know your years: "Not sure" counts as', t:'pct', min:0, max:100, step:5, sug:() => 0.8, help:'Share of the full State Pension we use for "Not sure".'},
  ownShare:{g:'retire', b:'B1', l:'Of the money paid into your pension each month, the share you pay yourself (the rest is your employer)', t:'pct', min:0, max:100, step:5, sug:() => S && S.fin.work === 'Self-employed' ? 1 : 0.5, help:'Your payslip shows what comes out of your pay. Your employer\'s share is on your pension statement. Only your own share gets tax relief. If you type your own share in Your finances, we use that.'},
  retireMult:{g:'retire', b:'B17', l:'Retirement savings target: times the yearly income you need', t:'num', min:20, max:33, step:1, sug:() => 25, help:'25 times the yearly income you need is a common rule of thumb (about 4% a year). Retiring early or planning to 95 needs more.'},
  retireSpend:{g:'retire', b:'B18', l:'Retirement spending if you haven\'t set a goal (share of today\'s spending)', t:'pct', min:50, max:120, step:5, sug:() => 0.8, help:'Most people spend a bit less once work costs and the mortgage stop.'},
  lumpSum:{g:'retire', b:'B19', l:'Tax-free lump sum to take at retirement (share of your pension, 0% = none)', t:'pct', min:0, max:25, step:1, sug:() => 0.25, help:'Up to €200,000 is tax-free and the next €300,000 is taxed at 20%. Your adviser can compare it with leaving it invested.'},
  drawRule:{g:'retire', b:'B20', l:'How you draw your pension', t:'choice', o:[['spread', 'Spread to plan end'], ['min', 'Minimum only (4% / 5%)'], ['fixed', 'Fixed amount']], sug:() => 'spread', help:'From 61 you must take at least 4% a year from an ARF (5% from 71). We spread the rest over your plan.'},
  drawFixed:{g:'retire', b:'B20', l:'Fixed amount a year (today\'s money), if you chose "Fixed amount"', t:'eur', min:0, max:200000, step:500, sug:() => 20000, help:'Never less than the legal minimum once you are 61.'},
  safetyMonths:{g:'safety', b:'B16', l:'Safety net: months of essential spending', t:'num', min:3, max:12, step:1, sug:() => twoSecure() ? 3 : 6, help:'Easy-access cash for surprises or a gap in pay. Single-income households and the self-employed usually aim higher. Essential spending = living costs + mortgage + loan repayments.'},
  mortRate:{g:'safety', b:'B13', l:'Mortgage rate (if your statement doesn\'t say)', t:'pct', min:1, max:8, step:0.05, sug:() => 0.0375, help:'New Irish mortgages averaged about 3.5% in mid-2026. The ECB raised rates in September 2026, so new rates may rise.'},
  cardRate:{g:'safety', b:'B14', l:'Credit-card rate, APR (if your statement doesn\'t say)', t:'pct', min:0, max:35, step:0.5, sug:() => 0.20, help:'Most Irish cards charge 13%–23% APR. Your statement shows yours.'},
  loanRate:{g:'safety', b:'B15', l:'Other loans rate, APR (if your statement doesn\'t say)', t:'pct', min:0, max:25, step:0.25, sug:() => 0.08, help:'New Irish personal loans averaged about 7.5% in mid-2026. Credit unions often charge less.'},
  cashYears:{g:'safety', b:'B21', l:'Money for goals sooner than this is kept as cash (years)', t:'yrs', min:1, max:10, step:1, sug:() => 5, help:'Money needed soon is safer in cash. Longer-term money has more time to ride out ups and downs.'},
  investShare:{g:'safety', b:'B21', l:'Spare savings: share invested (the rest stays in cash)', t:'pct', min:0, max:100, step:5, sug:() => 0.4, help:'Longer-term money has more time to ride out ups and downs.'},
  saveShare:{g:'safety', b:'B22', l:'Share of your spare money you save, at most', t:'pct', min:0, max:100, step:5, sug:() => 0.5, help:'We never count more than this share of your spare money as saved, unless you set your own monthly saving.'},
  noAnswer:{g:'safety', b:'B22', l:'Monthly saving if you haven\'t told us how much you could invest', t:'eur', min:0, max:5000, step:25, sug:() => 300, help:'Used until you answer "How much could you comfortably invest each month?".'},
  lifeShare:{g:'safety', b:'B24', l:'Life cover: share of your income your family would need', t:'pct', min:30, max:100, step:5, sug:() => 0.6, help:'Families usually need less than full pay. A State survivor\'s pension may help: €259.50 a week under 66.'},
  lifeYears:{g:'safety', b:'B24', l:'Life cover: years your family would need support', t:'yrs', min:1, max:30, step:1, sug:() => 15, help:'Often until your youngest child is 23.'},
  survivor:{g:'safety', b:'B24', l:'Life cover: State survivor\'s pension a week', t:'eur', min:0, max:400, step:0.5, sug:() => RI.sp.survivor, help:'€259.50 a week under 66 (€299.30 at 66+). Cohabiting partners can now qualify (Bereaved Partner\'s Pension). Enter 0 if it would not be paid.'},
  budgetNeeds:{g:'safety', b:'B27', l:'Budget split: needs', t:'pct', min:0, max:100, step:5, sug:() => 0.5, help:'A starting point. Adjust it to fit your life.'},
  budgetWants:{g:'safety', b:'B27', l:'Budget split: wants', t:'pct', min:0, max:100, step:5, sug:() => 0.3, help:'A starting point. Adjust it to fit your life.'},
  budgetSave:{g:'safety', b:'B27', l:'Budget split: savings and debt', t:'pct', min:0, max:100, step:5, sug:() => 0.2, help:'A starting point. Adjust it to fit your life.'},
  rentRise:{g:'prices', b:'B25', l:'Rent vs buy: rent rises (a year)', t:'pct', min:0, max:8, step:0.5, sug:() => 0.03, help:'Buying has costs that don\'t build equity: interest, stamp duty, fees, LPT and repairs. Renting has rent rises.'},
  houseGrow:{g:'prices', b:'B25', l:'Rent vs buy: house prices rise (a year)', t:'pct', min:0, max:6, step:0.5, sug:() => 0.02, help:'House prices can fall as well as rise.'},
  upkeep:{g:'prices', b:'B25', l:'Rent vs buy: upkeep a year (share of the home value)', t:'pct', min:0, max:3, step:0.1, sug:() => 0.01, help:'Repairs, insurance and maintenance.'},
  buyFees:{g:'prices', b:'B25', l:'Rent vs buy: buying fees (legal and survey), plus stamp duty', t:'eur', min:0, max:10000, step:250, sug:() => 3000, help:'Stamp duty is added on top: 1% up to €1m.'},
  depEarn:{g:'prices', b:'B25', l:'Rent vs buy: what the deposit could earn instead (a year)', t:'pct', min:0, max:6, step:0.25, sug:() => 0.01, help:'If you rent, your deposit stays in savings.'},
  riskMu1:{g:'prices', b:'B26', l:'Risk & return: Cautious style growth (a year)', t:'pct', min:0, max:8, step:0.5, sug:() => 0.02, help:'Illustrations, not forecasts. Your adviser uses the fund\'s own risk rating (SRI 1–7).'},
  riskMu2:{g:'prices', b:'B26', l:'Risk & return: Balanced style growth (a year)', t:'pct', min:0, max:8, step:0.5, sug:() => 0.04, help:'Illustrations, not forecasts.'},
  riskMu3:{g:'prices', b:'B26', l:'Risk & return: Growth style growth (a year)', t:'pct', min:0, max:8, step:0.5, sug:() => 0.06, help:'Illustrations, not forecasts.'},
  riskVol1:{g:'prices', b:'B26', l:'Risk & return: Cautious style ups and downs (volatility)', t:'pct', min:0, max:25, step:1, sug:() => 0.05, help:'How much a year can swing.'},
  riskVol2:{g:'prices', b:'B26', l:'Risk & return: Balanced style ups and downs (volatility)', t:'pct', min:0, max:25, step:1, sug:() => 0.10, help:'How much a year can swing.'},
  riskVol3:{g:'prices', b:'B26', l:'Risk & return: Growth style ups and downs (volatility)', t:'pct', min:0, max:25, step:1, sug:() => 0.16, help:'How much a year can swing.'},
  planEnd:{g:'length', b:'B12', l:'Plan to age', t:'age', min:85, max:100, step:1, sug:() => S && S.about.partner ? 95 : 90, help:'Many people now live into their 90s. Planning further ahead is safer.'},
  startYear:{g:'length', b:'B23', l:'Start the plan in', t:'choice', o:[[2026, '2026'], [2027, '2027']], sug:() => (new Date() > new Date('2026-09-30T23:59:59') ? 2027 : 2026), help:'From October most of this year has passed, so you can start from next year.'}
};
const asmGet = k => S && S.asm && S.asm[k] != null && S.asm[k] !== '' ? S.asm[k] : null;
const asmV = k => { const x = asmGet(k); return x != null ? x : ASM[k].sug(); };
const asmMine = k => asmGet(k) != null;
const ASM_KEYS = () => Object.keys(ASM);
function applyAssume(){ Object.assign(AS, curSet()); AS.infl = S && S.infl != null ? S.infl : INFL_STD;   // inflation is the client's own choice (S.infl); INFL_STD is only an internal fallback before they choose
  ['wage', 'cash', 'inv', 'pen', 'penRet', 'mortRate', 'cardRate', 'loanRate'].forEach(k => { AS[k] = +asmV(k); });
  AS.end = +asmV('planEnd'); AS.sp = RI.sp.week * RI.sp.weeks; AS.spAge = RI.sp.age; YEAR0 = +asmV('startYear');
  SAVE.buffer = +asmV('safetyMonths'); SAVE.longYrs = +asmV('cashYears'); SAVE.share = +asmV('saveShare'); SAVE.noAnswer = +asmV('noAnswer'); }
const INFL_STD = RI.infl.ecb, INFL_IE = RI.infl.ie, INFL_SRC = RI.infl.ieSrc;
const inflSet = () => !!S && S.infl != null;
const pcs = x => +(x * 100).toFixed(2) + '%';
function inflChoice(ctx){ const v = S.infl, std = v === INFL_STD && !S.inflOther, ie = v === INFL_IE && !S.inflOther, oth = !!S.inflOther || (v != null && !std && !ie);
  return '<div class="infl" id="infl-' + ctx + '"><b style="font-size:14px" id="infl-l-' + ctx + '">Prices rising (inflation)</b><p class="small" style="margin:2px 0 6px">Prices in Ireland are rising ' + pcs(INFL_IE) + ' a year right now (' + INFL_SRC + '), mostly because of energy. Over a long plan, planners usually use 2% to 2.5%. Pick what feels right for you.</p>' +
    '<div class="chips" role="group" aria-labelledby="infl-l-' + ctx + '"><button class="chip sm' + (std ? ' sel' : '') + '" aria-pressed="' + std + '" data-a="infl" data-p="' + INFL_STD + '">' + pcs(INFL_STD) + ' · ECB target (long-term)</button><button class="chip sm' + (ie ? ' sel' : '') + '" aria-pressed="' + ie + '" data-a="infl" data-p="' + INFL_IE + '">' + pcs(INFL_IE) + ' · Ireland now (CSO, Sep 2026)</button><button class="chip sm' + (oth ? ' sel' : '') + '" aria-pressed="' + oth + '" data-a="infl" data-p="other">Other</button></div>' +
    (oth ? '<div class="flabel" style="margin-top:6px"><span id="infl-o-' + ctx + '">My own rate (0–10%)</span>' + nbox('infl', 'r', v != null ? +(v * 100).toFixed(2) : 2.5, '%', 'infl-o-' + ctx, {id:'infl-v-' + ctx, dec:true}) + '</div>' + nbHint('infl', 'r') : '') + '</div>'; }
const inflTxt = () => pc(AS.infl) + ' a year';
function assumeToggle(){ const a = (S && S.assume) || 'standard';
  return '<div class="asm"><div class="seg" role="group" aria-label="Growth assumptions" style="margin:0">' + ['standard','cautious'].map(k => '<button class="' + (a === k ? 'on' : '') + '" aria-pressed="' + (a === k) + '" data-a="assume" data-p="' + k + '">' + AS_NAME[k] + '</button>').join('') + '</div><p class="small" style="margin:6px 0 0">' + (a === 'cautious' ? 'Cautious assumes slower growth, so results are lower but safer.' : 'Standard uses typical long-run growth. Cautious assumes slower growth, so results are lower but safer.') + ' Growth is never guaranteed. Inflation is your own choice, below.' + '</p></div>'; }
/* ---------- Irish tax, USC and PRSI (2026 rules from RI; amounts in today's money, bands indexed unless the customer chose "Stay as today") ---------- */
const TX = {get band(){ return RI.it.band; }, get credits(){ return RI.it.personal + RI.it.paye; }, get ageCredit(){ return RI.it.ageCredit; }, get ageExempt(){ return RI.it.ageExempt; }, get usc(){ return RI.usc.bands; }, get uscExempt(){ return RI.usc.exempt; }, get prsiWk(){ return RI.prsi.wkFree; }};
function incomeTax(g, cr, band){ band = band == null ? RI.it.band : band; return Math.max(0, RI.it.r1 * Math.min(g, band) + RI.it.r2 * Math.max(0, g - band) - (cr == null ? RI.it.personal + RI.it.paye : cr)); }
function usc(g, reduced){ if (g <= RI.usc.exempt) return 0; const b = reduced ? RI.usc.reducedBands : RI.usc.bands; let t = 0, lo = 0;
  for (const [hi, r] of b){ t += Math.max(0, Math.min(g, hi) - lo) * r; lo = hi; if (g <= hi) break; } return t; }
// PRSI rate for a calendar year on the legislated path (months before / after each 1 Oct change are blended)
function prsiRate(year){ const P = RI.prsi.path; let s = 0; for (let m = 0; m < 12; m++){ let r = P[0].r; P.forEach(x => { if (year * 12 + m >= x.y * 12 + x.m - 1) r = x.r; }); s += r; } return s / 12; }
function prsiA(g, rate){ const P = RI.prsi, wk = g / 52; if (wk <= P.wkFree) return 0; const cr = wk <= P.creditTo ? Math.max(0, P.creditMax - (wk - (P.wkFree + 0.01)) / P.creditTaper) : 0; return Math.max(0, (wk * rate - cr) * 52); }   // Class A, with the PRSI credit
function prsiS(g, rate){ return g > RI.prsi.sMinIncome ? Math.max(RI.prsi.sMin, g * rate) : 0; }   // Class S: all income if over €5,000, minimum €650, no credit
function prsi(g, rate, se){ rate = rate == null ? prsiRate(YEAR0) : rate; return se ? prsiS(g, rate) : prsiA(g, rate); }
const pc = x => +(x * 100).toFixed(2) + '%';
const relLim = a => { const L = RI.pen.relief; for (const [lim, r] of L) if (a < lim) return r; return L[L.length - 1][1]; };
const spFrac = y => y < RI.sp.minYears ? 0 : Math.min(1, y / RI.sp.fullYears);   // TCA: pro-rata from 10 to 40 years
/* Household income tax, USC and PRSI for one year. p = {emp (gross pay), se, sp (State Pension incl. QA), draw (ARF/PRSA drawdown), other (other + rental income, before tax),
   relief (own pension contributions relieved for income tax), age}. o = {married (joint assessment), spccc, rent (Rent Tax Credit), carer (Home Carer), rate (PRSI)}.
   Returns {it, usc, prsi, total}. Joint assessment in working AND retired years (audit #12, #29, #61). */
function hhTax(p1, p2, o){ const I = RI.it, ps = p2 ? [p1, p2] : [p1], rate = o.rate == null ? prsiRate(YEAR0) : o.rate;
  const tx = p => Math.max(0, p.emp + p.draw + p.other + p.sp - p.relief), paye = p => p.emp + p.draw + p.sp > 0, ageCr = p => p.age >= I.ageCreditAge ? I.ageCredit : 0;
  const itB = (T, band) => I.r1 * Math.min(T, band) + I.r2 * Math.max(0, T - band);
  let it = 0;
  if (o.married && p2){ const x1 = tx(p1), x2 = tx(p2), T = x1 + x2, cr = I.personalMarried + I.paye * (paye(p1) + paye(p2)) + ageCr(p1) + ageCr(p2) + (o.rent ? I.rentJoint : 0);
    it = Math.max(0, itB(T, I.bandMarried + Math.min(Math.min(x1, x2), I.bandUplift)) - cr);
    if (o.carer){ const lo = Math.min(x1, x2), hc = Math.max(0, I.homeCarer - Math.max(0, lo - I.homeCarerLimit) / 2); it = Math.min(it, Math.max(0, itB(T, I.bandMarried) - cr - hc)); }   // the better of the increased band or the Home Carer credit
    if (p1.age >= I.ageCreditAge || p2.age >= I.ageCreditAge){ const L = I.ageExemptMarried; it = T <= L ? 0 : Math.min(it, I.ageMarginal * (T - L)); }   // age exemption with marginal relief
  } else ps.forEach((p, k) => { const x = tx(p), lone = o.spccc && k === 0, band = lone ? I.bandSPCCC : I.band;
    const cr = I.personal + (paye(p) ? I.paye : 0) + ageCr(p) + (lone ? I.spccc : 0) + (o.rent && (k === 0 || x > 0) ? I.rent : 0);
    let a = Math.max(0, itB(x, band) - cr); if (p.age >= I.ageCreditAge){ const L = I.ageExempt; a = x <= L ? 0 : Math.min(a, I.ageMarginal * (x - L)); } it += a; });
  let us = 0, pr = 0;
  ps.forEach(p => { const base = p.emp + p.draw + p.other;   // DSP payments (State Pension) are USC-exempt
    us += usc(base, p.age >= RI.usc.reducedAge && base <= RI.usc.reducedMax) + (p.se ? RI.usc.seSurcharge * Math.max(0, p.emp - RI.usc.seSurchargeOver) : 0);
    if (p.age < RI.prsi.endAge){ pr += (p.se ? prsiS(p.emp, rate) : prsiA(p.emp, rate)) + rate * p.draw + (p.other > RI.prsi.unearnedMin ? rate * p.other : 0); } });   // no PRSI from 66; ARF/PRSA draws and unearned income pay PRSI before 66
  return {it, usc:us, prsi:pr, total:it + us + pr}; }
const P0_ = (o) => Object.assign({emp:0, se:false, sp:0, draw:0, other:0, relief:0, age:40}, o);
// Single-person helpers (also used by tests): take-home pay, and income in retirement
function netPay(g, o){ o = o || {}; const p = P0_({emp:g, se:!!o.se, age:o.age == null ? 40 : o.age, relief:o.relief || 0, sp:o.sp || 0}); return g <= 0 && !p.sp ? 0 : g + p.sp - hhTax(p, null, {rate:o.rate, spccc:o.spccc, rent:o.rent}).total; }
function netRet(draw, sp, age, rate){ const p = P0_({draw, sp, age}); return draw + sp <= 0 ? 0 : draw + sp - hhTax(p, null, {rate}).total; }
// Relief on the employee's own contributions: income tax only, within the age band and the €115,000 earnings cap
const reliefOn = (g, E, age) => Math.min(E, relLim(age) * Math.min(g, RI.pen.earnCap));
function pensionCost(g, E, age, rate){ const Er = reliefOn(g, E, age); return E - (incomeTax(g) - incomeTax(Math.max(0, g - Er))); }
function jointGain(g1, g2){ const a = hhTax(P0_({emp:g1}), P0_({emp:g2}), {married:false, rate:0}).it, b = hhTax(P0_({emp:g1}), P0_({emp:g2}), {married:true, rate:0}).it; return Math.max(0, a - b); }
// Lump sum at retirement (B19): up to 25%, first €200,000 tax-free (lifetime), €200,001–€500,000 at 20%; caps not indexed (nominal)
function lumpSum(potNom, pct){ const P = RI.pen, ls = Math.min(potNom * Math.min(pct, P.lsMaxPct), P.lsCap), tax = P.lsBandRate * Math.max(0, ls - P.lsTaxFree); return {gross:ls, tax, net:ls - tax}; }
const sftFor = yr => { const T = RI.pen.sft, ks = Object.keys(T).map(Number).sort(); return yr <= ks[0] ? T[ks[0]] : T[Math.min(yr, ks[ks.length - 1])] || T[ks[ks.length - 1]]; };
const arfMin = (a, pot) => a >= 61 ? (pot > RI.pen.arfBig ? RI.pen.arfMinBig : a >= 71 ? RI.pen.arfMin71 : RI.pen.arfMin61) : 0;
// APR is an effective annual rate (Directive 2008/48/EC): monthly = (1 + APR)^(1/12) − 1. Mortgages use the nominal rate ÷ 12.
const iAPR = apr => Math.pow(1 + apr, 1 / 12) - 1;
// Saving assumptions shown to the customer
function saveRows(){ const P = project(), k = S.ans['6'], q = DQ_BY('6');
  return [['What you save', 'About ' + eur(P.save.saveM) + ' a month towards your goals (' + (S.saveM != null ? 'your choice' : typeof k === 'number' ? 'from your answer: ' + q.o[k].t : 'assumed ' + eur(SAVE.noAnswer) + ' cap: you haven\'t told us yet') + '; never more than ' + pc(SAVE.share) + ' of your spare money unless you set it)'],
    ['Spare money not saved', 'Assumed spent'], ['Emergency buffer', S.goals.some(g => g.k === 'safety') ? 'Your safety-net goal is your emergency fund' : SAVE.buffer + ' months of essential spending kept aside (you have no safety-net goal)'],
    ['Order your savings go to goals', 'Safety net first, then must-haves, then nice-to-haves, soonest first'], ['Money for goals under ' + SAVE.longYrs + ' years', 'Kept as cash'], ['Tax for couples', S.about.partner && S.about.married === true ? 'Joint assessment (married / civil partners), also once retired' : 'Taxed as individuals'], ['Known limits', 'Living costs stay the same through the plan; your partner\'s own pension and retirement age aren\'t modelled; drawdown assumed from an ARF / vested PRSA']]; }
const assumeRows = () => (applyAssume(), [['Rules', RULES_VERSION], ['Growth assumptions', AS_NAME[S.assume || 'standard'] + (ASM_KEYS().some(asmMine) ? ', with your own changes' : '') + ' (your choice)'], ['Prices rise (inflation)', inflSet() ? pc(AS.infl) + ' a year (your choice; ECB target 2%, Ireland now ' + pcs(INFL_IE) + ', ' + INFL_SRC + ')' : 'Not chosen yet'], ['Pay rises', pc(AS.wage) + ' a year'], ['Cash savings grow', pc(AS.cash) + ' a year, after DIRT'], ['Investments grow', pc(AS.inv) + ' a year, after charges and exit tax'], ['Pensions grow', pc(AS.pen) + ' a year after charges (' + pc(AS.penRet) + ' once retired)'],
  ['State Pension', eur(AS.sp) + ' a year from ' + AS.spAge + ' (' + (S.fin.sp || 'Not sure') + '); taxable, no USC; rises ' + {prices:'with prices', pay:'with pay', flat:'not at all'}[asmV('spGrow')]], (retireGoal() ? ['Retirement age', '' + S.retireAge] : ['Work income stops at', 'Age ' + S.retireAge + ' (from About you; no retirement goal)']), ['Tax', '2026 Irish income tax, USC and PRSI (PRSI 4.2% to Sep 2026, 4.35% from Oct 2026, 4.5% from Oct 2027, 4.7% from Oct 2028; none from 66); bands ' + (asmV('bands') === 'flat' ? 'stay as today' : 'assumed to rise with prices')],
  ['At retirement', asmV('lumpSum') > 0 ? Math.round(asmV('lumpSum') * 100) + '% of your pension taken as a lump sum: up to €200,000 tax-free, the next €300,000 taxed at 20%' : 'No lump sum taken'], ['Pension drawdown', {spread:'Spread to the end of the plan, at least the ARF minimum (4% from 61, 5% from 71)', min:'The ARF minimum only (4% from 61, 5% from 71)', fixed:eur(asmV('drawFixed')) + ' a year (today\'s money), at least the ARF minimum'}[asmV('drawRule')] + '; pensions are drawn from 60 at the earliest'], ...saveRows(), ['Plan starts', '' + YEAR0], ['Plan ends', 'Age ' + AS.end]].concat(ASM_KEYS().filter(asmMine).length ? [['Your own settings', ASM_KEYS().filter(asmMine).map(k => ASM[k].l.replace(/ \(.*\)$/, '') + ': ' + asmFmt(ASM[k], asmV(k)) + ' (your choice)').join('; ')]] : []).concat(S.needs && (S.needs.life || S.needs.ip) ? [['Protection needs noted for your adviser', [S.needs.life ? 'life cover ' + eur(S.needs.life) : '', S.needs.ip ? 'income protection ' + eur(S.needs.ip) + ' a month' : ''].filter(Boolean).join(', ')]] : []));
// Debts: credit cards and other loans amortise separately at their APR (effective). A stated repayment is used if it more than covers the interest; otherwise a 5-year repayment is estimated.
function debtNums(n){ const cR = n('cardRate') > 0 ? n('cardRate') / 100 : AS.cardRate, lR = n('loanRate') > 0 ? n('loanRate') / 100 : AS.loanRate, c = n('cardBal'), l = n('loanBal') + n('debt'), lp = n('loanPayM') + n('debtPayM'), cp = n('cardPayM');
  const ok = (b, p, r) => b > 0 && p > b * iAPR(r), pay = (b, p, r) => ok(b, p, r) ? p : pmtM(b, iAPR(r), 60), cardPayM = c > 0 ? pay(c, cp, cR) : 0, loanPayM = l > 0 ? pay(l, lp, lR) : 0;
  return {cardBal:c, cardRate:cR, cardPayM, cardPayEst:c > 0 && !ok(c, cp, cR), loanBal:l, loanRate:lR, loanPayM, loanPayEst:l > 0 && !ok(l, lp, lR), debt:c + l, debtPayM:cardPayM + loanPayM, debtPayEst:(c > 0 && !ok(c, cp, cR)) || (l > 0 && !ok(l, lp, lR))}; }
function finNums(){
  // Skipped figures count as €0 and show as ❓ Missing. Only "Estimate for me" adds a (labelled) typical figure. (spec §11)
  const f = S.fin, n = k => { const v = f[k]; return v != null && v !== '' && !isNaN(+v) ? +v : 0; };
  const mortOn = f.home === 'Own with mortgage', mR = n('mortRate') > 0 ? n('mortRate') / 100 : AS.mortRate, mStated = mortOn ? n('mortPayM') : 0, inc = f.work === 'Not working' ? 0 : n('income');
  const penM = f.work !== 'Not working' && inc > 0 ? n('pensionM') : 0, own = f.pensionOwnM != null && f.pensionOwnM !== '' && !isNaN(+f.pensionOwnM) ? Math.min(penM, +f.pensionOwnM) : penM * asmV('ownShare');
  const yrsSP = f.spYears != null && f.spYears !== '' ? +f.spYears : asmGet('spYears'), spF = yrsSP != null ? spFrac(+yrsSP) : f.sp === 'Expect full' ? 1 : f.sp === 'Partly' ? +asmV('spPartly') : +asmV('spNotSure');
  const pSpO = S.about.partner ? (f.pSp || 'Not sure') : 'None', pSp = {'Own full':1, 'Own partial':+asmV('spPartly'), 'Not sure':+asmV('spNotSure'), 'Qualified adult increase':'qa', 'None':0}[pSpO];
  const aeElig = f.work === 'Employed' && S.about.age >= RI.ae.ageMin && S.about.age <= RI.ae.ageMax && inc > RI.ae.earnMin && penM === 0;
  const C = S.about.cred || {};
  return {age:S.about.age, R:S.retireAge, work:f.work, married:!!S.about.partner && S.about.married === true, partner:!!S.about.partner, pAge:n('pAge') || S.about.age, income:inc, pIncome:S.about.partner ? n('pIncome') : 0,
    otherM:n('otherM'), costsM:n('costsM'), oneOffY:n('oneOffY'), cash:n('cash'), invest:n('invest'), rentM:n('rentM'),
    mortBal:mortOn ? n('mortBal') : 0, mortRate:mR, mortPayM:mortOn ? (mStated || mPmt(n('mortBal'), mR, n('mortYears') || 25)) : 0, mortPayEst:mortOn && !mStated, mortPayLow:mortOn && mStated > 0 && n('mortBal') > 0 && mStated < mPmt(n('mortBal'), mR, n('mortYears') || 25) - 1, mortYears:mortOn ? n('mortYears') : 0,
    ...debtNums(n),
    pension:n('pension'), pensionM:penM, pensionOwnM:own, penG:penGrowth(), sp:spF, pSp, pSpO, ae:aeElig && f.ae !== 'No', aeElig,
    rentCred:!!C.rent && f.home === 'Rent', spccc:!!C.lone && S.about.deps > 0 && !S.about.partner, carer:!!C.carer && !!S.about.partner && S.about.married === true};
}
// Essential spending a month (B16: the same everywhere): living costs + mortgage + loan repayments
const essM = F => (F = F || finNums(), F.costsM + F.mortPayM + (F.debt > 0 ? F.debtPayM : 0));
// FP round 6: stated figures are used as stated. The mortgage repayment is the one on the statement (or typed); the standard
// formula is only an estimate when no repayment is given. Monthly amortisation, at the statement's rate when we have it.
function mPmt(bal, r, yrs){ const i = r / 12, n = Math.max(1, Math.round(yrs * 12)); return bal > 0 ? (i ? bal * i / (1 - Math.pow(1 + i, -n)) : bal / n) : 0; }
function pmtM(bal, i, n){ return bal > 0 ? (i ? bal * i / (1 - Math.pow(1 + i, -n)) : bal / n) : 0; }
function amortYear(bal, r, payM, iM){ const i = iM != null ? iM : r / 12; let paid = 0; for (let m = 0; m < 12 && bal > 0.5; m++){ const it = bal * i, p = Math.min(payM, bal + it); paid += p; bal = bal + it - p; } return {bal:Math.max(0, bal), paid}; }
// Pension growth after charges: the assumption set's rate assumes typical charges (B6, about 1% a year); a statement's own charges replace that.
const PEN_TYP_CHG = 0.01;
const penTypChg = () => +asmV('penChg');
function penGrowth(){ const c = S.fin && S.fin.penChg != null && S.fin.penChg !== '' && !isNaN(+S.fin.penChg) ? +S.fin.penChg / 100 : null; return c == null ? AS.pen : AS.pen + penTypChg() - c; }
// Pension pot after y years: grows yearly, contributions rise with pay. The plan (project) and the Retirement tool both use this rule.
function pensionAt(y, pot, monthly, g, w){ for (let t = 0; t < y; t++) pot = pot * (1 + g) + monthly * 12 * Math.pow(1 + w, t); return pot; }
/* ===== Honest goal funding (FP review round 3). Replaces project(); same return shape {rows, pct} plus P.goal and P.save ===== */
const SAVE = {
  band:[50, 200, 500, 1000, null],   // Q6 option index -> monthly amount, today's money (band midpoint; "Over €750" -> €1,000; "varies" -> share only)
  share:0.5,                         // at most half of the measured monthly spare money is saved
  shareVaries:0.33,                  // "It changes month to month": a third
  noAnswer:300,                      // Q6 not answered: €300 a month cap (shown as an assumption)
  buffer:6,                          // B16: months of essential spending kept back as an emergency buffer when there is no safety-net goal (set from the customer's assumptions)
  longYrs:5                          // goals 5+ years away grow at the investment rate, sooner ones at the cash rate
};
const GOAL_ORDER = (a, b) => (a.k === 'safety' ? 0 : 1) - (b.k === 'safety' ? 0 : 1)       // safety net first, always
  || (a.prio === 'Nice to have' ? 1 : 0) - (b.prio === 'Nice to have' ? 1 : 0)            // then Must have before Nice to have
  || a.age - b.age || a.id - b.id;                                                          // then by date
// Saving that grows with pay (w) into a pot growing at r: value after n years of 1 a year (paid at the start of each year)
const annF = (n, r, w) => { let s = 0; for (let t = 0; t < n; t++) s += Math.pow(1 + w, t) * Math.pow(1 + r, n - t); return s; };
function saveAuto(surplusM){                                 // the Q6 rule: monthly saving, today's money, before what-if
  const k = typeof S.ans['6'] === 'number' ? S.ans['6'] : null, sp = Math.max(0, surplusM);
  if (k === 4) return SAVE.shareVaries * sp;
  const cap = k == null ? SAVE.noAnswer : SAVE.band[k];
  return Math.min(cap, SAVE.share * sp);
}
// FP round 5: the customer's own "My monthly saving" (S.saveM, today's money) is this year's amount. Raising it above the
// Q6 rule keeps the rule's later growth (never less than the rule in any year); lowering it caps every year. Monotone in S.saveM and in income.
function saveCap(surplusM, auto0){ const sp = Math.max(0, surplusM), auto = saveAuto(sp);
  if (S.saveM == null) return auto;
  const up = S.saveUp != null ? S.saveUp : S.saveM >= auto0 - 0.5;   // fixed when the customer moves the control (S.saveUp), so a later income change can't flip it
  return Math.min(sp, up ? Math.max(S.saveM, auto) : Math.min(S.saveM, auto)); }
function project(wi){
  applyAssume();
  const f = finNums(), a0 = f.age, R = f.R, N = AS.end - a0, rg = S.goals.find(g => g.kind === 'retire');
  wi = wi || {}; const wg = wi.g != null ? S.goals.find(g => g.id === wi.g) : null, wm = +wi.m || 0, wl = +wi.l || 0;
  const wgR = wg && wg.kind === 'retire';
  // Goals funded from savings: spend, mfree, pot. Retirement uses the pension + cashflow; legacy is what is left at the end.
  const fg = S.goals.filter(g => ['spend','mfree','pot'].includes(g.kind)).map(g => Object.assign({}, g, {age:clamp(g.age, a0 + 1, AS.end)})).sort(GOAL_ORDER);
  // Mortgage balance path, so "Be mortgage-free" has a known cost at its date
  const mPath = []; { let m = f.mortBal; for (let t = 0; t <= N; t++){ mPath.push(Math.max(0, m)); if (m > 1) m = amortYear(m, f.mortRate, f.mortPayM).bal; } }
  const G = {}; fg.forEach(g => { const n = Math.max(0, g.age - a0), r = n >= SAVE.longYrs ? AS.inv : AS.cash;
    const cost = g.kind === 'mfree' ? (f.mortBal > 0 ? mPath[Math.min(n + 1, N)] : g.amount * Math.pow(1 + AS.infl, n)) : g.amount * Math.pow(1 + AS.infl, n);
    G[g.id] = {g, n, r, cost, pot:0, paid:0, done:false, c0:0, cSum:0, cYrs:0, need0:0}; });
  // 1. Lump sums. Each goal's own "saved so far" first (taken from cash), then a buffer is held back, then free cash + investments in goal order.
  let cash = f.cash, inv = f.invest, pen = f.pension, mBal = f.mortBal, cBal = f.cardBal, lBal = f.loanBal, mfreeDone = false;
  fg.forEach(g => { const s = Math.min(g.saved || 0, cash); G[g.id].pot += s; cash -= s; });
  if (wg && !wgR && G[wg.id]) G[wg.id].pot += wl; if (wgR) pen += wl;
  const hasSafety = fg.some(g => g.k === 'safety');
  let buffer = hasSafety ? 0 : Math.min(cash, SAVE.buffer * essM(f)); cash -= buffer;   // B16: months of essential spending
  let free = cash + inv;                                       // unallocated money (spent first in a shortfall, funds retirement and legacy)
  fg.forEach(g => { const x = G[g.id], want = Math.max(0, x.cost / Math.pow(1 + x.r, x.n) - x.pot), take = Math.min(want, free); x.pot += take; free -= take; });
  const sh = +asmV('investShare'), gr = (1 - sh) * AS.cash + sh * AS.inv;   // B21: unallocated money, cash / invested mix
  const gf = {}; S.goals.forEach(g => gf[g.id] = {cost:0, cov:0});
  const rows = []; let auto0 = 0;
  const V = Math.max(R, RI.pen.earliestAge), lsPct = +asmV('lumpSum'), rule = asmV('drawRule'), fixedReal = +asmV('drawFixed'), spG = asmV('spGrow'), flatBands = asmV('bands') === 'flat';
  const penExtraM = +(S.penExtra || 0), ownBase = f.pensionM > 0 ? f.pensionOwnM / f.pensionM : 0;
  for (let t = 0; t <= N; t++){
    const a = a0 + t, yr = YEAR0 + t, infl = Math.pow(1 + AS.infl, t), wgw = Math.pow(1 + AS.wage, t), working = a < R, tI = flatBands ? 1 : infl, rate = prsiRate(yr);
    const spI = spG === 'pay' ? wgw : spG === 'flat' ? 1 : infl;   // B11
    // --- person 1
    const p1 = {emp:0, se:f.work === 'Self-employed', sp:0, draw:0, other:(f.otherM + f.rentM) * 12 * infl, relief:0, age:a};
    let cashOut = 0;   // own pension and auto-enrolment contributions (come out of take-home pay)
    if (working){
      const gR = f.income * wgw, E = (f.pensionOwnM + penExtraM) * 12 * wgw, Etot = (f.pensionM + penExtraM) * 12 * wgw;
      p1.emp = gR; p1.relief = reliefOn(gR / tI, E / tI, a) * tI; cashOut += E;
      let contrib = Etot; if (wgR) contrib = Math.max(0, contrib + wm * 12);
      if (f.ae){ const base = Math.min(gR / tI, RI.ae.earnCap) * tI; contrib += (RI.ae.ee + RI.ae.er + RI.ae.state) * base; cashOut += RI.ae.ee * base; }   // auto-enrolment (phase 1 rates)
      pen = pen * (1 + f.penG) + contrib;   // same rule as pensionAt() (Retirement tool)
    } else if (a < V){ pen = pen * (1 + f.penG); }   // retired before 60: most pensions can't be drawn yet; the fund stays invested
    else {
      if (a === V){ const cet = RI.pen.sftRate * Math.max(0, pen - sftFor(yr)); pen -= cet;   // Standard Fund Threshold (chargeable excess tax)
        if (lsPct > 0){ const L = lumpSum(pen, lsPct); pen -= L.gross; free += L.net; } }
      const mn = arfMin(a, pen), want = rule === 'min' ? pen * mn : rule === 'fixed' ? Math.max(fixedReal * infl, pen * mn) : pen * Math.max(1 / Math.max(1, AS.end - a + 1), mn);
      const draw = Math.min(pen, want); pen = (pen - draw) * (1 + AS.penRet); p1.draw = draw;
    }
    if (a >= AS.spAge) p1.sp = AS.sp * f.sp * spI + (a >= 80 ? RI.sp.over80 * RI.sp.weeks * spI : 0);
    // --- partner (employment to 66, then their State Pension or a Qualified Adult increase paid to you)
    let p2 = null;
    if (f.partner){ const pa = f.pAge + t; p2 = {emp:pa < 66 ? f.pIncome * wgw : 0, se:false, sp:0, draw:0, other:0, relief:0, age:pa};
      if (pa >= 66 && f.pSp !== 'qa') p2.sp = AS.sp * (+f.pSp || 0) * spI;
      if (f.pSp === 'qa' && a >= AS.spAge && p2.emp === 0) p1.sp += (pa >= 66 ? RI.sp.qa66 : RI.sp.qaUnder66) * RI.sp.weeks * spI; }
    const scale = p => p && Object.assign({}, p, {emp:p.emp / tI, sp:p.sp / tI, draw:p.draw / tI, other:p.other / tI, relief:p.relief / tI});
    const T = hhTax(scale(p1), scale(p2), {married:f.married, spccc:f.spccc, rent:f.rentCred && yr <= RI.it.rentLastYear, carer:f.carer, rate});
    const gross = p1.emp + p1.sp + p1.draw + p1.other + (p2 ? p2.emp + p2.sp : 0);
    let inflow = gross - T.total * tI - cashOut;
    let living = (working ? f.costsM * 12 : (rg ? rg.amount : f.costsM * 12 * +asmV('retireSpend'))) * infl + f.oneOffY * infl;
    let fixed = 0;
    if (mBal > 1 && !mfreeDone){ const y = amortYear(mBal, f.mortRate, f.mortPayM); fixed += y.paid; mBal = y.bal; }   // FP round 6: monthly, at the stated repayment
    if (cBal > 1){ const y = amortYear(cBal, 0, f.cardPayM, iAPR(f.cardRate)); fixed += y.paid; cBal = y.bal; }   // credit cards (APR effective)
    if (lBal > 1){ const y = amortYear(lBal, 0, f.loanPayM, iAPR(f.loanRate)); fixed += y.paid; lBal = y.bal; }   // other loans (APR effective)
    // 2. Goals due this year are paid from their own pot, then from unallocated money. What can't be paid is a goal gap (shown on the road).
    let goalPaid = 0, goalGap = 0, goalCost = 0; const due = [], dueG = [];
    fg.forEach(g => { const x = G[g.id]; if (x.done || g.age > a) return; x.done = true; due.push(g.name);
      if (g.kind === 'pot'){ x.paid = Math.min(x.cost, x.pot); goalGap += x.cost - x.paid;
        if (g.k === 'safety') buffer += x.pot; else free += x.pot; x.pot = 0; }          // the safety net stays as the buffer; a wealth pot becomes free money
      else { let pay = Math.min(x.cost, x.pot); x.pot -= pay; const top = Math.min(x.cost - pay, free); free -= top; pay += top; free += x.pot; x.pot = 0;
        x.paid = pay; goalPaid += pay; goalGap += x.cost - pay; if (g.kind === 'mfree' && pay >= x.cost - 1){ mfreeDone = true; mBal = 0; } else if (g.kind === 'mfree') mBal = Math.max(0, mBal - pay); }
      gf[g.id].cost = x.cost; gf[g.id].cov = x.paid; goalCost += x.cost; dueG.push({id:g.id, name:g.name, e:g.e, kind:g.kind, cost:x.cost, paid:x.paid}); });   // exposed for the Detail chart
    // 3. Spare money this year. Only the saving amount is saved; the rest is assumed spent.
    const net = inflow - living - fixed; let used = 0, short = 0, saved = 0, spent = 0;
    if (t === 0) auto0 = saveAuto(Math.max(0, net) / 12);         // the Q6 rule's amount today (FP round 5)
    if (net >= 0){
      const base = working ? saveCap(net / 12 / infl, auto0) * 12 * infl : 0;
      let budget = Math.max(0, base + (!wgR && wm < 0 && working ? wm * 12 * infl : 0));         // "saving less" lowers the saving amount
      const extra = !wgR && wm > 0 && working && wg && G[wg.id] && !G[wg.id].done ? wm * 12 * infl : 0;  // "extra towards X" (today's money, kept level in real terms)
      budget = Math.min(budget, net); const ex = Math.min(extra, net - budget); saved = budget + ex; spent = net - saved;
      if (ex > 0){ const x = G[wg.id], n = x.g.age - a, need = Math.max(0, (x.cost - x.pot * Math.pow(1 + x.r, n)) / annF(n, x.r, AS.wage)), give = Math.min(ex, need);
        x.pot += give; x.cSum += give / infl; free += ex - give; if (t === 0) x.c0 += give; }
      fg.forEach(g => { const x = G[g.id]; if (x.done) return; const n = g.age - a;
        const need = Math.max(0, (x.cost - x.pot * Math.pow(1 + x.r, n)) / annF(n, x.r, AS.wage)), give = Math.min(budget, need);
        if (t === 0) x.need0 = need; x.pot += give; budget -= give; x.cSum += give / infl; x.cYrs++; if (t === 0) x.c0 += give; });
      free += budget;                                              // saved but not needed by any goal: unallocated
      if (!working){ free += spent; saved += spent; spent = 0; }   // FP round 4 F7: retired income above the spending goal stays in savings
    } else {
      fg.forEach(g => { const x = G[g.id]; if (!x.done){ x.cYrs++; if (t === 0) x.need0 = Math.max(0, (x.cost - x.pot * Math.pow(1 + x.r, g.age - a)) / annF(g.age - a, x.r, AS.wage)); } });
      let gap = -net; const take = v => { const d = Math.min(gap, v); gap -= d; used += d; return d; };
      free -= take(free); buffer -= take(buffer);
      fg.slice().reverse().forEach(g => { const x = G[g.id]; if (!x.done && gap > 0) x.pot -= take(x.pot); });   // Nice-to-have and latest goals give way first
      short = gap;
    }
    // 4. Growth
    free *= 1 + gr; buffer *= 1 + AS.cash; fg.forEach(g => { const x = G[g.id]; if (!x.done) x.pot *= 1 + x.r; });
    if (rg && !working){ gf[rg.id].cost += living; gf[rg.id].cov += living - Math.min(short, living); }
    const pots = fg.reduce((s, g) => s + G[g.id].pot, 0), liquid = free + buffer + pots;
    S.goals.forEach(g => { if (g.kind === 'legacy' && t === N){ const tgt = g.amount * infl; gf[g.id].cost = tgt; gf[g.id].cov = Math.min(tgt, free + buffer); } });
    rows.push({t, a, yr, inflow, needs:living + fixed, goalPaid, living, fixed, goalCost, dueG, short:short + goalGap, shortLiving:short, goalGap, due, used, saved, spent, liquid, pen, retired:!working, rmark:a === R, tax:T.total * tI, gross});
  }
  // 5. Results. Floor, so 99.6% never reads as 100%.
  const pct = {}, goal = {};
  S.goals.forEach(g => { const x = gf[g.id]; pct[g.id] = x.cost > 0 ? (x.cov >= x.cost - 1 ? 100 : clamp(Math.floor(x.cov / x.cost * 100), 0, 99)) : 100; });
  fg.forEach(g => { const x = G[g.id];
    goal[g.id] = {cost:x.cost, have:x.paid, rate:x.r, years:x.n,
      needM:Math.round(x.need0 / 12), nowM:Math.round(x.c0 / 12), avgM:x.cYrs ? Math.round(x.cSum / x.cYrs / 12) : 0}; });
  fg.forEach(g => { if (pct[g.id] < 95){ const r = rows[g.age - a0]; if (r) r.goalShort = true; } });   // FP round 4 F1: colours follow the %
  if (rg && rows.some(r => r.retired && r.shortLiving > Math.max(500, r.needs * 0.02))) pct[rg.id] = Math.min(pct[rg.id], 94);
  const s0 = rows[0], sur0 = f.age < R ? (s0.saved + s0.spent) / 12 : 0;
  return {rows, pct, goal, save:{surplusM:Math.round(sur0), saveM:Math.round(s0.saved / 12), autoM:auto0}};
}
const band = p => p >= 95 ? 'good' : p >= 70 ? 'nudge' : 'alert';   // teal / gold / coral (Pooja, 1 Oct); weather emojis stay as icons
const BANDW = {good:'On track', nudge:'Needs a nudge', alert:'Needs attention'}, BANDE = {good:'☀️', nudge:'🌦️', alert:'⛈️'};
const isShort = r => r.shortLiving > Math.max(500, r.needs * 0.02) || !!r.goalShort;
const rowCol = r => isShort(r) ? 'var(--alert)' : r.used > 1 ? 'var(--nudge)' : 'var(--good)';
function extraFor(g){ for (const m of [25,50,75,100,150,200,250,300,400,500,600,750,1000,1250,1500,2000]){ if (project({g:g.id, m, l:0}).pct[g.id] >= 95) return m; } return null; }
function DQ_BY(){ return {o:[]}; } function nbox(){return '';} function nbHint(){return '';}
module.exports={project,finNums,netPay,netRet,incomeTax,usc,prsi,pensionCost,mkGoal,AS,TX,isShort,rowCol,band,SAVE,setS:s=>{S=s},getS:()=>S};
