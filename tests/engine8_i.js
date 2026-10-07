let S;
const RULES_VERSION = 'Irish rules 2026 · checked 2 Oct 2026';
const RV_ = (v, src, eff, verify, by) => ({v, src, eff, verify:verify !== false, by});   // by = the source as the customer sees it
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
    payeCapPct:RV_(0.20, 'https://revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/income-and-employment/employee-tax-credit/index.aspx', '2026'),
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
    ieSrc:RV_('CSO HICP flash, Sep 2026', 'https://www.cso.ie', '1 Oct 2026')
  },
  // Regulatory facts quoted in copy (law: fixed for everyone). The standards and guidance figures are in SETTINGS below.
  guide:{
    cardCap:RV_(0.23, 'https://www.centralbank.ie/news/article/central-bank-review-finds-over-400-000-credit-cards-are-on-historic-high-interest-rates', '2022', true, 'Central Bank of Ireland'),
    schemeEarliest:RV_(50, 'https://www.revenue.ie/en/tax-professionals/tdm/pensions/index.aspx', 'Law', true, 'some occupational schemes')
  }
};
// RI: plain values read by every function (RI.it.band = 44000 …)
const RI = (function unwrap(o){ const r = {}; Object.keys(o).forEach(k => { const x = o[k]; r[k] = x && typeof x === 'object' && 'v' in x && 'src' in x ? x.v : unwrap(x); }); return r; })(RULES_IE_2026);
// Law figures quoted in copy, built once from the register (§14: every figure quoted once, from the single rules register)
const LAW = {ls:'up to ' + '€' + RI.pen.lsTaxFree.toLocaleString('en-IE') + ' tax-free and the next €' + (RI.pen.lsCap - RI.pen.lsTaxFree).toLocaleString('en-IE') + ' taxed at ' + Math.round(RI.pen.lsBandRate * 100) + '%',
  arf:'from 61 you must take at least ' + Math.round(RI.pen.arfMin61 * 100) + '% a year (' + Math.round(RI.pen.arfMin71 * 100) + '% from 71)',
  sp:'A full State Pension needs ' + RI.sp.fullYears + ' years (' + (RI.sp.fullYears * 52).toLocaleString('en-IE') + ' weeks) of PRSI contributions and credits. You need at least ' + RI.sp.minYears + ' years of paid contributions to qualify.',
  ae:'Employees aged ' + RI.ae.ageMin + '–' + RI.ae.ageMax + ' earning over €' + RI.ae.earnMin.toLocaleString('en-IE') + ' with no pension are enrolled from ' + RI.ae.start + ': you pay ' + RI.ae.ee * 100 + '% of pay, your employer ' + RI.ae.er * 100 + '% and the State ' + RI.ae.state * 100 + '%.',
  stamp:Math.round(RI.home.stamp[0][1] * 100) + '% up to €' + (RI.home.stamp[0][0] / 1e6) + 'm'};
/* ================= SETTINGS (journey-spec §19.6, option C) =================
   ONE block, controlled by LifeMap or a partner (a credit union, adviser firm, company or agent), holding every STANDARD the app suggests with its
   wording, source and label. The same block is the "Settings" sheet in the workbook. A customer can change any of them for their own plan
   ("Use the standard (X)" is the one-tap chip, still their own choice, so §14 holds). Not here, and fixed for everyone: law values (RULES_IE_2026).
   Never given a standard, anywhere: retirement age and life expectancy (plan-until age): those are only guidance.
   v = the LifeMap standard · pv = the partner's figure (blank = none; every overridden figure then reads "Suggested by [partner]")
   by = source wording after "Generally the standard is X (…)" · label = chip suffix for market rates · guide = the guidance sentence
   src / asat / verify = where it comes from, as at when, and whether to open the page before release. v:null = no published figure, so no suggestion. */
const CBI_RATES = 'https://www.centralbank.ie/statistics/data-and-analysis/credit-and-banking-statistics/retail-interest-rates';
const SETTINGS = {partner:'', s:{
  infl:{n:'Inflation: prices rise (a year)', u:'pct', grp:'Prices & growth', v:0.02, by:'the ECB target for the long term', src:'https://www.bundesbank.de/en/tasks/topics/european-central-bank-updates-monetary-policy-strategy-970824', asat:'2025 strategy', verify:true},
  wage:{n:'Pay rises (a year)', u:'pct', grp:'Prices & growth', v:0.03, by:'Irish pay has grown about 3%–4% a year recently (CSO)', src:'https://www.cso.ie/en/statistics/earnings/', asat:'2026', verify:true, vc:0.025, guide:'Pick lower if your pay is fixed or you expect to work part-time.'},
  cash:{n:'Cash savings earn (a year, after DIRT)', u:'pct', grp:'Prices & growth', v:0.01, by:'Irish deposit rates after 33% DIRT', src:'https://centralbank.ie/statistics/data-and-analysis/credit-and-banking-statistics/retail-interest-rates', asat:'Jun 2026', verify:true, vc:0.007},
  inv:{n:'Investments grow (a year, after charges and tax)', u:'pct', grp:'Prices & growth', v:0.035, by:'a typical mixed fund after about 1% charges and 38% exit tax', src:'deliverables/irish-rules-and-rates-audit.md §3 B3', asat:'2026', verify:true, vc:0.025, guide:'Growth is never guaranteed.'},
  invGross:{n:'Investments grow before fees and tax (a year; growth and fees tools)', u:'pct', grp:'Prices & growth', v:0.05, by:'LifeMap standard, not a forecast', src:'deliverables/irish-rules-and-rates-audit.md §3 B3', asat:'2026', verify:true, guide:'Used by the lump sum, regular investing, fees and real return tools. Growth is never guaranteed.'},
  pen:{n:'Pension grows while you work (a year, after charges)', u:'pct', grp:'Prices & growth', v:0.045, by:'a typical pension fund after charges', src:'deliverables/irish-rules-and-rates-audit.md §3 B5', asat:'2026', verify:true, vc:0.04, guide:'Pension growth is tax-free inside the fund.'},
  penRet:{n:'Pension grows once retired (a year, after charges)', u:'pct', grp:'Prices & growth', v:0.0315, by:'a lower-risk fund once retired, after charges', src:'deliverables/irish-rules-and-rates-audit.md §3 B5', asat:'2026', verify:true, vc:0.028, guide:'Most people take less risk once retired, so growth is usually lower.'},
  rentRise:{n:'Rent vs buy: rent rises (a year)', u:'pct', grp:'Home', v:0.03, by:'a long-run planning figure', src:'deliverables/irish-rules-and-rates-audit.md §3 B25', asat:'2026', verify:true, guide:'Renting has rent rises. Buying has costs that don\'t build equity: interest, stamp duty, fees, LPT and repairs.'},
  houseGrow:{n:'Rent vs buy: house prices rise (a year)', u:'pct', grp:'Home', v:0.02, by:'a long-run planning figure; prices can fall', src:'deliverables/irish-rules-and-rates-audit.md §3 B25', asat:'2026', verify:true, guide:'House prices can fall as well as rise.'},
  upkeep:{n:'Rent vs buy: upkeep a year (share of home value)', u:'pct', grp:'Home', v:0.01, by:'repairs, insurance and maintenance', src:'deliverables/irish-rules-and-rates-audit.md §3 B25', asat:'2026', verify:false},
  ownShare:{n:'Share of pension contributions you pay yourself', u:'pct', grp:'Retirement', v:0.5, by:'a common 5% + 5% split with your employer; 100% if self-employed', src:'deliverables/irish-rules-and-rates-audit.md §3 B1', asat:'2026', verify:false, guide:'Your payslip shows what comes out of your pay. Only your own share gets tax relief. If you type your own amount in Your finances, we use that.'},
  retireMult:{n:'Retirement savings target: times the yearly income needed', u:'num', grp:'Retirement', v:25, by:'a common rule of thumb, about 4% a year', src:'deliverables/irish-rules-and-rates-audit.md §3 B17', asat:'2026', verify:false, guide:'Retiring early or planning to 95 needs more.'},
  retireSpend:{n:'Retirement spending if no goal (share of today\'s spending)', u:'pct', grp:'Retirement', v:0.8, by:'most people spend a bit less once work costs and the mortgage stop', src:'deliverables/irish-rules-and-rates-audit.md §3 B18', asat:'2026', verify:false},
  lumpSum:{n:'Tax-free lump sum to take (share of pension; law limit 25%)', u:'pct', grp:'Retirement', v:0.25, by:'most people take the full tax-free amount', src:'deliverables/irish-rules-and-rates-audit.md §3 B19', asat:'Law limit 25%', verify:false},
  safetyMonths:{n:'Emergency fund: months of essential spending', u:'num', grp:'Emergency fund & saving', v:6, by:'6 months for a single income or self-employed, 3 for two secure incomes', src:'deliverables/irish-rules-and-rates-audit.md §3 B16', asat:'2026', verify:false, guide:'Easy-access cash for surprises or a gap in pay. Essential spending = living costs + mortgage + loan repayments.'},
  safetyMonthsTwo:{n:'Emergency fund: months with two secure incomes', u:'num', grp:'Emergency fund & saving', v:3, by:'two secure incomes', src:'deliverables/irish-rules-and-rates-audit.md §3 B16', asat:'2026', verify:false},
  cashYears:{n:'Money for goals sooner than this is kept as cash (years)', u:'yrs', grp:'Emergency fund & saving', v:5, by:'money needed within 5 years is usually kept as cash', src:'deliverables/irish-rules-and-rates-audit.md §3 B21', asat:'2026', verify:false, guide:'Longer-term money has more time to ride out ups and downs.'},
  investShare:{n:'Spare savings: share invested', u:'pct', grp:'Emergency fund & saving', v:0.4, by:'a balanced cash and invested mix', src:'deliverables/irish-rules-and-rates-audit.md §3 B21', asat:'2026', verify:false},
  saveShare:{n:'Share of spare money saved, at most', u:'pct', grp:'Emergency fund & saving', v:0.5, by:'half of your spare money', src:'deliverables/irish-rules-and-rates-audit.md §3 B22', asat:'2026', verify:false, guide:'We never count more than this share of your spare money as saved, unless you set your own monthly saving.'},
  noAnswer:{n:'Monthly saving if not answered', u:'eur', grp:'Emergency fund & saving', v:300, by:'a modest regular amount', src:'deliverables/irish-rules-and-rates-audit.md §3 B22', asat:'2026', verify:false, guide:'Used until you answer "How much could you comfortably invest each month?".'},
  lifeShare:{n:'Life cover: share of income the family needs', u:'pct', grp:'Protection', v:0.6, by:'families usually need less than full pay', src:'deliverables/irish-rules-and-rates-audit.md §3 B24', asat:'2026', verify:false},
  lifeYears:{n:'Life cover: years of support', u:'yrs', grp:'Protection', v:15, by:'often until your youngest child is 23', src:'deliverables/irish-rules-and-rates-audit.md §3 B24', asat:'2026', verify:false},
  riskMu:{n:'Risk and return: growth a year, Cautious / Balanced / Growth', u:'pct3', grp:'Risk and budget', v:[0.02, 0.04, 0.06], by:'illustrations, not forecasts', src:'deliverables/irish-rules-and-rates-audit.md §3 B26', asat:'2026', verify:false, guide:'Your adviser uses the fund\'s own risk rating (SRI 1–7).'},
  riskVol:{n:'Risk and return: ups and downs (volatility), Cautious / Balanced / Growth', u:'pct3', grp:'Risk and budget', v:[0.05, 0.10, 0.16], by:'illustrations, not forecasts', src:'deliverables/irish-rules-and-rates-audit.md §3 B26', asat:'2026', verify:false, guide:'How much a year can swing.'},
  budget:{n:'Budget split: needs / wants / savings and debt', u:'pct3', grp:'Risk and budget', v:[0.5, 0.3, 0.2], by:'the 50/30/20 rule', src:'deliverables/irish-rules-and-rates-audit.md §3 B27', asat:'2026', verify:false},
  bands:{n:'Tax bands in future', u:'choice', grp:'Choices', v:'prices', by:'Budgets have broadly kept pace over time', src:'deliverables/irish-rules-and-rates-audit.md §3 B10', asat:'2026', verify:false, guide:'Irish tax bands are set each Budget and don\'t rise automatically. "Stay as today" is the cautious view (more tax later).'},
  spGrow:{n:'State Pension in future', u:'choice', grp:'Choices', v:'prices', by:'it has broadly kept pace with prices over time', src:'deliverables/irish-rules-and-rates-audit.md §3 B11', asat:'2026', verify:false, guide:'The State Pension is set each Budget.'},
  drawRule:{n:'How you draw your pension', u:'choice', grp:'Choices', v:'spread', by:'spread over your plan, at least the legal minimum', src:'deliverables/irish-rules-and-rates-audit.md §3 B20', asat:'2026', verify:false},
  ddTiming:{n:'Drawdown tools: withdrawals taken at the', u:'choice', grp:'Choices', v:'start', by:'the prudent choice: the money has less time to grow before you take it', src:'deliverables/irish-rules-and-rates-audit.md §3 B20', asat:'2026', verify:false},
  waitYears:{n:'Lump sum tool: years you might wait before investing', u:'yrs', grp:'Choices', v:5, by:'an illustration of the cost of waiting', src:'deliverables/LifeGoals-Calculators.xlsx C10', asat:'2026', verify:false},
  style:{n:'Risk and return tool: investment style (1 Cautious, 2 Balanced, 3 Growth)', u:'num', grp:'Choices', v:2, by:'Balanced; an adviser checks your attitude to risk', src:'deliverables/LifeGoals-Calculators.xlsx C20', asat:'2026', verify:false},
  // market rates: never pre-filled; shown as the chip "Use the suggested rate (X) · label". v:null = no published figure, so no suggestion.
  mortRate:{n:'Suggested mortgage rate', u:'pct', grp:'Market rates', v:0.0348, by:'Central Bank of Ireland: average rate on new mortgages, Jul 2026', label:'Central Bank of Ireland: average rate on new mortgages, Jul 2026', src:CBI_RATES, asat:'Jul 2026', verify:true, guide:'Your mortgage statement shows your rate. Typing it is fine: no upload needed.'},
  loanRate:{n:'Suggested personal and car loan rate (APR)', u:'pct', grp:'Market rates', v:0.0672, by:'Central Bank of Ireland: average rate on new consumer loans, Jul 2026', label:'Central Bank of Ireland: average rate on new consumer loans, Jul 2026', src:CBI_RATES, asat:'Jul 2026', verify:true, guide:'Your loan agreement shows your APR.'},
  cardRate:{n:'Suggested credit card rate (APR)', u:'pct', grp:'Market rates', v:null, by:'No published average', label:'No published average', src:CBI_RATES, asat:'—', verify:true, guide:'Your card statement shows your APR.'},
  depRate:{n:'Suggested deposit rate (fixed term, before 33% DIRT)', u:'pct', grp:'Market rates', v:0.0192, by:'Central Bank of Ireland: average rate on new fixed-term household deposits, Jul 2026', label:'Central Bank of Ireland: average rate on new fixed-term household deposits, Jul 2026', src:CBI_RATES, asat:'Jul 2026', verify:true, guide:'If you rent, your deposit stays in savings. Optional: leave it blank to leave it out.'},
  buyFees:{n:'Suggested buying fees (legal and survey)', u:'eur', grp:'Market rates', v:null, by:'No published figure', label:'No published figure', src:'', asat:'—', verify:false},
  fundChg:{n:'Suggested fund and pension charges (a year)', u:'pct', grp:'Market rates', v:0.01, by:'Pensions Authority pension calculator assumption', label:'Pensions Authority pension calculator assumption', note:'Usually between 0.5% and 2% a year (CCPC)', src:'https://pensionsauthority.ie/scheme-members-and-prsa-contributors/pension-calculator/assumptions/ · https://www.ccpc.ie/consumers/money/pensions/fees-and-charges/', asat:'2026', verify:true, guide:'When your statement shows your own charges, we use them instead of this.'},
}, g:{   // guidance facts quoted in copy (no standard: life expectancy is never defaulted)
  lifeMen65:{n:'Life expectancy at 65, men (years): guidance only', u:'num', v:83, by:'CSO, Irish Life Tables No. 17, 2015–2017', src:'https://www.cso.ie/en/releasesandpublications/er/ilt/irishlifetablesno172015-2017/', asat:'2015–2017 (latest edition; 65 + 18.3 years)', verify:true},
  lifeWomen65:{n:'Life expectancy at 65, women (years): guidance only', u:'num', v:86, by:'CSO, Irish Life Tables No. 17, 2015–2017', src:'https://www.cso.ie/en/releasesandpublications/er/ilt/irishlifetablesno172015-2017/', asat:'2015–2017 (latest edition; 65 + 21.0 years)', verify:true}}};
const SET = SETTINGS.s;
const SV = k => { const s = SET[k]; return s ? (s.pv != null ? s.pv : s.v) : undefined; };   // the figure in use (partner's if set, else the standard)
const SOV = k => !!SET[k] && SET[k].pv != null;
const SPN = () => SETTINGS.partner || 'your provider';
const SB = k => !SET[k] ? '' : SOV(k) ? 'Suggested by ' + SPN() : SET[k].by;          // the (source) shown with "Generally the standard is X (…)"
const SL = k => !SET[k] ? '' : SOV(k) ? 'Suggested by ' + SPN() : SET[k].label || SET[k].by;   // the chip suffix for market rates
const SGK = {riskMu1:'riskMu', riskMu2:'riskMu', riskMu3:'riskMu', riskVol1:'riskVol', riskVol2:'riskVol', riskVol3:'riskVol', budgetNeeds:'budget', budgetWants:'budget', budgetSave:'budget', penChg:'fundChg', depEarn:'depRate'};
const SG = k => (SET[SGK[k] || k] || {}).guide || '';   // the guidance wording
const ruleCount = () => { let n = 0, vf = 0; const walk = o => Object.values(o).forEach(x => { if (x && typeof x === 'object' && 'v' in x && 'src' in x){ n++; if (x.verify) vf++; } else if (x && typeof x === 'object') walk(x); }); walk(RULES_IE_2026); return {n, vf}; };
const GOALCAT = [
  {k:'home', t:'Buy a home', e:'🏡', amt:40000, yrs:4, kind:'spend', spec:'mortgage', unit:'Deposit'},
  {k:'retire', t:'Retire comfortably', e:'🌅', amt:40000, kind:'retire', spec:'pension', unit:'Yearly income'},
  {k:'family', t:'Grow my family', e:'👶', amt:15000, yrs:3, kind:'spend', spec:'protection', unit:'One-off'},
  {k:'edu', t:"Kids' education", e:'🎓', amt:30000, yrs:10, kind:'spend', spec:'planner', unit:'Per child'},
  {k:'travel', t:'Travel', e:'✈️', amt:8000, yrs:2, kind:'spend', spec:'planner', unit:'One-off'},
  {k:'business', t:'Start a business', e:'💼', amt:25000, yrs:5, kind:'spend', spec:'planner', unit:'One-off'},
  {k:'mfree', t:'Be mortgage-free', e:'🏦', amt:150000, yrs:15, kind:'mfree', spec:'mortgage', unit:'Mortgage balance'},
  {k:'safety', t:'Emergency fund', e:'🪂', amt:15000, yrs:2, kind:'pot', spec:'planner', unit:'Months of costs'},
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
  pAge:{l:"Partner's age", type:'num', min:18, max:85, show:() => S.about.partner && S.partner.mode !== 'invite'},
  work:{l:'Your work', type:'choice', o:['Employed','Self-employed','Not working']},
  income:{l:'Your gross yearly income', type:'eur', hint:'Before tax'},
  pIncome:{l:"Partner's gross yearly income", type:'eur', show:() => S.about.partner && S.partner.mode !== 'invite'},
  otherM:{l:'Other income a month (before tax)', type:'eur', opt:1, hint:'Optional. Taxed with your other income'},
  costsM:{l:'Monthly living costs', type:'eur', hint:'Rent, bills, food and extras. Leave out mortgage and loan repayments.'},
  oneOffY:{l:'Yearly one-off costs', type:'eur', opt:1, hint:'Optional. Car tax, insurance, holidays'},
  home:{l:'Your home', type:'choice', o:['Own outright','Own with mortgage','Rent','Live with family']},
  homeValue:{l:'Home value', type:'eur', show:own},
  cash:{l:'Cash savings', type:'eur', hint:'Incl. credit union and State Savings'},
  invest:{l:'Investments', type:'eur', hint:'Shares, funds, share schemes, crypto: one total'},
  propValue:{l:'Other property: value', type:'eur', opt:1, hint:'Optional'},
  rentM:{l:'Other property: rent received a month (before tax)', type:'eur', opt:1, hint:'Optional. Rental profit is taxed at your marginal rate, with USC and PRSI'},
  mortBal:{l:'Mortgage left', type:'eur', show:mort},
  mortPayM:{l:'Monthly repayment', type:'eur', show:mort},
  mortYears:{l:'Years left', type:'num', min:1, max:40, show:mort},
  cardBal:{l:'Credit cards: total owed', type:'eur', list:1},
  cardPayM:{l:'Credit cards: monthly repayment', type:'eur', list:1},
  loanBal:{l:'Other loans (car, personal, credit union): total owed', type:'eur', list:1},
  loanPayM:{l:'Other loans: monthly repayment', type:'eur', list:1},
  life:{l:'Life cover', type:'ynn'}, ip:{l:'Income protection', type:'ynn'}, ci:{l:'Serious illness cover', type:'ynn'}, workCover:{l:'Cover through work', type:'ynn'}, health:{l:'Health insurance', type:'ynn'},
  pension:{l:'Pension value today', type:'eur', hint:'All pots together', list:1},
  pensionM:{l:'Paid in each month', type:'eur', hint:'Including your employer', list:1},
  pensionOwnM:{l:'Of that, paid by you each month', type:'eur', opt:1, hint:'Optional. Only your own share gets tax relief. If you leave it blank, you choose your share in Your assumptions', show:() => +S.fin.pensionM > 0 && S.fin.work !== 'Not working', list:1},
  ae:{l:'Have you been auto-enrolled in My Future Fund?', type:'choice', o:['Yes','No','Not sure'], opt:1, hint:LAW.ae + ' Set by law, so we count you in unless you say no', show:() => S.fin.work === 'Employed' && S.about.age >= RI.ae.ageMin && S.about.age <= RI.ae.ageMax && +S.fin.income > RI.ae.earnMin && !(+S.fin.pensionM > 0)},
  sp:{l:'State Pension', type:'choice', o:['Expect full','Partly','Not sure'], hint:LAW.sp + ' Check your record on MyWelfare'},
  pSp:{l:'Your partner\'s State Pension', type:'choice', o:['Own full','Own partial','Qualified adult increase','None','Not sure'], opt:1, show:() => !!S.about.partner, hint:'Optional. A partner without their own State Pension may get a Qualified Adult increase on yours (means-tested)'}
};
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
  if (k === 'safety'){ applyAssume(); g.auto = true; syncSafety(g); }   // B16 + §15: months × the customer's own essential spending; until their costs are in, the goal keeps its own target   // B16: one safety-net setting everywhere
  return g;
}
const retireGoal = () => S.goals.find(g => g.kind === 'retire');
// A safety-net goal the customer hasn't edited follows their essential spending once their costs are known (never an invented figure)
// §19.7: the months the customer sets in the Emergency fund goal or in the Emergency fund calculator ARE the plan-wide setting (Your assumptions, step 7)
function setSafetyMonths(n){ n = clamp(Math.round(+n), 1, 12); S.asm = Object.assign({}, S.asm, {safetyMonths:n}); applyAssume(); syncSafety(); return n; }
function calcSync(cid, k, v){ if (cid === 'emergency' && k === 'mt' && v != null && isFinite(+v)) setSafetyMonths(v); }
function syncSafety(only){ if (!S || !S.src || !S.src.costsM) return; (only ? [only] : S.goals.filter(g => g.k === 'safety' && g.auto)).forEach(g => { applyAssume(); g.amount = Math.round(essM(finNums()) * SAVE.buffer / 1000) * 1000; }); }
function setRetireAge(a){ S.retireAge = a; S.retireSet = true; const r = retireGoal(); if (r) r.age = a; S.fin.retireAge = a; S.src.retireAge = S.src.retireAge || 'pre'; }
const AS = {infl:0.02, wage:0.03, cash:0.01, inv:0.035, pen:0.045, penRet:0.0315, sp:RI.sp.week * 52, spAge:RI.sp.age, end:90, mortRate:0.0375, cardRate:0.20, loanRate:0.08};
// Growth assumption sets (audit B2–B5, B8): Standard is the default; Cautious is lower on every rate, incl. pay rises (the old set had Cautious pay rises higher).
const AS_SETS = {get standard(){ return {wage:SV('wage'), cash:SV('cash'), inv:SV('inv'), pen:SV('pen'), penRet:SV('penRet')}; }, get cautious(){ return {wage:SET.wage.vc, cash:SET.cash.vc, inv:SET.inv.vc, pen:SET.pen.vc, penRet:SET.penRet.vc}; }};   // Standard follows SETTINGS; Cautious is lower on every rate
const AS_NAME = {standard:'Standard', cautious:'Cautious'};
let YEAR0 = 2026;   // first plan year: the customer's choice (B23), set in applyAssume()
/* ---------- "Your assumptions": every judgement value is a visible, editable input (audit §3, B1–B27) ---------- */
const pcs = x => +(x * 100).toFixed(2) + '%';
/* ---------- "Your assumptions" (journey-spec §14, Pooja 2 Oct 2026; binding) ----------
   Every number is one of three types. Type 1 (law) lives in RULES_IE_2026 and is shown as "Set by Government · 2026", not editable.
   Type 2 (range): the customer enters theirs; we show "Usually between X and Y (source)". Type 3 (personal judgement): blank until chosen;
   "Generally the standard is X (source). Choose what you want to use." with a one-tap "Use the standard (X)" chip.
   Retirement age and plan-until age (life expectancy) are never defaulted and never part of "Use the standard for all of these".
   Engine: asmV() falls back to the standard (type 3) or a mid-range figure (type 2) ONLY so the maths never breaks. No result is shown
   while planMissing() is not empty: the screens show "Choose your [item] to see this" instead. */
const twoSecure = () => !!(S && S.about.partner && +S.fin.income > 0 && +S.fin.pIncome > 0 && S.fin.work === 'Employed');
const curSet = () => AS_SETS[(S && S.assume) || 'standard'];
const ST = new Proxy({}, {get:(_, k) => SV(k)}), STB = new Proxy({}, {get:(_, k) => ({by:SB(k)})});   // the standards and their source wording (SETTINGS)
const GD = new Proxy({}, {get:(_, k) => k in RI.guide ? RI.guide[k] : (SETTINGS.g[k] || {}).v}), GDB = new Proxy({}, {get:(_, k) => ({by:k in RI.guide ? RULES_IE_2026.guide[k].by : (SETTINGS.g[k] || {}).by})});
const eurW = n => '€' + (Math.abs(n % 1) > 1e-9 ? (+n).toFixed(2) : String(Math.round(n)));   // weekly DSP rates keep their cents (€299.30, €254)
const ASM_GRP = [['prices', 'Prices & growth'], ['retire', 'Retirement'], ['safety', 'Safety net & debt'], ['length', 'Plan length']];
const finN = k => { const v = S && S.fin ? S.fin[k] : null; return v != null && v !== '' && !isNaN(+v) ? +v : 0; };
const spOwnOpt = () => (S.fin.sp || 'Not sure'), spYearsKnown = () => (S.fin.spYears != null && S.fin.spYears !== '') || asmGet('spYears') != null;
const ASM = {
  inv:{g:'prices', b:'B3', ty:3, n:'investment growth', l:'Investments grow (a year, after charges and tax)', t:'pct', min:0, max:7, step:0.25, sug:() => ST.inv, get by(){ return STB.inv.by; }, need:() => true, get help(){ return SG('inv'); }},
  invGross:{g:'prices', b:'B3', ty:3, n:'growth before fees', l:'Investments grow before fees and tax (a year; the growth and fees tools)', t:'pct', min:0, max:10, step:0.25, sug:() => ST.invGross, get by(){ return STB.invGross.by; }, need:() => false, get help(){ return SG('invGross'); }},
  cash:{g:'prices', b:'B4', ty:3, n:'cash growth', l:'Cash savings earn (a year, after DIRT)', t:'pct', min:0, max:4, step:0.05, sug:() => ST.cash, get by(){ return STB.cash.by; }, need:() => true, get help(){ return SV('depRate') != null ? 'New fixed-term household deposits averaged ' + pcs(SV('depRate')) + ' before 33% DIRT (' + SL('depRate').replace(/: average rate on new fixed-term household deposits/, '') + '). Demand accounts pay less.' : 'Demand accounts pay less than fixed-term deposits.'}},
  pen:{g:'prices', b:'B5', ty:3, n:'pension growth', l:'Pension grows while you work (a year, after charges)', t:'pct', min:0, max:7, step:0.05, sug:() => ST.pen, get by(){ return STB.pen.by; }, need:() => true, get help(){ return SG('pen'); }},
  penRet:{g:'prices', b:'B5', ty:3, n:'pension growth once retired', l:'Pension grows once you retire (a year, after charges)', t:'pct', min:0, max:7, step:0.05, sug:() => ST.penRet, get by(){ return STB.penRet.by; }, need:() => true, get help(){ return SG('penRet'); }},
  penChg:{g:'prices', b:'B6', ty:2, n:'typical pension charges', l:'Typical pension charges already allowed for in the pension growth above', t:'pct', min:0, max:2.5, step:0.05, mk:'fundChg', by:'pension charges; your statement shows yours', fb:() => 0.01, need:() => !!(S.fin && S.fin.penChg != null && S.fin.penChg !== ''), get help(){ return SG('penChg') + ' ' + SET.fundChg.note + '.'}},
  wage:{g:'prices', b:'B8', ty:3, n:'pay rises', l:'Pay rises (a year)', t:'pct', min:0, max:6, step:0.1, sug:() => ST.wage, get by(){ return STB.wage.by; }, need:() => true, get help(){ return SG('wage'); }},
  bands:{g:'prices', b:'B10', ty:3, n:'tax bands in future', l:'Tax bands in future', t:'choice', o:[['prices', 'Rise with prices'], ['flat', 'Stay as today']], sug:() => SV('bands'), get by(){ return SB('bands'); }, need:() => true, get help(){ return SG('bands'); }},
  rentRise:{g:'prices', b:'B25', ty:3, n:'rent rises', l:'Rent vs buy: rent rises (a year)', t:'pct', min:0, max:8, step:0.5, sug:() => ST.rentRise, get by(){ return STB.rentRise.by; }, need:() => false, get help(){ return SG('rentRise'); }},
  houseGrow:{g:'prices', b:'B25', ty:3, n:'house price growth', l:'Rent vs buy: house prices rise (a year)', t:'pct', min:0, max:6, step:0.5, sug:() => ST.houseGrow, get by(){ return STB.houseGrow.by; }, need:() => false, get help(){ return SG('houseGrow'); }},
  upkeep:{g:'prices', b:'B25', ty:3, n:'upkeep', l:'Rent vs buy: upkeep a year (share of the home value)', t:'pct', min:0, max:3, step:0.1, sug:() => ST.upkeep, get by(){ return STB.upkeep.by; }, need:() => false, get help(){ return SG('upkeep'); }},
  buyFees:{g:'prices', b:'B25', ty:2, n:'buying fees', l:'Buying fees (legal and survey), plus stamp duty', t:'eur', min:0, max:10000, step:250, mk:'buyFees', opt:true, fb:() => 0, need:() => false, help:'Stamp duty is set by law and added on top: ' + LAW.stamp + '.'},
  depEarn:{g:'prices', b:'B25', ty:2, mk:'depRate', afterDirt:true, opt:true, n:'the deposit\'s earning rate', l:'Rent vs buy: what the deposit could earn instead (a year, after tax)', t:'pct', min:0, max:6, step:0.25, fb:() => 0, need:() => false, get help(){ return SG('depEarn'); }},
  riskMu1:{g:'prices', b:'B26', ty:3, n:'the Cautious style growth', l:'Risk & return: Cautious style growth (a year)', t:'pct', min:0, max:8, step:0.5, sug:() => ST.riskMu[0], get by(){ return STB.riskMu.by; }, need:() => false, get help(){ return SG('riskMu1'); }},
  riskMu2:{g:'prices', b:'B26', ty:3, n:'the Balanced style growth', l:'Risk & return: Balanced style growth (a year)', t:'pct', min:0, max:8, step:0.5, sug:() => ST.riskMu[1], get by(){ return STB.riskMu.by; }, need:() => false, get help(){ return SG('riskMu2'); }},
  riskMu3:{g:'prices', b:'B26', ty:3, n:'the Growth style growth', l:'Risk & return: Growth style growth (a year)', t:'pct', min:0, max:8, step:0.5, sug:() => ST.riskMu[2], get by(){ return STB.riskMu.by; }, need:() => false, get help(){ return SG('riskMu3'); }},
  riskVol1:{g:'prices', b:'B26', ty:3, n:'the Cautious style ups and downs', l:'Risk & return: Cautious style ups and downs (volatility)', t:'pct', min:0, max:25, step:1, sug:() => ST.riskVol[0], get by(){ return STB.riskVol.by; }, need:() => false, get help(){ return SG('riskVol1'); }},
  riskVol2:{g:'prices', b:'B26', ty:3, n:'the Balanced style ups and downs', l:'Risk & return: Balanced style ups and downs (volatility)', t:'pct', min:0, max:25, step:1, sug:() => ST.riskVol[1], get by(){ return STB.riskVol.by; }, need:() => false, get help(){ return SG('riskVol2'); }},
  riskVol3:{g:'prices', b:'B26', ty:3, n:'the Growth style ups and downs', l:'Risk & return: Growth style ups and downs (volatility)', t:'pct', min:0, max:25, step:1, sug:() => ST.riskVol[2], get by(){ return STB.riskVol.by; }, need:() => false, get help(){ return SG('riskVol3'); }},
  spGrow:{g:'retire', b:'B11', ty:3, n:'State Pension in future', l:'State Pension in future', t:'choice', o:[['prices', 'Rises with prices'], ['pay', 'Rises with pay'], ['flat', 'Stays flat']], sug:() => SV('spGrow'), get by(){ return SB('spGrow'); }, need:() => true, get help(){ return SG('spGrow'); }},
  spYears:{g:'retire', b:'B9', ty:2, n:'PRSI years', l:'How many years of PRSI will you have at 66? (leave blank if you don\'t know)', t:'yrs', min:0, max:45, step:1, rng:() => [RI.sp.minYears, RI.sp.fullYears], by:'DSP: ' + RI.sp.fullYears + ' for the full rate, at least ' + RI.sp.minYears + ' to qualify', opt:true, fb:() => null, need:() => false, help:'Check your record on MyWelfare. If you give your years, we work out your State Pension from them (set by law).'},
  spWeek:{g:'retire', b:'B9', ty:2, n:'State Pension', l:'Your State Pension a week at 66', t:'eurw', min:0, max:RI.sp.week, step:0.1, rng:() => [0, RI.sp.week], by:'DSP 2026: the full rate needs ' + RI.sp.fullYears + ' years of PRSI; partial rates are lower', fb:() => RI.sp.week * (spOwnOpt() === 'Partly' ? 0.6 : 0.8),
    need:() => ['Partly', 'Not sure'].includes(spOwnOpt()) && !spYearsKnown(), help:'Your State Pension statement on MyWelfare shows your expected rate. Or tell us your PRSI years.'},
  pSpWeek:{g:'retire', b:'B9', ty:2, n:'partner\'s State Pension', l:'Your partner\'s State Pension a week at 66', t:'eurw', min:0, max:RI.sp.week, step:0.1, rng:() => [0, RI.sp.week], by:'DSP 2026', fb:() => RI.sp.week * ((S.fin.pSp || 'Not sure') === 'Own partial' ? 0.6 : 0.8),
    need:() => !!S.about.partner && ['Own partial', 'Not sure'].includes(S.fin.pSp || 'Not sure'), help:'Their MyWelfare statement shows it.'},
  ownShare:{g:'retire', b:'B1', ty:3, n:'share of your pension you pay', l:'Of the money paid into your pension each month, the share you pay yourself (the rest is your employer)', t:'pct', min:0, max:100, step:5, sug:() => S && S.fin.work === 'Self-employed' ? 1 : ST.ownShare, get by(){ return STB.ownShare.by; },
    need:() => finN('pensionM') > 0 && S.fin.work !== 'Not working' && !(S.fin.pensionOwnM != null && S.fin.pensionOwnM !== ''), get help(){ return SG('ownShare'); }},
  retireMult:{g:'retire', b:'B17', ty:3, n:'retirement savings target', l:'Retirement savings target: times the yearly income you need', t:'num', min:20, max:33, step:1, sug:() => ST.retireMult, get by(){ return STB.retireMult.by; }, need:() => false, get help(){ return SG('retireMult'); }},
  retireSpend:{g:'retire', b:'B18', ty:3, n:'retirement spending', l:'Retirement spending if you haven\'t set a goal (share of today\'s spending)', t:'pct', min:50, max:120, step:5, sug:() => ST.retireSpend, get by(){ return STB.retireSpend.by; }, need:() => !retireGoal(), get help(){ return SG('retireSpend'); }},
  lumpSum:{g:'retire', b:'B19', ty:3, n:'retirement lump sum', l:'Tax-free lump sum to take at retirement (share of your pension, 0% = none)', t:'pct', min:0, max:25, step:1, sug:() => ST.lumpSum, get by(){ return STB.lumpSum.by; }, need:() => true, help:'Set by law: ' + LAW.ls + '. Your adviser can compare it with leaving it invested.'},
  drawRule:{g:'retire', b:'B20', ty:3, n:'how you draw your pension', l:'How you draw your pension', t:'choice', o:[['spread', 'Spread to plan end'], ['min', 'Minimum only (4% / 5%)'], ['fixed', 'Fixed amount']], sug:() => SV('drawRule'), get by(){ return SB('drawRule'); }, need:() => true, help:'Set by law: ' + LAW.arf + ' from an ARF.'},
  ddTiming:{g:'retire', b:'B20', ty:3, n:'withdrawal timing', l:'Drawdown tools: withdrawals taken at the', t:'choice', o:[['start', 'Start of the year'], ['end', 'End of the year']], sug:() => SV('ddTiming'), get by(){ return SB('ddTiming'); }, need:() => false, help:''},
  drawFixed:{g:'retire', b:'B20', ty:3, own:true, n:'fixed yearly amount', l:'Fixed amount a year (today\'s money), if you chose "Fixed amount"', t:'eur', min:0, max:200000, step:500, fb:() => 20000, need:() => asmGet('drawRule') === 'fixed', help:'Never less than the legal minimum once you are 61.'},
  safetyMonths:{g:'safety', b:'B16', ty:3, n:'safety-net months', l:'Safety net: months of essential spending', t:'num', min:1, max:12, step:1, sug:() => twoSecure() ? ST.safetyMonthsTwo : ST.safetyMonths, get by(){ return STB.safetyMonths.by; }, need:() => true, get help(){ return SG('safetyMonths'); }},
  mortRate:{g:'safety', b:'B13', ty:2, n:'mortgage rate', l:'Your mortgage rate (if your statement doesn\'t say)', t:'pct', min:1, max:8, step:0.05, mk:'mortRate', fb:() => 0.0375,
    need:() => S.fin.home === 'Own with mortgage' && finN('mortBal') > 0 && !(finN('mortRate') > 0), get help(){ return SG('mortRate'); }},
  cardRate:{g:'safety', b:'B14', ty:2, n:'credit-card rate', l:'Your credit-card rate, APR (if your statement doesn\'t say)', t:'pct', min:0, max:35, step:0.5, mk:'cardRate', fb:() => 0.20,
    need:() => finN('cardBal') > 0 && !(finN('cardRate') > 0), help:'Your card statement shows your APR. New credit cards can\'t charge more than ' + pcs(GD.cardCap) + ' APR (' + GDB.cardCap.by + '); some older cards are higher.'},
  loanRate:{g:'safety', b:'B15', ty:2, n:'loan rate', l:'Your other loans rate, APR (if your statement doesn\'t say)', t:'pct', min:0, max:25, step:0.25, mk:'loanRate', fb:() => 0.08,
    need:() => finN('loanBal') + finN('debt') > 0 && !(finN('loanRate') > 0), get help(){ return SG('loanRate'); }},
  cashYears:{g:'safety', b:'B21', ty:3, n:'years kept as cash', l:'Money for goals sooner than this is kept as cash (years)', t:'yrs', min:1, max:10, step:1, sug:() => ST.cashYears, get by(){ return STB.cashYears.by; }, need:() => true, get help(){ return SG('cashYears'); }},
  investShare:{g:'safety', b:'B21', ty:3, n:'share of spare savings invested', l:'Spare savings: share invested (the rest stays in cash)', t:'pct', min:0, max:100, step:5, sug:() => ST.investShare, get by(){ return STB.investShare.by; }, need:() => true, get help(){ return SG('investShare'); }},
  saveShare:{g:'safety', b:'B22', ty:3, n:'share of spare money saved', l:'Share of your spare money you save, at most', t:'pct', min:0, max:100, step:5, sug:() => ST.saveShare, get by(){ return STB.saveShare.by; }, need:() => S.saveM == null, get help(){ return SG('saveShare'); }},
  noAnswer:{g:'safety', b:'B22', ty:3, n:'monthly saving', l:'Monthly saving if you haven\'t told us how much you could invest', t:'eur', min:0, max:5000, step:25, sug:() => ST.noAnswer, get by(){ return STB.noAnswer.by; }, need:() => S.saveM == null && typeof S.ans['6'] !== 'number', get help(){ return SG('noAnswer'); }},
  lifeShare:{g:'safety', b:'B24', ty:3, n:'share of income your family would need', l:'Life cover: share of your income your family would need', t:'pct', min:30, max:100, step:5, sug:() => ST.lifeShare, get by(){ return STB.lifeShare.by; }, need:() => false, get help(){ return SG('lifeShare'); }},
  lifeYears:{g:'safety', b:'B24', ty:3, n:'years of support', l:'Life cover: years your family would need support', t:'yrs', min:1, max:30, step:1, sug:() => ST.lifeYears, get by(){ return STB.lifeYears.by; }, need:() => false, get help(){ return SG('lifeYears'); }},
  survivor:{g:'safety', b:'B24', ty:2, n:'survivor\'s pension', l:'Life cover: State survivor\'s pension a week', t:'eurw', min:0, max:400, step:0.5, rng:() => [0, RI.sp.survivor66], by:'DSP 2026: ' + eurW(RI.sp.survivor) + ' under 66, ' + eurW(RI.sp.survivor66) + ' at 66+, nothing if not eligible', fb:() => RI.sp.survivor, need:() => false, help:'Cohabiting partners can now qualify (Bereaved Partner\'s Pension).'},
  budgetNeeds:{g:'safety', b:'B27', ty:3, n:'budget split', l:'Budget split: needs', t:'pct', min:0, max:100, step:5, sug:() => ST.budget[0], get by(){ return STB.budget.by; }, need:() => false, get help(){ return SG('budgetNeeds'); }},
  budgetWants:{g:'safety', b:'B27', ty:3, n:'budget split', l:'Budget split: wants', t:'pct', min:0, max:100, step:5, sug:() => ST.budget[1], get by(){ return STB.budget.by; }, need:() => false, get help(){ return SG('budgetWants'); }},
  budgetSave:{g:'safety', b:'B27', ty:3, n:'budget split', l:'Budget split: savings and debt', t:'pct', min:0, max:100, step:5, sug:() => ST.budget[2], get by(){ return STB.budget.by; }, need:() => false, get help(){ return SG('budgetSave'); }},
  planEnd:{g:'length', b:'B12', ty:3, own:true, n:'plan-until age', l:'Plan until age (life expectancy)', t:'age', min:80, max:105, step:1, fb:() => S && S.about.partner ? 95 : 90, need:() => true,   // internal fallback only, never shown (planMissing gates results)
    help:'At 65, average life expectancy in Ireland is about ' + GD.lifeMen65 + ' for men and ' + GD.lifeWomen65 + ' for women (' + GDB.lifeMen65.by + '). Choose the age you want to plan to.'},
  startYear:{g:'length', b:'B23', ty:3, n:'plan start year', l:'Start the plan in', t:'choice', o:[[2026, '2026'], [2027, '2027']], sug:() => (new Date() > new Date('2026-09-30T23:59:59') ? 2027 : 2026), by:'from October most of this year has passed', need:() => true, help:''}
};
const RETIRE_HELP = 'You can usually draw a pension from ' + RI.pen.earliestAge + ' (' + GDB.schemeEarliest.by + ' from ' + GD.schemeEarliest + '); State Pension is paid from ' + RI.sp.age + '.';
const asmGet = k => S && S.asm && S.asm[k] != null && S.asm[k] !== '' ? S.asm[k] : null;
// engine value: the customer's choice; otherwise an internal fallback that is never shown as a result (planMissing() gates every result)
const asmV = k => { const x = asmGet(k), d = ASM[k], set = curSet(); return x != null ? x : k in set ? set[k] : d.sug ? d.sug() : d.fb ? d.fb() : null; };   // growth rates follow the chosen set (Standard / Cautious)
const asmMine = k => asmGet(k) != null;
const ASM_KEYS = () => Object.keys(ASM);
const asmStd = k => ASM[k].ty === 3 && !ASM[k].own && ASM[k].sug;   // has a "Use the standard (X)" chip and is part of "use all"
// Everything the plan needs that the customer hasn't chosen yet, in the order we ask: inflation, retirement age, plan-until age, the rest.
function planMissing(){ if (!S) return []; const out = [];
  if (!inflSet()) out.push({k:'infl', n:'inflation rate', ty:3});
  if (!S.retireSet) out.push({k:'retireAge', n:'retirement age', ty:3, own:true});
  if (S.fin && finN('income') > 0 && !S.fin.work) out.push({k:'work', n:'work (employed, self-employed or not working)', add:true});   // sets how income is taxed (PRSI class, USC) and auto-enrolment
  if (S.about && S.about.partner && FF.pAge.show() && !(finN('pAge') > 0)) out.push({k:'pAge', n:'partner\'s age', add:true});
  if (S.fin && S.fin.home === 'Own with mortgage' && finN('mortBal') > 0 && !(finN('mortPayM') > 0) && !(finN('mortYears') > 0)) out.push({k:'mortYears', n:'mortgage years left (or your monthly repayment)', add:true});
  ASM_KEYS().filter(k => ASM[k].need() && !asmMine(k)).sort((a, b) => (a === 'planEnd' ? -1 : 0) - (b === 'planEnd' ? -1 : 0)).forEach(k => out.push({k, n:ASM[k].n, ty:ASM[k].ty, own:!!ASM[k].own}));
  return out; }
const planReady = () => !planMissing().length;
const chooseTxt = m => (m.add ? 'Add ' : 'Choose ') + (/^the /.test(m.n) ? m.n : 'your ' + m.n) + ' to see this';
// "Use the standard for all of these": every type-3 item not chosen yet, incl. inflation. Never retirement age or plan-until age; never type 2.
function useAllStd(){ S.asm = Object.assign({}, S.asm); let n = 0; ASM_KEYS().filter(k => asmStd(k) && !asmMine(k)).forEach(k => { S.asm[k] = ASM[k].sug(); n++; });
  if (!inflSet()){ S.infl = ST.infl; S.inflOther = false; n++; } applyAssume(); return n; }
function applyAssume(){ Object.assign(AS, curSet()); AS.infl = S && S.infl != null ? S.infl : SV('infl');   // inflation is the client's own choice (S.infl); SV('infl') is only an internal fallback before they choose
  ['wage', 'cash', 'inv', 'pen', 'penRet', 'mortRate', 'cardRate', 'loanRate'].forEach(k => { AS[k] = +asmV(k); });
  AS.end = +asmV('planEnd'); AS.sp = RI.sp.week * RI.sp.weeks; AS.spAge = RI.sp.age; YEAR0 = +asmV('startYear');
  SAVE.buffer = +asmV('safetyMonths'); SAVE.longYrs = +asmV('cashYears'); SAVE.share = +asmV('saveShare'); SAVE.noAnswer = +asmV('noAnswer'); }
const INFL_IE = RI.infl.ie, INFL_SRC = RI.infl.ieSrc;
const inflSet = () => !!S && S.infl != null;
function inflChoice(ctx){ const v = S.infl, std = v === SV('infl') && !S.inflOther, ie = v === INFL_IE && !S.inflOther, oth = !!S.inflOther || (v != null && !std && !ie);
  return '<div class="infl" id="infl-' + ctx + '"><b style="font-size:14px" id="infl-l-' + ctx + '">Prices rising (inflation)</b> ' + asmTag(inflSet(), true) + '<p class="small" style="margin:2px 0 6px">Generally the standard is ' + pcs(SV('infl')) + ' (' + STB.infl.by + '). Prices in Ireland are rising ' + pcs(INFL_IE) + ' a year right now (' + INFL_SRC + '), mostly because of energy. Choose what you want to use.</p>' +
    '<div class="chips" role="group" aria-labelledby="infl-l-' + ctx + '"><button class="chip sm' + (std ? ' sel' : '') + '" aria-pressed="' + std + '" data-a="infl" data-p="' + SV('infl') + '">Use the standard (' + pcs(SV('infl')) + ')</button><button class="chip sm' + (ie ? ' sel' : '') + '" aria-pressed="' + ie + '" data-a="infl" data-p="' + INFL_IE + '">' + pcs(INFL_IE) + ' · Ireland now (' + INFL_SRC + ')</button><button class="chip sm' + (oth ? ' sel' : '') + '" aria-pressed="' + oth + '" data-a="infl" data-p="other">Other</button></div>' +
    (oth ? '<div class="flabel" style="margin-top:6px"><span id="infl-o-' + ctx + '">My own rate (0–10%)</span>' + nbox('infl', 'r', v != null ? +(v * 100).toFixed(2) : '', '%', 'infl-o-' + ctx, {id:'infl-v-' + ctx, dec:true}) + '</div>' + nbHint('infl', 'r') : '') + '</div>'; }
const inflTxt = () => pc(AS.infl) + ' a year';
function assumeToggle(){ const a = (S && S.assume) || 'standard';
  return '<div class="asm"><div class="seg" role="group" aria-label="Growth assumptions" style="margin:0">' + ['standard','cautious'].map(k => '<button class="' + (a === k ? 'on' : '') + '" aria-pressed="' + (a === k) + '" data-a="assume" data-p="' + k + '">' + AS_NAME[k] + '</button>').join('') + '</div><p class="small" style="margin:6px 0 0">' + (a === 'cautious' ? 'Cautious assumes slower growth, so results are lower but safer.' : 'Standard uses typical long-run growth. Cautious assumes slower growth, so results are lower but safer.') + ' Choosing a set fills pay rises, cash, investment and pension growth with its rates. Growth is never guaranteed.' + '</p></div>'; }
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
  const tx = p => Math.max(0, p.emp + p.draw + p.other + p.sp - p.relief), payeAmt = p => Math.min(I.paye, I.payeCapPct * (p.emp + p.draw + p.sp)), paye = p => payeAmt(p) / I.paye, ageCr = p => p.age >= I.ageCreditAge ? I.ageCredit : 0;
  const itB = (T, band) => I.r1 * Math.min(T, band) + I.r2 * Math.max(0, T - band);
  let it = 0;
  if (o.married && p2){ const x1 = tx(p1), x2 = tx(p2), T = x1 + x2, cr = I.personalMarried + I.paye * (paye(p1) + paye(p2)) + ageCr(p1) + ageCr(p2) + (o.rent ? I.rentJoint : 0);
    it = Math.max(0, itB(T, I.bandMarried + Math.min(Math.min(x1, x2), I.bandUplift)) - cr);
    if (o.carer){ const lo = Math.min(x1, x2), hc = Math.max(0, I.homeCarer - Math.max(0, lo - I.homeCarerLimit) / 2); it = Math.min(it, Math.max(0, itB(T, I.bandMarried) - cr - hc)); }   // the better of the increased band or the Home Carer credit
    if (p1.age >= I.ageCreditAge || p2.age >= I.ageCreditAge){ const L = I.ageExemptMarried; it = T <= L ? 0 : Math.min(it, I.ageMarginal * (T - L)); }   // age exemption with marginal relief
  } else ps.forEach((p, k) => { const x = tx(p), lone = o.spccc && k === 0, band = lone ? I.bandSPCCC : I.band;
    const cr = I.personal + payeAmt(p) + ageCr(p) + (lone ? I.spccc : 0) + (o.rent && (k === 0 || x > 0) ? I.rent : 0);
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
// "What your plan assumes" (§14): every row says which of the three types it is. No "default" anywhere.
const TAG_CLS = t => t === T_GOV ? 'none' : t === T_MINE ? 'doc' : t === T_HOW ? 'typed' : 'pre';
function assumeRows(){ applyAssume(); const F = finNums(), mine = k => asmMine(k), ch = k => asmFmt(ASM[k], asmGet(k)), NC = 'Not chosen yet', ready = planReady(), P = ready ? project() : null, k6 = S.ans['6'], q6 = DQ_BY('6');
  const R = [['Rules', RULES_VERSION, T_GOV]].concat(govRows().map(x => [x[0], x[1], T_GOV]));
  R.push(['Prices rise (inflation)', inflSet() ? pc(AS.infl) + ' a year (ECB target ' + pcs(SV('infl')) + '; Ireland now ' + pcs(INFL_IE) + ', ' + INFL_SRC + ')' : NC, T_MINE]);
  [['Pay rises', 'wage'], ['Cash savings grow (after DIRT)', 'cash'], ['Investments grow (after charges and exit tax)', 'inv'], ['Pensions grow while you work (after charges)', 'pen'], ['Pensions grow once retired (after charges)', 'penRet']].forEach(([l, k]) => R.push([l, mine(k) ? ch(k) + ' a year' : NC, T_MINE]));
  const yrsSP = S.fin.spYears != null && S.fin.spYears !== '' ? +S.fin.spYears : asmGet('spYears');
  R.push(['Your State Pension', F.spKnown ? eur(AS.sp * F.sp) + ' a year from ' + AS.spAge + ' (' + (yrsSP != null ? 'from your ' + yrsSP + ' years of PRSI' : S.fin.sp === 'Expect full' ? 'you expect the full rate' : 'your figure: ' + eurW(asmV('spWeek')) + ' a week') + '); taxable, no USC' : 'Not given yet', tRange(ASM.spWeek) + ' a week']);
  if (S.about.partner) R.push(['Your partner\'s State Pension', F.pSp === 'qa' ? 'Qualified Adult rate, ' + eurW(RI.sp.qa66) + ' a week' : F.pSp === 1 ? 'Full rate' : F.pSpO === 'None' ? 'None' : mine('pSpWeek') ? eurW(asmGet('pSpWeek')) + ' a week (your figure)' : 'Not given yet', tRange(ASM.pSpWeek) + ' a week']);
  R.push(['State Pension in future', mine('spGrow') ? ch('spGrow') : NC, T_MINE], ['Tax bands in future', mine('bands') ? ch('bands') : NC, T_MINE]);
  R.push([retireGoal() ? 'Retirement age' : 'Work income stops at', S.retireSet ? 'Age ' + S.retireAge : NC, T_MINE], ['Plan until age', mine('planEnd') ? 'Age ' + AS.end : NC, T_MINE], ['Plan starts', mine('startYear') ? '' + YEAR0 : NC, T_MINE]);
  R.push(['Lump sum at retirement', mine('lumpSum') ? (asmV('lumpSum') > 0 ? Math.round(asmV('lumpSum') * 100) + '% of your pension (tax as set by law, above)' : 'None') : NC, T_MINE]);
  R.push(['Pension drawdown', mine('drawRule') ? {spread:'Spread to the end of the plan, at least the legal minimum', min:'The legal minimum only', fixed:(mine('drawFixed') ? eur(asmV('drawFixed')) : 'A fixed amount') + ' a year (today\'s money), at least the legal minimum'}[asmV('drawRule')] : NC, T_MINE]);
  if (ASM.ownShare.need()) R.push(['Share of your pension you pay', mine('ownShare') ? ch('ownShare') : NC, T_MINE]);
  if (F.mortBal > 0) R.push(['Mortgage rate', finN('mortRate') > 0 ? pcs(finN('mortRate') / 100) + ' (from your statement)' : mine('mortRate') ? ch('mortRate') + ' (your figure)' : 'Not given yet', tMarket(ASM.mortRate)]);
  if (F.cardBal > 0) R.push(['Credit-card rate', finN('cardRate') > 0 ? pcs(finN('cardRate') / 100) + ' (from your statement)' : mine('cardRate') ? ch('cardRate') + ' (your figure)' : 'Not given yet', tMarket(ASM.cardRate)]);
  if (F.loanBal > 0) R.push(['Other loans rate', finN('loanRate') > 0 ? pcs(finN('loanRate') / 100) + ' (from your statement)' : mine('loanRate') ? ch('loanRate') + ' (your figure)' : 'Not given yet', tMarket(ASM.loanRate)]);
  R.push(['What you save', S.saveM != null ? eur(S.saveM) + ' a month (your choice)' : !mine('saveShare') ? NC : (P ? 'About ' + eur(P.save.saveM) + ' a month towards your goals, ' : '') + 'at most ' + pc(SAVE.share) + ' of your spare money' + (typeof k6 === 'number' ? ' (from your answer: ' + q6.o[k6].t + ')' : mine('noAnswer') ? ', ' + eur(SAVE.noAnswer) + ' a month until you tell us how much you could invest' : ''), T_MINE]);
  R.push(['Spare money not saved', 'Assumed spent', T_HOW]);
  R.push(['Safety net', S.goals.some(g => g.k === 'safety') ? 'Your safety-net goal is your emergency fund' : mine('safetyMonths') ? ch('safetyMonths') + ' of essential spending kept aside' : NC, T_MINE]);
  R.push(['Money for goals sooner than', mine('cashYears') ? ch('cashYears') + ': kept as cash' : NC, T_MINE], ['Spare savings invested', mine('investShare') ? ch('investShare') + ' (the rest in cash)' : NC, T_MINE]);
  R.push(['Order your savings go to goals', 'Safety net first, then must-haves, then nice-to-haves, soonest first', T_HOW]);
  R.push(['Tax for couples', S.about.partner && S.about.married === true ? 'Joint assessment (married / civil partners), also once retired' : 'Taxed as individuals', T_GOV]);
  if (S.needs && (S.needs.life || S.needs.ip)) R.push(['Protection needs noted for your adviser', [S.needs.life ? 'life cover ' + eur(S.needs.life) : '', S.needs.ip ? 'income protection ' + eur(S.needs.ip) + ' a month' : ''].filter(Boolean).join(', '), T_MINE]);
  R.push(['Known limits', 'Living costs stay the same through the plan; your partner\'s own pension and retirement age aren\'t modelled; drawdown assumed from an ARF / vested PRSA; the reduced USC rate for medical-card holders under 70 isn\'t applied; auto-enrolment rates after 2028 are held at the 2026 rates', T_HOW]);
  return R; }
const rowHTML = x => '<div class="mini"><span>' + esc(x[0]) + '<br><span class="tag ' + TAG_CLS(x[2]) + '">' + esc(x[2]) + '</span></span><b>' + esc(x[1]) + '</b></div>';
function assumeSheet(){ const R = assumeRows(), gov = R.filter(x => x[2] === T_GOV), rest = R.filter(x => x[2] !== T_GOV);
  return rest.map(rowHTML).join('') + '<details style="margin-top:8px"><summary style="cursor:pointer;font-weight:800;min-height:32px">' + T_GOV + ' (' + gov.length + ')</summary>' + gov.map(rowHTML).join('') + '</details>'; }
// Debts: credit cards and other loans amortise separately at their APR (effective). A stated repayment is used if it more than covers the interest; otherwise a 5-year repayment is worked out from the customer's figures (labelled, spec §15).
function debtNums(n){ const cR = n('cardRate') > 0 ? n('cardRate') / 100 : AS.cardRate, lR = n('loanRate') > 0 ? n('loanRate') / 100 : AS.loanRate, c = n('cardBal'), l = n('loanBal') + n('debt'), lp = n('loanPayM') + n('debtPayM'), cp = n('cardPayM');
  const ok = (b, p, r) => b > 0 && p > b * iAPR(r), pay = (b, p, r) => ok(b, p, r) ? p : pmtM(b, iAPR(r), 60), cardPayM = c > 0 ? pay(c, cp, cR) : 0, loanPayM = l > 0 ? pay(l, lp, lR) : 0;
  return {cardRateKnown:n('cardRate') > 0 || asmMine('cardRate'), loanRateKnown:n('loanRate') > 0 || asmMine('loanRate'), cardBal:c, cardRate:cR, cardPayM, cardPayEst:c > 0 && !ok(c, cp, cR), loanBal:l, loanRate:lR, loanPayM, loanPayEst:l > 0 && !ok(l, lp, lR), debt:c + l, debtPayM:cardPayM + loanPayM, debtPayEst:(c > 0 && !ok(c, cp, cR)) || (l > 0 && !ok(l, lp, lR))}; }
function finNums(){ syncLists();
  // Skipped figures count as €0 and show as ❓ Missing. We never fill in a figure for the customer (spec §15).
  const f = S.fin, n = k => { const v = f[k]; return v != null && v !== '' && !isNaN(+v) ? +v : 0; };
  const mortOn = f.home === 'Own with mortgage', mR = n('mortRate') > 0 ? n('mortRate') / 100 : AS.mortRate, mStated = mortOn ? n('mortPayM') : 0, inc = f.work === 'Not working' ? 0 : n('income');
  const penM = f.work !== 'Not working' && inc > 0 ? n('pensionM') : 0, own = f.pensionOwnM != null && f.pensionOwnM !== '' && !isNaN(+f.pensionOwnM) ? Math.min(penM, +f.pensionOwnM) : penM * asmV('ownShare');
  const yrsSP = f.spYears != null && f.spYears !== '' ? +f.spYears : asmGet('spYears'), spF = yrsSP != null ? spFrac(+yrsSP) : f.sp === 'Expect full' ? 1 : Math.min(1, +asmV('spWeek') / RI.sp.week);   // §14 type 2: the customer's own weekly amount when they don't know their years
  const pSpO = S.about.partner ? (f.pSp || 'Not sure') : 'None', pSp = {'Own full':1, 'Own partial':Math.min(1, +asmV('pSpWeek') / RI.sp.week), 'Not sure':Math.min(1, +asmV('pSpWeek') / RI.sp.week), 'Qualified adult increase':'qa', 'None':0}[pSpO];
  const aeElig = f.work === 'Employed' && S.about.age >= RI.ae.ageMin && S.about.age <= RI.ae.ageMax && inc > RI.ae.earnMin && penM === 0;
  const C = S.about.cred || {};
  return {age:S.about.age, R:S.retireAge, work:f.work, married:!!S.about.partner && S.about.married === true, partner:!!S.about.partner, pAge:n('pAge') || S.about.age, income:inc, pIncome:S.about.partner ? n('pIncome') : 0,
    otherM:n('otherM'), costsM:n('costsM'), oneOffY:n('oneOffY'), cash:n('cash'), invest:n('invest'), rentM:n('rentM'),
    mortBal:mortOn ? n('mortBal') : 0, mortRate:mR, mortPayM:mortOn ? (mStated || mPmt(n('mortBal'), mR, n('mortYears') || 25)) : 0, mortPayEst:mortOn && !mStated, mortYearsKnown:n('mortYears') > 0, mortPayLow:mortOn && mStated > 0 && n('mortBal') > 0 && n('mortYears') > 0 && mStated < mPmt(n('mortBal'), mR, n('mortYears')) - 1, mortYears:mortOn ? n('mortYears') : 0,
    ...debtNums(n),
    pension:n('pension'), pensionM:penM, pensionOwnM:own, penG:penGrowth(), sp:spF, spKnown:yrsSP != null || f.sp === 'Expect full' || asmMine('spWeek'), pSp, pSpO, ae:aeElig && f.ae !== 'No', aeElig, mortRateKnown:n('mortRate') > 0 || asmMine('mortRate'),
    rentCred:!!C.rent && f.home === 'Rent', spccc:!!C.lone && S.about.deps > 0 && !S.about.partner, carer:!!C.carer && !!S.about.partner && S.about.married === true};
}
// Essential spending a month (B16: the same everywhere): living costs + mortgage + loan repayments
const essM = F => (F = F || finNums(), F.costsM + F.mortPayM + (F.debt > 0 ? F.debtPayM : 0));
// FP round 6: stated figures are used as stated. The mortgage repayment is the one on the statement (or typed); the standard
// formula works the repayment out from balance, rate and years left when none is given (labelled, spec §15). Monthly amortisation, at the statement's rate when we have it.
function mPmt(bal, r, yrs){ const i = r / 12, n = Math.max(1, Math.round(yrs * 12)); return bal > 0 ? (i ? bal * i / (1 - Math.pow(1 + i, -n)) : bal / n) : 0; }
function pmtM(bal, i, n){ return bal > 0 ? (i ? bal * i / (1 - Math.pow(1 + i, -n)) : bal / n) : 0; }
function amortYear(bal, r, payM, iM){ const i = iM != null ? iM : r / 12; let paid = 0; for (let m = 0; m < 12 && bal > 0.5; m++){ const it = bal * i, p = Math.min(payM, bal + it); paid += p; bal = bal + it - p; } return {bal:Math.max(0, bal), paid}; }
// Pension growth after charges: the assumption set's rate assumes typical charges (B6, about 1% a year); a statement's own charges replace that.
const PEN_TYP_CHG = 0.01;
const penTypChg = () => +asmV('penChg');
function penGrowth(){ const c = S.fin && S.fin.penChg != null && S.fin.penChg !== '' && !isNaN(+S.fin.penChg) ? +S.fin.penChg / 100 : null; return c == null ? AS.pen : AS.pen + penTypChg() - c; }
// Pension pot after y years: grows yearly, contributions rise with pay. The plan (project) and the Retirement tool both use this rule.
function pensionAt(y, pot, monthly, g, w){ for (let t = 0; t < y; t++) pot = pot * (1 + g) + monthly * 12 * Math.pow(1 + w, t); return pot; }
