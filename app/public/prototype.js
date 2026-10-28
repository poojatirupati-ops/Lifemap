'use strict';
/* ================= IRISH RULES & RATES: ONE PLACE (FP round 7; audit deliverables/irish-rules-and-rates-audit.md §2) =================
   Every statutory value the engine, the calculators and the copy use. Each leaf: v (value), src (source URL), eff (effective date),
   verify (true = open the primary page and record the date before release; audit "Src" P or S). Budget 2027 (6 Oct 2026) is a one-place update here.
   Judgement values are NOT here: they are the customer's own choices ("Your assumptions", ASM below). */
let RULES_VERSION = 'Irish rules 2026 · checked 2 Oct 2026, with Budget 2027 changes already in force (CGT, Help to Buy)';
let BUDGET27 = 'This plan uses 2026 rules. Budget 2027 changes (from 1 January 2027) are available: choose 2027 as the plan start year in Your assumptions.';   // set by setRulesYear(); every 2027 figure is flagged verify until the Finance Bill is final
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
    deemed:RV_(8, 'https://etf.ie/blog/budget-2026-etf/', '2026'),
    cgt:RV_(0.31, 'https://www.gov.ie/en/department-of-public-expenditure-infrastructure-public-service-reform-and-digitalisation/publications/your-guide-to-budget-2027/', 'disposals from 7 Oct 2026 (Budget 2027)', false),
    cgtExempt:RV_(1270, 'https://www.revenue.ie/en/gains-gifts-and-inheritance/', 'Law (annual exemption per person)'),
    cat:RV_(420000, 'https://www.gov.ie/en/department-of-public-expenditure-infrastructure-public-service-reform-and-digitalisation/publications/your-guide-to-budget-2027/', 'gifts and inheritances from 7 Oct 2026 (Group A up 5%, from €400,000)')
  },
  home:{
    ltiFTB:RV_(4, 'https://www.centralbank.ie/news/article/central-bank-announces-targeted-changes-to-mortgage-measures-framework', '1 Jan 2023'),
    ltiSSB:RV_(3.5, 'https://www.centralbank.ie/news/article/central-bank-announces-targeted-changes-to-mortgage-measures-framework', '1 Jan 2023'),
    ltv:RV_(0.90, 'https://www.centralbank.ie/news/article/central-bank-announces-targeted-changes-to-mortgage-measures-framework', '1 Jan 2023'),
    stamp:RV_([[1e6, 0.01], [1.5e6, 0.02], [Infinity, 0.06]], 'https://www.raisin.com/en-ie/taxes/stamp-duty-ireland/', 'Budget 2025'),
    htbMax:RV_(35000, 'https://www.gov.ie/en/department-of-public-expenditure-infrastructure-public-service-reform-and-digitalisation/publications/your-guide-to-budget-2027/', 'immediate effect, Budget 2027 (scheme to 31 Dec 2029)', false)
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
/* ---------- Budget 2027 (announced 6 Oct 2026): a plan that starts in 2027 uses these rules ----------
   Each entry replaces one RI value from 1 Jan 2027. Where a figure was not in the announced Budget (age credit, DIRT, Qualified Adult and other DSP rates, SFT, stamp duty)
   the 2026 value stays and the page says so. Checked 21 Oct 2026 against the Department of Finance Tax Policy Changes Summary and the Budget in Brief (both read in full): the changes below are stated there as increases (+€2,500 band, +€125 credits, +€100 Home Carer, USC 2% ceiling €28,700 to €30,300, +€150 / +€300 Rent Tax Credit, +€10 weekly social welfare, 38% to 35%).
   The totals are the 2026 figure plus the stated increase. The Finance Bill may still change details. */
const B27_SRC = 'https://www.gov.ie/en/department-of-public-expenditure-infrastructure-public-service-reform-and-digitalisation/publications/your-guide-to-budget-2027/';   // Your guide to Budget 2027 (gov.ie, published 6 Oct 2026); with the Department of Finance 'Tax Policy Changes Summary' and the Budget in Brief PDF (read in full 21 Oct 2026)
const RULES_2027 = {
  'it.band':RV_(46500, B27_SRC, '1 Jan 2027', false), 'it.bandSPCCC':RV_(50500, B27_SRC, '1 Jan 2027', false), 'it.bandMarried':RV_(55500, B27_SRC, '1 Jan 2027', false), 'it.bandUplift':RV_(37500, B27_SRC, '1 Jan 2027 (two incomes up to 93,000)', false),
  'it.personal':RV_(2125, B27_SRC, '1 Jan 2027', false), 'it.personalMarried':RV_(4250, B27_SRC, '1 Jan 2027', false), 'it.paye':RV_(2125, B27_SRC, '1 Jan 2027', false), 'it.eic':RV_(2125, B27_SRC, '1 Jan 2027', false),
  'it.homeCarer':RV_(2050, B27_SRC, '1 Jan 2027', false), 'it.rent':RV_(1150, B27_SRC, '2027 and 2028', false), 'it.rentJoint':RV_(2300, B27_SRC, '2027 and 2028', false),
  'usc.bands':RV_([[12012, 0.005], [30300, 0.02], [70044, 0.03], [Infinity, 0.08]], B27_SRC, '1 Jan 2027 (2% band now to 30,300)', false),
  'sp.week':RV_(309.30, B27_SRC, 'Jan 2027 (+€10 on weekly social welfare payments)', false), 'sp.illness':RV_(264, B27_SRC, 'Jan 2027 (+€10 assumed from the general €10 rise; the exact rate is not in the guide)', true), 'sp.survivor':RV_(269.50, B27_SRC, 'Jan 2027 (+€10 assumed from the general €10 rise; the exact rate is not in the guide)', true), 'sp.survivor66':RV_(309.30, B27_SRC, 'Jan 2027 (+€10 assumed from the general €10 rise; the exact rate is not in the guide)', true),
  'sav.exit':RV_(0.35, B27_SRC, '1 Jan 2027 (Investment Undertaking Tax, life assurance exit tax, equivalent offshore funds and certain foreign policies; 8-year deemed disposal stays)', false)
};
const RULES_2027_NOT_CHANGED = 'Not in the Budget 2027 tax measures, so 2026 figures stay: DIRT, USC rates and the 3% band, PRSI (rate path already legislated), pension relief and lump-sum limits, stamp duty, age credit, single-parent credit. The Standard Fund Threshold valuation factors are being revised (not modelled). The exact Qualified Adult rate is not in the published guide and stays at 2026.';
const RI_BASE = {};   // 2026 values of everything the overlay can replace
const riGet = (p) => p.split('.').reduce((o, k) => o[k], RI), riSet = (p, v) => { const ks = p.split('.'), l = ks.pop(); ks.reduce((o, k) => o[k], RI)[l] = v; };
Object.keys(RULES_2027).forEach(p => { const v = riGet(p); RI_BASE[p] = Array.isArray(v) ? v.map(x => Array.isArray(x) ? x.slice() : x) : v; });
let RULES_YEAR = 2026;
function setRulesYear(y){ y = y >= 2027 ? 2027 : 2026; if (y === RULES_YEAR) return; RULES_YEAR = y;
  Object.keys(RULES_2027).forEach(p => riSet(p, y === 2027 ? RULES_2027[p].v : RI_BASE[p]));
  RULES_VERSION = y === 2027 ? 'Irish rules 2027 · Budget 2027 (announced 6 Oct 2026), Finance Bill pending' : 'Irish rules 2026 · checked 2 Oct 2026, with Budget 2027 changes already in force (CGT, Help to Buy)';
  BUDGET27 = y === 2027 ? 'This plan uses Budget 2027 rules from 1 January 2027 (announced 6 October 2026). The Finance Bill may still change some details. ' + RULES_2027_NOT_CHANGED : 'This plan uses 2026 rules. Budget 2027 changes (from 1 January 2027) are available: choose 2027 as the plan start year in Your assumptions.'; }
// Law figures quoted in copy, built once from the register (§14: every figure quoted once, from the single rules register)
const LAW = {ls:'up to ' + '€' + RI.pen.lsTaxFree.toLocaleString('en-IE') + ' tax-free, the next €' + (RI.pen.lsCap - RI.pen.lsTaxFree).toLocaleString('en-IE') + ' taxed at ' + Math.round(RI.pen.lsBandRate * 100) + '%, and anything above €' + RI.pen.lsCap.toLocaleString('en-IE') + ' taxed at your marginal rate (' + Math.round(RI.it.r2 * 100) + '% here)',
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
/* H3: the investment standard is DERIVED, never typed, so it cannot drift from its own explanation:
   growth before fees and tax, less charges, less exit tax paid every 8 years (deemed disposal), per year, to 0.1%. */
const INV_CHG_STD = 0.01;   // the fund charges used if no charges figure is set (the Pensions Authority assumption, Market rates)
const invNet = (extraCut) => { const g = (() => { const x = SETTINGS.s.invGross; return x.pv != null ? x.pv : x.v; })() - (extraCut || 0), cs = SETTINGS.s.fundChg, c = cs && (cs.pv != null ? cs.pv : cs.v) != null ? (cs.pv != null ? cs.pv : cs.v) : INV_CHG_STD, y = RI.sav.deemed, t = RI.sav.exit, f = Math.pow(1 + g - c, y);
  return Math.round((Math.pow(f - t * (f - 1), 1 / y) - 1) * 1000) / 1000; };
const invBy = () => { const x = SETTINGS.s.invGross, cs = SETTINGS.s.fundChg, pc = v => (Math.round(v * 1000) / 10) + '%', g = x.pv != null ? x.pv : x.v, c = cs && (cs.pv != null ? cs.pv : cs.v) != null ? (cs.pv != null ? cs.pv : cs.v) : INV_CHG_STD;
  return 'a planning assumption, not a prediction: ' + pc(g) + ' before fees and tax, less about ' + pc(c) + ' charges, less ' + Math.round(RI.sav.exit * 100) + '% exit tax taken every ' + RI.sav.deemed + ' years'; };
const SETTINGS = {partner:'', s:{
  infl:{n:'Inflation: prices rise (a year)', u:'pct', grp:'Prices & growth', v:0.02, by:'the ECB target for the long term', src:'https://www.bundesbank.de/en/tasks/topics/european-central-bank-updates-monetary-policy-strategy-970824', asat:'2025 strategy', verify:true},
  wage:{n:'Pay rises (a year)', u:'pct', grp:'Prices & growth', v:0.03, by:'Irish pay has grown about 3%–4% a year recently (CSO)', src:'https://www.cso.ie/en/statistics/earnings/', asat:'2026', verify:true, vc:0.025, guide:'Pick lower if your pay is fixed or you expect to work part-time.'},
  cash:{n:'Cash savings earn (a year, after DIRT)', u:'pct', grp:'Prices & growth', v:0.01, by:'Irish deposit rates after 33% DIRT', src:'https://centralbank.ie/statistics/data-and-analysis/credit-and-banking-statistics/retail-interest-rates', asat:'Jun 2026', verify:true, vc:0.007},
  inv:{n:'Investments grow (a year, after charges and tax)', u:'pct', grp:'Prices & growth', get v(){ return invNet(0); }, get by(){ return invBy(); }, src:'Derived: the growth before fees and tax (above), the charges (Market rates) and the exit tax and 8-year rule (Tax rules)', asat:'2026', verify:true, get vc(){ return invNet(0.01); }, guide:'A planning assumption, not a prediction. Growth is never guaranteed and funds can fall in value. It moves if you change the growth before fees and tax, or the charges.'},
  invGross:{n:'Investments grow before fees and tax (a year; growth and fees tools)', u:'pct', grp:'Prices & growth', v:0.05, by:'LifeMap standard, not a forecast', src:'LifeMap planning standard, not a prediction. Reference points: Pensions Authority pension-calculator growth assumption; Central Bank of Ireland guidance that returns are not guaranteed', asat:'2026', verify:true, guide:'Used by the lump sum, regular investing, fees and real return tools. Growth is never guaranteed.'},
  pen:{n:'Pension grows while you work (a year, after charges)', u:'pct', grp:'Prices & growth', v:0.045, by:'a planning assumption after charges, not a prediction', src:'LifeMap planning standard, not a prediction. Reference point: Pensions Authority pension-calculator assumptions', asat:'2026', verify:true, vc:0.04, guide:'A planning assumption, not a prediction. Growth is tax-free inside the fund.'},
  penRet:{n:'Pension grows once retired (a year, after charges)', u:'pct', grp:'Prices & growth', v:0.0315, by:'a lower-risk fund once retired, after charges', src:'LifeMap planning standard, not a prediction. Reference point: Pensions Authority pension-calculator assumptions', asat:'2026', verify:true, vc:0.028, guide:'Most people take less risk once retired, so growth is usually lower.'},
  rentRise:{n:'Rent vs buy: rent rises (a year)', u:'pct', grp:'Home', v:0.03, by:'a long-run planning figure', src:'LifeMap long-run planning figure. Reference points: Residential Tenancies Board Rent Index; CSO Consumer Price Index (rent)', asat:'2026', verify:true, guide:'Renting has rent rises. Buying has costs that don\'t build equity: interest, stamp duty, fees, LPT and repairs.'},
  houseGrow:{n:'Rent vs buy: house prices rise (a year)', u:'pct', grp:'Home', v:0.02, by:'a long-run planning figure; prices can fall', src:'LifeMap long-run planning figure. Reference point: CSO Residential Property Price Index', asat:'2026', verify:true, guide:'House prices can fall as well as rise.'},
  upkeep:{n:'Rent vs buy: upkeep a year (share of home value)', u:'pct', grp:'Home', v:0.01, by:'repairs, insurance and maintenance', src:'LifeMap planning standard (no official figure exists)', asat:'2026', verify:false},
  ownShare:{n:'Share of pension contributions you pay yourself', u:'pct', grp:'Retirement', v:0.5, by:'a common 5% + 5% split with your employer; 100% if self-employed', src:'Pensions Authority and My Future Fund (auto-enrolment) contribution split, 2026', asat:'2026', verify:false, guide:'Your payslip shows what comes out of your pay. Only your own share gets tax relief. If you type your own amount in Your finances, we use that.'},
  retireMult:{n:'Retirement savings target: times the yearly income needed', u:'num', grp:'Retirement', v:25, by:'a common rule of thumb, about 4% a year', src:'Widely used 4% sustainable-withdrawal rule of thumb (W. Bengen, Journal of Financial Planning, 1994)', asat:'2026', verify:false, guide:'Retiring early or planning to 95 needs more.'},
  retireSpend:{n:'Retirement spending if no goal (share of today\'s spending)', u:'pct', grp:'Retirement', v:0.8, by:'most people spend a bit less once work costs and the mortgage stop', src:'LifeMap planning standard. Reference points: Pensions Authority and Society of Actuaries in Ireland retirement-income guidance', asat:'2026', verify:false},
  accessAge:{n:'Pension access age (the earliest age you can draw your pension)', u:'choice', grp:'Retirement', v:60, by:'most pensions can be drawn from 60; some occupational schemes allow 50', src:'Revenue Commissioners: pension benefits can usually be taken from age 60 (PRSAs and personal pensions); some occupational schemes allow retirement from 50 (see the law register)', asat:'2026', verify:true, guide:'We assume 60. Choose 50 only if your occupational scheme says it allows it. Before this age your plan pays for life from savings and other income.'},
  lumpSum:{n:'Tax-free lump sum to take (share of pension; law limit 25%)', u:'pct', grp:'Retirement', v:0.25, by:'most people take the full tax-free amount', src:'Revenue Commissioners: tax-free retirement lump sum, up to 25% of the fund (law limit)', asat:'Law limit 25%', verify:false},
  safetyMonths:{n:'Emergency fund: months of essential spending', u:'num', grp:'Emergency fund & saving', v:6, by:'6 months for a single income or self-employed, 3 for two secure incomes', src:'LifeMap planning standard. Reference points: MABS and CCPC (ccpc.ie) guidance on keeping 3 to 6 months of essential spending as an emergency fund', asat:'2026', verify:false, guide:'Easy-access cash for surprises or a gap in pay. Essential spending = living costs + mortgage + loan repayments.'},
  safetyMonthsTwo:{n:'Emergency fund: months with two secure incomes', u:'num', grp:'Emergency fund & saving', v:3, by:'two secure incomes', src:'LifeMap planning standard. Reference points: MABS and CCPC guidance', asat:'2026', verify:false},
  cashYears:{n:'Money for goals sooner than this is kept as cash (years)', u:'yrs', grp:'Emergency fund & saving', v:5, by:'money needed within 5 years is usually kept as cash', src:'LifeMap planning standard (common planning practice: money needed within about 5 years is not invested)', asat:'2026', verify:false, guide:'Longer-term money has more time to ride out ups and downs.'},
  investShare:{n:'Spare savings: share invested', u:'pct', grp:'Emergency fund & saving', v:0.4, by:'a balanced cash and invested mix', src:'LifeMap planning standard (a balanced cash and invested mix)', asat:'2026', verify:false},
  cgtGain:{n:'Other assets and alternative investments: share of the value that is a gain', u:'pct', grp:'Emergency fund & saving', v:0.4, by:'a planning figure, because we do not know what you paid', src:'LifeMap planning standard. Capital gains tax applies to the gain only, not the whole value.', asat:'2026', verify:false, guide:'When other assets, crypto, gold or art are sold for a goal, capital gains tax is taken off this share of their value.'},
  saveShare:{n:'Share of spare money saved, at most', u:'pct', grp:'Emergency fund & saving', v:0.5, by:'half of your spare money', src:'LifeMap planning standard', asat:'2026', verify:false, guide:'We never count more than this share of your spare money as saved, unless you set your own monthly saving.'},
  noAnswer:{n:'Monthly saving if not answered', u:'eur', grp:'Emergency fund & saving', v:300, by:'a modest regular amount', src:'LifeMap planning standard', asat:'2026', verify:false, guide:'Used until you answer "How much could you comfortably invest each month?".'},
  lifeShare:{n:'Life cover: share of income the family needs', u:'pct', grp:'Protection', v:0.6, by:'families usually need less than full pay', src:'LifeMap planning standard. Reference point: Irish life-insurer needs calculators', asat:'2026', verify:false},
  lifeYears:{n:'Life cover: years of support', u:'yrs', grp:'Protection', v:15, by:'often until your youngest child is 23', src:'LifeMap planning standard. Reference point: Irish life-insurer needs calculators', asat:'2026', verify:false},
  riskMu:{n:'Risk and return: growth a year, Cautious / Balanced / Growth', u:'pct3', grp:'Risk and budget', v:[0.02, 0.04, 0.06], by:'illustrations, not forecasts', src:'LifeMap illustrations, not forecasts', asat:'2026', verify:false, guide:'Your adviser uses the fund\'s own risk rating (SRI 1–7).'},
  riskVol:{n:'Risk and return: ups and downs (volatility), Cautious / Balanced / Growth', u:'pct3', grp:'Risk and budget', v:[0.05, 0.10, 0.16], by:'illustrations, not forecasts', src:'LifeMap illustrations, not forecasts', asat:'2026', verify:false, guide:'How much a year can swing.'},
  budget:{n:'Budget split: needs / wants / savings and debt', u:'pct3', grp:'Risk and budget', v:[0.5, 0.3, 0.2], by:'the 50/30/20 rule', src:'The 50/30/20 budgeting rule (E. Warren and A. Warren Tyagi, All Your Worth, 2005)', asat:'2026', verify:false},
  bands:{n:'Tax bands in future', u:'choice', grp:'Choices', v:'prices', by:'Budgets have broadly kept pace over time', src:'Department of Finance Budget history (tax bands and credits, 2015 to 2026)', asat:'2026', verify:false, guide:'Irish tax bands are set each Budget and don\'t rise automatically. "Stay as today" is the cautious view (more tax later).'},
  spGrow:{n:'State Pension in future', u:'choice', grp:'Choices', v:'prices', by:'it has broadly kept pace with prices over time', src:'Department of Social Protection weekly State Pension rate history', asat:'2026', verify:false, guide:'The State Pension is set each Budget.'},
  drawRule:{n:'How you draw your pension', u:'choice', grp:'Choices', v:'spread', by:'spread over your plan, at least the legal minimum', src:'Revenue Commissioners: ARF and vested PRSA minimum annual distribution (4% from 61, 5% from 71; 6% over €2m)', asat:'2026', verify:false},
  ddTiming:{n:'Drawdown tools: withdrawals taken at the', u:'choice', grp:'Choices', v:'start', by:'the prudent choice: the money has less time to grow before you take it', src:'LifeMap tool setting', asat:'2026', verify:false},
  waitYears:{n:'Lump sum tool: years you might wait before investing', u:'yrs', grp:'Choices', v:5, by:'an illustration of the cost of waiting', src:'LifeMap tool setting (an illustration of the cost of waiting)', asat:'2026', verify:false},
  style:{n:'Risk and return tool: investment style (1 Cautious, 2 Balanced, 3 Growth)', u:'num', grp:'Choices', v:2, by:'Balanced; an adviser checks your attitude to risk', src:'LifeMap tool setting (Balanced; an adviser checks attitude to risk)', asat:'2026', verify:false},
  // market rates: never pre-filled; shown as the chip "Use the suggested rate (X) · label". v:null = no published figure, so no suggestion.
  mortRate:{n:'Suggested mortgage rate', u:'pct', grp:'Market rates', v:0.0348, by:'Central Bank of Ireland: average rate on new mortgages, Jul 2026', label:'Central Bank of Ireland: average rate on new mortgages, Jul 2026', src:CBI_RATES, asat:'Jul 2026', verify:true, guide:'Your mortgage statement shows your rate. Typing it is fine: no upload needed.'},
  loanRate:{n:'Suggested personal and car loan rate (APR)', u:'pct', grp:'Market rates', v:0.0672, by:'Central Bank of Ireland: average rate on new consumer loans, Jul 2026', label:'Central Bank of Ireland: average rate on new consumer loans, Jul 2026', src:CBI_RATES, asat:'Jul 2026', verify:true, guide:'Your loan agreement shows your APR.'},
  cardRate:{n:'Suggested credit card rate (APR)', u:'pct', grp:'Market rates', v:null, by:'No published average', label:'No published average', src:CBI_RATES, asat:'—', verify:true, guide:'Your card statement shows your APR.'},
  depRate:{n:'Suggested deposit rate (fixed term, before 33% DIRT)', u:'pct', grp:'Market rates', v:0.0192, by:'Central Bank of Ireland: average rate on new fixed-term household deposits, Jul 2026', label:'Central Bank of Ireland: average rate on new fixed-term household deposits, Jul 2026', src:CBI_RATES, asat:'Jul 2026', verify:true, guide:'If you rent, your deposit stays in savings. Leave it blank and we use the suggested rate (Assumed: add yours).'},
  buyFees:{n:'Suggested buying fees (legal and survey)', u:'eur', grp:'Market rates', v:null, by:'No published figure', label:'No published figure', src:'No published figure', asat:'—', verify:false},
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
/* ================= DATA (Discover wording verbatim from Lifecast DISC) ================= */
const CHAPTERS = {1:'Your money mindset', 2:'How you decide', 3:'Your investment capacity', 4:'Your risk appetite', 5:'Your next chapter'};
const DQ = [
  {id:'2', act:1, q:"Your friends would say you're always…", sub:'', type:'cards', o:[
    {e:'📊', tag:'The Budgeter', t:'Sticking to a budget', w:{A:2}}, {e:'🔍', tag:'Money Vigilant', t:'Checking your balance', w:{B:2}}, {e:'📱', tag:'The Opportunist', t:'Trying something new', w:{E:2}}, {e:'🧘', tag:'The Money Monk', t:'Relaxed about money', w:{C:2}}]},
  {id:'4', act:2, q:"A friend's investment doubled in a month. What do you do?", sub:'', type:'cards', o:[
    {e:'🏃', tag:'FOMO \u00b7 Herd behaviour', t:'Buy in quickly, before I miss out', w:{E:1}}, {e:'🔎', tag:'Due diligence', t:'Research it before I decide', w:{A:1}}, {e:'🧑‍💼', tag:'Advice-seeker', t:'Ask an expert first', w:{B:1}}, {e:'🙅', tag:'Loss aversion', t:'Stay away. Sounds too risky', w:{B:1, C:1}}]},
  {id:'6', act:3, q:'How much could you comfortably invest each month?', sub:'Without cutting back on everyday life.', type:'cards', o:[
    {e:'🪙', tag:'Starter capacity', t:'Under €100', s:1}, {e:'💶', tag:'Moderate capacity', t:'€100 to €300', s:2}, {e:'💰', tag:'Good capacity', t:'€300 to €750', s:3}, {e:'🏦', tag:'High capacity', t:'Over €750', s:4}, {e:'🎢', tag:'Variable income', t:'It changes month to month', s:2}]},
  {id:'7', act:3, q:'Your car needs a €1,000 repair tomorrow. How would you cover it?', sub:'', type:'cards', o:[
    {e:'✅', tag:'Liquidity reserve', t:'From liquid or emergency fund', s:4}, {e:'🐷', tag:'Goal leakage', t:'From savings', s:2}, {e:'💳', tag:'Credit-funded', t:'Put it on credit card or borrow it', s:1}, {e:'😬', tag:'Not planned yet', t:'I am not sure', s:1}]},
  {id:'8', act:4, q:'Which road would you enjoy most for your long-term money?', sub:'', type:'ride', o:[
    {e:'🛣️', tag:'Low risk', t:'Motorway', s:1, path:'M0 40 L140 28'}, {e:'🏞️', tag:'Cautious', t:'Country road', s:2, path:'M0 42 L20 36 L40 40 L60 30 L80 34 L100 26 L120 28 L140 20'},
    {e:'🌊', tag:'Balanced', t:'Coast road', s:3, path:'M0 44 L20 26 L40 44 L60 18 L80 36 L100 12 L120 28 L140 8'}, {e:'🏔️', tag:'Adventurous', t:'Mountain pass', s:4, path:'M0 46 L20 20 L40 48 L60 10 L80 42 L100 4 L120 30 L140 2'}]},
  {id:'9', act:4, q:'Your €10,000 investment drops to €8,500. What do you do?', sub:'', type:'scenario', from:10000, to:8500, o:[
    {e:'😱', tag:'Panic selling', t:'Sell before it drops more', s:1}, {e:'😬', tag:'Anchoring', t:"Wait until it's back to €10,000, then sell", s:2}, {e:'😌', tag:'Long-term investor', t:'Stay calm and hold on', s:3}, {e:'🛒', tag:'Buy the dip', t:"Buy more while it's cheaper", s:4}]},
  {id:'12', act:5, q:'How do you feel about your financial future?', sub:'Every answer is normal.', type:'cards', o:[
    {e:'😟', tag:'Financial anxiety', t:'Worried', s:1}, {e:'🤞', tag:'Cautious optimism', t:'Hopeful', s:2}, {e:'😌', tag:'Financially confident', t:'Confident', s:4}, {e:'🙈', tag:'Money avoidance', t:'I avoid thinking about it', s:1}]}
];
const DQ_BY = id => DQ.find(q => q.id === id);
/* §12: Discover = 6 questions (Q6 moves to the plan's money-profile step). DQ keeps all 7 for scoring and Understand Me. */
const DISC6 = DQ.filter(q => q.id !== '6');
/* Financial / behavioural terms: Lifecast option tags verbatim (Q2 option 3 = "The Opportunist"), each with a one-line plain meaning */
const TERMS = {
  'The Budgeter':'You like to know where every euro goes.', 'Money Vigilant':'You keep a close eye on your money.', 'The Opportunist':'You are quick to spot and try new chances.', 'The Money Monk':'Money isn\'t the point for you.',
  'FOMO · Herd behaviour':'You\'re tempted to follow the crowd.', 'Due diligence':'You check the facts before you act.', 'Advice-seeker':'You like an expert\'s view before you decide.', 'Loss aversion':'Losses feel bigger than gains.',
  'Starter capacity':'A small amount to invest each month.', 'Moderate capacity':'A steady amount to invest each month.', 'Good capacity':'A healthy amount to invest each month.', 'High capacity':'A large amount to invest each month.', 'Variable income':'What you can put aside changes month to month.',
  'Emergency fund':'You have money set aside for surprises.', 'Thin buffer':'Your emergency fund is also meant for other things.', 'Relies on credit':'Surprises go on a card or a loan.', 'No safety net':'Nothing is set aside for surprises yet.',
  'Liquidity reserve':'You have money set aside for surprises.', 'Goal leakage':'Surprises come out of money saved for your goals.', 'Credit-funded':'Surprises go on a card or a loan.', 'Not planned yet':'Nothing is set aside for surprises yet.',
  'Low risk':'You want your money to stay steady.', 'Cautious':'You accept small ups and downs.', 'Balanced':'You accept some ups and downs for growth.', 'High risk':'You accept big ups and downs for more growth.', 'Adventurous':'You accept big ups and downs for more growth.',
  'Panic selling':'Selling when prices fall, which locks in the loss.', 'Anchoring':'Fixing on the price you paid.', 'Long-term investor':'You ride out the dips.', 'Buy the dip':'You see a fall as a chance to buy.',
  'Short horizon':'You may need the money back soon.', 'Medium horizon':'You may need it in a few years.', 'Long horizon':'It can stay invested for 5 to 10 years.', 'Very long horizon · time in the market':'It can stay put for 10+ years, so there is time to recover from falls.',
  'Low capacity for loss':'A fall would hit your everyday bills.', 'Limited capacity for loss':'A fall would put a goal on hold.', 'Moderate capacity for loss':'A fall would sting, but life goes on.', 'High capacity for loss':'A fall wouldn\'t change your life.',
  'Income risk':'Your pay could stop or change soon.', 'Stable income':'Your pay is fairly steady.', 'Very stable income':'Your pay is very unlikely to stop.',
  'No emergency fund':'Less than a month of savings to fall back on.', 'Emergency fund in place':'3 to 6 months of savings to fall back on.', 'Strong safety net':'6 months or more of savings to fall back on.',
  'Self-directed · Due diligence':'You research big decisions yourself.', 'Validator':'You get the gist, then check with an expert.', 'Delegator · Advice-seeker':'You hand big decisions to an expert you trust.', 'Procrastination · Status quo bias':'Putting decisions off and sticking with what you have, even when a change could help.',
  'Novice investor':'Investing is new to you.', 'Basic knowledge':'You know savings and pensions.', 'Some investing experience':'You have invested in funds or shares.', 'Self-rated expert · watch for overconfidence bias':'You rate yourself highly; watch the urge to think you can beat the market.', 'Overconfidence bias':'Feeling surer about beating the market than the facts support.',
  'Financial anxiety':'Money worries weigh on you.', 'Cautious optimism':'You\'re hopeful, with some doubts.', 'Financially confident':'You feel in control of your future.', 'Money avoidance':'You\'d rather not look at money.'};
// Section names pair the term with a plain label (§12)
const SECT = {safety:['Safety net', 'money for surprises'], appetite:['Risk appetite', 'how much risk you want'], capacity:['Capacity for loss', 'how much you can afford to lose'], horizon:['Time horizon', 'how long you can wait'], behaviour:['Investor behaviour', 'how you tend to act'], mindset:['Money mindset', 'how you feel about money'], experience:['Knowledge & experience', 'how much investing you have done']};
const sectLbl = k => '<b>' + SECT[k][0] + ':</b> ' + SECT[k][1];
const ansTag = id => { const k = S.ans[id], q = DQ_BY(id); return typeof k === 'number' && q.o[k] ? q.o[k].tag : null; };
function termRow(t){ return t ? '<div class="term"><span class="tg">◆ ' + esc(t) + '</span><span class="tm">' + esc(TERMS[t] || '') + '</span></div>' : ''; }
// The customer's own terms, grouped by section (reveal, Me profile, report)
const umTrait = u => { const k = S.um.a[u], q = UM.flatMap(s => s.qs).find(x => x.u === u); return typeof k === 'number' && q && q.o[k] ? q.o[k].trait || null : null; };
function myTerms(){ const g = [['mindset', ['2', '12']], ['behaviour', ['4', '9']], ['appetite', ['8']], ['safety', ['7']], ['capacity', ['6']]];
  const r = g.map(([k, ids]) => ({k, tags:ids.map(ansTag).filter(Boolean)}));
  r[1].tags.push(...['u4', 'u11'].map(umTrait).filter(Boolean));   // §13 traits: Procrastination · Status quo bias, Overconfidence bias
  return r.filter(x => x.tags.length); }
const SECT_IC = {safety:'🪂', mindset:'🧠', behaviour:'🔍', appetite:'🌦️', capacity:'🛟', horizon:'⏳', experience:'🎓'};
function termsHTML(ic){ return myTerms().map(x => '<div class="tsec">' + (ic ? '<div class="tsec-h"><span class="tsec-ic" aria-hidden="true">' + (SECT_IC[x.k] || '◆') + '</span><span class="small" style="color:var(--ink)">' + sectLbl(x.k) + '</span></div>' : '<div class="small" style="color:var(--ink)">' + sectLbl(x.k) + '</div>') + x.tags.map(termRow).join('') + '</div>').join(''); }
const TYPES = {A:{name:'Achiever', e:'🎯', strap:'In control, goal-driven, disciplined with money.', str:['Clear about what you want','You stick to a plan'], watch:'Being too hard on yourself when life changes the plan.'},
  B:{name:'Balancer', e:'⚖️', strap:'Value-seeking, vigilant, careful with risk.', str:['Careful with money','You weigh things up'], watch:'Playing so safe that cash quietly loses value to rising prices.'},
  E:{name:'Explorer', e:'🧭', strap:'Curious, open to new ideas, comfortable with risk.', str:['Open to new ideas','Comfortable with change'], watch:'Jumping in before your emergency fund is in place.'},
  C:{name:'Contented', e:'🛋️', strap:'Comfortable, steady, low-maintenance with money.', str:['Calm about money','Not easily rattled'], watch:'Putting off decisions, such as pension top-ups.'}};
// D1 chips (Pooja, 1 Oct 2026). Keys are stored in S.why; goals = tiles moved to the front of "Suggested for you" (quietly)
const WHY = [{k:'track', e:'🧭', t:'Where I stand'}, {k:'home', e:'🏡', t:'Home & mortgage', goals:['home']},
  {k:'safety', e:'🛟', t:'Emergency fund', goals:['safety']}, {k:'retire', e:'🌅', t:'Retirement plan', goals:['retire']},
  {k:'goal', e:'🎯', t:'Save for something', goals:['travel','car','wedding']}, {k:'invest', e:'📈', t:'Invest my money', goals:['wealth']},
  {k:'debt', e:'💳', t:'Clear my debt', goals:['mfree']}, {k:'change', e:'🔄', t:'Big life change', goals:['home','family','business']},
  {k:'curious', e:'👀', t:'Just exploring'}];
const DISC_FORMAL = 'This tool is designed to help you explore your preferences. It does not replace a formal suitability or risk assessment where financial advice is provided.';

/* Goal tiles: DISC Q11 order, word for word */
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
const OTHER_LIST = [['🧳','Career break',15000,5],['🌍','Moving abroad',20000,4],['🏥','Long-term care',60000,40],['📚','Fund a course',8000,2]];
const SUGGEST = age => age < 35 ? ['safety','home','wealth'] : age < 45 ? ['family','edu','home'] : age < 55 ? ['retire','mfree'] : ['retire','legacy','helpfam'];   // retirement suggested first from 45; never pre-selected

/* Understand Me: 13 questions (7 from Discover + 6 new) */
const UM = [   // §13 (Pooja, 1 Oct 2026): money-profile questions rewritten word for word; every option carries a term tag; option order = score 1→4
  {n:1, t:'Your risk', term:'Risk appetite & time horizon', plain:'how much risk you want, and how long you can wait', e:'🌦️', intro:'How much risk you <b>want</b> to take, and <b>how long</b> you can wait.', qs:[{d:'8'}, {d:'9'},
    {u:'u9', sec:['Time horizon', 'how long your money can stay invested'], q:'If you put money away to grow, when might you need it back?', o:[{e:'⏱️',t:'Within 2 years',tag:'Short horizon',s:1},{e:'📆',t:'In 2 to 5 years',tag:'Medium horizon',s:2},{e:'🗓️',t:'In 5 to 10 years',tag:'Long horizon',s:3},{e:'🌳',t:'Not for 10+ years',tag:'Very long horizon · time in the market',s:4}]}]},
  {n:2, t:'Your capacity', term:'Capacity for loss', plain:'how much you can afford to lose', e:'🛟', intro:'How much risk you <b>can</b> afford to take, without it hurting everyday life.', qs:[{d:'6'}, {d:'7'},
    {u:'u10', sec:['Capacity for loss', 'what a fall would really cost you'], q:'Your €25,000 investment falls by 20% over a year, to €20,000. What would that mean for your life?', help:"Not how you'd feel. What would really change for you.", panel:[25000, 20000], o:[{e:'😟',t:"I'd struggle with everyday bills",tag:'Low capacity for loss',s:1},{e:'⏸️',t:"I'd have to put a plan on hold",tag:'Limited capacity for loss',s:2},{e:'🙂',t:"It would hurt, but I'd be fine",tag:'Moderate capacity for loss',s:3},{e:'😎',t:"No change. I won't need that money for years",tag:'High capacity for loss',s:4}]},
    {u:'u12', sec:['Income stability', 'how steady your pay is'], q:'How steady is your income?', o:[{e:'🌪️',t:'Uncertain right now',tag:'Income risk',s:1},{e:'🌦️',t:'It changes month to month',tag:'Variable income',s:2},{e:'⛅',t:'Fairly steady',tag:'Stable income',s:3},{e:'☀️',t:'Very steady (e.g. permanent job or pension)',tag:'Very stable income',s:4}]},
    {u:'u14', sec:['Emergency fund', 'your emergency fund'], q:'If your income stopped tomorrow, how long could your savings keep you going?', o:[{e:'😬',t:'Less than a month',tag:'No emergency fund',s:1},{e:'🐷',t:'1 to 3 months',tag:'Thin buffer',s:2},{e:'🛟',t:'3 to 6 months',tag:'Emergency fund in place',s:3},{e:'🏰',t:'6 months or more',tag:'Strong safety net',s:4}]}]},
  {n:3, t:'Your investor behaviour', term:'Investor behaviour', plain:'how you tend to act', e:'🧭', intro:'How you tend to act and decide with money. There are no right or wrong answers.', qs:[{d:'2'}, {d:'12'}, {d:'4'},
    {u:'u4', sec:['Decision style', 'how you make big money calls'], q:"A big money decision lands on your desk, like switching your pension. What's your move?", o:[{e:'🔬',t:'Dig into every detail myself',tag:'Self-directed · Due diligence'},{e:'🧭',t:'Get the gist, then check with an expert',tag:'Validator'},{e:'🤝',t:'Hand it to an expert I trust',tag:'Delegator · Advice-seeker'},{e:'⏳',t:'Leave it for another day',tag:'Procrastination · Status quo bias',trait:'Procrastination · Status quo bias'}]},
    {u:'u11', sec:['Knowledge & experience', "what you've done before"], q:'How would you describe your investing know-how?', o:[{e:'🌱',t:'Total beginner',tag:'Novice investor',s:1},{e:'📘',t:'I know the basics: savings and pension',tag:'Basic knowledge',s:2},{e:'📈',t:"I've invested in funds or shares",tag:'Some investing experience',s:3},{e:'🏆',t:"I'm confident I can beat the market",tag:'Self-rated expert · watch for overconfidence bias',trait:'Overconfidence bias',s:4}], chips:['Savings account','Pension','Shares or funds','Crypto','None']}]}
];
// Section term + plain line shown on each money-profile question (§13); Q6 kept as is
const SECQ = {'6':['Investment capacity', 'what you can put to work'], '7':['Cushion', 'money for surprises'], '8':['Risk appetite', 'how much risk you want'], '9':['Investor behaviour', 'how you act when prices fall'], '2':['Money mindset', 'how you handle money day to day'], '12':['Money mindset', 'how you feel about money'], '4':['Investor behaviour', 'how you react to a hot tip']};
const qSec = q => q.sec || SECQ[q.d] || null;

/* Your finances: 6 sections */
const FSEC = [
  {id:'about', t:'About you', e:'🙋', docs:[], f:['name','age','retireAge','pAge']},
  {id:'income', t:'Income and expenses', e:'💶', docs:[['🧾','Payslips (last 3)'],['🏛️','Employment Detail Summary'],['🏦','Current-account statements'],['📑','Form 11 / Notice of Assessment']], f:['work','income','pIncome','otherM','costsM','oneOffY']},
  {id:'assets', t:'Assets', e:'🏠', docs:[['🐷','Savings or credit-union statement'],['📈','Investment statement'],['🪙','Share scheme or crypto statement'],['🏡','Property valuation or LPT record']], f:['home','homeValue','homeUse','downAge','downValue','cash','savings','invest','otherAssets','altInv','propValue','rentM']},
  {id:'liab', t:'Liabilities', e:'💳', docs:[['🏠','Mortgage statement'],['📄','Loan statement'],['💳','Credit-card statement'],['🗂️','Central Credit Register report']], f:['mortYN','mortBal','mortPayM','mortYears','mortRate','cardBal','cardPayM','cardRate','loanBal','loanPayM','loanRate','mort2']},
  {id:'prot', t:'Protection', e:'🛡️', docs:[], f:['life','ip','ci','workCover','health']},
  {id:'pension', t:'Pension', e:'🌅', docs:[['📊','Pension statement'],['🏢','Employer scheme details'],['🏛️','State Pension record (MyWelfare)']], f:['pension','pensionM','pensionOwnM','ae','sp','pSp','polLump','polLumpAge','polInc','polIncAge']}
];
const own = () => /^Own/.test(S.fin.home || ''), mort = () => S.fin.home === 'Own with mortgage';
/* §24.1: "Do you have a mortgage?" is the mortgage block's first question and stays in step with Your home. Yes = Own with mortgage; No = Own outright.
   If they rent or live with family, Yes means a mortgage on another property (added below), and Your home is left as they said it. */
const mortYNval = () => S.fin.home === 'Own with mortgage' ? 'Yes' : S.fin.home === 'Own outright' ? 'No' : (S.fin.mortYN || null);
function setMortYN(v){ const h = S.fin.home; let ok = true;
  if (v === 'Yes'){ if (!h || h === 'Own outright'){ ok = setManual('home', 'Own with mortgage', 'typed'); if (ok){ delete S.fin.mortYN; delete S.src.mortYN; } }
    else if (h !== 'Own with mortgage'){ S.fin.mortYN = 'Yes'; S.src.mortYN = 'typed'; if (!LI('mort2').length){ S.lt = S.lt || {}; S.lt.mort2 = true; LI('mort2').push(newItem('mort2')); } } }
  else { if (h === 'Own with mortgage') ok = setManual('home', 'Own outright', 'typed'); else { S.fin.mortYN = 'No'; S.src.mortYN = 'typed'; } if (ok && /^Own/.test(S.fin.home || '')){ delete S.fin.mortYN; delete S.src.mortYN; } }
  return ok; }
const FF = {
  name:{l:'First name', type:'text', pre:1},
  age:{l:'Your age', type:'num', min:18, max:80, pre:1, show:() => !(S && S.about && S.about.dob)},   // with a date of birth the age comes from it (§29)
  retireAge:{l:'Retirement age', type:'num', pre:1, hint:'From your timeline flag'},
  pAge:{l:"Partner's age", type:'num', min:18, max:85, show:() => S.about.partner && finN('pIncome') > 0},   // §29: the partner's date of birth is optional when they have no income
  work:{l:'Your work', type:'choice', o:['Employed','Self-employed','Not working']},
  income:{l:'Your gross yearly income', type:'eur', hint:'Before tax'},
  pIncome:{l:"Partner's gross yearly income", type:'eur', show:() => S.about.partner && S.partner.mode !== 'invite'},
  otherM:{l:'Other income a month (before tax)', type:'eur', opt:1, hint:'Optional. Taxed with your other income'},
  costsM:{l:'Monthly living costs', type:'eur', hint:'Rent, bills, food and extras. Leave out mortgage and loan repayments.'},
  oneOffY:{l:'Yearly one-off costs', type:'eur', opt:1, hint:'Optional. Car tax, insurance, holidays'},
  home:{l:'Your home', type:'choice', o:['Own outright','Own with mortgage','Rent','Live with family']},
  homeValue:{l:'Home value', type:'eur', show:own},
  cash:{l:'Cash savings', type:'eur', hint:'Current account and easy-access savings, incl. credit union'},
  savings:{l:'Savings accounts', type:'eur', opt:1, hint:'Optional. Deposit, notice and fixed-term accounts, State Savings'},
  invest:{l:'Investments', type:'eur', hint:'Shares, funds, share schemes: one total'},
  otherAssets:{l:'Other assets you would sell if needed', type:'eur', opt:1, hint:'Optional. For example land or a business share. Not your home, and not property you rent out'},
  altInv:{l:'Alternative investments', type:'eur', opt:1, hint:'Optional. Crypto, gold, art, collectables'},
  homeUse:{l:'Would you ever use your home to fund your plan?', type:'choice', o:['No, never', 'Yes, I\'d downsize', 'Only as a last resort'], opt:1, show:own},
  downAge:{l:'Age you would downsize', type:'num', min:50, max:95, opt:1, show:() => own() && S.fin.homeUse === 'Yes, I\'d downsize'},
  downValue:{l:'Value of the smaller home (today\'s money)', type:'eur', opt:1, show:() => own() && S.fin.homeUse === 'Yes, I\'d downsize'},
  polLump:{l:'Savings or endowment policy: amount it pays out', type:'eur', opt:1, hint:'Optional. As shown on the policy, after any tax'},
  polLumpAge:{l:'Your age when it pays out', type:'num', min:18, max:100, opt:1, show:() => finN('polLump') > 0},
  polInc:{l:'Policy or annuity paying a regular income: € a year', type:'eur', opt:1, hint:'Optional. Before tax. For example a guaranteed income plan or annuity. Income protection (cover if you can\'t work) goes under Protection'},
  polIncAge:{l:'Your age when it starts', type:'num', min:18, max:100, opt:1, show:() => finN('polInc') > 0},
  propValue:{l:'Other property: value', type:'eur', opt:1, hint:'Optional'},
  rentM:{l:'Other property: rent received a month (before tax)', type:'eur', opt:1, hint:'Optional. Rental profit is taxed at your marginal rate, with USC and PRSI'},
  mortYN:{l:'Do you have a mortgage?', type:'choice', o:['Yes','No'], opt:1, virtual:1},
  mortBal:{l:'Mortgage left', type:'eur', show:mort},
  mortPayM:{l:'Monthly repayment', type:'eur', show:mort},
  mortYears:{l:'Years left', type:'num', min:1, max:40, show:mort},
  mortRate:{l:'Interest rate, APR %', type:'pct', show:mort, hint:'Your statement shows it. If you leave it blank we use the Central Bank average and say so: "Assumed: add yours"'},
  cardBal:{l:'Credit cards: total owed', type:'eur', list:1},
  cardPayM:{l:'Credit cards: monthly repayment', type:'eur', list:1},
  cardRate:{l:'Credit cards: interest rate (APR %)', type:'pct', list:1, show:() => finN('cardBal') > 0},
  loanBal:{l:'Other loans (car, personal, credit union): total owed', type:'eur', list:1},
  loanPayM:{l:'Other loans: monthly repayment', type:'eur', list:1},
  loanRate:{l:'Other loans: interest rate (APR %)', type:'pct', list:1, show:() => finN('loanBal') + finN('debt') > 0},
  mort2:{l:'Other-property mortgage: years left or repayment', type:'num', list:1, show:() => !!(S.lists && S.lists.mort2 || []).some(it => hasVal(it.f.owed) && +it.f.owed > 0)},
  life:{l:'Life cover', type:'ynn'}, ip:{l:'Income protection', type:'ynn'}, ci:{l:'Serious illness cover', type:'ynn'}, workCover:{l:'Cover through work', type:'ynn'}, health:{l:'Health insurance', type:'ynn'},
  pension:{l:'Pension value today', type:'eur', hint:'All pots together', list:1},
  pensionM:{l:'Paid in each month', type:'eur', hint:'Including your employer', list:1},
  pensionOwnM:{l:'Of that, paid by you each month', type:'eur', opt:1, hint:'Optional. Only your own share gets tax relief. If you leave it blank, you choose your share in Your assumptions', show:() => +S.fin.pensionM > 0 && S.fin.work !== 'Not working', list:1},
  ae:{l:'Have you been auto-enrolled in My Future Fund?', type:'choice', o:['Yes','No','Not sure'], opt:1, hint:LAW.ae + ' Set by law, so we count you in unless you say no', show:() => S.fin.work === 'Employed' && S.about.age >= RI.ae.ageMin && S.about.age <= RI.ae.ageMax && +S.fin.income > RI.ae.earnMin && !(+S.fin.pensionM > 0)},
  sp:{l:'State Pension', type:'choice', o:['Expect full','Partly','Not sure'], hint:LAW.sp + ' Check your record on MyWelfare'},
  pSp:{l:'Your partner\'s State Pension', type:'choice', o:['Own full','Own partial','Qualified adult increase','None','Not sure'], opt:1, show:() => !!S.about.partner, hint:'Optional. A partner without their own State Pension may get a Qualified Adult increase on yours (means-tested)'}
};
/* ================= "Not sure? See an example" (journey-spec §15, Pooja 6 Oct 2026) =================
   Every customer's money is different, so we never fill in a figure for them. Each Your finances field links to a short example card
   built from the sample customers' own figures (SAMPLE_FIN, the same data loadSample() uses). The card never fills the field. */
const SAMPLE_FIN = {name:['Aoife', 'pre'], age:[38, 'pre'], retireAge:[63, 'pre'], pAge:[37, 'typed'],
  work:['Employed', 'doc', 99], income:[58000, 'doc', 98], pIncome:[22000, 'typed'], otherM:[0, 'typed'], costsM:[3600, 'typed'], oneOffY:[1800, 'doc', 81],
  home:['Own with mortgage', 'doc', 99], homeValue:[420000, 'typed'], cash:[9000, 'doc', 97], invest:[6200, 'doc', 88],
  mortBal:[203700, 'doc', 96], mortRate:[3.85, 'doc', 94], mortPayM:[1180, 'doc', 93], mortYears:[21, 'doc', 90], cardBal:[400, 'doc', 86], cardPayM:[40, 'doc', 80], loanBal:[3500, 'doc', 88], loanPayM:[100, 'doc', 84],
  life:['Yes', 'doc', 95], ip:['No', 'typed'], ci:['Not sure', 'typed'], workCover:['Yes', 'doc', 90], health:['Yes', 'typed'],
  pension:[72000, 'doc', 95], pensionM:[520, 'doc', 91], sp:['Expect full', 'typed']};
const SAMPLE_OWN_SHARE = 0.5;   // Aoife's choice in Your assumptions (her statement shows the same €260 of €520)
const sf = k => SAMPLE_FIN[k] ? SAMPLE_FIN[k][0] : null, se = k => eur(sf(k));
const YNN_O = [['Yes', 'you have it'], ['No', 'you don\'t'], ['Not sure', 'check your documents, then come back']];
// t: the example sentence (ends with what they enter or pick); w: where to find yours; o: options explained (choice fields)
const EXAMPLES = {
  age:{t:() => 'Aoife is ' + sf('age') + '. She enters ' + sf('age') + '.', w:'your date of birth, on your passport or driving licence.'},
  retireAge:{t:() => 'Aoife wants to retire at ' + sf('retireAge') + ', before her State Pension starts at ' + RI.sp.age + '. She enters ' + sf('retireAge') + '.', w:'the normal retirement age on your annual pension benefit statement.'},
  pAge:{t:() => 'Aoife\'s partner Cian was born on 3 March ' + (YEAR0 - sf('pAge')) + '. She enters 3, 3 and ' + (YEAR0 - sf('pAge')) + '.', w:'your partner\'s passport, driving licence or birth certificate.'},
  work:{o:[['Employed', 'you get a payslip'], ['Self-employed', 'you file a Form 11'], ['Not working', 'no earnings right now']], t:() => 'Aoife has a payslip, so she picks ' + sf('work') + '.', w:'your payslip, or your Form 11 if self-employed.'},
  income:{t:() => 'Aoife earns ' + se('income') + ' a year before tax. She enters ' + se('income') + '.', w:'gross pay on your payslip, or your Employment Detail Summary in Revenue myAccount.'},
  pIncome:{t:() => 'Cian earns ' + se('pIncome') + ' a year before tax. Aoife enters ' + se('pIncome') + '.', w:'your partner\'s payslip or Employment Detail Summary (Revenue myAccount).'},
  otherM:{t:() => 'Aoife and Cian have no other income, such as rent or maintenance. They enter ' + se('otherM') + '.', w:'your bank statements, or Revenue myAccount for rental income.'},
  costsM:{t:() => 'Aoife and Cian spend ' + se('costsM') + ' a month on bills, food and extras, not counting the mortgage or loans. They enter ' + se('costsM') + '.', w:'your banking app\'s spending summary, or 3 months of current-account statements.'},
  oneOffY:{t:() => 'Aoife and Cian\'s yearly one-off costs, such as car tax, insurance and holidays, come to ' + se('oneOffY') + '. They enter ' + se('oneOffY') + '.', w:'last year\'s bank statements.'},
  home:{o:[['Own outright', 'no mortgage'], ['Own with mortgage', 'still paying it off'], ['Rent', 'you pay a landlord'], ['Live with family', 'no rent or mortgage']], t:() => 'They\'re paying off a mortgage, so Aoife picks ' + sf('home') + '.', w:'your mortgage statement or tenancy agreement.'},
  homeValue:{t:() => 'Aoife and Cian think their home is worth about ' + se('homeValue') + '. They enter ' + se('homeValue') + '.', w:'sale prices of similar homes on the Property Price Register, or your LPT valuation.'},
  cash:{t:() => 'Aoife and Cian have ' + se('cash') + ' in savings, including the credit union. They enter ' + se('cash') + '.', w:'your banking and credit union apps, or An Post State Savings.'},
  invest:{t:() => 'Aoife\'s investment statement shows ' + se('invest') + '. She enters ' + se('invest') + '.', w:'your investment, share-scheme or broker statement or app.'},
  propValue:{t:() => 'Aoife and Cian don\'t own another property. They enter €0.', w:'for a property you own, the Property Price Register or your LPT return.'},
  rentM:{t:() => 'Aoife and Cian don\'t rent out a property, so no rent comes in. They enter €0.', w:'your tenancy agreement or RTB registration.'},
  mortBal:{t:() => 'Aoife and Cian owe ' + se('mortBal') + ' on their mortgage. They enter ' + se('mortBal') + '.', w:'your annual mortgage statement or your lender\'s app.'},
  mortPayM:{t:() => 'Aoife and Cian repay ' + se('mortPayM') + ' a month. They enter ' + se('mortPayM') + '.', w:'your mortgage statement, or the direct debit on your bank statement.'},
  mortYears:{t:() => 'Aoife and Cian\'s mortgage has ' + sf('mortYears') + ' years left. They enter ' + sf('mortYears') + '.', w:'the remaining term on your annual mortgage statement.'},
  cardBal:{t:() => 'Aoife and Cian owe ' + se('cardBal') + ' on their credit card. They enter ' + se('cardBal') + '.', w:'your latest credit-card statement or banking app.'},
  cardPayM:{t:() => 'They pay ' + se('cardPayM') + ' a month off the card. They enter ' + se('cardPayM') + '.', w:'your card statement or banking app: what you actually pay.'},
  loanBal:{t:() => 'Aoife and Cian owe ' + se('loanBal') + ' on a car loan. They enter ' + se('loanBal') + '.', w:'your loan statement, credit union app or Central Credit Register report.'},
  loanPayM:{t:() => 'They repay ' + se('loanPayM') + ' a month on the car loan. They enter ' + se('loanPayM') + '.', w:'your loan agreement, or the payment on your bank statement.'},
  life:{o:YNN_O, t:() => 'Aoife has life cover, so she picks ' + sf('life') + '.', w:'your policy schedule, or HR for cover through work.'},
  ip:{o:YNN_O, t:() => 'Aoife has no income protection, so she picks ' + sf('ip') + '.', w:'your policy documents or your employer\'s benefits booklet.'},
  ci:{o:YNN_O, t:() => 'Aoife isn\'t sure about serious illness cover, so she picks ' + sf('ci') + '.', w:'your policy documents, or ask your insurer.'},
  workCover:{o:YNN_O, t:() => 'Aoife\'s job includes cover, such as death-in-service, so she picks ' + sf('workCover') + '.', w:'your employer\'s benefits booklet or HR.'},
  health:{o:YNN_O, t:() => 'Aoife and Cian have health insurance, so Aoife picks ' + sf('health') + '.', w:'your health insurer\'s renewal letter or app.'},
  pension:{t:() => 'Aoife\'s pension statement shows ' + se('pension') + '. She enters ' + se('pension') + '.', w:'your annual pension benefit statement or the provider\'s app. Add all pots together.'},
  pensionM:{t:() => se('pensionM') + ' goes into Aoife\'s pension each month, including her employer\'s share. She enters ' + se('pensionM') + '.', w:'your payslip (your share) and annual benefit statement (your employer\'s).'},
  pensionOwnM:{t:() => 'Of the ' + se('pensionM') + ', Aoife pays ' + eur(sf('pensionM') * SAMPLE_OWN_SHARE) + ' herself. She enters ' + eur(sf('pensionM') * SAMPLE_OWN_SHARE) + '.', w:'the pension deduction on your payslip.'},
  ae:{o:[['Yes', 'My Future Fund comes off your pay'], ['No', 'you\'re not enrolled'], ['Not sure', 'check your payslip']], t:() => 'Aoife already pays into a workplace pension, so she picks No.', w:'a My Future Fund deduction on your payslip.'},
  sp:{o:[['Expect full', 'about ' + RI.sp.fullYears + ' years of PRSI by ' + RI.sp.age], ['Partly', 'fewer years'], ['Not sure', 'check first']], t:() => 'Aoife expects the full rate, so she picks ' + sf('sp') + '.', w:'your PRSI record and State Pension statement on MyWelfare.ie.'},
  pSp:{o:[['Own full', 'their own full rate'], ['Own partial', 'a reduced rate'], ['Qualified adult increase', 'an addition to yours'], ['None', ''], ['Not sure', '']], t:() => 'Cian isn\'t sure of his rate yet, so Aoife picks Not sure.', w:'your partner\'s MyWelfare.ie record.'}
};
const exChoice = k => (FF[k] || FFI[k]).type === 'choice' || (FF[k] || FFI[k]).type === 'ynn';
function exHTML(k){ const d = FF[k] || FFI[k], x = EXAMPLES[k]; if (!d || !x) return '';
  return '<h2 class="t" id="ex-t">Example: ' + esc(d.l) + '</h2>' + (x.o ? '<ul class="small" style="margin:0 0 8px;padding-left:18px">' + x.o.map(([o, m]) => '<li><b>' + esc(o) + '</b>' + (m ? ': ' + esc(m) : '') + '</li>').join('') + '</ul>' : '') +
    '<p class="sub" style="margin:0 0 8px" id="ex-s">' + esc(x.t()) + '</p><p class="small" style="margin:0 0 8px"><span aria-hidden="true">📍</span> <b>Where to find yours:</b> ' + esc(x.w) + '</p>' +
    (d.type === 'eur' ? '<p class="small" style="margin:0 0 8px"><b>Nothing to add? Enter 0.</b></p>' : '') + '<p class="small" style="margin:0 0 12px;color:var(--muted)">Example only. Not a typical or recommended amount.</p><button class="btn" data-a="closesheet">Got it</button>'; }
// Figures the engine works out from the customer's own figures (calculations, not guesses about the person)
// why a repayment was worked out: none given / a typed €0 / one too small to cover the interest
const payWhy = k => finN(k) > 0 ? 'the repayment given doesn\'t cover the interest' : S.src[k] && S.fin[k] != null && S.fin[k] !== '' ? 'a €0 repayment wouldn\'t clear it' : 'no repayment was given';
function workedNote(k){ const F = finNums();
  if (k === 'mortPayM' && F.mortBal > 0 && F.mortPayEst && F.mortYearsKnown) return 'Worked out from your figures: about ' + eur(F.mortPayM) + ' a month, from your balance, rate and years left' + (S.src.mortPayM && finN('mortPayM') === 0 ? ', because a €0 repayment wouldn\'t clear it' : '') + '. Type yours to replace it.';
  if ((k === 'cardPayM' && F.cardBal > 0 && F.cardPayEst) || (k === 'loanPayM' && F.loanBal > 0 && F.loanPayEst)){ const card = k === 'cardPayM', stated = finN(k);
    return 'Worked out from your figures: ' + eur(card ? F.cardPayM : F.loanPayM) + ' a month clears it in 5 years, because ' + payWhy(k) + '. Type yours to replace it.'; }
  return ''; }
const workedList = () => ['mortPayM', 'cardPayM', 'loanPayM'].map(k => [k, workedNote(k)]).filter(x => x[1]);
/* ================= LISTS: loans, cards, pensions, insurance policies (journey-spec §19.2, §19.4, §19.5) =================
   Each loan, credit card, pension and policy is added on its own with "＋". The plan engine still reads ONE total per group
   (S.fin.cardBal, loanBal, pension, pensionM, …): syncLists() keeps those totals in step with the items (sum of the items; the card and
   other-loan split is kept). A statement attaches to one item (document > typed, the typed figure is kept for "Remove statement").
   Groups with no items leave S.fin alone (so figures set directly still work). */
const FFI = {
  'cards.owed':{l:'Owed on this card', type:'eur'}, 'cards.pay':{l:'Monthly repayment on this card', type:'eur'}, 'cards.lender':{l:'Lender (optional)', type:'text', opt:1}, 'cards.rate':{l:'Interest rate, APR % (optional)', type:'pct', opt:1},
  'mort2.owed':{l:'Mortgage left on this property', type:'eur'}, 'mort2.pay':{l:'Monthly repayment on this mortgage', type:'eur'}, 'mort2.years':{l:'Years left', type:'num', opt:1}, 'mort2.rate':{l:'Interest rate, APR % (optional)', type:'pct', opt:1},
  'loans.owed':{l:'Owed on this loan', type:'eur'}, 'loans.pay':{l:'Monthly repayment on this loan', type:'eur'}, 'loans.lender':{l:'Lender (optional)', type:'text', opt:1}, 'loans.rate':{l:'Interest rate, APR % (optional)', type:'pct', opt:1},
  'pens.name':{l:'Name or provider (optional)', type:'text', opt:1}, 'pens.value':{l:'Value today', type:'eur'}, 'pens.monthly':{l:'Paid in each month, including your employer', type:'eur'}, 'pens.own':{l:'Of that, paid by you each month (optional)', type:'eur', opt:1, hint:'Only your own share gets tax relief. If you leave it blank, you choose your share in Your assumptions.'},
  'life.amount':{l:'Amount covered', type:'eur'}, 'life.term':{l:'Years left on the policy', type:'num', opt:1}, 'ip.amount':{l:'Monthly benefit', type:'eur'}, 'ip.term':{l:'Years left on the policy', type:'num', opt:1},
  'ci.amount':{l:'Amount covered', type:'eur'}, 'ci.term':{l:'Years left on the policy', type:'num', opt:1}, 'workCover.amount':{l:'Death-in-service: lump sum', type:'eur', opt:1}, 'workCover.mult':{l:'Or: how many times your salary', type:'num', opt:1},
  'health.amount':{l:'Yearly cost (optional)', type:'eur', opt:1}};
const LDEF = {
  cards:{sec:'liab', em:'💳', t:'Credit cards', one:'credit card', add:'＋ Add a credit card', f:['owed','pay','lender','rate'], tot:{owed:'cardBal', pay:'cardPayM', rate:'cardRate'}, up:'Upload this card\'s statement (optional)'},
  loans:{sec:'liab', em:'📄', t:'Other loans (car, personal, credit union)', one:'loan', add:'＋ Add a loan', f:['owed','pay','lender','rate'], tot:{owed:'loanBal', pay:'loanPayM', rate:'loanRate'}, up:'Upload this loan\'s statement (optional)'},
  mort2:{sec:'liab', em:'🏠', t:'Mortgages on other properties', one:'mortgage on another property', add:'＋ Add a mortgage on another property', f:['owed','pay','years','rate'], tot:{owed:'mort2Bal', pay:'mort2PayM', rate:'mort2Rate'}, up:'Upload this mortgage\'s statement (optional)'},
  pens:{sec:'pension', em:'🌅', t:'Your pensions', one:'pension', add:'＋ Add another pension', f:['name','value','monthly','own'], tot:{value:'pension', monthly:'pensionM', own:'pensionOwnM'}, up:'Upload this pension\'s statement (optional)'},
  life:{sec:'prot', pol:1, one:'life cover policy', add:'＋ Add another life cover policy', f:['amount','term'], up:'Upload this policy (optional)'},
  ip:{sec:'prot', pol:1, one:'income protection policy', add:'＋ Add another income protection policy', f:['amount','term'], up:'Upload this policy (optional)'},
  ci:{sec:'prot', pol:1, one:'serious illness policy', add:'＋ Add another serious illness policy', f:['amount','term'], up:'Upload this policy (optional)'},
  workCover:{sec:'prot', pol:1, one:'cover through work', add:'＋ Add other cover through work', f:['amount','mult'], up:'Upload your employer benefits statement (optional)'},
  health:{sec:'prot', pol:1, one:'health insurance plan', add:'＋ Add another health insurance plan', f:['amount'], up:'Upload this policy (optional)'}};
const LISTKEY = {cardBal:['cards','owed'], cardPayM:['cards','pay'], loanBal:['loans','owed'], loanPayM:['loans','pay'], pension:['pens','value'], pensionM:['pens','monthly'], pensionOwnM:['pens','own']};
// a sample statement for one item (mock document reader): [field, value, confidence]
const ITEMDOC = {
  cards:{title:'Credit-card statement · Sep 2026', f:[['owed',400,86], ['pay',40,80]], txt:[['lender','Demo Bank B']]}, loans:{title:'Car loan statement · Aug 2026', f:[['owed',3500,88], ['pay',100,84]], txt:[['lender','Demo Credit Union']]},
  mort2:{title:'Mortgage statement (other property) · Aug 2026', f:[['owed',185000,92], ['pay',950,90], ['years',18,88], ['rate',4.1,90]]},
  pens:{title:'Pension statement · Jul 2025', f:[['value',72000,95], ['monthly',520,91], ['own',260,91]], old:'Statement is over 12 months old'},
  life:{title:'Life cover policy · 2021', f:[['amount',250000,95], ['term',21,90]]}, ip:{title:'Income protection policy · 2022', f:[['amount',1800,90], ['term',20,88]]}, ci:{title:'Serious illness policy · 2022', f:[['amount',50000,90], ['term',15,88]]},
  workCover:{title:'Employer benefits statement · 2026', f:[['amount',174000,90]]}, health:{title:'Health insurance policy · 2026', f:[['amount',2400,92]]}};
// The sample customers' insurance (Aoife and Cian), used by the sample and by the example cards
const SAMPLE_POL = {life:[{amount:250000, term:21}], workCover:[{mult:3}], health:[{amount:2400}]};
const LI = lk => { S.lists = S.lists || {}; return S.lists[lk] = S.lists[lk] || []; };
const hasVal = v => v != null && v !== '' && !(typeof v === 'number' && isNaN(v));
const newItem = lk => ({id:S.iid = (S.iid || 0) + 1, f:{}, src:{}, conf:{}, man:{}, fix:{}, docFrom:null});
const itemHasDoc = it => Object.values(it.src).includes('doc');
const itemEmpty = it => !Object.keys(it.f).some(f => hasVal(it.f[f]));
const itemById = (lk, id) => LI(lk).find(x => x.id === +id);
function itemSet(it, fld, v){ const empty = !hasVal(v);
  if (it.src[fld] === 'doc'){ if (empty) delete it.man[fld]; else it.man[fld] = {v, src:'typed'}; return false; }   // a statement figure is not overwritten: the entry is kept
  if (empty){ delete it.f[fld]; delete it.src[fld]; } else { it.f[fld] = v; it.src[fld] = 'typed'; } return true; }
function itemDoc(it, fld, v, conf, fixed, from){ if (it.src[fld] !== 'doc' && hasVal(it.f[fld])) it.man[fld] = {v:it.f[fld], src:it.src[fld]};
  it.f[fld] = v; it.src[fld] = 'doc'; if (conf != null && !fixed) it.conf[fld] = conf; else delete it.conf[fld]; if (fixed) it.fix[fld] = true; else delete it.fix[fld]; it.docFrom = from || it.docFrom || 'upl'; }
function itemRemoveDoc(it){ Object.keys(it.src).filter(f => it.src[f] === 'doc').forEach(f => { const m = it.man[f]; if (m){ it.f[f] = m.v; it.src[f] = m.src || 'typed'; } else { delete it.f[f]; delete it.src[f]; } delete it.conf[f]; delete it.fix[f]; delete it.man[f]; }); it.docFrom = null; }
// An older total typed or read before the lists existed becomes the first item (same figures, same source)
function migrateLegacy(lk){ const D = LDEF[lk]; if (!D.tot || LI(lk).length) return; const any = Object.values(D.tot).some(k => S.src[k] && hasVal(S.fin[k])); if (!any) return;
  const it = newItem(lk); Object.entries(D.tot).forEach(([fld, k]) => { if (S.src[k] && hasVal(S.fin[k])){ it.f[fld] = +S.fin[k]; it.src[fld] = S.src[k] === 'doc' ? 'doc' : 'typed';
    if (S.src[k] === 'doc'){ if (S.conf[k] != null) it.conf[fld] = S.conf[k]; if (S.fix && S.fix[k]) it.fix[fld] = true; if (S.man && S.man[k]) it.man[fld] = S.man[k]; it.docFrom = (S.docOf || {})[k] || it.docFrom || 'upl:earlier'; } } });
  LI(lk).push(it); }
function syncLists(){ if (!S || !S.lists) return; S.dv = S.dv || {};
  ['cards','loans','mort2','pens'].forEach(lk => { const D = LDEF[lk], L = LI(lk), keys = Object.values(D.tot);
    if (!L.length){ if (S.dv[lk]){ keys.forEach(k => { delete S.fin[k]; delete S.src[k]; delete S.conf[k]; if (S.fix) delete S.fix[k]; }); S.dv[lk] = false; } return; }
    S.dv[lk] = true;
    const sum = fld => { let n = 0, any = false; const srcs = [], cf = []; L.forEach(it => { const v = it.f[fld]; if (hasVal(v) && !isNaN(+v)){ n += +v; any = true; srcs.push(it.src[fld] || 'typed'); if (it.src[fld] === 'doc' && it.conf[fld] != null) cf.push(it.conf[fld]); } }); return {n, any, srcs, cf, fix:L.some(it => it.src[fld] === 'doc' && it.fix[fld])}; };
    const put = (k, s, val) => { if (!s.any || val == null){ delete S.fin[k]; delete S.src[k]; delete S.conf[k]; if (S.fix) delete S.fix[k]; return; } S.fin[k] = val; const dc = s.srcs.every(x => x === 'doc'); S.src[k] = dc ? 'doc' : 'typed'; if (dc && s.cf.length === s.srcs.length) S.conf[k] = Math.min(...s.cf); else delete S.conf[k]; S.fix = S.fix || {}; if (dc && s.fix) S.fix[k] = true; else delete S.fix[k]; };
    if (lk === 'pens'){ const v = sum('value'), m = sum('monthly'), o = sum('own'); put(D.tot.value, v, v.n); put(D.tot.monthly, m, m.n);
      // own share: typed per pension; a blank one uses the share chosen in Your assumptions. Nothing typed at all: the share applies to the total.
      const withM = L.filter(it => hasVal(it.f.monthly) && +it.f.monthly > 0), typed = withM.filter(it => hasVal(it.f.own)), blank = withM.filter(it => !hasVal(it.f.own)); let own = null;
      if (typed.length && !blank.length) own = typed.reduce((s, it) => s + Math.min(+it.f.own, +it.f.monthly), 0); else if (typed.length) own = typed.reduce((s, it) => s + Math.min(+it.f.own, +it.f.monthly), 0) + blank.reduce((s, it) => s + +it.f.monthly * +asmV('ownShare'), 0);   // §27: the standard share applies to a blank one
      put(D.tot.own, o.any && own != null ? Object.assign({}, o, {any:true}) : {any:false}, own); return; }
    const o = sum('owed'), p = sum('pay'); put(D.tot.owed, o, o.n); put(D.tot.pay, p, p.n);
    const rated = L.filter(it => hasVal(it.f.rate) && +it.f.rate > 0); if (rated.length){ const w = rated.reduce((s, it) => s + (+it.f.owed > 0 ? +it.f.owed : 1), 0); S.fin[D.tot.rate] = +(rated.reduce((s, it) => s + +it.f.rate * (+it.f.owed > 0 ? +it.f.owed : 1), 0) / w).toFixed(4); S.src[D.tot.rate] = 'typed'; } else if (S.src[D.tot.rate] === 'typed' && S.dv[lk]){ delete S.fin[D.tot.rate]; delete S.src[D.tot.rate]; } });
}
function listDoc(k, v, conf, fixed, from){ const [lk, fld] = LISTKEY[k]; migrateLegacy(lk); const L = LI(lk);
  let it = L.find(x => x.docFrom === from) || L.find(x => !itemHasDoc(x) && !itemEmpty(x)) || L.find(x => !itemHasDoc(x)) || L[0];
  if (!it){ it = newItem(lk); it.fromDoc = true; L.push(it); }
  itemDoc(it, fld, v, conf, fixed, from); S.docOf = S.docOf || {}; S.docOf[k] = from; syncLists(); }
function listRemoveDoc(k){ const [lk] = LISTKEY[k], from = (S.docOf || {})[k]; LI(lk).forEach(it => { if (itemHasDoc(it) && (!from || it.docFrom === from)) itemRemoveDoc(it); });
  S.lists[lk] = LI(lk).filter(it => !(it.fromDoc && itemEmpty(it))); syncLists(); delete S.look[k]; delete S.ack[k]; ['fix', 'man', 'docOf'].forEach(x => { if (S[x]) delete S[x][k]; }); delete S.conf[k]; }
const coverTotal = t => S.fin[t] !== 'Yes' ? 0 : LI(t).reduce((s, it) => s + (hasVal(it.f.amount) ? +it.f.amount : t === 'workCover' && hasVal(it.f.mult) && finN('income') > 0 ? +it.f.mult * finN('income') : 0), 0);
// ---- screens ----
const capF = s => s.charAt(0).toUpperCase() + s.slice(1);
function itemTag(it, fld){ const s = it.src[fld]; return s === 'doc' ? '<span class="tag doc">✅ ' + (it.fix[fld] ? 'From your statement (corrected)' : 'From document' + (it.conf[fld] != null ? ' · ' + it.conf[fld] + '%' : '')) + '</span>' : s === 'typed' ? '<span class="tag typed">✏️ Your figure</span>' : ''; }
function itemNote(lk, it, fld){ const m = it.man[fld]; if (it.src[fld] !== 'doc' || !m || String(m.v) === String(it.f[fld])) return ''; const d = FFI[lk + '.' + fld], f = x => d.type === 'eur' ? eur(+x) : esc(String(x)); return 'You typed ' + f(m.v) + '. Your statement says ' + f(it.f[fld]) + '; we\'re using that.'; }
const itemId = (lk, it, fld) => 'i-' + lk + '-' + it.id + '-' + fld;
function itemField(lk, it, fld){ const key = lk + '.' + fld, d = FFI[key], id = itemId(lk, it, fld), v = it.f[fld]; if (fld === 'own' && S.fin.work === 'Not working') return '';
  const dat = 'data-it="' + lk + '|' + it.id + '|' + fld + '"', inp = d.type === 'text' ? '<input class="in" id="' + id + '" ' + dat + ' value="' + esc(v == null ? '' : v) + '" autocomplete="off"' + (d.hint ? ' aria-describedby="' + id + '-h"' : '') + '>'
    : '<div class="inw">' + (d.type === 'eur' ? '<span class="cur" aria-hidden="true">€</span>' : '') + '<input class="in' + (d.type === 'eur' ? ' eur' : d.type === 'pct' ? ' pct' : '') + '" id="' + id + '" ' + dat + ' inputmode="' + (d.type === 'pct' ? 'decimal' : 'numeric') + '" value="' + (v == null ? '' : d.type === 'pct' ? v : Math.round(+v)) + '"' + (d.hint ? ' aria-describedby="' + id + '-h"' : '') + '>' + (d.type === 'pct' ? '<span class="cur suf" aria-hidden="true">%</span>' : '') + '</div>';
  return '<div class="field"><label for="' + id + '">' + esc(d.l) + ' <span id="' + id + '-t">' + itemTag(it, fld) + '</span></label>' + inp + '<span class="small dnote" id="' + id + '-n" role="status" style="display:block;color:var(--acc-d)">' + itemNote(lk, it, fld) + '</span>' + (d.hint ? '<span class="small" id="' + id + '-h">' + esc(d.hint) + '</span>' : '') +
    (EXAMPLES[key] ? '<div class="fhelp"><button class="link" data-a="fex" data-p="' + key + '" aria-haspopup="dialog">Not sure? See an example</button></div>' : '') + '</div>'; }
function itemBlock(lk, it, n){ const D = LDEF[lk], title = lk === 'pens' && hasVal(it.f.name) ? it.f.name : capF(D.one) + ' ' + n, T = ITEMDOC[lk];
  const up = itemHasDoc(it) ? '<div class="mini" style="align-items:center"><span>✅ From <b>' + esc(T.title) + '</b></span><span class="row" style="gap:12px"><button class="link" data-a="iupl" data-p="' + lk + '|' + it.id + '">Replace statement</button><button class="link" data-a="irem" data-p="' + lk + '|' + it.id + '">Remove statement</button></span></div>'
    : '<button class="link" data-a="iupl" data-p="' + lk + '|' + it.id + '">📄 ' + esc(D.up) + '</button>';
  return '<div class="card" id="item-' + lk + '-' + it.id + '" style="box-shadow:none;border:1.5px solid #D5E0EA;margin-top:10px"><div class="row" style="justify-content:space-between"><b>' + esc(title) + '</b><button class="link" data-a="idel" data-p="' + lk + '|' + it.id + '" aria-label="Remove ' + esc(title) + '">Remove</button></div>' +
    D.f.map(f => itemField(lk, it, f)).join('') + up + '</div>'; }
function ensureItem(lk){ if (lk === 'mort2') return; S.lt = S.lt || {}; if (!LI(lk).length && !S.lt[lk]) LI(lk).push(newItem(lk)); }
function listBlock(lk){ migrateLegacy(lk); ensureItem(lk); const D = LDEF[lk], L = LI(lk);
  if (lk === 'mort2' && !L.length) return '<button class="btn ghost sm" style="width:100%;margin:0 0 12px" data-a="iadd" data-p="mort2">' + esc(D.add) + '</button>';
  const wo = lk === 'cards' ? workedNote('cardPayM') : lk === 'loans' ? workedNote('loanPayM') : '';
  return '<div class="card" data-list="' + lk + '"><b style="font-size:16px">' + D.em + ' ' + esc(D.t) + '</b>' + L.map((it, i) => itemBlock(lk, it, i + 1)).join('') + (wo ? '<span class="small" id="wo-' + (lk === 'cards' ? 'cardPayM' : 'loanPayM') + '" style="display:block;margin-top:8px;color:var(--sea-d)">' + esc(wo) + '</span>' : '') +
    '<button class="btn ghost sm" style="width:100%;margin-top:10px" data-a="iadd" data-p="' + lk + '">' + esc(D.add) + '</button></div>'; }
const PROT_HINT = {workCover:'How to find out: ask HR, or look in your employer benefits booklet. Death-in-service is usually a multiple of your salary. Enter what you know; leave the rest blank.'};
function policyBlock(t){ const f = S.fin[t]; if (!(f === 'Yes' || (t === 'workCover' && f === 'Not sure'))) return ''; let h = PROT_HINT[t] ? '<p class="small" style="margin:-4px 0 8px" id="ph-' + t + '">' + esc(PROT_HINT[t]) + '</p>' : '';
  if (f !== 'Yes') return h; ensureItem(t); const D = LDEF[t], L = LI(t);
  return h + '<div data-list="' + t + '" style="margin:0 0 14px">' + L.map((it, i) => itemBlock(t, it, i + 1)).join('') + '<button class="btn ghost sm" style="width:100%;margin-top:10px" data-a="iadd" data-p="' + t + '">' + esc(D.add) + '</button></div>'; }

// Example cards for the new per-item fields (same sample customers as above; §15)
const SAMPLE_RATES = {cardRate:0.20, loanRate:0.08};   // the rates Aoife and Cian chose in Your assumptions (also used by the sample)
const SAMPLE_MORT2 = {owed:185000, pay:950, years:18, rate:4.1};   // an imagined buy-to-let mortgage, for the example cards only (the sample customers don't have one)
Object.assign(EXAMPLES, {
  mortYN:{o:[['Yes', 'you owe money on the home you live in'], ['No', 'you own it outright, rent, or live with family']], t:() => 'Aoife and Cian are still paying off their home, so Aoife picks Yes.', w:'your mortgage statement, or your lender\'s app.'},
  mortRate:{t:() => 'Their mortgage statement shows ' + +(sf('mortRate') || 3.85) + '% APR. They enter ' + +(sf('mortRate') || 3.85) + '.', w:'the interest rate (APR) on your annual mortgage statement.'},
  'mort2.owed':{t:() => 'Imagine Aoife and Cian also rented out a flat with a mortgage of ' + eur(SAMPLE_MORT2.owed) + '. They would enter ' + eur(SAMPLE_MORT2.owed) + '.', w:'your annual mortgage statement or your lender\'s app for that property.'},
  'mort2.pay':{t:() => 'They would repay ' + eur(SAMPLE_MORT2.pay) + ' a month on the flat. They would enter ' + eur(SAMPLE_MORT2.pay) + '.', w:'that mortgage statement, or the direct debit on your bank statement.'},
  'mort2.years':{t:() => 'The flat\'s mortgage would have ' + SAMPLE_MORT2.years + ' years left. They would enter ' + SAMPLE_MORT2.years + '.', w:'the remaining term on that mortgage statement.'},
  'mort2.rate':{t:() => 'The flat\'s mortgage statement would show ' + SAMPLE_MORT2.rate + '% APR. They would enter ' + SAMPLE_MORT2.rate + '.', w:'the interest rate (APR) on that mortgage statement.'},
  'cards.owed':{t:() => 'Aoife and Cian owe ' + se('cardBal') + ' on their credit card. They enter ' + se('cardBal') + '.', w:'your latest credit-card statement or banking app.'},
  'cards.pay':{t:() => 'They pay ' + se('cardPayM') + ' a month off the card. They enter ' + se('cardPayM') + '.', w:'your card statement or banking app: what you actually pay.'},
  'cards.lender':{t:() => 'Their card statement names the lender: ' + ITEMDOC.cards.txt[0][1] + '. They enter ' + ITEMDOC.cards.txt[0][1] + '.', w:'the top of your credit-card statement.'},
  'cards.rate':{t:() => 'Their card statement shows ' + +(SAMPLE_RATES.cardRate * 100).toFixed(2) + '% APR. They enter ' + +(SAMPLE_RATES.cardRate * 100).toFixed(2) + '.', w:'the interest rate (APR) on your credit-card statement.'},
  'loans.owed':{t:() => 'Aoife and Cian owe ' + se('loanBal') + ' on a car loan. They enter ' + se('loanBal') + '.', w:'your loan statement, credit union app or Central Credit Register report.'},
  'loans.pay':{t:() => 'They repay ' + se('loanPayM') + ' a month on the car loan. They enter ' + se('loanPayM') + '.', w:'your loan agreement, or the payment on your bank statement.'},
  'loans.lender':{t:() => 'Their car loan is with ' + ITEMDOC.loans.txt[0][1] + '. They enter ' + ITEMDOC.loans.txt[0][1] + '.', w:'your loan agreement or statement.'},
  'loans.rate':{t:() => 'Their car loan charges ' + +(SAMPLE_RATES.loanRate * 100).toFixed(2) + '% APR. They enter ' + +(SAMPLE_RATES.loanRate * 100).toFixed(2) + '.', w:'the APR on your loan agreement.'},
  'pens.name':{t:() => 'Aoife has one pension, through her job. She enters Work pension.', w:'your annual pension benefit statement or the provider\'s app.'},
  'pens.value':{t:() => 'Aoife\'s pension statement shows ' + se('pension') + '. She enters ' + se('pension') + '.', w:'your annual pension benefit statement or the provider\'s app.'},
  'pens.monthly':{t:() => se('pensionM') + ' goes into Aoife\'s pension each month, including her employer\'s share. She enters ' + se('pensionM') + '.', w:'your payslip (your share) and annual benefit statement (your employer\'s).'},
  'pens.own':{t:() => 'Of the ' + se('pensionM') + ', Aoife pays ' + eur(sf('pensionM') * SAMPLE_OWN_SHARE) + ' herself. She enters ' + eur(sf('pensionM') * SAMPLE_OWN_SHARE) + '.', w:'the pension deduction on your payslip.'},
  'life.amount':{t:() => 'Aoife and Cian\'s life cover pays out ' + eur(SAMPLE_POL.life[0].amount) + '. They enter ' + eur(SAMPLE_POL.life[0].amount) + '.', w:'your policy schedule, or your insurer\'s online account.'},
  'life.term':{t:() => 'Their policy has ' + SAMPLE_POL.life[0].term + ' years to run, to match the mortgage. They enter ' + SAMPLE_POL.life[0].term + '.', w:'the end date on your policy schedule.'},
  'ip.amount':{t:() => 'Aoife has no income protection. With a policy paying ' + eur(ITEMDOC.ip.f[0][1]) + ' a month, she would enter ' + eur(ITEMDOC.ip.f[0][1]) + '.', w:'your policy schedule or your insurer\'s online account.'},
  'ip.term':{t:() => 'Aoife has no income protection. With a policy with ' + ITEMDOC.ip.f[1][1] + ' years to run, she would enter ' + ITEMDOC.ip.f[1][1] + '.', w:'the end date on your policy schedule.'},
  'ci.amount':{t:() => 'Aoife isn\'t sure she has serious illness cover. With a policy covering ' + eur(ITEMDOC.ci.f[0][1]) + ', she would enter ' + eur(ITEMDOC.ci.f[0][1]) + '.', w:'your policy schedule, or ask your insurer.'},
  'ci.term':{t:() => 'Aoife isn\'t sure she has serious illness cover. With a policy with ' + ITEMDOC.ci.f[1][1] + ' years to run, she would enter ' + ITEMDOC.ci.f[1][1] + '.', w:'the end date on your policy schedule.'},
  'workCover.amount':{t:() => 'Aoife\'s benefits booklet says her death-in-service is ' + SAMPLE_POL.workCover[0].mult + ' times her ' + se('income') + ' salary. She enters ' + eur(SAMPLE_POL.workCover[0].mult * sf('income')) + '.', w:'your employer benefits booklet, or ask HR.'},
  'workCover.mult':{t:() => 'Aoife\'s benefits booklet says death-in-service is ' + SAMPLE_POL.workCover[0].mult + ' times salary. She enters ' + SAMPLE_POL.workCover[0].mult + '.', w:'your employer benefits booklet, or ask HR.'},
  'health.amount':{t:() => 'Aoife and Cian\'s health insurance costs ' + eur(SAMPLE_POL.health[0].amount) + ' a year. They enter ' + eur(SAMPLE_POL.health[0].amount) + '.', w:'your health insurer\'s renewal letter or app.'}});
/* mocked document reader output */
const UPL = {
  income:{v:{work:['Employed',99], income:[58000,98], costsM:[3100,74], oneOffY:[1800,81]}, docs:['Payslip · Aug 2026','Current-account statement · Jun–Aug 2026']},
  assets:{v:{cash:[9000,97], invest:[6200,88]}, docs:['Savings statement · Sep 2026','Investment statement · Jun 2026']},
  liab:{v:{home:['Own with mortgage',99], mortBal:[203700,96], mortPayM:[1180,93], mortYears:[21,90], cardBal:[400,86], cardPayM:[40,80], loanBal:[3500,88], loanPayM:[100,84]}, hid:{mortRate:[3.85,94]}, docs:['Mortgage statement · Aug 2026','Credit-card statement · Sep 2026','Car loan statement · Aug 2026']},
  prot:{v:{life:['Yes',95], ip:['No',82], workCover:['Yes',90], health:['Yes',97]}, docs:['Life cover policy · 2021','Employer benefits statement · 2026']},
  pension:{v:{pension:[72000,95], pensionM:[520,91], pensionOwnM:[260,91]}, docs:['Pension statement · Jul 2025'], old:{pension:'Statement is over 12 months old'}}
};
const ADVISERS = [
  {n:'Niamh Byrne', ini:'NB', q:'QFA, CFP®', lang:'English, Irish', loc:'Dublin 2', mode:'Video or in person'},
  {n:'Ciarán Walsh', ini:'CW', q:'QFA, APA', lang:'English', loc:'Cork', mode:'Video'},
  {n:'Aisling Murphy', ini:'AM', q:'CFP®, QFA', lang:'English, Polish', loc:'Galway', mode:'Video or in person'}];
const EXPERT_FOR = {mortgage:'Mortgage expert', pension:'Pension & retirement expert', protection:'Protection expert', investment:'Investment expert', planner:'Financial planner'};
const SLOTS = (() => { const t = window.__TODAY ? new Date(window.__TODAY + 'T12:00:00') : new Date(), DN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], MN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];   // next working days, from two days ahead
  const times = [['10:00','18:00'], ['13:30'], ['09:00'], ['17:30'], ['12:00']], out = []; let d = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 2), k = 0;
  while (k < times.length){ if (d.getDay() % 6){ times[k].forEach(h => out.push(DN[d.getDay()] + ' ' + d.getDate() + ' ' + MN[d.getMonth()] + ' · ' + h)); k++; } d.setDate(d.getDate() + 1); } return out; })();
function slotPicker(b){ const days = [...new Set(SLOTS.map(x => x.split(' · ')[0]))], ds = S.book.day || (b.slot ? b.slot.split(' · ')[0] : days[0]);   // layout v9: day strip + time chips
  return '<div class="sec"><h3>Choose a day</h3></div><div class="dstrip" role="group" aria-label="Day">' + days.map(d => { const [w, n, m] = d.split(' '); return '<button class="dday' + (d === ds ? ' on' : '') + '" aria-pressed="' + (d === ds) + '" data-a="bday" data-p="' + d + '"><span>' + w + '</span><b>' + n + '</b><small>' + m + '</small>' + (b.slot && b.slot.startsWith(d + ' ·') ? '<i aria-hidden="true"></i>' : '') + '</button>'; }).join('') + '</div>' +
    '<div class="sec"><h3>Choose a time</h3></div><div class="chips" role="group" aria-label="Time">' + SLOTS.filter(x => x.startsWith(ds + ' ·')).map(x => '<button class="chip' + (b.slot === x ? ' sel' : '') + '" aria-pressed="' + (b.slot === x) + '" data-a="slot" data-p="' + x + '">' + x.split(' · ')[1] + '</button>').join('') + '</div>'; }
const ESG_Q = "I'd like sustainable / ethical options";   // §13: sustainability preference is captured here (MiFID II), not as a profile question
const ADV_QS = ['Can I retire earlier?','Am I saving enough?','How do I protect my family?','Should I clear my mortgage early?','What about my pension?', ESG_Q];

/* ================= STATE ================= */
let S = null;
function fresh(){
  return {scr:'D0', app:false, tab:'plan', planSeg:'main', planGo:null, planEdit:false, me:'home', exp:'home', entry:'direct',
    why:[], whyNote:'', di:0, ans:{}, about:{age:null, partner:null, deps:null, married:null}, goals:[], gid:1, retireAge:66, retireSet:false, asm:{}, saved:{}, rank:null, lists:{},
    save:{email:'', comms:false, done:false, asked:false}, tlOpen:{}, tlHl:null,
    acct:{name:'', email:'', mobile:'', c1:false, c2:false, ev:false, sv:false, pk:false},
    fin:{}, src:{}, conf:{}, look:{}, ack:{}, man:{}, fix:{}, docOf:{}, calcT:{}, calcDoc:{}, fsec:null, fmode:{}, upl:null, checked:false, from:null,
    um:{a:{}, chips:[], done:{}, sec:null}, wi:{g:null, m:0, l:0}, pref:null, versions:[], understood:false, advQs:[],
    view:'journey', chapOpen:null, infl:null, inflOther:false, inflEdit:false, pst:null, pdocs:{}, calcSrc:{}, after:null, saveM:null, saveNote:'', shell:false, pb:false, xs:[], calcV:{}, play:false, vf:'all', assume:'standard',
    book:{stage:null, adv:0, share:{report:false, fin:false, docs:false, um:false}, agree:false, mode:'Video', slot:null, done:false, from:'plan'},
    partner:{mode:null, email:'', sent:false, name:''}, ask:{open:null, q:'', a:null}, meEdit:{},
    sheet:null, toast:null};
}

/* ================= HELPERS ================= */
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const eur = n => (n < 0 ? '−€' : '€') + Math.round(Math.abs(n)).toLocaleString('en-IE');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const RM = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
const val = f => typeof f === 'function' ? f() : f;
function dsc(id){ const k = S.ans[id]; return typeof k === 'number' ? DQ_BY(id).o[k].s : null; }

/* ================= PROFILE / SCORING ================= */
/* Money personality: Financial Planner review round 1 §1 (docs/fp-review-round1.md), pasted as tested */
// Personality weights per option, in option order. 0.5 steps. Q6 (amount), u9-u12 and u14 carry no personality weight.
const PW = {
  '2':  [{A:2}, {B:2}, {E:2}, {C:2}],                       // Sticking to a budget · Checking your balance · Trying something new · Relaxed about money
  '4':  [{E:1}, {A:1}, {B:1}, {B:.5, C:.5}],                // Buy in quickly · Research it · Ask an expert · Stay away
  '7':  [{A:.5}, {}, {}, {C:.5}],                           // Emergency savings · Other savings · Credit/loan · Not sure
  '8':  [{B:.5, C:.5}, {A:.5, B:.5}, {A:.5, E:.5}, {E:1}],  // Motorway · Quiet country road · Boreens · Healy Pass
  '9':  [{B:1}, {B:.5}, {A:.5, C:.5}, {E:1}],               // Sell · Wait until back, then sell · Stay calm · Buy more
  '12': [{B:1}, {E:.5}, {A:1}, {C:1}],                      // Worried · Hopeful · Confident · Avoid thinking about it
  u4:   [{A:.5, E:.5}, {A:.5, B:.5}, {B:1}, {C:1}]          // §13: Self-directed · Validator · Delegator · Procrastination (same order and weights)
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
function umS(u){ const q = UM.flatMap(s => s.qs).find(x => x.u === u), k = S.um.a[u]; return typeof k === 'number' && q.o[k].s != null ? q.o[k].s : null; }
/* Horizon suggestion + risk profile: FP review round 1 §2 (R1–R10, R13), pasted as tested */
function suggestU9(){
  const a0 = S.about.age, yrs = g => g.age - a0;
  const pot = S.goals.filter(g => g.kind === 'pot' && yrs(g) > 2).sort((a, b) => a.age - b.age)[0];
  const g = pot || S.goals.filter(x => x.kind !== 'retire' && yrs(x) > 2 && !(x.saved > 0)).sort((a, b) => a.age - b.age)[0];
  const y = g ? yrs(g) : (S.retireAge - a0 + 10);           // pension money is used over decades after retiring
  return y <= 2 ? 0 : y <= 5 ? 1 : y <= 10 ? 2 : 3;
}
const RISK_LBL = ['Cautious', 'Cautious–balanced', 'Balanced', 'Balanced–growth', 'Growth'];
const COMFORT = ['Steady', 'Mostly steady', 'Balanced', 'Adventurous'];   // D10 tile: Q8 appetite only, deliberately not the 5 profile labels
const MIS = {
  K16:  'An emergency fund often comes first, along with the right cover. It is a good place to start with an adviser.',
  K14c: "You're open to ups and downs, but your emergency fund is thin. Many people build an emergency fund before taking more risk.",
  K14l: "You're open to ups and downs, but a fall would hit everyday life right now. Many people build an emergency fund before taking more risk.",
  K14t: "You're open to ups and downs, but you'll need this money within 5 years. Money needed soon has less time to recover from a fall.",
  K13:  'You like the idea of growth, but falls may unsettle you. A calmer approach might feel more comfortable. Worth talking through with an adviser.',
  K15:  "Your finances could handle more ups and downs than you'd choose. That's fine. It's worth seeing what playing very safe can cost as prices rise.",
  K17:  "You're comfortable with ups and downs, you can afford them and you have time. A good basis for a growth conversation with an adviser.",
  OK:   'How you feel about risk and what you can afford are broadly in line. A good starting point.'
};
const MIS_ADV = {   // adviser-only (xlsx column M). Never shown to the customer.
  K13: 'Route to a calmer plan than they picked; flag for a call if markets fall.',
  K14c: 'Build the emergency fund first; explain why risk waits, not that they are wrong.', K14l: 'Build the emergency fund first; explain why risk waits, not that they are wrong.', K14t: 'Short horizon: explain why risk waits.',
  K15: 'Respect the preference; gently show what over-caution costs over time.',
  K16: 'Protection and emergency fund first; investing conversation comes later.',
  K17: 'Ready for a growth conversation; route to the investment expert.'
};
function riskRead(full){
  const q6 = dsc('6'), q7 = dsc('7'), q8 = dsc('8'), q9 = dsc('9');
  const ix = u => typeof S.um.a[u] === 'number' ? S.um.a[u] : null;           // option index, not score
  const u9 = ix('u9') != null ? ix('u9') : suggestU9(), u10 = ix('u10'), u11 = ix('u11'), u12 = ix('u12');
  const r = {comfort: q8 ? COMFORT[q8 - 1] : null, cushion: (() => { const c = cushionM(); return c.fig ? c.level : q7 == null ? null : c.level; })(),
             want:null, can:null, time:null, level:null, label:null, limit:null, provisional:!full, mis:null, misKey:null, adv:null, keNote:false};
  if (q8 == null || q9 == null) return r;                                   // no made-up profile
  // 1. Willingness (attitude to risk): appetite (Q8), composure (Q9) pulls it down one or more steps (xlsx K13)
  let T = q8 + (q9 === 4 && q8 >= 3 ? 1 : 0);
  T = Math.min(T, q9 === 1 ? 2 : q9 === 2 ? 3 : 5);
  // 2. Capacity for loss: weakest link wins
  let C = 5; const cap = v => { C = Math.min(C, v); };
  const cuF = cushionM();
  if (!cuF.fig){ if (q7 === 2) cap(3); if (q7 === 1) cap(2); }               // other savings / credit or not sure (the answer, until figures are given)
  const u14 = ix('u14');
  if (full){ if (u10 === 0) cap(2); if (u10 === 1) cap(3); if (u10 === 2) cap(4); if (u12 === 0) cap(2); if (u12 === 1) cap(4); if (u14 === 0) cap(2); if (u14 === 1) cap(3); }   // §13: u10 low/limited/moderate → 2/3/4; u14 like Q7
  if (cuF.fig){ if (cuF.m < 1) cap(2); else if (cuF.m < 3) cap(3); }        // v3.0: months of essential spending in cash (the one cushion figure)
  // 3. Time horizon cap
  const H = [1, 2, 4, 5][u9];
  // 4. Knowledge & experience cap (provisional read is held at Balanced until u10 + u11 are answered)
  let KE = !full || u11 == null ? 3 : [3, 4, 5, (S.um.chips || []).includes('Shares or funds') ? 5 : 4][u11];   // FP round 2: self-rated expert = 4 unless they have held shares or funds
  const ch = S.um.chips || [];                                              // ESMA: don't rely on self-assessment alone
  if (full && u11 >= 2 && ch.length && ch.every(c => c === 'None' || c === 'Savings account')) KE = Math.min(KE, 4);
  const L = Math.min(T, C, H, KE);
  r.want = T; r.can = C; r.time = H; r.level = L; r.label = RISK_LBL[L - 1];
  r.limit = L === T ? 'want' : L === C ? 'can' : L === H ? 'time' : 'experience';
  r.keNote = full && L === KE && KE < Math.min(T, C, H);
  // Mismatch (xlsx K13–K17), one line, safety first
  const wantHi = q8 >= 3, wantLo = q8 <= 2, compHi = q9 >= 3, compLo = q9 <= 2, thin = cushionM().fig ? cushionM().level !== 'In place' : ((q7 != null && q7 <= 2) || (full && u14 != null && u14 <= 1));   // FP round 2: u14 under 3 months = thin (message only)
  const shortT = full && H <= 2, lossLo = full && C <= 2;
  const capLo = thin || lossLo || shortT, capHi = full ? (C >= 4 && H >= 4) : (q7 === 4 && q6 != null && q6 >= 3);
  const k = wantLo && compLo && capLo ? 'K16'
    : wantHi && capLo ? (thin ? 'K14c' : lossLo ? 'K14l' : 'K14t')
    : wantHi && compLo ? 'K13'
    : wantLo && capHi ? 'K15'
    : full && wantHi && compHi && capHi && u11 != null && u11 >= 1 && u11 !== 3 ? 'K17' : 'OK';   // FP round 2: a self-rated expert never gets K17
  r.misKey = k; r.mis = MIS[k]; r.adv = MIS_ADV[k] || null;
  if (k === 'K14c'){ const c = cushionM(), q = S.ans['7'];   // v3.0: say why, and what to do, in the customer's own terms
    const why = c.fig ? 'your emergency fund covers ' + c.m + ' of ' + c.T + ' months of essential spending' : q === 2 ? 'a €1,000 surprise would go on a card or a loan' : q === 1 ? 'a surprise would come out of money saved for your goals' : q === 3 ? 'you haven\'t set up an emergency fund yet' : 'your emergency fund is thin';
    r.mis = 'You\'re open to ups and downs, but ' + why + '. Build ' + c.T + ' months of essential spending first' + (c.fig && c.need > 0 ? ' (about ' + eur(c.need) + ' more for you)' : '') + '. Many people do this before taking more risk.'; }
  { const c = cushionM(); if (c.fig && c.ans && (c.ans === 'In place') !== (c.level === 'In place')) r.cushionNote = c.level === 'In place' ? 'You said a surprise would be hard to cover, but your cash already covers ' + c.m + ' months. You\'re better covered than you think.' : 'You said you have money for surprises, but on your figures it covers ' + c.m + ' of ' + c.T + ' months.'; }
  return r;
}
const RISK_SETBY = {want:'how much risk you want to take', can:'how much you can afford to lose', time:'how long you can wait', experience:'your investing experience'};
const KE_NOTE = 'Investing is new to you, so this stays at Balanced for now. An adviser can explain how investments rise and fall.';
// Customer-facing risk label: "Not answered yet" when Q8/Q9 are missing; "First read" (never above Balanced) until Understand Me is done
const riskLabelText = r => r.label == null ? 'Not answered yet' : r.label + (r.provisional ? ' (first read)' : '');
const discCount = () => DISC6.filter(q => typeof S.ans[q.id] === 'number').length;
const discEnough = () => discCount() >= 4;   // §12: 6 Discover questions; personality() needs 4 of the 6 weighted ones
function umCount(){ let n = 0; UM.forEach(s => s.qs.forEach(q => { if (q.d ? typeof S.ans[q.d] === 'number' : typeof S.um.a[q.u] === 'number') n++; })); return n; }

/* ================= GOALS ================= */
function mkGoal(k, custom){
  const c = GC(k), a0 = S.about.age;
  const g = {id:S.gid++, k, name:custom ? custom[1] : c.t, e:custom ? custom[0] : c.e, kind:c.kind, spec:c.spec, amount:custom ? custom[2] : c.amt, saved:0, who:'Me', prio:'Must have', flex:'Can move'};
  if (c.kind === 'retire') g.age = S.retireAge;
  else if (c.kind === 'legacy'){ applyAssume(); g.age = AS.end; }   // FP round 4 F9: tested and shown at the end of the plan (90)
  else g.age = Math.min(89, a0 + (custom ? custom[3] : c.yrs));
  if (k === 'edu' && S.about.deps > 1) g.amount = c.amt * Math.min(3, S.about.deps);
  if (k === 'safety'){ applyAssume(); g.auto = true; syncSafety(g); }   // B16 + §15: months × the customer's own essential spending; until their costs are in, the goal keeps its own target   // B16: one emergency fund setting everywhere
  return g;
}
const retireGoal = () => S.goals.find(g => g.kind === 'retire');
// An emergency fund goal the customer hasn't edited follows their essential spending once their costs are known (never an invented figure)
// §19.7: the months the customer sets in the Emergency fund goal or in the Emergency fund calculator ARE the plan-wide setting (Your assumptions, step 7)
function setSafetyMonths(n){ n = clamp(Math.round(+n), 1, 12); S.asm = Object.assign({}, S.asm, {safetyMonths:n}); applyAssume(); syncSafety(); return n; }
function calcSync(cid, k, v){ if (cid === 'emergency' && k === 'mt' && v != null && isFinite(+v)) setSafetyMonths(v); }
/* v3.0: emergency fund first. With cash and living costs given and cash below the target months, an Emergency fund goal is added (ranked first,
   amount = target months x essential spending, existing cash counts towards it). If the customer removes it, it is not added again. */
function autoSafety(){ if (!S || !S.app || S.safetyOff || !S.src || !Array.isArray(S.goals) || S.goals.some(g => g.k === 'safety')) return;
  const F = finNums(), e = S.src.costsM ? essM(F) : 0;
  if (!S.safetyWanted && (!S.src.cash || !(e > 0) || F.cash >= SAVE.buffer * e - 0.5)) return;   // added automatically only when cash is below the target; or because the customer asked
  const g = mkGoal('safety'); g.auto = true; g.autoAdded = !S.safetyWanted; if (e > 0) g.amount = Math.round(e * SAVE.buffer); S.goals.push(g); }
function syncSafety(only){ if (!S || !S.src || !S.src.costsM) return; (only ? [only] : S.goals.filter(g => g.k === 'safety' && g.auto)).forEach(g => { applyAssume(); g.amount = Math.round(essM(finNums()) * SAVE.buffer); }); }   // M7: exactly months x essential spending (no rounding to €1,000), so the amount and the months always agree
const safeNote = g => { const e = essM(finNums()); if (!(e > 0) || !(g.amount > 0)) return ''; const m = Math.round(g.amount / e * 10) / 10; return '<span class="small" style="display:block" id="sf-note-' + g.id + '">' + (g.autoAdded ? 'Added because your cash covers ' + cushionM().m + ' of ' + SAVE.buffer + ' months. An emergency fund comes before other goals. You can remove it. ' : '') + eur(g.amount) + ' is about ' + m + (m === 1 ? ' month' : ' months') + ' of your essential spending (' + eur(e) + ' a month).</span>'; };
function setRetireAge(a){ S.retireAge = a; S.retireSet = true; const r = retireGoal(); if (r) r.age = a; S.fin.retireAge = a; S.src.retireAge = S.src.retireAge || 'pre'; }

/* ================= CASHFLOW ENGINE (adapted from LifeGoals 2.0 project(), with fixes) ================= */
/* FP round 7: statutory values come from RULES_IE_2026 (RI); judgement values from the customer's assumptions (asmV, "Your assumptions"). */
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
const ASM_GRP = [['prices', 'Prices & growth'], ['retire', 'Retirement'], ['safety', 'Emergency fund & debt'], ['length', 'Plan length']];
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
  accessAge:{g:'retire', b:'B20', ty:3, n:'pension access age', l:'Earliest age you can draw your pension', t:'choice', o:[[60, 'From 60 (most pensions)'], [50, 'From 50 (some occupational schemes)']], sug:() => SV('accessAge'), get by(){ return STB.accessAge.by; }, need:() => false, get help(){ return SG('accessAge'); }},
  drawRule:{g:'retire', b:'B20', ty:3, n:'how you draw your pension', l:'How you draw your pension', t:'choice', o:[['spread', 'Spread to plan end'], ['min', 'Minimum only (4% / 5%)'], ['fixed', 'Fixed amount']], sug:() => SV('drawRule'), get by(){ return SB('drawRule'); }, need:() => true, help:'Set by law: ' + LAW.arf + ' from an ARF.'},
  ddTiming:{g:'retire', b:'B20', ty:3, n:'withdrawal timing', l:'Drawdown tools: withdrawals taken at the', t:'choice', o:[['start', 'Start of the year'], ['end', 'End of the year']], sug:() => SV('ddTiming'), get by(){ return SB('ddTiming'); }, need:() => false, help:''},
  drawFixed:{g:'retire', b:'B20', ty:3, own:true, n:'fixed yearly amount', l:'Fixed amount a year (today\'s money), if you chose "Fixed amount"', t:'eur', min:0, max:200000, step:500, fb:() => 20000, need:() => asmGet('drawRule') === 'fixed', help:'Never less than the legal minimum once you are 61.'},
  safetyMonths:{g:'safety', b:'B16', ty:3, n:'emergency fund months', l:'Emergency fund: months of essential spending', t:'num', min:1, max:12, step:1, sug:() => twoSecure() ? ST.safetyMonthsTwo : ST.safetyMonths, get by(){ return STB.safetyMonths.by; }, need:() => true, get help(){ return SG('safetyMonths'); }},
  mortRate:{g:'safety', b:'B13', ty:2, n:'mortgage rate', l:'Your mortgage rate (if your statement doesn\'t say)', t:'pct', min:1, max:8, step:0.05, mk:'mortRate', fb:() => 0.0375,
    need:() => (S.fin.home === 'Own with mortgage' && finN('mortBal') > 0 && !(finN('mortRate') > 0)) || mort2NeedsRate(), get help(){ return SG('mortRate'); }},
  cardRate:{g:'safety', b:'B14', ty:2, n:'credit-card rate', l:'Your credit-card rate, APR (if your statement doesn\'t say)', t:'pct', min:0, max:35, step:0.5, mk:'cardRate', fb:() => 0.20,
    need:() => finN('cardBal') > 0 && !(finN('cardRate') > 0), help:'Your card statement shows your APR. New credit cards can\'t charge more than ' + pcs(GD.cardCap) + ' APR (' + GDB.cardCap.by + '); some older cards are higher.'},
  loanRate:{g:'safety', b:'B15', ty:2, n:'loan rate', l:'Your other loans rate, APR (if your statement doesn\'t say)', t:'pct', min:0, max:25, step:0.25, mk:'loanRate', fb:() => 0.08,
    need:() => finN('loanBal') + finN('debt') > 0 && !(finN('loanRate') > 0), get help(){ return SG('loanRate'); }},
  cashYears:{g:'safety', b:'B21', ty:3, n:'years kept as cash', l:'Money for goals sooner than this is kept as cash (years)', t:'yrs', min:1, max:10, step:1, sug:() => ST.cashYears, get by(){ return STB.cashYears.by; }, need:() => true, get help(){ return SG('cashYears'); }},
  investShare:{g:'safety', b:'B21', ty:3, n:'share of spare savings invested', l:'Spare savings: share invested (the rest stays in cash)', t:'pct', min:0, max:100, step:5, sug:() => ST.investShare, get by(){ return STB.investShare.by; }, need:() => true, get help(){ return SG('investShare'); }},
  cgtGain:{g:'safety', b:'B28', ty:3, n:'gain share when assets are sold', l:'Other assets, crypto, gold or art: share of their value that is a gain (for capital gains tax when sold)', t:'pct', min:0, max:100, step:5, sug:() => ST.cgtGain, get by(){ return STB.cgtGain.by; }, need:() => false, get help(){ return SG('cgtGain'); }},
  saveShare:{g:'safety', b:'B22', ty:3, n:'share of spare money saved', l:'Share of your spare money you save, at most', t:'pct', min:0, max:100, step:5, sug:() => ST.saveShare, get by(){ return STB.saveShare.by; }, need:() => S.saveM == null, get help(){ return SG('saveShare'); }},
  noAnswer:{g:'safety', b:'B22', ty:3, n:'monthly saving', l:'Monthly saving if you haven\'t told us how much you could invest', t:'eur', min:0, max:5000, step:25, sug:() => ST.noAnswer, get by(){ return STB.noAnswer.by; }, need:() => S.saveM == null && typeof S.ans['6'] !== 'number', get help(){ return SG('noAnswer'); }},
  lifeShare:{g:'safety', b:'B24', ty:3, n:'share of income your family would need', l:'Life cover: share of your income your family would need', t:'pct', min:30, max:100, step:5, sug:() => ST.lifeShare, get by(){ return STB.lifeShare.by; }, need:() => false, get help(){ return SG('lifeShare'); }},
  lifeYears:{g:'safety', b:'B24', ty:3, n:'years of support', l:'Life cover: years your family would need support', t:'yrs', min:1, max:30, step:1, sug:() => ST.lifeYears, get by(){ return STB.lifeYears.by; }, need:() => false, get help(){ return SG('lifeYears'); }},
  survivor:{g:'safety', b:'B24', ty:2, n:'survivor\'s pension', l:'Life cover: State survivor\'s pension a week', t:'eurw', min:0, max:400, step:0.5, rng:() => [0, RI.sp.survivor66], by:'DSP 2026: ' + eurW(RI.sp.survivor) + ' under 66, ' + eurW(RI.sp.survivor66) + ' at 66+, nothing if not eligible', fb:() => RI.sp.survivor, need:() => false, help:'Cohabiting partners can now qualify (Bereaved Partner\'s Pension).'},
  budgetNeeds:{g:'safety', b:'B27', ty:3, n:'budget split', l:'Budget split: needs', t:'pct', min:0, max:100, step:5, sug:() => ST.budget[0], get by(){ return STB.budget.by; }, need:() => false, get help(){ return SG('budgetNeeds'); }},
  budgetWants:{g:'safety', b:'B27', ty:3, n:'budget split', l:'Budget split: wants', t:'pct', min:0, max:100, step:5, sug:() => ST.budget[1], get by(){ return STB.budget.by; }, need:() => false, get help(){ return SG('budgetWants'); }},
  budgetSave:{g:'safety', b:'B27', ty:3, n:'budget split', l:'Budget split: savings and debt', t:'pct', min:0, max:100, step:5, sug:() => ST.budget[2], get by(){ return STB.budget.by; }, need:() => false, get help(){ return SG('budgetSave'); }},
  planEnd:{g:'length', b:'B12', ty:3, own:true, n:'plan-until age', l:'Plan until age (life expectancy)', t:'age', min:50, max:100, step:1, fb:() => S && S.about.partner ? 95 : 90, need:() => true,   // internal fallback only, never shown (planMissing gates results)
    help:'At 65, average life expectancy in Ireland is about ' + GD.lifeMen65 + ' for men and ' + GD.lifeWomen65 + ' for women (' + GDB.lifeMen65.by + '). Choose the age you want to plan to.'},
  startYear:{g:'length', b:'B23', ty:3, n:'plan start year', l:'Start the plan in', t:'choice', o:[[2026, '2026'], [2027, '2027']], sug:() => (new Date() > new Date('2026-09-30T23:59:59') ? 2027 : 2026), by:'from October most of this year has passed', need:() => true, help:'Choose 2027 to use the Budget 2027 tax rules (announced 6 October 2026) from 1 January 2027: higher tax bands and credits, a wider 2% USC band, a €10 higher State Pension and exit tax at 35%. The Finance Bill may still change some details.'}
};
// §27.3: no hard limit; a calm one-line note, never a block
const retNote = a => a < 50 ? 'Retiring before 50 is possible. Pensions can usually be drawn from 60 (some schemes from 50) and the State Pension from ' + RI.sp.age + ', so until then your plan uses savings and other income. Your results will show any gap honestly.'
  : a < +asmV('accessAge') || a < 60 ? 'Pensions can usually be drawn from 60 (some schemes from 50) and the State Pension from ' + RI.sp.age + ', so until then your plan uses savings and other income. Your results will show any gap honestly.' : '';
const pRetNote = a => a < 50 ? 'Their pay stops at this age. Until their State Pension at ' + RI.sp.age + ' your plan uses savings and other income, and the results will show any gap honestly.' : a < 60 ? 'Their pay stops at this age. Their own pension is not modelled, so until their State Pension at ' + RI.sp.age + ' your plan relies on savings and other income. Your results will show any gap honestly.' : '';
const RETIRE_HELP = 'You can usually draw a pension from ' + RI.pen.earliestAge + ' (' + GDB.schemeEarliest.by + ' from ' + GD.schemeEarliest + '); State Pension is paid from ' + RI.sp.age + '.';
const asmGet = k => S && S.asm && S.asm[k] != null && S.asm[k] !== '' ? S.asm[k] : null;
// engine value: the customer's choice; otherwise an internal fallback that is never shown as a result (planMissing() gates every result)
const asmV = k => { const x = asmGet(k), d = ASM[k], set = curSet(); return x != null ? x : k in set ? set[k] : d.sug ? d.sug() : d.mk && d.ty === 2 && mkSug(d) ? mkSug(d).v : d.fb ? d.fb() : null; };   // §27.5: an unchosen market rate uses the published suggestion (e.g. CBI average), else a planning figure   // growth rates follow the chosen set (Standard / Cautious)
const asmMine = k => asmGet(k) != null;
const ASM_KEYS = () => Object.keys(ASM);
const asmStd = k => ASM[k].ty === 3 && !ASM[k].own && ASM[k].sug;   // has a "Use the standard (X)" chip and is part of "use all"
// Everything the plan needs that the customer hasn't chosen yet, in the order we ask: inflation, retirement age, plan-until age, the rest.
function planMissing(){ if (!S) return []; const out = [];   // §27.4: only these four block results; everything else has a labelled default and never blocks
  if (!S.retireSet) out.push({k:'retireAge', n:'retirement age', t:'Retirement age', ty:3, own:true});
  if (!asmMine('planEnd')) out.push({k:'planEnd', n:ASM.planEnd.n, t:'Plan until age', ty:3, own:true});
  if (!inflSet()) out.push({k:'infl', n:'inflation rate', t:'Inflation', ty:3});
  if (pInc() && !S.pRetSet) out.push({k:'pRetireAge', n:'partner\'s retirement age', t:'Partner\'s retirement age', ty:3, own:true});   // M2: never defaulted
  return out; }
const planReady = () => !planMissing().length;
const chooseTxt = m => (m.add ? 'Add ' : 'Choose ') + (/^the /.test(m.n) ? m.n : 'your ' + m.n) + ' to see this';
// "Use the standard for all of these": every type-3 item not chosen yet, incl. inflation. Never retirement age or plan-until age; never type 2.
function useAllStd(keepInfl){ S.asm = Object.assign({}, S.asm); let n = 0; ASM_KEYS().filter(k => asmStd(k) && !asmMine(k)).forEach(k => { S.asm[k] = ASM[k].sug(); n++; });
  if (!keepInfl && !inflSet()){ S.infl = ST.infl; S.inflOther = false; n++; } applyAssume(); return n; }   // keepInfl: step 7 (§22), where inflation is one of the 3 choices only the customer makes
const pInc = () => !!(S && S.about && S.about.partner && finN('pIncome') > 0);   // a partner whose income is counted
const reqKeys = () => ['retireAge', 'planEnd', 'infl'].concat(pInc() ? ['pRetireAge'] : []);   // §22 (+M2): the only choices that block results; the partner's retirement age only when their income is counted
const req3Missing = () => planMissing().filter(m => reqKeys().includes(m.k));
/* ================= DATE OF BIRTH (journey-spec §29) =================
   S.about.dob / S.about.pdob = {d, m, y}. Years are calendar years: the engine age (S.about.age) is the age the customer reaches in the first plan year
   (YEAR0 - birth year); "age today" is exact from the date. A customer without a date of birth (older saved states, tests) keeps the age that was typed. */
const MONTHS_L = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dobToday = () => { const t = window.__TODAY ? new Date(window.__TODAY + 'T12:00:00') : new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); };   // tests may set window.__TODAY = 'YYYY-MM-DD'
const isLeapY = y => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const bdayIn = (d, y) => (+d.m === 2 && +d.d === 29 && !isLeapY(y)) ? new Date(y, 2, 1) : new Date(y, +d.m - 1, +d.d);   // born 29 Feb: the birthday is 1 March in other years
const dobValid = d => { if (!d) return false; const y = +d.y, m = +d.m, dd = +d.d; if (![y, m, dd].every(Number.isInteger) || String(d.y).length !== 4 || y < 1900 || m < 1 || m > 12 || dd < 1 || dd > 31) return false; const t = new Date(y, m - 1, dd); return t.getFullYear() === y && t.getMonth() === m - 1 && t.getDate() === dd && t <= dobToday(); };
const ageOnDate = (d, date) => date.getFullYear() - +d.y - (date < bdayIn(d, date.getFullYear()) ? 1 : 0);
const ageTodayOf = d => ageOnDate(d, dobToday());
const nextBirthday = d => { const t = dobToday(); let b = bdayIn(d, t.getFullYear()); if (b <= t) b = bdayIn(d, t.getFullYear() + 1); return b; };
const dateLong = dt => dt.getDate() + ' ' + MONTHS_L[dt.getMonth()] + ' ' + dt.getFullYear();
const dobFilled = d => !!d && String(d.d || '') !== '' && String(d.m || '') !== '' && String(d.y || '') !== '';
// who: 'you' (18 to 80 today) or 'partner' (18 to 85 today). Returns {ok, text, ageToday}
function dobCheck(d, who){ const lim = who === 'you' ? 80 : 85, nm = who === 'you' ? S.acct.name : S.partner && S.partner.name;
  if (!dobFilled(d)) return {ok:false, text:'', ageToday:null};
  if (!dobValid(d)) return {ok:false, text:'That doesn\'t look like a real date. Check the day, month and year.', ageToday:null};
  const a = ageTodayOf(d); if (a < 18) return {ok:false, text:'LifeMap is for people aged 18 or over.', ageToday:a}; if (a > lim) return {ok:false, text:'LifeMap plans for people up to age ' + lim + ' today. An expert can help beyond that.', ageToday:a};
  const nb = nextBirthday(d), you = who === 'you';
  return {ok:true, ageToday:a, text:'✓ ' + (you ? '' : (nm ? nm + ' is ' : '')) + a + ' today' + (you && +asmV('startYear') > dobToday().getFullYear() ? ' · your plan starts Jan ' + asmV('startYear') : ' · turns ' + (a + 1) + ' on ' + dateLong(nb))}; }   // v18: one short line (was two sentences)
function syncAges(){ if (!S || !S.about) return; const b = S.about, y0 = +asmV('startYear');
  if (b.dob){ if (b._dobAge != null && b.age !== b._dobAge && b.age != null){ delete b.dob; delete b._dobAge; }   // someone set the age directly (a test, an old flow): that wins, as before
    else { const c = dobCheck(b.dob, 'you'); b.age = c.ok ? y0 - +b.dob.y : null; b._dobAge = b.age; b.ageToday = c.ok ? c.ageToday : null; S.fin.age = b.age == null ? undefined : b.age; if (b.age != null) S.src.age = S.src.age || 'pre'; } }
  if (!b.dob) b.ageToday = b.age;
  if (b.pdob){ const c = dobCheck(b.pdob, 'partner'); if (c.ok){ S.fin.pAge = y0 - +b.pdob.y; S.src.pAge = 'typed'; } else { delete S.fin.pAge; delete S.src.pAge; } } }
function applyAssume(){ syncAges(); setRulesYear(+asmV('startYear')); Object.assign(AS, curSet()); AS.infl = S && S.infl != null ? S.infl : SV('infl');   // inflation is the client's own choice (S.infl); SV('infl') is only an internal fallback before they choose
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
function lumpSum(potNom, pct){ const P = RI.pen, ls = potNom * Math.min(pct, P.lsMaxPct), tax = P.lsBandRate * Math.max(0, Math.min(ls, P.lsCap) - P.lsTaxFree) + RI.it.r2 * Math.max(0, ls - P.lsCap); return {gross:ls, tax, net:ls - tax}; }   // audit F3: no cap; the part above the €500,000 band is taxed at the higher rate (a lump sum that size is above the standard-rate band; USC and PRSI do not apply to it). Verify on Revenue.
const sftFor = yr => { const T = RI.pen.sft, ks = Object.keys(T).map(Number).sort(), last = ks[ks.length - 1]; return yr <= ks[0] ? T[ks[0]] : yr <= last ? T[yr] : T[last] * Math.pow(1 + AS.infl, yr - last); };   // audit F4: set by law to 2029; after that we assume it rises with prices, so nominal is compared with nominal
const arfMin = (a, pot) => a >= 61 ? (pot > RI.pen.arfBig ? RI.pen.arfMinBig : a >= 71 ? RI.pen.arfMin71 : RI.pen.arfMin61) : 0;
// APR is an effective annual rate (Directive 2008/48/EC): monthly = (1 + APR)^(1/12) − 1. Mortgages use the nominal rate ÷ 12.
const iAPR = apr => Math.pow(1 + apr, 1 / 12) - 1;
// "What your plan assumes" (§14): every row says which of the three types it is. No "default" anywhere.
const TAG_CLS = t => t === T_GOV ? 'none' : t === T_MINE ? 'doc' : t === T_HOW ? 'typed' : t === T_ASSUMED ? 'look' : 'pre';
function assumeRows(){ applyAssume(); const F = finNums(), mine = k => asmMine(k), ch = k => asmFmt(ASM[k], asmGet(k)), NC = 'Not chosen yet', ready = planReady(), P = ready ? project() : null, k6 = S.ans['6'], q6 = DQ_BY('6');
  const R = [['Rules', RULES_VERSION, T_GOV]].concat(govRows().map(x => [x[0], x[1], T_GOV]));
  R.push(['Prices rise (inflation)', inflSet() ? pc(AS.infl) + ' a year (ECB target ' + pcs(SV('infl')) + '; Ireland now ' + pcs(INFL_IE) + ', ' + INFL_SRC + ')' : NC, T_MINE]);
  [['Pay rises', 'wage'], ['Cash savings grow (after DIRT)', 'cash'], ['Investments grow (after charges and exit tax)', 'inv'], ['Pensions grow while you work (after charges)', 'pen'], ['Pensions grow once retired (after charges)', 'penRet']].forEach(([l, k]) => R.push([l, asmFmt(ASM[k], asmV(k)) + ' a year', asmSrcLbl(k), asmSrcLbl(k) === T_SET ? stdNote(k) : '']));
  const yrsSP = S.fin.spYears != null && S.fin.spYears !== '' ? +S.fin.spYears : asmGet('spYears');
  R.push(['Your State Pension', F.spKnown ? eur(AS.sp * F.sp) + ' a year from ' + AS.spAge + ' (' + (yrsSP != null ? 'from your ' + yrsSP + ' years of PRSI' : S.fin.sp === 'Expect full' ? 'you expect the full rate' : 'your figure: ' + eurW(asmV('spWeek')) + ' a week') + '); taxable, no USC' : 'Not given yet', tRange(ASM.spWeek) + ' a week']);
  if (S.about.partner) R.push(['Your partner\'s State Pension', F.pSp === 'qa' ? 'Qualified Adult rate, ' + eurW(RI.sp.qa66) + ' a week' : F.pSp === 1 ? 'Full rate' : F.pSpO === 'None' ? 'None' : mine('pSpWeek') ? eurW(asmGet('pSpWeek')) + ' a week (your figure)' : 'Not given yet', tRange(ASM.pSpWeek) + ' a week']);
  R.push(['State Pension in future', asmFmt(ASM.spGrow, asmV('spGrow')), asmSrcLbl('spGrow'), asmSrcLbl('spGrow') === T_SET ? stdNote('spGrow') : ''], ['Tax bands in future', asmFmt(ASM.bands, asmV('bands')), asmSrcLbl('bands'), asmSrcLbl('bands') === T_SET ? stdNote('bands') : '']);
  R.push([retireGoal() ? 'Retirement age' : 'Work income stops at', S.retireSet ? 'Age ' + S.retireAge : NC, T_MINE], ['Plan until age', mine('planEnd') ? 'Age ' + AS.end : NC, T_MINE], ['Plan starts', '' + YEAR0, asmSrcLbl('startYear')]);
  R.push(['Pension access age', 'From ' + asmV('accessAge') + (asmV('accessAge') < RI.pen.earliestAge ? ' (an occupational scheme that allows it)' : ' (most pensions)'), asmSrcLbl('accessAge'), asmSrcLbl('accessAge') === T_SET ? stdNote('accessAge') : '']);
  R.push(['Lump sum at retirement', asmV('lumpSum') > 0 ? Math.round(asmV('lumpSum') * 100) + '% of your pension (tax as set by law, above)' : 'None', asmSrcLbl('lumpSum'), asmSrcLbl('lumpSum') === T_SET ? stdNote('lumpSum') : '']);
  R.push(['Pension drawdown', {spread:'Spread to the end of the plan, at least the legal minimum', min:'The legal minimum only', fixed:eur(asmV('drawFixed')) + ' a year (today\'s money), at least the legal minimum' + (mine('drawFixed') ? '' : ' (a planning figure: add yours)')}[asmV('drawRule')], asmSrcLbl('drawRule')]);
  if (F.pensionM > 0) R.push(['Share of your pension you pay', ch('ownShare') === NC ? pcs(asmV('ownShare')) : ch('ownShare'), asmSrcLbl('ownShare')]);
  if (F.mortBal > 0) R.push(['Mortgage rate', finN('mortRate') > 0 ? pcs(finN('mortRate') / 100) + ' (from your statement)' : mine('mortRate') ? ch('mortRate') + ' (your figure)' : pcs(asmV('mortRate')) + ' (' + (mkSug(ASM.mortRate) ? SL('mortRate') : 'a planning rate') + ')', finN('mortRate') > 0 || mine('mortRate') ? T_MINE : T_ASSUMED]);
  if (F.cardBal > 0) R.push(['Credit-card rate', finN('cardRate') > 0 ? pcs(finN('cardRate') / 100) + ' (from your statement)' : mine('cardRate') ? ch('cardRate') + (advOn('cardRate') ? ' (a planning rate: you don\'t know your rate, so it is left for your adviser)' : ' (your figure)') : pcs(asmV('cardRate')) + ' (a planning rate)', finN('cardRate') > 0 || mine('cardRate') ? T_MINE : T_ASSUMED]);
  if (F.loanBal > 0) R.push(['Other loans rate', finN('loanRate') > 0 ? pcs(finN('loanRate') / 100) + ' (from your statement)' : mine('loanRate') ? ch('loanRate') + (advOn('loanRate') ? ' (a planning rate: you don\'t know your rate, so it is left for your adviser)' : ' (your figure)') : pcs(asmV('loanRate')) + ' (' + (mkSug(ASM.loanRate) ? SL('loanRate') : 'a planning rate') + ')', finN('loanRate') > 0 || mine('loanRate') ? T_MINE : T_ASSUMED]);
  R.push(['What you save', S.saveM != null ? eur(S.saveM) + ' a month (your choice)' : (P ? 'About ' + eur(P.save.saveM) + ' a month towards your goals, ' : '') + 'at most ' + pc(SAVE.share) + ' of your spare money' + (typeof k6 === 'number' ? ' (from your answer: ' + q6.o[k6].t + ')' : mine('noAnswer') ? ', ' + eur(SAVE.noAnswer) + ' a month until you tell us how much you could invest' : ''), S.saveM != null || mine('saveShare') ? T_MINE : T_SET]);
  R.push(['Spare money not saved', 'Assumed spent', T_HOW]);
  R.push(['Emergency fund', S.goals.some(g => g.k === 'safety') ? 'Your Emergency fund goal covers this' : asmFmt(ASM.safetyMonths, asmV('safetyMonths')) + ' of essential spending kept aside', S.goals.some(g => g.k === 'safety') ? T_MINE : asmSrcLbl('safetyMonths')]);
  R.push(['Money for goals sooner than', asmFmt(ASM.cashYears, asmV('cashYears')) + ': kept as cash', asmSrcLbl('cashYears')], ['Spare savings invested', asmFmt(ASM.investShare, asmV('investShare')) + ' (the rest in cash)', asmSrcLbl('investShare')]);
  R.push(['Order your savings go to goals', 'Your order from Which goal first? (Emergency fund first unless you move it). Until you rank: must-haves, then nice-to-haves, soonest first', T_HOW]);
  R.push(['Tax for couples', S.about.partner && S.about.married === true ? 'Joint assessment (married / civil partners), also once retired' : 'Taxed as individuals', T_GOV]);
  if (S.needs && (S.needs.life || S.needs.ip)) R.push(['Protection needs noted for your adviser', [S.needs.life ? 'life cover ' + eur(S.needs.life) : '', S.needs.ip ? 'income protection ' + eur(S.needs.ip) + ' a month' : ''].filter(Boolean).join(', '), T_MINE]);
  R.push(['How timing is counted', 'Calculators: monthly, end of the month. Pension contributions in your plan and in the Retirement tool: paid at the end of each year (a little lower than monthly). Money you save towards goals: at the start of each year. Mortgage rates are a yearly rate ÷ 12; card, loan and APR figures are effective yearly rates.', T_HOW]);
  R.push(['Capital gains tax on sold assets', pcs(RI.sav.cgt) + ' on ' + pcs(+asmV('cgtGain')) + ' of the value of other assets, crypto, gold or art when they are sold for a goal (assumed gain)', asmSrcLbl('cgtGain')]);
  R.push(['Known limits', 'Living costs stay the same through the plan. Your partner\'s pay is counted until the retirement age you choose for them, then only their State Pension; their own pension isn\'t modelled. We assume drawdown from an ARF or vested PRSA. The reduced USC rate for medical-card holders under 70 isn\'t applied. Auto-enrolment rates after 2028 stay at the 2026 rates. Capital gains tax uses a share-of-value assumption and ignores the yearly exemption; tax on a life-policy lump sum, rental costs, the tax-free part of a bought annuity and gift or inheritance tax are not modelled yet.', T_HOW]);
  return R; }
const rowHTML = x => '<div class="mini"><span>' + esc(x[0]) + '<br><span class="tag ' + TAG_CLS(x[2]) + '">' + esc(x[2]) + '</span>' + (x[3] ? '<br><span class="small">' + esc(x[3]) + '</span>' : '') + '</span><b>' + esc(x[1]) + '</b></div>';
function assumeSheet(){ const R = assumeRows(), gov = R.filter(x => x[2] === T_GOV), rest = R.filter(x => x[2] !== T_GOV);
  return rest.map(rowHTML).join('') + '<details style="margin-top:8px"><summary style="cursor:pointer;font-weight:800;min-height:44px">' + T_GOV + ' (' + gov.length + ')</summary>' + gov.map(rowHTML).join('') + '</details>'; }
// Debts: credit cards and other loans amortise separately at their APR (effective). A stated repayment is used if it more than covers the interest; otherwise a 5-year repayment is worked out from the customer's figures (labelled, spec §15).
/* §24.1: a mortgage on another property is debt in the plan: it is folded into "other loans" (balance, repayment and a balance-weighted rate: the item's own rate, else the mortgage rate the customer chose). It is never the main-home mortgage, so the mortgage-free goal ignores it. */
function mort2Nums(){ let bal = 0, pay = 0, rb = 0, n = 0; (S.lists && S.lists.mort2 || []).forEach(it => { const b = hasVal(it.f.owed) ? +it.f.owed : 0; if (!(b > 0)) return; const r = hasVal(it.f.rate) && +it.f.rate > 0 ? +it.f.rate / 100 : AS.mortRate; bal += b; rb += b * r; n++;
    pay += hasVal(it.f.pay) && +it.f.pay > 0 ? +it.f.pay /* §27: no term and no repayment given: 25 years is assumed (the same as the main mortgage) and the missing-details banner says so */ : mPmt(b, r, hasVal(it.f.years) && +it.f.years > 0 ? +it.f.years : 25); }); return {bal, pay, rate:bal > 0 ? rb / bal : 0, n}; }
const mort2NeedsTerm = () => (S.lists && S.lists.mort2 || []).some(it => hasVal(it.f.owed) && +it.f.owed > 0 && !(hasVal(it.f.pay) && +it.f.pay > 0) && !(hasVal(it.f.years) && +it.f.years > 0));
const mort2NeedsRate = () => (S.lists && S.lists.mort2 || []).some(it => hasVal(it.f.owed) && +it.f.owed > 0 && !(hasVal(it.f.rate) && +it.f.rate > 0));
function debtNums(n){ const M2 = mort2Nums(), lR0 = n('loanRate') > 0 ? n('loanRate') / 100 : AS.loanRate, lB0 = n('loanBal') + n('debt'), cR = n('cardRate') > 0 ? n('cardRate') / 100 : AS.cardRate, lR = M2.bal > 0 ? (lB0 > 0 ? (lB0 * lR0 + M2.bal * M2.rate) / (lB0 + M2.bal) : M2.rate) : lR0, c = n('cardBal'), l = lB0 + M2.bal, lp = n('loanPayM') + n('debtPayM') + M2.pay, cp = n('cardPayM');
  const ok = (b, p, r) => b > 0 && p > b * iAPR(r), pay = (b, p, r) => ok(b, p, r) ? p : pmtM(b, iAPR(r), 60), cardPayM = c > 0 ? pay(c, cp, cR) : 0, loanPayM = l > 0 ? pay(l, lp, lR) : 0;
  return {cardRateKnown:n('cardRate') > 0 || asmMine('cardRate'), loanRateKnown:n('loanRate') > 0 || asmMine('loanRate'), cardBal:c, cardRate:cR, cardPayM, cardPayEst:c > 0 && !ok(c, cp, cR), loanBal:l, loanRate:lR, loanPayM, loanPayEst:l > 0 && !ok(l, lp, lR), debt:c + l, debtPayM:cardPayM + loanPayM, debtPayEst:(c > 0 && !ok(c, cp, cR)) || (l > 0 && !ok(l, lp, lR))}; }
function finNums(){ syncLists();
  // Skipped figures count as €0 and show as ❓ Missing. We never fill in a figure for the customer (spec §15).
  const f = S.fin, n = k => { const v = f[k]; return v != null && v !== '' && !isNaN(+v) ? +v : 0; };
  const wk = f.work || (n('income') > 0 ? 'Employed' : f.work), mortOn = f.home === 'Own with mortgage', mR = n('mortRate') > 0 ? n('mortRate') / 100 : AS.mortRate, mStated = mortOn ? n('mortPayM') : 0, inc = wk === 'Not working' ? 0 : n('income');
  const penM = wk !== 'Not working' && inc > 0 ? n('pensionM') : 0, own = f.pensionOwnM != null && f.pensionOwnM !== '' && !isNaN(+f.pensionOwnM) ? Math.min(penM, +f.pensionOwnM) : penM * asmV('ownShare');
  const yrsSP = f.spYears != null && f.spYears !== '' ? +f.spYears : asmGet('spYears'), spF = yrsSP != null ? spFrac(+yrsSP) : f.sp === 'Expect full' ? 1 : Math.min(1, +asmV('spWeek') / RI.sp.week);   // §14 type 2: the customer's own weekly amount when they don't know their years
  const pSpO = S.about.partner ? (f.pSp || 'Not sure') : 'None', pSp = {'Own full':1, 'Own partial':Math.min(1, +asmV('pSpWeek') / RI.sp.week), 'Not sure':Math.min(1, +asmV('pSpWeek') / RI.sp.week), 'Qualified adult increase':'qa', 'None':0}[pSpO];
  const aeElig = wk === 'Employed' && S.about.age >= RI.ae.ageMin && S.about.age <= RI.ae.ageMax && inc > RI.ae.earnMin && penM === 0;
  const C = S.about.cred || {};
  return {age:S.about.age, R:S.retireAge, work:wk, married:!!S.about.partner && S.about.married === true, partner:!!S.about.partner, pAge:S.about.partner ? (n('pAge') || S.about.age) : 0, pRet:S.pRetSet ? S.pRet : 0, income:inc, pIncome:S.about.partner ? n('pIncome') : 0,
    otherM:n('otherM'), costsM:n('costsM'), oneOffY:n('oneOffY'), cash:n('cash'), invest:n('invest'), rentM:n('rentM'),
    savings:n('savings'), otherAssets:n('otherAssets'), altInv:n('altInv'), homeVal:/^Own/.test(f.home || '') ? n('homeValue') : 0, homeUse:/^Own/.test(f.home || '') ? (f.homeUse || 'No, never') : 'No, never', downAge:n('downAge'), downValue:n('downValue'),
    polLump:n('polLump'), polLumpAge:n('polLumpAge'), polInc:n('polInc'), polIncAge:n('polIncAge'),
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
/* ===== Honest goal funding (FP review round 3). Replaces project(); same return shape {rows, pct} plus P.goal and P.save ===== */
const SAVE = {
  band:[50, 200, 500, 1000, null],   // Q6 option index -> monthly amount, today's money (band midpoint; "Over €750" -> €1,000; "varies" -> share only)
  share:0.5,                         // at most half of the measured monthly spare money is saved
  shareVaries:0.33,                  // "It changes month to month": a third
  noAnswer:300,                      // Q6 not answered: €300 a month cap (shown as an assumption)
  buffer:6,                          // B16: months of essential spending kept back as an emergency buffer when there is no emergency fund goal (set from the customer's assumptions)
  longYrs:5                          // goals 5+ years away grow at the investment rate, sooner ones at the cash rate
};
// §19.8: the customer ranks their goals ("which first?"); funding follows the ranking. Until they rank, the order is the old one:
// Emergency fund first, then Must have before Nice to have, then soonest. A new Emergency fund goal goes first unless it was moved.
const GOAL_ORDER_DEFAULT = (a, b) => (a.k === 'safety' ? 0 : 1) - (b.k === 'safety' ? 0 : 1)
  || (a.prio === 'Nice to have' ? 1 : 0) - (b.prio === 'Nice to have' ? 1 : 0)
  || a.age - b.age || a.id - b.id;
const rankIdx = g => { const i = S && S.rank ? S.rank.indexOf(g.id) : -1; return i >= 0 ? i : g.k === 'safety' ? -1 : 1e6; };
const GOAL_ORDER = (a, b) => (S && S.rank ? rankIdx(a) - rankIdx(b) : 0) || GOAL_ORDER_DEFAULT(a, b);
const rankList = () => S.goals.slice().sort(GOAL_ORDER);   // all goals, in the order they are funded / shown
const resultOrder = () => S.rank ? rankList() : S.goals.slice().sort((a, b) => a.age - b.age);
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
  applyAssume(); autoSafety();
  const f = finNums(), a0 = f.age, R = f.R, N = AS.end - a0, rg = S.goals.find(g => g.kind === 'retire');
  wi = wi || {}; const wg = wi.g != null ? S.goals.find(g => g.id === wi.g) : null, wm = +wi.m || 0, wl = +wi.l || 0;
  const wgR = wg && wg.kind === 'retire';
  // Goals funded from savings: spend, mfree, pot. Retirement uses the pension + cashflow; legacy is what is left at the end.
  const fg = S.goals.filter(g => ['spend','mfree','pot'].includes(g.kind)).map(g => Object.assign({}, g, {age:clamp(g.age, a0 + 1, AS.end)})).sort(GOAL_ORDER);
  // Mortgage balance path, so "Be mortgage-free" has a known cost at its date
  const mPath = []; { let m = f.mortBal; for (let t = 0; t <= N; t++){ mPath.push(Math.max(0, m)); if (m > 1) m = amortYear(m, f.mortRate, f.mortPayM).bal; } }
  const G = {}; fg.forEach(g => { const n = Math.max(0, g.age - a0), r = n >= SAVE.longYrs ? AS.inv : AS.cash;
    const cost = g.kind === 'mfree' ? (f.mortBal > 0 ? mPath[Math.min(n + 1, N)] : g.amount * Math.pow(1 + AS.infl, n)) : g.amount * Math.pow(1 + AS.infl, n);
    G[g.id] = {g, n, r, cost, pot:0, paid:0, done:false, c0:0, cSum:0, cYrs:0, need0:0, saved0:0, src0:{}, srcDue:{}}; });
  // 1. Lump sums. Each goal's own "saved so far" first (taken from cash), then a buffer is held back, then free cash + investments in goal order.
  let cash = f.cash, inv = f.invest, pen = f.pension, mBal = f.mortBal, cBal = f.cardBal, lBal = f.loanBal, mfreeDone = false;
  fg.forEach(g => { const s = Math.min(g.saved || 0, cash); G[g.id].pot += s; G[g.id].saved0 = s; cash -= s; });
  if (wg && !wgR && G[wg.id]) G[wg.id].pot += wl; if (wgR) pen += wl;
  const hasSafety = fg.some(g => g.k === 'safety');
  let buffer = hasSafety ? 0 : Math.min(cash, SAVE.buffer * essM(f)); cash -= buffer;   // B16: months of essential spending
  // v3.0 funding order: unallocated money is kept in separate pots and used in this order (the emergency fund / buffer is ring-fenced)
  const W = {cash, sav:f.savings, inv, oth:f.otherAssets, alt:f.altInv}, WK = ['cash', 'sav', 'inv', 'oth', 'alt'];
  const wTot = () => W.cash + W.sav + W.inv + W.oth + W.alt;
  const WK_EASY = ['cash', 'sav'];   // the emergency fund is built from cash and savings accounts only
  const cgtEff = RI.sav.cgt * +asmV('cgtGain');   // Capital gains tax when other assets or alternative investments are sold: the tax rate on the share of the value that is a gain (annual exemption not counted: prudent)
  const WCG = {oth:cgtEff, alt:cgtEff};
  const wTake = (amt, src, keys) => { let need = Math.max(0, amt), got = 0; (keys || WK).forEach(k => { const e = WCG[k] || 0, d = Math.min(need, Math.max(0, W[k]) * (1 - e)); if (d > 0){ W[k] -= d / (1 - e); need -= d; got += d; if (src) src[k] = (src[k] || 0) + d; } }); return got; };   // d = money received after tax; W[k] falls by the sale value
  fg.forEach(g => { const x = G[g.id], want = Math.max(0, x.cost / Math.pow(1 + x.r, x.n) - x.pot), take = wTake(want, x.src0, g.k === 'safety' ? WK_EASY : WK); x.pot += take; });
  const sh = +asmV('investShare');   // B21: new unallocated money, cash / invested mix
  const wAdd = v => { W.cash += v * (1 - sh); W.inv += v * sh; };
  const gf = {}; S.goals.forEach(g => gf[g.id] = {cost:0, cov:0});
  const rows = []; let auto0 = 0;
  const V = Math.max(R, +asmV('accessAge')), lsPct = +asmV('lumpSum'), rule = asmV('drawRule'), fixedReal = +asmV('drawFixed'), spG = asmV('spGrow'), flatBands = asmV('bands') === 'flat';
  const penExtraM = +(S.penExtra || 0), ownBase = f.pensionM > 0 ? f.pensionOwnM / f.pensionM : 0;
  for (let t = 0; t <= N; t++){
    const a = a0 + t, yr = YEAR0 + t, infl = Math.pow(1 + AS.infl, t), wgw = Math.pow(1 + AS.wage, t), working = a < R, tI = flatBands ? 1 : infl, rate = prsiRate(yr);
    const spI = spG === 'pay' ? wgw : spG === 'flat' ? 1 : infl;   // B11
    // --- person 1
    const p1 = {emp:0, se:f.work === 'Self-employed', sp:0, draw:0, other:(f.otherM + f.rentM) * 12 * infl + (f.polInc > 0 && f.polIncAge > 0 && a >= f.polIncAge ? f.polInc : 0), relief:0, age:a};
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
        if (lsPct > 0){ const L = lumpSum(pen, lsPct); pen -= L.gross; wAdd(L.net); } }
      const mn = arfMin(a, pen), want = rule === 'min' ? pen * mn : rule === 'fixed' ? Math.max(fixedReal * infl, pen * mn) : pen * Math.max(1 / Math.max(1, AS.end - a + 1), mn);
      const draw = Math.min(pen, want); pen = (pen - draw) * (1 + AS.penRet); p1.draw = draw;
    }
    if (a >= AS.spAge) p1.sp = AS.sp * f.sp * spI + (a >= 80 && f.sp > 0 ? RI.sp.over80 * RI.sp.weeks * spI : 0);   // the over-80 increase belongs to a State Pension in payment: none counted, none added
    // --- partner (employment to 66, then their State Pension or a Qualified Adult increase paid to you)
    let p2 = null;
    if (f.partner){ const pa = f.pAge + t; p2 = {emp:f.pAge > 0 && pa < (f.pRet || 66) ? f.pIncome * wgw : 0, se:false, sp:0, draw:0, other:0, relief:0, age:pa};
      if (pa >= 66 && f.pSp !== 'qa') p2.sp = AS.sp * (+f.pSp || 0) * spI;
      if (f.pSp === 'qa' && a >= AS.spAge && p2.emp === 0) p1.sp += (pa >= 66 ? RI.sp.qa66 : RI.sp.qaUnder66) * RI.sp.weeks * spI; }
    const scale = p => p && Object.assign({}, p, {emp:p.emp / tI, sp:p.sp / tI, draw:p.draw / tI, other:p.other / tI, relief:p.relief / tI});
    const T = hhTax(scale(p1), scale(p2), {married:f.married, spccc:f.spccc, rent:f.rentCred && yr <= RI.it.rentLastYear, carer:f.carer, rate});
    const gross = p1.emp + p1.sp + p1.draw + p1.other + (p2 ? p2.emp + p2.sp : 0);
    let inflow = gross - T.total * tI - cashOut;
    let living = (working ? f.costsM * 12 : (rg ? rg.amount : f.costsM * 12 * +asmV('retireSpend'))) * infl + f.oneOffY * infl;
    // v3.0: a policy that pays out, and downsizing the home (only if the customer chose it)
    let polIn = 0, downIn = 0;
    if (f.polLump > 0 && f.polLumpAge > 0 && a === f.polLumpAge){ W.cash += f.polLump; polIn = f.polLump; }
    if (f.homeUse === 'Yes, I\'d downsize' && f.downAge > 0 && a === f.downAge && f.homeVal > 0){ const rel = Math.max(0, f.homeVal - f.downValue) * infl * 0.9; downIn = Math.max(0, rel - mBal); mBal = 0; mfreeDone = true; W.cash += downIn; }
    let fixed = 0;
    if (mBal > 1 && !mfreeDone){ const y = amortYear(mBal, f.mortRate, f.mortPayM); fixed += y.paid; mBal = y.bal; }   // FP round 6: monthly, at the stated repayment
    if (cBal > 1){ const y = amortYear(cBal, 0, f.cardPayM, iAPR(f.cardRate)); fixed += y.paid; cBal = y.bal; }   // credit cards (APR effective)
    if (lBal > 1){ const y = amortYear(lBal, 0, f.loanPayM, iAPR(f.loanRate)); fixed += y.paid; lBal = y.bal; }   // other loans (APR effective)
    // 2. Goals due this year are paid from their own pot, then from unallocated money. What can't be paid is a goal gap (shown on the road).
    let goalPaid = 0, goalGap = 0, goalCost = 0; const due = [], dueG = [];
    fg.forEach(g => { const x = G[g.id]; if (x.done || g.age > a) return; x.done = true; due.push(g.name);
      if (g.kind === 'pot'){ x.paid = Math.min(x.cost, x.pot); goalGap += x.cost - x.paid;
        if (g.k === 'safety') buffer += x.pot; else wAdd(x.pot); x.pot = 0; }          // the emergency fund stays as the buffer; a wealth pot becomes free money
      else { let pay = Math.min(x.cost, x.pot); x.pot -= pay; const top = wTake(x.cost - pay, x.srcDue); pay += top; wAdd(x.pot); x.pot = 0;
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
        x.pot += give; x.cSum += give / infl; wAdd(ex - give); if (t === 0) x.c0 += give; }
      fg.forEach(g => { const x = G[g.id]; if (x.done) return; const n = g.age - a;
        const need = Math.max(0, (x.cost - x.pot * Math.pow(1 + x.r, n)) / annF(n, x.r, AS.wage)), give = Math.min(budget, need);
        if (t === 0) x.need0 = need; x.pot += give; budget -= give; x.cSum += give / infl; x.payN = (x.payN || 0) + give; x.cYrs++; if (t === 0) x.c0 += give; });
      wAdd(budget);                                              // saved but not needed by any goal: unallocated
      if (!working){ wAdd(spent); saved += spent; spent = 0; }   // FP round 4 F7: retired income above the spending goal stays in savings
    } else {
      fg.forEach(g => { const x = G[g.id]; if (!x.done){ x.cYrs++; if (t === 0) x.need0 = Math.max(0, (x.cost - x.pot * Math.pow(1 + x.r, g.age - a)) / annF(g.age - a, x.r, AS.wage)); } });
      let gap = -net; const take = v => { const d = Math.min(gap, v); gap -= d; used += d; return d; };
      WK.forEach(k => { W[k] -= take(Math.max(0, W[k])); }); buffer -= take(buffer);
      fg.slice().reverse().forEach(g => { const x = G[g.id]; if (!x.done && gap > 0) x.pot -= take(x.pot); });   // Nice-to-have and latest goals give way first
      short = gap;
    }
    // 4. Growth
    W.cash *= 1 + AS.cash; W.sav *= 1 + AS.cash; W.inv *= 1 + AS.inv; W.oth *= 1 + AS.infl; W.alt *= 1 + AS.inv; buffer *= 1 + AS.cash; fg.forEach(g => { const x = G[g.id]; if (!x.done) x.pot *= 1 + x.r; });
    if (rg && !working){ gf[rg.id].cost += living; gf[rg.id].cov += living - Math.min(short, living); }
    const pots = fg.reduce((s, g) => s + G[g.id].pot, 0), liquid = wTot() + buffer + pots;
    S.goals.forEach(g => { if (g.kind === 'legacy' && t === N){ const tgt = g.amount * infl; gf[g.id].cost = tgt; gf[g.id].cov = Math.min(tgt, wTot() + buffer); } });
    rows.push({polIn, downIn, t, a, yr, inflow, needs:living + fixed, goalPaid, living, fixed, goalCost, dueG, short:short + goalGap, shortLiving:short, goalGap, due, used, saved, spent, liquid, pen, retired:!working, rmark:a === R, tax:T.total * tI, gross});
  }
  // 5. Results. Floor, so 99.6% never reads as 100%.
  const pct = {}, goal = {};
  S.goals.forEach(g => { const x = gf[g.id]; pct[g.id] = x.cost > 0 ? (x.cov >= x.cost - 1 ? 100 : clamp(Math.floor(x.cov / x.cost * 100), 0, 99)) : 100; });
  fg.forEach(g => { const x = G[g.id];
    goal[g.id] = {cost:x.cost, have:x.paid, rate:x.r, years:x.n, saved0:x.saved0, src0:x.src0, srcDue:x.srcDue, payN:x.payN || 0, gap:Math.max(0, x.cost - x.paid),
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
const PASSED = 'Date has passed', passedG = g => g.kind !== 'legacy' && g.age < S.about.age;   // §27.1: a goal whose age is before today's age
const dateBtn = g => passedG(g) ? ' <button class="link" style="font-size:12.5px" data-a="gdate" data-p="' + g.id + '">Change the date</button>' : '';
function yearsTxt(g){ if (passedG(g)) return PASSED; const n = g.age - S.about.age; return g.kind === 'legacy' ? 'at the end of your plan' + (asmMine('planEnd') ? ' (' + AS.end + ')' : '') : g.kind === 'retire' ? (S.retireSet ? 'at ' + g.age : 'at an age you haven\'t chosen yet') : 'in ' + n + ' year' + (n === 1 ? '' : 's'); }
// §27: the source of a figure. A mortgage, card or loan rate chosen in Your assumptions counts as given; the other-property mortgage has no S.src (its term is read from the list)
const srcOf = k => k === 'mort2' ? (mort2NeedsTerm() ? undefined : 'typed') : S.src[k] || (['mortRate', 'cardRate', 'loanRate'].includes(k) && asmMine(k) ? 'typed' : undefined);
function qualityCount(){ let n = 0; FSEC.forEach(s => s.f.forEach(k => { if (fieldVisible(k) && !FF[k].opt && !srcOf(k)) n++; })); return n; }
function skippedSecs(){ return FSEC.filter(sec => { const fs = sec.f.filter(fieldVisible); return fs.length && fs.every(k => !srcOf(k) && !S.look[k]); }); }
function roughNote(){ const sk = skippedSecs(), rough = qualityCount() > 2; if (!sk.length && !rough) return ''; if (missingFlags().length) return '';   // one banner, not two: the missing-details banner above already carries the rough-picture warning
  const and = xs => xs.length > 1 ? xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1] : xs[0], money = sk.filter(x => x.id !== 'prot').map(x => x.t), prot = sk.some(x => x.id === 'prot');
  const msg = (money.length ? and(money) + (money.length > 1 ? ' are' : ' is') + ' missing, so ' + (money.length > 1 ? 'they count' : 'it counts') + ' as €0. ' : '') + (prot ? 'Your protection cover isn\'t added yet. ' : '') + (!sk.length ? 'Some figures are missing, so they count as €0. ' : '');
  return '<div class="nudge" id="r-rough" style="background:var(--sun-l);border:1.5px solid var(--sun)"><span aria-hidden="true" style="font-size:20px">🧩</span><span><b>Rough picture.</b> ' + msg + (sk.length === 1 ? 'Add it' : 'Add them') + ' to sharpen your plan.</span><button class="link" data-a="me" data-p="money">Add now</button></div>'; }
function fieldVisible(k){ const d = FF[k]; return !d.show || d.show(); }
function secStatus(sec){
  const fs = sec.f.filter(fieldVisible), req = fs.filter(k => !FF[k].opt);
  if (fs.some(k => S.look[k] && !S.ack[k])) return 'look';
  const got = req.filter(k => srcOf(k)).length;
  return got === req.length || (S.saved && S.saved[sec.id]) ? 'done' : (fs.some(k => srcOf(k) && srcOf(k) !== 'pre') ? 'part' : 'none');   // §19.3: saved = complete; blanks count €0 and stay on the checklist as optional
}
const secDone = id => ['done','look'].includes(secStatus(FSEC.find(s => s.id === id)));
const minOK = () => secDone('about') && secDone('income') && (secDone('assets') || secDone('pension'));
/* ================= SMALL UI PIECES ================= */
function ring(p, size, col){ const r = (size - 10) / 2, c = 2 * Math.PI * r; return '<div class="ring" style="width:' + size + 'px;height:' + size + 'px" aria-hidden="true"><svg width="' + size + '" height="' + size + '"><circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="rgba(11,37,69,.1)" stroke-width="8"/><circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + col + '" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + c + '" stroke-dashoffset="' + c * (1 - p / 100) + '"/></svg><b style="font-size:' + (size > 70 ? 20 : 14) + 'px">' + p + '%</b></div>'; }
const PHASES = ['Discover','Define','Prepare','Understand'];
function phaseBar(n){ return '<div class="phasebar" aria-label="Step ' + n + ' of 4: ' + PHASES[n - 1] + '">' + PHASES.map((_, k) => '<i class="' + (k < n ? 'on' : '') + '"></i>').join('') + '</div>'; }
// v62: live session card - date tile, title, who, free tag and a clear Remind me button
function liveCard(x, who, st){ const [d, ...t] = String(x[0]).split(' ');
  return '<div class="card lv3" style="' + (st || '') + '"><span class="lv2-d" aria-hidden="true"><small>' + esc(d) + '</small><b>' + esc(t.join(' ')) + '</b></span><span class="lv3-m"><b>' + x[1] + '</b><small><i class="lv3-dot" aria-hidden="true"></i>Live · free · ' + esc(who.replace(/^With /, 'with ')) + '</small></span><button class="mp-seat" data-a="remind" aria-label="Remind me: ' + esc(x[1]) + '"><span aria-hidden="true">🔔</span> Remind me</button></div>'; }
// v64: living hero background - drifting light orbs, a winding route with a traveller dot, twinkles
const HFX = '<span class="hfx" aria-hidden="true"><i class="o1"></i><i class="o2"></i></span>';
// v97: profile photo - picked from the device, shrunk to 240px in the browser, kept in memory only
document.addEventListener('change', e => { const f = e.target.id === 'avup' && e.target.files && e.target.files[0]; if (!f) return; if (!/^image\//.test(f.type)) { toast('Please choose an image'); return; }
  const r = new FileReader(); r.onload = () => { const im = new Image(); im.onload = () => { const z = 240, c = document.createElement('canvas'), k = Math.min(im.width, im.height); c.width = c.height = z; c.getContext('2d').drawImage(im, (im.width - k) / 2, (im.height - k) / 2, k, k, 0, 0, z, z); S.acct.photo = c.toDataURL('image/jpeg', .85); render(); toast('Photo updated'); }; im.src = r.result; }; r.readAsDataURL(f); });
// v121: default profile picture - a soft illustrated portrait in the app colours (no photo needed)
const AV_ILL = '<svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true"><defs><linearGradient id="avbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7CF3DC"/><stop offset=".55" stop-color="#08D9B8"/><stop offset="1" stop-color="#0B5880"/></linearGradient><linearGradient id="avsh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".95"/><stop offset="1" stop-color="#E6F6F4" stop-opacity=".9"/></linearGradient></defs><rect width="100" height="100" fill="url(#avbg)"/><circle cx="78" cy="22" r="18" fill="#fff" opacity=".18"/><path d="M18 100c2-20 15-31 32-31s30 11 32 31z" fill="url(#avsh)"/><circle cx="50" cy="44" r="17" fill="url(#avsh)"/><path d="M33 42c0-12 8-19 17-19s17 7 17 18c-5-6-11-8-17-8-7 0-12 3-17 9z" fill="#0B5880" opacity=".55"/></svg>';
// v133: smooth drag-and-drop goal priority (arrows remain for keyboard and screen readers)
(() => { let d = null, raf = 0;
  const paint = () => { raf = 0; if (!d) return; const dy = d.dy; d.li.style.transform = 'translate3d(0,' + dy + 'px,0) scale(1.03)';
    const to = Math.max(0, Math.min(d.items.length - 1, d.from + Math.round(dy / d.step))); if (to === d.to) return; d.to = to;
    d.items.forEach((it, k) => { if (it === d.li) return; let sh = 0; if (d.from < to && k > d.from && k <= to) sh = -d.step; if (d.from > to && k < d.from && k >= to) sh = d.step; it.style.transform = sh ? 'translate3d(0,' + sh + 'px,0)' : ''; }); };
  document.addEventListener('pointerdown', e => { const li = e.target.closest && e.target.closest('.rank .rk-r'); if (!li || e.target.closest('button') || e.button > 0 || d) return;
    const ol = li.parentElement, items = [...ol.children], r0 = items[0].getBoundingClientRect(), r1 = items[1] ? items[1].getBoundingClientRect() : r0;
    d = {li, ol, items, y0:e.clientY, dy:0, step:(r1.top - r0.top) || r0.height, from:items.indexOf(li), to:items.indexOf(li), id:e.pointerId};
    li.classList.add('drag'); ol.classList.add('dragging'); try { li.setPointerCapture(e.pointerId); } catch (_) {} e.preventDefault(); });
  document.addEventListener('pointermove', e => { if (!d || e.pointerId !== d.id) return; d.dy = e.clientY - d.y0; if (!raf) raf = requestAnimationFrame(paint); });
  const end = e => { if (!d || (e.pointerId != null && e.pointerId !== d.id)) return; const x = d; d = null; if (raf){ cancelAnimationFrame(raf); raf = 0; }
    x.li.classList.add('settle'); x.li.style.transform = 'translate3d(0,' + (x.to - x.from) * x.step + 'px,0) scale(1)';
    setTimeout(() => { x.items.forEach(it => { it.style.transition = 'none'; it.style.transform = ''; }); x.li.classList.remove('drag', 'settle'); x.ol.classList.remove('dragging');
      if (x.to !== x.from){ const list = rankList().map(g => g.id), [mv] = list.splice(x.from, 1); list.splice(x.to, 0, mv); S.rank = list; const g = gById(mv); S.rankMsg = g.name + ' is now ' + (x.to + 1) + ' of ' + list.length; version('Goal priority changed');
        if (x.to > x.from) x.items[x.to].after(x.li); else x.items[x.to].before(x.li);   // move in place: no full re-render, no jump
        [...x.ol.children].forEach((it, k) => { const n = it.querySelector('.rk-n'); if (n) n.textContent = k + 1; it.querySelectorAll('[data-a="grank"]').forEach((bt, j) => { const last = k === x.ol.children.length - 1; if (j === 0) bt.toggleAttribute('aria-disabled', k === 0); else bt.toggleAttribute('aria-disabled', last); if (bt.hasAttribute('aria-disabled')) bt.setAttribute('aria-disabled', 'true'); }); });
        const m = x.ol.parentElement.querySelector('[id^="rank-msg-"]'); if (m) m.textContent = S.rankMsg;
        if (!x.ol.parentElement.querySelector('[data-a="grankreset"]') && m) m.insertAdjacentHTML('afterend', '<button class="link" data-a="grankreset">Back to our suggested order</button>'); }
      requestAnimationFrame(() => x.items.forEach(it => { it.style.transition = ''; })); }, RM() ? 0 : 220); };
  document.addEventListener('pointerup', end); document.addEventListener('pointercancel', end);
})();
// v146: mortgage eligibility - card on Mortgages (Buying) and a 4-question quiz in a sheet
const ELIG_Q = [{q:'Are you buying on your own?', o:[['🙋', 'Just me'], ['👫', 'With a partner']]}, {q:'Is this your first home?', o:[['🔑', 'Yes, my first home'], ['🏠', "No, I've owned before"]]},
  {q:'Yearly income before tax (both of you, if joint)', o:[['💶', 'Under €50,000', 40000], ['💶', '€50,000 to €80,000', 65000], ['💶', '€80,000 to €120,000', 100000], ['💶', 'Over €120,000', 140000]]},
  {q:'How much have you saved for a deposit?', o:[['🐷', 'Under €20,000', 15000], ['🐷', '€20,000 to €40,000', 30000], ['🐷', '€40,000 to €70,000', 55000], ['🐷', 'Over €70,000', 85000]]}];
function eligCard(){ return '<div class="elg2"><div class="elg2-ph" style="background-image:url(media/family-couch.jpg)" aria-hidden="true"><span class="elg2-in" style="background-image:url(media/couple-planning.jpg)"></span></div>' +
  '<div class="elg2-tx"><span class="elg2-eye">Mortgage eligibility</span><b>How much could you borrow?</b><p>Take our 5 minute quiz and see a rough borrowing amount and home price.</p><button class="elg2-go" data-a="elig">Start eligibility quiz <i aria-hidden="true">→</i></button><span class="elg2-t"><span aria-hidden="true">⏱</span> About 5 minutes · no credit check</span></div></div>'; }
function eligHTML(){ const e = S.elig || {i:0, a:[]}, n = ELIG_Q.length;
  if (e.i < n){ const q = ELIG_Q[e.i];
    return '<div class="elq"><div class="elq-top"><span>Question ' + (e.i + 1) + ' of ' + n + '</span><span class="elq-bar"><i style="width:' + Math.round(e.i / n * 100) + '%"></i></span></div><h2 class="t" tabindex="-1">' + q.q + '</h2><div class="elq-o">' + q.o.map((o, k) => '<button class="elq-b' + (e.a[e.i] === k ? ' sel' : '') + '" data-a="eligpick" data-p="' + k + '"><span aria-hidden="true">' + o[0] + '</span>' + esc(o[1]) + '</button>').join('') + '</div>' + (e.i ? '<button class="link" data-a="eligback">← Back</button>' : '') + '</div>'; }
  const H = RI.home, ftb = e.a[1] === 0, inc = ELIG_Q[2].o[e.a[2]][2], dep = ELIG_Q[3].o[e.a[3]][2], lti = ftb ? H.ltiFTB : H.ltiSSB, ltv = ftb ? H.ltv : Math.min(H.ltv, .8);
  const loan = inc * lti, byDep = dep / (1 - ltv), price = Math.min(loan + dep, byDep), borrow = Math.max(0, price - dep), lim = loan + dep <= byDep ? 'income' : 'deposit';
  return '<div class="elr"><span class="elr-ok">✓ Your estimate</span><h2 class="t" tabindex="-1">You could borrow about</h2><b class="elr-big">' + eur(Math.round(borrow / 1000) * 1000) + '</b>' +
    '<div class="elr-g"><div><small>Home price up to</small><b>' + eur(Math.round(price / 1000) * 1000) + '</b></div><div><small>Your deposit</small><b>' + eur(dep) + '</b></div></div>' +
    '<p class="elr-n">' + (lim === 'income' ? 'Your income sets the limit: lenders usually lend up to ' + lti + '× income' + (ftb ? ' for first-time buyers' : '') + '.' : 'Your deposit sets the limit: you need at least ' + Math.round((1 - ltv) * 100) + '% of the price saved.') + ' A rough guide only, not a mortgage offer.</p>' +
    '<button class="btn" data-a="calc" data-p="borrow">Open the Borrow calculator</button><button class="btn ghost" data-a="xfab" data-p="mortgage" style="margin-top:8px">Talk to a mortgage expert</button><button class="link" data-a="elig" style="margin-top:6px">Start again</button></div>'; }
// v153: one icon set - goal emojis inside icon tiles become teal line icons
const GICON = {'🪂':'<svg class="gi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9z"/><path d="M12 12v7a2 2 0 0 0 4 0"/></svg>','🛟':'<svg class="gi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M5.6 5.6l3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6"/></svg>','✈️':'<svg class="gi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.5 13.5L3 11l2-2 7.5 1.5L17 6a2 2 0 0 1 3 3l-4.5 4.5L17 21l-2 2-2.5-7.5L9 19v2l-2 1-1-3-3-1 1-2h2z" transform="scale(.92) translate(1 0)"/></svg>','🎓':'<svg class="gi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5"/><path d="M22 9v6"/></svg>','🏡':'<svg class="gi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>','🏦':'<svg class="gi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9l9-5 9 5"/><path d="M4 9h16M5 9v9M9.5 9v9M14.5 9v9M19 9v9M3 20h18"/></svg>','🌅':'<svg class="gi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 18h18M6 18a6 6 0 0 1 12 0"/><path d="M12 4v3M4.9 8.9l2 2M19.1 8.9l-2 2M2 14h2M20 14h2"/></svg>','👶':'<svg class="gi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/><path d="M10.5 8h.01M13.5 8h.01"/></svg>','💍':'<svg class="gi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="15" r="6"/><path d="M9 4h6l2 3-5 3-5-3z"/></svg>','🚗':'<svg class="gi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 16V11l2-5h10l2 5v5"/><path d="M3 16h18v3H3z"/><circle cx="7.5" cy="16" r="1.5"/><circle cx="16.5" cy="16" r="1.5"/></svg>','📈':'<svg class="gi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 20h18"/><path d="M5 16l5-5 3 3 6-7"/><path d="M15 7h4v4"/></svg>','💼':'<svg class="gi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/></svg>','🌳':'<svg class="gi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21v-6"/><path d="M7 15a5 5 0 1 1 3-9 4 4 0 0 1 7 3 4 4 0 0 1-1 6z"/></svg>','🎁':'<svg class="gi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="9" width="18" height="12" rx="1.5"/><path d="M12 9v12M3 13h18"/><path d="M12 9c-2-4-6-4-6-1 0 1 1 1 6 1zM12 9c2-4 6-4 6-1 0 1-1 1-6 1z"/></svg>','⭐':'<svg class="gi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/></svg>','🩺':'<svg class="gi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3v6a5 5 0 0 0 10 0V3"/><path d="M11 14v2a4 4 0 0 0 8 0v-2"/><circle cx="19" cy="12" r="2"/></svg>','🤝':'<svg class="gi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l4-4 5 3 5-3 4 4-9 8z"/><path d="M9 13l3 2 3-2"/></svg>'};
let _giT = 0; new MutationObserver(() => { if (_giT) return; _giT = requestAnimationFrame(() => { _giT = 0; const sc = document.getElementById('screen'); if (sc) goalIcons(sc); }); }).observe(document.documentElement, {childList:true, subtree:true});
function goalIcons(root){ root.querySelectorAll('.e, .ic, .ml-e, .lmt-e, .rk-e, .fa-e, .gs .e, .grow .hd .e, .em, .sv2-i, .ump-e, .f2e').forEach(el => { if (el.querySelector('svg')) return; const t = el.textContent.trim().replace(/\uFE0F/g, ''); const k = Object.keys(GICON).find(x => x.replace(/\uFE0F/g, '') === t); if (k) { el.innerHTML = GICON[k]; el.classList.add('gix'); } }); }
const brand2 = () => '<div class="brand brand2"><span class="logo" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M2.5 7l5.5-2.2 8 2.6 5.5-2.2v13.6L16 21l-8-2.6-5.5 2.2z" fill="#fff" fill-opacity=".22" stroke="#fff" stroke-opacity=".75" stroke-width="1.4" stroke-linejoin="round"/><path d="M8 4.8v13.6M16 7.4V21" stroke="#fff" stroke-opacity=".55" stroke-width="1.2"/><path d="M5 16.5c2.2-.2 2.6-3 5.6-3.4" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="1.6 2"/><path d="M14.5 1.8a4.7 4.7 0 0 1 4.7 4.7c0 3.4-4.7 7.6-4.7 7.6S9.8 9.9 9.8 6.5a4.7 4.7 0 0 1 4.7-4.7z" fill="#fff"/><circle cx="14.5" cy="6.5" r="1.8" fill="#079E98"/></svg></span><span class="bt"><b>Life<em>Map</em></b><small>by DigiPro.AI</small></span></div>';
const SVG_CHAT = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.4L3 21l2-5.3A8.4 8.4 0 1 1 21 11.5z"/></svg>';
const SVG_BELL = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/></svg>';
const SVG_SEARCH = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
function brandBar(back, right){ return '<div class="topbar">' + (back ? '<button class="backb" data-a="' + back + '">‹ Back</button>' : brand2()) + (right || '') + '</div>'; }
function hdrBar(back){ const attn = S.app ? checkItems().filter(x => x.st === 'look' && !S.ack[x.k]).length : 0;
  return '<div class="topbar hdr">' + (back ? '<button class="backb" data-a="' + back + '">‹ Back</button>' : brand2()) + '<div class="hdr-ic"><button class="icb hdr-ask" data-a="ask" aria-label="Ask: help and plain-English explanations">' + SVG_CHAT + '</button>' +
    (attn ? '<button class="icb" data-a="me" data-p="money" aria-label="' + attn + (attn === 1 ? ' detail needs' : ' details need') + ' a look">' + SVG_BELL + '<span class="badge" aria-hidden="true">' + attn + '</span></button>' : '') +
    '<button class="avb" data-a="sheet" data-p="profile" aria-label="Profile and privacy"><span class="ph" style="--ph:url(' + (S.acct.photo || '/media/profile-photo.jpg') + ')"></span></button></div></div>'; }
function homeHead(){ const t = dobToday(), DN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], MN = ['January','February','March','April','May','June','July','August','September','October','November','December'], h = new Date().getHours();
  const d = S.about.dob, age = d && dobFilled(d) && dobValid(d) ? ageTodayOf(d) : S.about.age, nm = S.acct.name;
  let stage = 'Getting started'; if (S.app){ const L = foundations(), k = L.findIndex(l => l.st !== 'ok'); stage = k < 0 ? 'Growing wealth' : ['Building foundations', 'Building foundations', 'Protecting your family', 'Securing your goals', 'Growing wealth'][k] || 'Growing wealth'; }
  return '<div class="eyebrow hdate"><i aria-hidden="true"></i>' + DN[t.getDay()] + ' · ' + t.getDate() + ' ' + MN[t.getMonth()] + '</div><h2 class="t" tabindex="-1">' + (h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening') + (nm ? ', ' + esc(nm) : '') + '</h2><p class="sub" style="margin:0">' + stage + (age ? ' · ' + age + ' years old' : '') + '</p>'; }
const homeHeadBar = () => hdrBar('');   // Home: only the icon bar stays pinned; the greeting scrolls with the content
function orbitSpin(wrap){ const os = [...wrap.querySelectorAll('.orbit .o')], R = 122, per = 40000, n = os.length;   // one turn every 40 s, positions set per frame (no counter-rotation drift)
  const place = deg => os.forEach((o, i) => { const a = (deg + i * 360 / n - 90) * Math.PI / 180; o.style.transform = 'translate3d(' + (R * Math.cos(a)).toFixed(2) + 'px,' + (R * Math.sin(a)).toFixed(2) + 'px,0)'; });
  place(0); if (RM()) return; const t0 = performance.now();
  const step = t => { if (!wrap.isConnected) return; place((t - t0) / per * 360); requestAnimationFrame(step); }; requestAnimationFrame(step); }
/* v39 card motion: tap ripple on quiz answers, pointer tilt on photo cards (off under reduced motion) */
document.addEventListener('pointerdown', e => { const o = e.target.closest && e.target.closest('#screen .qcenter .opt'); if (!o || RM()) return; const r = o.getBoundingClientRect(), sp = document.createElement('span'), d = Math.max(r.width, r.height) * 2.2;
  sp.className = 'ripple'; sp.style.cssText = 'width:' + d + 'px;height:' + d + 'px;left:' + (e.clientX - r.left - d / 2) + 'px;top:' + (e.clientY - r.top - d / 2) + 'px'; o.appendChild(sp); setTimeout(() => sp.remove(), 700);
  const box = o.parentElement; if (box) box.classList.add('picked'); });
document.addEventListener('pointermove', e => { if (RM()) return; const c = e.target.closest && e.target.closest('#screen .hcard,#screen .ecard,#screen .card.upnext'); if (!c) return; const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
  c.style.setProperty('--ry', (x * 10).toFixed(2) + 'deg'); c.style.setProperty('--rx', (-y * 8).toFixed(2) + 'deg'); c.classList.add('tilting'); });
document.addEventListener('pointerout', e => { const c = e.target.closest && e.target.closest('#screen .hcard,#screen .ecard,#screen .card.upnext'); if (c && !c.contains(e.relatedTarget)) { c.classList.remove('tilting'); c.style.removeProperty('--rx'); c.style.removeProperty('--ry'); } });
function countUp(root){ root.querySelectorAll('.tlv-big,.gauge b,.stiles b,.tlv-stats b,.wi-val,.hc-stats span').forEach(el => { const tn = [...el.childNodes].find(n => n.nodeType === 3 && /\d/.test(n.textContent)); if (!tn) return;
    const m = tn.textContent.match(/^(\D*)([\d.,]+)(.*)$/s); if (!m) return; const raw = m[2].replace(/,/g, ''), to = parseFloat(raw), dec = (raw.split('.')[1] || '').length; if (!isFinite(to) || to === 0 || (to > 1900 && to < 2200 && !dec)) return;   // years stay still
    const t0 = performance.now(), dur = 900, fmt = v => dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-IE');
    const step = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); tn.textContent = m[1] + fmt(to * e) + m[3]; if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); }); }
const askBar = () => '<button class="askbar" data-a="ask"><span class="ab-spark" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg></span><span class="ab-tx">Ask <b>Life Map</b> about your money…</span><span class="ab-mic" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg></span></button>';
/* photos for goals: the six built-in pictures (art slots + cover) */
const GIMG = {home:'art-mortgage', mfree:'art-mortgage', retire:'art-pension', legacy:'art-pension', wealth:'art-investing', edu:'art-edu', business:'art-investing', safety:'art-rain', family:'art-family', helpfam:'art-protection', wedding:'art-wedding', travel:'art-travel', car:'art-car', health:'art-protection'};
const gImg = g => 'var(--' + (GIMG[g.k] || 'art-everyday') + ')';
const eurK = v => v >= 1e6 ? '€' + (Math.round(v / 1e5) / 10).toLocaleString('en-IE') + 'm' : v >= 1000 ? '€' + Math.round(v / 1000) + 'k' : eur(v);
/* FP round 6: data precedence, everywhere: document > customer-typed > (nothing: Missing) (spec §15).
   A statement figure is never overwritten by a later manual entry: the entry is kept (S.man) and shown, and the statement value is used
   until the customer replaces or removes the statement. Corrections on "We read these values" are reading corrections: still the statement. */
const isDoc = k => !!S.src && S.src[k] === 'doc';
function setManual(k, v, src){ S.man = S.man || {}; const empty = v == null || v === '';
  if (isDoc(k)){ if (empty) delete S.man[k]; else S.man[k] = {v, src}; return false; }
  if (empty){ delete S.fin[k]; delete S.src[k]; } else { S.fin[k] = v; S.src[k] = src; } delete S.look[k]; return true; }
function setDoc(k, v, conf, fixed, from){ if (LISTKEY[k]) return listDoc(k, v, conf, fixed, from); S.man = S.man || {}; S.fix = S.fix || {}; S.docOf = S.docOf || {};
  if (!isDoc(k) && S.src[k] && S.fin[k] != null && S.fin[k] !== '') S.man[k] = {v:S.fin[k], src:S.src[k]};   // kept, so "Remove statement" can go back to it
  S.fin[k] = v; S.src[k] = 'doc'; if (conf != null && !fixed) S.conf[k] = conf; else delete S.conf[k]; if (fixed) S.fix[k] = true; else delete S.fix[k]; if (from) S.docOf[k] = from; }
function removeDoc(keys){ (keys || []).forEach(k => { if (LISTKEY[k]){ listRemoveDoc(k); return; } if (!isDoc(k)) return; const m = (S.man || {})[k];
  if (m){ S.fin[k] = m.v; S.src[k] = m.src; } else { delete S.fin[k]; delete S.src[k]; }
  delete S.conf[k]; delete S.look[k]; delete S.ack[k]; ['fix', 'man', 'docOf'].forEach(x => { if (S[x]) delete S[x][k]; }); }); }
function docNote(k){ const m = (S.man || {})[k]; if (!isDoc(k) || !m || String(m.v) === String(S.fin[k])) return '';
  const f = x => FF[k] && FF[k].type === 'eur' ? eur(+x) : esc(String(x));
  return 'You typed ' + f(m.v) + '. Your statement says ' + f(S.fin[k]) + '; we\'re using that.'; }
function tagFor(k){ const s = k === 'mortYN' ? (/^Own/.test(S.fin.home || '') ? S.src.home : S.src.mortYN) : S.src[k]; if (S.look[k] && !S.ack[k]) return '<span class="tag look">⚠️ Needs a look</span>';
  return s === 'doc' ? '<span class="tag doc">✅ ' + ((S.fix || {})[k] ? 'From your statement (corrected)' : 'From document' + (S.conf[k] ? ' · ' + S.conf[k] + '%' : '')) + '</span>' : s === 'typed' ? '<span class="tag typed">✏️ Your figure</span>' : s === 'pre' ? '<span class="tag pre">✏️ Your figure · from your answers</span>' : '<span class="tag none">❓ Missing</span>'; }
function fmtField(k){ const v = k === 'mortYN' ? mortYNval() : S.fin[k], d = FF[k]; if (v == null || v === '') return '—'; return d.type === 'eur' ? eur(+v) : String(v); }
const gById = id => S.goals.find(g => g.id === +id);
function statusWord(st){ return st === 'done' ? 'Done' : st === 'look' ? 'Needs a look' : st === 'part' ? 'In progress' : 'Not started'; }
function statIcon(st){ return '<span class="stat ' + (st === 'done' ? 'done' : st === 'look' ? 'look' : '') + '" aria-hidden="true">' + (st === 'done' ? '✓' : st === 'look' ? '!' : st === 'part' ? '…' : '') + '</span>'; }
function secSummary(sec){ const fs = sec.f.filter(fieldVisible).filter(k => srcOf(k) && S.fin[k] != null && S.fin[k] !== ''); if (!fs.length) return sec.id === 'about' ? 'Name, age, retirement age' : sec.id === 'prot' ? 'Yes or no for each · about 1 min' : 'Upload or type it · about 1 min'; return fs.slice(0, 3).map(k => FF[k].l.replace(/^Your /, '') + ': ' + fmtField(k)).join(' · '); }

/* ================= DISCOVER (quiz style) ================= */
const V = {};
V.D0 = () => ({id:'D0', note:'Cover (layout v21, 11 Oct 2026): calm, round. Brand, the map photo in a circle with five different real photos slowly orbiting (no labels, no repeats), headline, one line, one button.', kind:'quiz', html:
  '<div class="cover2 c3"><div class="qtop" style="min-height:40px"></div>' +
  '<div class="qbody c2body">' + brand2() +
  (() => { const G = [['art-mortgage','Buy a home'],['art-pension','Retire well'],['art-investing','Grow your wealth'],['art-savings','Build your savings'],['art-travel','Get where you\'re going']];   // v22: the centre cycles through life goals, in step with the orbit
    return '<div class="orbit-wrap ro live" aria-hidden="true"><svg class="oring" viewBox="0 0 300 300"><circle cx="150" cy="150" r="122"/></svg><div class="otrail"><i></i></div><div class="orbit">' + G.map((g, i) => '<span class="o" style="--a:' + (i * 72 - 90) + 'deg;--d:' + (i * 3) + 's"><i style="background-image:var(--' + g[0] + ')"></i></span>').join('') + '</div>' +
      '<span class="orbit-c" style="background-image:var(--cover-photo)">' + G.map((g, i) => '<i style="background-image:var(--' + g[0] + ');--d:' + (i * 3) + 's"></i>').join('') + '</span><span class="ocap">' + G.map((g, i) => '<b style="--d:' + (i * 3) + 's">' + g[1] + '</b>').join('') + '</span></div>'; })() +
  '<h2 tabindex="-1">The life you\'d like, mapped out.</h2><p class="cover-line">A life map that guides you, step by step.</p>' +
  '<button class="wbtn" data-a="go" data-p="D1">Let\'s start</button><p class="cover-under c3links"><button class="link" data-a="sheet" data-p="invite">I have an invite</button><span aria-hidden="true">·</span><button class="link" data-a="sheet" data-p="whyask">Why we ask</button></p></div></div>'});
V.D1 = () => ({id:'D1', note:'Optional, multi-select life-moment chips (MASTER B5; Pooja 1 Oct). They quietly reorder the suggested goal tiles. “Something else” opens an optional few-words field (max 60). One skippable screen.', kind:'quiz', html:
  '<div class="qtop"><button class="qx" data-a="go" data-p="D0" aria-label="Back">‹</button><span style="flex:1"></span></div><div class="qbody"><div class="qeye">Before we start</div><h2 tabindex="-1">What brings you to LifeMap?</h2><p class="qsub">Choose one or more goals that fit you. We\'ll build your plan around them.</p><div class="chips wgrid" role="group" aria-label="What brings you to LifeMap?">' +
  WHY.map(w => '<button class="chip wtile' + (S.why.includes(w.k) ? ' sel' : '') + '" aria-pressed="' + S.why.includes(w.k) + '" data-a="why" data-p="' + w.k + '"><span class="wem" aria-hidden="true">' + w.e + '</span><span class="wtx">' + esc(w.t) + '</span></button>').join('') + '</div>' +
  (S.why.includes('other') ? '<div class="field" style="margin:14px 0 0"><label for="why-note">Tell us in a few words <span class="small" style="font-weight:600">Optional</span></label><input class="in" id="why-note" data-whynote="1" maxlength="60" autocomplete="off" placeholder="e.g. Planning a move abroad" value="' + esc(S.whyNote) + '"></div>' : '') + '</div>' +
  '<div class="qfoot"><button class="qback" data-a="dstart">Skip for now</button><button class="wbtn" data-a="dstart"' + (S.why.length ? '' : ' disabled') + '>Continue</button></div>'});
/* v14: small illustrated scenes for the road question (motorway → Healy Pass), drawn in the app colours */
const ROAD_ART = [
  '<svg viewBox="0 0 56 56" width="56" height="56"><rect width="56" height="56" rx="16" fill="#E3F2F5"/><circle cx="43" cy="14" r="5" fill="#7DEBD8"/><path d="M0 34h56v22H0z" fill="#BFE3D6"/><path d="M22 34h12l10 22H12z" fill="#5B6B76"/><path d="M28 36v3M28 42v4M28 49v5" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>',
  '<svg viewBox="0 0 56 56" width="56" height="56"><rect width="56" height="56" rx="16" fill="#E3F2F5"/><path d="M0 32c12-6 24-6 36-2s16 2 20 0v26H0z" fill="#A9DCCB"/><path d="M30 56c-6-6 10-10 2-16s-6-8 0-10" fill="none" stroke="#6E7D86" stroke-width="5" stroke-linecap="round"/><path d="M30 56c-6-6 10-10 2-16s-6-8 0-10" fill="none" stroke="#fff" stroke-width="1" stroke-dasharray="2 3"/><circle cx="12" cy="30" r="6" fill="#2A7F8C"/><path d="M12 36v5" stroke="#1E3D47" stroke-width="2"/><circle cx="46" cy="30" r="5" fill="#3A8C99"/><path d="M46 35v4" stroke="#1E3D47" stroke-width="2"/></svg>',
  '<svg viewBox="0 0 56 56" width="56" height="56"><rect width="56" height="56" rx="16" fill="#EAFBF7"/><path d="M0 30c8-8 16-8 24 0s16 8 32-2v28H0z" fill="#9ED6C4"/><path d="M0 40c10-6 18-4 28 0s18 4 28-2v18H0z" fill="#6DBFA8"/><path d="M8 56c4-6 14-4 10-12s10-6 14-12 10-4 14-8" fill="none" stroke="#6E7D86" stroke-width="3.5" stroke-linecap="round"/><g fill="#B8C4CA"><circle cx="20" cy="49" r="1.4"/><circle cx="24" cy="47" r="1.4"/><circle cx="35" cy="38" r="1.4"/><circle cx="39" cy="35" r="1.4"/></g><circle cx="44" cy="13" r="4" fill="#08D9B8"/></svg>',
  '<svg viewBox="0 0 56 56" width="56" height="56"><rect width="56" height="56" rx="16" fill="#E8EEF4"/><path d="M0 50L16 18l10 14 8-20 22 38z" fill="#4A7F8C"/><path d="M16 18l4 8-4-2-3 4zM34 12l5 10-5-3-4 4z" fill="#fff"/><path d="M0 56V48l56 4v4z" fill="#8FC9B6"/><path d="M14 54l18-4-16-4 18-4-14-4 12-4" fill="none" stroke="#08D9B8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'];
function chapBar(){ return '<div class="chaps" aria-hidden="true">' + [1,2,3,4,5].map(c => { const qs = DISC6.filter(q => q.act === c), d = qs.filter(q => S.ans[q.id] != null).length; return '<i><b style="width:' + d / qs.length * 100 + '%"></b></i>'; }).join('') + '</div>'; }
V.DQ = () => { const q = DISC6[S.di], v = S.ans[q.id];
  let body = '';
  if (q.type === 'scenario') body += '<div class="panel"><div class="scn"><div><small>You put in</small><b>' + eur(q.from) + '</b></div><div style="text-align:right"><small>A month later</small><b style="color:var(--gap-t)">' + eur(q.to) + '</b></div></div><div class="pbar" style="margin-top:10px"><i style="width:85%;background:var(--sun)"></i></div></div>';
  const long = q.o.some(o => o.t.length > 30) || q.o.length === 5;
  body += '<div class="opts' + (long ? '' : ' two') + '" role="group" aria-label="Answers">' + q.o.map((o, k) => '<button class="opt' + (long ? ' row1' : '') + (v === k ? ' sel' : '') + '" aria-pressed="' + (v === k) + '" data-a="dpick" data-p="' + k + '">' + (q.type === 'ride' && ROAD_ART[k] ? '<span class="em road" aria-hidden="true">' + ROAD_ART[k] + '</span>' : '<span class="em" style="background:' + ['var(--sun-l)','var(--sky-l)','var(--sea-l)','var(--storm-l)','#FDE3DC'][k % 5] + '" aria-hidden="true">' + o.e + '</span>') + (long && q.type === 'ride' ? '<span class="rcol">' : '') + '<span class="tx">' + esc(o.t) + '</span>' + (o.tag ? '<span class="otag">◆ ' + esc(o.tag) + '</span>' : '') +
    (q.type === 'ride' ? '<svg width="100%" height="30" viewBox="0 0 140 50" preserveAspectRatio="none" aria-hidden="true"><path d="' + o.path + '" fill="none" stroke="var(--sea-d)" stroke-width="3" stroke-linecap="round"/></svg>' : '') + (long && q.type === 'ride' ? '</span>' : '') + '</button>').join('') + '</div>';
  return {id:'D' + (S.di + 2), note:'Discover question ' + (S.di + 1) + ' of 6 (DISC Q' + q.id + ', verbatim). One tap advances. Lifecast term shown as a tag on each answer (§12).', kind:'quiz', html:
    '<div class="qtop">' + chapBar() + '<button class="qx" data-a="go" data-p="D0" aria-label="Close and go to start">✕</button></div><div class="qbody qcenter"><div class="qmeta"><div class="qcount">Question <b>' + (S.di + 1) + ' of 6</b></div><div class="qeye">' + CHAPTERS[q.act] + '</div></div><div class="qart" aria-hidden="true" style="background-image:var(--' + ({1:'art-savings', 2:'art-investing', 3:'art-rain', 4:'art-map', 5:'art-pension'}[q.act] || 'art-savings') + ')"><i></i><i></i><i></i></div><h2 tabindex="-1">' + esc(q.q) + '</h2><p class="qsub">' + esc(q.sub) + '</p><p class="qtap">Tap an answer to continue</p>' + body + '</div>' +
    '<div class="qfoot"><button class="qback" data-a="dprev">← Back</button><span class="qhint"></span><button class="qback" data-a="dnext">Skip</button></div>'};
};
function stepper(a, p, value, label){ return '<div class="stepper" role="group" aria-label="' + esc(label) + '"><button data-a="' + a + '" data-p="' + p + '|-1" aria-label="Less">−</button><output aria-live="polite">' + value + '</output><button data-a="' + a + '" data-p="' + p + '|1" aria-label="More">+</button></div>'; }
V.DR = () => { if (!discEnough()){ const first = DISC6.findIndex(q => typeof S.ans[q.id] !== 'number');
    return {id:'DR', note:'Money personality needs at least 4 of the 6 Discover answers (CJ E10: no result from no answers).', kind:'quiz', html:
    '<div class="qtop"><button class="qx" data-a="dprev" aria-label="Back to the questions">‹</button><span class="dn-title">Your money personality</span><span style="width:44px"></span></div><div class="qbody dnot">' + (() => { const n = discCount(), need = Math.max(0, 4 - n), R = 52, C = 2 * Math.PI * R;
      return '<div class="dn-ring" aria-hidden="true"><svg width="132" height="132" viewBox="0 0 132 132"><defs><linearGradient id="dng" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#08D9B8"/><stop offset="1" stop-color="#0B5880"/></linearGradient></defs><circle cx="66" cy="66" r="' + R + '" fill="none" stroke="rgba(8,106,116,.1)" stroke-width="10"/><circle cx="66" cy="66" r="' + R + '" fill="none" stroke="url(#dng)" stroke-width="10" stroke-linecap="round" stroke-dasharray="' + C + '" stroke-dashoffset="' + C * (1 - n / 6) + '" transform="rotate(-90 66 66)" class="dn-arc"/><circle cx="' + (66 + R * Math.sin(2 * Math.PI * 4 / 6)) + '" cy="' + (66 - R * Math.cos(2 * Math.PI * 4 / 6)) + '" r="5" fill="#fff" stroke="#079E98" stroke-width="2.5"/></svg><span><b>' + n + '<small>/6</small></b><em>answered</em></span></div>' +
      '<h2 tabindex="-1">' + (need ? 'Just ' + need + ' more to go' : 'Almost there') + '</h2><p class="qsub">Under a minute to unlock your result.</p>' +
      '<div class="dn-dots" role="group" aria-label="Questions">' + DISC6.map((q, i) => { const done = typeof S.ans[q.id] === 'number'; return '<button class="dn-dot' + (done ? ' ok' : '') + '" data-a="dgoto" data-p="' + i + '" aria-label="Question ' + (i + 1) + (done ? ', answered' : ', not answered yet') + '">' + (done ? '✓' : i + 1) + '</button>'; }).join('') + '</div>' +
      '<div class="dn-tease" aria-hidden="true"><span>' + Object.values(TYPES).map(t => '<i>' + t.e + '</i>').join('') + '</span>Which one are you?</div>'; })() + '</div>' +
    '<div class="qfoot" style="flex-direction:column;align-items:stretch;gap:6px"><button class="wbtn" data-a="dgoto" data-p="' + first + '">Answer a few more</button><button class="qback" data-a="go" data-p="DS">Skip for now</button></div>'}; }
  const P = personality(), r = riskRead(false), t7 = ansTag('7'), t8 = ansTag('8');
  return {id:'DR', note:'Money-personality reveal (§12): type + the customer\'s own financial / behavioural terms with a plain meaning + risk appetite and cushion in words and terms + at most one hint (S1 K13–K17). CTA: make my plan.', kind:'quiz', html:
  '<div class="qtop dtop"><button class="dcirc" data-a="dprev" aria-label="Back to the questions">‹</button><span class="dtitle">Your money personality</span><span class="dcirc" aria-hidden="true" style="visibility:hidden"></span></div><div class="qbody dpage"><div class="dhero" aria-hidden="true" style="background-image:' + ({Achiever:'url(media/graduation.jpg)', Balancer:'url(media/savings-jar.jpg)', Contented:'url(media/retired-reading.jpg)'}[P.name] || 'var(--cover-photo)') + ';background-position:center 40%"></div>' +
  '<div class="panel dsheet drsheet"><div class="drmed" aria-hidden="true"><span class="drring"></span><span class="dremo">' + P.e + '</span>' + [0,1,2,3,4,5,6,7].map(i => '<i style="--k:' + i + '"></i>').join('') + '</div><div class="qeye">You are</div><h2 class="drname" tabindex="-1">' + P.name + '</h2><p class="qsub" style="margin:0;color:var(--ink)">' + P.strap + '</p>' +
  '<div class="drstr">' + P.str.map(x => '<span class="drchip"><b aria-hidden="true">✓</b>' + esc(x) + '</span>').join('') + '</div><p class="drwatch"><span aria-hidden="true">👀</span><span><b>One to watch:</b> ' + esc(P.watch) + '</span></p></div>' +
  '<div class="grid2 drstats"><div class="panel" style="margin:0"><span class="drsic" aria-hidden="true">🌦️</span><span class="small"><b>Risk appetite</b><br>how much risk you want</span><b style="display:block;font-size:19px;margin-top:4px">' + (r.comfort || '—') + '</b>' + (t8 && t8 !== r.comfort ? '<span class="small" style="color:var(--storm-t);font-weight:800">◆ ' + esc(t8) + '</span>' : '') + '</div><div class="panel" style="margin:0"><span class="drsic pe" aria-hidden="true">🛟</span><span class="small"><b>Cushion</b><br>money for surprises</span><b style="display:block;font-size:19px;margin-top:4px">' + (r.cushion || '—') + '</b>' + (cushionM().fig ? '<span class="small" style="display:block">' + cushionM().m + ' of ' + cushionM().T + ' months (your figures)</span>' : '') + (t7 ? '<span class="small" style="color:var(--storm-t);font-weight:800">◆ ' + esc(t7) + (cushionM().fig ? '' : ' (your answer)') + '</span>' : '') + '</div></div>' + (r.cushionNote ? '<p class="small" style="margin:8px 2px 0">' + esc(r.cushionNote) + '</p>' : '') +
  '<div class="panel" style="margin-top:12px"><div class="qeye">Your money terms</div><p class="small" style="margin:4px 0 0">The words an adviser would use, and what they mean for you.</p>' + termsHTML(true) + '</div>' +
  (r.mis ? '<div class="panel"><div class="qeye" style="color:var(--sea-d)">You might notice…</div><p style="margin:6px 0 0;font-size:15px;line-height:1.5">' + esc(r.mis) + '</p>' + (r.cushion && r.cushion !== 'In place' ? ((S.safetyWanted || (S.goals || []).some(g => g.k === 'safety')) ? '<p class="small" style="margin:8px 0 0;font-weight:700">✓ An Emergency fund is in your goals. It\'s optional: you can remove it in My Plan.</p>' : '<button class="btn ghost" data-a="addsafe" style="margin-top:10px">Add an Emergency fund goal</button>') : '') + '</div>' : '') +
  '<p class="disc">A first read from 6 answers, not advice. ' + DISC_FORMAL + '</p></div>' +
  '<div class="qfoot" style="flex-direction:column;align-items:stretch;gap:6px"><p class="fnote">Get a more accurate picture</p><button class="wbtn" data-a="drplan">Continue</button></div>'};
};
V.DS = () => ({id:'DS', note:'Save your results (§12, MASTER C8): email only, or Skip for now. No password, no money yet. Then straight into the main app.', kind:'quiz', html:
  '<div class="qtop"><button class="qx" data-a="go" data-p="DR" aria-label="Back">‹</button><span style="flex:1"></span></div><div class="qbody"><div class="medal msave" aria-hidden="true"><svg class="msvg" width="46" height="46" viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 36h20.5a8.5 8.5 0 0 0 1.4-16.9A12 12 0 0 0 13 21.5 7.3 7.3 0 0 0 14 36z" fill="rgba(255,255,255,.18)"/><path d="m18.5 27.5 4 4 8-8.5"/></svg></div><h2 tabindex="-1">Save your results</h2><p class="qsub">We\'ll email you a secure link so you can pick up where you left off.</p>' +
  (() => { const P = personality(); return P ? '<div class="ds-keep"><span class="ds-ke" aria-hidden="true">' + P.e + '</span><span class="ds-kt"><small>We\'ll save</small><b>' + P.name + ' · your 6 answers</b></span><span class="ds-ok" aria-hidden="true">✓</span></div>' : ''; })() +
  '<div class="ds-card"><div class="field"><label for="ds-email">Email</label><div class="ds-in"><span aria-hidden="true">✉️</span><input class="in" id="ds-email" placeholder="you@example.com" type="email" autocomplete="email" value="' + esc(S.save.email || S.acct.email) + '"></div><p id="dserr" class="small" style="color:var(--gap-t);margin:0;min-height:4px" role="alert"></p></div>' +
  '<label class="check"><input type="checkbox" id="ds-comms"' + (S.save.comms ? ' checked' : '') + '><span>Send me tips and reminders <em>(optional)</em></span></label></div>' +
  '<div class="ds-trust"><span><i aria-hidden="true">🔗</i>No password</span><span><i aria-hidden="true">🇪🇺</i>Stored in the EU</span><span><i aria-hidden="true">🔒</i>Never sold</span></div></div>' +
  '<div class="qfoot ds-foot"><button class="wbtn" data-a="dssave">Save my results</button><button class="qback" data-a="dsskip">Skip for now</button></div>'});

/* ================= DEFINE ================= */
function flowHead(n, eye, title, sub, back){ const pb = !S.app && S.shell && S.tab === 'plan', k = pbStep(); if (S.tab === 'explore' && S.after && back && /^go\|(B4|P1)$/.test(back)) back = back === 'go|B4' ? 'xback' : back; if (pb && /^Step /.test(eye)) eye = 'Step ' + k + ' of 8 · ' + PB[k - 1][1]; else if (!pb && /^Step /.test(eye)) eye = '';
  if (pb && !back) back = 'pbexit';   // no tab bar in the builder, so always offer a way out
  if (pb) return '<div class="pbrow"><button class="pbback" data-a="' + back + '" aria-label="Back">‹</button>' + pbBar() + '<span class="pbn" aria-hidden="true">' + k + '/8</span><button class="pbask" data-a="ask" aria-label="Ask: help and plain-English explanations">?</button></div><h2 class="t" tabindex="-1">' + title + '</h2>' + (sub ? '<p class="sub" style="margin:0">' + sub + '</p>' : '');   // v25: slim builder header
  return brandBar(back) + (pb ? pbBar() : '') + '<div class="eyebrow" style="margin-top:8px">' + eye + '</div><h2 class="t" tabindex="-1">' + title + '</h2>' + (sub ? '<p class="sub" style="margin:0">' + sub + '</p>' : ''); }
function saveBanner(){ return S.save.done ? '<div class="banner">✅ <span>Progress saved to ' + esc(S.save.email) + '</span></div>' : '<div class="banner sbn"><span class="sbn-i" aria-hidden="true">☁️</span><span>Want a break?</span><button class="link" data-a="sheet" data-p="save">Save and come back later</button></div>'; }
V.F1 = () => { let sug = SUGGEST(S.about.age).slice(); const wg = WHY.filter(w => S.why.includes(w.k)).flatMap(w => w.goals || []); sug = [...new Set(wg.concat(sug))];   // D1 answers first
  const order = sug.concat(GOALCAT.map(g => g.k).filter(k => !sug.includes(k))), have = k => S.goals.some(g => g.k === k);
  const n = S.goals.filter(g => g.kind !== 'retire').length;
  return {id:'F1', note:'Goal picker: DISC Q11 tiles + Wedding, Change the car, Health & care (LifeGoals 2.0 tile style), ordered by life stage. No limit. Retirement is an optional goal like any other (suggested first from 45, never pre-selected).', head:flowHead(2, 'Step 2 · Define', "What's next in your life story?", "Pick any. You'll place them on your timeline next.", 'go|B1'),
  html:saveBanner() + '<div class="eyebrow" style="margin:4px 0 8px">Suggested for you</div><div class="gtiles sug" role="group" aria-label="Suggested goals">' + order.slice(0, sug.length).map(k => goalTile(k)).join('') + '</div><div class="eyebrow" style="margin:18px 0 8px">More goals</div><div class="gtiles" role="group" aria-label="More goals">' + order.slice(sug.length).map(k => goalTile(k)).join('') + '</div>' +
    S.goals.filter(g => g.k === 'other').map(g => '<div class="pill mint" style="margin-top:10px">' + g.e + ' ' + esc(g.name) + '</div> ').join('') +
    (n > 6 ? '<p class="note" style="margin-top:12px">That\'s plenty. You can add more later.</p>' : ''),
  foot:'<button class="btn" data-a="go" data-p="F2">' + (S.goals.length ? 'Place ' + S.goals.length + ' goal' + (S.goals.length === 1 ? '' : 's') + ' on my timeline' : 'Place them on my timeline') + '</button>'};
};
/* Goal tile (LifeGoals 2.0 .goal-card): big emoji, name below, teal border + fill + tick when picked */
const noMort = () => !!S.fin.home && S.fin.home !== 'Own with mortgage';
function goalTile(k){ const c = GC(k), other = k === 'other', on = (!other && S.goals.some(g => g.k === k)) || (other && S.goals.some(g => g.k === 'other')), off = k === 'mfree' && noMort() && !on;
  return '<button class="gtile gph' + (on ? ' sel' : '') + (off ? ' off' : '') + (other ? ' noimg' : '') + '" aria-pressed="' + on + '" data-a="gpick" data-p="' + k + '"' + (off ? ' aria-disabled="true" title="Only if you have a mortgage"' : '') + (other ? '' : ' style="--gimg:var(--' + (GIMG[k] || 'art-everyday') + ')"') + '><span class="gt-img" aria-hidden="true"></span><span class="tick" aria-hidden="true">✓</span><span class="em" aria-hidden="true">' + c.e + '</span><span class="nm">' + esc(c.t) + (k === 'mfree' ? '<small class="ghint">' + (off ? 'Only if you have a mortgage' : 'Homeowners with a mortgage') + '</small>' : '') + '</span></button>'; }   // v42: photo tile
const ROT_SVG = '<svg width="30" height="30" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="10" y="3" width="12" height="20" rx="2.5"/><path d="M15 19.5h2"/><path d="M5 22a11 11 0 0 0 17 7"/><path d="M22 25.5v3.8h-3.8"/></svg>';
function tlBoard(){
  const a0 = S.about.age, gs = S.goals;
  return '<div class="tl-board"><div class="tl-head"><b>Your life by age</b><span class="rotchip" title="Turn your phone sideways for a bigger timeline">' + ROT_SVG + 'Turn sideways</span></div><div class="tl-track" id="tl" data-a0="' + a0 + '">' +   // v46: rotate hint is a small chip in the header (portrait phones only)
    gs.map(g => { const ret = g.kind === 'retire'; return '<div class="tl-chip' + (ret ? ' ret' : '') + (S.tlHl === g.id ? ' hl' : '') + '" data-g="' + g.id + '" title="' + esc(g.name) + '" tabindex="0" role="slider" aria-label="' + esc(g.name) + '" aria-valuemin="' + (a0 + 1) + '" aria-valuemax="' + (ret ? retMax() : 90) + '" aria-valuenow="' + g.age + '" aria-valuetext="' + esc(g.name) + ', age ' + g.age + ', ' + (YEAR0 + g.age - a0) + '">' + chipInner(g) + '</div>'; }).join('') +
    '</div><div class="tl-hint">↔ Drag a goal (or use the arrow keys) to change when it happens</div></div>';
}
/* Full goal name, wrapping to at most 2 lines (no truncation) */
function chipInner(g){ const n = g.age - S.about.age, nm = g.name;
  return g.kind === 'retire' ? '<span aria-hidden="true">🏁</span>Retire <span class="yr">' + (S.retireSet ? g.age : '?') + '</span>' : '<span aria-hidden="true">' + g.e + '</span><span class="nm">' + esc(nm) + '</span><span class="yr">' + (passedG(g) ? 'date passed' : 'in ' + n + ' yr' + (n === 1 ? '' : 's')) + '</span>'; }
function whenTxt(g, edit){ const n = g.age - S.about.age; if (g.kind === 'legacy') return 'At the end of your plan' + (asmMine('planEnd') ? ' (' + AS.end + ')' : ''); if (passedG(g)) return edit ? 'Age ' + g.age + ' · ' + (YEAR0 + n) + ' · ' + PASSED.toLowerCase() : PASSED; return (g.kind === 'retire' ? (S.retireSet ? 'Age ' + g.age : 'Age not chosen yet') : 'in ' + n + ' yr' + (n === 1 ? '' : 's') + ' · age ' + g.age) + ' · ' + (YEAR0 + n); }
function gRows(only){
  return (only || S.goals).slice().sort((a, b) => a.age - b.age).map(g => { const ret = g.kind === 'retire', open = S.tlOpen[g.id];
    return '<div class="grow' + (S.tlHl === g.id ? ' hl' : '') + '" id="row-' + g.id + '"><div class="hd"><span class="e" aria-hidden="true">' + g.e + '</span><input value="' + esc(g.name) + '" data-gname="' + g.id + '" aria-label="Goal name"' + (ret ? ' readonly' : '') + '>' + (ret ? '' : '<button class="gdel2" data-a="gdel" data-p="' + g.id + '" aria-label="Remove ' + esc(g.name) + '" title="Remove"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg></button>') + '</div>' +
      '<div class="flds"><div class="full"><span class="fl">' + (ret ? 'Retire at' : 'When') + '</span>' + stepper('gyr', g.id, '<span id="when-' + g.id + '">' + whenTxt(g, true) + '</span>', 'When') + '</div>' +
      '<label><span class="fl">' + (ret ? 'Income a year €' : g.kind === 'mfree' ? 'Mortgage left €' : 'Amount €') + '</span><input class="in" inputmode="numeric" value="' + Math.round(g.amount) + '" data-gamt="' + g.id + '"></label>' +
      (ret ? '<div><span class="fl">Pension</span><span class="small">From Your finances</span></div>' : '<label><span class="fl">Saved so far €</span><input class="in" inputmode="numeric" value="' + Math.round(g.saved || 0) + '" data-gsaved="' + g.id + '"></label>') +
      (g.k === 'safety' ? '<label class="full"><span class="fl">Months of essential spending to keep</span><input class="in" inputmode="numeric" value="' + (asmMine('safetyMonths') ? asmGet('safetyMonths') : '') + '" data-gmonths="' + g.id + '" placeholder="e.g. ' + ASM.safetyMonths.sug() + '">' + safeNote(g) + '</label>' : '') + '</div>' +
      '<div class="gr-foot"><span class="gr-tm">Today\'s money' + (g.kind === 'mfree' && S.fin.mortBal ? ' · from your Liabilities' : '') + '</span>' +
      (ret ? '</div>' : '<button class="gr-more" data-a="gmore" data-p="' + g.id + '" aria-expanded="' + !!open + '">' + (open ? 'Fewer details ↑' : 'More details ↓') + '</button></div>' + (open ? '<div class="more">' + [['who','For whom',['Me','Partner','Child','Family']],['flex','Flexible on timing?',['Can move','Fixed date']]].map(([k, l, os]) => '<div class="fl" style="margin-top:6px">' + l + '</div><div class="chips">' + os.map(o => '<button class="chip sm' + (g[k] === o ? ' sel' : '') + '" aria-pressed="' + (g[k] === o) + '" data-a="gset" data-p="' + g.id + '|' + k + '|' + o + '">' + o + '</button>').join('') + '</div>').join('') + '</div>' : '')) + '</div>'; }).join('');
}
V.F2 = () => ({id:'F2', note:'Timeline: drag chips (touch, mouse, keyboard), snap to years, lanes never overlap. Retirement flag = retirement age everywhere. Rows below are optional edits.', head:flowHead(2, 'Step 2 · Define', 'Your timeline', "Drag each goal to when you'd like it. Rough is fine. You can change anything later.", 'go|F1'),
  html:saveBanner() + tlBoard() + '<div class="sec"><h3>Your goals</h3><button class="link" data-a="go" data-p="F1">＋ Add a goal</button></div>' + gRows(),
  foot:'<button class="btn" data-a="f2next">Next</button>'});
V.F4 = () => { const ok = S.goals.some(g => g.age && g.amount > 0);
  return {id:'F4', note:'Confirm my LifeMap: recap, and "Which goal first?" ranking (journey-spec §19.8; Emergency fund first by default). Needs ≥1 goal with a when and an amount.', head:flowHead(2, 'Step 2 · Define', 'Your LifeMap', 'A quick check before we add your money.', 'go|F2'),
  html:'<div class="card lmrec"><h3 class="h">Your goals</h3><ol class="lmt">' + S.goals.slice().sort((a, b) => a.age - b.age).map(g => '<li><span class="lmt-e" aria-hidden="true">' + g.e + '</span><span class="lmt-m"><b>' + esc(g.name) + '</b><small>' + whenTxt(g) + '</small>' + dateBtn(g) + '</span><span class="lmt-v">' + eur(g.amount) + (g.kind === 'retire' ? '<small>a year</small>' : '') + '</span></li>').join('') + '</ol></div>' + rankHTML('f4') +
    (ok ? '' : '<p class="note" style="margin-top:12px">Add an amount to at least one goal.</p>') + '<p class="disc">Next: your money profile, a few quick questions about risk.</p>',
  foot:'<button class="btn" data-a="f4ok"' + (ok ? '' : ' disabled') + '>This looks right</button>'};
};

/* ================= PREPARE: account ================= */
V.P1 = () => { const a = S.acct, okMail = /.+@.+\..+/.test(a.email), okMob = a.mobile.replace(/\D/g, '').length >= 9, can = a.name.trim() && okMail && okMob && a.c1;
  return {id:'P1', note:'Account creation once, before Your finances. Consents start UNTICKED (CBI 2025).', head:flowHead(3, 'Step 3 · Prepare', 'Secure your account', 'Before you add any money figures, we check your email and mobile once.' + (S.save.done ? ' Your email is filled in from when you saved your results.' : ''), signed() ? 'go|B4' : 'go|DS'),
  html:'<div class="card"><div class="field"><label for="a-name">First name</label><input class="in" id="a-name" data-acct="name" autocomplete="given-name" value="' + esc(a.name) + '"></div>' +
    '<div class="field"><label for="a-email">Email</label><input class="in" id="a-email" type="email" data-acct="email" autocomplete="email" value="' + esc(a.email) + '">' + (a.email && !okMail ? '<span class="small" style="color:var(--gap-t)">Check your email address</span>' : '') + '</div>' +
    '<div class="field" style="margin:0"><label for="a-mob">Mobile</label><input class="in" id="a-mob" type="tel" data-acct="mobile" autocomplete="tel" placeholder="08x xxx xxxx" value="' + esc(a.mobile) + '"></div></div>' +
    '<div class="card"><label class="check"><input type="checkbox" data-acct="c1"' + (a.c1 ? ' checked' : '') + '><span><b>Required:</b> Use my details to build my plan</span></label><label class="check"><input type="checkbox" data-acct="c2"' + (a.c2 ? ' checked' : '') + '><span>Optional: Send me reminders and updates</span></label>' +
    '<p class="small" style="margin:6px 0 0">Stored in the EU · never sold · nothing shared with an adviser unless you choose · delete everything any time.</p><button class="link" data-a="sheet" data-p="money">How LifeMap makes money</button></div>',
  foot:'<button class="btn" data-a="sendotp" id="acctgo"' + (can ? '' : ' disabled') + '>Send my email code</button>'};
};
function codeScreen(id, what, to, nextA){ return {id, note:'Email code, checked by the API.', head:flowHead(3, 'Step 3 · Prepare', 'Check your ' + what, 'We sent a 6-digit code to <b>' + esc(to) + '</b>.', 'go|' + (id === 'P1E' ? 'P1' : 'P1E')),
  html:'<div class="card"><div class="codebox" role="group" aria-label="6-digit code">' + [0,1,2,3,4,5].map(i => '<input inputmode="numeric" maxlength="1" data-code="' + i + '" aria-label="Digit ' + (i + 1) + '">').join('') + '</div><p id="codeerr" class="small" style="color:var(--gap-t);min-height:18px" role="alert"></p><button class="link" data-a="resend">Send a new code</button></div>',
  foot:'<button class="btn" data-a="' + nextA + '">Verify</button>'}; }
V.P1E = () => codeScreen('P1E', 'email', S.acct.email || 'your email', 'vemail');
V.P1K = () => ({id:'P1K', note:'Passkey / Face ID offered as an extra after verification.', head:flowHead(3, 'Step 3 · Prepare', "You're verified ✓", 'Want a faster, safer way to sign in next time?', ''),
  html:'<div class="card" style="text-align:center"><div style="font-size:52px" aria-hidden="true">🔐</div><b style="font-size:17px">Use Face ID or a passkey</b><p class="small">No password to remember. You can still use email codes.</p></div>',
  foot:'<button class="btn" data-a="passkey" data-p="1">Add Face ID / passkey</button><button class="btn ghost" data-a="passkey" data-p="0">Not now</button>'});

/* ================= PREPARE: finances ================= */
V.P2 = () => { const done = FSEC.filter(s => secStatus(s) === 'done').length;
  return {id:'P2', note:'Your finances hub: 6 sections, each Upload or Type it. One smart upload at the top. Minimum = About you + Income + Assets or Pension.', head:flowHead(3, 'Step 3 · Prepare', 'Your finances', 'Add your money once. Rough figures are fine.', S.app ? 'meback' : ''),
  html:'<div class="card row" style="background:var(--sea-l)"><span style="font-size:30px" aria-hidden="true">📥</span><div style="flex:1"><b>Add any documents</b><div class="small" style="color:var(--ink)">We\'ll sort them into the right sections. You check what we read.</div></div><button class="btn sm" data-a="upl" data-p="smart">Upload</button></div>' +
    '<div class="row" style="margin:16px 0 8px;justify-content:space-between"><b>' + done + ' of 6 done</b><span class="small">Skip any you like</span></div>' +
    FSEC.map((s, i) => { const st = secStatus(s); return '<button class="goal" data-a="fsec" data-p="' + i + '"><span class="ic" aria-hidden="true">' + s.e + '</span><span style="flex:1;min-width:0"><b>' + s.t + '</b><br><span class="small">' + esc(secSummary(s)) + '</span></span><span class="sr">' + statusWord(st) + '</span>' + statIcon(st) + '</button>'; }).join('') +
    (S.missingDocs && S.missingDocs.length ? '<p class="note">Still to add: ' + S.missingDocs.map(esc).join(', ') + '</p>' : '') +
    (minOK() ? '' : '<p class="small" style="margin-top:6px">To see results we need: <b>About you</b>, <b>Income and expenses</b>, and <b>Assets</b> or <b>Pension</b>.</p>'),
  foot:S.app ? '' : '<button class="btn" data-a="go" data-p="P4"' + (minOK() ? '' : ' disabled') + '>Check my details</button>'};
};
function fieldHTML(k){ const d = FF[k], v = k === 'mortYN' ? mortYNval() : S.fin[k];
  const id = 'f-' + k, lab = '<label for="' + id + '">' + esc(d.l) + ' <span id="tag-' + k + '">' + tagFor(k) + '</span></label>';
  let inp = '';
  if (d.type === 'choice' || d.type === 'ynn'){ const os = d.o || ['Yes','No','Not sure'];
    return '<div class="field"><span class="flabel">' + esc(d.l) + ' <span id="tag-' + k + '">' + tagFor(k) + '</span></span><div class="chips" role="group" aria-label="' + esc(d.l) + '">' + os.map(o => '<button class="chip sm' + (v === o ? ' sel' : '') + '" aria-pressed="' + (v === o) + '" data-a="fchoice" data-p="' + k + '|' + o + '">' + esc(o) + '</button>').join('') + '</div>' + (docNote(k) ? '<span class="small" style="display:block;color:var(--acc-d)" role="status">' + docNote(k) + '</span>' : '') + (EXAMPLES[k] ? '<div class="fhelp"><button class="link" data-a="fex" data-p="' + k + '" aria-haspopup="dialog">Not sure? See an example</button></div>' : '') + '</div>'; }
  if (d.type === 'text') inp = '<input class="in" id="' + id + '" data-fin="' + k + '" value="' + esc(v || '') + '">';
  else inp = '<div class="inw">' + (d.type === 'eur' ? '<span class="cur" aria-hidden="true">€</span>' : '') + '<input class="in' + (d.type === 'eur' ? ' eur' : d.type === 'pct' ? ' pct' : '') + '" id="' + id + '" inputmode="' + (d.type === 'pct' ? 'decimal' : 'numeric') + '" data-fin="' + k + '" value="' + (v == null ? '' : d.type === 'pct' ? v : Math.round(+v)) + '"' + (d.hint ? ' aria-describedby="h-' + k + '"' : '') + '>' + (d.type === 'pct' ? '<span class="cur suf" aria-hidden="true">%</span>' : '') + '</div>';
  return '<div class="field">' + lab + inp + '<span class="small dnote" id="dn-' + k + '" role="status" style="display:block;color:var(--acc-d)">' + docNote(k) + '</span>' + (d.hint ? '<span class="small" id="h-' + k + '">' + esc(d.hint) + '</span>' : '') + (workedNote(k) ? '<span class="small" id="wo-' + k + '" style="display:block;color:var(--sea-d)">' + esc(workedNote(k)) + '</span>' : '') + (d.type === 'text' || !EXAMPLES[k] ? '' : '<div class="fhelp"><button class="link" data-a="fex" data-p="' + k + '" aria-haspopup="dialog">Not sure? See an example</button></div>') + '</div>';
}
/* Partner: two choices side by side (Pooja Q4). Same state in Your finances and the Me tab, so it is never asked twice. */
function partnerBlock(noMoney){ const pt = S.partner, m = pt.mode;
  let h = '<div class="pchoice" role="group" aria-label="How to add your partner">' + [['invite','💌','Invite my partner','They add their own details, privately'],['manual','✍️','Add their details myself',noMoney ? 'Name and age' : 'Name, age and income (optional)']].map(([k, e, t, d]) => '<button class="ptile' + (m === k ? ' sel' : '') + '" aria-pressed="' + (m === k) + '" data-a="pmode" data-p="' + k + '"><span class="em" aria-hidden="true">' + e + '</span><b>' + t + '</b><span class="small">' + d + '</span></button>').join('') + '</div>';
  if (m === 'invite') h += pt.sent ? '<div class="card" style="background:var(--ok-l);box-shadow:none;margin-top:12px"><b>💌 Invite sent to ' + esc(pt.email) + '</b><p class="small" style="color:var(--ink);margin:4px 0 0">They get a secure link to add their own details. You only see what they choose to share.</p><div class="row" style="gap:16px"><button class="link" data-a="presend">Resend</button><button class="link" data-a="pcancel">Cancel invite</button></div></div>'
    : '<div class="field" style="margin:12px 0 0"><label for="p-email">Their email</label><input class="in" id="p-email" type="email" autocomplete="off" data-partner="email" value="' + esc(pt.email) + '"><p id="perr" class="small" style="color:var(--gap-t);margin:0;min-height:4px" role="alert"></p><button class="btn sm" style="width:100%;margin-top:6px" data-a="pinvite">Send invite</button></div>';
  if (m === 'manual') h += '<div style="margin-top:12px"><div class="field"><label for="p-name">Their first name</label><input class="in" id="p-name" data-partner="name" autocomplete="off" value="' + esc(pt.name) + '"></div>' +
    dobField('partner') +
    (noMoney ? '<p class="small" style="margin:0">You can add their income later, in Your finances.</p></div>' : '<div class="field" style="margin:0"><label for="f-pIncome">Their gross yearly income <span class="small" style="font-weight:600">Optional</span></label><div class="inw"><span class="cur" aria-hidden="true">€</span><input class="in eur" id="f-pIncome" inputmode="numeric" data-fin="pIncome" value="' + (S.fin.pIncome == null ? '' : Math.round(S.fin.pIncome)) + '"></div><span class="small">Before tax. Leave it blank and we\'ll ask in Income.</span></div></div>');
  if (!m) h += '<p class="small" style="margin:10px 0 0">Pick one. You can change it later in <b>Me</b>.</p>';
  return h; }
V.P3 = () => { const sec = FSEC[S.fsec], mode = sec.docs.length ? (S.fmode[sec.id] || 'type') : 'type';
  const nDoc = sec.id === 'prot' ? 0 : sec.f.filter(k => isDoc(k)).length, docBar = nDoc ? '<div class="card" id="docbar" style="background:var(--ok-l);box-shadow:none"><b>📄 ' + nDoc + ' figure' + (nDoc > 1 ? 's' : '') + ' from your statement</b><p class="small" style="margin:4px 0 6px;color:var(--ink)">Statement figures are used ahead of anything typed. To use your own figures instead, remove the statement.</p><div class="row" style="gap:16px"><button class="link" data-a="docrep" data-p="' + S.fsec + '">Replace statement</button><button class="link" data-a="docrem" data-p="' + S.fsec + '">Remove statement</button></div></div>' : '';
  const fl = sec.f.filter(fieldVisible).filter(k => !(sec.id === 'about' && k === 'pAge')).filter(k => !FF[k].list), lead = sec.id === 'liab' ? '<b style="font-size:16px">🏠 Mortgage</b><p class="small" style="margin:2px 0 10px">The mortgage on the home you live in comes first.' + (S.fin.home && !own() && S.fin.mortYN === 'Yes' ? ' You said "' + esc(S.fin.home) + '", so this one is on another property. Add its details below.' : '') + '</p>' : sec.id === 'prot' ? '<p style="margin:0 0 10px"><b>Do you have any of the following?</b></p><p class="small" style="margin:-4px 0 12px">Say Yes to add the details, and a policy if you like. Add more than one of each if you have them.</p>' : '';
  const body = mode === 'upload' ? uploadPick(sec) : docBar + (sec.id === 'pension' ? listBlock('pens') : '') + (fl.length ? '<div class="card">' + lead + fl.map(k => fieldHTML(k) + (LDEF[k] && LDEF[k].pol ? policyBlock(k) : '')).join('') : '') +
    (sec.id === 'income' && S.about.partner && S.partner.mode === 'invite' ? '<p class="note">💌 Your partner adds their own income' + (S.partner.sent ? ' (invite sent to ' + esc(S.partner.email) + ')' : '') + '. Until then it counts as €0 in your plan.</p>' : '') + (sec.id === 'liab' && mort() ? '<button class="link" data-a="upl" data-p="liab">📄 Upload your mortgage statement (optional)</button>' : '') + (fl.length ? '</div>' : '') + (sec.id === 'liab' ? '<div style="height:12px"></div>' + listBlock('mort2') + listBlock('cards') + listBlock('loans') : '') +
    (sec.id === 'about' ? '<div class="card"><div class="field"><span class="flabel">Planning with a partner? <span class="tag pre">From your answers</span></span><div class="seg" role="group" style="margin:0" aria-label="Planning with a partner">' + ['Yes','No'].map(x => { const on = (x === 'Yes') === !!S.about.partner; return '<button class="' + (on ? 'on' : '') + '" aria-pressed="' + on + '" data-a="partner" data-p="' + x + '">' + x + '</button>'; }).join('') + '</div></div>' +
      '<div class="field" style="margin:0"><span class="flabel">Children or others who rely on you <span class="tag pre">From your answers</span></span><div class="seg" role="group" style="margin:0" aria-label="Dependants">' + ['0','1','2','3+'].map((x, k) => '<button class="' + (S.about.deps === k ? 'on' : '') + '" aria-pressed="' + (S.about.deps === k) + '" data-a="deps" data-p="' + k + '">' + x + '</button>').join('') + '</div></div>' +
      (S.about.partner ? '<div style="border-top:1px dashed var(--line);margin-top:14px;padding-top:12px"><b>Your partner</b>' + partnerBlock() + '</div>' : '') + credChips() + '</div>' : '');
  const blankNote = sec.id === 'about' ? '' : '<p class="small" style="margin:0 2px 10px">Skip anything you don\'t have. It counts as €0.</p>';
  return {id:'P3-' + (S.fsec + 1), note:'Section ' + (S.fsec + 1) + ' of 6 · ' + sec.t + '. Upload vs Type it; every field has "Not sure? See an example" (§15), which never fills the field.', head:flowHead(3, 'Your finances · ' + (S.fsec + 1) + ' of 6', sec.e + ' ' + sec.t, sec.id === 'about' ? 'Mostly filled in from your answers. Just check it.' : sec.id === 'prot' ? 'Say Yes or No for each type. Add the details if you like.' : 'Upload a document or type it in. Round figures are fine.', 'fback'),
  html:(sec.docs.length ? '<div class="seg" role="group" aria-label="How to add">' + [['upload','📄 Upload'],['type','⌨️ Type it']].map(([m, l]) => '<button class="' + (mode === m ? 'on' : '') + '" aria-pressed="' + (mode === m) + '" data-a="fmode" data-p="' + m + '">' + l + '</button>').join('') + '</div>' : '<p class="small">' + (sec.id === 'prot' ? 'Add a policy under each type if you like. No other documents needed.' : 'No documents needed here. ID and proof of address are handled by your adviser later.') + '</p>') + blankNote + body,
  foot:'<button class="btn" data-a="fsave">Save this section</button>'};
};
function uploadPick(sec){ return '<div class="card"><b>What we can read</b><div class="upl" style="margin-top:10px">' + sec.docs.map(d => '<div class="tile"><span class="e" aria-hidden="true">' + d[0] + '</span>' + esc(d[1]) + '</div>').join('') + '</div>' +
  '<div style="display:grid;gap:10px;margin-top:14px"><label class="btn ghost" style="cursor:pointer">📄 Choose files<input type="file" multiple class="sr" data-file="' + sec.id + '" accept=".pdf,.jpg,.jpeg,.png,.heic"></label><button class="btn" data-a="upl" data-p="' + sec.id + '">Use a sample document</button></div>' +
  '<p class="small" style="margin-top:10px">Documents are read automatically and deleted after reading. You see every figure before it\'s used.</p><button class="link" data-a="fmode" data-p="type">Upload not working? Type it instead</button></div>'; }
V.PU = () => { const u = S.upl, sm = u.sec === 'smart';
  if (u.stage === 'scan') return {id:'PU-scan', note:'Reading documents (mock IDP).', head:flowHead(3, 'Your finances', 'Reading your documents…', esc(u.files.join(', ')), ''), html:'<div class="scan" aria-hidden="true">📄</div><p class="sub" style="text-align:center;margin-top:14px" role="status">Finding the figures we need</p>'};
  if (u.stage === 'fail') return {id:'PU-fail', note:'Upload failed → Type it; missing doc stays on the checklist (CJ D10).', head:flowHead(3, 'Your finances', "We couldn't read that one", 'No problem. You can type the figures instead. We\'ll keep the document on your checklist.', 'uplx'),
    html:'<div class="card" style="text-align:center"><div style="font-size:44px" aria-hidden="true">📄❓</div><p class="small">' + esc(u.files.join(', ')) + '</p></div>', foot:'<button class="btn" data-a="uplfail">Type it instead</button>'};
  if (u.item){ const lk = u.item.lk, T = ITEMDOC[lk];
    return {id:'PU-confirm', note:'"We read these values, please confirm" for ONE ' + LDEF[lk].one + ' (journey-spec §19). Under 80% confidence = Check this.', head:flowHead(3, 'Your finances', 'We read these values', 'Please confirm. Change anything that looks wrong.', 'uplx'),
      html:'<div class="card"><b>' + esc(T.title) + '</b>' + T.f.map(([fld, v, c]) => '<div class="mini" style="align-items:center"><span style="flex:1"><b style="font-size:14px">' + esc(FFI[lk + '.' + fld].l) + '</b><br>' + (c < 80 ? '<span class="tag look">⚠️ Check this · ' + c + '% sure</span>' : '<span class="tag doc">✓ ' + c + '% sure</span>') + '</span><input class="in" style="width:120px;min-height:42px" inputmode="numeric" data-uv="' + fld + '" value="' + (u.edit[fld] != null ? u.edit[fld] : v) + '" aria-label="' + esc(FFI[lk + '.' + fld].l) + '"></div>').join('') + (T.txt || []).map(([fld, v]) => '<div class="mini"><span><b style="font-size:14px">' + esc(FFI[lk + '.' + fld].l.replace(' (optional)', '')) + '</b></span><b>' + esc(v) + '</b></div>').join('') + '</div>',
      foot:'<button class="btn" data-a="uplok">Looks right, add them</button><button class="btn ghost" data-a="uplx">Cancel</button>'}; }
  const secs = sm ? ['income','assets','liab','pension'] : [u.sec];
  return {id:'PU-confirm', note:'"We read these values — please confirm". Under 80% confidence = Check this.', head:flowHead(3, 'Your finances', 'We read these values', 'Please confirm. Change anything that looks wrong.', 'uplx'),
    html:secs.map(sid => { const U = UPL[sid], sec = FSEC.find(s => s.id === sid); return '<div class="card"><b>' + sec.e + ' ' + sec.t + '</b><div class="small">' + U.docs.map(esc).join(' · ') + '</div>' +
      Object.entries(U.v).map(([k, [v, c]]) => '<div class="mini" style="align-items:center"><span style="flex:1"><b style="font-size:14px">' + esc(FF[k].l) + '</b><br>' + (c < 80 ? '<span class="tag look">⚠️ Check this · ' + c + '% sure</span>' : '<span class="tag doc">✓ ' + c + '% sure</span>') + (U.old && U.old[k] ? ' <span class="tag est">' + U.old[k] + '</span>' : '') + '</span>' +
        (typeof v === 'number' ? '<input class="in" style="width:120px;min-height:42px" inputmode="numeric" data-uv="' + k + '" value="' + (u.edit[k] != null ? u.edit[k] : v) + '" aria-label="' + esc(FF[k].l) + '">' : '<b>' + esc(v) + '</b>') + '</div>').join('') + '</div>'; }).join(''),
    foot:'<button class="btn" data-a="uplok">Looks right, add them</button><button class="btn ghost" data-a="uplx">Cancel</button>'};
};
const PAY_LOW = 'This repayment barely covers the interest, so the balance would take many years to clear. Check it, or pay a bit more';
// M8: a card or loan repayment under the interest plus 1% of the balance a month (only when the rate is known: typed or chosen)
function payLowFlag(bal, pay, rate){ return bal > 0 && pay > 0 && rate > 0 && pay < bal * (rate / 12 + 0.01); }
const MORT_LOW = "This repayment wouldn't clear the mortgage in the years left";
function checkItems(){ const out = [], fN = finNums();
  [['cardPayM', 'cardBal', 'cardRate'], ['loanPayM', 'loanBal', 'loanRate']].forEach(([pk, bk, rk]) => { const r = finN(rk) > 0 ? finN(rk) / 100 : asmMine(rk) ? +asmGet(rk) : 0, low = payLowFlag(finN(bk), finN(pk), r); if (low && !S.look[pk]) S.look[pk] = PAY_LOW; else if (!low && S.look[pk] === PAY_LOW) delete S.look[pk]; });
  if (fN.mortPayLow && !S.look.mortPayM) S.look.mortPayM = MORT_LOW; else if (!fN.mortPayLow && S.look.mortPayM === MORT_LOW) delete S.look.mortPayM; /* FP round 4 F4 */ FSEC.forEach(s => s.f.filter(fieldVisible).filter(k => k !== 'retireAge').forEach(k => { const src = srcOf(k), look = S.look[k];
  const st = look ? 'look' : !src ? (FF[k].opt ? null : 'miss') : src === 'doc' ? 'ok' : 'typed'; if (st) out.push({k, s, st}); })); return out; }
V.P4 = () => { const it = checkItems(), flag = it.filter(x => ['look','miss'].includes(x.st)), good = it.filter(x => !['look','miss'].includes(x.st));
  const ic = {look:'⚠️', miss:'❓'}, lb = {look:'Needs a look', miss:'Missing · optional, counts as €0'}, ASSUMED_NOTE = {mortRate:'Assumed: add yours · we use the Central Bank average rate', cardRate:'Assumed: add yours · we use a planning rate of ' + pcs(AS.cardRate), loanRate:'Assumed: add yours · we use the Central Bank average rate', mort2:'Assumed: add yours · we use 25 years', mortYears:'Assumed: add yours · we use 25 years', pAge:'Assumed: add yours · we use your age', work:'Assumed: add yours · we use Employed'}, lbl = x => x.st === 'miss' && ASSUMED_NOTE[x.k] ? ASSUMED_NOTE[x.k] : lb[x.st];
  // #21: a skipped section (nothing entered at all) is one row, not one row per field
  const skipped = skippedSecs();
  const one = flag.filter(x => !skipped.includes(x.s));
  const secRow = sec => { const ks = sec.f.filter(fieldVisible).filter(k => !FF[k].opt), left = ks.every(k => S.ack[k]);
    return '<div class="ck"><span class="i" aria-hidden="true">❓</span><div style="flex:1"><b>' + sec.e + ' ' + sec.t + '</b> <span class="small">· skipped</span><div class="small">' + (sec.id === 'prot' ? 'Not added yet' : 'Not added yet, so it counts as €0 for now') + (left ? ' · <b>Left for my adviser</b>' : '') + '</div>' +
      '<div class="a"><button class="link" data-a="fix" data-p="' + FSEC.indexOf(sec) + '">Add now</button>' + (left ? '' : '<button class="link" data-a="acksec" data-p="' + sec.id + '">Leave for my adviser</button>') + '</div></div></div>'; };
  return {id:'P4', note:'Data-gap review: one row per skipped section; single rows only for ❓ / ⚠️ items in partly filled sections. Step 7 is skippable (§22): choose 3 things, optional standards for the rest, then See my results or Skip.', head:flowHead(3, 'Step 3 · Prepare', 'Check your details', flag.length ? 'Only the items worth a second look are shown.' : 'Everything looks complete.', 'go|P2'),
  html:p4Asm() + (flag.length ? '<div class="card" style="margin-top:12px">' + skipped.map(secRow).join('') + one.map(x => '<div class="ck"><span class="i" aria-hidden="true">' + ic[x.st] + '</span><div style="flex:1"><b>' + esc(FF[x.k].l) + '</b> <span class="small">· ' + x.s.t + '</span><div class="small">' + lbl(x) + (x.st === 'look' ? ': ' + esc(S.look[x.k]) : '') + (workedNote(x.k) ? '. ' + esc(workedNote(x.k)) : '') + (S.ack[x.k] ? ' · <b>Left for my adviser</b>' : '') + '</div>' +
      '<div class="a"><button class="link" data-a="fix" data-p="' + FSEC.indexOf(x.s) + '">Fix now</button>' + (S.ack[x.k] ? '' : '<button class="link" data-a="ack" data-p="' + x.k + '">Leave for my adviser</button>') + '</div></div></div>').join('') + '</div>' : '') +
    '<details class="card" style="margin-top:12px"><summary style="cursor:pointer;font-weight:800;min-height:44px">✅ ' + good.length + ' details look good</summary>' + good.map(x => '<div class="mini"><span>' + esc(FF[x.k].l) + '</span><span>' + fmtField(x.k) + ' ' + tagFor(x.k) + '</span></div>').join('') + '</details>',
  foot:(req3Missing().length ? '<p class="small" style="margin:0;text-align:center" id="p4-need">' + esc(chooseTxt(req3Missing()[0]).replace(/ to see this$/, '')) + ' above to see your results.</p>' : '') + '<button class="btn" data-a="toresults" id="seeres"' + (req3Missing().length ? ' disabled' : '') + '>See my results</button><button class="link p4-skip" data-a="skipres" id="skipres"' + (req3Missing().length ? ' disabled' : '') + '>Skip this step</button>'};
};
V.U1 = () => ({id:'U1', note:'Loader. Never shows a made-up result.', head:flowHead(4, 'Step 4 · Understand', 'Building your plan', '', ''), html:'<div style="padding:60px 0;text-align:center"><div class="spin" aria-hidden="true"></div><p class="sub" style="margin-top:18px" role="status">Running your numbers…</p><p class="small">If this takes a while, we\'ll email and text you when it\'s ready.</p></div>'});
/* ================= RESULTS ================= */
/* Option B (Pooja, 1 Oct 2026): compare like with like. "On average" = average monthly amount (today's money) going to the goal
   over its whole timeline; "needs" = that average plus the smallest extra monthly saving that brings the goal to 100%. */
function extraTo100(g){ const w = S.wi && S.wi.g === g.id ? S.wi : {m:0, l:0}, ok = m => project({g:g.id, m:(+w.m || 0) + m, l:+w.l || 0}).pct[g.id] >= 100;
  if (!ok(5000)) return null; let lo = 0, hi = 5000; for (let i = 0; i < 13; i++){ const mid = (lo + hi) / 2; if (ok(mid)) hi = mid; else lo = mid; } return Math.ceil(hi / 5) * 5; }
/* v3.0: the saving line and where each goal's money comes from */
function saveLine(P){ P = P || project(); const sv = P.save; if (!sv || !(sv.surplusM > 0)) return ''; const spent = Math.max(0, sv.surplusM - sv.saveM);
  return eur(sv.surplusM) + ' a month left after costs · ' + eur(sv.saveM) + ' goes to your goals, ' + eur(spent) + ' to everyday spending.'; }
const SRC_W = {cash:'cash', sav:'savings accounts', inv:'investments', oth:'other assets', alt:'alternative investments'};
function goalWhy(P, g){ const x = P.goal && P.goal[g.id]; if (!x || g.kind === 'retire' || g.kind === 'legacy') return '';
  const parts = []; if (x.saved0 > 0) parts.push(eur(x.saved0) + ' already saved');
  Object.keys(SRC_W).forEach(k => { const v = (x.src0[k] || 0); if (v > 0.5) parts.push(eur(v) + ' from your ' + SRC_W[k] + ' today'); });
  if (x.avgM > 0) parts.push('about ' + eur(x.avgM) + ' a month from your pay' + (x.years > 0 ? ' for ' + yrN(x.years) : ''));
  Object.keys(SRC_W).forEach(k => { const v = (x.srcDue[k] || 0); if (v > 0.5) parts.push(eur(v) + ' from your ' + SRC_W[k] + ' when it is due'); });
  let t = parts.length ? parts.join(' + ') + ', plus growth: ' + P.pct[g.id] + '% covered.' : '';
  if (x.gap > 1 && P.pct[g.id] < 100){ t += ' Still to find: ' + eur(x.gap) + (g.kind !== 'pot' ? ' (in future euros)' : '') + '.';
    const f = finNums(); if (f.homeUse === 'Only as a last resort' && f.homeVal > 0){ const rel = Math.round(f.homeVal * 0.5 * 0.9); t += ' If you downsized at 70 to a home worth half as much, you\'d free about ' + eur(rel) + ' in today\'s money' + (rel >= x.gap ? ', which would close this gap.' : '.'); } }
  return t; }
function goalLine(P, g){ const x = P.goal && P.goal[g.id]; if (!x) return '';
  if (g.kind === 'mfree' && S.fin.home && S.fin.home !== 'Own with mortgage') return 'No mortgage in Your finances: remove this goal, or add your mortgage';
  if (P.pct[g.id] >= 100) return 'Fully funded' + (x.avgM > 0 ? ' · on average you\'ll put ' + eur(x.avgM) + ' a month' : '');
  const ex = extraTo100(g), need = ex != null ? x.avgM + ex : Math.max(x.needM || 0, x.avgM + 5);
  if (ex == null || (P.save && need > P.save.surplusM)) return 'Needs about ' + eur(need) + ' a month, more than your spare money · on average you\'ll put ' + eur(x.avgM) + ' a month';
  return 'Needs about ' + eur(need) + ' a month · on average you\'ll put ' + eur(x.avgM) + ' a month'; }
function goalsBox(P){ return (saveLine(P) ? '<p class="small" style="margin:0 0 10px">' + saveLine(P) + '</p>' : '') + resultOrder().map(g => { const p = P.pct[g.id], b = band(p);
  return '<div class="gs"><span class="e" aria-hidden="true">' + g.e + '</span><div class="m"><div class="nm">' + esc(g.name) + ' <span>· ' + yearsTxt(g) + '</span>' + dateBtn(g) + '</div><div class="bar" role="img" aria-label="' + p + '% covered"><i style="width:' + p + '%;background:var(--' + b + ')"></i></div>' + (goalLine(P, g) ? '<div class="gl">' + goalLine(P, g) + '</div>' : '') + (goalWhy(P, g) ? '<div class="gl" style="opacity:.85">' + goalWhy(P, g) + '</div>' : '') + '</div><div class="p" style="color:var(--' + b + '-t)">' + p + '%<small><span aria-hidden="true">' + BANDE[b] + '</span> ' + BANDW[b] + '</small></div></div>'; }).join(''); }
function findings(P){
  const gs = S.goals.slice(), worst = gs.slice().sort((a, b) => P.pct[a.id] - P.pct[b.id] || a.age - b.age)[0];
  // M1: a "main strength" is only ever a goal that is fully covered, and never while working-year spending is more than comes in
  const over = P.rows.some(r => !r.retired && r.shortLiving > Math.max(500, r.needs * 0.02)), best = over ? null : gs.filter(g => P.pct[g.id] >= 95).sort((a, b) => P.pct[b.id] - P.pct[a.id] || a.age - b.age)[0] || null;
  const sT = best ? (best.kind === 'retire' ? 'Your pension and savings cover retiring at ' + best.age : best.name + ' is ' + P.pct[best.id] + '% covered') : over ? 'No strength to point to yet: your spending is more than comes in' : 'Nothing is fully covered yet, so closing the gap comes first';
  let gT, dT, ex = null;
  if (P.pct[worst.id] >= 95){ gT = 'No big gaps right now'; const unprot = S.fin.life !== 'Yes' || S.fin.ip !== 'Yes'; dT = unprot ? 'Worth a look: would your plan cope with illness or death? An adviser can check your cover with you' : 'A yearly review keeps it on track'; }
  else { gT = worst.name + ' is ' + P.pct[worst.id] + '% covered'; ex = extraFor(worst); dT = ex ? 'Saving about ' + eur(ex) + ' more a month could close this gap, on our assumptions' : 'Moving ' + worst.name.toLowerCase() + ' later, or changing the amount, would make the biggest difference'; }
  return {best, worst, sT, gT, dT, ex};
}
function wiText(P0, P1){ const ch = S.goals.map(g => ({g, a:P0.pct[g.id], b:P1.pct[g.id]})).filter(x => x.a !== x.b);
  if (!S.wi.m && !S.wi.l) return 'Move the sliders to see what changes.';
  if (!ch.length) return 'No change to your goals. Everything that could be covered already is.';
  return ch.map(x => '<b>' + esc(x.g.name) + '</b> goes from ' + x.a + '% to <b>' + x.b + '%</b>').join('<br>'); }
function glanceHTML(P){ const v = S.view;
  const tabs = '<div class="vt" role="tablist" aria-label="Your future views">' + [['journey','🛤️ Journey'],['chapters','📖 Life chapters'],['detail','📊 Detail']].map(([k, l]) => '<button role="tab" aria-selected="' + (v === k) + '" class="' + (v === k ? 'on' : '') + '" data-a="view" data-p="' + k + '">' + l + '</button>').join('') + '</div>';
  let body = '';
  const land = phoneLandscape();
  if (v === 'journey') body = '<p class="small">Your life as one road, from today to age 90. The milestones are the goals you chose.</p>' +
        journeySVG(P, land ? Math.max(322, Math.min(780, innerWidth - 72)) : 322, land) + journeyNote(P);
  else if (v === 'chapters') body = '<p class="small">Your future as chapters of your life. ☀️ comfortable · 🌤️ some years use savings · 🌦️ often using savings · ⛈️ a gap to plan for. Tap a chapter to see its years.</p>' + chaptersHTML(P);
  else body = '<div class="row chead" style="justify-content:space-between;align-items:center;gap:8px"><p class="small" style="margin:0">Each bar is one year of spending: living costs, loans and goals. Tap a bar to see that year.</p><button class="chip sm' + (S.csave ? ' sel' : '') + '" aria-pressed="' + !!S.csave + '" data-a="csave" style="flex-shrink:0">Show savings</button></div>' +
      chartSVG(P.rows, land ? Math.max(322, Math.min(780, innerWidth - 72)) : 322, {live:true, land}) + chartLegend() + chartSummary(P);
  return tabs + '<div role="tabpanel">' + body + '</div>'; }
function journeyNote(P){ const bad = P.rows.find(isShort); return '<div class="jkey"><span><i style="background:var(--good)"></i>Income covers it</span><span><i style="background:var(--nudge)"></i>Using savings</span><span><i style="background:var(--alert)"></i>Shortfall</span></div>' + (bad ? '<p class="pnote">⛈️ Around <b>age ' + bad.a + '</b>' + (bad.due && bad.due.length ? ', money for ' + esc(bad.due.join(' and ').toLowerCase()) + ' falls short.' : ', your money falls short.') + '</p>' : '<p class="pnote">☀️ Every year of your road is covered.</p>'); }
function journeyNoteOld(P){ const bad = P.rows.find(isShort); return '<p class="pnote"><b>Reading your road:</b> ☀️ teal means your income covers life; 🌦️ gold means you\'re drawing on savings, which is what they\'re for. ' + (bad ? (bad.goalGap > 0 && !(bad.shortLiving > 1) && bad.due && bad.due.length ? 'Around <b>age ' + bad.a + '</b>, money for ' + esc(bad.due.join(' and ').toLowerCase()) + ' falls short, so the road turns ⛈️ coral there.' : 'The road turns ⛈️ coral around <b>age ' + bad.a + '</b>: money runs short there unless the plan changes.') : 'There\'s no ⛈️ coral on your road: you don\'t run out of money before 90.') + ' Each milestone ring shows its goal\'s status the same way.' + '</p>'; }
function chartLegend(){ return '<div class="legend"><span><i class="sw" style="background:var(--good)"></i>☀️ Teal: paid from income</span><span><i class="sw" style="background:var(--nudge);box-shadow:inset 0 0 0 1px var(--nudge-edge)"></i>🌦️ Gold: paid from savings</span><span><i class="sw" style="background:var(--alert)"></i>⛈️ Coral: shortfall, not covered</span><span><i class="sw" style="background:none;border-top:2px dashed var(--ink);height:0;border-radius:0"></i>Your income each year</span>' + (S.csave ? '<span><i class="sw" style="background:none;border-top:2px solid #6E8AA6;height:0;border-radius:0"></i>Savings left</span>' : '') + (retireGoal() ? '<span><i class="sw" style="background:var(--ink)"></i>▼ Retirement starts</span>' : '') + '<span><b style="font-size:10px;margin-right:4px">SP</b>State Pension from ' + AS.spAge + '</span><span>Emoji = a goal that year</span></div>'; }
function chartNote(P){ const n = P.rows.filter(isShort).length; return '<p class="pnote"><b>In plain English:</b> ' + (n ? 'in ' + n + ' year' + (n > 1 ? 's' : '') + ' of your plan, your income and savings don\'t fully cover what you\'ll need, including goals that fall short (the ⛈️ purple bars). These are the gaps to close, by saving more, changing timing, or rethinking a goal.' : 'every year of your plan is covered by your income and savings. No ⛈️ purple bars. That\'s what "on track" looks like.') + '</p>'; }
let _mcv = null;
function textW(t, px){ // width of a bold label, measured with whatever font is rendering now
  try { _mcv = _mcv || document.createElement('canvas').getContext('2d'); _mcv.font = '700 ' + px + 'px Figtree, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'; return _mcv.measureText(t).width * 1.06 + 4; } catch (e) { return t.length * px * 0.62 + 4; } }
function journeySVG(P, W, land){
  // land = landscape phone: flatter road so the whole road fits the short screen
  const rows = P.rows, n = rows.length, wide = W > 500, H = land ? 324 : wide ? 400 : 360, pad = 18, mid = land ? 162 : wide ? 196 : 176, amp = land ? 20 : wide ? 34 : 24;
  const X = i => pad + i / (n - 1) * (W - 2 * pad), Y = i => mid + amp * Math.sin(i / (n - 1) * Math.PI * 2.4) - i / (n - 1) * 8;
  const Yx = x => { const f = clamp((x - pad) / (W - 2 * pad) * (n - 1), 0, n - 1), i = Math.floor(f), j = Math.min(n - 1, i + 1); return Y(i) + (Y(j) - Y(i)) * (f - i); };
  let base = '', road = '', ticks = '';
  for (let i = 0; i < n - 1; i++){ base += '<line x1="' + X(i) + '" y1="' + Y(i) + '" x2="' + X(i + 1) + '" y2="' + Y(i + 1) + '" stroke="#DCE4EC" stroke-width="' + (wide ? 16 : 13) + '" stroke-linecap="round"/>'; road += (rowCol(rows[i]) === 'var(--nudge)' ? '<line x1="' + X(i) + '" y1="' + Y(i) + '" x2="' + X(i + 1) + '" y2="' + Y(i + 1) + '" stroke="var(--nudge-edge)" stroke-width="' + (wide ? 11 : 9) + '" stroke-linecap="round"/>' : '') + '<line x1="' + X(i) + '" y1="' + Y(i) + '" x2="' + X(i + 1) + '" y2="' + Y(i + 1) + '" stroke="' + rowCol(rows[i]) + '" stroke-width="' + (wide ? 9 : 7) + '" stroke-linecap="round"/>'; }
  const a0 = rows[0].a, ri = retireGoal() ? rows.findIndex(r => r.rmark) : -1, fx = ri >= 0 ? X(ri) : null;
  // fixed items that milestones must keep clear of: "You, today", the retirement flag + label, the sunset
  const busy = [], box = (l, t, r, b) => ({l, t, r, b});
  let marks = '<circle cx="' + X(0) + '" cy="' + Y(0) + '" r="6.5" fill="var(--ink)" stroke="#fff" stroke-width="2"/>';
  busy.push(box(X(0) - 9, Y(0) - 9, X(0) + 9, Y(0) + 9), Object.assign(box(X(0) - 3, Y(0), X(0) + 3, H), {col:1}));
  if (ri >= 0){ const fr = fx > W - 90, fl = 'Retire ' + rows[ri].a, fw = textW(fl, 11);
    marks += '<line x1="' + fx + '" y1="' + Y(ri) + '" x2="' + fx + '" y2="' + (Y(ri) - 44) + '" stroke="var(--ink)" stroke-width="2.5"/><path d="M' + fx + ' ' + (Y(ri) - 44) + ' l24 7 l-24 7 z" fill="#E4518A"/><text x="' + (fx + (fr ? -6 : 4)) + '" y="' + (Y(ri) - 50) + '" font-size="11" font-weight="800" fill="var(--ink)" text-anchor="' + (fr ? 'end' : 'start') + '">' + fl + '</text>';
    busy.push(box(fr ? fx - 6 - fw : fx - 3, Y(ri) - 64, fr ? fx + 27 : Math.max(fx + 27, fx + 4 + fw), Y(ri) - 6)); }
  const sx = X(n - 1) - 8, sy = Y(n - 1) - 12;
  marks += '<text x="' + sx + '" y="' + sy + '" font-size="18" aria-hidden="true">🌅</text>'; busy.push(box(sx - 2, sy - 22, sx + 26, sy + 6));
  // milestones: strictly alternate above / below the road in age order; each hangs on a dashed leader from its exact age point.
  // If a neighbour on the same side is in the way, step out to the next tier and/or nudge sideways (leader angles back).
  const gs = S.goals.filter(g => g.kind !== 'retire').slice().sort((a, b) => a.age - b.age || a.id - b.id);
  const R = wide ? 18 : 13, LH = wide ? 15 : 0, gapV = 4, first = R + (wide ? 12 : 10), step = 2 * R + LH + gapV + (wide ? 2 : 4);
  const top = 4, bottom = H - 20, hit = (a, c) => a.l < c.r && c.l < a.r && a.t < c.b && c.t < a.b;
  const segHit = (x1, y1, x2, y2, b) => { let t0 = 0, t1 = 1; const dx = x2 - x1, dy = y2 - y1; // Liang-Barsky: does a leader cross a box?
    for (const [p, q] of [[-dx, x1 - b.l], [dx, b.r - x1], [-dy, y1 - b.t], [dy, b.b - y1]]){ if (p === 0){ if (q < 0) return false; } else { const r = q / p; if (p < 0) t0 = Math.max(t0, r); else t1 = Math.min(t1, r); if (t0 > t1) return false; } } return true; };
  const placed = [], rings = busy.slice(), leads = [];
  gs.forEach((g, k) => { const i = clamp(g.age - a0, 0, n - 1), cx = X(i), cy = Y(i), up = k % 2 === 0;
    const nm = g.name.length > 20 ? g.name.slice(0, 19) + '…' : g.name, lw = wide ? textW(nm, 11) : 0;
    const cands = [], ns = wide ? 22 : 16, ringU = (2 * R + 4) / ns;
    for (let t = 0; t < 6; t++) for (let s = -Math.ceil(W / ns); s <= Math.ceil(W / ns); s++) cands.push({t, dx:s * ns, c:t + Math.abs(s) / ringU + (s < 0 ? 0.35 : 0)});
    cands.sort((a, b) => a.c - b.c || a.t - b.t);
    let best = null, pass = 0;
    const far = 4 * (2 * R + 4);
    for (;;){ for (const c of cands){ const x = cx + c.dx; if (x - R < 2 || x + R > W - 2 || (pass < 2 && Math.abs(c.dx) > far)) continue;
      let ext = cy; for (let xx = x - R - 4; xx <= x + R + 4; xx += 4){ const yy = Yx(xx); ext = up ? Math.min(ext, yy) : Math.max(ext, yy); }
      const y = up ? ext - first - c.t * step : ext + first + c.t * step;
      const lx = wide ? clamp(x, lw / 2 + 2, W - lw / 2 - 2) : x, ly = up ? y - R - 5 : y + R + 14;
      const rb = box(x - R - 2, y - R - 2, x + R + 2, y + R + 2), lb = wide ? box(lx - lw / 2, up ? y - R - LH - 3 : y + R + 1, lx + lw / 2, up ? y - R - 1 : y + R + LH + 3) : null;
      const bb = [rb].concat(lb ? [lb] : []);
      if (bb.some(b => b.t < top || b.b > bottom)) continue;
      if (bb.some(b => busy.some(o => hit(b, o)))) continue;
      const sh = b => ({l:b.l + 3, t:b.t + 3, r:b.r - 3, b:b.b - 3}), ey = up ? y + R : y - R; // leaders must not cut through other rings or labels
      if (pass === 0 && (rings.some(o => segHit(cx, cy, x, ey, sh(o))) || leads.some(L => bb.some(b => segHit(L[0], L[1], L[2], L[3], sh(b)))))) continue;
      best = {x, y, lx, ly, bb, ey}; break; }
    if (!best && pass < 2){ pass++; continue; } break; }
    if (!best) best = {x:cx, y:up ? cy - first : cy + first, lx:cx, ly:up ? cy - first - R - 5 : cy + first + R + 14, bb:[]};
    best.bb.forEach(b => { busy.push(b); rings.push(b); }); leads.push([cx, cy, best.x, best.ey == null ? best.y : best.ey]); placed.push({g, cx, cy, nm, ...best}); });
  let lead = '', ms = '';
  placed.forEach(m => { const p = P.pct[m.g.id], col = 'var(--' + band(p) + ')';
    lead += '<line x1="' + m.cx.toFixed(1) + '" y1="' + m.cy.toFixed(1) + '" x2="' + m.x.toFixed(1) + '" y2="' + m.y.toFixed(1) + '" stroke="#9FB3C4" stroke-width="1.5" stroke-dasharray="3 3"/><circle cx="' + m.cx.toFixed(1) + '" cy="' + m.cy.toFixed(1) + '" r="3" fill="#fff" stroke="var(--ink)" stroke-width="1.5"/>';
    ms += '<g><circle cx="' + m.x.toFixed(1) + '" cy="' + m.y.toFixed(1) + '" r="' + R + '" fill="#fff" stroke="' + col + '" stroke-width="3.5"/><text x="' + m.x.toFixed(1) + '" y="' + (m.y + (wide ? 6 : 4.5)).toFixed(1) + '" font-size="' + (wide ? 16 : 12.5) + '" text-anchor="middle">' + m.g.e + '</text>' +
      (wide ? '<text x="' + m.lx.toFixed(1) + '" y="' + m.ly.toFixed(1) + '" font-size="11" font-weight="700" fill="var(--ink)" text-anchor="middle">' + esc(m.nm) + '</text>' : '') + '<title>' + esc(m.g.name) + ', age ' + m.g.age + ': ' + p + '% covered, ' + BANDW[band(p)].toLowerCase() + '</title></g>'; });
  // crop the canvas to what is drawn, so a quiet road stays compact and a busy one gets the height it needs
  let y0 = Math.min(...rows.map((r, i) => Y(i))) - 12, y1 = Math.max(...rows.map((r, i) => Y(i))) + 12; busy.forEach(b => { if (!b.col){ y0 = Math.min(y0, b.t); y1 = Math.max(y1, b.b); } });
  y0 = Math.floor(y0 - 4); y1 = Math.ceil(y1 + (wide ? 22 : 32));
  // "You, today" sits on the age axis under the start of the road, where milestones never go
  const tw = wide ? textW('You, today', 11) : textW('today', 11); ticks += '<line x1="' + X(0) + '" y1="' + (Y(0) + 9) + '" x2="' + X(0) + '" y2="' + (y1 - (wide ? 19 : 30)) + '" stroke="var(--ink)" stroke-width="1.5" stroke-dasharray="1 3" stroke-linecap="round"/>' +
    (wide ? '<text x="' + (X(0) - 8) + '" y="' + (y1 - 6) + '" font-size="11" font-weight="800" fill="var(--ink)">You, today</text>' : '<text x="' + (X(0) - 8) + '" y="' + (y1 - 18) + '" font-size="11" font-weight="800" fill="var(--ink)">You,<tspan x="' + (X(0) - 8) + '" dy="12">today</tspan></text>');
  rows.forEach((r, i) => { if (r.a % 10 === 0 && X(i) - textW('age ' + r.a, 10.5) / 2 > X(0) - 8 + tw + 4) ticks += '<text x="' + X(i) + '" y="' + (y1 - 6) + '" font-size="10.5" fill="#51627A" text-anchor="middle">age ' + r.a + '</text>'; });
  const desc = 'Road from age ' + a0 + ' to 90. ' + (rows.some(isShort) ? 'Some coral shortfall years.' : 'No shortfall years.');
  return '<svg viewBox="0 ' + y0 + ' ' + W + ' ' + (y1 - y0) + '" width="100%" role="img" aria-label="' + desc + '"' + (land ? ' class="road-land"' : '') + ' style="display:block;margin-top:6px">' + base + road + lead + marks + ms + ticks + '</svg>' +
    (wide ? '' : '<div class="mlist">' + gs.map(g => { const p = P.pct[g.id]; return '<div class="ml-r"><span class="ml-e" style="--c:var(--' + band(p) + ')" aria-hidden="true">' + g.e + '</span><span class="ml-m"><b>' + esc(g.name) + '</b><small>Age ' + g.age + '</small></span><span class="ml-p ' + band(p) + '">' + p + '%<span class="sr"> ' + BANDW[band(p)] + '</span></span></div>'; }).join('') + '</div>');
}
function chapters(P){ const ch = []; P.rows.forEach(r => { let d = Math.floor(r.a / 10) * 10; if (d === 90 && ch.length) d = 80; let c = ch[ch.length - 1]; if (!c || c.dec !== d){ c = {dec:d, from:r.a, to:r.a, rows:[]}; ch.push(c); } c.to = r.a; c.rows.push(r); }); return ch; }
function chaptersHTML(P){ const a0 = P.rows[0].a;
  return '<div class="chapgrid">' + chapters(P).map((c, ci) => { const sh = c.rows.filter(isShort), dip = c.rows.filter(r => r.used > 1 && !isShort(r)), allRet = c.rows.every(r => r.retired);
    const wx = sh.length ? '⛈️' : dip.length > c.rows.length / 3 ? '🌦️' : dip.length ? '🌤️' : '☀️', cls = sh.length ? 'bad' : dip.length > c.rows.length / 3 ? 'warn' : 'ok';
    const story = sh.length ? 'Short by about <b>' + eur(sh.reduce((s, r) => s + r.short, 0) / sh.length) + ' a year</b> in ' + sh.length + ' of these years.' : allRet ? 'Living on your pensions and savings, and they hold up.' : dip.length ? 'Some years dip into savings. That\'s what they\'re for.' : 'Income comfortably covers life.';
    const ev = []; if (retireGoal() && c.rows.some(r => r.rmark)) ev.push('🏁 <b>You retire</b>');
    S.goals.filter(g => g.kind !== 'retire' && g.age >= c.from && g.age <= c.to).forEach(g => ev.push(g.e + ' ' + esc(g.name) + ' <b style="color:var(--' + band(P.pct[g.id]) + '-t)">' + P.pct[g.id] + '%</b>'));
    const open = S.chapOpen === ci;
    return '<button class="chap ' + cls + (open ? ' open' : '') + '" data-a="chap" data-p="' + ci + '" aria-expanded="' + open + '"><div class="w" aria-hidden="true">' + wx + '</div><div class="cb"><div class="tt">Your ' + c.dec + 's</div><div class="ag">age ' + c.from + '–' + c.to + (allRet ? (retireGoal() ? ' · retired' : ' · after work') : '') + '</div><div class="st">' + story + '</div>' + (ev.length ? '<div class="ev">' + ev.map(e => '<div>' + e + '</div>').join('') + '</div>' : '') +
      '<div class="mo">' + (open ? '▲ Hide the years' : '▼ See it year by year') + '</div>' + (open ? '<div class="ev">' + c.rows.map(r => { const m = isShort(r), d = r.used > 1 && !m; return '<div class="cy"><b style="width:26px">' + r.a + '</b><span class="d" style="background:' + (m ? 'var(--alert)' : d ? 'var(--nudge)' : 'var(--good)') + '"></span>' + (m ? '<b>Gap to plan for</b>: short ' + eur(r.short) : d ? 'Using savings' : 'Comfortable') + '</div>'; }).join('') + '</div>' : '') + '</div></button>'; }).join('') + '</div>'; }
/* REPORT DATA */
/* Journey-spec §28: ONE function, reportData(), returns every number, text and chart series for the plan report. Pure: no DOM, no lasting change to S.
   It reads only the engine (project(), finNums(), foundations(), findings(), chapters(), rowParts(), goal lines). Phase 1 = pages 1-7 (cover basics, plan on a page,
   money today, roadmap, goals in detail, cashflow, what could change the answer). Names are documented in docs/report-data-notes.md. */
const REPDATA = {saveShare:0.18, saveStep:50, limitFloor:true, closeN:3, maxMissing:4};
const repShort = v => { v = Math.abs(v); return v >= 1e6 ? '€' + (+(v / 1e6).toFixed(1)) + 'm' : v >= 1e4 ? '€' + Math.round(v / 1e3) + 'k' : '€' + Math.round(v).toLocaleString('en-IE'); };
const repR = (v, s) => Math.round(v / (s || 1)) * (s || 1);
const repShortName = g => ({family:'Family', retire:'Retirement', home:'Home', edu:'Education', travel:'Travel', business:'Business', mfree:'Mortgage-free', safety:'Safety net', wealth:'Wealth', helpfam:'Helping family', legacy:'Legacy'}[g.k] || g.name);
// run the plan with ONE change (or several, for the combined rows) on a private copy of the customer, then put everything back
function repRun(over, fn){ const keep = S; try { S = JSON.parse(JSON.stringify(keep)); over = over || {};
    if (over.ra != null) setRetireAge(over.ra);
    if (over.saveM != null){ S.saveM = over.saveM; S.saveUp = true; }
    if (over.penAddM){ S.fin.pensionM = (+S.fin.pensionM || 0) + over.penAddM; S.fin.pensionOwnM = (+S.fin.pensionOwnM || 0) + over.penAddM; S.src.pensionM = 'typed'; S.src.pensionOwnM = 'typed'; }
    if (over.fullSP){ S.fin.sp = 'Expect full'; S.src.sp = 'typed'; delete S.fin.spYears; if (S.asm){ delete S.asm.spYears; delete S.asm.spWeek; } }
    applyAssume(); return fn(project()); } finally { S = keep; applyAssume(); } }
const repGapAge = P => { const r = P.rows.find(x => x.shortLiving > Math.max(500, x.needs * 0.02)); return r ? r.a : null; };   // the year everyday costs are no longer covered (a goal falling short is a separate note)
const repIsWorking = f => f.income > 0 && f.work !== 'Not working' && f.R > f.age;
// pay and tax figures the pension rows need (same rule as the Contribution tool: relief on a share of pay by age band, pay up to the earnings cap)
function repPension(f){ const lim = relLim(f.age) * Math.min(f.income, RI.pen.earnCap), existing = f.pensionOwnM * 12, room = Math.max(0, lim - existing), limitM = Math.floor(room / 12);
  const band = f.married ? RI.it.bandMarried + Math.min(f.pIncome, RI.it.bandUplift) : f.spccc ? RI.it.bandSPCCC : RI.it.band, tr = f.income > band ? 0.4 : 0.2;
  return {limitYear:lim, existingYear:existing, roomYear:room, limitM, taxRate:tr, afterReliefM:Math.round(limitM * (1 - tr)), agePct:relLim(f.age)}; }
function repScenarios(P, f){
  const rg = S.goals.find(g => g.kind === 'retire'), goals = S.goals.slice(), tgt = goals.slice().sort((a, b) => P.pct[a.id] - P.pct[b.id] || a.age - b.age)[0], today = {pct:tgt ? P.pct[tgt.id] : 100, gap:repGapAge(P)};
  const tH = P.rows[0].inflow / 12, N = Math.max(REPDATA.saveStep, repR(REPDATA.saveShare * tH, REPDATA.saveStep)), pen = repPension(f), R = f.R, working = repIsWorking(f), spFull = f.sp >= 0.999;
  const out = {target:tgt ? {id:tgt.id, name:tgt.name, kind:tgt.kind} : null, today:{covered:today.pct, gapStartsAt:today.gap, label:'Today\'s plan', note:(R >= 0 ? 'Retire at ' + R : '') + (spFull ? '' : f.sp > 0 ? ', State Pension partly counted' : ', no State Pension counted')}, takeHomeM:Math.round(tH), moreM:N, pension:pen, rows:[], combined:[], topThree:[], helpsMost:null, pathToExplore:null, allOnTrack:today.pct >= 95};
  if (!tgt || today.pct >= 95) return out;
  const run = over => repRun(over, P2 => ({covered:P2.pct[tgt.id], gapStartsAt:repGapAge(P2), saved:P2.save.saveM, worse:goals.filter(g => g.id !== tgt.id && P2.pct[g.id] <= P.pct[g.id] - 1).map(g => ({name:g.name, before:P.pct[g.id], after:P2.pct[g.id]}))}));
  const mk = (id, lever, title, sub, over, extra) => { const r = run(over); return Object.assign({id, lever, title, sub, covered:r.covered, gapStartsAt:r.gapStartsAt, points:r.covered - today.pct, over, saved:r.saved, otherGoalsWorse:r.worse, note:r.worse.length ? 'Moves money away from ' + r.worse.map(w => w.name + ' (' + w.before + '% to ' + w.after + '%)').join(', ') : ''}, extra || {}); };
  const keep = r => r && r.covered >= today.pct && (r.covered > today.pct || (r.gapStartsAt == null ? today.gap != null : today.gap != null && r.gapStartsAt > today.gap));   // skip rows that do nothing or are worse than today
  const single = [], penOk = working && pen.limitM > 0 && R - f.age >= 1;
  if (R < 60 && R > f.age) single.push(mk('retire60', 'retirementAge', 'Retire at 60', (60 - R) + ' years later', {ra:60}, {age:60}));
  if (working || f.age < R){ const eff = Math.max(0, Math.min(P.save.surplusM, P.save.saveM + N) - P.save.saveM);
    if (eff >= N / 2) single.push(mk('save', 'saveMore', 'Save ' + eur(N) + ' more a month', 'In cash and investments. About ' + Math.round(100 * N / tH) + '% of take-home pay', {saveM:Math.round(P.save.saveM + N)}, {amountM:N, effectiveExtraM:Math.round(eff), capped:eff < N - 0.5})); }
  if (R < 65 && R > f.age) single.push(mk('retire65', 'retirementAge', 'Retire at 65', (65 - R) + ' years later', {ra:65}, {age:65}));
  if (penOk) single.push(mk('pension', 'startPension', f.pensionOwnM > 0 ? 'Raise your pension to the limit, ' + eur(pen.limitM) + ' more a month' : 'Start a pension, ' + eur(pen.limitM) + ' a month', 'About ' + eur(pen.afterReliefM) + ' after tax relief. The most you can claim on at ' + f.age, {penAddM:pen.limitM}, {monthlyM:pen.limitM, afterReliefM:pen.afterReliefM}));
  if (!spFull) single.push(mk('statePension', 'statePension', 'Count your State Pension', 'Full rate, ' + eur(Math.round(RI.sp.week * RI.sp.weeks)) + ' a year from ' + RI.sp.age, {fullSP:true}, {fullRateYear:Math.round(RI.sp.week * RI.sp.weeks)}));
  if (penOk){ const g = Math.round(N / (1 - pen.taxRate));
    single.push(mk('payMore', 'payMorePension', 'Pay ' + eur(N) + ' more a month into a pension', 'After tax relief. About ' + Math.round(100 * N / tH) + '% of take-home pay', {penAddM:g}, {amountM:N, grossM:g})); }
  const kept = single.filter(keep); kept.sort((a, b) => a.covered - b.covered || single.indexOf(a) - single.indexOf(b)); out.rows = kept;
  // combined paths (each counts a full State Pension, as v5 says: "confirm yours")
  const comb = [], N2 = Math.round(N / 2), g2 = Math.round(N2 / (1 - pen.taxRate)), cost = x => Math.round(100 * x / tH);
  const sp = !spFull;
  if (penOk && R < 60 && R > f.age) comb.push(mk('c60', 'combined', 'Retire at 60 + pension at the limit', sp ? 'With a full State Pension (confirm yours)' : 'Retire at 60 and a pension at the limit', {ra:60, penAddM:pen.limitM, fullSP:true}, {costPct:cost(pen.afterReliefM)}));
  if (penOk && R < 60 && R > f.age) comb.push(mk('c60more', 'combined', '…and pay ' + eur(N2) + ' more a month into a pension', 'Total ' + cost(pen.afterReliefM + N2) + '% of take-home pay', {ra:60, penAddM:pen.limitM + g2, fullSP:true}, {amountM:N2, costPct:cost(pen.afterReliefM + N2)}));
  if (penOk && R < 65 && R > f.age) comb.push(mk('c65', 'combined', (comb.length ? 'Or retire' : 'Retire') + ' at 65 + pension at the limit', 'With a full State Pension. Total ' + cost(pen.afterReliefM) + '% of take-home pay', {ra:65, penAddM:pen.limitM, fullSP:true}, {costPct:cost(pen.afterReliefM)}));
  const sRow = id => single.find(x => x.id === id); out.combined = comb.filter(keep).filter(x => { const c = x.id === 'c65' ? sRow('retire65') : sRow('retire60'); return !c || x.id === 'c60more' || x.covered >= c.covered; });   /* adding the pension must not make the retire-only path worse */ out.combined.sort((a, b) => a.covered - b.covered);
  // page 2: the best change in each lever, then the top three by points
  const lever = {}; kept.forEach(r => { const k = r.lever === 'payMorePension' ? null : r.lever; if (k && (!lever[k] || r.points > lever[k].points)) lever[k] = r; });
  out.topThree = Object.values(lever).filter(r => r.points > 0).sort((a, b) => b.points - a.points).slice(0, REPDATA.closeN).map(r => {
    const r60 = kept.find(x => x.id === 'retire60'), r65 = kept.find(x => x.id === 'retire65');
    const title = {statePension:'Check your State Pension', startPension:f.pensionOwnM > 0 ? 'Raise your pension' : 'Start a pension', retirementAge:'Choose your retirement age', saveMore:'Save more each month'}[r.lever];
    const body = r.lever === 'statePension' ? 'Not confirmed, so the plan counts ' + (f.sp > 0 ? 'only part of it' : '€0') + '. A full one could lift cover from ' + today.pct + '% to about ' + r.covered + '%.'
      : r.lever === 'startPension' ? eur(r.monthlyM) + ' a month (about ' + eur(r.afterReliefM) + ' after tax relief) could lift cover to ' + r.covered + '%.'
      : r.lever === 'retirementAge' ? (r60 && r65 ? 'Retire at 60 and cover reaches ' + r60.covered + '%. At 65, ' + r65.covered + '%.' : r.title + ' and cover reaches ' + r.covered + '%.')
      : 'About ' + eur(r.amountM) + ' more a month could lift cover to ' + r.covered + '%.';
    return {lever:r.lever, id:r.id, title, body, points:r.points, coveredAfter:r.covered}; });
  const best = kept.slice().sort((a, b) => b.points - a.points)[0]; out.helpsMost = best ? {id:best.id, lever:best.lever, text:{payMorePension:'Paying more into a pension', startPension:'Starting a pension', retirementAge:'Retiring later', statePension:'Counting your State Pension', saveMore:'Saving more'}[best.lever] + ' helps most', points:best.points} : null;
  const bc = out.combined.slice().sort((a, b) => b.covered - a.covered)[0];
  out.bestCovered = bc ? bc.covered : (best ? best.covered : today.pct);
  if (bc){ const alt = out.combined.find(x => x.id !== bc.id && (x.id === 'c60') !== (bc.id === 'c60') && x.id !== 'c60more'); const age = bc.id === 'c65' ? 65 : 60;
    out.pathToExplore = {id:bc.id, retireAge:age, covered:bc.covered, gapStartsAt:bc.gapStartsAt, otherRetireAge:alt ? (alt.id === 'c65' ? 65 : 60) : null, otherCovered:alt ? alt.covered : null,
      text:'Retire at ' + age + ', start a pension' + (sp ? ' and check your State Pension record' : '') + ': about ' + bc.covered + '% covered, ' + (bc.gapStartsAt != null ? 'with a gap only from age ' + bc.gapStartsAt : 'with no gap') + '.' + (alt ? ' Retiring at ' + (alt.id === 'c65' ? 65 : 60) + ' instead reaches ' + alt.covered + '%.' : '')}; }
  out.assumesNote = 'Results from the plan engine on your plan; all rows except the State Pension and combined rows assume ' + (f.sp > 0 ? 'your current State Pension figure' : 'no State Pension') + '. A full State Pension is not confirmed. Pension money is locked until ' + (+asmV('accessAge')) + ', so retiring before then rests on savings alone. An expert can confirm every figure.';
  return out; }
function reportModel(){
  applyAssume(); if (!S || !planReady()) return {ready:false, missing:typeof planMissing === 'function' ? planMissing().map(m => ({key:m.k, name:m.n})) : []};
  const f = finNums(), P = project(), rows = P.rows, a0 = f.age, infl = AS.infl, rg = S.goals.find(g => g.kind === 'retire'), order = resultOrder(), y0 = rows[0].yr, yrOf = a => y0 + a - a0, defl = r => Math.pow(1 + infl, r.t);
  const D = {ready:true, meta:{name:S.acct.name || S.fin.name || '', dateISO:new Date().toISOString().slice(0, 10), age:a0, ageToday:S.about.ageToday == null ? a0 : S.about.ageToday, dateOfBirth:S.about.dob && dobValid(S.about.dob) ? S.about.dob.y + '-' + String(S.about.dob.m).padStart(2, '0') + '-' + String(S.about.dob.d).padStart(2, '0') : null, yearStart:y0, planEndAge:AS.end, retireAge:rg ? f.R : null, retireSet:!!S.retireSet, inflation:infl, partner:!!f.partner, stateAge:RI.sp.age, stateFullYear:Math.round(RI.sp.week * RI.sp.weeks), accessAge:+asmV('accessAge'), rows:rows.length, retired:!!rg && f.R <= a0}};
  const partsAll = rows.map(r => Object.assign({a:r.a, yr:r.yr}, rowParts(r))), gapRows = rows.filter(chartShort), peakRow = rows.reduce((m, r) => r.liquid > m.liquid ? r : m, rows[0]), runOut = gapRows.length ? gapRows[0] : null;
  const retRows = rows.filter(r => r.retired), gapToday = rows.reduce((s, r) => s + rowParts(r).short / defl(r), 0), gapFuture = rows.reduce((s, r) => s + rowParts(r).short, 0);
  const sc = repScenarios(P, f); D.scenarios = sc;
  const spPct = (sc.rows.concat(sc.combined)).find(x => x.id === 'statePension');
  // ---- retirement strip (page 5) ----
  const kindOf = r => chartShort(r) ? 'gap' : rowParts(r).fromSavings > 0.5 ? 'savings' : 'income', strip = [];
  retRows.forEach(r => { const k = kindOf(r), l = strip[strip.length - 1]; if (l && l.kind === k) l.to = r.a; else strip.push({kind:k, from:r.a, to:r.a}); });
  const retYears = retRows.length, retGap = retRows.filter(chartShort).length, retFunded = retYears - retGap;
  const retCostF = retRows.reduce((s, r) => s + r.needs, 0), retGapF = retRows.reduce((s, r) => s + rowParts(r).short, 0), retCostT = retRows.reduce((s, r) => s + r.needs / defl(r), 0), retGapT = retRows.reduce((s, r) => s + rowParts(r).short / defl(r), 0);
  const withSP = f.sp >= 0.999 ? null : spPct ? spPct.covered : null;
  // ---- goals ----
  const goalOf = g => { const p = P.pct[g.id], b = band(p), x = P.goal && P.goal[g.id], yrs = g.kind === 'legacy' ? null : g.age, o = {id:g.id, key:g.k, kind:g.kind, name:g.name, emoji:g.e, age:g.kind === 'legacy' ? AS.end : g.age, year:yrOf(g.kind === 'legacy' ? AS.end : g.age), amount:g.amount, amountIsPerYear:g.kind === 'retire', pct:p, band:b, bandLabel:BANDW[b], onTrack:p >= 95, passed:!!passedG(g)};
    if (g.kind === 'retire'){ o.sentence = p + '% covered ' + (f.sp > 0 ? 'with your State Pension' : 'without a State Pension') + (withSP != null && withSP > p ? ', about ' + withSP + '% with the full one' : '') + '. ' + (retYears ? (retGap === 0 ? 'Your plan pays for all ' + retYears + ' retirement years.' : 'Your savings pay for ' + retFunded + ' of ' + retYears + ' retirement years.') : '');
      o.retirement = {from:g.age, years:retYears, fundedYears:retFunded, gapYears:retGap, strip, costToday:Math.round(retCostT), coveredToday:Math.round(retCostT - retGapT), gapToday:Math.round(retGapT), costFuture:Math.round(retCostF), coveredFuture:Math.round(retCostF - retGapF), gapFuture:Math.round(retGapF), pctFullStatePension:withSP, costTodayShort:repShort(retCostT), coveredTodayShort:repShort(retCostT - retGapT), costFutureShort:repShort(retCostF), coveredFutureShort:repShort(retCostF - retGapF), gapTodayShort:repShort(retGapT)}; }
    else { const avg = x ? x.avgM : 0, ex = p >= 100 ? null : extraTo100(g), need = p >= 100 ? avg : ex != null ? avg + ex : Math.max(x ? x.needM || 0 : 0, avg + 5);
      o.sentence = p >= 100 ? 'Fully funded. Your income and savings cover it.' : p + '% covered. Needs about ' + eur(need) + ' a month; you are putting in about ' + eur(avg) + '.';
      o.monthly = {needsM:Math.round(need), puttingInM:Math.round(avg)}; o.costToday = g.amount; o.coveredToday = Math.round(g.amount * Math.min(100, p) / 100); o.costFuture = x ? Math.round(x.cost) : null; o.coveredFuture = x ? Math.round(x.have) : null; }
    return o; };
  const goals = order.map(goalOf), onTrack = goals.filter(g => g.onTrack).length;
  const worst = goals.slice().sort((a, b) => a.pct - b.pct)[0], bestOn = goals.filter(g => g.onTrack).map(g => repShortName(S.goals.find(s => s.id === g.id)));
  D.onePage = {goalsTotal:goals.length, goalsOnTrack:onTrack, goals, gap:{hasGap:gapRows.length > 0, runOutAge:runOut ? runOut.a : null, runOutYear:runOut ? runOut.yr : null, gapYears:gapRows.length, toAge:AS.end, todayMoney:Math.round(gapToday), futureEuros:Math.round(gapFuture), todayShort:repShort(gapToday), futureShort:repShort(gapFuture)},
    headline:!goals.length ? '' : onTrack === goals.length ? 'All ' + goals.length + (goals.length === 1 ? ' goal is' : ' goals are') + ' on track' : (bestOn.length ? bestOn.join(' and ') + ' goal' + (bestOn.length > 1 ? 's' : '') + ' on track. ' : '') + repShortName(S.goals.find(s => s.id === worst.id)) + ' needs a bigger plan',
    subline:goals.map(g => g.name + ' is ' + g.pct + '% covered.').join(' ') + (sc.rows.length ? ' Counting a State Pension, a pension of your own or a later date could change this.' : ''),
    closeTheGap:sc.topThree, nextStep:{key:'shareWithExpert', text:'Share this plan with an expert', body:'They check the numbers and choose the best way forward.'}};
  // ---- cover (page 1) ----
  const marks = [{kind:'today', age:a0, text:'You, today'}].concat(S.goals.filter(g => g.kind !== 'retire' && g.kind !== 'legacy' && !passedG(g)).map(g => ({kind:'goal', age:g.age, text:g.name})), rg ? [{kind:'retire', age:f.R, text:'You retire'}] : [], runOut ? [{kind:'runOut', age:runOut.a, text:'Savings run out'}] : [], [{kind:'statePension', age:RI.sp.age, text:'State Pension age'}, {kind:'planEnd', age:AS.end, text:'Plan to age ' + AS.end}]).filter(m => m.age >= a0 && m.age <= AS.end).sort((a, b) => a.age - b.age);
  D.cover = {name:D.meta.name, marks, tiles:{goalsOnTrack:onTrack, goalsTotal:goals.length, runOutAge:runOut ? runOut.a : null, savingsLastToEnd:!runOut, nextStep:'share your plan with an expert'}};
  // ---- page 3: money today ----
  const takeH = rows[0].inflow / 12, livingM = rows[0].living / 12, fixedM = rows[0].fixed / 12, goalsM = P.save.saveM, leftM = takeH - livingM - fixedM - goalsM, has = k => !!S.src[k] && S.fin[k] != null && S.fin[k] !== '';
  const own = [{key:'cash', label:'Cash savings', status:has('cash') ? 'given' : 'missing', value:has('cash') ? +S.fin.cash : null}, {key:'invest', label:'Investments', status:has('invest') ? 'given' : 'missing', value:has('invest') ? +S.fin.invest : null},
    {key:'pension', label:'Pension', status:has('pension') ? 'given' : 'missing', value:has('pension') ? +S.fin.pension : null}, {key:'home', label:'Home', status:has('home') ? 'given' : 'missing', value:S.fin.home === 'Rent' || !has('home') ? null : +S.fin.homeValue || null, text:has('home') ? (S.fin.home === 'Rent' ? 'Rent' : S.fin.home) : 'Missing'}];
  const owe = [{key:'mortgage', label:'Mortgage', status:S.fin.home === 'Own with mortgage' ? (has('mortBal') ? 'given' : 'missing') : 'none', value:S.fin.home === 'Own with mortgage' && has('mortBal') ? +S.fin.mortBal : (has('home') ? 0 : null), text:S.fin.home === 'Own with mortgage' ? undefined : 'None'}, {key:'cards', label:'Credit cards', status:has('cardBal') ? 'given' : 'missing', value:has('cardBal') ? +S.fin.cardBal : null}, {key:'loans', label:'Other loans', status:has('loanBal') ? 'given' : 'missing', value:has('loanBal') ? +S.fin.loanBal : null}];
  const anyMissing = [own[0], own[1], own[2], owe[1], owe[2]].some(x => x.status === 'missing') || (S.fin.home === 'Own with mortgage' && !has('homeValue')), assets = (own[0].value || 0) + (own[1].value || 0) + (own[2].value || 0) + (S.fin.home && S.fin.home !== 'Rent' ? +S.fin.homeValue || 0 : 0) + (+S.fin.propValue || 0), debts = (owe[0].value || 0) + (owe[1].value || 0) + (owe[2].value || 0);
  const items = checkItems(), given = items.filter(x => !['miss', 'look'].includes(x.st)).length, total = items.length;
  const PRI = {pension:['High', 'Pension value', 'The biggest tool for retiring early'], cash:['High', 'Cash savings', 'A head start for your pot'], sp:['High', 'State Pension record', 'Up to ' + eur(Math.round(RI.sp.week * RI.sp.weeks)) + ' a year from ' + RI.sp.age], income:['High', 'Your income', 'Everything in the plan starts here'], costsM:['High', 'Monthly living costs', 'Shows how much you can save'], invest:['Medium', 'Investments', 'Part of your net worth'], cardBal:['Medium', 'Loans and cards', 'Debt can cancel out saving'], loanBal:['Medium', 'Loans and cards', 'Debt can cancel out saving'], mortBal:['High', 'Mortgage', 'Your biggest monthly cost'], pensionM:['Medium', 'Monthly pension payments', 'What you add each month'], life:['Medium', 'Protection', 'Cover that protects your plan'], ip:['Medium', 'Protection', 'Cover that protects your plan']};
  const RANK = {pension:1, cash:2, sp:3, income:0, costsM:0, mortBal:3.5, cardBal:4, loanBal:4, invest:5, pensionM:6, life:7, ip:7}, seen = {}, missingList = []; items.filter(x => ['miss', 'look'].includes(x.st)).forEach(x => { const p = PRI[x.k]; if (!p || seen[p[1]]) return; seen[p[1]] = 1; missingList.push({key:x.k, priority:p[0], label:p[1], why:p[2], rank:RANK[x.k] == null ? 9 : RANK[x.k]}); });
  missingList.sort((a, b) => a.rank - b.rank);
  const pctLeft = takeH > 0 ? Math.round(100 * leftM / takeH) : 0;
  D.money = {takeHomeM:Math.round(takeH), livingM:Math.round(livingM), debtPaymentsM:Math.round(fixedM), goalsM:Math.round(goalsM), leftM:Math.round(leftM), leftPer100:pctLeft, margin:leftM < 0 ? 'short' : pctLeft >= 10 ? 'comfortable' : 'tight',
    marginText:leftM < 0 ? 'You spend more than you take home' : pctLeft >= 10 ? 'A comfortable monthly margin' : 'A tight monthly margin', marginNote:leftM < 0 ? 'Costs are higher than pay, so savings are being used.' : pctLeft >= 10 ? 'That gives you room to save more.' : 'There is little room to save more.', grossYear:f.income + f.pIncome, takeHomeNote:'Take-home pay is after tax, USC and PRSI (gross pay ' + eur(f.income + f.pIncome) + ').',
    own, owe, netWorth:anyMissing ? {known:false, text:'not yet known'} : {known:true, value:Math.round(assets - debts), assets:Math.round(assets), debts:Math.round(debts)}, complete:{given, total, text:given + ' of ' + total, missing:missingList.slice(0, REPDATA.maxMissing), missingAll:missingList}};
  // ---- page 4: roadmap ----
  const chap = chapters(P), tagFor = (c, i) => { const t = []; if (i === 0) t.push('You are here'); if (rg && c.rows.some(r => r.rmark)) t.push('You retire at ' + f.R); if (c.to === AS.end && i > 0) t.push('The plan ends at ' + AS.end); if (!t.length){ const sh = c.rows.some(isShort), prevSh = i > 0 && chap[i - 1].rows.some(isShort); t.push(sh && prevSh ? 'The gap grows with prices' : c.rows.every(r => r.retired) ? 'Living on your pensions' : 'Building your savings'); } return t; };
  D.roadmap = {headline:runOut ? (rg && runOut.a > f.R ? 'Smooth until ' + f.R + ', then savings run out at ' + runOut.a : 'Savings run out at ' + runOut.a) : 'Smooth all the way to ' + AS.end, runOutAge:runOut ? runOut.a : null, legend:'Green: income covers life. Gold: savings pay. Coral: a gap to plan for.',
    marks:D.cover.marks, decades:chap.map((c, i) => { const sh = c.rows.filter(isShort), dip = c.rows.filter(r => r.used > 1 && !isShort(r)), last = c.rows[c.rows.length - 1], allRet = c.rows.every(r => r.retired);
      const sentence = sh.length ? (c.rows.length === 1 || (c.to === AS.end && sh.length === 1) ? 'Short by about ' + eur(sh[0].short) + ' in the last year. In all, ' + gapRows.length + ' years have a gap.' : 'Short by about ' + eur(sh.reduce((s, r) => s + r.short, 0) / sh.length) + ' a year' + (sh.length === c.rows.length ? ', in every year of this decade.' : ' in ' + sh.length + ' of these ' + c.rows.length + ' years.'))
        : allRet ? 'Living on your pensions and savings, and they hold up.' : dip.length ? 'Some years dip into savings. That\'s what they\'re for.' : 'Income comfortably covers life. Savings reach about ' + eur(repR(last.liquid, 1000)) + ' by ' + last.a + '.';
      const chips = S.goals.filter(g => g.kind !== 'retire' && g.kind !== 'legacy' && g.age >= c.from && g.age <= c.to).map(g => ({age:g.age, name:g.name, pct:P.pct[g.id], band:band(P.pct[g.id])})); if (RI.sp.age >= c.from && RI.sp.age <= c.to) chips.push({age:RI.sp.age, name:'State Pension age', pct:null, band:null});
      return {decade:c.dec, label:c.dec + 's', fromAge:c.from, toAge:c.to, years:c.rows.length, status:sh.length ? 'gap' : dip.length > c.rows.length / 3 ? 'savings' : dip.length ? 'some' : 'comfortable', weather:sh.length ? 'storm' : dip.length > c.rows.length / 3 ? 'showers' : dip.length ? 'partly' : 'sun', weatherLabel:sh.length ? 'A gap to plan for' : dip.length ? 'Using savings' : 'Comfortable', tags:tagFor(c, i), sentence, gapYears:sh.length, avgShortfall:sh.length ? Math.round(sh.reduce((s, r) => s + r.short, 0) / sh.length) : 0, savingsEnd:Math.round(last.liquid), chips, spark:c.rows.map(r => ({age:r.a, savings:Math.round(r.liquid)})), retired:allRet}; })};
  // ---- page 6: cashflow series ----
  const axMax = niceMax(Math.max(1, peakRow.liquid * 1.1)), gMax = niceMax(Math.max(1, ...partsAll.map(p => p.spend)) * 1.1);   // 10% headroom so the peak label fits
  const worstShort = partsAll.reduce((m, p) => p.short > m.short ? p : m, partsAll[0]);
  D.cashflow = {savings:{series:rows.map(r => ({age:r.a, year:r.yr, savings:Math.round(r.liquid)})), peak:{age:peakRow.a, year:peakRow.yr, amount:Math.round(peakRow.liquid)}, runOutAge:runOut ? runOut.a : null, axisMax:axMax, working:rg ? {from:a0, to:Math.min(f.R, AS.end)} : null, gapFrom:runOut ? runOut.a : null,
      text:'Savings reach ' + eur(peakRow.liquid) + ' at ' + peakRow.a + '.' + (runOut ? ' Savings run out at ' + runOut.a + '.' : ' Savings last to ' + AS.end + '.')},
    paid:{series:partsAll.map(p => ({age:p.a, year:p.yr, fromIncome:Math.round(p.fromIncome), fromSavings:Math.round(p.fromSavings), shortfall:Math.round(p.short), spend:Math.round(p.spend)})), axisMax:gMax, payStopsAge:rg ? f.R : null, worstShortfall:worstShort.short > 0.5 ? {age:worstShort.a, amount:Math.round(worstShort.short)} : null, text:(rg ? 'Pay stops at ' + f.R + '. ' : '') + 'Costs keep rising.'}};
  return D; }
/* ---- schema 1.0.0 builder: docs/report-data.schema.json. Every string below is final display text; numbers are raw. ---- */
const repNumW = n => ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty', 'twenty-one', 'twenty-two', 'twenty-three', 'twenty-four', 'twenty-five', 'twenty-six', 'twenty-seven', 'twenty-eight', 'twenty-nine', 'thirty'][n] || String(n);
const repMon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const repBandTone = b => b === 'good' ? 'good' : b === 'nudge' ? 'gold' : 'coral', repBandKey = b => b === 'nudge' ? 'gold' : b, repBandText = b => b === 'good' ? 'On track' : b === 'nudge' ? 'Nearly there' : 'Needs attention';
const repTicks = (max, n) => Array.from({length:(n || 4) + 1}, (_, i) => Math.round(max / (n || 4) * i));
const repLc = s => s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
function repMeta(g, yrOf){ const y = yrOf(g.kind === 'legacy' ? AS.end : g.age); return g.kind === 'retire' ? 'From ' + g.age + ' · ' + y + ' · ' + eur(g.amount) + ' a year' : g.kind === 'legacy' ? 'At the end of the plan · ' + y + ' · ' + eur(g.amount) : 'Age ' + g.age + ' · ' + y + ' · ' + eur(g.amount); }
function reportQuestions(M, f, R){ const q = [], P = project(), rg = S.goals.find(g => g.kind === 'retire'), acc = +asmV('accessAge'), spFull = f.sp >= 0.999, working = f.income > 0 && f.work !== 'Not working';
  if (rg && !M.meta.retired){ const p = P.pct[rg.id]; q.push(p < 95 ? 'Is retiring at ' + f.R + ' realistic? If not, what age gets me closest to ' + eur(rg.amount) + ' a year?' : 'Is my plan for retiring at ' + f.R + ' strong enough if prices or markets move against me?'); }
  else if (rg) q.push('How should I draw income from my pension and savings so they last?');
  if (working && f.R > f.age) q.push('How much should I pay into a pension each month, and where?');
  if (rg && f.R < acc && f.R > f.age) q.push('How do I cover ' + f.R + ' to ' + acc + ' while pension money is locked?');
  else if (rg && f.R < RI.sp.age && f.R > f.age) q.push('How do I cover ' + f.R + ' to ' + RI.sp.age + ' before the State Pension starts?');
  if (working && S.fin.ip !== 'Yes') q.push('What income protection do I need, and what does it cost?');
  if (!spFull) q.push('How do I check my State Pension record and fill any gaps?');
  if ((S.about.partner || S.about.deps > 0) && S.fin.life !== 'Yes') q.push('How much life cover do my family and I need?');
  if (f.debt > 1 || f.cardBal > 1) q.push('What is the best order to clear my debts and build savings?');
  ['Which of my goals should I fund first?', 'Is my emergency fund the right size?', 'How should I invest money I will not need for ten years or more?', 'Are there tax reliefs I am missing?'].forEach(x => q.push(x));
  return q.filter((x, i) => q.indexOf(x) === i).slice(0, 4); }
function reportData(){
  const M = reportModel(); if (!M.ready) return M;
  const f = finNums(), P = project(), rows = P.rows, a0 = f.age, rg = S.goals.find(g => g.kind === 'retire'), y0 = rows[0].yr, yrOf = a => y0 + a - a0, name = (M.meta.name || '').trim(), td = dobToday();
  const ageT = S.about.ageToday != null ? S.about.ageToday : a0, dateText = td.getDate() + ' ' + repMon[td.getMonth()] + ' ' + td.getFullYear(), poss = name ? name + '’s' : 'Your', gap = M.onePage.gap, goalsM = M.onePage.goals, sc = M.scenarios;
  const nOn = M.onePage.goalsOnTrack, nG = goalsM.length, worstBand = goalsM.length ? goalsM.reduce((m, g) => g.pct < m.pct ? g : m, goalsM[0]).band : 'good', retired = M.meta.retired;
  const gapZones = (from, to) => { const z = []; const R = rg ? Math.max(a0, Math.min(f.R, AS.end)) : a0, ro = gap.runOutAge;
    if (rg && R > from) z.push({fromAge:from, toAge:R, label:'WORKING', tone:'good'});
    if (ro != null){ if (ro > R) z.push({fromAge:Math.max(from, R), toAge:ro, label:'', tone:'gold'}); z.push({fromAge:Math.max(from, ro), toAge:to, label:'A GAP', tone:'coral'}); }
    else z.push({fromAge:Math.max(from, rg ? R : from), toAge:to, label:rg ? '' : 'COVERED', tone:'good'});
    return z.filter(q => q.toAge > q.fromAge); };
  // ---- meta, footer, road ----
  const meta = {customerName:name, possessiveName:poss, dateText, dateUpper:dateText.toUpperCase(), version:1, currentAge:ageT, currentYear:td.getFullYear(), planEndAge:AS.end, retireAge:rg ? f.R : AS.end, statePensionAge:RI.sp.age, hasPartner:!!f.partner, alreadyRetired:!!retired, hasMortgage:S.fin.home === 'Own with mortgage' && f.mortBal > 0, headerRight:poss + ' plan · ' + dateText};
  const footer = {line:'Preliminary guidance, not financial advice. Illustrative, not guaranteed.', coverLine:'Version 1 · Preliminary guidance, not financial advice. An indicative guide: an expert can confirm the details.'};
  const segs = []; { const R = rg && !retired ? Math.min(f.R, AS.end) : a0, ro = gap.runOutAge; if (R > a0) segs.push({fromAge:a0, toAge:R, tone:'good'});
    if (ro != null){ if (ro > R) segs.push({fromAge:R, toAge:ro, tone:'gold'}); segs.push({fromAge:Math.max(R, ro), toAge:AS.end, tone:'coral'}); } else segs.push({fromAge:R, toAge:AS.end, tone:'good'}); }
  const ms = []; S.goals.filter(g => g.kind !== 'retire' && g.kind !== 'legacy' && !passedG(g) && g.age <= AS.end).forEach(g => ms.push({age:g.age, label:g.name, sub:'age ' + g.age, tone:repBandTone(band(P.pct[g.id])), badge:String(g.age)}));
  if (rg && !retired && f.R > a0 && f.R <= AS.end) ms.push({age:f.R, label:'You retire', sub:'age ' + f.R, tone:'gold', badge:String(f.R)});
  if (gap.runOutAge != null) ms.push({age:gap.runOutAge, label:'Savings run out', sub:'age ' + gap.runOutAge, tone:'coral', badge:String(gap.runOutAge)});
  if (RI.sp.age > a0 && RI.sp.age <= AS.end) ms.push({age:RI.sp.age, label:'State Pension', sub:'age ' + RI.sp.age, tone:'blue', badge:String(RI.sp.age)});
  ms.sort((a, b) => a.age - b.age); const msOut = ms.slice(0, 8).map((m, i) => Object.assign(m, {side:i % 2 ? 'below' : 'above'}));
  const road = {startAge:a0, endAge:AS.end, segments:segs, milestones:msOut, startLabel:'You, today · age ' + ageT, endLabel:'Plan to age ' + AS.end};
  // ---- cover ----
  const cover = {eyebrow:'PREPARED FOR ' + (name ? name.toUpperCase() : 'YOU') + ' · ' + meta.dateUpper, title:poss + ' road ahead', lead:'A clear, indicative guide to where you are, where you’re heading, and who can help you get there.', badge:'YOUR PERSONAL PLAN',
    tiles:[{icon:nOn === nG ? 'sun' : nOn ? 'partly' : 'storm', tone:nOn === nG ? 'good' : nOn ? 'gold' : 'coral', big:nOn + ' of ' + nG, small:'goals on track today'}, gap.hasGap ? {icon:'storm', tone:'coral', big:'Age ' + gap.runOutAge, small:'when savings run out'} : {icon:'sun', tone:'good', big:'Covered', small:'to age ' + AS.end}, {icon:'storm', tone:'blue', big:'Next step', small:'share your plan with an expert'}]};
  // ---- page 2 ----
  const planGoals = goalsM.map(g => ({name:g.name, icon:g.key, kind:g.key, pct:g.pct, band:repBandKey(g.band), bandText:repBandText(g.band), meta:repMeta(S.goals.find(s => s.id === g.id), yrOf), sentence:g.sentence}));
  const closeTone = ['good', 'gold', 'blue'];
  const plan = {big:nOn + ' of ' + nG, bigLabel:'goals on track', bigTone:nOn === nG ? 'good' : worstBand === 'good' ? 'good' : repBandTone(worstBand), eyebrow:'YOUR PLAN ON A PAGE', title:gap.hasGap || nOn < nG ? M.onePage.headline : 'Your plan is on track', lead:gap.hasGap || nOn < nG ? M.onePage.subline : 'Your income and savings cover everything you told us about.', goals:planGoals,
    band:gap.hasGap ? {kind:'gap', cells:[{big:'Age ' + gap.runOutAge, small:'savings run out'}, {big:gap.gapYears + (gap.gapYears === 1 ? ' year' : ' years'), small:'with a gap, to age ' + gap.toAge}, {big:'≈ ' + gap.todayShort, small:'short in today’s money (' + gap.futureShort + ' in future euros)'}]} : {kind:'none', cells:[{big:'Age ' + AS.end, small:'savings last'}, {big:'0 years', small:'with a gap'}, {big:'€0', small:'short'}]},
    close:sc.topThree.length ? {title:'What could close the gap', items:sc.topThree.map((x, i) => ({points:'+' + x.points + ' points', tone:closeTone[i], title:x.title, text:x.body}))} : {title:'What keeps you on track', items:[]},
    next:{title:'Next: share this plan with an expert', text:'They check the numbers and choose the best way forward.', button:'Meet an expert'}};
  // ---- page 3 ----
  const mo = M.money, ownRows = mo.own.map(r => r.status === 'missing' ? {label:r.label, status:'missing'} : {label:r.label, value:r.text || eur(r.value || 0)});
  const oweRows = mo.owe.filter(r => r.key !== 'mortgage' || r.status !== 'none' || S.fin.home).map(r => r.status === 'missing' ? {label:r.label, status:'missing'} : {label:r.label, value:r.text || eur(r.value || 0)});
  const cp = mo.complete, short = mo.leftM < 0;
  const money = {big:short ? eur(-mo.leftM) + ' short' : eur(mo.leftM), bigLabel:short ? 'each month' : 'left each month', bigTone:short ? 'coral' : 'good', eyebrow:'YOUR MONEY TODAY', title:mo.marginText,
    tiles:[{label:'Living costs', value:eur(mo.livingM + mo.debtPaymentsM), amount:mo.livingM + mo.debtPaymentsM, tone:'navy'}, {label:'Goals', value:eur(mo.goalsM), amount:mo.goalsM, tone:'teal'}, {label:'Left over', value:eur(Math.max(0, mo.leftM)), amount:Math.max(0, mo.leftM), tone:'white'}],
    sentence:short ? 'Your costs and goals are more than you take home, so savings are being used. Cutting a cost or moving a goal would help.' : 'For every €100 you take home, about €' + mo.leftPer100 + ' is left at the end of the month. ' + mo.marginNote, takeHome:mo.takeHomeNote, exampleChip:'',
    own:{title:'YOU OWN', rows:ownRows}, owe:{title:'YOU OWE', rows:oweRows.length ? oweRows : [{label:'Debts', value:'No debts told to us'}]}, netWorth:mo.netWorth.known ? {label:'Net worth', value:eur(mo.netWorth.value)} : {label:'Net worth', status:'not yet known'},
    complete:{eyebrow:'HOW COMPLETE IS YOUR PICTURE?', have:cp.given, total:cp.total, sub:cp.missing.length ? 'Add these next to sharpen your plan.' : 'Your picture is complete. Thank you.', photo:'money-plant', items:cp.missing.map(x => ({title:x.label, sub:x.why, priority:x.priority}))}};
  // ---- page 4 ----
  const roadmap = {big:gap.hasGap ? 'Age ' + gap.runOutAge : '0 years', bigLabel:gap.hasGap ? 'savings run out' : 'with a gap', bigTone:gap.hasGap ? 'coral' : 'good', eyebrow:'YOUR ROADMAP', title:M.roadmap.headline, lead:M.roadmap.legend,
    decades:M.roadmap.decades.map(d => { const gc = d.chips.filter(c => c.pct != null).concat(d.chips.filter(c => c.pct == null)), chips = gc.slice(0, 3).map(c => ({age:c.age, text:c.pct == null ? c.name : c.name + ' · ' + c.pct + '%', tone:c.pct == null ? 'blue' : repBandTone(c.band)})); if (gc.length > 3) chips.push({age:gc[3].age, text:'+' + (gc.length - 3) + ' more', tone:'grey'});
      const gy = d.spark.map(p => { const r = rows.find(x => x.a === p.age); return !!r && chartShort(r); });
      return {label:d.label, range:'age ' + d.fromAge + '–' + d.toAge, icon:d.weather === 'storm' ? 'storm' : d.weather === 'sun' ? 'sun' : 'partly', tone:d.weather === 'storm' ? 'coral' : d.weather === 'sun' ? 'good' : 'gold', title:d.tags[0], chip:d.weather === 'storm' ? 'A gap to plan for' : d.weather === 'sun' ? 'Comfortable' : 'Watch this', text:d.sentence, goalChips:chips, spark:{label:'Savings', values:d.spark.map(p => p.savings), gapYears:gy}}; })};
  // ---- page 5 ----
  const gd = M.onePage.goals.slice().sort((a, b) => (b.kind === 'retire') - (a.kind === 'retire') || a.age - b.age), kindTxt = {savings:'paid from savings', income:'paid from pension and State Pension', gap:'a gap'}, stateOf = {savings:'savings', income:'pension', gap:'gap'};
  const goalsDetailGoals = gd.map(g => { const sg = S.goals.find(s => s.id === g.id), o = {name:g.name, kind:g.key, icon:g.key, pct:g.pct, band:repBandKey(g.band), bandText:repBandText(g.band), meta:g.kind === 'retire' ? repMeta(sg, yrOf) + ', today’s money' : repMeta(sg, yrOf), sentence:g.sentence};
    if (g.kind === 'retire' && g.retirement){ const r = g.retirement; o.photo = 'retired-reading';
      o.bars = {type:'retire', costLabel:'Retirement costs', costValue:'about ' + r.costTodayShort, costPct:100, coverLabel:'Your plan covers', coverValue:'about ' + r.coveredTodayShort, coverPct:r.costToday ? Math.max(0, Math.min(100, Math.round(1000 * r.coveredToday / r.costToday) / 10)) : 0, note:'In today’s money. In future euros: ' + r.costFutureShort + ' and ' + repShort(r.coveredFuture) + ' (' + g.pct + '%). ' + (r.gapToday > 0 ? 'The gap is about ' + r.gapTodayShort + ' in today’s money.' : 'There is no gap.')};
      const cells = [], first = r.strip[0], last = r.strip[r.strip.length - 1]; r.strip.forEach(sg2 => { for (let a = sg2.from; a <= sg2.to; a++) cells.push({age:a, state:stateOf[sg2.kind]}); });
      o.years = {title:'Your retirement years', summary:r.fundedYears + ' funded · ' + r.gapYears + ' with a gap', cells, leftLabel:'Ages ' + first.from + '–' + first.to + ': ' + kindTxt[first.kind], rightLabel:r.strip.length > 1 ? 'Ages ' + last.from + '–' + last.to + ': ' + kindTxt[last.kind] : ''}; }
    else { const mn = g.monthly || {needsM:0, puttingInM:0}; if (sg.k === 'home') o.photo = 'house-for-sale'; o.bars = {type:'saving', needLabel:'Needs a month', needValue:eur(mn.needsM), needPct:100, putLabel:'You’re putting in', putValue:eur(mn.puttingInM), putPct:mn.needsM > 0 ? Math.min(100, Math.round(1000 * mn.puttingInM / mn.needsM) / 10) : 100}; }
    return o; });
  const nNeed = nG - nOn, goalsDetail = {big:goalsM.length ? (retired || !rg ? Math.min(...goalsM.map(g => g.pct)) : goalsM.find(g => g.kind === 'retire').pct) + '%' : '0 goals', bigLabel:!goalsM.length ? 'added so far' : rg ? 'retirement covered' : 'lowest goal covered', bigTone:repBandTone(rg ? goalsM.find(g => g.kind === 'retire').band : worstBand), eyebrow:'YOUR GOALS IN DETAIL',
    title:nNeed === 0 ? 'All ' + nG + (nG === 1 ? ' goal' : ' goals') + ' on track' : nOn + ' of ' + nG + ' on track, ' + nNeed + (nNeed === 1 ? ' needs' : ' need') + ' attention', goals:goalsDetailGoals,
    howToRead:'How to read this page. Today’s money shows what things cost now; future euros add price rises. Covered is how much of a goal’s cost your income and savings meet: 100% is fully covered, 5% leaves about 95% to plan for.'};
  // ---- page 6 ----
  const cfS = M.cashflow.savings, cfP = M.cashflow.paid, lastP = cfP.series[cfP.series.length - 1], pk = cfS.peak, z = gapZones(a0, AS.end);
  const cashflow = {big:eur(pk.amount), bigLabel:'savings at the peak, age ' + pk.age, bigTone:gap.hasGap ? 'coral' : 'good', eyebrow:'CASHFLOW', title:gap.hasGap ? 'Your savings run out at ' + gap.runOutAge : 'Your savings last to ' + AS.end,
    savingsChart:Object.assign({title:'Your savings, age ' + a0 + ' to ' + AS.end, subtitle:'Cash and investments', yMax:cfS.axisMax, yTicks:repTicks(cfS.axisMax), series:cfS.series.map(p => ({age:p.age, value:p.savings})), peak:pk.amount > 0 ? {age:pk.age, value:pk.amount, label:'Peak ' + eur(pk.amount), sub:'at age ' + pk.age} : null, runOut:gap.hasGap ? {age:gap.runOutAge, label:'Savings run out at ' + gap.runOutAge} : null, zones:z, caption:cfS.text}),
    paidChart:{title:'How each year is paid', legend:[{tone:'good', label:'Paid from income'}, {tone:'gold', label:'Paid from savings'}, {tone:'coral', label:'Shortfall, not covered'}], yMax:cfP.axisMax, yTicks:repTicks(cfP.axisMax), bars:cfP.series.map(p => ({age:p.age, fromIncome:p.fromIncome, fromSavings:p.fromSavings, shortfall:p.shortfall})), zones:z,
      stopMarker:rg && !retired && f.R > a0 && f.R <= AS.end ? {age:f.R, label:'Pay stops at ' + f.R} : null, lastLabel:lastP.shortfall > 0 ? {age:lastP.age, label:eur(lastP.shortfall) + ' a year at ' + lastP.age} : null, caption:cfP.text}};
  // ---- page 7 ----
  const rowOut = (r, idMap) => ({id:idMap[r.id] || r.id, title:r.title, sub:r.sub2 || r.sub, pct:r.covered, gapStartsAge:r.gapStartsAt});
  const rId = {payMore:'morePension', c60:'c60pension', c60more:'c60more', c65:'c65pension'}, since = n => (n === 1 ? 'One year' : repNumW(n).charAt(0).toUpperCase() + repNumW(n).slice(1) + ' years') + ' later';
  const one = sc.rows.map(r => { const o = rowOut(r, rId); if (r.id === 'retire60' || r.id === 'retire65') o.sub = since(r.age - f.R); return o; });
  const todayRow = {id:'today', title:'Today’s plan', sub:'Retire at ' + f.R + ', ' + (f.sp >= 0.999 ? 'full State Pension counted' : f.sp > 0 ? 'part of the State Pension counted' : 'no State Pension counted'), pct:sc.today.covered, gapStartsAge:sc.today.gapStartsAt, emphasis:true};
  const groups = [{title:'ONE CHANGE AT A TIME', rows:[todayRow].concat(one)}]; if (sc.combined.length) groups.push({title:'COMBINED', rows:sc.combined.map((r, i) => { const o = rowOut(r, rId); return o; })});
  const toPct = sc.bestCovered != null && !sc.allOnTrack ? sc.bestCovered : sc.today.covered, tgtBand = p => p >= 95 ? 'good' : p >= 70 ? 'gold' : 'coral';
  const scenarios = {fromPct:sc.today.covered, toPct, fromTone:tgtBand(sc.today.covered), toTone:tgtBand(toPct), eyebrow:'WHAT COULD CHANGE THE ANSWER', title:sc.allOnTrack ? 'Your plan is on track' : sc.helpsMost ? sc.helpsMost.text : 'Small changes can help', columns:{what:'WHAT IF YOU…', covered:'COVERED', gap:'GAP STARTS AT'}, groups,
    explore:{title:'A path to explore', text:sc.pathToExplore ? sc.pathToExplore.text : sc.allOnTrack ? 'Everything you told us about is covered. A yearly review keeps it on track.' : 'An expert can show you which changes fit your life.'}, footnote:sc.assumesNote || 'Results from the plan engine on your plan. An expert can confirm every figure.'};
  // ---- page 8 ----
  const FL = foundations(), nx = fndNext(FL), lvlTone = {ok:'good', held:'good', mid:'gold', bad:'coral', na:'grey'}, lvlIcon = {ok:'sun', held:'sun', mid:'partly', bad:'storm', na:'partly'}, solid = FL.filter(l => l.st === 'ok').length;
  const stTxt = l => FND_LBL[l.st] + ' · ' + (/^[A-Z][a-z]/.test(l.s) ? repLc(l.s) : l.s);
  const prot = (label, v, key) => ({label, value:S.src[key] && v != null && v !== '' ? v : 'Not given', good:S.src[key] && v != null && v !== '' ? v === 'Yes' : null});
  const nbText = !nx ? 'All five foundations are solid. A yearly review keeps it on track.' : nx.x.n === 1 ? 'Spend less than you earn first. ' + nx.d : nx.x.n === 2 ? 'Build your emergency fund to ' + fndT() + ' months. ' + (nx.x.st === 'na' ? 'Add your savings so we can check it.' : nx.d) : nx.x.n === 3 ? (nx.t.replace('first', '') .trim() + '. ' + nx.d) : nx.x.n === 4 ? 'Get your goals on track. ' + nx.d : 'Start growing your wealth when you’re ready. ' + nx.d;
  const per = personality(), rr = riskRead(umCount() === 13), tm = myTerms(), tq = k => { const x = tm.find(t => t.k === k); return x ? x.tags.join(' · ') : ''; };
  const riskOn = rr && rr.label != null ? RISK_LBL.indexOf(rr.label) : null;
  const foundationsP = {big:solid + ' of 5', bigLabel:'foundations solid', bigTone:solid === 5 ? 'good' : solid === 0 ? 'coral' : 'gold', eyebrow:'FOUNDATIONS AND YOU', title:'Build from the bottom up', lead:'Good planning is built from the bottom up.',
    levels:FL.slice().reverse().map(l => ({level:l.n, icon:lvlIcon[l.st], title:l.name, status:stTxt(l), tone:lvlTone[l.st]})),
    protection:{title:'Protection', photo:'car-and-calculator', rows:[prot('Life cover', S.fin.life, 'life'), prot('Health insurance', S.fin.health, 'health'), prot('Cover through work', S.fin.workCover, 'workCover'), prot('Income protection', S.fin.ip, 'ip'), prot('Serious illness cover', S.fin.ci, 'ci')], nextBest:{label:'NEXT BEST STEP', text:nbText}},
    personality:{eyebrow:'YOUR MONEY PERSONALITY', name:per ? 'The ' + per.name : 'Not worked out yet', icon:per ? (per.name === 'Explorer' ? 'compass' : 'partly') : 'partly', strap:per ? per.strap : 'Answer a few more questions to see your money personality.',
      quadrants:[{label:'HOW YOU FEEL ABOUT MONEY', value:tq('mindset') || 'Not answered yet'}, {label:'HOW YOU TEND TO ACT', value:tq('behaviour') || 'Not answered yet'}, {label:'HOW MUCH RISK YOU WANT', value:riskOn != null && rr.want ? RISK_LBL[rr.want - 1] + (rr.provisional ? ' (first read)' : '') : 'Not assessed yet'}, {label:'HOW MUCH YOU CAN AFFORD TO LOSE', value:tq('capacity') ? tq('capacity') + ' (your answer)' : 'Not answered yet'}],
      riskScale:{title:'Risk profile', labels:RISK_LBL.slice(), activeIndex:riskOn != null && riskOn >= 0 ? riskOn : null},
      note:(riskOn == null ? 'Finish Understand me to add your indicative risk profile. ' : '') + (rr && rr.mis ? rr.mis : per ? 'Something to watch: ' + repLc(per.watch) : '')}};
  // ---- page 9 ----
  const needAssets = ['cash', 'invest', 'pension'].filter(k => !(S.src[k] && S.fin[k] != null && S.fin[k] !== '')), chk = [];
  if (needAssets.length) chk.push('Add your ' + [{cash:'cash savings', invest:'investments', pension:'pension value'}[needAssets[0]]].concat(needAssets.slice(1).map(k => ({cash:'cash savings', invest:'investments', pension:'pension value'}[k]))).join(', ').replace(/, ([^,]*)$/, ' and $1'));
  if (f.sp < 0.999) chk.push('Check your State Pension record on MyWelfare.ie');
  if (riskOn == null) chk.push('Finish “Understand me” for your risk profile');
  if (!(S.src.life && S.src.ip)) chk.push('Add your protection answers');
  if (!chk.length) chk.push('Bring your latest pension and bank statements');
  const tops = []; const addT = x => { if (!tops.includes(x)) tops.push(x); };
  S.goals.slice().sort((a, b) => P.pct[a.id] - P.pct[b.id] || a.age - b.age).forEach(g => { if (g.spec === 'pension'){ addT('Retirement planning'); addT('Pensions and tax relief'); } if (g.spec === 'mortgage'){ addT('Mortgages'); addT('Buying a home'); } if (g.spec === 'investment') addT('Investing'); if (g.spec === 'protection' && !(S.fin.ip !== 'Yes' && f.income > 0)) addT('Protection'); if (g.spec === 'planner') addT('Financial planning'); });
  if (f.sp < 0.999 || S.goals.some(g => g.spec === 'pension')) addT('State Pension'); if (S.fin.ip !== 'Yes' && f.income > 0) addT('Income protection'); if (f.debt > 1) addT('Clearing debt');
  const nextP = {eyebrow:'WHAT HAPPENS NEXT', title:'Share your plan with an expert', lead:'This guide is a starting point. An expert can confirm it, answer your questions and help you choose what to do.', button:'Meet an expert in the app', photo:'team-with-charts',
    steps:[{n:1, title:'Share your plan', text:'Send this guide to an expert, with your permission.'}, {n:2, title:'Meet your expert', text:'They check the numbers and your details.'}, {n:3, title:'Agree your personal plan', text:'Choose the steps that fit your life.'}],
    topics:{title:'An expert can help with', chips:tops.slice(0, 6)}, checklist:{title:'Before you meet', items:chk.slice(0, 4)}, questions:{title:'Questions to ask', items:reportQuestions(M, f, f.R)}, ready:{title:'Ready when you are', text:'Your plan stays private until you choose to share it.', button:'Meet an expert'}};
  // ---- page 10 ----
  const sp$ = f.sp > 0 ? eur(Math.round(AS.sp * f.sp)) + ' a year counted' : '€0 in this plan', mort = f.mortBal > 0 && S.fin.home === 'Own with mortgage';
  const left = [['Prices rise', pcs(AS.infl) + ' a year'], ['Pay rises', pcs(AS.wage) + ' a year'], ['Cash grows', pcs(AS.cash) + ' a year, after DIRT'], ['Investments grow', pcs(AS.inv) + ' a year, after charges and exit tax'], ['Pensions grow', pcs(AS.pen) + ' working, ' + pcs(AS.penRet) + ' once retired'], ['State Pension', sp$ + ' (full rate ' + eurW(RI.sp.week) + ' a week)']];
  const right = [['Tax', y0 + ' Irish income tax, USC, PRSI'], ['Saved towards goals', 'About ' + eur(mo.goalsM) + ' a month'], ['Emergency fund', SAVE.buffer + ' months kept aside'], ['Order of goals', S.rank ? 'Your own ranking' : 'Must-haves, then soonest first'], ['Retirement age', rg ? (retired ? 'Already retired' : String(f.R)) : 'No retirement goal'], ['Plan ends', 'Age ' + AS.end]];
  if (mort) right.push(['Mortgage rate', pcs(AS.mortRate) + (S.fin.mortRate ? ' (your statement)' : ' (assumed)')]);
  if (f.partner){ left.push(['Partner', f.pAge ? 'Age ' + f.pAge + (S.pRetSet ? ', stops work at ' + S.pRet : '') : 'Counted as your age']); }
  const glossary = [['Today’s money · future euros', 'Today’s prices, and amounts after prices rise.'], ['Inflation', 'How fast prices rise. This plan uses ' + pcs(AS.infl) + ' a year.'], ['Shortfall', 'The part of a year’s costs your plan cannot pay.'], ['Covered %', 'How much of a goal’s cost your income and savings meet.'], ['PRSA · ARF', 'A personal pension account · a fund you draw income from.'], ['State Pension', 'Government pension from ' + RI.sp.age + '. Full rate ' + eurW(RI.sp.week) + ' a week.'], ['USC · PRSI', 'Irish charges on pay. PRSI builds your State Pension record.'], ['Capacity for loss', 'How much you could afford to lose.'], ['My Future Fund', 'Ireland’s automatic workplace pension.']];
  const assumptions = {big:String(left.length + right.length), bigLabel:'things we assumed', eyebrow:'ASSUMPTIONS AND SMALL PRINT', title:'What your plan assumes', left, right,
    knownLimits:{title:'Known limits', items:['Living costs stay the same through the plan, apart from prices.', 'Drawdown is from an ARF or vested PRSA. Spare money not saved is assumed spent.', (RULES_YEAR === 2027 ? 'Budget 2027 rules (announced 6 Oct 2026) are used from 1 January 2027. The Finance Bill may still change some details.' : 'Irish rules checked 2 Oct 2026. Your plan starts in 2026, so Budget 2027 changes (from 1 January 2027) are not used.'), 'Capital gains tax is estimated on a share of the value of other assets, crypto, gold and art. Tax on life-policy lump sums, rental costs and gift or inheritance tax are not included yet.']},
    pleaseNote:{title:'Please note', text:'This is preliminary guidance, not financial advice. Only an authorised adviser can give advice. Investments can fall as well as rise. All projections are illustrative, not guaranteed. This tool is designed to help you explore your preferences. It does not replace a formal suitability or risk assessment where financial advice is provided.'},
    sources:'Sources: Revenue; Department of Social Protection; CSO flash inflation September 2026; ECB target; LifeMap plan engine.', glossary:{title:'Words used in this report', items:glossary}};
  // ---- page 11 ----
  const ap = rows.map(r => ({age:r.a, year:r.yr, income:Math.round(r.inflow), needs:Math.round(r.needs), shortfall:Math.round(rowParts(r).short), savingsLeft:Math.round(r.liquid)}));
  const appendix = {big:String(ap.length), bigLabel:'years in numbers', eyebrow:'APPENDIX', title:'Every year in numbers', columns:['Age (year)', 'Income', 'Needs', 'Shortfall', 'Savings left'], rows:ap,
    note:gap.hasGap ? 'Future euros. ' + gap.gapYears + ' shortfall years sum to ' + eur(gap.futureEuros) + ' (future euros) or about ' + gap.todayShort + ' in today’s money.' : 'Future euros. No shortfall years: your income and savings cover every year.'};
  const out = {schemaVersion:'1.0.0', meta, footer, road, cover, plan, money, roadmap, goalsDetail, cashflow, scenarios, foundations:foundationsP, next:nextP, assumptions, appendix};
  const curl = o => typeof o === 'string' ? o.replace(/(\w)'(\w)/g, '$1’$2') : Array.isArray(o) ? o.map(curl) : o && typeof o === 'object' ? Object.fromEntries(Object.entries(o).map(([k, v]) => [k, curl(v)])) : o;   // typographic apostrophes in every display string
  return curl(out); }
/* END REPORT DATA */
/* REPORT RENDERER */
/* Generated by tools/report/embed-renderer.js from tools/report/report-renderer.js. Edit the source file, not this copy. */
/*
 * LifeMap plan report renderer (journey-spec section 28, docs/report-spec.md).
 *
 *   LifeMapReport.reportPages(data, opts) -> { css, pages: [html, ...], count }
 *   LifeMapReport.reportDocument(data, opts) -> full standalone HTML string
 *
 * Pure: no engine access, no DOM, no network. `data` follows docs/report-data.schema.json.
 * The renderer never calculates money or sentences. It only turns raw numbers into geometry and
 * formats a few raw numbers (chart axes, appendix rows).
 * opts.photoSrc(name) -> URL or data URI for media/<name>.jpg   (default 'media/<name>.jpg')
 * Each page is a 794 x 1123 px (A4 at 96 dpi) <section class="lmr-pg">.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LifeMapReport = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var VERSION = '1.0.0';
  var W = 794, H = 1123;
  var COL = {
    navy: '#0b2545', navy2: '#13315c', teal: '#0a7068', tealMid: '#0f9d8f', mint: '#6be3d3',
    gold: '#f2b134', goldText: '#7a5200', coral: '#e8674a', coralText: '#b23a1f', blue: '#4a90d9',
    blueText: '#1f5f9f', muted: '#51627a', line: '#dfe5ea', bg: '#f3f7f9', tealTint: '#d9f2ee',
    tealTint2: '#e4f4f2', goldTint: '#fdf0d2', coralTint: '#fbe4dd', blueTint: '#e3eefa', grey: '#8a97a6'
  };

  // ---------- helpers ----------
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function has(s) { return s !== undefined && s !== null && String(s).trim() !== ''; }
  function commas(n) { return String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function eur(n) { return (n < 0 ? '-' : '') + '€' + commas(n); }
  function numOrDash(n) { return (!n || Math.round(n) === 0) ? '—' : commas(n); }
  function tone(t) { return t === 'alert' ? 'coral' : (t || 'navy'); }
  function bandTone(b) { return b === 'alert' ? 'coral' : b; }
  function pctTone(p) { return p >= 95 ? 'good' : (p >= 70 ? 'gold' : 'coral'); }
  function fillOf(t) {
    t = tone(t);
    return { good: COL.tealMid, teal: COL.teal, gold: COL.gold, coral: COL.coral, blue: COL.blue, navy: COL.navy, grey: COL.grey }[t] || COL.navy;
  }
  function textOf(t) {
    t = tone(t);
    return { good: COL.teal, teal: COL.teal, gold: COL.goldText, coral: COL.coralText, blue: COL.blueText, navy: COL.navy, grey: COL.muted }[t] || COL.navy;
  }
  function tintOf(t) {
    t = tone(t);
    return { good: COL.tealTint, teal: COL.tealTint, gold: COL.goldTint, coral: COL.coralTint, blue: COL.blueTint, navy: COL.bg, grey: COL.bg }[t] || COL.bg;
  }
  function arr(a) { return Array.isArray(a) ? a : []; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function num(v, d) { return (typeof v === 'number' && isFinite(v)) ? v : (d || 0); }

  // ---------- icons (24 x 24, stroke based) ----------
  function ico(name, size, color, sw) {
    size = size || 22; color = color || 'currentColor'; sw = sw || 1.8;
    var p;
    switch (name) {
      case 'sun':
        p = '<circle cx="12" cy="12" r="3.6"/><path d="M12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M5.6 18.4l1.7-1.7M16.7 7.3l1.7-1.7"/>'; break;
      case 'partly':
        p = '<circle cx="8" cy="8" r="2.6"/><path d="M8 2.4v1.2M2.4 8h1.2M3.9 3.9l.9.9M12.1 3.9l-.9.9"/><path d="M8.5 20.5h8.8a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.4 1.3 3 3 0 0 0 .2 5.7z"/>'; break;
      case 'storm':
        p = '<path d="M7.5 15.5a4 4 0 0 1-.3-7.9 5.2 5.2 0 0 1 9.9 1 3.5 3.5 0 0 1 .4 6.9"/><path d="M12.6 12.2 10.4 16h3.2l-2 4"/>'; break;
      case 'sunrise': case 'retire':
        p = '<path d="M5.5 17a6.5 6.5 0 0 1 13 0"/><path d="M3 17h18M12 5v2.4M4.6 9.6l1.7 1.5M19.4 9.6l-1.7 1.5M7 21h10"/>'; break;
      case 'family':
        p = '<circle cx="8" cy="7.5" r="3"/><circle cx="17" cy="9" r="2.3"/><path d="M2.8 20c.2-3.6 2.4-5.8 5.2-5.8s5 2.2 5.2 5.8M14.6 14.7c.8-.4 1.5-.5 2.4-.5 2.3 0 3.9 1.9 4.1 5"/>'; break;
      case 'compass':
        p = '<circle cx="12" cy="12" r="9"/><path d="m15.8 8.2-2 5.6-5.6 2 2-5.6z"/>'; break;
      case 'home': case 'house':
        p = '<path d="M3.5 11 12 4l8.5 7M5.5 9.8V20h13V9.8M10 20v-5.5h4V20"/>'; break;
      case 'car':
        p = '<path d="M4 16.5V12l1.8-4.5a1.5 1.5 0 0 1 1.4-1h9.6a1.5 1.5 0 0 1 1.4 1L20 12v4.5M4 12h16M4 16.5h16"/><circle cx="7.8" cy="16.6" r="1.6"/><circle cx="16.2" cy="16.6" r="1.6"/>'; break;
      case 'plane': case 'holiday':
        p = '<path d="M3 13.5 21 5l-4.5 15-4.2-5.2L9 18.5l.2-4.4z"/>'; break;
      case 'book': case 'education':
        p = '<path d="M3 6.5C5.5 5.2 8.3 5.2 12 7c3.7-1.8 6.5-1.8 9-.5V19c-2.5-1.3-5.3-1.3-9 .5-3.7-1.8-6.5-1.8-9-.5zM12 7v12.5"/>'; break;
      case 'shield':
        p = '<path d="M12 3 4.5 6v5.5c0 4.6 3 7.8 7.5 9.5 4.5-1.7 7.5-4.9 7.5-9.5V6z"/><path d="m8.8 12 2.3 2.3 4.2-4.6"/>'; break;
      case 'heart':
        p = '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/>'; break;
      case 'check':
        p = '<path d="m5 12.5 4.3 4.3L19 7.2"/>'; break;
      case 'target':
        p = '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1.2"/>'; break;
      default:
        p = '<path d="M12 3.5 14.6 9l5.9.7-4.4 4 1.2 5.8L12 16.7 6.7 19.5l1.2-5.8-4.4-4L9.4 9z"/>';
    }
    return '<svg class="lmr-ico" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="' + color +
      '" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + p + '</svg>';
  }
  function goalIcon(g) {
    var k = String(g.icon || g.kind || g.name || '').toLowerCase();
    var map = ['family', 'retire', 'home', 'house', 'car', 'plane', 'holiday', 'book', 'education', 'shield', 'heart', 'target', 'sun', 'partly', 'storm', 'compass', 'sunrise'];
    for (var i = 0; i < map.length; i++) if (k === map[i]) return map[i];
    if (/famil|baby|child/.test(k)) return 'family';
    if (/retire|pension/.test(k)) return 'retire';
    if (/home|house|mortgage|deposit/.test(k)) return 'home';
    if (/car|vehicle/.test(k)) return 'car';
    if (/holiday|travel|trip/.test(k)) return 'plane';
    if (/educat|school|college|study/.test(k)) return 'book';
    if (/emergen|protect|safe/.test(k)) return 'shield';
    if (/wedding|love|marr/.test(k)) return 'heart';
    return 'target';
  }
  function circleIcon(name, tn, size, inner) {
    size = size || 44;
    return '<span class="lmr-circ" style="width:' + size + 'px;height:' + size + 'px;background:' + tintOf(tn) + ';color:' + textOf(tn) + '">' +
      ico(name, inner || Math.round(size * 0.5), 'currentColor') + '</span>';
  }
  function logo(dark) {
    return '<span class="lmr-logo"><svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="' + COL.teal +
      '"/><path d="M8.2 16.4 14.6 7.8" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/><circle cx="14.9" cy="7.5" r="1.4" fill="#fff"/></svg><b>LifeMap</b></span>';
  }

  // ---------- CSS ----------
  var CSS = [
    '.lmr-pg{box-sizing:border-box;position:relative;width:794px;height:1123px;overflow:hidden;background:#fff;color:' + COL.navy + ';font-family:"Figtree","Helvetica Neue",Arial,sans-serif;font-size:14px;line-height:1.4;padding:0 56px;display:flex;flex-direction:column;-webkit-font-smoothing:antialiased}',
    '.lmr-pg *{box-sizing:border-box}',
    ':where(.lmr-pg) :is(h1,h2,h3,p){margin:0}',
    '.lmr-h,.lmr-big,.lmr-pg .lmr-hd{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;letter-spacing:-.01em}',
    '.lmr-rh{position:absolute;left:56px;right:56px;top:32px;height:24px;display:flex;justify-content:space-between;align-items:center;z-index:3}',
    '.lmr-logo{display:inline-flex;align-items:center;gap:8px;font-size:16px;font-weight:700}',
    '.lmr-logo b{font-weight:700}',
    '.lmr-rr{font-size:12px;color:' + COL.muted + '}',
    '.lmr-rf{position:absolute;left:56px;right:56px;bottom:0;height:55px;padding-top:11px;border-top:1px solid ' + COL.line + ';display:flex;justify-content:space-between;align-items:flex-start;font-size:11.5px;color:' + COL.muted + ';background:#fff}',
    '.lmr-body{flex:1;display:flex;flex-direction:column;min-height:0;padding-top:73px;padding-bottom:67px}',
    '.lmr-tb{display:flex;align-items:center;gap:26px;padding-bottom:15px;border-bottom:1px solid ' + COL.navy + ';flex:none}',
    '.lmr-bn{flex:none;max-width:330px}',
    '.lmr-bnum{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:64px;line-height:.98;letter-spacing:-.02em;white-space:nowrap;font-feature-settings:"tnum";font-variation-settings:"opsz" 96}',
    '.lmr-bl{font-size:12.5px;font-weight:700;color:' + COL.muted + ';margin-top:1px;line-height:1.2}',
    '.lmr-tx{min-width:0;flex:1}',
    '.lmr-ey{font-size:11px;font-weight:800;letter-spacing:.17em;text-transform:uppercase;color:' + COL.teal + ';margin-bottom:5px}',
    '.lmr-title{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:27.5px;line-height:1.12;letter-spacing:-.01em}',
    '.lmr-lead{font-size:14.5px;line-height:1.45;margin-top:5px;color:' + COL.navy + '}',
    '.lmr-chip{display:inline-flex;align-items:center;gap:6px;border-radius:99px;font-weight:800;font-size:12px;padding:4px 10px;white-space:nowrap}',
    '.lmr-circ{display:inline-flex;align-items:center;justify-content:center;border-radius:50%;flex:none}',
    '.lmr-ico{display:block;flex:none}',
    '.lmr-muted{color:' + COL.muted + '}',
    '.lmr-clamp2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}',
    '.lmr-clamp3{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}',
    /* cover */
    '.lmr-cover{padding:0;background:#fff}',
    '.lmr-cv-dark{position:absolute;left:0;top:0;width:794px;height:766px;background:linear-gradient(180deg,#0e2a52,#112d55 60%,#0f2a50)}',
    '.lmr-cv-bar{position:absolute;left:0;top:0;width:794px;height:7px;display:flex;z-index:4}',
    '.lmr-cv-photo{position:absolute;right:0;top:0;width:333px;height:341px;border-bottom-left-radius:200px;overflow:hidden}',
    '.lmr-cv-photo img{width:100%;height:100%;object-fit:cover;display:block;filter:saturate(.9) brightness(.82)}',
    '.lmr-cv-photo:after{content:"";position:absolute;inset:0;background:linear-gradient(120deg,rgba(11,37,69,.55),rgba(11,37,69,0) 55%)}',
    '.lmr-cv-badge{position:absolute;right:57px;top:50px;background:#0e2a4f;color:#fff;font-size:11px;font-weight:800;letter-spacing:.22em;padding:7px 14px;border-radius:10px;z-index:3}',
    '.lmr-cv-logo{position:absolute;left:56px;top:50px;color:#fff;z-index:3}',
    '.lmr-cv-ey{position:absolute;left:56px;top:136px;color:' + COL.mint + ';font-size:12px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;z-index:3}',
    '.lmr-cv-title{position:absolute;left:54px;top:166px;width:430px;color:#fff;font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:80px;line-height:.98;letter-spacing:-.025em;z-index:3;font-variation-settings:"opsz" 96}',
    '.lmr-cv-lead{position:absolute;left:56px;top:338px;width:440px;color:#e3eaf4;font-size:16.8px;line-height:1.42;z-index:3}',
    '.lmr-cv-road{position:absolute;left:0;top:380px;z-index:2}',
    '.lmr-cv-tiles{position:absolute;left:56px;right:56px;top:796px;display:flex;gap:20px}',
    '.lmr-cv-tile{flex:1;background:#f3f7f9;border-radius:22px;padding:16px 18px;display:flex;align-items:center;gap:12px;min-height:94px}',
    '.lmr-cv-tile .lmx-b{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:23px;line-height:1.1}',
    '.lmr-cv-tile .lmx-s{font-size:13px;color:' + COL.navy + ';line-height:1.3;margin-top:2px}',
    '.lmr-cv-foot{position:absolute;left:56px;right:56px;bottom:26px;font-size:11.5px;color:' + COL.muted + '}',
    /* p2 */
    '.lmr-goals{flex:1;display:flex;flex-direction:column;justify-content:space-around;min-height:0;padding:6px 0}',
    '.lmr-goal{display:flex;gap:20px;align-items:center;padding:14px 0}',
    '.lmr-goal+.lmr-goal{border-top:1px solid ' + COL.line + '}',
    '.lmr-goal .lmx-gc{flex:1;min-width:0}',
    '.lmr-goal .lmx-gn{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:20px;line-height:1.15}',
    '.lmr-goal .lmx-gm{font-size:12.5px;font-weight:700;margin-top:3px}',
    '.lmr-track{height:14px;background:#f3f6f8;border-radius:9px;overflow:hidden;margin:9px 0 8px}',
    '.lmr-fill{height:100%;border-radius:9px;min-width:12px}',
    '.lmr-goal .lmx-gs{font-size:13.5px;line-height:1.4}',
    '.lmr-goal .lmx-gp{width:126px;text-align:right;flex:none}',
    '.lmr-goal .lmx-gp .lmx-pc{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:46px;line-height:1;letter-spacing:-.02em}',
    '.lmr-goal .lmx-gp .lmr-chip{background:none;padding:6px 0 0;font-size:12px;justify-content:flex-end}',
    '.lmr-goal.cp{padding:7px 0;gap:14px}.lmr-goal.cp .lmx-gn{font-size:15px}.lmr-goal.cp .lmx-gm{font-size:11.5px;margin-top:1px}.lmr-goal.cp .lmr-track{margin:4px 0 0;height:9px}.lmr-goal.cp .lmx-gs{display:none}.lmr-goal.cp .lmx-gp{width:128px}.lmr-goal.cp .lmx-gp .lmx-pc{font-size:26px}.lmr-goal.cp .lmx-gp .lmr-chip{padding-top:2px;font-size:11px}.lmr-goal.cp .lmr-circ{width:34px!important;height:34px!important}',
    '.lmr-goals{overflow:hidden}.lmr-goal.cp .lmx-gp .lmr-chip{white-space:nowrap}.lmr-goal.cp{padding:5px 0}.lmr-goal.cp .lmr-track{height:8px;margin:3px 0 0}.lmr-goal.cp .lmx-gp .lmx-pc{font-size:24px}',
    '.lmr-more{font-size:13px;color:' + COL.muted + ';padding:6px 0 0;text-align:center}',
    '.lmr-gap{background:' + COL.navy2 + ';color:#fff;border-radius:20px;padding:22px 24px;display:flex;flex:none}',
    '.lmr-gap.pos{background:' + COL.teal + '}',
    '.lmr-gap .lmx-c{flex:1;padding:0 20px;border-left:1px solid rgba(255,255,255,.18)}',
    '.lmr-gap .lmx-c:first-child{padding-left:0;border-left:0}',
    '.lmr-gap .lmx-b{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:31px;line-height:1.1}',
    '.lmr-gap .lmx-s{font-size:13px;color:#cfdbec;margin-top:4px;line-height:1.35}',
    '.lmr-gap.pos .lmx-s{color:#e1f5f2}',
    '.lmr-close{margin-top:24px;flex:none}',
    '.lmr-h3{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:17px}',
    '.lmr-cols3{display:flex;gap:20px;margin-top:14px}',
    '.lmr-cols3>div{flex:1;border-top:6px solid;padding-top:12px;min-width:0}',
    '.lmr-cols3 .lmx-p{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:28px;line-height:1.1}',
    '.lmr-cols3 .lmx-t{font-weight:800;font-size:14.5px;margin-top:4px}',
    '.lmr-cols3 .lmx-x{font-size:13px;margin-top:3px;line-height:1.4}',
    '.lmr-banner{background:#eaf5f4;border-radius:22px;padding:22px 24px 22px 26px;display:flex;align-items:center;justify-content:space-between;gap:20px;margin-top:24px;flex:none}',
    '.lmr-banner .lmx-t{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:17px}',
    '.lmr-banner .lmx-x{font-size:13.5px;margin-top:3px}',
    '.lmr-btn{background:' + COL.teal + ';color:#fff;font-weight:800;font-size:14.5px;border-radius:99px;padding:14px 28px;white-space:nowrap;flex:none}',
    /* p3 */
    '.lmr-tiles{display:flex;gap:4px;margin-top:20px;height:112px;flex:none}',
    '.lmr-tile{border-radius:20px;padding:0 15px 15px;display:flex;flex-direction:column;justify-content:flex-end;min-width:0}',
    '.lmr-tile .lmx-l{font-size:12.5px;font-weight:800}',
    '.lmr-tile .lmx-v{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:24px;line-height:1.2;margin-top:6px}',
    '.lmr-tile.navy{background:' + COL.navy2 + ';color:#fff}.lmr-tile.teal{background:' + COL.teal + ';color:#fff}.lmr-tile.white{background:#fff;border:1px solid ' + COL.line + '}',
    '.lmr-sent{font-size:14.5px;line-height:1.5;margin-top:14px;flex:none}',
    '.lmr-ex{display:inline-block;background:' + COL.goldTint + ';border:1px solid #e9c46e;color:' + COL.goldText + ';font-size:11px;font-weight:800;border-radius:99px;padding:1px 9px;margin-left:4px;vertical-align:1px}',
    '.lmr-two{display:flex;gap:30px;margin-top:20px;flex:1;min-height:0}',
    '.lmr-two>.lmx-l{flex:0 0 340px;min-width:0}.lmr-two>.lmx-r{flex:1;min-width:0}',
    '.lmr-led-t{font-size:11px;font-weight:800;letter-spacing:.17em;text-transform:uppercase;color:' + COL.teal + ';border-bottom:1px solid ' + COL.navy + ';padding:8px 0 6px;margin-top:6px}',
    '.lmr-row{display:flex;justify-content:space-between;align-items:center;gap:10px;height:44px;border-bottom:1px solid ' + COL.line + ';font-size:14px}',
    '.lmr-row b{font-weight:800}',
    '.lmr-miss{border:1px dashed ' + COL.grey + ';color:' + COL.muted + ';font-size:11px;font-weight:800;border-radius:99px;padding:2px 10px;white-space:nowrap}',
    '.lmr-nw{display:flex;justify-content:space-between;align-items:center;border-top:1px solid ' + COL.navy + ';margin-top:8px;padding-top:12px;font-weight:800;font-size:14.5px}',
    '.lmr-plant{border-radius:22px;overflow:hidden;background:' + COL.navy2 + ';color:#fff}',
    '.lmr-plant img{display:block;width:100%;height:150px;object-fit:cover}',
    '.lmr-plant .lmx-in{padding:18px 20px 18px}',
    '.lmr-plant .lmx-e{font-size:11px;font-weight:800;letter-spacing:.14em;color:' + COL.mint + ';text-transform:uppercase}',
    '.lmr-plant .lmx-n{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:46px;line-height:1.1;margin-top:6px}.lmr-plant .lmx-n small{font-family:"Figtree",sans-serif;font-weight:500;font-size:18px;color:#b9c7dc;margin-left:6px}',
    '.lmr-prog{height:13px;border-radius:9px;background:#2c4670;margin:8px 0 12px;overflow:hidden}.lmr-prog i{display:block;height:100%;background:' + COL.mint + ';border-radius:9px}',
    '.lmr-plant .lmx-sb{font-size:13.5px}',
    '.lmr-it{display:flex;justify-content:space-between;align-items:center;gap:12px;height:57px;border-bottom:1px solid ' + COL.line + '}',
    '.lmr-it .lmx-t{font-weight:800;font-size:14.5px}.lmr-it .lmx-s{font-size:12.5px;color:' + COL.muted + '}',
    /* p4 */
    '.lmr-roadcard{background:' + COL.bg + ';border-radius:22px;margin-top:24px;height:190px;position:relative;flex:none;overflow:hidden}',
    '.lmr-dec{flex:1;display:flex;flex-direction:column;margin-top:16px;min-height:0}',
    '.lmr-drow{flex:1 1 auto;display:flex;align-items:stretch;min-height:0}',
    '.lmr-drow .lmx-a{flex:0 0 146px;display:flex;align-items:center;gap:12px}',
    '.lmr-drow .lmx-a .lmx-d{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:26px;line-height:1}',
    '.lmr-drow .lmx-a .lmx-r{font-size:12px;color:' + COL.muted + ';margin-top:2px}',
    '.lmr-drow .lmx-rail{flex:0 0 12px;margin-left:6px;margin-right:14px}',
    '.lmr-drow .lmx-m{flex:1;min-width:0;padding:10px 0;border-top:1px solid ' + COL.line + ';display:flex;flex-direction:column;justify-content:center}',
    '.lmr-drow:first-child .lmx-m{border-top:0}',
    '.lmr-drow .lmx-m .lmx-h{font-weight:800;font-size:15.5px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}',
    '.lmr-drow .lmx-m .lmx-x{font-size:13.5px;line-height:1.42;margin-top:2px}',
    '.lmr-gchip{display:inline-block;border:1px solid;border-radius:99px;font-size:12px;padding:2px 10px;margin-top:6px;margin-right:6px}',
    '.lmr-gchip b{font-weight:800;margin-right:4px}',
    '.lmr-drow .lmx-sp{flex:0 0 150px;padding:10px 0 10px 22px;border-top:1px solid ' + COL.line + ';font-size:11.5px;color:' + COL.muted + '}',
    '.lmr-drow:first-child .lmx-sp{border-top:0}',
    /* p5 */
    '.lmr-gcards{flex:1;display:flex;flex-direction:column;gap:16px;margin-top:16px;min-height:0}',
    '.lmr-gcard{display:flex;gap:0;min-height:0;position:relative}',
    '.lmr-gcard .lmx-rl{flex:0 0 8px;border-radius:3px;margin-right:8px;margin-left:-3px;margin-right:0}',
    '.lmr-gcard .lmx-l{flex:0 0 164px;padding:14px 0 0 22px}',
    '.lmr-gcard .lmx-l .lmx-pc{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:58px;line-height:1;letter-spacing:-.02em;margin-top:12px}',
    '.lmr-gcard .lmx-l .lmr-chip{background:none;padding:8px 0 0;font-size:12.5px}',
    '.lmr-gcard .lmx-rr2{flex:1;min-width:0;padding:10px 0 0 6px}',
    '.lmr-gcard .lmx-top{display:flex;gap:16px;align-items:flex-start}',
    '.lmr-gcard .lmx-top>div{flex:1;min-width:0}',
    '.lmr-gcard .lmx-gn{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:21px;line-height:1.15}',
    '.lmr-gcard .lmx-gm{font-size:13px;font-weight:700;margin-top:5px}',
    '.lmr-gcard .lmx-gs{font-size:13.5px;margin-top:6px;line-height:1.45}',
    '.lmr-gcard .lmx-ph{flex:0 0 160px;height:136px;border-radius:16px;overflow:hidden}.lmr-gcard .lmx-ph img{width:100%;height:100%;object-fit:cover;display:block}',
    '.lmr-bar{margin-top:14px}.lmr-bar .lmx-t{display:flex;justify-content:space-between;font-size:13.5px}.lmr-bar .lmx-t b{font-weight:800}',
    '.lmr-bar .lmr-track{height:15px;margin:7px 0 0;border-radius:9px;background:#f3f6f8}',
    '.lmr-note{font-size:12px;color:' + COL.muted + ';margin-top:10px;line-height:1.4}',
    '.lmr-yrs{margin-top:20px}',
    '.lmr-yrs .lmx-t{display:flex;justify-content:space-between;font-size:13px;font-weight:800;margin-bottom:8px}.lmr-yrs .lmx-t span:last-child{font-weight:500}',
    '.lmr-cells{display:flex;gap:3px;height:40px}.lmr-cells i{flex:1;border-radius:4px;min-width:1px}',
    '.lmr-yrs .lmx-lb{display:flex;justify-content:space-between;font-size:12px;font-weight:800;margin-top:8px}',
    '.lmr-how{background:' + COL.bg + ';border-radius:18px;padding:16px 20px;font-size:13.5px;line-height:1.5;flex:none;margin-top:16px}',
    /* p6 */
    '.lmr-card{background:' + COL.bg + ';border-radius:22px;padding:18px 16px 18px;margin-top:18px;flex:none}',
    '.lmr-card .lmx-ct{display:flex;justify-content:space-between;align-items:center;padding:0 0 2px 16px}',
    '.lmr-card .lmx-ct b{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:17px}',
    '.lmr-card .lmx-cap{font-size:13.5px;font-weight:800;margin:6px 0 0 16px}',
    '.lmr-card .lmx-cap2{font-size:12px;color:' + COL.muted + ';margin:2px 0 0 16px}.lmr-leg{display:flex;gap:16px;font-size:12px;color:' + COL.navy + '}.lmr-leg span{display:inline-flex;align-items:center;gap:6px}.lmr-leg i{width:12px;height:12px;border-radius:3px;display:inline-block}',
    /* p7 */
    '.lmr-sc{background:' + COL.bg + ';border-radius:22px;padding:20px 18px 12px;margin-top:20px;flex:none}',
    '.lmr-sc .lmx-hd{display:flex;align-items:flex-end;border-bottom:1px solid ' + COL.navy + ';padding:0 0 8px 0;font-size:11px;font-weight:800;letter-spacing:.14em;color:' + COL.muted + ';text-transform:uppercase}',
    '.lmr-sc .lmx-hd .lmx-a{flex:1}.lmr-sc .lmx-hd .lmx-b{width:90px;text-align:right}.lmr-sc .lmx-hd .lmx-c{width:92px;text-align:right;line-height:1.3}',
    '.lmr-sc .lmx-gt{font-size:11px;font-weight:800;letter-spacing:.17em;color:' + COL.teal + ';text-transform:uppercase;padding:14px 0 6px}',
    '.lmr-sc .lmx-rw{display:flex;align-items:center;min-height:46px;padding:5px 0}',
    '.lmr-sc .lmx-rw .lmx-a{flex:0 0 268px;min-width:0}.lmr-sc .lmx-rw .lmx-a b{display:block;font-weight:800;font-size:14.5px;line-height:1.25}.lmr-sc .lmx-rw .lmx-a span{display:block;font-size:12px;color:' + COL.muted + ';line-height:1.3;margin-top:1px}',
    '.lmr-sc .lmx-rw .lmx-bar{flex:1;height:14px;background:#fff;border-radius:9px;overflow:hidden;margin:0 16px 0 14px}.lmr-sc .lmx-rw .lmx-bar i{display:block;height:100%;border-radius:9px;min-width:10px}',
    '.lmr-sc .lmx-rw .lmx-p{width:56px;text-align:right;font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:18px}',
    '.lmr-sc .lmx-rw .lmx-g{width:86px;text-align:right;font-size:14px;color:' + COL.muted + '}',
    '.lmr-explore{background:' + COL.navy + ';color:#fff;border-radius:22px;padding:22px 24px;margin-top:22px;flex:none}',
    '.lmr-explore .lmx-t{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:18px;color:' + COL.mint + '}',
    '.lmr-explore .lmx-x{font-size:15px;line-height:1.5;margin-top:7px}',
    '.lmr-foot2{font-size:12px;color:' + COL.muted + ';margin-top:16px;line-height:1.5;flex:none}',
    /* p8 */
    '.lmr-f1{display:flex;gap:20px;margin-top:20px;flex:none}',
    '.lmr-pyr{flex:0 0 432px;background:#f8f5ee;border-radius:22px;padding:12px 0;display:flex;flex-direction:column;justify-content:space-between;height:452px}',
    '.lmr-lv{margin:0 auto;border:1px solid;border-radius:14px;padding:11px 14px;display:flex;gap:10px;align-items:center;min-height:62px}',
    '.lmr-lv .lmx-t{font-weight:800;font-size:14.5px;line-height:1.25}.lmr-lv .lmx-s{font-size:12px;font-weight:700;line-height:1.3;margin-top:2px}',
    '.lmr-prot{flex:1;min-width:0}',
    '.lmr-prot .lmx-ph{height:113px;border-radius:16px;overflow:hidden}.lmr-prot .lmx-ph img{width:100%;height:100%;object-fit:cover;display:block}',
    '.lmr-prot .lmx-pt{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:18px;margin:14px 0 4px}',
    '.lmr-prot .lmx-pr{display:flex;justify-content:space-between;height:41px;align-items:center;border-bottom:1px solid ' + COL.line + ';font-size:14px}.lmr-prot .lmx-pr b{font-weight:800}',
    '.lmr-nb{background:' + COL.bg + ';border-radius:14px;padding:13px 15px;margin-top:14px}.lmr-nb .lmx-e{font-size:11px;font-weight:800;letter-spacing:.14em;color:' + COL.teal + ';text-transform:uppercase}.lmr-nb .lmx-x{font-size:13.5px;line-height:1.4;margin-top:3px}',
    '.lmr-pers{background:' + COL.bg + ';border-radius:22px;padding:22px 22px 18px;margin-top:20px;flex:none}',
    '.lmr-pers .lmx-ph{display:flex;gap:16px;align-items:center}',
    '.lmr-pers .lmx-n{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:28px;line-height:1.1}',
    '.lmr-pers .lmx-st{font-size:14px;color:' + COL.muted + ';margin-top:3px}',
    '.lmr-quad{display:grid;grid-template-columns:1fr 1fr;gap:16px 36px;margin-top:20px}',
    '.lmr-quad .lmx-q{font-size:11px;font-weight:800;letter-spacing:.14em;color:' + COL.muted + ';text-transform:uppercase}.lmr-quad .lmx-v{font-weight:800;font-size:14.5px;margin-top:4px;line-height:1.3}',
    '.lmr-risk{margin-top:18px;font-size:12.5px;color:' + COL.muted + '}',
    '.lmr-scale{display:flex;gap:6px;margin-top:8px}.lmr-scale div{flex:1;background:#fff;border:1.5px solid #fff;border-radius:12px;min-height:46px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:12.5px;padding:4px 6px;color:' + COL.muted + ';line-height:1.2}',
    '.lmr-scale div.lmx-on{border-color:' + COL.teal + ';background:' + COL.tealTint + ';color:' + COL.teal + ';font-weight:800}',
    '.lmr-pers .lmx-nt{font-size:13.5px;line-height:1.45;margin-top:10px}',
    /* p9 */
    '.lmr-n9{background:' + COL.navy + ';height:394px;margin:0 -56px;position:relative;flex:none;overflow:hidden;color:#fff}',
    '.lmr-n9 .lmx-ph{position:absolute;right:0;top:0;width:370px;height:394px}.lmr-n9 .lmx-ph img{width:100%;height:100%;object-fit:cover;display:block;filter:brightness(.8)}',
    '.lmr-n9 .lmx-ph:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,' + COL.navy + ',rgba(11,37,69,0) 40%)}',
    '.lmr-n9 .lmx-tx{position:absolute;left:56px;top:84px;width:350px;z-index:2}',
    '.lmr-n9 .lmx-ey{font-size:11px;font-weight:800;letter-spacing:.17em;color:' + COL.mint + ';text-transform:uppercase}',
    '.lmr-n9 .lmx-tt{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:37px;line-height:1.08;margin-top:8px;letter-spacing:-.01em}',
    '.lmr-n9 .lmx-ld{font-size:16.5px;line-height:1.45;margin-top:14px;color:#dfe7f1}',
    '.lmr-n9 .lmx-bt{display:inline-block;background:' + COL.mint + ';color:' + COL.navy + ';font-weight:800;font-size:15.5px;border-radius:99px;padding:16px 28px;margin-top:26px}',
    '.lmr-body9{padding-top:0}',
    '.lmr-steps{display:flex;gap:20px;margin-top:18px;flex:none}',
    '.lmr-steps>div{flex:1;border-top:6px solid ' + COL.tealMid + ';padding-top:12px;display:flex;gap:10px;min-width:0}',
    '.lmr-steps .lmx-n{flex:0 0 28px;height:28px;border-radius:50%;background:' + COL.navy + ';color:#fff;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center}',
    '.lmr-steps .lmx-t{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:15.5px;line-height:1.2}.lmr-steps .lmx-x{font-size:13px;line-height:1.35;margin-top:3px}',
    '.lmr-two9{display:flex;gap:34px;margin-top:26px;flex:none}.lmr-two9>div{flex:1;min-width:0}',
    '.lmr-tchips{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.lmr-tchips span{background:' + COL.tealTint + ';color:' + COL.teal + ';font-weight:800;font-size:13px;border-radius:99px;padding:7px 14px}',
    '.lmr-ck{display:flex;gap:12px;margin-top:12px;font-size:14px;line-height:1.4}.lmr-ck i{flex:0 0 20px;height:20px;border:1.8px solid ' + COL.navy + ';border-radius:5px;margin-top:1px}',
    '.lmr-qs{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}.lmr-qs div{background:' + COL.bg + ';border-radius:16px;padding:16px 18px;font-size:14px;line-height:1.4}',
    '.lmr-sp{flex:1}',
    /* p10 */
    '.lmr-as{display:flex;gap:34px;margin-top:20px;flex:none}.lmr-as>div{flex:1;min-width:0}',
    '.lmr-ar{display:flex;justify-content:space-between;align-items:center;gap:14px;min-height:44px;padding:8px 0;border-bottom:1px solid ' + COL.line + ';font-size:14px}',
    '.lmr-ar b{font-weight:800}.lmr-ar .lmx-k{flex:0 0 auto;max-width:96px}.lmr-ar .lmx-v{margin-left:auto;text-align:right}.lmr-ar.lg .lmx-v{text-align:left;margin-left:0;flex:1}',
    '.lmr-two10{display:flex;gap:34px;margin-top:26px;flex:none}.lmr-two10>div{flex:1;min-width:0}',
    '.lmr-two10 ul{margin:10px 0 0;padding-left:20px;font-size:14px;line-height:1.5}.lmr-two10 li{margin-bottom:6px}.lmr-two10 p{font-size:14px;line-height:1.5;margin-top:10px}',
    '.lmr-src{font-size:12.5px;color:' + COL.muted + ';margin-top:22px;line-height:1.45}',
    '.lmr-gl{display:grid;grid-template-columns:repeat(3,1fr);gap:0 20px;margin-top:12px}',
    '.lmr-gl div{border-top:1px solid ' + COL.line + ';padding:7px 0 10px;min-height:59px}.lmr-gl b{display:block;font-size:13px;font-weight:800;line-height:1.25}.lmr-gl span{display:block;font-size:12.5px;line-height:1.35;color:' + COL.navy + ';margin-top:2px}',
    /* p11 */
    '.lmr-ap{display:flex;gap:34px;margin-top:18px;flex:none}.lmr-ap>div{flex:1;min-width:0}',
    '.lmr-ap table{width:100%;border-collapse:collapse;font-size:12.5px;font-variant-numeric:tabular-nums}',
    '.lmr-ap th{font-size:11px;font-weight:800;color:' + COL.muted + ';text-align:right;padding:6px 3px;border-bottom:1.5px solid ' + COL.navy + '}',
    '.lmr-ap th:first-child,.lmr-ap td:first-child{text-align:left;padding-left:0}',
    '.lmr-ap td{text-align:right;padding:0 3px;height:22.8px;border-bottom:1px solid ' + COL.line + '}',
    '.lmr-ap td.na{color:#5f6f84}.lmr-ap td.sf{color:' + COL.coralText + ';font-weight:800}',
    /* v5 fidelity overrides */
    '.lmr-goal .lmx-gn,.lmr-gcard .lmx-gn,.lmr-h3,.lmr-cols3 .lmx-t,.lmr-it .lmx-t,.lmr-drow .lmx-m .lmx-h,.lmr-banner .lmx-t,.lmr-steps .lmx-t,.lmr-sc .lmx-rw .lmx-a b,.lmr-lv .lmx-t,.lmr-prot .lmx-pt,.lmr-explore .lmx-t,.lmr-card .lmx-ct b,.lmr-gl b,.lmr-pers .lmx-n{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:700}',
    '.lmr-goal .lmx-gn{font-size:19.5px}.lmr-gcard .lmx-gn{font-size:19.5px}.lmr-cols3 .lmx-t{font-size:15px}.lmr-it .lmx-t{font-size:15px}',
    '.lmr-banner{padding:16px 24px 16px 26px}.lmr-gap{padding:19px 24px}.lmr-close{margin-top:17px}.lmr-cols3{margin-top:22px}',
    '.lmr-sent{font-size:14px;margin-top:20px}.lmr-tiles{height:113px}',
    '.lmr-plant img{height:160px}.lmr-plant .lmx-n{font-size:40px;margin-top:2px}.lmr-plant .lmx-in{padding:16px 20px 16px}.lmr-prog{height:12px;margin:6px 0 10px}.lmr-plant .lmx-sb{font-size:13px}',
    '.lmr-plant{margin-bottom:12px}',
    '.lmr-gcard .lmx-top>div:first-child{flex:1;min-width:0}.lmr-gcard .lmx-top>.lmx-ph{flex:0 0 160px}',
    '.lmr-gcard .lmx-l .lmx-pc{font-size:47px}.lmr-gcard .lmx-gm{font-size:12.5px}.lmr-gcard .lmx-gs{font-size:13px}.lmr-bar .lmx-t{font-size:13px}.lmr-how{font-size:13px;padding:14px 20px;line-height:1.5}',
    '.lmr-sc .lmx-rw{min-height:50px}.lmr-sc .lmx-rw .lmx-a{flex:0 0 298px;padding-right:10px}.lmr-sc .lmx-rw .lmx-a span{font-size:11.5px}.lmr-sc .lmx-rw .lmx-bar{flex:0 0 188px;margin:0 0 0 0}.lmr-sc .lmx-rw .lmx-p{width:69px}.lmr-sc .lmx-rw .lmx-g{width:87px}.lmr-sc .lmx-hd .lmx-b{width:71px}.lmr-sc .lmx-hd .lmx-c{width:85px}',
    '.lmr-explore{padding:18px 24px;margin-top:20px}.lmr-explore .lmx-x{font-size:14.5px;line-height:1.5}',
    '.lmr-quad{gap:12px 36px;margin-top:14px}.lmr-risk{margin-top:14px}',
    '.lmr-n9 .lmx-ld{font-size:16px}.lmr-n9 .lmx-tx{top:80px}.lmr-ck{font-size:13.5px}.lmr-qs div{font-size:13.5px}.lmr-steps .lmx-x{font-size:12.5px}',
    '.lmr-ar.lg .lmx-k{width:92px;max-width:92px}.lmr-ar .lmx-k{max-width:none}.lmr-two10 ul,.lmr-two10 p{font-size:14px;line-height:1.5}.lmr-ar{min-height:46px}',
    '.lmr-gl span{font-size:11.5px;color:' + COL.muted + '}.lmr-gl b{font-size:12.5px}.lmr-src{font-size:12px}',
    '.lmr-ap table{font-size:11.5px}.lmr-ap th{font-size:10.5px;padding:5px 3px}.lmr-ap td{height:22.8px}.lmr-ap th:first-child{width:78px}',
    '.lmr-as.dense .lmr-ar{min-height:39px;padding:4px 0}.lmr-as.dense~.lmr-two10{margin-top:18px}.lmr-as.dense~.lmr-src{margin-top:14px}.lmr-as.dense~.lmr-h3{margin-top:14px!important}',
    '.lmr-prot .lmx-pr{height:38px}.lmr-nb{padding:11px 14px;margin-top:10px}.lmr-nb .lmx-x{font-size:13px}.lmr-pers{margin-top:16px;padding:18px 22px 14px}.lmr-quad{margin-top:12px}.lmr-risk{margin-top:10px}.lmr-scale div{min-height:40px}.lmr-pers .nt{font-size:13px;margin-top:8px}',
    '.lmr-roadcard svg,.lmr-cv-road svg,.lmr-card svg{display:block}',
    '.lmr-ap{margin-top:12px}.lmr-arrow{display:inline-block;vertical-align:middle;margin:0 18px}',
    '@media print{.lmr-pg{break-after:page;page-break-after:always}}',
    '@page{size:A4;margin:0}'
  ].join('\n');

  // ---------- page frame ----------
  function frame(d, n, total, label, inner, extraCls) {
    return '<section class="lmr-pg ' + (extraCls || '') + '" data-page="' + n + '" role="group" aria-label="Page ' + n + ' of ' + total + ': ' + esc(label) + '">' +
      '<div class="lmr-rh">' + logo() + '<span class="lmr-rr">' + esc(d.meta.headerRight) + '</span></div>' +
      inner +
      '<div class="lmr-rf"><span>' + esc(d.footer.line) + '</span><span>' + n + ' / ' + total + '</span></div></section>';
  }
  function titleBlock(o) {
    return '<div class="lmr-tb"><div class="lmr-bn"><div class="lmr-bnum" style="color:' + textOf(o.bigTone || 'navy') + (String(o.big).length > 8 ? ';font-size:' + Math.max(34, Math.round(64 * 8 / String(o.big).length)) + 'px' : '') + '">' + esc(o.big) + '</div>' +
      (has(o.bigLabel) ? '<div class="lmr-bl">' + esc(o.bigLabel) + '</div>' : '') + '</div>' +
      '<div class="lmr-tx">' + (has(o.eyebrow) ? '<div class="lmr-ey">' + esc(o.eyebrow) + '</div>' : '') +
      '<h1 class="lmr-title">' + esc(o.title) + '</h1>' + (has(o.lead) ? '<p class="lmr-lead">' + esc(o.lead) + '</p>' : '') + '</div></div>';
  }
  function photo(opts, name, alt) {
    if (!has(name)) return '';
    var src = opts.photoSrc ? opts.photoSrc(name) : 'media/' + name + '.jpg';
    return '<img src="' + esc(src) + '" alt="' + esc(alt || '') + '">';
  }
  var ALT = {
    'money-plant': 'A potted money plant growing by a window',
    'retired-reading': 'A retired man reading a newspaper in an armchair',
    'car-and-calculator': 'A toy car, calculator and insurance papers',
    'house-for-sale': 'A house with a for-sale sign',
    'team-with-charts': 'A team of advisers around a table of charts',
    'magnifier-map': 'A hand holding a magnifying glass over a map'
  };

  // ---------- road (cover + page 4) ----------
  function roadSVG(road, o) {
    o = o || {};
    var w = o.w || 794, h = o.h || 270, x0 = o.x0, x1 = o.x1;
    var span = Math.max(1, road.endAge - road.startAge);
    var X = function (a) { return x0 + (a - road.startAge) / span * (x1 - x0); };
    // decorative S-wave, normalised heights (0 top .. 1 bottom), as in v5
    var pts = [[0, 0], [.21, 43], [.43, -11], [.61, -53], [.74, -37], [1, 30]];
    var k = o.k || 1, y0 = o.y0;
    function Yt(t) {
      var n = pts.length, i = 0;
      while (i < n - 2 && t > pts[i + 1][0]) i++;
      var p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
      var h = p2[0] - p1[0], u = clamp((t - p1[0]) / h, 0, 1);
      var m1 = (p2[1] - p0[1]) / (p2[0] - p0[0]) * h, m2 = (p3[1] - p1[1]) / (p3[0] - p1[0]) * h;
      var u2 = u * u, u3 = u2 * u;
      var v = (2 * u3 - 3 * u2 + 1) * p1[1] + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * p2[1] + (u3 - u2) * m2;
      return y0 + v * k;
    }
    function Y(a) { return Yt((a - road.startAge) / span); }
    function pathBetween(a, b) {
      var n = Math.max(6, Math.round((b - a) / span * 120)), d = '';
      for (var i = 0; i <= n; i++) { var ag = a + (b - a) * i / n; d += (i ? 'L' : 'M') + X(ag).toFixed(1) + ' ' + Y(ag).toFixed(1); }
      return d;
    }
    var s = '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Your road from age ' + road.startAge + ' to ' + road.endAge + '">';
    var full = pathBetween(road.startAge, road.endAge);
    s += '<path d="' + full + '" stroke="' + (o.glow || 'rgba(255,255,255,.28)') + '" stroke-width="22" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
    arr(road.segments).forEach(function (sg) {
      s += '<path d="' + pathBetween(sg.fromAge, sg.toAge) + '" stroke="' + fillOf(sg.tone) + '" stroke-width="10" fill="none" stroke-linecap="butt" stroke-linejoin="round"/>';
    });
    // rounded start / end caps in segment colours
    var segs = arr(road.segments);
    if (segs.length) {
      s += '<circle cx="' + X(segs[0].fromAge).toFixed(1) + '" cy="' + Y(segs[0].fromAge).toFixed(1) + '" r="5" fill="' + fillOf(segs[0].tone) + '"/>';
      var L = segs[segs.length - 1];
      s += '<circle cx="' + X(L.toAge).toFixed(1) + '" cy="' + Y(L.toAge).toFixed(1) + '" r="5" fill="' + fillOf(L.tone) + '"/>';
    }
    s += '<circle cx="' + X(road.startAge).toFixed(1) + '" cy="' + Y(road.startAge).toFixed(1) + '" r="8.5" fill="' + (o.dot || '#fff') + '" stroke="' + (o.dotStroke || COL.navy) + '" stroke-width="3"/>';
    // milestones: resolve collisions
    var ms = arr(road.milestones).slice().sort(function (a, b) { return a.age - b.age; });
    var lastSide = null, lastX = -999;
    ms.forEach(function (m) {
      var side = m.side === 'below' ? 'below' : 'above', mx = X(m.age);
      if (side === lastSide && Math.abs(mx - lastX) < 120) side = side === 'above' ? 'below' : 'above';
      lastSide = side; lastX = mx; m._side = side;
    });
    var tc = o.labelColor || '#fff', sc = o.subColor || '#cdd8e8';
    ms.forEach(function (m) {
      var mx = X(m.age), my = Y(m.age), up = m._side === 'above', cy = up ? my - (o.off || 64) : my + (o.off || 64);
      var col = fillOf(m.tone);
      s += '<line x1="' + mx.toFixed(1) + '" y1="' + (up ? cy + 15 : cy - 15) + '" x2="' + mx.toFixed(1) + '" y2="' + my.toFixed(1) + '" stroke="' + (o.stem || 'rgba(255,255,255,.55)') + '" stroke-width="1.2" stroke-dasharray="2 3"/>';
      s += '<circle cx="' + mx.toFixed(1) + '" cy="' + my.toFixed(1) + '" r="5.2" fill="#fff" stroke="' + col + '" stroke-width="2.5"/>';
      s += '<circle cx="' + mx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="15" fill="#fff" stroke="' + col + '" stroke-width="4"/>';
      s += '<text x="' + mx.toFixed(1) + '" y="' + (cy + 4.6).toFixed(1) + '" text-anchor="middle" font-family="Figtree,sans-serif" font-weight="800" font-size="13" fill="' + COL.navy + '">' + esc(m.badge) + '</text>';
      if (o.labels !== false) {
        var ly = up ? cy - 38 : cy + 33;
        s += '<text x="' + mx.toFixed(1) + '" y="' + ly + '" text-anchor="middle" font-family="Figtree,sans-serif" font-weight="800" font-size="14" fill="' + tc + '">' + esc(m.label) + '</text>';
        s += '<text x="' + mx.toFixed(1) + '" y="' + (ly + 16) + '" text-anchor="middle" font-family="Figtree,sans-serif" font-size="12" fill="' + sc + '">' + esc(m.sub) + '</text>';
      }
    });
    s += '<text x="' + (x0 - 8) + '" y="' + (h - 6) + '" font-family="Figtree,sans-serif" font-weight="800" font-size="13" fill="' + tc + '">' + esc(road.startLabel) + '</text>';
    s += '<text x="' + ((o.endX || x1 + 8)) + '" y="' + (h - 6) + '" text-anchor="end" font-family="Figtree,sans-serif" font-weight="800" font-size="13" fill="' + (o.endColor || sc) + '">' + esc(road.endLabel) + '</text>';
    return s + '</svg>';
  }

  // ---------- page 1 ----------
  function pCover(d, o, n, total) {
    var c = d.cover, h = '<section class="lmr-pg lmr-cover" data-page="1" role="group" aria-label="Page 1 of ' + total + ': Cover">';
    h += '<div class="lmr-cv-dark"></div>';
    h += '<div class="lmr-cv-bar"><i style="flex:3;background:' + COL.tealMid + '"></i><i style="flex:1;background:' + COL.gold + '"></i><i style="flex:1;background:' + COL.coral + '"></i></div>';
    h += '<div class="lmr-cv-photo">' + photo(o, 'magnifier-map', ALT['magnifier-map']) + '</div>';
    h += '<div class="lmr-cv-badge">' + esc(c.badge) + '</div>';
    h += '<div class="lmr-cv-logo">' + logo() + '</div>';
    h += '<div class="lmr-cv-ey">' + esc(c.eyebrow) + '</div>';
    h += '<h1 class="lmr-cv-title">' + esc(c.title) + '</h1>';
    h += '<p class="lmr-cv-lead">' + esc(c.lead) + '</p>';
    h += '<div class="lmr-cv-road">' + roadSVG(d.road, { w: 794, h: 282, x0: 111, x1: 747, y0: 148, off: 50, endX: 744 }) + '</div>';
    h += '<div class="lmr-cv-tiles">' + arr(c.tiles).map(function (t) {
      return '<div class="lmr-cv-tile">' + circleIcon(t.icon, t.tone, 36, 20) + '<div><div class="lmx-b lmr-hd" style="color:' + COL.navy + '">' + esc(t.big) + '</div><div class="lmx-s">' + esc(t.small) + '</div></div></div>';
    }).join('') + '</div>';
    h += '<div class="lmr-cv-foot">' + esc(d.footer.coverLine) + '</div></section>';
    return h;
  }

  // ---------- page 2 ----------
  function goalRow(g, compact) {
    var tn = bandTone(g.band), pc = clamp(num(g.pct), 0, 100);
    return '<div class="lmr-goal' + (compact ? ' cp' : '') + '">' + circleIcon(goalIcon(g), tn, 56, 26) +
      '<div class="lmx-gc"><div class="lmx-gn lmr-clamp2">' + esc(g.name) + '</div><div class="lmx-gm">' + esc(g.meta) + '</div>' +
      '<div class="lmr-track"><div class="lmr-fill" style="width:' + pc + '%;background:' + (tn === 'good' ? COL.teal : fillOf(tn)) + '"></div></div>' +
      '<div class="lmx-gs">' + esc(g.sentence) + '</div></div>' +
      '<div class="lmx-gp"><div class="lmx-pc" style="color:' + textOf(tn) + '">' + pc + '%</div><span class="lmr-chip" style="color:' + textOf(tn) + '">' +
      circleIcon(tn === 'good' ? 'sun' : (tn === 'gold' ? 'partly' : 'storm'), tn, 22, 14) + esc(g.bandText) + '</span></div></div>';
  }
  function pPlan(d, o, n, total) {
    var p = d.plan, gs = arr(p.goals), compact = gs.length > 3, rows, more = '';
    if (gs.length > 4) { rows = gs.slice(0, 4); more = '<div class="lmr-more">and ' + (gs.length - 4) + ' more goals. See the goal pages.</div>'; }
    else rows = gs;
    var body = titleBlock(p) + '<div class="lmr-goals">' + rows.map(function (g) { return goalRow(g, compact); }).join('') + more + '</div>';
    var cells = arr(p.band && p.band.cells);
    if (cells.length) body += '<div class="lmr-gap' + (p.band.kind === 'none' ? ' pos' : '') + '">' + cells.map(function (c) {
      return '<div class="lmx-c"><div class="lmx-b">' + esc(c.big) + '</div><div class="lmx-s">' + esc(c.small) + '</div></div>'; }).join('') + '</div>';
    var items = arr(p.close && p.close.items);
    if (items.length) body += '<div class="lmr-close"><div class="lmr-h3">' + esc(p.close.title) + '</div><div class="lmr-cols3">' + items.map(function (it) {
      return '<div style="border-color:' + fillOf(it.tone) + '"><div class="lmx-p">' + esc(it.points) + '</div><div class="lmx-t">' + esc(it.title) + '</div><div class="lmx-x">' + esc(it.text) + '</div></div>'; }).join('') + '</div></div>';
    if (p.next) body += '<div class="lmr-banner"><div><div class="lmx-t">' + esc(p.next.title) + '</div><div class="lmx-x">' + esc(p.next.text) + '</div></div><span class="lmr-btn">' + esc(p.next.button) + '</span></div>';
    return frame(d, n, total, 'Your plan on a page', '<div class="lmr-body">' + body + '</div>');
  }

  // ---------- page 3 ----------
  function ledger(l) {
    var rows = arr(l.rows);
    if (!rows.length) return '';
    return '<div class="lmr-led-t">' + esc(l.title) + '</div>' + rows.map(function (r) {
      var v = (r.status === 'missing') ? '<span class="lmr-miss">Missing</span>' : '<b>' + esc(r.value) + '</b>';
      return '<div class="lmr-row"><span>' + esc(r.label) + '</span>' + v + '</div>'; }).join('');
  }
  function pMoney(d, o, n, total) {
    var m = d.money, t = arr(m.tiles), tot = t.reduce(function (a, x) { return a + Math.max(0, num(x.amount)); }, 0) || 1;
    var sh = t.map(function (x) { return Math.max(0.19, Math.max(0, num(x.amount)) / tot); });
    var big = 0; sh.forEach(function (v, i) { if (v > sh[big]) big = i; });
    var rest = sh.reduce(function (a, v, i) { return i === big ? a : a + v; }, 0); sh[big] = 1 - rest;
    var body = titleBlock(m);
    body += '<div class="lmr-tiles">' + t.map(function (x, i) {
      return '<div class="lmr-tile ' + esc(x.tone) + '" style="flex:0 0 calc(' + (sh[i] * 100).toFixed(2) + '% - 3px)"><div class="lmx-l">' + esc(x.label) + '</div><div class="lmx-v">' + esc(x.value) + '</div></div>'; }).join('') + '</div>';
    body += '<p class="lmr-sent">' + esc(m.sentence) + ' ' + esc(m.takeHome) + (has(m.exampleChip) ? ' <span class="lmr-ex">' + esc(m.exampleChip) + '</span>' : '') + '</p>';
    var c = m.complete, pct = clamp(num(c.have) / Math.max(1, num(c.total)) * 100, 0, 100);
    var nw = m.netWorth || {};
    body += '<div class="lmr-two"><div class="lmx-l">' + ledger(m.own) + ledger(m.owe) +
      '<div class="lmr-nw"><span>' + esc(nw.label) + '</span>' + (has(nw.value) ? '<b>' + esc(nw.value) + '</b>' : '<span class="lmr-miss">' + esc(nw.status || 'not yet known') + '</span>') + '</div></div>' +
      '<div class="lmx-r"><div class="lmr-plant">' + photo(o, c.photo, ALT[c.photo]) + '<div class="lmx-in"><div class="lmx-e">' + esc(c.eyebrow) + '</div><div class="lmx-n">' + esc(c.have) + '<small>of ' + esc(c.total) + '</small></div><div class="lmr-prog"><i style="width:' + pct.toFixed(1) + '%"></i></div><div class="lmx-sb">' + esc(c.sub) + '</div></div></div>' +
      arr(c.items).map(function (it) {
        var pt = it.priority === 'High' ? 'coral' : (it.priority === 'Medium' ? 'gold' : 'good');
        return '<div class="lmr-it"><div><div class="lmx-t">' + esc(it.title) + '</div><div class="lmx-s">' + esc(it.sub) + '</div></div><span class="lmr-chip" style="background:' + tintOf(pt) + ';color:' + textOf(pt) + '">' + esc(it.priority) + '</span></div>'; }).join('') +
      '</div></div>';
    return frame(d, n, total, 'Your money today', '<div class="lmr-body">' + body + '</div>');
  }

  // ---------- sparkline ----------
  function spark(sp) {
    var v = arr(sp.values), g = arr(sp.gapYears), w = 128, h = 44, pad = 3;
    var s = '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true">';
    var mx = Math.max.apply(null, v.concat([0]));
    var n = v.length;
    if (!n) return s + '</svg>';
    var allGap = g.length && g.every(Boolean);
    function X(i) { return n === 1 ? w / 2 : pad + i * (w - 2 * pad) / (n - 1); }
    function Yv(x) { return mx <= 0 ? h - pad : (h - pad) - (x / mx) * (h - 2 * pad - 2); }
    if (mx <= 0) {
      var yy = allGap ? h - 14 : h - pad - 1;
      return s + '<line x1="' + pad + '" y1="' + yy + '" x2="' + (w - pad) + '" y2="' + yy + '" stroke="' + (allGap ? COL.coral : COL.grey) + '" stroke-width="2.6" stroke-linecap="round"/></svg>';
    }
    var anyGap = g.some(Boolean), col = anyGap ? COL.coral : COL.tealMid;
    var pts = v.map(function (x, i) { return X(i).toFixed(1) + ' ' + Yv(x).toFixed(1); });
    s += '<path d="M' + X(0).toFixed(1) + ' ' + (h - pad) + ' L' + pts.join(' L') + ' L' + X(n - 1).toFixed(1) + ' ' + (h - pad) + 'Z" fill="' + (anyGap ? COL.coralTint : COL.tealTint) + '"/>';
    s += '<path d="M' + pts.join(' L') + '" fill="none" stroke="' + col + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
    s += '<line x1="' + pad + '" y1="' + (h - pad) + '" x2="' + (w - pad) + '" y2="' + (h - pad) + '" stroke="' + (anyGap ? COL.coral : COL.tealMid) + '" stroke-width="' + (anyGap ? 2.2 : 0) + '"/>';
    return s + '</svg>';
  }

  // ---------- page 4 ----------
  function pRoadmap(d, o, n, total) {
    var r = d.roadmap, body = titleBlock(r);
    body += '<div class="lmr-roadcard">' + roadSVG(d.road, { w: 681, h: 190, x0: 36, x1: 648, y0: 102, k: 0.72, off: 46, endX: 640, labelColor: COL.navy, subColor: COL.muted, glow: '#dce5ec', stem: '#9aa8b8', endColor: COL.muted, labels: false }) + '</div>';
    body += '<div class="lmr-dec">' + arr(r.decades).map(function (x) {
      var tn = tone(x.tone);
      return '<div class="lmr-drow"><div class="lmx-a">' + circleIcon(x.icon, tn, 52, 26) + '<div><div class="lmx-d">' + esc(x.label) + '</div><div class="lmx-r">' + esc(x.range) + '</div></div></div>' +
        '<div class="lmx-rail" style="background:' + fillOf(tn) + '"></div>' +
        '<div class="lmx-m"><div class="lmx-h">' + esc(x.title) + '<span class="lmr-chip" style="background:' + tintOf(tn) + ';color:' + textOf(tn) + '">' + esc(x.chip) + '</span></div><div class="lmx-x">' + esc(x.text) + '</div>' +
        (arr(x.goalChips).length ? '<div>' + arr(x.goalChips).slice(0, 4).map(function (gc) { return '<span class="lmr-gchip" style="border-color:' + fillOf(gc.tone) + '"><b>' + esc(gc.age) + '</b>' + esc(gc.text) + '</span>'; }).join('') + '</div>' : '') + '</div>' +
        '<div class="lmx-sp"><div>' + esc(x.spark && x.spark.label) + '</div>' + (x.spark ? spark(x.spark) : '') + '</div></div>'; }).join('') + '</div>';
    return frame(d, n, total, 'Your roadmap', '<div class="lmr-body">' + body + '</div>');
  }

  // ---------- page 5 (goal cards, repeats) ----------
  function goalCard(g, o, weight) {
    var tn = bandTone(g.band), col = tn === 'good' ? COL.tealMid : fillOf(tn), b = g.bars || {}, pc = clamp(num(g.pct), 0, 100);
    var h = '<div class="lmr-gcard" style="flex:' + weight + ' 1 0"><div class="lmx-rl" style="background:' + col + '"></div><div class="lmx-l">' + circleIcon(goalIcon(g), tn, 46, 24) +
      '<div class="lmx-pc" style="color:' + textOf(tn) + '">' + pc + '%</div><span class="lmr-chip" style="color:' + textOf(tn) + '">' + circleIcon(tn === 'good' ? 'sun' : (tn === 'gold' ? 'partly' : 'storm'), tn, 22, 14) + esc(g.bandText) + '</span></div>' +
      '<div class="lmx-rr2"><div class="lmx-top"><div><div class="lmx-gn lmr-clamp2">' + esc(g.name) + '</div><div class="lmx-gm">' + esc(g.meta) + '</div><div class="lmx-gs">' + esc(g.sentence) + '</div></div>' +
      (g.photo ? '<div class="lmx-ph">' + photo(o, g.photo, ALT[g.photo]) + '</div>' : '') + '</div>';
    function bar(l, v, p, c) {
      return '<div class="lmr-bar"><div class="lmx-t"><span>' + esc(l) + '</span><b>' + esc(v) + '</b></div><div class="lmr-track"><div class="lmr-fill" style="width:' + clamp(num(p), 0, 100) + '%;background:' + c + '"></div></div></div>'; }
    if (b.type === 'retire') {
      h += bar(b.costLabel, b.costValue, b.costPct, COL.navy) + bar(b.coverLabel, b.coverValue, b.coverPct, col === COL.tealMid ? COL.teal : col);
    } else if (b.type === 'saving') {
      h += bar(b.needLabel, b.needValue, b.needPct, COL.navy) + bar(b.putLabel, b.putValue, b.putPct, col === COL.tealMid ? COL.teal : col);
    }
    if (has(b.note)) h += '<div class="lmr-note">' + esc(b.note) + '</div>';
    var y = g.years;
    if (y && arr(y.cells).length) {
      h += '<div class="lmr-yrs"><div class="lmx-t"><span>' + esc(y.title) + '</span><span>' + esc(y.summary) + '</span></div><div class="lmr-cells" role="img" aria-label="' + esc(y.title + ': ' + y.summary) + '">' +
        y.cells.map(function (c) { return '<i style="background:' + ({ pension: COL.tealMid, savings: COL.gold, gap: COL.coral, none: '#e3e8ed' }[c.state] || '#e3e8ed') + '"></i>'; }).join('') + '</div>' +
        '<div class="lmx-lb"><span style="color:' + COL.goldText + '">' + esc(y.leftLabel) + '</span><span style="color:' + COL.coralText + '">' + esc(y.rightLabel) + '</span></div></div>';
    }
    return h + '</div></div>';
  }
  function goalPages(d, o) {
    var g = arr(d.goalsDetail.goals), pages = [], cur = [], units = 0;
    g.forEach(function (x) {
      var wgt = (x.bars && x.bars.type === 'retire') || (x.years && arr(x.years.cells).length) ? 2.1 : 1;
      if (cur.length && units + wgt > 3.2) { pages.push(cur); cur = []; units = 0; }
      cur.push({ g: x, w: wgt }); units += wgt;
    });
    if (cur.length) pages.push(cur);
    if (!pages.length) pages.push([]);
    return pages;
  }
  function pGoals(d, o, n, total, pg, idx, cnt) {
    var gd = d.goalsDetail, tb = titleBlock(gd);
    var bigOk = !/Infinity|NaN|undefined/.test(String(gd.big)); if (!bigOk) tb = titleBlock({ big: '\u2014', bigLabel: '', bigTone: 'navy', eyebrow: gd.eyebrow, title: gd.title });
    var body = tb + (pg.length ? '' : '<p class="lmr-lead" style="margin-top:24px">No goals yet. Add a goal in the app and it appears here.</p>') + '<div class="lmr-gcards">' + pg.map(function (x) { return goalCard(x.g, o, pg.length === 1 ? 1 : x.w); }).join('') + '</div>';
    if (idx === cnt - 1 && has(gd.howToRead)) body += '<div class="lmr-how">' + howHTML(gd.howToRead) + '</div>';
    return frame(d, n, total, 'Your goals in detail' + (cnt > 1 ? ' (' + (idx + 1) + ' of ' + cnt + ')' : ''), '<div class="lmr-body">' + body + '</div>');
  }
  function howHTML(s) {
    // bold the lead-in phrases the way v5 does: "How to read this page." and the two money terms
    var t = esc(s);
    t = t.replace(/^(How to read this page\.)/, '<b>$1</b>').replace(/(Today’s money)(?= shows)/, '<b>$1</b>').replace(/(future euros)(?= add)/, '<b>$1</b>').replace(/(Covered)(?= is)/, '<b>$1</b>');
    return t;
  }

  // ---------- page 6 charts ----------
  function money(v) { return v === 0 ? '€0' : (v >= 1e6 ? '€' + (v / 1e6) + 'm' : '€' + (v / 1000) + 'k'); }
  function zoneRects(zones, X, y0, y1, labelY) {
    var s = '';
    arr(zones).forEach(function (z) {
      var col = { good: COL.tealTint2, gold: '#f8f3e3', coral: '#f7ece9' }[z.tone] || '#eee';
      s += '<rect x="' + X(z.fromAge).toFixed(1) + '" y="' + y0 + '" width="' + Math.max(0, X(z.toAge) - X(z.fromAge)).toFixed(1) + '" height="' + (y1 - y0) + '" fill="' + col + '"/>';
    });
    arr(zones).forEach(function (z) {
      if (has(z.label)) s += '<text x="' + ((X(z.fromAge) + X(z.toAge)) / 2).toFixed(1) + '" y="' + labelY + '" text-anchor="middle" font-family="Figtree,sans-serif" font-weight="800" font-size="12" letter-spacing="1.4" fill="' + textOf(z.tone) + '">' + esc(z.label) + '</text>';
    });
    return s;
  }
  function savingsSVG(c) {
    var w = 649, h = 300, L = 54, R = 640, T = 31, B = 269;
    var ser = arr(c.series); if (!ser.length) return '';
    var a0 = ser[0].age, a1 = ser[ser.length - 1].age, span = Math.max(1, a1 - a0);
    var X = function (a) { return L + (a - a0) / span * (R - L); };
    var Y = function (v) { return B - clamp(v / c.yMax, 0, 1) * (B - T); };
    var s = '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + esc(c.caption) + '"><defs><linearGradient id="lmrSg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + COL.tealMid + '" stop-opacity=".45"/><stop offset="1" stop-color="' + COL.tealMid + '" stop-opacity=".05"/></linearGradient></defs>';
    s += zoneRects(c.zones, X, T - 3, B, 18);
    arr(c.yTicks).forEach(function (t) {
      s += '<line x1="' + L + '" y1="' + Y(t).toFixed(1) + '" x2="' + R + '" y2="' + Y(t).toFixed(1) + '" stroke="#fff" stroke-width="1.4"/><text x="' + (L - 12) + '" y="' + (Y(t) + 4).toFixed(1) + '" text-anchor="end" font-family="Figtree,sans-serif" font-size="12" fill="' + COL.muted + '">' + money(t) + '</text>'; });
    var ro = c.runOut, endIdx = ser.length - 1;
    var lastPos = -1; ser.forEach(function (p, i) { if (p.value > 0) lastPos = i; });
    var upto = ro ? ser.filter(function (p) { return p.age <= ro.age; }) : ser;
    var pts = upto.map(function (p) { return X(p.age).toFixed(1) + ' ' + Y(p.value).toFixed(1); });
    if (upto.length > 1) {
      s += '<path d="M' + X(upto[0].age).toFixed(1) + ' ' + B + ' L' + pts.join(' L') + ' L' + X(upto[upto.length - 1].age).toFixed(1) + ' ' + B + 'Z" fill="url(#lmrSg)"/>';
      s += '<path d="M' + pts.join(' L') + '" fill="none" stroke="' + COL.teal + '" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>';
    }
    if (ro) {
      s += '<line x1="' + X(ro.age).toFixed(1) + '" y1="' + B + '" x2="' + R + '" y2="' + B + '" stroke="' + COL.coral + '" stroke-width="4" stroke-linecap="round"/>';
      s += '<text x="' + R + '" y="' + (B - 11) + '" text-anchor="end" font-family="Figtree,sans-serif" font-weight="800" font-size="12.5" fill="' + COL.coralText + '">' + esc(ro.label) + '</text>';
    }
    if (c.peak) {
      var px = X(c.peak.age), py = Y(c.peak.value), left = px > L + (R - L) * 0.4;
      s += '<circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="5.5" fill="' + COL.navy + '" stroke="#fff" stroke-width="2"/>';
      var tx = left ? px - 14 : px + 14, anch = left ? 'end' : 'start', flat = false;
      (function () { var near = ser.filter(function (q) { return q.age >= c.peak.age - 4 && q.age < c.peak.age; }); flat = near.length && near.every(function (q) { return q.value >= c.peak.value * 0.85; }) && py > T + 34; })();
      if (flat) {
        s += '<text x="' + clamp(px, L + 90, R).toFixed(1) + '" y="' + (py - 24).toFixed(1) + '" text-anchor="end" font-family="Figtree,sans-serif" font-weight="800" font-size="13" fill="' + COL.navy + '">' + esc(c.peak.label) + '</text>';
        if (has(c.peak.sub)) s += '<text x="' + clamp(px, L + 90, R).toFixed(1) + '" y="' + (py - 10).toFixed(1) + '" text-anchor="end" font-family="Figtree,sans-serif" font-size="12" fill="' + COL.muted + '">' + esc(c.peak.sub) + '</text>';
        return s + xTicks(a0, a1, X, B + 23, null) + '</svg>';
      }
      s += '<text x="' + tx.toFixed(1) + '" y="' + (py + 4).toFixed(1) + '" text-anchor="' + anch + '" font-family="Figtree,sans-serif" font-weight="800" font-size="13" fill="' + COL.navy + '">' + esc(c.peak.label) + '</text>';
      if (has(c.peak.sub)) s += '<text x="' + tx.toFixed(1) + '" y="' + (py + 19).toFixed(1) + '" text-anchor="' + anch + '" font-family="Figtree,sans-serif" font-size="12" fill="' + COL.muted + '">' + esc(c.peak.sub) + '</text>';
    }
    s += xTicks(a0, a1, X, B + 23, null);
    return s + '</svg>';
  }
  function xTicks(a0, a1, X, y, slot) {
    var s = '';
    for (var a = Math.ceil(a0 / 10) * 10; a <= a1; a += 10) s += '<text x="' + (slot ? slot(a) : X(a)).toFixed(1) + '" y="' + y + '" text-anchor="middle" font-family="Figtree,sans-serif" font-size="12.5" fill="' + COL.muted + '">' + a + '</text>';
    return s;
  }
  function paidSVG(c) {
    var w = 649, h = 300, L = 54, R = 640, T = 31, B = 269, bars = arr(c.bars); if (!bars.length) return '';
    var a0 = bars[0].age, a1 = bars[bars.length - 1].age, nb = bars.length, slot = (R - L) / nb;
    var X = function (a) { return L + (a - a0) * slot; };
    var XC = function (a) { return L + (a - a0 + .5) * slot; };
    var Y = function (v) { return B - clamp(v / c.yMax, 0, 1) * (B - T); };
    var s = '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + esc(c.caption) + '"><defs><pattern id="lmrHatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="' + COL.coral + '"/><rect width="2" height="5" fill="#fff" fill-opacity=".38"/></pattern></defs>';
    s += zoneRects(c.zones, function (a) { return a <= a0 ? L : (a >= a1 ? R : X(a)); }, T - 3, B, 18);
    arr(c.yTicks).forEach(function (t) {
      s += '<line x1="' + L + '" y1="' + Y(t).toFixed(1) + '" x2="' + R + '" y2="' + Y(t).toFixed(1) + '" stroke="#fff" stroke-width="1.4"/><text x="' + (L - 12) + '" y="' + (Y(t) + 4).toFixed(1) + '" text-anchor="end" font-family="Figtree,sans-serif" font-size="12" fill="' + COL.muted + '">' + money(t) + '</text>'; });
    var bw = Math.max(1.2, slot - 1.6);
    bars.forEach(function (b) {
      var x = XC(b.age) - bw / 2, y = B, hh;
      hh = (num(b.fromIncome) / c.yMax) * (B - T); if (hh > 0) { s += '<rect x="' + x.toFixed(1) + '" y="' + (y - hh).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + hh.toFixed(1) + '" fill="' + COL.tealMid + '"/>'; y -= hh; }
      hh = (num(b.fromSavings) / c.yMax) * (B - T); if (hh > 0) { s += '<rect x="' + x.toFixed(1) + '" y="' + (y - hh).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + hh.toFixed(1) + '" fill="' + COL.gold + '"/>'; y -= hh; }
      hh = (num(b.shortfall) / c.yMax) * (B - T); if (hh > 0) { s += '<rect x="' + x.toFixed(1) + '" y="' + (y - hh).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + hh.toFixed(1) + '" fill="url(#lmrHatch)"/>'; }
    });
    if (c.stopMarker) {
      var sx = X(c.stopMarker.age), stopTot = 0; bars.forEach(function (q) { if (q.age >= c.stopMarker.age - 1 && q.age <= c.stopMarker.age + 1) stopTot = Math.max(stopTot, num(q.fromIncome) + num(q.fromSavings) + num(q.shortfall)); });
      s += '<text x="' + (sx - 8).toFixed(1) + '" y="' + Math.min(Y(c.yMax * 0.64) - 10, Y(stopTot) - 14).toFixed(1) + '" text-anchor="end" font-family="Figtree,sans-serif" font-weight="800" font-size="12.5" fill="' + COL.navy + '">' + esc(c.stopMarker.label) + '</text>';
    }
    if (c.lastLabel) {
      var lb = bars[bars.length - 1], tot = num(lb.fromIncome) + num(lb.fromSavings) + num(lb.shortfall);
      s += '<text x="' + R + '" y="' + (Y(tot) - 9).toFixed(1) + '" text-anchor="end" font-family="Figtree,sans-serif" font-weight="800" font-size="12.5" fill="' + COL.navy + '">' + esc(c.lastLabel.label) + '</text>';
    }
    s += xTicks(a0, a1, X, B + 23, XC);
    return s + '</svg>';
  }
  function pCash(d, o, n, total) {
    var c = d.cashflow, s = c.savingsChart, p = c.paidChart;
    var body = titleBlock(c);
    body += '<div class="lmr-card"><div class="lmx-ct"><b>' + esc(s.title) + '</b><span class="lmr-muted" style="font-size:12px">' + esc(s.subtitle) + '</span></div>' + savingsSVG(s) + '<div class="lmx-cap">' + esc(s.caption) + '</div></div>';
    body += '<div class="lmr-card"><div class="lmx-ct"><b>' + esc(p.title) + '</b><span class="lmr-leg">' + arr(p.legend).map(function (l) {
      return '<span><i style="background:' + (l.tone === 'coral' ? COL.coral : fillOf(l.tone === 'good' ? 'teal' : l.tone)) + '"></i>' + esc(l.label) + '</span>'; }).join('') + '</span></div>' + paidSVG(p) + '<div class="lmx-cap">' + esc(p.caption) + '</div><div class="lmx-cap2">Each bar is living costs plus any goal payments.</div></div>';
    return frame(d, n, total, 'Cashflow', '<div class="lmr-body">' + body + '</div>');
  }

  // ---------- page 7 ----------
  function pScen(d, o, n, total) {
    var sc = d.scenarios;
    var big = esc(sc.fromPct) + '% <span style="color:' + COL.coralText + ';font-size:44px">→</span> ' + esc(sc.toPct) + '%';
    var tb = '<div class="lmr-tb"><div class="lmr-bn"><div class="lmr-bnum"><span style="color:' + textOf(sc.fromTone) + '">' + esc(sc.fromPct) + '%</span> <svg class="lmr-arrow" width="40" height="22" viewBox="0 0 40 22" aria-hidden="true"><path d="M2 11h33M26 3l9 8-9 8" stroke="' + COL.coralText + '" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg> <span style="color:' + textOf(sc.toTone) + '">' + esc(sc.toPct) + '%</span></div><div class="lmr-bl">retirement covered</div></div><div class="lmr-tx"><div class="lmr-ey">' + esc(sc.eyebrow) + '</div><h1 class="lmr-title">' + esc(sc.title) + '</h1></div></div>';
    var body = tb;
    if (arr(sc.groups).length) {
      body += '<div class="lmr-sc"><div class="lmx-hd"><span class="lmx-a">' + esc(sc.columns.what) + '</span><span class="lmx-b">' + esc(sc.columns.covered) + '</span><span class="lmx-c">' + esc(sc.columns.gap) + '</span></div>';
      sc.groups.forEach(function (g) {
        body += '<div class="lmx-gt">' + esc(g.title) + '</div>';
        arr(g.rows).forEach(function (r) {
          var pc = clamp(num(r.pct), 0, 100), tn = pctTone(pc);
          body += '<div class="lmr-sc"><div class="lmx-rw" style="display:flex"></div></div>'.slice(0, 0) +
            '<div class="lmx-rw"><div class="lmx-a"><b style="' + (r.emphasis ? 'color:' + COL.coralText : '') + '">' + esc(r.title) + '</b><span>' + esc(r.sub) + '</span></div>' +
            '<div class="lmx-bar"><i style="width:' + pc + '%;background:' + fillOf(tn) + '"></i></div><div class="lmx-p">' + pc + '%</div><div class="lmx-g">' + (r.gapStartsAge == null ? 'None' : esc(r.gapStartsAge)) + '</div></div>';
        });
      });
      body += '</div>';
    }
    if (sc.explore) body += '<div class="lmr-explore"><div class="lmx-t">' + esc(sc.explore.title) + '</div><div class="lmx-x">' + esc(sc.explore.text) + '</div></div>';
    if (has(sc.footnote)) body += '<div class="lmr-foot2">' + esc(sc.footnote) + '</div>';
    return frame(d, n, total, 'What could change the answer', '<div class="lmr-body">' + body + '</div>');
  }

  // ---------- page 8 ----------
  function pFound(d, o, n, total) {
    var f = d.foundations, lv = arr(f.levels).slice().sort(function (a, b) { return b.level - a.level; });
    var body = titleBlock(f);
    var sty = { good: [COL.tealTint, COL.tealMid, COL.teal], gold: [COL.goldTint, COL.gold, COL.goldText], coral: [COL.coralTint, COL.coral, COL.coralText], grey: [COL.bg, '#bdc4cd', COL.muted], blue: [COL.blueTint, COL.blue, COL.blueText], navy: [COL.bg, '#bdc4cd', COL.navy], teal: [COL.tealTint, COL.tealMid, COL.teal] };
    var wid = [58, 66, 74, 83, 91];
    var pyr = lv.map(function (l, i) {
      var st = sty[tone(l.tone)] || sty.grey, wi = wid[Math.min(4, Math.max(0, 5 - (lv.length - i)) + (5 - lv.length >= 0 ? 0 : 0))];
      wi = wid[Math.round(i * 4 / Math.max(1, lv.length - 1))];
      return '<div class="lmr-lv" style="width:' + wi + '%;background:' + st[0] + ';border-color:' + st[1] + '">' + circleIcon(l.icon, tone(l.tone) === 'grey' ? 'gold' : l.tone, 32, 20) +
        '<div><div class="lmx-t">' + esc(l.title) + '</div><div class="lmx-s" style="color:' + st[2] + '">' + esc(l.status) + '</div></div></div>'; }).join('');
    var pr = f.protection || {};
    body += '<div class="lmr-f1"><div class="lmr-pyr" style="height:' + (String((f.personality || {}).note || '').length > 170 ? 426 : 452) + 'px" role="img" aria-label="Five foundations from the bottom up">' + pyr + '</div><div class="lmr-prot"><div class="lmx-ph" style="height:' + (String((pr.nextBest || {}).text || '').length > 110 ? 76 : 113) + 'px">' + photo(o, pr.photo, ALT[pr.photo]) + '</div><div class="lmx-pt">' + esc(pr.title) + '</div>' +
      arr(pr.rows).map(function (r) { var c = r.good === true ? COL.teal : (r.good === false ? COL.coralText : COL.navy); return '<div class="lmx-pr"><span>' + esc(r.label) + '</span><b style="color:' + c + '">' + esc(r.value) + '</b></div>'; }).join('') +
      (pr.nextBest ? '<div class="lmr-nb"><div class="lmx-e">' + esc(pr.nextBest.label) + '</div><div class="lmx-x">' + esc(pr.nextBest.text) + '</div></div>' : '') + '</div></div>';
    var pe = f.personality || {};
    body += '<div class="lmr-pers"><div class="lmx-ph">' + circleIcon(pe.icon, 'gold', 52, 26) + '<div><div class="lmr-ey" style="margin:0 0 3px">' + esc(pe.eyebrow) + '</div><div class="lmx-n">' + esc(pe.name) + '</div><div class="lmx-st">' + esc(pe.strap) + '</div></div></div>' +
      '<div class="lmr-quad">' + arr(pe.quadrants).map(function (q) { return '<div><div class="lmx-q">' + esc(q.label) + '</div><div class="lmx-v">' + esc(q.value) + '</div></div>'; }).join('') + '</div>';
    if (pe.riskScale) body += '<div class="lmr-risk">' + esc(pe.riskScale.title) + '<div class="lmr-scale">' + arr(pe.riskScale.labels).map(function (l, i) { return '<div' + (i === pe.riskScale.activeIndex ? ' class="lmx-on" aria-current="true"' : '') + '>' + esc(l) + '</div>'; }).join('') + '</div></div>';
    body += (has(pe.note) ? '<div class="lmx-nt">' + esc(pe.note) + '</div>' : '') + '</div>';
    return frame(d, n, total, 'Foundations and you', '<div class="lmr-body">' + body + '</div>');
  }

  // ---------- page 9 ----------
  function pNext(d, o, n, total) {
    var x = d.next, h = '<section class="lmr-pg" data-page="' + n + '" role="group" aria-label="Page ' + n + ' of ' + total + ': Share with an expert">';
    h += '<div class="lmr-n9"><div class="lmx-ph">' + photo(o, x.photo, ALT[x.photo]) + '</div><div class="lmx-tx"><div class="lmx-ey">' + esc(x.eyebrow) + '</div><h1 class="lmx-tt">' + esc(x.title) + '</h1><p class="lmx-ld">' + esc(x.lead) + '</p><span class="lmx-bt">' + esc(x.button) + '</span></div></div>';
    h += '<div class="lmr-rh"><span class="lmr-logo" style="color:#fff"><svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="' + COL.teal + '"/><path d="M8.2 16.4 14.6 7.8" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/><circle cx="14.9" cy="7.5" r="1.4" fill="#fff"/></svg><b>LifeMap</b></span><span class="lmr-rr" style="color:#cfd9e6">' + esc(d.meta.headerRight) + '</span></div>';
    h += '<div class="lmr-body lmr-body9" style="padding-top:0">';
    h += '<div class="lmr-steps">' + arr(x.steps).map(function (s) { return '<div><span class="lmx-n">' + esc(s.n) + '</span><div><div class="lmx-t">' + esc(s.title) + '</div><div class="lmx-x">' + esc(s.text) + '</div></div></div>'; }).join('') + '</div>';
    h += '<div class="lmr-two9"><div><div class="lmr-h3">' + esc(x.topics.title) + '</div><div class="lmr-tchips">' + arr(x.topics.chips).map(function (c) { return '<span>' + esc(c) + '</span>'; }).join('') + '</div></div>' +
      '<div><div class="lmr-h3">' + esc(x.checklist.title) + '</div>' + arr(x.checklist.items).map(function (c) { return '<div class="lmr-ck"><i></i><span>' + esc(c) + '</span></div>'; }).join('') + '</div></div>';
    h += '<div style="margin-top:30px"><div class="lmr-h3">' + esc(x.questions.title) + '</div><div class="lmr-qs">' + arr(x.questions.items).map(function (q) { return '<div>' + esc(typeof q === 'string' ? q : (q.q || q.text || '')) + '</div>'; }).join('') + '</div></div>';
    h += '<div class="lmr-sp"></div><div class="lmr-banner" style="margin-top:0"><div><div class="lmx-t">' + esc(x.ready.title) + '</div><div class="lmx-x">' + esc(x.ready.text) + '</div></div><span class="lmr-btn">' + esc(x.ready.button) + '</span></div>';
    h += '</div><div class="lmr-rf"><span>' + esc(d.footer.line) + '</span><span>' + n + ' / ' + total + '</span></div></section>';
    return h;
  }

  // ---------- page 10 ----------
  function asRows(list) {
    return arr(list).map(function (r) {
      var long = String(r[1]).length > 31;
      return '<div class="lmr-ar' + (long ? ' lg' : '') + '"><b class="lmx-k">' + esc(r[0]) + '</b><b class="lmx-v">' + esc(r[1]) + '</b></div>'; }).join('');
  }
  function pAssume(d, o, n, total) {
    var a = d.assumptions, body = titleBlock(a);
    body += '<div class="lmr-as' + (Math.max(arr(a.left).length, arr(a.right).length) > 6 ? ' dense' : '') + '"><div>' + asRows(a.left) + '</div><div>' + asRows(a.right) + '</div></div>';
    body += '<div class="lmr-two10"><div><div class="lmr-h3">' + esc(a.knownLimits.title) + '</div><ul>' + arr(a.knownLimits.items).map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul></div>' +
      '<div><div class="lmr-h3">' + esc(a.pleaseNote.title) + '</div><p>' + esc(a.pleaseNote.text) + '</p></div></div>';
    if (has(a.sources)) body += '<div class="lmr-src">' + esc(a.sources) + '</div>';
    var gl = arr(a.glossary.items);
    if (gl.length) body += '<div style="margin-top:22px" class="lmr-h3">' + esc(a.glossary.title) + '</div><div class="lmr-gl">' + gl.map(function (g) { return '<div><b>' + esc(g[0]) + '</b><span>' + esc(g[1]) + '</span></div>'; }).join('') + '</div>';
    return frame(d, n, total, 'What your plan assumes', '<div class="lmr-body">' + body + '</div>');
  }

  // ---------- page 11 (repeats) ----------
  function appRows(rows) {
    return rows.map(function (r) {
      var sf = num(r.shortfall) > 0;
      return '<tr><td>' + esc(r.age) + ' (' + esc(r.year) + ')</td><td class="' + (r.income ? '' : 'na') + '">' + numOrDash(r.income) + '</td><td class="' + (r.needs ? '' : 'na') + '">' + numOrDash(r.needs) + '</td><td class="' + (sf ? 'sf' : 'na') + '">' + numOrDash(r.shortfall) + '</td><td class="' + (r.savingsLeft ? '' : 'na') + '">' + numOrDash(r.savingsLeft) + '</td></tr>'; }).join('');
  }
  function appTable(cols, rows) {
    return '<table><thead><tr>' + cols.map(function (c) { return '<th scope="col">' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>' + appRows(rows) + '</tbody></table>';
  }
  function pApp(d, o, n, total, chunk, idx, cnt) {
    var a = d.appendix, half = Math.ceil(chunk.length / 2), body = titleBlock(cnt > 1 ? { big: a.big, bigLabel: a.bigLabel, eyebrow: a.eyebrow, title: a.title + ' (' + (idx + 1) + ' of ' + cnt + ')' } : a);
    body += '<div class="lmr-ap"><div>' + appTable(a.columns, chunk.slice(0, 27)) + '</div><div>' + (chunk.length > 27 ? appTable(a.columns, chunk.slice(27)) : '') + '</div></div>';
    if (idx === cnt - 1 && has(a.note)) body += '<div class="lmr-src" style="margin-top:14px">' + esc(a.note) + '</div>';
    return frame(d, n, total, 'Appendix' + (cnt > 1 ? ' (' + (idx + 1) + ' of ' + cnt + ')' : ''), '<div class="lmr-body">' + body + '</div>');
  }

  // ---------- assemble ----------
  function reportPages(data, opts) {
    var o = opts || {}, d = data;
    if (!d || !d.meta) throw new Error('reportPages: data missing');
    var gp = goalPages(d, o), rows = arr(d.appendix.rows), ap = [];
    for (var i = 0; i < rows.length; i += 54) ap.push(rows.slice(i, i + 54));
    if (!ap.length) ap.push([]);
    var total = 6 + gp.length + 4 + ap.length - 0;
    // order: cover, plan, money, roadmap, goals..., cashflow, scenarios, foundations, next, assumptions, appendix...
    total = 4 + gp.length + 5 + ap.length;
    var pages = [], n = 1;
    pages.push(pCover(d, o, n++, total));
    pages.push(pPlan(d, o, n++, total));
    pages.push(pMoney(d, o, n++, total));
    pages.push(pRoadmap(d, o, n++, total));
    gp.forEach(function (pg, i) { pages.push(pGoals(d, o, n++, total, pg, i, gp.length)); });
    pages.push(pCash(d, o, n++, total));
    pages.push(pScen(d, o, n++, total));
    pages.push(pFound(d, o, n++, total));
    pages.push(pNext(d, o, n++, total));
    pages.push(pAssume(d, o, n++, total));
    ap.forEach(function (ch, i) { pages.push(pApp(d, o, n++, total, ch, i, ap.length)); });
    return { css: CSS, pages: pages, count: pages.length, schemaVersion: VERSION };
  }

  var FONT_LINK = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Figtree:wght@400..800&display=swap" rel="stylesheet">';
  function reportDocument(data, opts) {
    var r = reportPages(data, opts);
    return '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>' + esc(data.meta.headerRight) + '</title><meta name="viewport" content="width=device-width,initial-scale=1">' + FONT_LINK +
      '<style>html,body{margin:0;background:#e9edf1}.lmr-doc{display:flex;flex-direction:column;align-items:center;gap:16px;padding:16px 0}@media print{html,body{background:#fff}.lmr-doc{display:block;padding:0;gap:0}}' + r.css + '</style></head><body><main class="lmr-doc">' + r.pages.join('\n') + '</main></body></html>';
  }

  return { reportPages: reportPages, reportDocument: reportDocument, VERSION: VERSION, PAGE: { w: W, h: H } };
});
/* END REPORT RENDERER */
/* ================= DETAIL CASHFLOW CHART (Pooja, 1 Oct): stacked, honest, tappable ================= */
// Split one year's spending (living + loans & mortgage + goal costs) into: from income / from savings / shortfall. Parts sum exactly to spend.
function rowParts(r){ const lf = r.living + r.fixed, fromIncome = Math.min(r.inflow, lf), fromSavings = (r.used || 0) + Math.max(0, r.goalCost - r.goalGap), short = (r.shortLiving || 0) + r.goalGap;
  return {spend:lf + r.goalCost, fromIncome, fromSavings, short}; }
const chartShort = r => rowParts(r).short > 0.5;
function niceMax(v){ const p = Math.pow(10, Math.floor(Math.log10(Math.max(v, 1)))), m = v / p; return (m <= 1.5 ? 1.5 : m <= 2 ? 2 : m <= 3 ? 3 : m <= 4 ? 4 : m <= 6 ? 6 : m <= 8 ? 8 : 10) * p; }
const kEur = v => v >= 1e6 ? '€' + (v / 1e6).toFixed(v % 1e6 ? 1 : 0) + 'm' : '€' + Math.round(v / 1000) + 'k';
function chartDefaultSel(rows){ const s = rows.findIndex(chartShort); if (s >= 0) return s; const r = retireGoal() ? rows.findIndex(x => x.rmark) : -1; return r >= 0 ? r : 0; }
function chartSVG(rows, W, opts){
  opts = opts || {}; const live = !!opts.live, land = !!opts.land, wide = W > 500, n = rows.length, sel = live ? clamp(S.csel == null ? chartDefaultSel(rows) : S.csel, 0, n - 1) : -1;
  const showSav = live && S.csave, H = land ? 250 : wide ? 290 : 250, padL = 34, padR = 6, bot = 20;
  // goal markers (emoji above the bar in each goal's year), stacked when years are close
  const gm = S.goals.filter(g => g.kind !== 'retire' && g.kind !== 'legacy').map(g => ({g, i:g.age - rows[0].a})).filter(m => m.i >= 0 && m.i < n).sort((a, b) => a.i - b.i);
  const bw = (W - padL - padR) / n, X = i => padL + i * bw; const lv = []; let maxLv = 0;
  gm.forEach(m => { const x = X(m.i) + bw / 2; let l = 0; while (lv[l] != null && x - lv[l] < 15) l++; lv[l] = x; m.l = l; m.x = x; maxLv = Math.max(maxLv, l + 1); });
  const top = 14 + Math.max(1, maxLv) * 14 + (retireGoal() ? 4 : 0);
  const parts = rows.map(rowParts), maxV = niceMax(Math.max(1, ...parts.map(p => p.spend), ...rows.map(r => r.inflow), ...(showSav ? rows.map(r => r.liquid) : []))), sy = v => H - bot - v / maxV * (H - top - bot);
  let g = '', bars = '', mk = '', inc = '', sav = '', hit = '';
  for (let k = 1; k <= 3; k++){ const v = maxV * k / 3, y = sy(v); g += '<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="#E3EAF0" stroke-width="1"/><text x="' + (padL - 4) + '" y="' + (y + 3.5).toFixed(1) + '" font-size="9.5" fill="#51627A" text-anchor="end">' + kEur(v) + '</text>'; }
  g += '<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + sy(0) + '" y2="' + sy(0) + '" stroke="#B9C9D6" stroke-width="1"/>';
  rows.forEach((r, i) => { const x = X(i), w = Math.max(1, bw - (bw > 4 ? 1.2 : 0.4)), p = parts[i]; let y0 = sy(0);
    const seg = (v, fill, stroke) => { if (v <= 0.5) return ''; const hp = v / maxV * (H - top - bot), yT = y0 - hp; const out = '<rect x="' + x.toFixed(1) + '" y="' + yT.toFixed(2) + '" width="' + w.toFixed(1) + '" height="' + hp.toFixed(2) + '" fill="' + fill + '"' + (stroke ? ' stroke="' + stroke + '" stroke-width="0.6"' : '') + '/>'; y0 = yT; return out; };
    bars += seg(p.fromIncome, 'var(--good)') + seg(p.fromSavings, 'var(--nudge)', 'var(--nudge-edge)') + seg(p.short, 'var(--alert)');
    if (i === sel) bars += '<rect x="' + (x - 1.5).toFixed(1) + '" y="' + (sy(Math.max(p.spend, 0)) - 2).toFixed(1) + '" width="' + (w + 3).toFixed(1) + '" height="' + (sy(0) - sy(p.spend) + 4).toFixed(1) + '" fill="none" stroke="var(--ink)" stroke-width="1.6" rx="1.5"/>';
    if (r.a % 10 === 0) bars += '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (H - 6) + '" font-size="10" fill="#51627A" text-anchor="middle">' + r.a + '</text>';
    if (r.rmark && retireGoal()) mk += '<path d="M' + (x + bw / 2 - 5).toFixed(1) + ' 2 h10 l-5 8 z" fill="var(--ink)"><title>Retirement starts, age ' + r.a + '</title></path>';
    if (r.a === AS.spAge) mk += '<line x1="' + (x + bw / 2).toFixed(1) + '" x2="' + (x + bw / 2).toFixed(1) + '" y1="' + (sy(0)) + '" y2="' + (sy(0) + 5) + '" stroke="var(--ink)" stroke-width="1.6"/><text x="' + (x + bw / 2 - 2).toFixed(1) + '" y="' + (sy(0) + 12) + '" font-size="8.5" fill="var(--ink)" font-weight="700" text-anchor="end">SP<title>State Pension starts, age ' + r.a + '</title></text>';
    inc += (i ? 'L' : 'M') + (x + bw / 2).toFixed(1) + ' ' + sy(r.inflow).toFixed(1) + ' ';
    sav += (i ? 'L' : 'M') + (x + bw / 2).toFixed(1) + ' ' + sy(Math.max(0, r.liquid)).toFixed(1) + ' ';
    if (live) hit += '<rect x="' + x.toFixed(1) + '" y="' + top + '" width="' + bw.toFixed(2) + '" height="' + (H - bot - top) + '" fill="transparent" data-a="cyr" data-p="' + i + '" style="cursor:pointer"><title>Age ' + r.a + '</title></rect>'; });
  gm.forEach(m => { mk += '<text x="' + m.x.toFixed(1) + '" y="' + (top - 4 - m.l * 14) + '" font-size="12" text-anchor="middle">' + m.g.e + '<title>' + esc(m.g.name) + ', age ' + m.g.age + '</title></text>'; });
  const desc = 'Yearly cashflow, age ' + rows[0].a + ' to ' + rows[n - 1].a + '. ' + (rows.some(chartShort) ? 'Shortfall from age ' + rows.find(chartShort).a + '.' : 'Every year is covered.');
  const svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="' + desc + '" style="display:block;margin-top:8px" class="cchart">' + g + bars + (showSav ? '<path d="' + sav + '" fill="none" stroke="#6E8AA6" stroke-width="1.4" opacity=".8"/>' : '') + '<path d="' + inc + '" fill="none" stroke="var(--ink)" stroke-width="1.8" stroke-dasharray="5 3"/>' + mk + hit + '</svg>';
  if (!live) return svg;
  const r = rows[sel];
  return '<div class="cwrap" tabindex="0" role="slider" aria-label="Year in the cashflow chart. Use the arrow keys to move between years." aria-valuemin="' + rows[0].a + '" aria-valuemax="' + rows[n - 1].a + '" aria-valuenow="' + r.a + '" aria-valuetext="Age ' + r.a + ', ' + r.yr + '" data-ckey="1">' + svg + '</div>' + chartDetail(r);
}
function chartDetail(r){ const p = rowParts(r), gl = (r.dueG || []);
  const li = (l, v, c) => '<div class="mini"><span>' + (c ? '<i class="sw" style="background:' + c + ';margin-right:6px"></i>' : '') + l + '</span><b>' + eur(v) + '</b></div>';
  return '<div class="cdet" id="r-cdet" aria-live="polite"><div class="row" style="justify-content:space-between"><b style="font-size:15px">Age ' + r.a + ' (' + r.yr + ')' + (r.rmark && retireGoal() ? ' · retirement starts' : '') + '</b><span class="small">Tap a bar or use ← →</span></div>' +
    li('Income', r.inflow) + '<div class="mini"><span>Spending</span><b>' + eur(p.spend) + '</b></div>' +
    '<div class="csub">' + li('Living costs', r.living) + li('Loans & mortgage', r.fixed) + (r.goalCost > 0.5 ? li('Goals: ' + gl.map(x => x.e + ' ' + esc(x.name)).join(', '), r.goalCost) : '') + '</div>' +
    li('Paid from income', p.fromIncome, 'var(--good)') + li('Paid from savings', p.fromSavings, 'var(--nudge)') + li('Shortfall', p.short, 'var(--alert)') + li('Savings left at year end', r.liquid) + '</div>'; }
function chartSummary(P){ const rows = P.rows, s = rows.filter(chartShort), dip = rows.filter(r => !chartShort(r) && rowParts(r).fromSavings > 0.5).length;
  if (!s.length) return '<p class="pnote"><b>In plain English:</b> every year is covered by your income and savings' + (dip ? ', and in ' + dip + ' year' + (dip > 1 ? 's' : '') + ' you use savings, which is what they are for' : '') + '. No coral on the chart.</p>';
  const f = s[0], fp = rowParts(f), gs = [...new Set(s.flatMap(r => (r.dueG || []).filter(x => x.paid < x.cost - 1).map(x => x.name)))], liv = s.filter(r => r.shortLiving > 0.5);
  return '<p class="pnote"><b>In plain English:</b> the first shortfall is at <b>age ' + f.a + '</b>, about <b>' + eur(fp.short) + '</b>' + (f.goalGap > 0.5 && f.dueG && f.dueG.length ? ' (' + esc(f.dueG.filter(x => x.paid < x.cost - 1).map(x => x.name).join(' and ').toLowerCase()) + ')' : '') + '. ' +
    'Across your plan there ' + (s.length > 1 ? 'are ' + s.length + ' years' : 'is 1 year') + ' with a gap, about ' + eur(s.reduce((t, r) => t + rowParts(r).short, 0)) + ' in total' + (gs.length ? '. Goals involved: ' + esc(gs.join(', ').toLowerCase()) : '') + (liv.length ? '. Everyday costs run short in ' + liv.length + ' year' + (liv.length > 1 ? 's' : '') + (liv[0] ? ', from age ' + liv[0].a : '') : '') + '. Saving more, changing timing or rethinking a goal closes it.</p>'; }

function saveCtl(){ const P = project(), y = P.save.saveM, k = S.ans['6'];
  return '<div class="field" style="margin:12px 0 4px" id="r-save"><span class="flabel" id="sv-l">Your saving today</span><div class="wi-row"><button class="rb" data-a="savem" data-p="-25" aria-label="Save 25 euro less a month">−</button><div class="wi-val">' + nbox('save', 'm', y, '€', 'sv-l') + '<span class="small" style="margin-left:4px">a month</span></div><button class="rb" data-a="savem" data-p="25" aria-label="Save 25 euro more a month">+</button></div>' +
    '<span class="small">' + (S.saveNote ? esc(S.saveNote) : S.saveM != null ? 'Your choice. ' : 'From your answer' + (typeof k === 'number' ? ' "' + esc(DQ_BY('6').o[k].t) + '"' : '') + '. ') + 'Your spare money is about ' + eur(P.save.surplusM) + ' a month; the rest is assumed spent.' + (S.saveM != null ? ' <button class="link" style="font-size:12.5px;padding:0" data-a="savereset">Use my answer</button>' : '') + '</span>' + nbHint('save', 'm') + '</div>'; }
// FP round 5: the saving stays capped by the Q6 answer; when the measured spare money is well above it, say so (guidance wording, never applied automatically)
function saveNudge(){ const P = project(), cur = S.saveM != null ? S.saveM : P.save.saveM, x = Math.floor(SAVE.share * P.save.surplusM / 25) * 25;
  if (!(x >= P.save.saveM + 50 && x >= cur + 50)) return '';
  return '<p class="small" id="r-savenudge" style="margin:6px 0 0">💡 You may be able to save more than you said: your spare money is about ' + eur(P.save.surplusM) + ' a month. <button class="link" style="font-size:12.5px;padding:0" data-a="savem" data-p="' + (x - cur) + '">Try ' + eur(x) + ' a month</button> to see what changes.</p>'; }
/* §24.2: the base saving ("Your monthly saving") and the what-if extra are separate sections, and a live line adds them up so they can't be confused. */
function wiLive(){ const P = project(), base = P.save.saveM, sp = Math.max(0, P.save.surplusM), m = +S.wi.m || 0, tot = Math.max(0, base + m), over = m !== 0 && tot > sp + 0.5;
  const h = !m ? 'Your saving today is <b>' + eur(base) + ' a month</b> · spare money about ' + eur(sp) + '. Add an extra amount to see what changes.'
    : 'With this what-if you\'d save <b>' + eur(tot) + ' a month</b> (' + eur(base) + (m > 0 ? ' + ' + eur(m) + ' extra' : ' − ' + eur(-m) + ' less') + ') · spare money about ' + eur(sp);
  return {h:h + (over ? '<span class="wn">⚠️ That\'s more than your spare money of about ' + eur(sp) + ' a month. It may only work if you cut back elsewhere.</span>' : ''), over, base, tot, sp, m}; }
function wiCard(){ const w = S.wi, gs = S.goals.slice().sort((a, b) => a.age - b.age), g = gById(w.g), L = wiLive();
  return '<div class="card" id="r-wi"><h3 class="h">What if…?</h3><p class="small" style="margin:0 0 10px">Try saving a bit more or less, or adding a one-off amount.</p>' +
    '<div class="wisec" id="wi-base"><h4 class="wih">Your monthly saving</h4><p class="small" style="margin:0 0 2px">What you save now. Change it here, or leave it.</p>' + saveCtl() + saveNudge() + '</div>' +
    '<div class="wisec" id="wi-extra"><h4 class="wih" id="wi-extra-h">Try an extra amount for ' + esc(g ? g.name.toLowerCase() : 'a goal') + '</h4><p class="small" style="margin:0 0 8px">This is on top of your saving above. It only changes the what-if.</p>' +
    '<div class="fl" style="font-size:12px;font-weight:800;margin-bottom:6px">Put it towards</div><div class="chips" role="group" aria-label="Goal for the what-if">' + gs.map(x => '<button class="chip sm' + (w.g === x.id ? ' sel' : '') + '" aria-pressed="' + (w.g === x.id) + '" data-a="wig" data-p="' + x.id + '">' + x.e + ' ' + esc(x.name) + '</button>').join('') + '</div>' +
    '<div class="field" style="margin:14px 0 6px"><span class="flabel" id="wim-l">Extra each month</span><div class="wi-row"><button class="rb" data-a="wim" data-p="-25" aria-label="25 euro less">−</button><div class="wi-val">' + nbox('wi', 'm', w.m, '€', 'wim-l', {id:'wim-v', sign:true}) + '</div><button class="rb" data-a="wim" data-p="25" aria-label="25 euro more">+</button></div><input type="range" min="' + Math.min(-500, w.m) + '" max="' + Math.max(1000, w.m) + '" step="25" value="' + w.m + '" data-wi="m" aria-labelledby="wim-l" aria-valuetext="' + eur(w.m) + ' a month">' + nbHint('wi', 'm') + '<span class="small" id="wim-h">' + (w.m < 0 ? 'Saving less each month (affects your whole plan)' : w.m > 0 ? 'Extra each month towards ' + esc(g ? g.name.toLowerCase() : 'your goal') + (g && g.kind === 'retire' ? ' (counted as retirement saving)' : ' until it happens') : '−€500 to +€1,000 a month') + '</span></div>' +
    '<div class="field" style="margin:10px 0 0"><div class="flabel"><span id="wil-l">One-off amount</span>' + nbox('wi', 'l', w.l, '€', 'wil-l', {id:'wil-v'}) + '</div><input type="range" min="0" max="' + Math.max(50000, w.l) + '" step="500" value="' + w.l + '" data-wi="l" aria-labelledby="wil-l" aria-valuetext="' + eur(w.l) + '">' + nbHint('wi', 'l') + '<span class="small">Once, e.g. from savings or a bonus</span></div>' +
    '<div class="wi-live' + (L.over ? ' over' : '') + '" id="wi-live" role="status" aria-live="polite">' + L.h + '</div></div>' +
    '<div class="wi-out" id="wi-out" aria-live="polite"></div>' +
    /* §26: the saving controls come first; growth and inflation sit below, one tap away */
    '<details class="card asmg wigrow" data-g="wi-grow"' + (S.asmOpen === 'wi-grow' ? ' open' : '') + ' style="margin:12px 0 0;box-shadow:none;border:1.5px solid #D5E0EA"><summary style="cursor:pointer;font-weight:800;min-height:44px">Growth and inflation settings</summary><div style="margin-top:8px"><div class="fl" style="font-size:12px;font-weight:800;margin-bottom:6px">Growth assumptions</div>' + assumeToggle() + '<div style="height:10px"></div>' + inflChoice('wi') + '<p class="small" style="margin:8px 0 0"><button class="link" style="padding:0;font-size:13px" data-a="asmopen">Your assumptions</button> · prices, growth, retirement and emergency fund settings</p></div></details>' +
    '<div class="grid2" style="margin-top:12px"><button class="btn sm" style="width:100%" data-a="wisave">Save this plan</button><button class="btn sm ghost" style="width:100%" data-a="wireset">Back to my plan</button></div></div>'; }
function resultsHTML(){ if (!planReady()) return gateHTML('res');
  const P0 = project(), P = project(S.wi), F = findings(P0), rough = qualityCount() > 2;
  return '<div class="prelim"><span aria-hidden="true">ℹ️</span><span>Guidance from your figures, not financial advice. <button class="link" style="padding:0;font-size:12.5px" data-a="sheet" data-p="assume">What we assume</button></span></div>' +
    roughNote() + planProfileBanner() +
    '<div class="card"><h3 class="h">Your goals</h3><p class="small" style="margin:0 0 6px">How much of each goal your future income and savings can cover.</p><div id="r-goals">' + goalsBox(P) + '</div></div>' +
    '<div class="card" id="r-found"><h3 class="h">What we found</h3><div class="found" style="margin-top:8px">' +
      [['💪','Your main strength',F.sT,'var(--good-t)','str'],['🔎','Your main gap',F.gT,'var(--alert-t)','gap'],['🎯','Your biggest decision',F.dT,'var(--acc-d)','dec']].map(c => '<button class="fcard f2c ' + c[4] + '" data-a="sheet" data-p="explain|' + c[4] + '"><span class="f2c-i" aria-hidden="true">' + c[0] + '</span><span class="f2c-m"><small>' + c[1] + '</small><b>' + esc(c[2]) + '</b></span><span class="f2c-go" aria-hidden="true">›</span></button>').join('') + '</div>' +
      (S.understood ? '<p class="pill ok" style="margin:12px 0 8px">✓ Thanks, noted</p><div class="small" style="font-weight:800;margin-bottom:6px">What would you like to ask an adviser? (optional)</div><div class="chips">' + ADV_QS.map(q => '<button class="chip sm' + (S.advQs.includes(q) ? ' sel' : '') + '" aria-pressed="' + S.advQs.includes(q) + '" data-a="advq" data-p="' + esc(q) + '">' + esc(q) + '</button>').join('') + '</div><p class="small" style="margin:6px 0 0">Sustainable / ethical options: your adviser will ask about this before recommending anything.</p>' : '<button class="btn" style="margin-top:12px" data-a="understood">That makes sense</button>') + '</div>' +
    fndCard() + wiCard() +
    '<div class="card" id="r-glancec"><h3 class="h">Your future, at a glance</h3><div id="r-glance">' + glanceHTML(P) + '</div></div>' +
    '<div class="ends"><button class="btn navy" data-a="report">⬇ Download my plan</button><button class="btn sun" data-a="book">📅 Book my adviser meeting</button><button class="btn ghost" data-a="adjust">✏️ Adjust my goals</button></div>' +
    '<p class="disc" id="b27-res">' + esc(BUDGET27) + '</p><p class="disc">Guidance, not advice. Projections are illustrative, use standard assumptions and are not guaranteed. Only an authorised adviser who knows your full situation can give advice. ' + (S.versions.length ? '<button class="link" style="font-size:12px;padding:0" data-a="sheet" data-p="history">Plan history (' + S.versions.length + ')</button>' : '') + '</p>';
}
function liveUpdate(fromBox){ const P0 = project(), P = project(S.wi);
  const set = (id, h) => { const e = document.getElementById(id); if (e) e.innerHTML = h; };
  { const L = wiLive(), e = document.getElementById('wi-live'); if (e){ e.innerHTML = L.h; e.classList.toggle('over', L.over); } const gg = gById(S.wi.g), eh = document.getElementById('wi-extra-h'); if (eh) eh.textContent = 'Try an extra amount for ' + (gg ? gg.name.toLowerCase() : 'a goal'); }
  set('r-goals', goalsBox(P)); set('wi-out', wiText(P0, P)); set('r-glance', glanceHTML(P)); bindLite();
  const setV = (id, t) => { const e = document.getElementById(id); if (e && document.activeElement !== e){ e.value = t; e.style.width = nbW(t); } }; setV('wim-v', (S.wi.m > 0 ? '+' : '') + nbFmt(S.wi.m)); setV('wil-v', nbFmt(S.wi.l));
  if (fromBox) { const sv = document.querySelector('#r-save .nb'); if (sv && document.activeElement !== sv) sv.value = nbFmt(project().save.saveM); }
  const g = gById(S.wi.g); set('wim-h', S.wi.m < 0 ? 'Saving less each month (affects your whole plan)' : S.wi.m > 0 ? 'Extra each month towards ' + esc(g ? g.name.toLowerCase() : 'your goal') + (g && g.kind === 'retire' ? ' (counted as retirement saving)' : ' until it happens') : '−€500 to +€1,000 a month');
}
function tlStrip(){ if (!planReady()){ const m = planMissing(); return '<div class="card row" id="tl-strip" style="background:var(--sea-l)"><div style="flex:1"><b>To see your results we need ' + m.length + (m.length === 1 ? ' thing' : ' things') + '</b><div class="small" style="color:var(--ink)">Your goals\' progress shows once ' + (m.length === 1 ? 'it is' : 'they are') + ' chosen.</div></div><button class="btn sm" data-a="gofix" data-p="' + m[0].k + '">Choose</button></div>'; } const P = project(), n = S.goals.filter(g => P.pct[g.id] >= 95).length; return '<div class="card tls" id="tl-strip"><div class="tls-m"><b>' + n + ' of ' + S.goals.length + ' goals on track</b><span class="tls-bar"><i style="width:' + Math.round(n / Math.max(1, S.goals.length) * 100) + '%"></i></span><small>Updates as you move your goals</small></div><button class="tls-go" data-a="seg" data-p="results">Results ↓</button></div>'; }

/* ================= APP SHELL ================= */
const ICON = {explore:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg>', home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>', plan:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 18c3-6 6 2 9-4s4-6 7-6"/><circle cx="20" cy="8" r="1.6" fill="currentColor"/></svg>',
  me:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
  exp:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.7A8 8 0 1 1 21 12Z"/></svg>'};
function appHead(title, sub, back){ return hdrBar(back) + '<h2 class="t" tabindex="-1" style="margin-top:10px">' + title + '</h2>' + (sub ? '<p class="sub" style="margin:0">' + sub + '</p>' : ''); }
V.PLAN = () => { const hl = S.tlHl != null && gById(S.tlHl), all = S.planEdit;
  const edit = all ? '<div class="sec"><h3>Your goals</h3><button class="link" data-a="planedit">Done</button></div>' + gRows()
    : hl ? '<div id="tl-edit">' + gRows([hl]) + '<button class="link" data-a="tlclose">Done</button></div>' : '';
  return {id:'PLAN', note:'My Plan: timeline at the top (the centre), then goals-on-track strip, then results in spec order: goals % → what we found → what if → at a glance → 3 end actions. Tap a goal to edit it.', head:appHead('My Plan', 'Drag your goals. Your results update below.'),
    html:tlBoard() + edit + '<div class="tl-acts"><button class="tl-act" data-a="addgoal"><span aria-hidden="true">＋</span> Add a goal</button>' + (all ? '' : '<button class="tl-act" data-a="planedit"><span aria-hidden="true">✎</span> Edit goals</button>') + '</div>' + tlStrip() + (S.goals.length > 1 ? '<details class="card asmg wigrow" data-g="rank"' + (S.asmOpen === 'rank' ? ' open' : '') + ' style="margin-top:12px"><summary>Which goal first?' + (S.rank ? ' · your order' : '') + '</summary><div style="margin-top:8px">' + rankHTML('plan') + '</div></details>' : '') +
      '<div id="r-res" style="scroll-margin-top:8px"><div class="sec" style="margin-top:18px"><h3 style="font-size:21px">Your results</h3></div>' + detailsBanner() + resultsHTML() + '</div>'};
};
V.GOALS = () => ({id:'PLAN-ADD', note:'Add a goal from My Plan (same goal tiles).', head:appHead('Add a goal', 'Tap to add or remove.', 'seg|timeline'), html:'<div class="gtiles" role="group" aria-label="Goals">' + GOALCAT.map(c => goalTile(c.k)).join('') + '</div>' + S.goals.filter(g => g.k === 'other').map(g => '<div class="pill mint" style="margin-top:10px">' + g.e + ' ' + esc(g.name) + '</div> ').join(''), foot:'<button class="btn" data-a="seg" data-p="timeline">Back to my timeline</button>'});
const UM_NEW = ['6','u9','u10','u12','u14','u4','u11'];   // §13: u14 emergency fund replaces u13 sustainability   // §12: Q6 moved here from Discover → 7 to answer in the money profile
const umNewCount = () => UM_NEW.filter(u => u === '6' ? typeof S.ans['6'] === 'number' : typeof S.um.a[u] === 'number').length;
function nudge(e, t, btn, a, p){ return '<div class="nudge"><span aria-hidden="true">' + e + '</span><span>' + t + '</span>' + (btn ? '<button class="link" data-a="' + a + '"' + (p != null ? ' data-p="' + p + '"' : '') + '>' + btn + '</button>' : '') + '</div>'; }
function needsProfile(){ return umCount() < 13 || !S.um.rechecked; }
function retBtn(){ const r = S.um.ret; return r === 'c1' ? '<button class="btn ' + (umCount() === 13 ? 'ghost' : 'sun') + '" style="margin-top:10px" data-a="book2">Continue to my adviser match</button>' : r === 'plan' ? '<button class="btn ghost" style="margin-top:10px" data-a="umback" data-p="plan">Back to my plan</button>' : r === 'exp' ? '<button class="btn ghost" style="margin-top:10px" data-a="umback" data-p="exp">Back to my meeting</button>' : ''; }
/* One Understand Me question. Pre-filled Discover answers show as a selected answer with "Change". */
function umQCard(q, label){ const d = q.d ? DQ_BY(q.d) : q, key = q.d ? 'd' + q.d : q.u, sug = suggestU9(); let sel = q.d ? S.ans[q.d] : S.um.a[q.u]; const sugg = q.u === 'u9' && typeof sel !== 'number'; if (sugg) sel = sug;
  const pre = false, compact = false;
  const sc = qSec(q.d ? q : d), pn = d.panel || (q.d === '9' ? [10000, 8500] : null);
  return '<div class="card umq"><div class="umq-tags"><span class="umq-new">' + label + '</span>' + (sc ? '<span class="umq-sec">' + sc[0] + '</span>' : '') + '</div>' + (sc ? '<p class="umq-what">' + esc(sc[1].charAt(0).toUpperCase() + sc[1].slice(1)) + '</p>' : '') + '<h3 class="h umq-q">' + esc(d.q) + '</h3>' + (d.help || q.help ? '<p class="small" style="margin:0 0 8px">' + esc(d.help || q.help) + '</p>' : '') +
    (pn ? '<div class="umq-fall"><div><small>You put in</small><b>' + eur(pn[0]) + '</b></div><span class="umq-drop">−' + Math.round((1 - pn[1] / pn[0]) * 100) + '%</span><div style="text-align:right"><small>' + (q.d ? 'A month later' : 'A year later') + '</small><b class="dn">' + eur(pn[1]) + '</b></div><div class="umq-bar"><i style="width:' + Math.round(pn[1] / pn[0] * 100) + '%"></i></div></div>' : '') +
    (pre ? '<span class="pill mint" style="margin-bottom:8px">✓ From your first answers — change if you like</span>' : '') + (sugg ? '<span class="pill sunny" style="margin-bottom:8px">Suggested from your timeline — confirm or change</span>' : '') +
    (compact ? '<div class="opt row1 sel" style="cursor:default"><span class="em" style="background:var(--sand)" aria-hidden="true">' + d.o[sel].e + '</span><span class="tx">' + esc(d.o[sel].t) + '</span></div><button class="link" data-a="umedit" data-p="' + key + '" aria-label="Change your answer to: ' + esc(d.q) + '">Change</button>'
      : '<div class="opts" role="group" aria-label="' + esc(d.q) + '">' + d.o.map((o, k) => '<button class="opt row1' + (sel === k ? ' sel' : '') + '" aria-pressed="' + (sel === k) + '" data-a="umpick" data-p="' + key + '|' + k + '"><span class="em" style="background:var(--sand)" aria-hidden="true">' + o.e + '</span><span class="tx">' + esc(o.t) + (o.tag ? '<br><span class="otag" style="display:inline-block;margin-top:4px">◆ ' + esc(o.tag) + '</span>' : '') + '</span></button>').join('') + '</div>') +
    (q.chips ? '<div class="small" style="font-weight:800;margin:12px 0 6px">Which have you had? (optional)</div><div class="chips">' + q.chips.map(c => '<button class="chip sm' + (S.um.chips.includes(c) ? ' sel' : '') + '" aria-pressed="' + S.um.chips.includes(c) + '" data-a="umchip" data-p="' + c + '">' + c + '</button>').join('') + '</div>' : '') + '</div>'; }
function umSummary(qs){ const pre = qs.filter(q => q.d && typeof S.ans[q.d] === 'number');
  if (!pre.length) return '';
  return '<p class="fa-note"><span aria-hidden="true">✓</span> Pre-filled from your first answers · tap Edit to change one</p><div class="fa-list">' + pre.map((q, qi) => { const d = DQ_BY(q.d), key = 'd' + q.d, sel = S.ans[q.d];
    if (S.meEdit[key]) return '<div class="pq fa-c fa-ed"><div class="fa-q"><span class="fa-n">' + (qi + 1) + '</span>' + esc(d.q) + '</div><div class="opts" role="group" aria-label="' + esc(d.q) + '">' + d.o.map((o, k) => '<button class="opt row1' + (sel === k ? ' sel' : '') + '" aria-pressed="' + (sel === k) + '" data-a="umpick" data-p="' + key + '|' + k + '"><span class="em" style="background:var(--sand)" aria-hidden="true">' + o.e + '</span><span class="tx">' + esc(o.t) + '</span></button>').join('') + '</div></div>';
    return '<div class="pq fa-c"><div class="fa-q"><span class="fa-n">' + (qi + 1) + '</span>' + esc(d.q) + '</div><div class="fa-a"><span class="fa-e" aria-hidden="true">' + d.o[sel].e + '</span><b>' + esc(d.o[sel].t) + '</b><button class="fa-edit" data-a="umedit" data-p="' + key + '" aria-label="Change your answer to: ' + esc(d.q) + '">Edit</button></div></div>'; }).join('') + '</div>'; }
function rowBtn(a, p, e, t, d, right){ return '<button class="goal" data-a="' + a + '" data-p="' + p + '"><span class="ic" aria-hidden="true">' + e + '</span><span style="flex:1;min-width:0"><b>' + t + '</b><br><span class="small">' + d + '</span></span>' + (right || '<span class="chev" aria-hidden="true">›</span>') + '</button>'; }
// FP round 8 (§14): the three types as the customer sees them
const T_GOV = 'Set by Government · 2026', T_MINE = 'Your choice', T_HOW = 'How the plan works', T_SET = 'Set by LifeMap', T_ASSUMED = 'Assumed: add yours';
const tMarket = d => { const s = mkSug(d); return s ? 'Suggested ' + s.t.replace(/\) · .*/, '') : 'Your figure'; };   // §18: no range; the suggestion if there is one
const tRange = d => { const [lo, hi] = d.rng(), f = x => d.t === 'eurw' ? eurW(x) : asmFmt(d, x); return 'Usually ' + f(lo).replace(/ years$/, '') + '–' + f(hi); };
const asmFmt = (d, v) => v == null ? 'Not chosen yet' : d.t === 'pct' ? pcs(+v) : d.t === 'eur' ? eur(+v) : d.t === 'eurw' ? eurW(+v) + ' a week' : d.t === 'yrs' ? v + (+v === 1 ? ' year' : ' years') : d.t === 'age' ? 'age ' + v : d.t === 'num' ? (d === ASM.retireMult ? v + '× (about ' + +(100 / v).toFixed(1) + '% a year)' : d === ASM.safetyMonths ? v + (+v === 1 ? ' month' : ' months') : String(v)) : ((d.o.find(o => String(o[0]) === String(v)) || [0, String(v)])[1]);
// §18/§19.6: a market rate's suggestion (from SETTINGS), in the input's own units; null = no suggestion
function mkSug(d){ const p = SET[d.mk], pv = SV(d.mk); if (!p || pv == null) return null; const v = d.afterDirt ? +(pv * (1 - RI.sav.dirt)).toFixed(4) : pv, lab = SL(d.mk);
  return {v, t:(d.t === 'eur' ? eur(v) : pcs(v)) + (d.afterDirt ? ' after DIRT' : '') + ') · ' + lab + (d.afterDirt && !SOV(d.mk) ? ' (' + pcs(pv) + ' before DIRT)' : '')}; }
const sugChipTxt = s => 'Use the suggested ' + (/^€/.test(s.t) ? 'figure (' : 'rate (') + s.t;
function asmGuide(d){ if (d.mk) return d.opt && !mkSug(d) ? 'Optional: no published figure, so no suggestion. Leave it blank to count ' + (d.t === 'eur' ? '€0' : '0%') + '.' : ''; if (d.ty === 2){ const [lo, hi] = d.rng(); return 'Usually between ' + asmFmt(d, lo) + ' and ' + asmFmt(d, hi) + ' (' + d.by + ').'; }
  return d.own ? '' : 'LifeMap uses ' + asmFmt(d, d.sug()) + ' (' + d.by + '). Change it if you want to use your own.'; }
const nbUnit = d => d.t === 'pct' ? '%' : d.t === 'eur' || d.t === 'eurw' ? '€' : d.t === 'yrs' ? 'y' : d.t === 'age' ? 'age' : '';
const asmTag = (on, need) => on ? '<span class="tag doc">' + T_MINE + '</span>' : need ? '<span class="tag look">Not chosen yet</span>' : '';
// §27.5-6: what an assumption is until the customer sets it. req = theirs to choose (plan-until age); std = a LifeMap standard, applied from the start; assumed = a market rate or figure LifeMap assumes, "add yours"
const asmKind = k => k === 'planEnd' ? 'req' : (ASM[k].ty === 3 && !ASM[k].own && ASM[k].sug) ? 'std' : 'assumed';
const asmTagK = k => asmMine(k) ? '<span class="tag doc">' + T_MINE + '</span>' : asmKind(k) === 'req' ? '<span class="tag look">Not chosen yet</span>' : asmKind(k) === 'std' ? '<span class="tag pre">' + T_SET + '</span>' : (ASM[k].opt && !mkSug(ASM[k]) ? '<span class="tag typed">Optional</span>' : '<span class="tag look">' + T_ASSUMED + '</span>');
// the label for the source of an assumption row (What your plan assumes, Step 7 list)
const srcTxt = s => /^https?:\/\//.test(s || '') ? s.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] : (s || '');
const stdNote = k => { const sk = SGK[k] || k, s = SET[sk]; return s ? SB(sk) + '. Source: ' + srcTxt(s.src) + (s.asat ? ' (' + s.asat + ')' : '') + '.' : ''; };
const asmSrcLbl = k => asmMine(k) ? T_MINE : asmKind(k) === 'std' ? T_SET : asmKind(k) === 'req' ? T_MINE : T_ASSUMED;
const advOn = k => !!(S && S.advRate && S.advRate[k] && S.asm && S.asm[k] != null);
function asmInput(k, req){ const d = ASM[k], mine = asmMine(k), kind = asmKind(k), v = mine ? asmGet(k) : kind === 'req' ? null : asmV(k), id = 'asm-' + k, std = kind === 'std' ? d.sug() : null;
  const ctl = d.t === 'choice' ? '<div class="chips" role="group" aria-labelledby="' + id + '">' + d.o.map(([val, l]) => { const on = v != null && String(v) === String(val); return '<button class="chip sm' + (on ? ' sel' : '') + '" aria-pressed="' + on + '" data-a="asmset" data-p="' + k + '|' + val + '">' + esc(l) + '</button>'; }).join('') + '</div>'
    : nbox('asm', k, v == null ? '' : d.t === 'pct' ? +(v * 100).toFixed(2) : +v, nbUnit(d), id, {dec:d.t === 'pct' || d.t === 'eurw' || (d.step % 1 !== 0)}) + nbHint('asm', k);
  const ms = d.mk ? mkSug(d) : null, chip = mine && std != null ? '<button class="chip sm" style="margin-top:6px" data-a="asmback" data-p="' + k + '">Back to LifeMap\'s figure (' + esc(asmFmt(d, std)) + ')</button>' : mine && ms ? '<button class="chip sm" style="margin-top:6px" data-a="asmback" data-p="' + k + '">Back to the assumed rate (' + esc(ms.t.replace(/\) · .*/, '')) + ')</button>' : '';
  // M4: an unknown card or loan rate is not a dead end: the customer chooses, in one tap, a prudent planning rate (and may leave it for their adviser). Never silent.
  const dk = (k === 'cardRate' || k === 'loanRate') && (!mine || advOn(k)) && (d.need() || advOn(k)), idk = dk ? '<div class="chips" style="margin-top:6px">' + (k === 'cardRate' && v !== GD.cardCap ? '<button class="chip sm" data-a="asmcap" data-p="cardRate">Use ' + pcs(GD.cardCap) + ' (the legal limit for new cards): cautious, not typical</button>' : '') + (advOn(k) ? '' : '<button class="chip sm" data-a="asmadv" data-p="' + k + '">I don\'t know my rate: use a planning rate (' + pcs(d.fb()) + ') and leave it for my adviser</button>') + '</div>' + (advOn(k) ? '<span class="small" style="display:block;margin-top:4px" id="adv-' + k + '">Planning rate ' + pcs(+v) + ', left for your adviser to check. Type your own rate any time.</span>' : '') : '';
  const using = kind === 'assumed' && !mine && (!d.opt || ms) && v != null ? '<span class="small" style="display:block;margin-top:4px" id="using-' + k + '">We are using ' + esc(asmFmt(d, v)) + (ms ? ' (' + esc(SL(d.mk)) + ')' : ' (a planning figure)') + ' until you add yours.</span>' : '';
  return '<div class="field asmf" data-k="' + k + '" data-kind="' + (mine ? 'mine' : kind) + '" style="margin:0 0 14px"><span class="flabel" id="' + id + '">' + esc(d.l) + ' ' + asmTagK(k) + '</span>' + ctl + chip + idk + using +
    '<span class="small" style="display:block;margin-top:4px">' + esc([asmGuide(d), d.help].filter(Boolean).join(' ')) + '</span>' + (kind === 'std' && stdNote(k) ? '<span class="small" style="display:block;margin-top:2px">' + esc(stdNote(k)) + '</span>' : '') + '</div>'; }
// Retirement age: never defaulted, never part of "use all" (§14)
function retireField(){ const v = S.retireSet ? S.retireAge : '';
  return '<div class="field asmf" data-k="retireAge" style="margin:0 0 14px"><span class="flabel" id="asm-retireAge">Retirement age ' + asmTag(S.retireSet, true) + '</span>' + nbox('ret', 'a', v, 'age', 'asm-retireAge', {}) + nbHint('ret', 'a') +
    '<span class="small" style="display:block;margin-top:4px">' + esc(RETIRE_HELP) + ' Choose the age you want to plan for, any age from ' + retMin() + ' to ' + retMax() + '.</span>' + (S.retireSet && retNote(S.retireAge) ? '<span class="small" id="ret-note" role="status" style="display:block;margin-top:4px;color:var(--nudge-t)">' + esc(retNote(S.retireAge)) + '</span>' : '') + '</div>'; }
function pRetireField(){ if (!pInc()) return ''; const v = S.pRetSet ? S.pRet : '';
  return '<div class="field asmf" data-k="pRetireAge" style="margin:0 0 14px"><span class="flabel" id="asm-pRetireAge">Your partner\'s retirement age ' + asmTag(!!S.pRetSet, true) + '</span>' + nbox('pret', 'a', v, 'age', 'asm-pRetireAge', {}) + nbHint('pret', 'a') +
    '<span class="small" style="display:block;margin-top:4px">We count their pay until this age, then only their State Pension. Only you can choose it, so we never fill it in for you.</span>' + (S.pRetSet && pRetNote(S.pRet) ? '<span class="small" id="pret-note" role="status" style="display:block;margin-top:4px;color:var(--nudge-t)">' + esc(pRetNote(S.pRet)) + '</span>' : '') + '</div>'; }
// Type 1: set by law, the same for everyone. Shown, never editable.
function govRows(){ const I = RI.it, U = RI.usc, PN = RI.pen, SP = RI.sp, H = RI.home, A = RI.ae, P = RI.prsi.path;
  return [['Income tax', '20% up to ' + eur(I.band) + ' (single; ' + eur(I.bandMarried) + ' married, plus up to ' + eur(I.bandUplift) + ' for a second income), 40% above. Personal credit ' + eur(I.personal) + ' (' + eur(I.personalMarried) + ' married), employee credit ' + eur(I.paye)],
    ['USC', U.bands.map(b => pcs(b[1])).join(' / ') + ' in bands; none if your income is ' + eur(U.exempt) + ' or less. The State Pension is exempt'],
    ['PRSI', P.map(x => pcs(x.r) + ' from ' + ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][x.m] + ' ' + x.y).join(', ') + '; none from ' + RI.prsi.endAge],
    ['Pension tax relief', PN.relief.map(r => pcs(r[1])).join(' / ') + ' of pay by age, on pay up to ' + eur(PN.earnCap)],
    ['Retirement lump sum', 'Up to ' + pcs(PN.lsMaxPct) + ' of the fund: ' + eur(PN.lsTaxFree) + ' tax-free, the next ' + eur(PN.lsCap - PN.lsTaxFree) + ' taxed at ' + pcs(PN.lsBandRate) + ', anything above ' + eur(PN.lsCap) + ' taxed at your marginal rate (' + pcs(RI.it.r2) + ' here)'],
    ['Standard Fund Threshold', eur(PN.sft[2026]) + ' in 2026, rising to ' + eur(PN.sft[2029]) + ' by 2029; ' + pcs(PN.sftRate) + ' tax above it'],
    ['Pension withdrawals', 'From ' + PN.earliestAge + ' at the earliest (50 for some occupational schemes); at least ' + pcs(PN.arfMin61) + ' a year from 61, ' + pcs(PN.arfMin71) + ' from 71 (' + pcs(PN.arfMinBig) + ' over ' + eur(PN.arfBig) + ')'],
    ['State Pension (full rate)', eurW(SP.week) + ' a week from ' + SP.age + ' (' + eur(SP.over80) + ' more from 80); Qualified Adult ' + eurW(SP.qa66)],
    ['Illness Benefit and survivor\'s pension', eurW(SP.illness) + ' a week; survivor\'s pension ' + eurW(SP.survivor) + ' under 66, ' + eurW(SP.survivor66) + ' at 66+'],
    ['Auto-enrolment (My Future Fund)', pcs(A.ee) + ' you + ' + pcs(A.er) + ' employer + ' + pcs(A.state) + ' State, on pay up to ' + eur(A.earnCap)],
    ['Savings tax', 'DIRT ' + pcs(RI.sav.dirt) + ' on deposit interest; exit tax ' + pcs(RI.sav.exit) + ' on funds and life policies, with a ' + RI.sav.deemed + '-year deemed disposal'],
    ['Capital gains tax', pcs(RI.sav.cgt) + ' on gains above ' + eur(RI.sav.cgtExempt) + ' a year (disposals from 7 October 2026). In your plan it is taken off sales of other assets, crypto, gold and art, on the share of their value you treat as a gain. The yearly exemption is not counted.'],
    ['Gift and inheritance tax (CAT)', 'Group A threshold ' + eur(RI.sav.cat) + ' (a child from a parent), from 7 October 2026. Not in your plan yet.']].concat(RULES_YEAR === 2027 ? [['New Investment Account (announced)', 'Budget 2027 sets up the legal framework for a new Investment Account. The limits and tax details are not published yet, so it is not in your plan.']] : []).concat([
    ['Mortgage limits (Central Bank)', H.ltiFTB + '× income for first-time buyers, ' + H.ltiSSB + '× for others; at least a ' + pcs(1 - H.ltv) + ' deposit'],
    ['Stamp duty', pcs(H.stamp[0][1]) + ' up to ' + eur(H.stamp[0][0]) + ', ' + pcs(H.stamp[1][1]) + ' to ' + eur(H.stamp[1][0]) + ', ' + pcs(H.stamp[2][1]) + ' above']]); }
const govHTML = () => govRows().map(x => '<div class="mini"><span>' + esc(x[0]) + '</span><b>' + esc(x[1]) + '</b></div>').join('');
function stdLeft(){ return planMissing().length; }
function asmScreen(){ applyAssume(); const open = S.asmOpen === undefined ? 'prices' : S.asmOpen, left = planMissing().length;
  return '<div class="card"><b>' + (left ? 'To see your results we need ' + left + (left === 1 ? ' thing' : ' things') : 'Everything your results need is chosen') + '</b><p class="small" style="margin:2px 0 0">LifeMap sets the figures that are the same for everyone (tagged <b>' + T_SET + '</b>) and uses them from the start. Change any of them and it reads <b>' + T_MINE + '</b>. A rate we don\'t know is tagged <b>' + T_ASSUMED + '</b>.</p></div>' +
    ASM_GRP.map(([g, t]) => '<details class="card asmg" data-g="' + g + '"' + (open === g ? ' open' : '') + '><summary style="cursor:pointer;font-weight:800;min-height:44px">' + t + '</summary><div style="margin-top:10px">' +
    (g === 'prices' ? '<div class="field" style="margin:0 0 14px">' + inflChoice('asm') + '</div><div class="field" style="margin:0 0 14px"><span class="flabel">Growth assumptions set</span>' + assumeToggle() + '</div>' : '') + (g === 'length' ? retireField() + pRetireField() : '') +
    ASM_KEYS().filter(k => ASM[k].g === g).sort((a, b) => (b === 'planEnd') - (a === 'planEnd')).map(k => asmInput(k)).join('') + (g === 'safety' && [ 'budgetNeeds', 'budgetWants', 'budgetSave'].every(asmMine) && Math.abs(asmV('budgetNeeds') + asmV('budgetWants') + asmV('budgetSave') - 1) > 1e-6 ? '<p class="note">Your budget split adds up to ' + Math.round((asmV('budgetNeeds') + asmV('budgetWants') + asmV('budgetSave')) * 100) + '%. It should total 100%.</p>' : '') + '</div></details>').join('') +
    '<details class="card asmg" data-g="law"' + (open === 'law' ? ' open' : '') + '><summary style="cursor:pointer;font-weight:800;min-height:44px">' + T_GOV + '</summary><div style="margin-top:10px">' + govHTML() + '<p class="small" style="margin:8px 0 0">Set by law and the same for everyone, so you can\'t change them. ' + RULES_VERSION + '.</p></div></details>'; }
// Plan builder step 7: one place to make the choices the results need (§14), next to the inflation choice
function p4Asm(){ const n = reqKeys().length, got = n - req3Missing().length, rest = ASM_KEYS().filter(k => k !== 'planEnd'), mineN = rest.filter(asmMine).length;
  return '<div id="p4-asm"><div class="card" id="p4-3"><div class="p4-sum"><span class="p4-ck' + (got === n ? ' ok' : '') + '" aria-hidden="true">' + (got === n ? '✓' : got) + '</span><div><b>' + (got === n ? 'All ' + n + ' chosen' : 'Choose ' + n + ' things') + '</b><small>' + (got === n ? 'You can change any of these.' : 'Only you can choose these.') + '</small></div></div><div class="p4-prog" role="status" id="p4-count"><span><i style="width:' + Math.round(got / n * 100) + '%"></i></span><b class="sr">' + got + ' of ' + n + ' chosen</b></div>' +
    retireField() + asmInput('planEnd') + '<div id="p4-infl" class="field" style="margin:0 0 14px">' + inflChoice('p4') + '</div>' + pRetireField() + '</div>' +
    '<details class="card" id="p4-rest" data-g="p4"' + (S.asmOpen === 'p4' ? ' open' : '') + '><summary style="cursor:pointer;font-weight:800;min-height:44px">What we\'ve set for you (change any)</summary><p class="small" style="margin:6px 0 10px">Everything else is set from the start, so nothing else blocks your results. Figures that are the same for everyone are tagged <b>' + T_SET + '</b>; a rate we don\'t know is tagged <b>' + T_ASSUMED + '</b>. Change any one and it reads <b>' + T_MINE + '</b>.' + (mineN ? ' You have changed ' + mineN + '.' : '') + '</p>' +
    '<div style="margin-top:10px">' + rest.map(k => asmInput(k)).join('') + '</div></details></div>'; }
// §22: nothing blocks except the 3 choices. Shown above the results when details are missing or need a look; the count is the My money checklist's.
function missingFlags(){ return checkItems().filter(x => ['look', 'miss'].includes(x.st)); }
function detailsBanner(){ const n = missingFlags().length; if (!n) return '';
  return '<div class="nudge" id="miss-banner" role="status"><span aria-hidden="true">ℹ️</span><span><b>' + n + (n === 1 ? ' detail' : ' details') + ' missing</b> · counted as €0 for now, so this is a rough picture</span><button class="link" data-a="addmiss">' + (n === 1 ? 'Add it' : 'Add them') + '</button></div>'; }
// §27.7: one calm card for Home, Results, Report and the PDF button: how many things, each by its exact name, and a button that jumps to that box and highlights it
function gateHTML(where){ const m = planMissing(); if (!m.length) return '';
  return '<div class="card" id="gate-' + where + '" style="border:1.5px dashed #B9C9D6;box-shadow:none"><b>To see your results we need ' + m.length + (m.length === 1 ? ' thing' : ' things') + '</b><p class="small" style="margin:4px 0 8px">Only you can choose ' + (m.length === 1 ? 'this' : 'these') + ', so we never fill ' + (m.length === 1 ? 'it' : 'them') + ' in for you. Everything else is set for you and can be changed later.</p>' +
    m.map(x => '<div class="mini" style="align-items:center"><span><b>' + esc(x.t) + '</b></span><button class="btn sm" style="width:auto" data-a="gofix" data-p="' + x.k + '" aria-label="Choose ' + esc(x.t.toLowerCase()) + '">Choose</button></div>').join('') + '</div>'; }
// jump to the box for a required choice and highlight it
const GATE_GRP = {infl:'prices', retireAge:'length', planEnd:'length', pRetireAge:'length'};
function jumpTo(k){ const el = document.querySelector(k === 'infl' ? '[id^="infl-"]' : '.asmf[data-k="' + k + '"]'); if (!el) return; const d = el.closest('details'); if (d) d.open = true;
  el.classList.add('flash'); el.scrollIntoView({block:'center', behavior:'instant'}); const f = el.querySelector('input,button'); if (f) f.focus({preventScroll:true}); setTimeout(() => el.classList.remove('flash'), 4000); }
V.ME = () => { const m = S.me;
  if (m === 'asm') return {id:'ME-ASM', note:'Your assumptions (journey-spec §27): LifeMap standards are set automatically (Set by LifeMap) and can be changed (Your choice, with Back to LifeMap\'s figure); market rates we do not know use a suggested or planning rate (Assumed: add yours); only retirement age, plan-until age and inflation (and a working partner\'s retirement age) block results; type 1 values are shown as Set by Government. Drives the plan and the calculators live.', head:appHead('Your assumptions', 'Some values are set by law. For the rest we show a suggestion or the standard, and you choose.', S.asmBack || 'meback'), html:asmScreen()};
  if (m === 'recheck') return {id:'ME-CHK', note:'Re-check of the 6 Discover answers, pre-filled. Confirm or change (Pooja Q5).', head:appHead('Your first answers', 'From when you started. Do they still fit you?', 'meback'),
    html:umSummary(DISC6.map(q => ({d:q.id}))) + DISC6.filter(q => typeof S.ans[q.id] !== 'number').map(q => umQCard({d:q.id}, 'Not answered yet')).join(''), foot:'<button class="btn" data-a="recheckok">These still look right</button>'};
  if (m === 'terms') return {id:'ME-TERMS', note:'Your money terms: the Lifecast financial / behavioural terms from your answers, each with a plain-English meaning (§12).', head:appHead('Your money terms', 'The words an adviser would use, and what they mean for you.', 'meback'),
    html:'<div class="card">' + (myTerms().length ? termsHTML() : '<p class="small">Answer your first questions to see your terms.</p>') + '</div><p class="disc">These describe how you answered. They are not advice. ' + DISC_FORMAL + '</p>'};
  if (m === 'um') return {id:'ME-UM', note:'Understand Me = your money profile: 13 questions in 3 sections, each named with the term + a plain label (§12). 6 pre-filled from Discover, 7 to answer.', head:appHead('Your money profile', umLeftTxt() + '.', 'meback'),
      html:'<div class="card ump-hero"><div class="ump-top"><div><small>Your progress</small><b>' + umCount() + '<span> of 13 answered</span></b></div><span class="ump-pct">' + Math.round(umCount() / 13 * 100) + '%</span></div><div class="ump-bar"><i style="width:' + Math.round(umCount() / 13 * 100) + '%"></i></div><p>' + discCount() + ' came from your first answers. Three short sections make up your risk profile.</p></div>' +
        UM.map(s => { const tot = s.qs.length, got = s.qs.filter(q => q.d ? typeof S.ans[q.d] === 'number' : typeof S.um.a[q.u] === 'number').length, st = S.um.done[s.n] ? 'done' : got ? 'part' : 'none';
          return '<button class="ump-s ' + st + '" data-a="umsec" data-p="' + s.n + '"><span class="ump-e" aria-hidden="true">' + s.e + '</span><span class="ump-m"><small>' + s.term + '</small><b>' + s.t + '</b><span class="ump-sb"><i style="width:' + Math.round(got / tot * 100) + '%"></i></span><em>' + got + ' of ' + tot + ' answered</em></span><span class="ump-st">' + (st === 'done' ? '✓ Done' : got === tot ? 'Review' : 'Continue') + '</span><span class="sr">' + statusWord(st) + '</span></button>'; }).join('') +
        (umCount() === 13 ? '<button class="btn" data-a="me" data-p="umr" style="margin-top:6px">See my profile</button>' : '') + retBtn()};
  if (m === 'ums') { const s = UM.find(x => x.n === S.um.sec), off = UM.slice(0, s.n - 1).reduce((a, x) => a + x.qs.length, 0);
    return {id:'ME-UM' + s.n, note:'Understand Me section ' + s.n + ' · ' + s.t + '. Pre-filled answers shown selected, with Change.', head:appHead(s.e + ' ' + s.term, s.plain.charAt(0).toUpperCase() + s.plain.slice(1) + '.', 'me|um'),
      html:umSummary(s.qs) + s.qs.map((q, qi) => q.d && typeof S.ans[q.d] === 'number' ? '' : umQCard(q, (off + qi + 1) + ' of 13')).join(''), foot:'<button class="btn" data-a="umsave">Save this section</button>'}; }
  if (m === 'umr') { const P = personality(), r = riskRead(true), bar = (l, v) => '<div style="margin-top:10px;font-size:13px"><div>' + l + '</div><span class="pbar" style="display:block;margin-top:4px"><i style="width:' + Math.round(v / 5 * 100) + '%"></i></span></div>';
    return {id:'ME-R', note:'Understand Me result: money personality + indicative risk profile (5 labels, lowest of want, can afford, time and experience; FP review R2–R6). Feeds My Plan. Adviser confirms.', head:appHead('Your profile', '', 'me|um'),
      html:'<div class="card rp-hero"><div class="rp-top"><span class="rp-e" aria-hidden="true">' + P.e + '</span><div><small>Your money personality</small><b>' + P.name + '</b></div></div><p class="rp-strap">' + P.strap + '</p><div class="rp-str">' + P.str.map(x => '<span><i aria-hidden="true">✓</i>' + x + '</span>').join('') + '</div><div class="rp-watch"><span aria-hidden="true">👀</span><div><small>One thing to watch</small>' + P.watch + '</div></div></div>' +
        '<div class="card rp-terms"><h3 class="h">Your money terms</h3>' + termsHTML() + '</div>' +
        '<div class="card rp-risk"><small class="rp-lbl">Your indicative risk profile</small><div class="rp-rl">' + riskLabelText(r) + '</div>' + (r.label ? bar(sectLbl('appetite'), r.want) + bar(sectLbl('capacity'), r.can) + bar(sectLbl('horizon'), r.time) + (r.limit === 'experience' ? bar(sectLbl('experience'), r.level) : '') + '<p class="small" style="margin:8px 0 0">Set by: <b>' + RISK_SETBY[r.limit] + '</b></p>' + (r.keNote ? '<p class="small" style="margin:6px 0 0;color:var(--ink)">' + KE_NOTE + '</p>' : '') : '') + (r.mis ? '<p class="note" style="margin-top:12px">' + esc(r.mis) + '</p>' : '') + '<p class="small" style="margin:10px 0 0">This now shows on <b>My Plan</b> and in your plan report.</p></div>' +
        retBtn() + '<p class="disc">This is an indicative profile to guide your conversation. It is not advice. Your adviser confirms your risk profile with you. ' + DISC_FORMAL + '</p>'}; }
  if (m === 'details'){ const nm = S.acct.name || S.fin.name || '', dob = S.about.dob && dobValid(S.about.dob) ? dateLong(new Date(+S.about.dob.y, +S.about.dob.m - 1, +S.about.dob.d)) : '', age = S.about.ageToday || S.about.age || '';
    const row = (ic, l, v) => '<button class="pd-r" data-a="fsec" data-p="0"><span class="pd-i" aria-hidden="true">' + ic + '</span><span class="pd-l">' + l + '</span>' + (v !== '' && v != null ? '<b>' + esc(String(v)) + '</b>' : '<em>Add</em>') + '<span class="pd-c" aria-hidden="true">›</span></button>';
    return {id:'ME-DET', note:'My details as a profile page: photo header, personal and household groups; empty fields show Add.', head:appHead('', '', 'meback'),
      html:'<div class="card mepro pdpro"><div class="mp-cover" aria-hidden="true"></div><div class="mp-av"><span class="ph" style="background-image:url(' + (S.acct.photo || '/media/profile-photo.jpg') + ')"></span><label class="mp-cam" title="Change photo"><input type="file" id="avup" accept="image/*" aria-label="Change your photo"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg></label></div><h2 class="mp-name t" tabindex="-1">' + esc(nm || 'Your profile') + '</h2><p class="mp-sub">' + (S.acct.email ? esc(S.acct.email) : 'Add your details so your plan fits you') + '</p><button class="mp-edit" data-a="fsec" data-p="0">Edit profile</button></div>' +
        '<h3 class="me-gh">Personal</h3><div class="pd-list">' + row('👤', 'Name', nm) + row('✉️', 'Email', S.acct.email || '') + row('📱', 'Mobile', S.acct.mobile || '') + row('🎂', 'Date of birth', dob) + row('⏳', 'Age', age ? age + (S.about.ageToday ? ' today' : '') : '') + '</div>' +
        '<h3 class="me-gh">Household & plan</h3><div class="pd-list">' + row('💞', 'Partner', partnerLine()) + row('👨‍👩‍👧', 'People who rely on you', ['0','1','2','3+'][S.about.deps || 0]) + row('🌅', 'Retirement age', S.retireSet ? S.retireAge : '') + '</div>'}; }
  if (m === 'privacy') return {id:'ME-PRIV', note:'Privacy & preferences: consents, sustainability preference (§13, optional, goes to the adviser), what each adviser can see, delete my data.', head:appHead('Privacy & preferences', '', 'meback'),
    html:'<div class="card"><label class="check"><input type="checkbox" checked disabled><span>Use my details to build my plan (needed for the service)</span></label><label class="check"><input type="checkbox" data-acct="c2"' + (S.acct.c2 ? ' checked' : '') + '><span>Send me reminders and updates</span></label></div>' +
      '<div class="card"><b>Your preferences</b><p class="small" style="margin:4px 0 8px">Optional. Your adviser will ask about this before recommending anything.</p><div class="chips"><button class="chip sm' + (S.advQs.includes(ESG_Q) ? ' sel' : '') + '" aria-pressed="' + S.advQs.includes(ESG_Q) + '" data-a="advq" data-p="' + esc(ESG_Q) + '">🌿 ' + esc(ESG_Q) + '</button></div></div>' +
      '<div class="card"><b>What your adviser can see</b>' + (S.book.done ? Object.entries({report:'Plan report', fin:'Finances', docs:'Documents', um:'Understand Me profile'}).map(([k, l]) => '<div class="mini"><span>' + l + '</span><b>' + (S.book.share[k] ? 'Shared' : 'Not shared') + '</b></div>').join('') : '<p class="small" style="margin:6px 0 0">Nothing is shared. You choose what to share when you book.</p>') + '</div>' +
      '<button class="btn ghost" style="margin-top:12px;color:var(--gap-t)" data-a="sheet" data-p="delete">Delete my data</button><button class="link" data-a="sheet" data-p="money">How LifeMap makes money</button>'};
  if (m === 'money'){ const flags = checkItems().filter(x => ['look','miss'].includes(x.st));
    return {id:'ME-MONEY', note:'My money: the 6 finance sections, checklist of missing items and ones that need a look, add a document. No bank connection in this version.', head:appHead('My money', 'Keep your figures up to date. Your plan recalculates.', 'meback'),
      html:'<button class="btn sm" style="width:100%" data-a="upl" data-p="smart">📥 Add a document</button><div style="margin-top:12px">' + FSEC.map((s, i) => { const st = secStatus(s); return '<button class="goal" data-a="fsec" data-p="' + i + '"><span class="ic" aria-hidden="true">' + s.e + '</span><span style="flex:1;min-width:0"><b>' + s.t + '</b><br><span class="small">' + esc(secSummary(s)) + '</span></span><span class="sr">' + statusWord(st) + '</span>' + statIcon(st) + '</button>'; }).join('') + '</div>' +
        (flags.length ? '<div class="card"><b>To sharpen your plan</b>' + flags.map(x => '<div class="mini"><span>' + ({look:'⚠️', miss:'❓'})[x.st] + ' ' + esc(FF[x.k].l) + (x.st === 'miss' ? ' <span class="small">· optional</span>' : '') + '</span><button class="link" data-a="fix" data-p="' + FSEC.indexOf(x.s) + '">Fix</button></div>').join('') + '</div>' : '')}; }
  /* Me hub = the customer's profile hub (Pooja Q5) */
  const P = personality(), full = umCount() === 13, r = riskRead(full), b = S.about, nm = S.acct.name || S.fin.name || 'You';
  const seg = (a, opts, on) => '<div class="seg" role="group" style="margin:6px 0 0">' + opts.map(([v, l]) => '<button class="' + (on(v) ? 'on' : '') + '" aria-pressed="' + on(v) + '" data-a="' + a + '" data-p="' + v + '">' + l + '</button>').join('') + '</div>';
  return {id:'ME-01', note:'Me = profile hub: name, partner (invite or add myself), dependants · money personality + indicative risk profile · re-check of first answers · deeper questions (feed My Plan). Not a gate.', head:appHead('Me', 'Your profile. It shapes your plan and helps your adviser.'),
    html:(S.book.done && needsProfile() ? nudge('🧭', 'Check your profile before your adviser meeting', 'Check now', 'toprofile') : '') +
      (() => { const pr = Math.round(umCount() / 13 * 100), Pz = personality(); return '<div class="card mepro"><div class="mp-cover" aria-hidden="true"></div><div class="mp-av"><span class="ph" style="background-image:url(' + (S.acct.photo || '/media/profile-photo.jpg') + ')"></span><i class="mp-ring" style="--p:' + pr + '"></i><label class="mp-cam" title="' + (S.acct.photo ? 'Change photo' : 'Add a photo') + '"><input type="file" id="avup" accept="image/*" aria-label="' + (S.acct.photo ? 'Change your photo' : 'Add a profile photo') + '"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg></label></div><h3 class="mp-name">' + esc(nm) + '</h3><p class="mp-sub">' + (b.age ? 'Age ' + b.age + (YEAR0 > dobToday().getFullYear() ? ' when your plan starts in ' + YEAR0 : '') : 'Add your date of birth in Edit profile') + (S.retireSet ? '<br>Retiring at ' + S.retireAge : '') + '</p>' + (Pz ? '<span class="mp-type"><span aria-hidden="true">' + Pz.e + '</span>' + Pz.name + '</span>' : '') +
        '<button class="mp-edit" data-a="me" data-p="details">Edit profile</button>' +
        '<div class="mp-stats"><div><b>' + pr + '<small>%</small></b><span>Profile</span></div><div><b>' + S.goals.length + '</b><span>Goals</span></div><div><b>' + (S.retireSet ? S.retireAge : '–') + '</b><span>Retire at</span></div></div></div>'; })() +
      '<div class="card mehh"><h3 class="h">Your household</h3><div class="field" style="margin:10px 0 0"><span class="flabel">Planning with a partner?</span>' + seg('partner', [['Yes','Yes'],['No','No']], v => (v === 'Yes' && b.partner === true) || (v === 'No' && b.partner === false)) + (b.partner ? marriedField() + partnerBlock() : '') + '</div>' +
        '<div class="field" style="margin:16px 0 0"><span class="flabel">Children or others who rely on you</span>' + seg('deps', [[0,'0'],[1,'1'],[2,'2'],[3,'3+']], v => b.deps === v) + '</div></div>' +
      (!discEnough() ? '<div class="card"><div class="eyebrow">Your profile</div><p class="small" style="color:var(--ink);margin:6px 0 0">Answer a few more of your first questions to see your money personality and indicative risk profile.</p><button class="link" data-a="me" data-p="recheck">Answer a few more</button></div>' :
      '<div class="card mepr"><div class="mepr-top"><span class="mepr-e" aria-hidden="true">' + P.e + '</span><div><small>Your money personality</small><b>' + P.name + '</b><span>' + P.strap + '</span></div></div>' +
        '<div class="mepr-risk"><div class="mepr-rl"><small>Indicative risk profile</small><b>' + riskLabelText(r).replace(/\s*\(first read\)/i, '') + '</b></div><div class="mepr-meter" aria-label="' + umCount() + ' of 13 answers"><span><i style="width:' + Math.round(umCount() / 13 * 100) + '%"></i></span><small>' + (full ? 'Confirmed · all 13 answers' : umCount() + ' of 13 answers · first read') + '</small></div></div>' +
        '<button class="mepr-cta" data-a="me" data-p="' + (full ? 'umr' : 'um') + '">' + (full ? 'See my full profile' : 'Answer ' + (13 - umCount()) + ' more to confirm') + ' <i aria-hidden="true">→</i></button></div>') +
      '<h3 class="me-gh">Your profile</h3><div class="melist">' + rowBtn('me', 'recheck', '✅', 'Your first answers', S.um.rechecked ? 'Checked ✓' : discCount() + ' answers · check they still fit') + rowBtn('me', 'terms', '📖', 'Your money terms', 'Adviser words, in plain English') +
        rowBtn('me', 'um', '🧭', 'Your full money profile', umNewCount() + ' of 7 deeper questions', '<span class="me-pct">' + Math.round(umCount() / 13 * 100) + '%</span>') +
        '</div><h3 class="me-gh">Settings</h3><div class="melist">' + (S.app ? rowBtn('me', 'money', '💶', 'My money', 'Finances and documents') : rowBtn('makeplan', '', '💶', 'My money', 'Added when you make your plan')) + rowBtn('me', 'asm', '🧮', 'Your assumptions', 'Prices, growth and retirement') + rowBtn('me', 'privacy', '🔐', 'Privacy & preferences', 'Consents and your data') + '</div>' +
      '<p class="disc">None of this is required. It sharpens your plan and means your adviser won\'t ask you again.</p>'};
};
function partnerLine(){ if (!S.about.partner) return 'No'; const pt = S.partner; return pt.mode === 'invite' ? (pt.sent ? 'Invited · ' + pt.email : 'Invite not sent yet') : pt.mode === 'manual' ? [pt.name || 'Added by you', S.fin.pAge ? 'age ' + S.fin.pAge : ''].filter(Boolean).join(', ') : 'Yes'; }
/* ================= §12 APP SHELL BEFORE A PLAN: Home, My Plan empty state, plan builder ================= */
const PB = [['B1','About you & family'],['F1','Your goals'],['F2','Your timeline'],['B4','Your money profile'],['P1','Secure your account'],['P2','Your finances'],['P4','Check your details'],['U1','Your results']];
function pbStep(id){ id = id || S.scr; return /^B1/.test(id) ? 1 : id === 'F1' ? 2 : /^F[24]/.test(id) ? 3 : id === 'B4' ? 4 : /^P1/.test(id) ? 5 : /^P[23]|^PU/.test(id) ? 6 : id === 'P4' ? 7 : id === 'U1' ? 8 : 1; }
// FP round 7 (audit #4, #8, #9): tax credits that need a Yes from the customer. One light, optional chip group; each chip only when it can apply.
function credChips(){ const C = S.about.cred || {}, items = [['rent', 'I pay rent on my home (not to a relative)', 'Rent Tax Credit, up to ' + eur(RI.it.rent) + ' a year (' + eur(RI.it.rentJoint) + ' for a married couple), to ' + RI.it.rentLastYear, S.fin.home !== 'Own outright' && S.fin.home !== 'Own with mortgage'],
    ['lone', 'I\'m the main carer of a child, with no partner', 'Single Person Child Carer Credit ' + eur(RI.it.spccc) + ' and a ' + eur(RI.it.bandSPCCC) + ' standard-rate band', S.about.deps > 0 && !S.about.partner],
    ['carer', 'One of us stays at home to care for a child or dependant', 'Home Carer Tax Credit up to ' + eur(RI.it.homeCarer) + ' (married couples)', !!S.about.partner && S.about.married === true]].filter(x => x[3]);
  if (!items.length) return '';
  return '<div class="field" style="margin:14px 0 0;border-top:1px dashed var(--line);padding-top:12px"><span class="flabel" id="cred-l">Do any of these apply to you? <span class="small" style="font-weight:600">Optional</span></span><div class="chips" role="group" aria-labelledby="cred-l">' + items.map(([k, l]) => '<button class="chip sm' + (C[k] ? ' sel' : '') + '" aria-pressed="' + !!C[k] + '" data-a="cred" data-p="' + k + '">' + esc(l) + '</button>').join('') + '</div><span class="small">' + items.map(x => esc(x[2])).join(' · ') + '.</span></div>'; }
/* FP round 7: "Add to my plan" hand-offs, as the workbook (audit Musts): spend goals in today's money with "already saved"; pots and the emergency fund as
   reserves (not spends); mortgage-free as an mfree goal; retirement updates the existing goal; pension tools raise the contribution; protection
   tools record a need for the adviser; debts and info-only tools add nothing. */
function handoffHTML(p, g){ const yrsTo = n => Math.max(1, n), when = n => ' in about ' + yrN(yrsTo(n)) + ' (age ' + (S.about.age + yrsTo(n)) + ')';
  if (!g) return '<h2 class="t">Nothing to add</h2><p class="sub">This result doesn\'t create a goal' + (p === 'debtpay' ? ': your plan already repays this debt.' : '.') + '</p><button class="btn" data-a="closesheet">OK</button>';
  if (g.kind === 'blocked') return '<h2 class="t">' + esc(g.msg) + '</h2><p class="sub">Goals are kept in today\'s money, so we need your inflation rate first.</p>' + inflChoice('add') + '<button class="btn" style="margin-top:10px" data-a="closesheet">OK</button>';
  const d = g.kind === 'retire' ? 'Your retirement goal becomes ' + eur(g.amount) + ' a year from age ' + g.age + '. No new goal is added.'
    : g.kind === 'pension' ? 'Your plan\'s pension contribution goes up by ' + eur(g.amount) + ' a month. Pension money is not a spending goal.'
    : g.kind === 'need' ? 'We note ' + (g.need === 'life' ? 'a life cover' : 'an income protection') + ' need of ' + eur(g.amount) + (g.need === 'ip' ? ' a month' : '') + ' for your adviser. Cover is bought for a premium; it is not money to save.'
    : g.kind === 'mfree' ? 'A "Mortgage free" milestone' + when(g.years) + ', priced from your mortgage (no cash amount).'
    : (g.kind === 'safety' ? 'An emergency fund (a reserve, not a spend) of ' : g.kind === 'pot' ? 'A savings pot of ' : '') + eur(g.amount) + ' in today\'s money' + when(g.years) + (g.saved ? ', with ' + eur(g.saved) + ' already saved' : '') + '.';
  return '<div class="eyebrow">Add to my plan</div><h2 class="t">' + g.em + ' ' + esc(g.name) + '</h2><p class="sub">' + d + ' ' + (S.app ? 'This saves a new version of your plan.' : 'It will be on your timeline when you make your plan.') + '</p><button class="btn" data-a="confirmcalcadd" data-p="' + p + '">' + (g.kind === 'retire' ? 'Update it' : g.kind === 'pension' ? 'Raise it' : g.kind === 'need' ? 'Note it' : 'Add it') + '</button><button class="btn ghost" style="margin-top:10px" data-a="closesheet">Not now</button>'; }
function applyHandoff(g){ const a0 = S.about.age, age = n => Math.min(AS.end, a0 + Math.max(1, n));
  if (g.kind === 'retire'){ let r = retireGoal(); if (!r){ r = mkGoal('retire'); S.goals.push(r); } r.amount = Math.round(g.amount); setRetireAge(clamp(g.age, a0 + 1, retMax())); return 'Retirement goal updated'; }
  if (g.kind === 'pension'){ S.penExtra = Math.round((+(S.penExtra || 0) + g.amount) * 100) / 100; return 'Pension contribution raised by ' + eur(g.amount) + ' a month'; }
  if (g.kind === 'need'){ S.needs = Object.assign({}, S.needs, {[g.need]:Math.round(g.amount)}); return 'Noted for your adviser'; }
  if (g.kind === 'mfree'){ let m = S.goals.find(x => x.kind === 'mfree'); if (!m){ m = mkGoal('mfree'); S.goals.push(m); } m.age = age(g.years); return 'Mortgage free added to your plan'; }
  const k = g.kind === 'safety' ? 'safety' : g.kind === 'pot' ? 'wealth' : g.k === 'home' ? 'home' : 'other', x = k === 'other' ? mkGoal('other', [g.em, g.name, Math.round(g.amount), Math.max(1, g.years)]) : mkGoal(k);
  x.name = g.name.replace(/ \(deposit goal\)$/, ''); x.e = g.em; x.amount = Math.round(g.amount); x.auto = false; x.age = age(g.years); x.saved = Math.round(g.saved || 0); S.goals.push(x);
  return (S.app ? x.name + ' added to your plan' : x.name + ' added. It will be on your timeline when you make your plan'); }
function marriedField(){ const m = S.about.married; return '<div style="margin:10px 0 0"><span class="flabel" style="font-size:13.5px">Married or in a civil partnership? <span class="small" style="font-weight:600">Optional</span></span><div class="seg" role="group" aria-label="Married or in a civil partnership" style="margin:6px 0 0">' + ['Yes','No'].map(x => { const on = (m === true && x === 'Yes') || (m === false && x === 'No'); return '<button class="' + (on ? 'on' : '') + '" aria-pressed="' + on + '" data-a="married" data-p="' + x + '">' + x + '</button>'; }).join('') + '</div><span class="small">If yes, we use joint assessment for income tax, which can lower your tax.</span></div>'; }
/* Step 1's Next needs an age the customer gave (never a default). Called when the age changes without a re-render. */
function ageNext(){ const b = document.querySelector('.foot [data-a="go"][data-p="F1"]'); if (b && S.about.age >= 18 && S.about.partner != null && S.about.deps != null) b.disabled = false; }
const verified = () => S.acct.ev && S.acct.sv;
function pbBar(){ const k = pbStep(); return '<div class="pbbar" role="img" aria-label="Plan builder, step ' + k + ' of 8: ' + PB[k - 1][1] + '">' + PB.map((x, i) => '<i class="' + (i + 1 < k ? 'done' : i + 1 === k ? 'on' : '') + (i === 4 && verified() && k !== 5 ? ' skip' : '') + '"></i>').join('') + '</div>'; }
function prefillAbout(){ if (S.acct.name){ S.fin.name = S.acct.name; S.src.name = S.src.name || 'pre'; } if (S.about.age >= 18){ S.fin.age = S.about.age; S.src.age = S.src.age || 'pre'; } if (S.retireSet){ S.fin.retireAge = S.retireAge; S.src.retireAge = S.src.retireAge || 'pre'; } }
function pbAfterProfile(){ if (typeof S.um.a.u9 !== 'number' && UM_NEW.some(u => u !== 'u9' && (u === '6' ? typeof S.ans['6'] === 'number' : typeof S.um.a[u] === 'number'))) S.um.a.u9 = suggestU9();
  UM.forEach(s => { if (s.qs.every(q => q.d ? typeof S.ans[q.d] === 'number' : typeof S.um.a[q.u] === 'number')) S.um.done[s.n] = true; });
  if (verified()){ prefillAbout(); go('P2'); } else go('P1'); }
function makePlanCard(big){ const k = S.pb ? pbStep() : 0;
  return '<div class="card mkplan mk2"><div class="mk-chips"><span>⏱ ' + (k ? 'Step ' + k + ' of 8' : 'About 10 min') + '</span><span>☁️ Saves as you go</span></div><b class="mk-t">' + (k ? 'Carry on with your plan' : 'Make my plan') + '</b><p class="mk-d">' + (k ? 'Next: ' + PB[k - 1][1].toLowerCase() + '. Everything so far is saved.' : 'Your goals, timeline and money in one clear plan.') + '</p><button class="btn mk-go" data-a="makeplan">' + (k ? 'Carry on · step ' + k + ' of 8' : 'Start my plan') + ' <span aria-hidden="true">→</span></button></div>'; }   // v48
V.HOME0 = () => { const P = personality(), tg = myTerms().flatMap(x => x.tags).slice(0, 3), k = S.pb ? pbStep() : 0, h = new Date().getHours(), nm = S.acct.name, t = dobToday(), DN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], MN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return {id:'HOME-0', note:'Home before a plan (layout v15, 11 Oct 2026, from the customer\'s insurance-app reference): gradient hero with greeting, glass pill to the money personality, overlapping Make my plan card, tools as service chips, personality e-card with terms, videos.', head:homeHeadBar(),
    html:'<div class="h0hero">' + HFX + '<span class="h0date">' + DN[t.getDay()] + ' · ' + t.getDate() + ' ' + MN[t.getMonth()] + '</span><span class="h0hi">' + (h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening') + '</span><h2 class="t" tabindex="-1">' + (nm ? esc(nm) : 'Welcome to Life Map') + '</h2>' +
      (P ? '<button class="h0pill" data-a="me" data-p="terms"><span class="h0badge" aria-hidden="true">' + P.e + '</span><span>Your money personality: <b>' + P.name + '</b></span><span class="chev" aria-hidden="true">›</span></button>' : '<button class="h0pill" data-a="me" data-p="recheck"><span class="h0badge" aria-hidden="true">🧭</span><span>See your money personality</span><span class="chev" aria-hidden="true">›</span></button>') + '</div>' +
      '<div class="card h0plan"><div class="row" style="align-items:flex-start"><div style="flex:1"><b class="h0pt">' + (k ? 'Carry on with your plan' : 'Make my plan') + '</b><div class="small h0due"><span aria-hidden="true">🕒</span> ' + (k ? 'Step ' + k + ' of 8 · ' + PB[k - 1][1].toLowerCase() : 'About 10 minutes · 8 short steps') + '</div></div><span class="h0art" aria-hidden="true">🗺️</span></div>' +
      '<div class="h0foot"><span class="small">' + (k ? 'Everything so far is saved.' : 'Goals, timeline and money in one plan.') + '</span><button class="btn sm" data-a="makeplan">' + (k ? 'Carry on' : 'Start') + '</button></div></div>' +
      askBar() +
      '<div class="sec"><h3>Tools to try</h3><button class="link" data-a="tab" data-p="explore">Explore</button></div><div class="svc2">' + toolsForYou().map((id, i) => { const c = C(id); return '<button class="sv2" data-a="calc" data-p="' + id + '"><span class="sv2-i" aria-hidden="true">' + c.em + '</span><span class="sv2-t"><b>' + esc(c.name) + '</b><small>' + esc(c.q) + '</small></span><span class="sv2-go" aria-hidden="true">→</span></button>'; }).join('') + '</div>' +
      (P ? '<div class="sec"><h3>Your profile card</h3><button class="link" data-a="me" data-p="terms">All terms</button></div>' + (() => { const rr = riskRead(false); return '<div class="ecard ec3"><span class="ec3-ic" aria-hidden="true">' + P.e + '</span><div class="ec3-m"><small>Money personality</small><b>' + P.name + '</b><span>' + esc(P.strap) + '</span></div><div class="ec3-pills">' + [['🌦️', 'Risk', rr.comfort, rr.comfort ? COMFORT.indexOf(rr.comfort) + 1 : 0], ['🛟', 'Cushion', rr.cushion, rr.cushion === 'Strong' ? 4 : rr.cushion ? 1 : 0]].map(([e, l, v, n]) => '<span class="ec3-p"><span class="ec3-pi" aria-hidden="true">' + e + '</span><span class="ec3-pt"><small>' + l + '</small><b>' + esc(v || '–') + '</b><i class="ec3-mt" aria-hidden="true">' + [1, 2, 3, 4].map(k => '<em' + (k <= n ? ' class="on"' : '') + '></em>').join('') + '</i></span></span>').join('') + '</div></div>'; })() + '' +
        '<div class="card" style="margin-top:12px">' + tg.map(termRow).join('') + '</div>'
      : '') +
      watchHTML() + '<p class="disc">Guidance, not advice.</p>'}; };
const PB_INFO = [['🙂','Name, age, partner and family'],['🎯','Pick what matters to you'],['🗓️','Drag goals to when you want them'],['🧭','A few questions about risk'],['🔐','A quick email and mobile check'],['💶','Income, savings, home and pension'],['✅','A short review before results'],['📈','See what is on track and what to do next']];   // v48
V.PLAN0 = () => ({id:'PLAN-0', note:'My Plan before a plan exists (§12): empty state + "Make my plan", which starts the 8-step plan builder.', head:appHead('My Plan', 'Your plan will live here.'),
  html:makePlanCard(true) + '<div class="card wyd"><div class="wyd-h"><b>What you\'ll do</b><span>8 steps · about 10 min</span></div><ol class="wsteps">' + PB.map((x, i) => { const d = PB_INFO[i], done = S.pb && i + 1 < pbStep(), now = S.pb && i + 1 === pbStep(); return '<li class="' + (done ? 'done' : now ? 'now' : '') + '"><span class="ws-ic" aria-hidden="true">' + (done ? '✓' : d[0]) + '</span><span class="ws-m"><b>' + (i + 1) + '. ' + x[1] + (i === 4 ? ' <em>If needed</em>' : '') + '</b><small>' + d[1] + '</small></span></li>'; }).join('') + '</ol></div><p class="disc">Guidance, not advice. Nothing is shared with an adviser unless you choose.</p>'});
function dobField(who){ const you = who === 'you', key = you ? 'dob' : 'pdob', d = S.about[key] || {}, c = dobCheck(d, who), id = you ? 'dob' : 'pdob', nm = you ? 'your' : 'their';
  const inp = (part, ph, w, ac, lab) => '<input class="in dob" id="' + id + '-' + part + '" inputmode="numeric" autocomplete="' + ac + '" maxlength="' + (part === 'y' ? 4 : 2) + '" placeholder="' + ph + '" aria-label="' + lab + '" data-dob="' + who + '|' + part + '" style="width:' + w + 'px;text-align:center" value="' + esc(d[part] == null ? '' : d[part]) + '">';
  return '<div class="field"><span class="flabel" id="lab-' + id + '">' + (you ? 'Your date of birth' : 'Their date of birth') + ' <span id="tag-' + id + '">' + (you ? '' : tagFor('pAge')) + '</span></span><div class="dobrow" role="group" aria-labelledby="lab-' + id + '" style="display:flex;gap:8px;align-items:center">' + inp('d', 'DD', 64, you ? 'bday-day' : 'off', 'Day of birth') + inp('m', 'MM', 64, you ? 'bday-month' : 'off', 'Month of birth') + inp('y', 'YYYY', 92, you ? 'bday-year' : 'off', 'Year of birth') + '</div>' +
    '<p class="small" id="' + id + '-msg" role="status" aria-live="polite" style="margin:6px 0 0;min-height:18px;' + (c.text && !c.ok ? 'color:var(--gap-t)' : 'color:var(--acc-d)') + '">' + esc(c.text) + '</p><p class="small dobnote" style="margin:2px 0 0">🔒 Used for your ages only. Stays on your device.</p>' +
    (you ? '' : '<div class="fhelp"><button class="link" data-a="fex" data-p="pAge" aria-haspopup="dialog">Not sure? See an example</button></div>') + '</div>'; }
V.B1 = () => { const b = S.about, ok = b.age >= 18 && b.partner != null && b.deps != null;
  return {id:'B1', note:'Plan builder step 1 (layout v17): three glass sections (You · Partner · Family) with icon headers; partner as illustrated choice tiles; dependants as number tiles. Same fields and actions as before.', head:flowHead(1, 'Step 1', 'About you & your family', 'So we can suggest goals that fit your life stage.', 'pbexit'),
  html:'<div class="card bcard">' +
    '<div class="field"><label for="b-name">Your first name</label><div class="inw icw"><svg class="in-ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg><input class="in" id="b-name" data-acct="name" autocomplete="given-name" placeholder="e.g. Aoife" value="' + esc(S.acct.name) + '"></div></div>' +
    dobField('you') + '</div>' +
    '<div class="card bcard">' +
    '<div class="field" style="margin:0"><span class="flabel">Planning with a partner?</span><div class="bchoice" role="group" aria-label="Planning with a partner">' + [['Yes','💑','Together','As a couple'],['No','🙋','Just me','On my own']].map(([x, e, t, d]) => { const on = (b.partner === true && x === 'Yes') || (b.partner === false && x === 'No'); return '<button class="bch' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-a="partner" data-p="' + x + '"><span class="bch-ic" aria-hidden="true">' + e + '</span><b>' + t + '</b><small>' + d + '</small></button>'; }).join('') + '</div>' + (b.partner ? marriedField() + partnerBlock(!verified()) : '') + '</div></div>' +
    '<div class="card bcard"><span class="flabel" style="display:block;margin-bottom:8px">Children or others who rely on you</span>' +
    '<div class="bdeps" role="group" aria-label="Children or others who rely on you">' + [['0','none'],['1','one'],['2','two'],['3+','three or more']].map(([x, w], k) => '<button class="bdep' + (b.deps === k ? ' on' : '') + '" aria-pressed="' + (b.deps === k) + '" aria-label="' + w + '" data-a="deps" data-p="' + k + '"><b>' + x + '</b><small>' + (k === 0 ? 'None' : k === 3 ? 'or more' : k === 1 ? 'person' : 'people') + '</small></button>').join('') + '</div></div>',
  foot:'<p class="fnote">You can change these any time.</p><button class="btn" data-a="go" data-p="F1"' + (ok ? '' : ' disabled') + '>Next: your goals</button>'}; };
function umLeftTxt(){ const n = UM_NEW.filter(u => u === '6' ? typeof S.ans['6'] !== 'number' : typeof S.um.a[u] !== 'number').length, d = discCount();
  return n === 7 ? '7 quick questions · your first ' + d + ' answers are filled in' : n ? n + ' of 7 left · your first ' + d + ' answers are filled in' : 'All 7 answered · your first ' + d + ' answers are filled in'; }
V.B4 = () => { const n = UM_NEW.filter(u => u === '6' ? typeof S.ans['6'] !== 'number' : typeof S.um.a[u] !== 'number').length;
  return {id:'B4', note:'Plan builder step 4: your money profile = Understand Me. The 6 Discover answers pre-filled (confirm or change) + 7 to answer (Q6 + u9, u10, u12, u14, u4, u11; §13 wording). 13 questions in the whole journey. Skippable.', head:flowHead(4, 'Step 4', 'Your money profile', umLeftTxt() + '. You can skip this.', 'go|F4'),
  html:UM.map(s => '<div class="sec" style="margin-top:18px"><h3 style="font-size:16px">' + s.e + ' ' + s.term + ': <span style="font-weight:600">' + s.plain + '</span></h3></div>' + umSummary(s.qs) + s.qs.filter(q => q.d ? typeof S.ans[q.d] !== 'number' : true).map(q => umQCard(q, q.d ? 'To answer' : 'New')).join('')).join('') +
    '<p class="disc">Indicative only, to guide your conversation. Your adviser confirms your risk profile with you. ' + DISC_FORMAL + '</p>',
  foot:'<button class="btn" data-a="pbprofile">' + (n ? 'Save and continue' : 'Continue') + '</button><button class="btn ghost" data-a="pbprofile" data-p="skip">Skip for now</button>'}; };

/* ================= EXPLORE (ported from Lifecast: CATS / CALCS / calcVals / calcOut, VIDEOS / LIVE / watchHTML) ================= */
/* FP round 7: every calculator follows the corrected workbook deliverables/LifeGoals-Calculators.xlsx (C01–C28, same formulas, edge texts
   and hand-offs). Each run() also returns num: the workbook's named results, so scratchpad/calc-vs-xlsx.js can compare them. */
const fvL = (p, r, y) => p * Math.pow(1 + r / 100, y);
const iEq = r => Math.pow(1 + r / 100, 1 / 12) - 1;   // monthly rate equal to a yearly rate (r in %)
const fvA = (m, r, y) => { const i = iEq(r), n = y * 12; return i ? m * (Math.pow(1 + i, n) - 1) / i : m * n; };   // level end-of-month saving
const pmt = (P, r, y) => { const i = r / 100 / 12, n = y * 12; return i ? P * i / (1 - Math.pow(1 + i, -n)) : P / n; };   // mortgages: nominal rate ÷ 12
const pmtI = (P, i, n) => i ? P * i / (1 - Math.pow(1 + i, -n)) : P / n;
// Excel-equivalent helpers (balance after n payments; NPER rounded to 6 decimals then up; last part payment; exact total interest)
const balAfter = (P, i, pay, n) => i ? P * Math.pow(1 + i, n) - pay * (Math.pow(1 + i, n) - 1) / i : P - pay * n;
const nperUp = (P, i, pay) => { if (pay <= P * i || pay <= 0) return Infinity; const x = i ? -Math.log(1 - P * i / pay) / Math.log(1 + i) : P / pay; return Math.ceil(Math.round(x * 1e6) / 1e6); };
const lastPayI = (P, i, pay, n) => balAfter(P, i, pay, n - 1) * (1 + i);
const totIntI = (P, i, pay, n) => pay * (n - 1) + lastPayI(P, i, pay, n) - P;
// FP round 6: the customer's own figure, if the tool still shows the figures we pre-filled (not moved by the customer)
const mine = (id, keys) => !keys.some(k => ((S.calcT || {})[id] || {})[k]);
const statedM = k => S.src && S.src[k] && +S.fin[k] > 0 ? +S.fin[k] : null;   // a stated (statement or typed) monthly figure
const srcWord = k => S.src[k] === 'doc' ? 'your statement' : 'your figures';
const yrs = m => { const y = Math.floor(m / 12), mo = Math.round(m % 12); return y ? y + ' yr' + (y > 1 ? 's' : '') + (mo ? ' ' + mo + ' mo' : '') : mo + (mo === 1 ? ' month' : ' months'); };
const yrN = n => n + (n === 1 ? ' year' : ' years');
const mTxt = (m, never) => m === Infinity ? (never || 'Never at this repayment') : m > CAP_MONTHS ? 'Over 100 years' : yrs(m);
const CAP_MONTHS = 1200, CAP_YEARS = 60;
const minus = x => (x < 0 ? '−' : '+') + eur(Math.abs(x));
const NO_INFL = 'Choose your inflation rate to see this', NO_INFL_GOAL = 'Choose an inflation rate first';
const BEFORE_TAX = () => 'Before tax: deposit interest pays DIRT at ' + Math.round(RI.sav.dirt * 100) + '%; investment funds and life policies pay exit tax at ' + Math.round(RI.sav.exit * 100) + '% (plus ' + RI.sav.deemed + '-year deemed disposal). No tax is taken off here.';
// payoff (months, interest) at a monthly rate; kept for the foundations and the plan's debt checks
function payoff(bal, r, pay, iM){ const i = iM != null ? iM : r / 100 / 12, m = nperUp(bal, i, pay); return m === Infinity ? {m:Infinity, int:0} : {m, int:totIntI(bal, i, pay, m)}; }
// drawdown: withdraw at the start of each year, grow the rest; the withdrawal rises with inflation (workbook C15 / C16)
// a tiny tolerance: growth equal to inflation pays exactly pot ÷ withdrawal years
function lasts(pot, w, g, inf, end){ let y = 0; const G = 1 + g / 100; if (end){ while (y < CAP_YEARS && pot * G + 1e-6 >= w){ pot = pot * G - w; w *= 1 + inf / 100; y++; } return y; } while (y < CAP_YEARS && pot + 1e-6 >= w){ pot = (pot - w) * G; w *= 1 + inf / 100; y++; } return y; }
const stampDuty = p => { let t = 0, lo = 0; for (const [hi, r] of RI.home.stamp){ t += Math.max(0, Math.min(p, hi) - lo) * r; lo = hi; if (p <= hi) break; } return t; };
const CATS = [
  {id:'home', name:'Home & Mortgage', em:'🏡', color:'var(--c2)', blurb:'Borrowing, deposits, repayments'},
  {id:'savings', name:'Savings & Goals', em:'🎯', color:'var(--c3)', blurb:'Plan any goal, see growth'},
  {id:'retire', name:'Pensions & Retirement', em:'🌅', color:'var(--c7)', blurb:'Projections and income'},
  {id:'invest', name:'Investments', em:'📈', color:'var(--c5)', blurb:'Growth, fees, ups and downs'},
  {id:'protect', name:'Protection', em:'🛡️', color:'var(--c4)', blurb:'Cover for you and your family'},
  {id:'everyday', name:'Everyday Money', em:'💶', color:'var(--c1)', blurb:'Budget, surplus, debt, net worth'}
];
const I = (k, l, v, min, max, step, u) => ({k, l, v, min, max, step, u});
const HOME_GOAL_YEARS = 3, SAFETY_GOAL_YEARS = 2;   // "Add to my plan" defaults (the customer can move them in the plan)
const relLimitM = (age, sal, existing) => Math.max(0, relLim(age) * Math.min(sal, RI.pen.earnCap) - existing);   // room left for relief a year

const CALCS = [
 {id:'borrow', cat:'home', name:'How much could I borrow?', q:'What home price could be within reach?', em:'🏡',
  inputs:[I('inc','Your gross yearly income',60000,15000,250000,1000,'€'),I('inc2','Partner\'s gross yearly income',0,0,250000,1000,'€'),I('dep','Deposit saved',25000,0,200000,1000,'€'),I('ftb','First-time buyer?',1,0,1,1,'yn'),I('rate','Interest rate',3.75,1,8,0.05,'%'),I('term','Mortgage term (years to repay)',30,10,35,1,'y')],
  wi:[I('xdep','Save extra towards deposit',0,0,50000,1000,'€')],
  run(v){ const H = RI.home, [[b1, r1], [b2, r2], [, r3]] = H.stamp, d0 = 1 - H.ltv, mult = v.ftb ? H.ltiFTB : H.ltiSSB, fees = +asmV('buyFees'), dep = v.dep + (v.xdep || 0), byInc = (v.inc + v.inc2) * mult, cash = Math.max(0, dep - fees);
    // the deposit pays 10% of the price, the stamp duty (band by band) and the fees (audit #60; workbook C01, solved exactly)
    const c1 = (d0 + r1) * b1, c2 = c1 + (d0 + r2) * (b2 - b1), byDepP = cash <= c1 ? cash / (d0 + r1) : cash <= c2 ? b1 + (cash - c1) / (d0 + r2) : b2 + (cash - c2) / (d0 + r3);
    const ic = byInc + cash, i1 = (1 + r1) * b1, i2 = i1 + (1 + r2) * (b2 - b1), byIncP = ic <= i1 ? ic / (1 + r1) : ic <= i2 ? b1 + (ic - i1) / (1 + r2) : b2 + (ic - i2) / (1 + r3);
    const price = Math.min(byDepP, byIncP), loan = Math.min(byInc, H.ltv * price), sd = stampDuty(price), m = pmt(loan, v.rate, v.term), by = byDepP < byIncP ? 'Your deposit' : 'Your income', goalAmt = Math.round(price * d0 + sd + fees);
    return {lbl:'Homes up to about', val:eur(price), line:'Central Bank rules: up to ' + mult + '× income for ' + (v.ftb ? 'first-time' : 'second and subsequent') + ' buyers, and at least a 10% deposit (90% loan-to-value). Your deposit also pays the stamp duty (' + LAW.stamp + ') and buying fees (' + eur(fees) + ', your assumption). Stamp duty is worked out on the price shown; for a new home it is charged on the price excluding VAT, and Help to Buy is not included. Here ' + by.toLowerCase() + ' sets the amount. Lenders can lend above these limits for a small share of loans each year, so some buyers get an exception. Your lender decides.',
      rows:[['Most you could borrow', eur(loan)],['Borrowing allowed by income (' + mult + '×)', eur(byInc)],['Stamp duty on that price (paid from your deposit)', eur(sd)],['Your deposit', eur(dep)],['Monthly repayment (illustrative)', eur(m)]],
      goal:{kind:'spend', k:'home', name:'Buy a home (deposit goal)', em:'🏡', amount:goalAmt, saved:dep, years:HOME_GOAL_YEARS},
      num:{Home_Price:price, Max_Loan:loan, Monthly_Repayment:m, Borrow_By_Income:byInc, Stamp_Duty:sd, Price_By_Deposit:byDepP, Price_By_Income:byIncP, Income_Multiple:mult, Total_Deposit:dep, Limit_Set_By:by, Plan_Goal_Amount:goalAmt, Plan_Goal_Saved:dep}}; }},
 {id:'repayment', cat:'home', name:'Monthly mortgage repayment', q:'What would my monthly repayment be?', em:'🧾',
  inputs:[I('loan','Mortgage amount',300000,50000,1000000,1000,'€'),I('rate','Interest rate',4,1,8,0.05,'%'),I('term','Term (years left to repay)',30,5,35,1,'y')],
  wi:[I('dr','If rates changed by',0,-2,3,0.25,'%')],
  run(v){ const i = v.rate / 100 / 12, calc = pmtI(v.loan, i, v.term * 12), own = mine('repayment', ['loan','rate','term']) ? statedM('mortPayM') : null, base = own || calc;
    const nr = Math.max(0, v.rate + (v.dr || 0)), m = base + pmtI(v.loan, nr / 1200, v.term * 12) - calc, n = nperUp(v.loan, i, base), ti = n === Infinity ? null : totIntI(v.loan, i, base, n), diff = own && Math.abs(own - calc) >= 5;
    const num = {Monthly_Repayment:base, Formula_Repayment:calc, Months_To_Pay:n === Infinity ? 'Never' : n, Total_Interest:ti == null ? '—' : ti, Total_Repaid:ti == null ? '—' : v.loan + ti, New_Rate:nr / 100, Repayment_If_Changed:m, Change_Per_Year:(m - base) * 12, Plan_Goal_Amount:Math.round(v.loan * (1 - RI.home.ltv) / RI.home.ltv)};
    const goal = {kind:'spend', k:'home', name:'Buy a home (deposit goal)', em:'🏡', amount:num.Plan_Goal_Amount, years:HOME_GOAL_YEARS};
    if (v.dr) return {lbl:'If your rate changed to ' + nr.toFixed(2) + '%', val:eur(m), line:'What-if: your repayment would be about ' + eur(m) + ' a month, ' + eur(Math.abs(m - base)) + (m >= base ? ' more' : ' less') + ' than ' + (own ? 'the ' + eur(own) + ' on ' + srcWord('mortPayM') : 'now') + '. ' + (own ? 'With a stated repayment this is an approximation: it moves by the same amount as the standard formula would.' : ''), rows:[['Repayment now', eur(base)],['Change over a year', minus((m - base) * 12)]], goal, num};
    return {lbl:own ? 'Your monthly repayment' : 'Monthly repayment', val:eur(base), line:own ? 'From ' + srcWord('mortPayM') + '.' + (diff ? ' The standard formula on these figures gives about ' + eur(calc) + '; we use your lender\'s figure.' : '') : 'Over ' + yrN(v.term) + ' at ' + v.rate.toFixed(2) + '%, using the standard repayment formula. The rate is a yearly rate, compounded monthly (the way lenders quote mortgage rates).',
      rows:[['Mortgage free in', mTxt(n)],['Total interest', ti == null ? '—' : eur(ti)],['Total repaid', ti == null ? '—' : eur(v.loan + ti)]], goal, num}; }},
 {id:'deposit', cat:'home', name:'Deposit calculator', q:'How long until I have my deposit?', em:'🐷',
  inputs:[I('price','Home price',350000,100000,1000000,5000,'€'),I('pc','Deposit needed',10,10,30,1,'%'),I('saved','Saved so far',12000,0,200000,500,'€'),I('mo','Monthly saving',800,50,5000,50,'€')],
  wi:[I('xmo','Save extra each month',0,0,1500,50,'€')],
  run(v){ const dep = v.price * v.pc / 100, sd = stampDuty(v.price), fees = +asmV('buyFees'), need = dep + sd + fees, left = Math.max(0, need - v.saved), m = left === 0 ? 0 : Math.ceil(left / (v.mo + (v.xmo || 0)));
    return {lbl:'Time to your deposit', val:left ? yrs(m) : 'You have your deposit', line:'You need ' + eur(need) + ' (deposit ' + eur(dep) + ', stamp duty ' + eur(sd) + ' and fees ' + eur(fees) + ') and have ' + eur(v.saved) + '. ' + (left ? 'Saving ' + eur(v.mo + (v.xmo || 0)) + ' a month closes the gap (no interest and no house-price rises assumed). ' : '') + 'The Central Bank minimum deposit is 10%. Stamp duty is worked out on the price shown; for a new home it is charged on the price excluding VAT, and Help to Buy is not included.', rows:[['Total you need', eur(need)],['Deposit', eur(dep)],['Stamp duty', eur(sd)],['Still to save', eur(left)]],
      goal:{kind:'spend', k:'home', name:'Home deposit', em:'🔑', amount:Math.round(need), saved:v.saved, years:Math.max(1, Math.ceil(m / 12))}, num:{Months_To_Deposit:m, Total_Needed:need, Deposit_Needed:dep, Stamp_Duty:sd, Still_To_Save:left, Plan_Goal_Amount:Math.round(need), Plan_Goal_Saved:v.saved, Plan_Goal_Years:Math.max(1, Math.ceil(m / 12))}}; }},
 {id:'overpay', cat:'home', name:'Mortgage overpayment', q:'What if I paid a little extra each month?', em:'⏩',
  inputs:[I('bal','Mortgage balance',250000,20000,1000000,1000,'€'),I('rate','Interest rate',4,1,8,0.05,'%'),I('yrs','Years left',25,3,35,1,'y'),I('x','Extra each month',200,0,2000,25,'€')],
  run(v){ const i = v.rate / 1200, own = mine('overpay', ['bal','rate','yrs']) ? statedM('mortPayM') : null, p = own || pmtI(v.bal, i, v.yrs * 12), px = p + v.x;
    const a = nperUp(v.bal, i, p), b = nperUp(v.bal, i, px), ok = a !== Infinity && b !== Infinity, ia = a === Infinity ? null : totIntI(v.bal, i, p, a), ib = b === Infinity ? null : totIntI(v.bal, i, px, b), sooner = ok ? a - b : null;
    return {lbl:'Mortgage free sooner by', val:!ok ? '—' : sooner === 0 ? 'No change' : mTxt(sooner), line:a === Infinity ? 'Your repayment of ' + eur(p) + ' doesn\'t clear the mortgage: not at this repayment.' : 'Paying ' + eur(v.x) + ' extra a month on top of ' + eur(p) + (own ? ' (from ' + srcWord('mortPayM') + ')' : '') + ' could save about ' + (ok ? eur(ia - ib) : '—') + ' in interest (illustrative; check your lender\'s overpayment terms).',
      rows:[['Mortgage free now in', mTxt(a, 'Not at this repayment')],['With the extra', mTxt(b, '—')],['Interest saved', ok ? eur(ia - ib) : '—']], goal:b === Infinity ? null : {kind:'mfree', name:'Mortgage free', em:'🔑', years:Math.ceil(b / 12)},
      num:{Months_Now:a === Infinity ? 'Never' : a, Months_With_Extra:b === Infinity ? 'Never' : b, Months_Sooner:ok ? sooner : '—', Interest_Saved:ok ? ia - ib : '—', Interest_Now:ia == null ? '—' : ia, Interest_With_Extra:ib == null ? '—' : ib, Repayment_Now:p, Plan_Goal_Years:b === Infinity ? '—' : Math.ceil(b / 12)}}; }},
 {id:'ratechange', cat:'home', name:'Interest-rate impact', q:'What if my mortgage rate changed?', em:'📊',
  inputs:[I('loan','Mortgage balance',300000,50000,1000000,1000,'€'),I('rate','Current rate',4,1,8,0.05,'%'),I('term','Years left',25,5,35,1,'y'),I('d','Rate change',1,-2,3,0.25,'%')],
  run(v){ const calc = pmt(v.loan, v.rate, v.term), own = mine('ratechange', ['loan','rate','term']) ? statedM('mortPayM') : null, a = own || calc, nr = Math.max(0, v.rate + v.d), b = a + pmtI(v.loan, nr / 1200, v.term * 12) - calc;
    return {lbl:'Monthly change', val:minus(b - a), line:'What-if: if your rate changed to ' + nr.toFixed(2) + '%, your repayment would be about ' + eur(b) + ' a month instead of ' + eur(a) + (own ? ' (from ' + srcWord('mortPayM') + ')' : '') + '.', rows:[['Now', eur(a)],['After change', eur(b)],['Change over a year', minus((b - a) * 12)]], goal:null,
      num:{Monthly_Change:b - a, Repayment_Now:a, Repayment_After:b, Yearly_Change:(b - a) * 12, New_Rate:nr / 100, Formula_Now:calc}}; }},
 {id:'term', cat:'home', name:'Mortgage term comparison', q:'Shorter or longer term: what is the trade-off?', em:'⚖️',
  inputs:[I('loan','Mortgage amount',300000,50000,1000000,1000,'€'),I('rate','Interest rate',4,1,8,0.05,'%'),I('a','Term A',25,5,35,1,'y'),I('b','Term B',35,5,35,1,'y')],
  run(v){ const ma = pmt(v.loan, v.rate, v.a), mb = pmt(v.loan, v.rate, v.b), ia = ma * v.a * 12 - v.loan, ib = mb * v.b * 12 - v.loan;
    return {lbl:'Interest difference', val:eur(Math.abs(ib - ia)), line:v.a === v.b ? 'Both terms are the same.' : 'The ' + Math.min(v.a, v.b) + '-year term costs more each month but less interest overall.', rows:[[v.a + '-year monthly', eur(ma)],[v.b + '-year monthly', eur(mb)],[v.a + '-year total interest', eur(ia)],[v.b + '-year total interest', eur(ib)]], goal:null,
      num:{Interest_Difference:Math.abs(ib - ia), Monthly_A:ma, Monthly_B:mb, Interest_A:ia, Interest_B:ib}}; }},
 {id:'rentbuy', cat:'home', name:'Rent vs buy', q:'How do renting and buying compare over time?', em:'🔄',
  inputs:[I('rent','Monthly rent',1800,500,5000,50,'€'),I('price','Home price',350000,100000,1000000,5000,'€'),I('dep','Deposit',35000,0,300000,1000,'€'),I('rate','Mortgage rate',3.75,1,8,0.05,'%'),I('term','Mortgage term',30,5,35,1,'y'),I('y','Years to compare',10,1,30,1,'y'),I('g','House prices rise a year',2,0,6,0.5,'%')],
  run(v){ const dep = clamp(v.dep, v.price * (1 - RI.home.ltv), v.price), loan = Math.max(0, v.price - dep), i = v.rate / 1200, m = pmtI(loan, i, v.term * 12), n = Math.min(v.y, v.term) * 12, bal = Math.max(0, balAfter(loan, i, m, n)), int = m * n - (loan - bal);
    const g = v.g / 100, rr = +asmV('rentRise'), upk = +asmV('upkeep'), fees = +asmV('buyFees'), opp = +asmV('depEarn'), rentCost = rr === 0 ? v.rent * 12 * v.y : v.rent * 12 * (Math.pow(1 + rr, v.y) - 1) / rr, upkeep = g === 0 ? v.price * upk * v.y : v.price * upk * (Math.pow(1 + g, v.y) - 1) / g, sd = stampDuty(v.price), oppC = dep * (Math.pow(1 + opp, v.y) - 1), costs = int + upkeep + sd + fees + oppC, value = v.price * Math.pow(1 + g, v.y), equity = value - bal;
    return {lbl:'Home equity after ' + yrN(v.y), val:eur(equity), line:'Illustration only: renting costs about ' + eur(rentCost) + ' over ' + yrN(v.y) + ' (rent rising ' + pc(rr) + ' a year), while the costs of buying that don\'t build equity are about ' + eur(costs) + ': interest, upkeep, stamp duty, fees and what your deposit could have earned. Local Property Tax and insurance are not included.' + (v.dep < v.price * (1 - RI.home.ltv) ? ' The deposit must be at least 10% of the price, so ' + eur(dep) + ' is used.' : v.dep > v.price ? ' The deposit can\'t be more than the price, so ' + eur(dep) + ' is used.' : '') + ' Home equity is before selling costs. Stamp duty is worked out on the price shown; for a new home it is charged on the price excluding VAT, and Help to Buy is not included.',
      rows:[['Rent paid (rising each year)', eur(rentCost)],['Buying costs that don\'t build equity', eur(costs)],['Home value', eur(value)],['Mortgage left after the years', eur(bal)]], goal:{kind:'spend', k:'home', name:'Buy a home (deposit goal)', em:'🏡', amount:Math.round(dep + sd + fees), years:HOME_GOAL_YEARS},
      num:{Home_Equity:equity, Rent_Paid:rentCost, Buying_Costs:costs, Home_Value:value, Loan:loan, Monthly_Repayment:m, Balance_After:bal, Interest_Paid:int, Upkeep:upkeep, Stamp_Duty:sd, Opportunity_Cost:oppC, Plan_Goal_Amount:Math.round(dep + sd + fees)}}; }},
 {id:'goalplanner', cat:'savings', name:'Goal planner', q:'How much a month to reach my goal?', em:'🎯',
  inputs:[I('t','Goal amount (today\'s prices)',15000,500,500000,500,'€'),I('y','Years until the goal',3,1,30,1,'y'),I('s','Already saved',2000,0,200000,500,'€'),I('r','Growth / interest a year',2,0,7,0.5,'%')],
  run(v){ applyAssume(); const ok = inflSet(), fut = ok ? v.t * Math.pow(1 + AS.infl, v.y) : null, grown = v.s * Math.pow(1 + v.r / 100, v.y), still = ok ? Math.max(0, fut - grown) : null, i = iEq(v.r), n = v.y * 12, m = ok ? (still > 0 ? (i ? still * i / (Math.pow(1 + i, n) - 1) : still / n) : 0) : null;
    return {lbl:'Monthly amount to save', val:ok ? eur(m) : NO_INFL, line:(ok ? 'Your goal will cost about ' + eur(fut) + ' in ' + yrN(v.y) + '. Setting aside about ' + eur(m) + ' a month could reach it.' + inflLine() : 'Choose your inflation rate to see what your goal will cost by then and the monthly amount.') + ' ' + BEFORE_TAX(),
      rows:[['Goal in today\'s prices', eur(v.t)], ['Will cost about (in ' + yrN(v.y) + ')', ok ? eur(fut) : NO_INFL], ['Your savings grow to', eur(grown)], ['Still needed at the goal year', ok ? eur(still) : NO_INFL]], goal:{kind:'spend', name:'My goal', em:'🎯', amount:v.t, saved:v.s, years:v.y},
      num:{Monthly_Saving:ok ? m : NO_INFL, Future_Cost:ok ? fut : NO_INFL, Saved_Grows_To:grown, Still_Needed:ok ? still : NO_INFL, Plan_Goal_Amount:v.t, Plan_Goal_Saved:v.s, Plan_Goal_Years:v.y}}; }},
 {id:'compound', cat:'savings', name:'Compound growth', q:'What could regular saving grow into?', em:'🌱',
  inputs:[I('p','Starting amount',5000,0,200000,500,'€'),I('m','Monthly addition',200,0,3000,25,'€'),I('r','Growth rate a year',4,0,8,0.5,'%'),I('y','Years',20,1,40,1,'y')],
  run(v){ applyAssume(); const i = iEq(v.r), n = v.y * 12, f = v.p * Math.pow(1 + i, n) + (i ? v.m * (Math.pow(1 + i, n) - 1) / i : v.m * n), put = v.p + v.m * 12 * v.y, ok = inflSet(), today = ok ? f / Math.pow(1 + AS.infl, v.y) : null;
    return {lbl:'Could grow to', val:eur(f), line:'You would put in ' + eur(put) + '. Growth could add about ' + eur(f - put) + ' (illustrative, not guaranteed). ' + worthTxt(f, v.y) + inflLine() + ' ' + BEFORE_TAX(), rows:[['Paid in', eur(put)],['Illustrative growth', eur(f - put)], ['Worth in today\'s money', ok ? eur(today) : NO_INFL]],
      goal:ok ? {kind:'pot', name:'Grow my wealth', em:'📈', amount:Math.round(today), years:v.y} : {kind:'blocked', msg:NO_INFL_GOAL}, num:{Grows_To:f, Value_Today:ok ? today : NO_INFL, Paid_In:put, Growth_Earned:f - put, Plan_Goal_Amount:ok ? Math.round(today) : NO_INFL_GOAL}}; }},
 {id:'lumpsum', cat:'invest', name:'Lump-sum growth', q:'What could a one-off amount become?', em:'💎',
  inputs:[I('p','Amount',10000,500,500000,100,'€'),I('r','Growth rate a year (before fees)',4,0,8,0.5,'%'),I('y','Years',15,1,40,1,'y'),I('f','Yearly fees',0,0,3,0.05,'%'),I('wait','Years you might wait before investing',5,1,20,1,'y')],
  run(v){ applyAssume(); const gaf = (1 + v.r / 100) * (1 - (v.f || 0) / 100) - 1, gross = v.p * Math.pow(1 + v.r / 100, v.y), f = v.p * Math.pow(1 + gaf, v.y), wy = v.wait == null ? WAIT_YEARS : v.wait, late = v.p * Math.pow(1 + AS.cash, Math.min(wy, v.y)) * Math.pow(1 + gaf, Math.max(0, v.y - wy)), ok = inflSet(), d = ok ? Math.pow(1 + AS.infl, v.y) : null, today = ok ? f / d : null, adj = !!(S.adjInfl || {}).lumpsum;
    const head = adj ? (ok ? today : NO_INFL) : f, wait = adj ? (ok ? (f - late) / d : NO_INFL) : f - late;
    return {lbl:adj ? "In today's money" + (v.f ? ' (after fees)' : '') : 'Could grow to' + (v.f ? ' (after fees)' : ''), val:typeof head === 'number' ? eur(head) : head, line:(adj && ok ? realLine(gaf * 100, 'growth' + (v.f ? ' after fees' : '')) : adjPick('lumpsum')) + 'While it waits, the money earns the cash savings rate (' + pcs(AS.cash) + ' a year, before DIRT). ' + (typeof wait === 'number' && wait > 0 ? 'Waiting ' + yrN(wy) + ' before starting could mean about ' + eur(wait) + ' less, which is the cost of waiting. ' : typeof wait === 'number' ? 'With growth of ' + (gaf * 100).toFixed(2) + '% a year after fees, no more than the cash rate, waiting ' + yrN(wy) + ' costs nothing here. ' : '') + BEFORE_TAX(),
      rows:[['If you start today (after fees)', eur(f)],['If you start in ' + yrN(wy), eur(late)]].concat(adj ? [['Worth in today\'s money', ok ? eur(today) : NO_INFL]] : []).concat(v.f ? [['Fees cost', eur(gross - f)]] : []), goal:ok ? {kind:'pot', name:'Grow my wealth', em:'📈', amount:Math.round(today), years:v.y} : {kind:'blocked', msg:NO_INFL_GOAL},
      num:{Headline:head, Grows_To:f, Value_Start_Later:late, Value_Today:ok ? today : NO_INFL, Cost_Of_Waiting:wait, Fees_Cost:gross - f, Growth_After_Fees:gaf, Real_Return:ok ? (1 + gaf) / (1 + AS.infl) - 1 : NO_INFL, Plan_Goal_Amount:ok ? Math.round(today) : NO_INFL_GOAL}}; }},
 {id:'emergency', cat:'savings', name:'Emergency fund', q:'How strong is my emergency fund?', get tip(){ return 'Ideal emergency fund: ' + fndT() + ' months of your monthly spending.'; }, em:'🪂',
  inputs:[I('e','Essential monthly spending',2500,500,10000,100,'€'),I('mt','Months you want covered',6,1,12,1,'m'),I('s','Easy-access savings',6250,0,100000,250,'€')],
  run(v){ const t = v.e * v.mt, cov = v.s / v.e, gap = Math.max(0, t - v.s);
    return {lbl:'You currently have', val:(Math.floor(cov * 10) / 10).toFixed(1) + (Math.floor(cov * 10) / 10 === 1 ? ' month' : ' months'), line:gap ? 'Your target is ' + eur(t) + ' (' + v.mt + (v.mt === 1 ? ' month' : ' months') + '). You are ' + eur(gap) + ' away.' : 'Your emergency fund covers ' + v.mt + (v.mt === 1 ? ' month' : ' months') + '. Great foundation.', rows:[['Target emergency fund', eur(t)],['Still to build', eur(gap)]],
      goal:gap > 0 ? {kind:'safety', name:'Emergency fund', em:'🪂', amount:Math.round(t), saved:v.s, years:SAFETY_GOAL_YEARS} : null, num:{Months_Covered:cov, Target:t, Still_To_Build:gap, Plan_Goal_Amount:gap > 0 ? Math.round(t) : '—', Plan_Goal_Saved:v.s}}; }},
 {id:'retirement', cat:'retire', name:'Retirement projection', q:'Could your current path fund the retirement you want?', em:'🌅',
  inputs:[I('age','Your age',40,20,70,1,'age'),I('ra','Target retirement age',65,21,104,1,'age'),I('pot','Pension value today',60000,0,1500000,1000,'€'),I('m','Monthly contributions (you + employer)',500,0,5000,10,'€'),I('d','Desired yearly income in retirement (today\'s money, before tax)',40000,10000,150000,1000,'€'),I('o','Other yearly income, e.g. State Pension (today\'s money)',15000,0,50000,500,'€'),I('g','Growth after charges',4.5,1,7,0.25,'%')],
  wi:[I('later','Retire later by',0,0,5,1,'y'),I('more','Save more each month',0,0,1500,50,'€'),I('less','Spend less in retirement (a year)',0,0,20000,500,'€')],
  run(v){ applyAssume(); const ra = v.ra + (v.later || 0), g = v.g / 100, w = AS.wage, c = v.m + (v.more || 0);
    if (ra <= v.age){ const G = 'Choose a retirement age after your age to see this'; return {lbl:'Illustrative gap (today\'s money)', val:G, line:'Your retirement age has to be after your age today (' + v.age + '), so the tool can count the years you still have to save.', rows:[], goal:{kind:'blocked', msg:'Choose a retirement age after your age first'}, num:{Gap_Today:G, Projected_Fund:G, Fund_Today:G, Calculated_Fund:G, Target_Today:G, Years_To_Retirement:G, Bridge_Years:G, Lump_Sum:G, Lump_Sum_Tax:G, Lump_Sum_Net:G, Early_Warning:'', SFT_Warning:'', Use_Statement_Projection:G, Plan_Goal_Income:G, Plan_Goal_Age:G}}; }
    const y = ra - v.age, ours = v.pot * Math.pow(1 + g, y) + (Math.abs(g - w) < 1e-12 ? 12 * c * y * Math.pow(1 + g, y - 1) : 12 * c * (Math.pow(1 + g, y) - Math.pow(1 + w, y)) / (g - w));
    const d = S.pdocs && S.pdocs.retire ? S.pdocs.retire.v : null, useSt = !!(d && d.proj != null && ra === d.nra && !v.more && mine('retirement', ['pot','m','g','age'])), f = useSt ? d.proj : ours, stToday = useSt && (d.projToday || 'Yes') !== 'No';
    const ok = inflSet(), fToday = stToday ? f : ok ? f / Math.pow(1 + AS.infl, y) : null, bridge = Math.max(0, RI.sp.age - ra), target = Math.max(0, (v.d - (v.less || 0) - v.o)) * +asmV('retireMult') + bridge * Math.min(v.o, Math.max(0, v.d - (v.less || 0))), /* audit F1: the bridge never needs more than the income you need */ gap = fToday == null ? null : target - fToday;
    const L = lumpSum(f, +asmV('lumpSum')), early = ra < +asmV('accessAge') ? 'Most pensions can\'t be taken before ' + RI.pen.earliestAge + ' (PRSA and personal pensions; some occupational schemes allow it from 50). Until then you would live on savings and other income. ' : '', sft = fToday != null && fToday > sftFor(2026) ? 'Your fund in today\'s money is above the Standard Fund Threshold (€2.2m in 2026, rising to €2.8m by 2029; later years are not set yet): the excess is taxed at 40%. ' : '' /* audit F4: today's money against the 2026 threshold, like with like */;
    return {lbl:'Illustrative gap (today\'s money)', val:gap == null ? NO_INFL : gap > 0 ? eur(gap) : 'On track: no gap', line:(gap == null ? 'Choose your inflation rate to compare your fund with the target in today\'s money. ' : gap > 0 ? 'Your projected fund is worth about ' + eur(fToday) + ' in today\'s money, against a target of ' + eur(target) + '. ' : 'On these assumptions your projected fund meets the illustrative target. ') + early + sft + 'Contributions are assumed to rise with pay (' + pc(w) + ' a year), as in your plan. The target includes the State Pension you fund yourself for each year you retire before 66. Desired income and the State Pension are before tax: the State Pension is taxable (USC-exempt) and drawdown pays income tax and USC. ' + (+asmV('lumpSum') > 0 ? 'Here ' + Math.round(+asmV('lumpSum') * 100) + '% of the fund is taken as a lump sum (the most allowed is ' + Math.round(RI.pen.lsMaxPct * 100) + '%): ' : 'No lump sum is assumed (the most allowed is ' + Math.round(RI.pen.lsMaxPct * 100) + '%): ') + LAW.ls + '. Contributions are counted as paid at the end of each year.',
      rows:[[useSt ? 'Projected fund at retirement (from your statement)' : 'Projected fund at retirement', eur(f)], ['Projected fund in today\'s money', fToday == null ? NO_INFL : eur(fToday)], ['Illustrative target (' + asmV('retireMult') + ' × the income you need' + (bridge ? ' + ' + yrN(bridge) + ' before the State Pension' : '') + ', today\'s money)', eur(target)], ['Lump sum you could take (after tax)', eur(L.net)], ['Retiring at', String(ra)]].concat(d && d.proj != null ? [['Your statement projects (age ' + d.nra + ')', eur(d.proj)], ['On our assumptions (age ' + ra + ')', eur(ours)]] : []),
      goal:{kind:'retire', name:'Retire comfortably', em:'🌅', amount:v.d - (v.less || 0), age:ra}, num:{Gap_Today:gap == null ? NO_INFL : gap, Projected_Fund:f, Fund_Today:fToday == null ? NO_INFL : fToday, Calculated_Fund:ours, Target_Today:target, Years_To_Retirement:y, Bridge_Years:bridge, Lump_Sum:L.gross, Lump_Sum_Tax:L.tax, Lump_Sum_Net:L.net, Early_Warning:early.trim(), SFT_Warning:sft.trim(), Use_Statement_Projection:useSt ? 'Yes' : 'No', Plan_Goal_Income:v.d - (v.less || 0), Plan_Goal_Age:ra}}; }},
 {id:'contrib', cat:'retire', name:'Contribution impact', q:'What difference would a small increase make?', em:'➕',
  inputs:[I('sal','Salary',60000,15000,250000,1000,'€'),I('inc','Increase contributions by (% of salary)',2,0.5,10,0.5,'%'),I('y','Years to retirement',25,1,45,1,'y'),I('g','Growth assumption',4.5,1,7,0.25,'%'),I('tr','Your tax rate',40,20,40,20,'tax'),I('age','Your age (for the relief limit)',40,18,75,1,'age'),I('ex','What you pay in yourself now, a year',0,0,100000,100,'€')],
  run(v){ applyAssume(); const m = v.sal * v.inc / 100 / 12, gq = v.g / 100, wq = AS.wage, f = Math.abs(gq - wq) < 1e-12 ? 12 * m * v.y * Math.pow(1 + gq, v.y - 1) : 12 * m * (Math.pow(1 + gq, v.y) - Math.pow(1 + wq, v.y)) / (gq - wq), lim = relLim(v.age) * Math.min(v.sal, RI.pen.earnCap), relY = Math.min(m * 12, Math.max(0, lim - v.ex)), rel = relY * v.tr / 100 / 12, net = m - rel, ok = inflSet(), today = ok ? f / Math.pow(1 + AS.infl, v.y) : null;
    return {lbl:'Could add to your pension', val:eur(f), line:'An extra ' + eur(m) + ' a month could cost about ' + eur(net) + ' after tax relief at ' + v.tr + '% (USC and PRSI still apply). Tax relief has an age limit: at ' + v.age + ' it applies to up to ' + Math.round(relLim(v.age) * 100) + '% of your earnings (earnings counted up to ' + eur(RI.pen.earnCap) + '), which is ' + eur(lim) + ' a year. You already pay in ' + eur(v.ex) + ' a year, so up to ' + eur(Math.max(0, lim - v.ex)) + ' a year more gets relief. The extra rises with pay each year (' + pcs(AS.wage) + '), as in your plan.' + inflLine(), rows:[['Extra per month (first year)', eur(m)],['Cost to you after tax relief, a month', eur(net)],['Tax relief a month', eur(rel)], ['Worth in today\'s money', ok ? eur(today) : NO_INFL]],
      goal:{kind:'pension', name:'Raise my pension contribution', em:'🌅', amount:m}, num:{Grows_To:f, Value_Today:ok ? today : NO_INFL, Extra_Per_Month:m, Net_Cost_Per_Month:net, Relief_Limit_Year:lim, Relieved_Year:relY, Relief_Per_Month:rel, Plan_Goal_Contribution:m}}; }},
 {id:'avc', cat:'retire', name:'AVC impact', q:'What could extra voluntary contributions add?', em:'🧩',
  inputs:[I('m','AVC per month',200,25,2000,25,'€'),I('sal','Salary (for the relief limit)',60000,15000,250000,1000,'€'),I('y','Years to retirement',15,1,40,1,'y'),I('g','Growth assumption',4.5,1,7,0.25,'%'),I('tr','Your tax rate',40,20,40,20,'tax'),I('age','Your age (for the relief limit)',40,18,75,1,'age'),I('ex','What you pay in yourself now, a year',0,0,100000,100,'€')],
  run(v){ applyAssume(); const f = fvA(v.m, v.g, v.y), lim = relLim(v.age) * Math.min(v.sal, RI.pen.earnCap), relY = Math.min(v.m * 12, Math.max(0, lim - v.ex)), rel = relY * v.tr / 100 / 12, netM = v.m - rel, ok = inflSet(), today = ok ? f / Math.pow(1 + AS.infl, v.y) : null;
    return {lbl:'Could add', val:eur(f), line:'Each ' + eur(v.m) + ' AVC could cost about ' + eur(netM) + ' after tax relief. Tax relief has an age limit: at ' + v.age + ' it applies to up to ' + Math.round(relLim(v.age) * 100) + '% of your earnings (earnings counted up to ' + eur(RI.pen.earnCap) + '), which is ' + eur(lim) + ' a year for your main scheme and AVCs together. You already pay in ' + eur(v.ex) + ' a year, so up to ' + eur(Math.max(0, lim - v.ex)) + ' a year more gets relief.' + inflLine(),
      rows:[['Paid in', eur(v.m * 12 * v.y)],['Net cost to you', eur(netM * 12 * v.y)],['Tax relief a month', eur(rel)], ['Worth in today\'s money', ok ? eur(today) : NO_INFL]], goal:{kind:'pension', name:'Raise my pension contribution (AVC)', em:'🌅', amount:v.m},
      num:{Grows_To:f, Value_Today:ok ? today : NO_INFL, Paid_In:v.m * 12 * v.y, Net_Cost:netM * 12 * v.y, Net_Cost_Per_Month:netM, Relief_Limit_Year:lim, Relieved_Year:relY, Relief_Per_Month:rel, Plan_Goal_Contribution:v.m}}; }},
 {id:'lastmoney', cat:'retire', name:'Will my money last?', q:'How long could my retirement savings last?', em:'⏳',
  inputs:[I('pot','Retirement savings',400000,10000,3000000,10000,'€'),I('w','Yearly withdrawal (first year)',24000,1000,200000,1000,'€'),I('g','Growth assumption a year (once retired)',3.15,0,7,0.05,'%'),I('age','Your age when withdrawals start',66,50,90,1,'age')],
  run(v){ applyAssume(); const ok = inflSet(), end = asmV('ddTiming') === 'end', y = ok ? lasts(v.pot, v.w, v.g, AS.infl * 100, end) : null, toAge = ok ? v.age + y : null;
    return {lbl:'Could last about', val:!ok ? NO_INFL : y >= CAP_YEARS ? '60+ years' : y < 1 ? 'Less than a year' : yrN(y), line:'Withdrawing ' + eur(v.w) + ' at the ' + (end ? 'end' : 'start') + ' of each year' + (ok ? ', rising with prices (' + inflTxt() + '): ' + (y >= CAP_YEARS ? 'money lasts beyond age ' + AS.end + ', your plan-until age.' : (y < 1 ? 'your savings would run out in the first year' : 'money lasts to about age ' + toAge) + (y < 1 ? '.' : toAge < AS.end ? ', before the end of your plan (' + AS.end + ').' : toAge > AS.end ? ', beyond the end of your plan (' + AS.end + ').' : '.')) : '. Choose your inflation rate to see how long it lasts.') + (v.age < RI.pen.earliestAge ? ' Most pensions can\'t be taken before ' + RI.pen.earliestAge + ' (PRSA and personal pensions; occupational schemes from 50 only if you have left that job).' : '') + ' Before tax: ARF and vested PRSA withdrawals pay income tax and USC (and PRSI before 66). ' + LAW.arf.charAt(0).toUpperCase() + LAW.arf.slice(1) + '. An illustration, not a guarantee.', rows:[['Money lasts to about age', !ok ? NO_INFL : y >= CAP_YEARS ? 'Beyond ' + AS.end + ' (your plan-until age)' : y < 1 ? 'Less than a year after you start' : String(toAge)],['Withdrawal rate (first year)', (v.w / v.pot * 100).toFixed(1) + '%']], goal:null,
    num:{Years_Lasting:ok ? y : NO_INFL, Lasts_To_Age:!ok ? NO_INFL : y >= CAP_YEARS ? 'Beyond ' + AS.end : y < 1 ? 'Less than a year' : toAge, Withdrawal_Rate:v.w / v.pot}}; }},
 {id:'drawdown', cat:'retire', name:'Retirement drawdown scenarios', q:'How do different growth rates change things?', em:'🧭',
  inputs:[I('pot','Retirement savings',400000,10000,3000000,10000,'€'),I('w','Yearly withdrawal (first year)',20000,1000,200000,1000,'€')],
  run(v){ applyAssume(); const ok = inflSet(), end = asmV('ddTiming') === 'end', yrN0 = x => x < 1 ? 'Less than a year' : yrN(x), G = [+asmV('riskMu1'), +asmV('riskMu2'), +asmV('riskMu3')].map(x => x * 100), s = ok ? G.map(g => lasts(v.pot, v.w, g, AS.infl * 100, end)) : [null, null, null], t = x => x == null ? NO_INFL : x >= CAP_YEARS ? '60+ years' : yrN0(x);
    return {lbl:'Balanced scenario lasts', val:t(s[1]), line:'Three illustrative growth scenarios (your assumptions); withdrawals at the ' + (end ? 'end' : 'start') + ' of each year' + (ok ? ', rising with prices (' + inflTxt() + ').' : '. Choose your inflation rate to see them.') + ' Real returns vary year to year. Before tax.', rows:[['Cautious (' + pcs(G[0] / 100) + ')', t(s[0])],['Balanced (' + pcs(G[1] / 100) + ')', t(s[1])],['Growth (' + pcs(G[2] / 100) + ')', t(s[2])]], goal:null,
      num:{Years_Cautious:ok ? s[0] : NO_INFL, Years_Balanced:ok ? s[1] : NO_INFL, Years_Growth:ok ? s[2] : NO_INFL}}; }},
 {id:'realreturn', cat:'invest', name:'Inflation-adjusted return', q:"What is my money really worth in future?", em:'🔍',
  inputs:[I('p','Amount',20000,500,500000,100,'€'),I('r','Return a year (before inflation)',5,0,10,0.25,'%'),I('y','Years',15,1,40,1,'y')],
  run(v){ applyAssume(); const n = fvL(v.p, v.r, v.y);
    if (!inflSet()) return {lbl:'Future value', val:eur(n), line:'Choose your inflation rate to see the real return and what it\'s worth in today\'s money. ' + BEFORE_TAX(), rows:[['Future value', eur(n)], ['In today\'s money', NO_INFL], ['Real return a year', NO_INFL]], goal:null, num:{Future_Value:n, Value_Today:NO_INFL, Real_Return:NO_INFL}};
    const i = AS.infl, rr = (1 + v.r / 100) / (1 + i) - 1, real = n / Math.pow(1 + i, v.y);   // exact real return, not g − i
    return {lbl:"In today's money", val:eur(real), line:'A ' + +v.r.toFixed(2) + '% return with prices rising ' + pc(i) + ' is really about ' + (rr * 100).toFixed(1) + '% a year. ' + BEFORE_TAX(), rows:[['Future value', eur(n)],['Real return a year', +(rr * 100).toFixed(2) + '%'],["Value in today's money", eur(real)]], goal:null, num:{Future_Value:n, Value_Today:real, Real_Return:rr}}; }},
 {id:'regularinvest', cat:'invest', name:'Regular investing', q:'What could investing monthly build?', em:'🔁',
  inputs:[I('m','Monthly amount',300,25,5000,25,'€'),I('y','Years',15,1,40,1,'y'),I('g','Growth a year (before fees)',5,0,8,0.5,'%'),I('f','Yearly fees',1,0,3,0.05,'%')],
  run(v){ applyAssume(); const gaf = (1 + v.g / 100) * (1 - v.f / 100) - 1, gross = fvA(v.m, v.g, v.y), net = fvA(v.m, gaf * 100, v.y), ok = inflSet(), today = ok ? net / Math.pow(1 + AS.infl, v.y) : null, adj = !!(S.adjInfl || {}).regularinvest, head = adj ? (ok ? today : NO_INFL) : net;
    return {lbl:adj ? "In today's money (after fees)" : 'Could grow to (after fees)', val:typeof head === 'number' ? eur(head) : head, line:(adj && ok ? realLine(gaf * 100, 'growth after fees') : adjPick('regularinvest')) + 'Fees of ' + v.f + '% a year could cost about ' + eur(gross - net) + ' over ' + yrN(v.y) + '. ' + BEFORE_TAX(),
      rows:[['Paid in', eur(v.m * 12 * v.y)],['Before fees', eur(gross)],['Fees cost', eur(gross - net)]].concat(adj ? [['Worth in today\'s money', ok ? eur(today) : NO_INFL]] : []), goal:ok ? {kind:'pot', name:'Grow my wealth', em:'📈', amount:Math.round(today), years:v.y} : {kind:'blocked', msg:NO_INFL_GOAL},
      num:{Headline:head, Value_After_Fees:net, Value_Before_Fees:gross, Fees_Cost:gross - net, Paid_In:v.m * 12 * v.y, Value_Today:ok ? today : NO_INFL, Growth_After_Fees:gaf, Real_Return:ok ? (1 + gaf) / (1 + AS.infl) - 1 : NO_INFL, Plan_Goal_Amount:ok ? Math.round(today) : NO_INFL_GOAL}}; }},
 {id:'fees', cat:'invest', name:'Fees impact', q:'How much do fees really cost over time?', em:'🧮',
  inputs:[I('p','Amount invested',50000,1000,1000000,100,'€'),I('y','Years',20,1,40,1,'y'),I('g','Growth a year (before fees)',5,0,8,0.5,'%'),I('a','Fee A a year',0.5,0,3,0.05,'%'),I('b','Fee B a year',1.5,0,3,0.05,'%')],
  run(v){ const nf = x => v.p * Math.pow((1 + v.g / 100) * (1 - x / 100), v.y), A1 = nf(v.a), B1 = nf(v.b); return {lbl:'Difference', val:eur(Math.abs(A1 - B1)), line:'A ' + Math.abs(v.b - v.a).toFixed(2) + '% difference in yearly fees could change the outcome by about ' + eur(Math.abs(A1 - B1)) + '. Before tax.', rows:[['With ' + v.a + '% fees', eur(A1)],['With ' + v.b + '% fees', eur(B1)]], goal:null,
    num:{Difference:Math.abs(A1 - B1), Value_With_Fee_A:A1, Value_With_Fee_B:B1, Fee_Gap:Math.abs(v.b - v.a) / 100}}; }},
 {id:'riskreturn', cat:'invest', name:'Risk & return simulator', q:'What range of outcomes might each style have?', em:'🎢',
  inputs:[I('p','Amount',20000,1000,1000000,100,'€'),I('y','Years',10,1,30,1,'y'),I('s','Style',2,1,3,1,'style')],
  run(v){ const s = clamp(Math.round(v.s), 1, 3), mu = +asmV('riskMu' + s), vol = +asmV('riskVol' + s), spread = vol / Math.sqrt(v.y), mid = v.p * Math.pow(1 + mu, v.y), lo = v.p * Math.pow(1 + mu - spread, v.y), hi = v.p * Math.pow(1 + mu + spread, v.y), fall = Math.round((vol * ONE_IN_20_Z - mu) * 100) / 100, name = ['Cautious', 'Balanced', 'Growth'][s - 1];
    return {lbl:name + ' · middle outcome', val:eur(mid), line:'Illustrative only. ' + (Math.round(fall * 100) >= 1 ? 'About a 1-in-20 bad year could see a fall of around ' + Math.round(fall * 100) + '%.' : 'On these assumptions a 1-in-20 bad year is not expected to bring a fall.') + ' Over longer timeframes the yearly return range narrows, but the gap in euros between the weaker and stronger outcomes widens; "weaker" is roughly a 1-in-6 chance of doing worse, not the worst case.', rows:[['Weaker outcome', eur(lo)],['Middle outcome', eur(mid)],['Stronger outcome', eur(hi)]], goal:null,
      num:{Middle:mid, Weaker:lo, Stronger:hi, Difficult_Year_Fall:fall, Style_Name:name, Spread:spread}}; }},
 {id:'lifecover', cat:'protect', name:'Life cover estimator', q:'How much cover might my family need?', em:'🛡️',
  inputs:[I('inc','Your gross yearly income',60000,0,300000,1000,'€'),I('y','Years your family would need support',15,1,30,1,'y'),I('mort','Mortgage balance',250000,0,1000000,5000,'€'),I('mp','Is the mortgage cleared by mortgage protection? (most are)',1,0,1,1,'yn'),I('debt','Other debts',10000,0,200000,1000,'€'),I('sav','Savings & investments',20000,0,1000000,1000,'€'),I('ex','Existing life cover (incl. through work)',100000,0,2000000,10000,'€'),I('surv','State survivor\'s pension a week (0 if none)',259.5,0,400,0.5,'€')],
  run(v){ const share = +asmV('lifeShare'), need = Math.max(0, v.inc * share - v.surv * RI.sp.weeks) * v.y, debts = (v.mp ? 0 : v.mort) + v.debt, have = v.ex + v.sav, gap = Math.max(0, need + debts - have);
    return {lbl:'Illustrative cover gap', val:eur(gap), line:gap > 0 ? 'A rough estimate of the gap between what your family might need and what you have. A protection expert can refine this. Cohabiting partners can now qualify for the State Bereaved Partner\'s Pension.' : 'Your existing cover and savings look like they meet this rough estimate.',
      rows:[['Income your family would need (after the State pension)', eur(need)],['Debts to clear', eur(debts)],['Existing cover + savings', eur(have)],['Income replacement before State pension (' + Math.round(share * 100) + '%)', eur(v.inc * share * v.y)]], goal:gap > 0 ? {kind:'need', need:'life', name:'Life cover need (for your adviser)', em:'🛡️', amount:gap} : null,
      num:{Cover_Gap:gap, Income_Need:need, Debts_To_Clear:debts, Already_Have:have, Income_Replacement:v.inc * share * v.y, Plan_Goal_Need:gap}}; }},
 {id:'incomegap', cat:'protect', name:'Income protection gap', q:"How long could I cope if I couldn't work?", em:'🩺',
  inputs:[I('e','Essential monthly spending',2500,500,10000,100,'€'),I('sp','Months of sick pay from your employer\'s scheme',3,0,12,1,'m'),I('s','Easy-access savings',8000,0,200000,500,'€'),I('inc','Your gross yearly income',60000,0,300000,1000,'€'),I('ib','Illness Benefit a week',254,0,500,0.5,'€')],
  run(v){ const ibW = v.ib == null ? RI.sp.illness : v.ib, ib = ibW * RI.sp.weeks / 12, gap = Math.max(0, v.e - ib), ipMax = Math.max(0, v.inc * IP_MAX_PCT / 12 - ib), ipNeed = Math.min(gap, ipMax), cope0 = gap === 0 ? IB_MAX_MONTHS : v.sp + v.s / gap, cope = Math.min(IB_MAX_MONTHS, cope0), capped = cope0 >= IB_MAX_MONTHS, sm = gap === 0 ? 'Not needed' : v.s / gap;   // audit: Illness Benefit is paid for at most 2 years (624 days)
    return {lbl:capped ? 'You could cope for' : 'You could cope for about', val:capped ? 'up to 2 years' : moTxt(cope), line:(gap === 0 ? 'Illness Benefit (' + eur(ibW) + ' a week, if you have enough PRSI) would cover your essential spending.' : 'After Illness Benefit (' + eur(ibW) + ' a week, if you have enough PRSI; lower if you earned under €300 a week) you would have a gap of about ' + eur(gap) + ' a month. Some people cover a gap like this with income protection; your adviser can explain the options. Statutory sick pay is only 5 days a year.') + ' Illness Benefit is paid for up to 2 years (624 days), so we do not count time after that.',
      rows:[['Monthly gap after Illness Benefit', eur(gap)],['Income protection to aim for, a month', eur(ipNeed)],['Savings would cover', typeof sm === 'string' ? (sm + ' while Illness Benefit covers your spending') : (sm >= IB_MAX_MONTHS ? 'more than 2 years' : moTxt(sm))],['Sick pay', moTxt(v.sp)],['Illness Benefit a week (your figure; the most is ' + eurW(RI.sp.illness) + ')', eurW(ibW)]], goal:ipNeed > 0 ? {kind:'need', need:'ip', name:'Income protection need (for your adviser)', em:'🩺', amount:ipNeed} : null,
      num:{Months_Coping:cope, Monthly_Gap:gap, IP_Needed:ipNeed, Illness_Benefit_Month:ib, Savings_Months:sm, IP_Max:ipMax, Plan_Goal_Need:ipNeed}}; }},
 {id:'mortgageprotect', cat:'protect', name:'Mortgage protection', q:'What cover would clear my mortgage?', em:'🏠',
  inputs:[I('bal','Mortgage balance',250000,20000,1000000,5000,'€'),I('rate','Interest rate',4,1,8,0.05,'%'),I('y','Years left',25,5,35,1,'y')],
  run(v){ const i = v.rate / 1200, p = (mine('mortgageprotect', ['bal','rate','y']) ? statedM('mortPayM') : null) || pmtI(v.bal, i, v.y * 12), warn = p <= v.bal * i, after = n => warn ? '—' : Math.max(0, balAfter(v.bal, i, p, n * 12));
    const b = [MP_YEARS[0], MP_YEARS[1], MP_YEARS[2]].map(after);
    return {lbl:'Cover needed today', val:eur(v.bal), line:warn ? 'Your repayment doesn\'t cover the interest: please check the figures.' : 'Mortgage protection usually reduces as your mortgage does. Illustrative balance over time, repaying ' + eur(p) + ' a month:', rows:b.map((x, k) => ['In ' + MP_YEARS[k] + ' years', typeof x === 'number' ? eur(x) : x]), goal:null,
      num:{Cover_Today:v.bal, Warning:warn ? 'Your repayment doesn\'t cover the interest: please check the figures.' : '', Balance_Year_1:b[0], Balance_Year_2:b[1], Balance_Year_3:b[2], Repayment:p}}; }},
 {id:'networth', cat:'everyday', name:'Net worth', q:'What am I worth, all in?', em:'🧾',
  inputs:[I('sav','Savings',15000,0,1000000,500,'€'),I('inv','Investments',10000,0,2000000,1000,'€'),I('pen','Pensions',60000,0,3000000,1000,'€'),I('prop','Property value',350000,0,5000000,5000,'€'),I('mort','Mortgage',250000,0,3000000,5000,'€'),I('loans','Other loans',8000,0,500000,500,'€')],
  run(v){ const a = v.sav + v.inv + v.pen + v.prop, l = v.mort + v.loans; return {lbl:'Your net worth', val:eur(a - l), line:'Everything you own minus everything you owe. Pensions are before tax; property is before selling costs. Track it once or twice a year.', rows:[['You own', eur(a)],['You owe', eur(l)]], goal:null, num:{Net_Worth:a - l, You_Own:a, You_Owe:l}}; }},
 {id:'surplus', cat:'everyday', name:'Monthly surplus', q:'What is left at the end of the month?', em:'➗',
  inputs:[I('inc','Take-home pay per month',3500,500,20000,50,'€'),I('ess','Essentials (rent/mortgage, bills, food)',2000,0,15000,50,'€'),I('life','Lifestyle spending',800,0,10000,50,'€'),I('debt','Debt repayments',200,0,5000,25,'€')],
  run(v){ const s = v.inc - v.ess - v.life - v.debt; return {lbl:'Monthly surplus', val:eur(s), line:s > 0 ? 'About ' + Math.round(s / v.inc * 100) + '% of your take-home pay is free for goals.' : s === 0 ? 'Nothing left over this month.' : 'Spending is above income right now. Small changes to lifestyle spending can help.', rows:[['Take-home', eur(v.inc)],['Going out', eur(v.ess + v.life + v.debt)]], goal:s > 0 ? {kind:'pot', name:'Save my surplus', em:'🐷', amount:Math.round(s * 12), years:1} : null,
    num:{Surplus:s, Going_Out:v.ess + v.life + v.debt, Plan_Goal_Amount:s > 0 ? Math.round(s * 12) : '—'}}; }},
 {id:'budget', cat:'everyday', name:'Budget (50/30/20)', q:'A simple way to split your pay', em:'🥧',
  inputs:[I('inc','Take-home pay per month',3500,500,20000,50,'€')],
  run(v){ const n = +asmV('budgetNeeds'), w = +asmV('budgetWants'), sv = +asmV('budgetSave'), t = x => Math.round(x * 100) + '%'; const chk = Math.abs(n + w + sv - 1) > 1e-6 ? 'Your shares add up to ' + Math.round((n + w + sv) * 100) + '%, not 100%. ' : ''; return {lbl:'Save each month', val:eur(v.inc * sv), line:chk + 'A common starting point: ' + t(n) + ' needs, ' + t(w) + ' wants, ' + t(sv) + ' savings and debt. Adjust it to fit your life in Your assumptions.', rows:[['Needs (' + t(n) + ')', eur(v.inc * n)],['Wants (' + t(w) + ')', eur(v.inc * w)],['Savings & debt (' + t(sv) + ')', eur(v.inc * sv)]], goal:null, num:{Save:v.inc * sv, Needs:v.inc * n, Wants:v.inc * w, Split_Check:chk.trim()}}; }},
 {id:'debtpay', cat:'everyday', name:'Debt repayment', q:'How fast can I clear my debt?', em:'✂️',
  inputs:[I('b','Balance',5000,100,100000,100,'€'),I('apr','Interest (APR)',20,0,35,0.5,'%'),I('p','Monthly payment',250,10,5000,10,'€')],
  wi:[I('x','Pay extra each month',0,0,1000,10,'€')],
  run(v){ const i = iEq(v.apr), pay = v.p + (v.x || 0), n = nperUp(v.b, i, pay), ti = n === Infinity ? null : totIntI(v.b, i, pay, n), long = n !== Infinity && n > CAP_MONTHS;
    return {lbl:'Debt free in', val:n === Infinity ? 'Never at this repayment' : long ? 'Over 100 years' : yrs(n), line:n === Infinity ? 'The payment does not cover the interest. Try a higher amount.' : long ? 'Payment too low to clear this debt in a reasonable time.' : 'You would pay about ' + eur(ti) + ' in interest. The APR is a yearly rate: about ' + (i * 100).toFixed(2) + '% a month.', rows:[['Total interest', ti == null ? '—' : eur(ti)]], goal:null,
      num:{Months_To_Clear:n === Infinity ? 'Never' : n, Total_Interest:ti == null ? '—' : ti, Monthly_Rate:i}}; }},
 {id:'loan', cat:'everyday', name:'Loan repayment', q:'What would a loan cost me?', em:'🚗',
  inputs:[I('a','Loan amount',15000,500,100000,500,'€'),I('apr','Interest (APR)',8,0,25,0.25,'%'),I('y','Years',5,1,10,1,'y')],
  run(v){ const i = iEq(v.apr), m = pmtI(v.a, i, v.y * 12), tot = m * v.y * 12; return {lbl:'Monthly repayment', val:eur(m), line:'Total interest of about ' + eur(tot - v.a) + ' over ' + yrN(v.y) + '. The APR is treated as an effective yearly rate (as for cards and loans; mortgage tools use the nominal rate ÷ 12, so the same percentage gives a slightly different repayment).', rows:[['Total repaid', eur(tot)],['Total interest', eur(tot - v.a)]], goal:null, num:{Monthly_Repayment:m, Total_Repaid:tot, Total_Interest:tot - v.a, Monthly_Rate:i}}; }}
];
const IB_MAX_MONTHS = 24, RENTBUY_TERM = 30, WAIT_YEARS = 5, ONE_IN_20_Z = 1.645, IP_MAX_PCT = 0.75, MP_YEARS = [5, 10, 15];   // 1.645: the standard-normal value for a 1-in-20 year
const C = id => CALCS.find(c => c.id === (REDIRECT[id] || id));
// Pooja, 1 Oct: inflation is applied silently from the plan's assumption (no slider); separate inflation tools removed and redirected
const INFL_TOOLS = ['realreturn','lumpsum','regularinvest','compound','retirement','avc','contrib','goalplanner','lastmoney','drawdown'];
const REDIRECT = {inflation:'goalplanner'};
const todayM = (fv, y) => (applyAssume(), fv / Math.pow(1 + AS.infl, y));
const ADJ_TOOLS = ['lumpsum', 'regularinvest'];   // Pooja, 1 Oct: optional "Adjust for inflation" switch, default off, remembered per tool for the session
const adjOn = id => !!(S && S.adjInfl && S.adjInfl[id]) && inflSet();
const adjPick = id => S && S.adjInfl && S.adjInfl[id] && !inflSet() ? 'Choose your inflation rate to see it in today\'s money. ' : '';
const realLine = (g, what) => { const rr = (1 + g / 100) / (1 + AS.infl) - 1; return 'Real return about ' + (rr * 100).toFixed(1) + '% a year (' + +(+g).toFixed(2) + '% ' + what + ', prices rising ' + pc(AS.infl) + '). '; };
const worthTxt = (fv, y) => inflSet() ? 'Worth about ' + eur(todayM(fv, y)) + ' in today\'s money. ' : 'Choose your inflation rate to see what it\'s worth in today\'s money. ';
const inflRow = (fv, y) => inflSet() ? ['Worth in today\'s money (prices rising ' + pc(AS.infl) + ' a year)', eur(todayM(fv, y))] : null;
const inflLine = () => inflSet() ? ' Prices rising ' + inflTxt() + ', your choice.' : '';

/* ================= Calculators and §14 =================
   CALC_A: a visible input that is an assumption. A string = a "Your assumptions" key (type 2 or 3): blank until the customer has chosen it
   (or their own data gives it); type 3 shows "Use the standard (X)". An object = a type 2 value local to the tool (range shown), or ret:true =
   a retirement age (never defaulted). CALC_X: the assumptions a tool reads that are not one of its sliders; shown in "Assumptions this tool uses". */
const FEE = {ty:2, n:'yearly fees', mk:'fundChg', t:'pct'}, RET = {ret:true, n:'retirement age'}, RET_W = {ret:true, n:'age when withdrawals start'},
  IBW = {ty:2, n:'Illness Benefit', rng:() => [0, RI.sp.illness], by:'DSP 2026 maximum; lower if you earned under €300 a week; needs enough PRSI', t:'eurw'},
  WAIT = {ty:3, n:'years you might wait', sug:() => SV('waitYears'), get by(){ return SB('waitYears'); }, t:'yrs'}, STYLE = {ty:3, n:'investment style', sug:() => SV('style'), get by(){ return SB('style'); }, t:'style'},
  SPY = {ty:2, n:'State Pension (other yearly income)', rng:() => [0, RI.sp.week * RI.sp.weeks], by:'DSP 2026: the full State Pension is ' + eur(RI.sp.week * RI.sp.weeks) + ' a year; it depends on your PRSI record', t:'eur'};
const CALC_A = {borrow:{rate:'mortRate'}, repayment:{rate:'mortRate'}, overpay:{rate:'mortRate'}, ratechange:{rate:'mortRate'}, term:{rate:'mortRate'}, mortgageprotect:{rate:'mortRate'}, rentbuy:{rate:'mortRate', g:'houseGrow'},
  goalplanner:{r:'cash'}, compound:{r:'invGross'}, lumpsum:{r:'invGross', f:FEE, wait:WAIT}, regularinvest:{g:'invGross', f:FEE}, fees:{g:'invGross', a:FEE, b:FEE}, realreturn:{r:'invGross'},
  emergency:{mt:'safetyMonths'}, retirement:{g:'pen', ra:RET, o:SPY}, contrib:{g:'pen'}, avc:{g:'pen'}, lastmoney:{g:'penRet', age:RET_W}, lifecover:{y:'lifeYears', surv:'survivor'}, incomegap:{ib:IBW}, riskreturn:{s:STYLE}, debtpay:{apr:'cardRate'}, loan:{apr:'loanRate'}};
const CALC_X = {borrow:['buyFees'], deposit:['buyFees'], rentbuy:['rentRise', 'upkeep', 'buyFees', 'depEarn'], retirement:['wage', 'retireMult', 'lumpSum', 'accessAge'], lastmoney:['ddTiming', 'planEnd'], drawdown:['ddTiming', 'riskMu1', 'riskMu2', 'riskMu3'],
  riskreturn:['riskMu1', 'riskMu2', 'riskMu3', 'riskVol1', 'riskVol2', 'riskVol3'], lifecover:['lifeShare'], budget:['budgetNeeds', 'budgetWants', 'budgetSave']};
// §27.5: a calculator input that is a LifeMap standard (not the customer's own figure, not a required choice)
const calcStdItem = s => !!s && !s.ret && ((s.a && asmKind(s.a) === 'std') || (!s.a && s.ty === 3 && !!s.sug));
const stdTag = (cid, k) => { const s = cid && calcA(cid, k); if (!s || !calcStdItem(s)) return ''; const changed = (s.a && asmMine(s.a)) || !!((S.calcT || {})[cid] || {})[k]; return changed ? ' <span class="tag doc">' + T_MINE + '</span>' : ' <span class="tag pre">' + T_SET + '</span>'; };
const calcA = (id, k) => { const s = (CALC_A[id] || {})[k]; return s == null ? null : typeof s === 'string' ? {a:s, n:ASM[s].n, ty:ASM[s].ty} : s; };
const aCalc = (a, v) => v == null ? null : ASM[a].t === 'pct' ? +(v * 100).toFixed(4) : +v;   // assumption value in the tool's units
// What a missing personal figure is called in "Add your … to see this" (never built from labels like "Term A")
const GATE_N = {borrow:{inc:'gross yearly income', inc2:'partner\'s gross yearly income', dep:'deposit saved', ftb:'the first-time buyer answer', term:'mortgage term'},
  repayment:{loan:'the mortgage amount', term:'mortgage years left'}, deposit:{price:'the home price', pc:'the deposit you need (%)', saved:'savings so far', mo:'monthly saving'},
  overpay:{bal:'mortgage balance', yrs:'mortgage years left', x:'the extra each month'}, ratechange:{loan:'mortgage balance', term:'mortgage years left', d:'the rate change'},
  term:{loan:'the mortgage amount', a:'the first term (your mortgage years left)', b:'the second term'}, rentbuy:{rent:'monthly rent', price:'the home price', dep:'deposit', term:'the mortgage term', y:'the years to compare'},
  goalplanner:{t:'goal amount', y:'years until the goal', s:'savings so far'}, compound:{p:'starting amount', m:'monthly addition', y:'the number of years'}, lumpsum:{p:'the amount', y:'the number of years'},
  emergency:{e:'essential monthly spending', s:'easy-access savings'}, retirement:{age:'age', pot:'pension value today', m:'monthly contributions', d:'desired yearly income in retirement'},
  contrib:{sal:'salary', inc:'the extra contribution (% of salary)', y:'years to retirement', tr:'tax rate', age:'age', ex:'yearly pension contributions now'},
  avc:{m:'AVC a month', sal:'salary', y:'years to retirement', tr:'tax rate', age:'age', ex:'yearly pension contributions now'}, lastmoney:{pot:'retirement savings', w:'yearly withdrawal'}, drawdown:{pot:'retirement savings', w:'yearly withdrawal'},
  realreturn:{p:'the amount', y:'the number of years'}, regularinvest:{m:'monthly amount', y:'the number of years'}, fees:{p:'the amount invested', y:'the number of years', a:'the first fee (fee A)', b:'the second fee (fee B)'},
  riskreturn:{p:'the amount', y:'the number of years'}, lifecover:{inc:'gross yearly income', mort:'mortgage balance', mp:'the mortgage protection answer', debt:'other debts', sav:'savings and investments', ex:'existing life cover'},
  incomegap:{e:'essential monthly spending', sp:'months of sick pay', s:'easy-access savings', inc:'gross yearly income'}, mortgageprotect:{bal:'mortgage balance', y:'mortgage years left'},
  networth:{sav:'savings', inv:'investments', pen:'pension value', prop:'property value', mort:'mortgage balance', loans:'other loans'}, surplus:{inc:'take-home pay', ess:'essential spending', life:'lifestyle spending', debt:'debt repayments'},
  budget:{inc:'take-home pay'}, debtpay:{b:'the balance', p:'monthly payment'}, loan:{a:'the loan amount', y:'the loan term'}};
const gateName = (cid, i) => (GATE_N[cid] || {})[i.k] || i.l.replace(/\s*\(.*\)$/, '').toLowerCase();
function calcMissing(c){ const v = calcVals(c), out = [];
  c.inputs.forEach(i => { if (v[i.k] == null){ const s = calcA(c.id, i.k); out.push(s ? ((GATE_N[c.id] || {})[i.k] && s.ty === 2 && !s.a ? (GATE_N[c.id] || {})[i.k] : s.n) : 'add:' + gateName(c.id, i)); } });
  (CALC_X[c.id] || []).forEach(k => { if (!asmMine(k) && !ASM[k].opt && !asmStd(k)) out.push(ASM[k].n); }); return out.filter((x, i, a) => a.indexOf(x) === i); }   // optional tool assumptions (buying fees, deposit earnings): blank counts 0
const locFmt = (s, x) => s.t === 'pct' ? pcs(x) : s.t === 'eurw' ? eurW(x) + ' a week' : s.t === 'yrs' ? yrN(x) : s.t === 'style' ? CHIP_OPTS.style.find(o => o[0] === x)[1] : eur(x);
function calcGuide(cid, k){ const s = calcA(cid, k); if (!s) return ''; if (s.ret) return RETIRE_HELP; if (s.a) return [asmGuide(ASM[s.a]), ASM[s.a].mk ? ASM[s.a].help : ''].filter(Boolean).join(' ');
  if (s.mk) return 'Your statement shows your fund charges. ' + SET.fundChg.note + '.';
  if (s.ty === 3) return 'LifeMap uses ' + locFmt(s, s.sug()) + ' (' + s.by + '). Change it if you want to use your own.';
  const [lo, hi] = s.rng(); return 'Usually between ' + locFmt(s, lo) + ' and ' + locFmt(s, hi) + ' (' + s.by + ').'; }
const calcStd = (cid, k) => { const s = calcA(cid, k) || {}, m = s.a ? (ASM[s.a].mk ? mkSug(ASM[s.a]) : null) : s.mk ? mkSug(s) : null;
  if (m) return {v:s.a ? aCalc(s.a, m.v) : +(m.v * 100).toFixed(4), t:sugChipTxt(m), sug:true};
  return s.a ? (asmStd(s.a) ? {v:aCalc(s.a, ASM[s.a].sug()), t:asmFmt(ASM[s.a], ASM[s.a].sug())} : null) : s.ty === 3 && s.sug ? {v:s.sug(), t:locFmt(s, s.sug())} : null; };
function fieldBlank(i, cid){ const std = calcStd(cid, i.k);
  return '<div class="field"><div class="flabel"><label id="cl-' + i.k + '" for="co-' + i.k + '">' + esc(i.l) + ' <span class="tag look">' + (calcA(cid, i.k) ? 'Not chosen yet' : 'Not added yet') + '</span></label>' + nbox('ck', i.k, '', i.u, 'cl-' + i.k, {id:'co-' + i.k, dec:i.step % 1 !== 0 || i.u === '%'}) + '</div>' +
    (std ? '<button class="chip sm" data-a="ckstd" data-p="' + i.k + '">' + esc(std.sug ? std.t : 'Use the standard (' + std.t + ')') + '</button>' : '') + '<span class="small" style="display:block;margin-top:4px">' + esc(calcGuide(cid, i.k)) + '</span>' + nbHint('ck', i.k) + '</div>'; }
function calcAsmBlock(c){ const ks = CALC_X[c.id]; if (!ks) return ''; const left = ks.filter(k => !asmMine(k) && !ASM[k].opt && !asmStd(k)), g = 'c-' + c.id;
  return '<details class="card asmg" data-g="' + g + '"' + (left.length || S.asmOpen === g ? ' open' : '') + ' style="margin-bottom:12px"><summary style="cursor:pointer;font-weight:800;min-height:44px">Assumptions this tool uses' + (left.length ? ' · ' + left.length + ' to choose' : '') + '</summary><div style="margin-top:10px">' +
    ks.map(k => asmInput(k, true)).join('') + '<p class="small" style="margin:6px 0 0">Figures tagged ' + T_SET + ' are used from the start. These are your plan-wide choices: changing one here changes it everywhere.</p></div></details>'; }
const missTxt = m => { const add = m.startsWith('add:'), n = add ? m.slice(4) : m; return (add ? 'Add ' : 'Choose ') + (/^the /.test(n) ? n : 'your ' + n); };   // "Add your mortgage years left", "Choose the second fee (fee B)"   // "Add your years left" for a missing personal figure
const moTxt = x => { const r = Math.round(x * 10) / 10; return (r % 1 ? r.toFixed(1) : String(r)) + (r === 1 ? ' month' : ' months'); };
// calcVals (FP round 6): pre-filled every time from what we know, in precedence order:
// the customer's own move of a slider in this tool > the statement's figures for this tool > Your finances (statement > typed) > the plan > tool default.
function calcPre(c){ applyAssume(); S.calcWO = S.calcWO || {}; S.calcWO[c.id] = {}; const p = {}, f = S.fin, has = k => S.src[k] && f[k] != null && f[k] !== '' && !isNaN(+f[k]), F = finNums(), mort = F.mortBal > 0, home = S.goals.find(g => g.k === 'home');
  const ess = F.costsM + F.mortPayM + (F.debt > 0 ? F.debtPayM : 0), take = () => { const P = project(); return P.rows[0].inflow / 12; }, rg = retireGoal();
  if (S.about.age >= 18) p.age = S.about.age;   // never invented: with no age given, the tool's own labelled example (§26) shows
  // §14: assumptions come from the customer's own choices (CALC_A in calcVals), never a default. Here only their own data: a stated mortgage rate, their retirement age, their State Pension.
  const mRate = finN('mortRate') > 0 ? finN('mortRate') : undefined, penG = +(penGrowth() * 100).toFixed(2);
  const trFor = () => { const band = F.married ? RI.it.bandMarried + Math.min(F.pIncome, RI.it.bandUplift) : F.spccc ? RI.it.bandSPCCC : RI.it.band; return (F.married ? F.income + F.pIncome : F.income) > band ? 40 : 20; };   // audit #13: by tax status
  switch (c.id){
    case 'borrow': if (has('income')) p.inc = F.income; if (has('pIncome')) p.inc2 = F.pIncome; if (home && home.saved) p.dep = home.saved; if (f.home) p.ftb = /^Own/.test(f.home) ? 0 : 1; break;
    case 'deposit': if (home && home.saved) p.saved = home.saved; break;
    case 'rentbuy': if (home && home.amount) p.dep = home.amount; break;
    case 'repayment': case 'ratechange': if (mort){ p.loan = F.mortBal; p.rate = mRate; p.term = F.mortYears || null; } break;
    case 'term': if (mort){ p.loan = F.mortBal; p.rate = mRate; p.a = F.mortYears || null; } break;
    case 'overpay': if (mort){ p.bal = F.mortBal; p.rate = mRate; p.yrs = F.mortYears || null; } break;
    case 'mortgageprotect': if (mort){ p.bal = F.mortBal; p.rate = mRate; p.y = F.mortYears || null; } break;
    case 'emergency': if (has('costsM')) p.e = ess; if (has('cash')) p.s = F.cash; break;
    case 'incomegap': if (has('costsM')) p.e = ess; if (has('cash')) p.s = F.cash; if (has('income')) p.inc = F.income; break;
    case 'retirement': if (has('pension')) p.pot = F.pension; if (has('pensionM')) p.m = F.pensionM; if (S.retireSet) p.ra = S.retireAge; if (F.spKnown) p.o = Math.round(AS.sp * F.sp); p.g = penG; if (rg) p.d = rg.amount; break;
    case 'contrib': if (has('income')) { p.sal = F.income; p.tr = trFor(); } if (F.pensionOwnM > 0) p.ex = Math.round((F.pensionOwnM + +(S.penExtra || 0)) * 12); if (S.retireSet) p.y = Math.max(1, S.retireAge - S.about.age); p.g = penG; break;
    case 'avc': if (has('income')) { p.sal = F.income; p.tr = trFor(); } if (F.pensionOwnM > 0) p.ex = Math.round((F.pensionOwnM + +(S.penExtra || 0)) * 12); if (S.retireSet) p.y = Math.max(1, S.retireAge - S.about.age); p.g = penG; break;
    case 'lastmoney': case 'drawdown': if (S.asm && S.asm.drawRule === 'fixed' && +S.asm.drawFixed > 0) p.w = Math.round(+S.asm.drawFixed); if ((has('pension') || has('pensionM')) && S.retireSet) p.pot = Math.round(pensionAt(Math.max(0, S.retireAge - S.about.age), F.pension, F.pensionM, penGrowth(), AS.wage)); if (c.id === 'lastmoney' && S.retireSet) p.age = Math.max(S.retireAge, +asmV('accessAge')); break;
    case 'lumpsum': case 'fees': case 'riskreturn': case 'realreturn': if (has('invest')) p.p = F.invest; break;
    case 'lifecover': if (coverTotal('life') + coverTotal('workCover') > 0) p.ex = Math.round(coverTotal('life') + coverTotal('workCover')); if (has('income')) p.inc = F.income; if (mort) p.mort = F.mortBal; if (F.debt > 0) p.debt = F.debt; if (has('cash') || has('invest')) p.sav = F.cash + F.invest; break;
    case 'networth': if (has('cash')) p.sav = F.cash; if (has('invest')) p.inv = F.invest; if (has('pension')) p.pen = F.pension; if (/^Own/.test(f.home || '')) p.prop = (+f.homeValue || 0) + (+f.propValue || 0); if (mort) p.mort = F.mortBal; if (F.debt > 0) p.loans = F.debt; break;
    case 'surplus': if (has('income')){ p.inc = take(); p.ess = F.costsM + F.oneOffY / 12 + F.mortPayM; p.life = 0; p.debt = F.debt > 0 ? F.debtPayM : 0; if (F.mortPayEst && F.mortBal > 0) S.calcWO[c.id].ess = workedNote('mortPayM'); if (F.debtPayEst) S.calcWO[c.id].debt = workedNote(F.cardPayEst ? 'cardPayM' : 'loanPayM'); } break;   // matches the plan's spare money this year
    case 'budget': if (has('income')) p.inc = take(); break;
    case 'debtpay': if (F.debt > 0){ const cm = F.cardBal > 0 ? payoff(F.cardBal, 0, F.cardPayM, iAPR(F.cardRate)).m : 0, lm = F.loanBal > 0 ? payoff(F.loanBal, 0, F.loanPayM, iAPR(F.loanRate)).m : 0; if (cm >= lm){ p.b = F.cardBal; p.p = F.cardPayM; if (F.cardPayEst) S.calcWO[c.id].p = workedNote('cardPayM'); p.apr = F.cardRateKnown ? F.cardRate * 100 : undefined; } else { p.b = F.loanBal; p.p = F.loanPayM; if (F.loanPayEst) S.calcWO[c.id].p = workedNote('loanPayM'); p.apr = F.loanRateKnown ? F.loanRate * 100 : undefined; } } break;
  }
  Object.assign(p, (S.calcDoc || {})[c.id] || {}); return p; }
/* §26: an Explore tool opened without the customer's own figures starts from the tool's example figures, labelled "Example figures. Change them to yours."
   exK[tool][input] is true while that input still holds an example (not their statement, typed, plan or chosen figure). */
const EX_LABEL = 'Example figures. Change them to yours.';
const calcIsExample = c => { const v = S.calcV[c.id] || {}, e = (S.calcExK || {})[c.id] || {}; return !S.app && c.inputs.some(i => e[i.k] && v[i.k] != null); };
function calcVals(c){ S.calcV[c.id] = S.calcV[c.id] || {}; S.calcT = S.calcT || {}; S.calcExK = S.calcExK || {}; const v = S.calcV[c.id], T = S.calcT[c.id] || {}, pre = calcPre(c), ex = S.calcExK[c.id] = {};
  c.inputs.concat(c.wi || []).forEach(i => { if (T[i.k] && v[i.k] != null) return; const s = calcA(c.id, i.k), tp = ((S.toolPick || {})[c.id] || {})[i.k], x = pre[i.k] != null ? pre[i.k] : pre[i.k] === null ? null : s ? (s.a ? aCalc(s.a, calcStdItem(s) ? asmV(s.a) : asmGet(s.a)) : tp != null ? tp : calcStdItem(s) ? s.sug() : null) : i.v; ex[i.k] = pre[i.k] === undefined && !s; v[i.k] = x == null ? null : clamp(+(+x).toFixed(4), i.min, i.max); });   // stated figures are not rounded to the slider step
  return v; }
/* ================= Editable value boxes beside every slider (Pooja, 1 Oct) =================
   Type a figure instead of dragging. Commits live while typing (once valid) and on Enter / blur. Typed values keep their precision;
   the step only applies when dragging. € fields may go above the slider's top (slider pins at its end and widens); other fields clamp with a hint. */
const nbFmt = v => { const n = +v; return Math.abs(n % 1) > 1e-9 ? (+n.toFixed(4)).toLocaleString('en-IE', {maximumFractionDigits:4}) : Math.round(n).toLocaleString('en-IE'); };
const nbParts = u => u === '€' ? ['€', ''] : u === '%' ? ['', '%'] : u === 'y' ? ['', 'yrs'] : u === 'm' ? ['', 'mo'] : u === 'age' ? ['age ', ''] : ['', ''];
const nbW = t => (Math.max(2, String(t).length) + 0.6) + 'ch';
const nbParse = s => { const t = String(s).replace(/[^\d.,\-]/g, '').replace(/,/g, ''); if (t === '' || t === '-' || t === '.') return null; const n = parseFloat(t); return isFinite(n) ? n : null; };
function nbox(kind, key, v, u, lab, o){ o = o || {}; const [pre, suf] = nbParts(u), txt = v === '' || v == null ? '' : (o.sign && v > 0 ? '+' : '') + nbFmt(v);
  return '<span class="nbox">' + (pre ? '<span class="nbu" aria-hidden="true">' + pre + '</span>' : '') + '<input class="nb"' + (o.id ? ' id="' + o.id + '"' : '') + ' type="text" inputmode="' + (o.dec ? 'decimal' : 'numeric') + '" style="width:' + nbW(txt) + '" data-nb="' + kind + '|' + key + '" value="' + txt + '"' + (lab ? ' aria-labelledby="' + lab + '"' : '') + ' autocomplete="off" enterkeyhint="done">' + (suf ? '<span class="nbu" aria-hidden="true">' + suf + '</span>' : '') + '</span>'; }
const nbHint = (kind, key) => '<span class="nbhint" id="nh-' + kind + '-' + key + '" role="status" aria-live="polite">' + esc(((S && S.nbH) || {})[kind + '-' + key] || '') + '</span>';
// Per-kind limits and how a value is applied. lim → {min, max (real limits), smax (slider top), widen}
const retMin = () => (S.about.age || 0) + 1, retMax = () => Math.max(retMin(), +asmV('planEnd') - 1);
const pRetMin = () => (finN('pAge') > 0 ? finN('pAge') : (S.about.age || 0)) + 1, pRetMax = () => Math.max(pRetMin(), pRetMin() - 1 + (+asmV('planEnd') - (S.about.age || 0)) - 1);
const NB = {
  ck:{ calc:() => { const t = xTop(); return t && t.v === 'CALC' ? C(t.p) : null; },
    lim(k){ const c = this.calc(), i = c && c.inputs.concat(c.wi || []).find(x => x.k === k); return i ? {min:i.min, max:i.u === '€' ? i.max * 10 : i.max, smax:i.max, widen:i.u === '€', u:i.u, int:['y', 'm', 'age'].includes(i.u) && i.step % 1 === 0} : null; },
    apply(k, v){ const c = this.calc(); if (!c) return; const vals = calcVals(c); vals[k] = v; calcSync(c.id, k, v); S.calcT = S.calcT || {}; (S.calcT[c.id] = S.calcT[c.id] || {})[k] = true;
      const r = document.getElementById('c-' + k); if (r){ if (v > +r.max && this.lim(k).widen) r.max = v; r.value = v; } const out = document.getElementById('cout'); if (out) out.innerHTML = calcOut(c); } },
  wi:{ lim(k){ return k === 'm' ? {min:-5000, max:10000, smax:1000, widen:true, u:'€'} : {min:0, max:2000000, smax:50000, widen:true, u:'€'}; },
    apply(k, v){ if (S.wi.g == null) S.wi.g = defaultWiGoal(); S.wi[k] = v; const r = document.querySelector('[data-wi="' + k + '"]'); if (r){ if (v > +r.max) r.max = v; if (v < +r.min) r.min = v; r.value = v; r.setAttribute('aria-valuetext', eur(v)); } liveUpdate(true); } },
  save:{ lim(){ const P = project(); return {min:0, max:Math.max(0, P.save.surplusM), smax:Infinity, widen:false, u:'€', maxMsg:'That\'s all your spare money each month'}; },
    apply(k, v){ S.saveM = v; S.saveNote = ''; liveUpdate(true); } },
  infl:{ lim(){ return {min:0, max:10, smax:10, widen:false, u:'%'}; },
    apply(k, v){ S.infl = +(v / 100).toFixed(4); S.inflOther = true; const out = document.getElementById('cout'), t = xTop(); if (out && t && t.v === 'CALC') out.innerHTML = calcOut(C(t.p)); else if (document.getElementById('wi-out')) liveUpdate(true); } },
  asm:{ lim(k){ const d = ASM[k]; return d ? {min:k === 'planEnd' ? Math.max(d.min, (S.about.age || 0) + 1) : d.min, max:d.max, smax:d.max, widen:false, u:nbUnit(d), int:d.t !== 'pct' && d.step % 1 === 0} : null; },
    apply(k, v){ const d = ASM[k]; S.asm = S.asm || {}; if (S.advRate) delete S.advRate[k]; S.asm[k] = d.t === 'pct' ? +(v / 100).toFixed(6) : d.step % 1 === 0 ? Math.round(v) : v; applyAssume();
      if (k === 'planEnd' && S.retireSet && S.retireAge > retMax()){ const r = retMax(); setRetireAge(r); toast('We moved your retirement age to ' + r + ' so it stays before your plan-until age'); } } },
  ret:{ lim(){ return {min:retMin(), max:retMax(), smax:retMax(), widen:false, u:'age', int:true}; },
    apply(k, v){ const r = retireGoal(); if (r) r.age = Math.round(v); setRetireAge(Math.round(v)); S.src.retireAge = 'typed'; S.fin.retireAge = S.retireAge; } },
  pret:{ lim(){ return {min:pRetMin(), max:pRetMax(), smax:pRetMax(), widen:false, u:'age', int:true}; },
    apply(k, v){ S.pRet = Math.round(v); S.pRetSet = true; } },
  age:{ lim(){ return {min:18, max:80, smax:80, widen:false, u:'age', int:true}; },
    apply(k, v){ S.about.age = Math.round(v); ageNext(); const r = document.querySelector('input[data-in="age"]'); if (r) r.value = S.about.age; } }
};
function nbCommit(inp, final){ const [kind, key] = inp.dataset.nb.split('|'), K = NB[kind]; if (!K) return; const L = K.lim(key); if (!L) return; const n = nbParse(inp.value), h = document.getElementById('nh-' + kind + '-' + key);
  if (n == null){ if (final){ if (kind === 'asm' && ASM[key] && ASM[key].opt && inp.value.trim() === ''){ S.asm = Object.assign({}, S.asm); delete S.asm[key]; applyAssume(); render(); return; } inp.value = inp.dataset.last || inp.defaultValue; } return; }
  let v = n, msg = ''; if (v > L.max){ v = L.max; msg = L.maxMsg || 'Max ' + (L.u === '€' ? eur(L.max) : nbFmt(L.max) + (L.u === '%' ? '%' : nbParts(L.u)[1] ? ' ' + nbParts(L.u)[1] : '')); } else if (v < L.min){ v = L.min; msg = 'Min ' + (L.u === '€' ? eur(L.min) : nbFmt(L.min)); }
  if (L.int && v !== Math.round(v)){ v = Math.round(v); msg = msg || 'Whole numbers only'; }
  K.apply(key, v); inp.dataset.last = (kind === 'wi' && key === 'm' && v > 0 ? '+' : '') + nbFmt(v);
  S.nbH = S.nbH || {}; if (msg) S.nbH[kind + '-' + key] = msg; else delete S.nbH[kind + '-' + key]; if (h) h.textContent = msg; if (final){ inp.value = inp.dataset.last; inp.dataset.fin = inp.value; inp.style.width = nbW(inp.value); if (kind === 'save' || kind === 'age' || kind === 'infl' || kind === 'asm' || kind === 'ret' || kind === 'pret' || (kind === 'ck' && (!document.getElementById('c-' + key) || (inp.closest('.field') && inp.closest('.field').querySelector('.tag.pre'))))) render(); } }
function bindNB(ph){ ph.querySelectorAll('input[data-nb]').forEach(i => { if (i._nb) return; i._nb = 1;
  i.addEventListener('input', () => { i.style.width = nbW(i.value); nbCommit(i, false); }); i.addEventListener('change', () => { if (i.dataset.fin != null && i.value === i.dataset.fin) return; nbCommit(i, true); });   // Enter, then leaving the box, keeps the max / min hint
  i.addEventListener('keydown', e => { if (e.key === 'Enter'){ e.preventDefault(); nbCommit(i, true); } });
  i.addEventListener('focus', () => i.select()); }); }
const fmtIn = (i, v) => i.u === '€' ? eur(v) : i.u === '%' ? v + '%' : i.u === 'y' ? v + ' yrs' : i.u === 'm' ? v + ' mo' : i.u === 'age' ? 'age ' + v : String(v);
// FP round 7: whole-number choices are chips, never sliders (no 0.5 first-time buyer, no style 2.5 → €NaN)
const CHIP_OPTS = {yn:[[1, 'Yes'], [0, 'No']], style:[[1, '1 · Cautious'], [2, '2 · Balanced'], [3, '3 · Growth']], tax:[[20, '20%'], [40, '40%']]};
const fieldC = (i, v, src, cid) => { const on = x => v != null && +v === x, std = v == null && cid ? calcStd(cid, i.k) : null; return '<div class="field"><span class="flabel" id="cl-' + i.k + '">' + esc(i.l) + (src && src.includes(i.k) ? ' <span class="tag doc">From your statement</span>' : '') + (v == null ? ' <span class="tag look">' + (calcA(cid, i.k) ? 'Not chosen yet' : 'Not added yet') + '</span>' : '') + stdTag(cid, i.k) + '</span><div class="chips" role="group" aria-labelledby="cl-' + i.k + '">' + CHIP_OPTS[i.u].map(([x, l]) => '<button class="chip sm' + (on(x) ? ' sel' : '') + '" aria-pressed="' + on(x) + '" data-a="ckset" data-p="' + i.k + '|' + x + '">' + l + '</button>').join('') + '</div>' + (std ? '<button class="chip sm" style="margin-top:6px" data-a="ckstd" data-p="' + i.k + '">' + esc(std.sug ? std.t : 'Use the standard (' + std.t + ')') + '</button>' : '') + (v == null && cid ? '<span class="small" style="display:block;margin-top:4px">' + esc(calcGuide(cid, i.k)) + '</span>' : '') + '</div>'; };
const woC = (cid, k) => cid && S.calcWO && S.calcWO[cid] && S.calcWO[cid][k] && !((S.calcT || {})[cid] || {})[k] ? S.calcWO[cid][k] : '';
const fieldR = (i, v, src, cid) => CHIP_OPTS[i.u] ? fieldC(i, v, src, cid) : v == null ? fieldBlank(i, cid) : '<div class="field"><div class="flabel"><label id="cl-' + i.k + '" for="c-' + i.k + '">' + esc(i.l) + (src && src.includes(i.k) ? ' <span class="tag doc">From your statement</span>' : '') + (woC(cid, i.k) ? ' <span class="tag pre">Worked out from your figures</span>' : '') + stdTag(cid, i.k) + '</label>' + nbox('ck', i.k, v, i.u, 'cl-' + i.k, {id:'co-' + i.k, dec:i.step % 1 !== 0 || i.u === '%'}) + '</div><input type="range" id="c-' + i.k + '" data-ck="' + i.k + '" min="' + i.min + '" max="' + Math.max(i.max, v) + '" step="' + i.step + '" value="' + v + '" aria-labelledby="cl-' + i.k + '" aria-valuetext="' + esc(fmtIn(i, v)) + '">' + nbHint('ck', i.k) + (woC(cid, i.k) ? '<span class="small" style="display:block;margin-top:2px">' + esc(woC(cid, i.k).replace(/ Type yours to replace it\.$/, '')) + '</span>' : '') + (cid && calcA(cid, i.k) && calcA(cid, i.k).ty === 2 ? '<span class="small" style="display:block;margin-top:2px">' + esc(calcGuide(cid, i.k)) + '</span>' : '') + '</div>';
function calcOut(c){ const miss = calcMissing(c); if (miss.length) return '<div class="card" id="cgate" style="background:var(--ink);color:#fff"><div class="eyebrow" style="color:var(--sun)">Your result</div><b style="font-size:18px;display:block;margin:4px 0">' + esc(missTxt(miss[0]) + ' to see this') + '</b>' + (miss.length > 1 ? '<p style="margin:0;font-size:13.5px;color:#DCE7F2">Also still to add or choose: ' + esc(miss.slice(1).map(x => x.replace(/^add:/, '')).join(', ')) + '.</p>' : '') + '</div>';
  const v = calcVals(c), r = c.run(v), exm = calcIsExample(c); const lab = document.getElementById('exlab'); if (lab) lab.hidden = !exm;
  return '<div class="card" style="background:var(--ink);color:#fff"><div class="eyebrow" style="color:var(--sun)">' + esc(r.lbl) + '</div><div style="font-family:var(--fh);font-size:36px;font-weight:800;margin:4px 0">' + r.val + '</div>' + (exm ? '<p class="exres" style="margin:0 0 6px;font-size:12.5px;font-weight:800;color:var(--sun)">' + EX_LABEL + '</p>' : '') + '<p style="margin:0;font-size:14px;line-height:1.5;color:#DCE7F2">' + esc(r.line) + '</p>' + r.rows.filter(Boolean).map(x => '<div class="row" style="justify-content:space-between;border-top:1px solid rgba(255,255,255,.14);padding:8px 0;margin-top:8px;font-size:13.5px"><span>' + x[0] + '</span><b>' + x[1] + '</b></div>').join('') + '</div>'; }
function toolsForYou(){ const ks = S.goals.map(g => g.spec), ids = []; const add = x => { if (!ids.includes(x)) ids.push(x); };
  if (ks.includes('mortgage')) { add('borrow'); add('deposit'); } if (ks.includes('pension')) { add('retirement'); add('contrib'); } add('goalplanner'); add('emergency'); add('surplus'); add('lifecover'); add('compound'); return ids.slice(0, 6); }
function toolTile(id){ const c = C(id), cat = CATS.find(x => x.id === c.cat); return '<div class="pcard"><span class="pc-top" style="background:' + cat.color + '" aria-hidden="true">' + c.em + '</span><span class="pc-cat">' + esc(cat.name) + '</span><b>' + esc(c.name) + '</b><button class="btn sm pc-go" data-a="calc" data-p="' + id + '" aria-label="Try ' + esc(c.name) + '">Try it <span aria-hidden="true">→</span></button></div>'; }   // layout v11: product-style card
const VIDEOS = [
  {id:'v7', t:'What is auto-enrolment?', mins:2, dur:'1:14', kind:'pension', who:'LifeMap · Pensions explainer', tool:'retirement', src:'media/auto-enrolment-explained.mp4', poster:'media/money-plant.jpg', art:'savings', cc:'Auto-enrolment: how the workplace pension scheme works.'},
  {id:'v8', t:'Your retirement plan: how it works', mins:2, dur:'1:22', kind:'pension', who:'LifeMap · Pensions explainer', tool:'retirement', src:'media/retirement-plan-how-it-works.mp4', poster:'media/retired-reading.jpg', art:'pension', cc:'How your retirement plan works, step by step.'},
  {id:'v9', t:'How much can I borrow? A first-time buyer’s guide', mins:3, dur:'2:56', kind:'mortgage', who:'LifeMap · Mortgage guide', tool:'borrow', src:'media/how-much-can-i-borrow.mp4', poster:'media/how-much-can-i-borrow-poster.jpg', vtt:'media/how-much-can-i-borrow.vtt', art:'mortgage', cc:'The five checks lenders make, with a real-life example…',
   transcript:'Hey there, I’m John Nugent, and welcome to LifeMap. I’m going to answer the question I get asked more than any other… how much can I actually borrow? Don’t worry, we’ll keep it simple. And we’ll follow a real-life example, so you can see exactly how it works. Let’s meet Aoife and Conor. They’re renting at the moment, paying €1,500 a month… and they’re dreaming of their own front door. Between them, they earn €85,000 a year. So… how much could they borrow? Lenders look at five things. Let’s take them one by one. First… loan to income. As a rule, you can borrow up to four times your combined income. For Aoife and Conor, that’s €85,000 times four… which is €340,000. Some lenders can stretch a little further for high earners. But you’d need to be approved at four times first. Second… your deposit. Every lender asks for at least ten percent of the house price. So we add that to Aoife and Conor’s €340,000. And that gives us a house price of €377,778. That’s €340,000 to borrow, plus a deposit of about €37,778. That’s ten percent of the price. Now, here’s some good news. There’s a Help to Buy scheme that can go towards your deposit. It’s for first-time buyers of a new home priced under €500,000… and you’ll need to have paid income tax and DIRT in Ireland over the last four years. You can claim the lowest of three things: ten percent of the property value, the tax you’ve paid over those four years, or €30,000. Whichever comes out smallest. Third… net disposable income. That’s simply whether you’d have enough left over to live on each month. Lenders work this out with a formula based on your family size, not your actual spending. Fourth… your debt servicing ratio. Lenders limit how much of your income can go on repaying debts, like loans or credit cards. If you’ve already got a lot of borrowing, adding a mortgage could push you over that limit. The good news? Aoife and Conor only have one small loan, so neither of these is a worry for them. Fifth… repayment capacity. Lenders need to be sure you can comfortably afford the monthly payment. Over thirty-five years, a mortgage of €340,000 comes to roughly €1,350 to €1,450 a month, depending on the lender. Some lenders also offer cashback, usually one to two percent when you draw down. That can make the monthly payment a touch higher… but you get some money back at the start. Now… Aoife and Conor are paying €1,500 a month in rent, and they’re saving €300 a month on top. That’s €1,800 a month they’ve shown they can manage. And that comfortably covers the repayment. They could even look at a shorter mortgage term than thirty-five years. So there you have it. Five checks, and a clear picture of what Aoife and Conor could borrow. Your own numbers will be different… and that’s completely okay. That’s what we’re here for. Pop your details into LifeMap, and we’ll talk you through your own options. Book your expert appointment today with us.'},
  {id:'v1', t:'Your first home: deposit to keys', mins:1, dur:'0:53', kind:'mortgage', who:'Example video · Mortgage guide', tool:'deposit', src:'media/first-home-deposit-to-keys.mp4', poster:'media/first-home-deposit-to-keys-poster.jpg', vtt:'media/first-home-deposit-to-keys.vtt', art:'mortgage', cc:'Most buyers need a 10% deposit. Here’s how to get there faster…',
   transcript:'Buying your first home in Ireland? Stop. Watch this before you sign anything. One. You can borrow up to four times your income, with a ten percent deposit. But choose a repayment you can sleep on. Two. Add stamp duty, legal fees and a survey to your budget. Three. Claim every benefit: Help to Buy, and the First Home Scheme. Four. Fixed gives certainty, variable can move. Five. Get approval in principle before you view a single house. Six. Protect your family with mortgage protection. Do this, and eight months later, you’re holding the keys. Time to put the kettle on.'},
  {id:'v2', t:'Pensions made simple: tax relief explained', mins:3, kind:'pension', who:'Conor Walsh · Pension expert', tool:'retirement', art:'investing', cc:'For every €100 you pay in, the real cost to you can be much less…'},
  {id:'v3', t:'How much emergency money do you need?', mins:2, kind:'planner', who:'Aisling Doyle · Financial planner', tool:'emergency', art:'savings', cc:'A simple rule: three to six months of your essential spending…'},
  {id:'v4', t:'Protecting your family, simply', mins:3, kind:'protection', who:'Mark Byrne · Protection expert', tool:'lifecover', art:'protection', cc:'If your income stopped tomorrow, what would keep your plan going?…'},
  {id:'v5', t:'Investing for beginners: risk, time and fees', mins:4, kind:'investment', who:'Sarah Kelly · Investment expert', tool:'riskreturn', art:'investing', cc:'Time in the market matters more than timing the market…'},
  {id:'v6', t:'Why we spend the way we do', mins:2, kind:'planner', who:'Aisling Doyle · Financial planner', tool:'surplus', art:'everyday', cc:'Your money story shapes every choice. Let’s look at yours…'}
];
const LIVE = [['Thu 7pm','First-time buyers: your questions answered','mortgage'],['Tue 1pm','Pensions in 20 minutes','pension'],['Sat 11am','Protecting your family, simply','protection']];
const VKIND = {mortgage:'Mortgages', pension:'Pensions', planner:'Savings & money', protection:'Protection', investment:'Investing'};
const VID = id => VIDEOS.find(v => v.id === id);
function xWorst(){ if (!S.app || !S.goals.length || !planReady()) return null; const P = project(), w = S.goals.slice().sort((a, b) => P.pct[a.id] - P.pct[b.id])[0]; return w && P.pct[w.id] < 95 ? w : null; }
function videosForYou(){ const ks = S.goals.map(g => g.spec), w = xWorst(), wk = w ? w.spec : null; return VIDEOS.slice().sort((a, b) => ((b.kind === wk) * 2 + ks.includes(b.kind)) - ((a.kind === wk) * 2 + ks.includes(a.kind))); }
function vThumb(v, grid){ return '<button class="vcard' + (grid ? ' grid' : '') + '" data-a="video" data-p="' + v.id + '"><span class="vc-img" style="--vart:var(--art-' + (v.art || 'savings') + ')"><span class="len">' + (v.dur || v.mins + ' min') + '</span><span class="play" aria-hidden="true">▶</span></span><span class="vc-body"><span class="vc-kind">' + (VKIND[v.kind] || 'Video') + '</span><b>' + esc(v.t) + '</b><small>' + esc(v.who.split(' · ')[1]) + '</small></span></button>'; }   // v19: image-top video card
function watchHTML(){ const vs = videosForYou(), f = vs[0], w = xWorst();
  return '<div class="sec"><h3>Watch · picked for you</h3><button class="link" data-a="videos">All videos</button></div>' +
   '<button class="vthumb' + (f.art ? ' vph' : '') + '" style="width:100%;min-height:180px' + (f.art ? ';--vart:var(--art-' + f.art + ')' : '') + '" data-a="video" data-p="' + f.id + '"><span class="play" aria-hidden="true">▶</span><span class="len">' + (f.dur || f.mins + ' min') + '</span><small style="margin:0 0 4px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;font-size:11px">' + (w ? 'Because ' + esc(w.name.toLowerCase()) + ' needs a nudge' : 'A good place to start') + '</small><b style="font-size:18px">' + esc(f.t) + '</b><small>' + esc(f.who) + '</small></button>' +
   '<div class="hstrip" style="margin-top:10px">' + vs.slice(1, 5).map(v => vThumb(v)).join('') + '</div>' +
   liveCard(LIVE[0], 'With a ' + EXPERT_FOR[LIVE[0][2]].toLowerCase(), 'margin-top:10px');
}
const TOPICS = [['🏡','Mortgages','Buying, switching and paying off faster','mortgage','home'],['🌅','Pensions','Tax relief, PRSAs and retirement income','pension','retire'],['🛡️','Protection','Life cover, income protection, serious illness','protection','protect'],['📈','Investing','Risk, time and fees, explained simply','investment','invest'],['🐷','Savings','Emergency fund and goal saving','planner','savings'],['💶','Everyday money','Budget, surplus and debt','planner','everyday']];
/* Focus on one area: illustrated square tiles. The picture is the custom property --art-{key} (see :root); the animated overlay is TOPIC_FX. */
const TOPIC_ART = {Mortgages:'mortgage', Pensions:'pension', Protection:'protection', Investing:'investing', Savings:'savings', 'Everyday money':'everyday'};
const TOPIC_FX = {"mortgage": "<svg class=\"fx\" viewBox=\"0 0 100 100\" preserveAspectRatio=\"xMidYMid slice\" aria-hidden=\"true\" focusable=\"false\"><g class=\"fx-cloud a\"><ellipse cx=\"20\" cy=\"22\" rx=\"11\" ry=\"4.2\" fill=\"#fff\" opacity=\".9\"/><ellipse cx=\"27\" cy=\"19\" rx=\"7\" ry=\"4\" fill=\"#fff\" opacity=\".9\"/></g><g class=\"fx-cloud b\"><ellipse cx=\"62\" cy=\"12\" rx=\"9\" ry=\"3.4\" fill=\"#fff\" opacity=\".8\"/><ellipse cx=\"68\" cy=\"9.6\" rx=\"5.5\" ry=\"3\" fill=\"#fff\" opacity=\".8\"/></g><rect class=\"fx-glow\" x=\"29\" y=\"57\" width=\"7\" height=\"7\" fill=\"#FFE29A\"/><rect class=\"fx-glow d\" x=\"48\" y=\"57\" width=\"7\" height=\"7\" fill=\"#FFE29A\"/></svg>", "pension": "<svg class=\"fx\" viewBox=\"0 0 100 100\" preserveAspectRatio=\"xMidYMid slice\" aria-hidden=\"true\" focusable=\"false\"><g class=\"fx-sun\"><circle cx=\"50\" cy=\"58\" r=\"16\" fill=\"#FFE29A\"/><circle cx=\"50\" cy=\"58\" r=\"22\" fill=\"#FFE29A\" opacity=\".25\"/></g><rect y=\"62\" width=\"100\" height=\"38\" fill=\"#0A7068\" opacity=\"0\"/><g class=\"fx-glint\" stroke=\"#FFE29A\" stroke-linecap=\"round\"><path d=\"M42 68H58\" stroke-width=\"1.6\"/><path d=\"M45 74H55\" stroke-width=\"1.3\"/></g><g class=\"fx-cloud c\"><ellipse cx=\"22\" cy=\"30\" rx=\"10\" ry=\"3.2\" fill=\"#fff\" opacity=\".35\"/></g><path d=\"M0 62H100V100H0Z\" fill=\"none\"/></svg>", "protection": "<svg class=\"fx\" viewBox=\"0 0 100 100\" preserveAspectRatio=\"xMidYMid slice\" aria-hidden=\"true\" focusable=\"false\"><defs><clipPath id=\"sh\"><path d=\"M50 14 L76 24 V46 C76 62 64 72 50 78 C36 72 24 62 24 46 V24Z\"/></clipPath></defs><g clip-path=\"url(#sh)\"><rect class=\"fx-shine\" x=\"-30\" y=\"10\" width=\"14\" height=\"80\" fill=\"#fff\" opacity=\".35\" transform=\"skewX(-20)\"/></g><circle class=\"fx-ring\" cx=\"50\" cy=\"46\" r=\"34\" fill=\"none\" stroke=\"#F2B134\" stroke-width=\"1.4\"/></svg>", "investing": "<svg class=\"fx\" viewBox=\"0 0 100 100\" preserveAspectRatio=\"xMidYMid slice\" aria-hidden=\"true\" focusable=\"false\"><polyline class=\"fx-draw\" points=\"6,80 26,66 40,70 58,46 74,52 94,22\" fill=\"none\" stroke=\"#F2B134\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" pathLength=\"100\"/><circle class=\"fx-dot\" cx=\"94\" cy=\"22\" r=\"5\" fill=\"none\" stroke=\"#F2B134\" stroke-width=\"1.5\"/></svg>", "savings": "<svg class=\"fx\" viewBox=\"0 0 100 100\" preserveAspectRatio=\"xMidYMid slice\" aria-hidden=\"true\" focusable=\"false\"><g class=\"fx-coin\"><circle cx=\"51\" cy=\"14\" r=\"7\" fill=\"#F2B134\" stroke=\"#B8801A\" stroke-width=\"1.4\"/><text x=\"51\" y=\"17.4\" font-size=\"9\" font-weight=\"800\" text-anchor=\"middle\" fill=\"#7A5200\" font-family=\"sans-serif\">€</text></g><g class=\"fx-star a\" fill=\"#F2B134\"><path d=\"M20 22 l1.4 3.6 3.6 1.4 -3.6 1.4 -1.4 3.6 -1.4 -3.6 -3.6 -1.4 3.6 -1.4Z\"/></g><g class=\"fx-star b\" fill=\"#F2B134\"><path d=\"M84 40 l1 2.6 2.6 1 -2.6 1 -1 2.6 -1 -2.6 -2.6 -1 2.6 -1Z\"/></g></svg>", "everyday": "<svg class=\"fx\" viewBox=\"0 0 100 100\" preserveAspectRatio=\"xMidYMid slice\" aria-hidden=\"true\" focusable=\"false\"><g class=\"fx-float\"><circle cx=\"72\" cy=\"55\" r=\"0.01\" fill=\"none\"/></g><g class=\"fx-star a\" fill=\"#fff\"><path d=\"M64 60 l1.8 4.6 4.6 1.8 -4.6 1.8 -1.8 4.6 -1.8 -4.6 -4.6 -1.8 4.6 -1.8Z\"/></g><g class=\"fx-star b\" fill=\"#fff\"><path d=\"M82 72 l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2 -3 -3 -1.2 3 -1.2Z\"/></g><g class=\"fx-cloud b\"><circle cx=\"30\" cy=\"30\" r=\"5\" fill=\"#fff\" opacity=\".4\"/></g></svg>"};
const TOPIC_PHOTO = {mortgage:'50% 45%', pension:'50% 35%', investing:'50% 50%', savings:'50% 50%', everyday:'40% 62%', protection:'50% 35%'};   // v30: new Unsplash photos (media/)   // §25: object-position per photo; Protection has no photo (drawn shield)
function xFeature(){ const i = S.xf || 0, t = TOPICS[i], k = TOPIC_ART[t[1]], nx = TOPICS[(i + 1) % TOPICS.length], nk = TOPIC_ART[nx[1]], nt = (TOPIC_TOOLS[t[1]] || []).length, nv = VIDEOS.filter(v => v.kind === t[3]).length;
  return '<div class="chips xchips" role="group" aria-label="Choose an area">' + TOPICS.map((x, j) => '<button class="chip' + (j === i ? ' sel' : '') + '" aria-pressed="' + (j === i) + '" data-a="xfeat" data-p="' + j + '">' + x[1] + '</button>').join('') + '</div>' +
    '<div class="xhero"><span class="xh-back" aria-hidden="true" style="background-image:var(--art-' + nk + ')"></span><button class="xh-card" data-a="topic" data-p="' + t[1] + '" style="--art:var(--art-' + k + ')' + (TOPIC_PHOTO[k] ? ';--pos:' + TOPIC_PHOTO[k] : '') + '"><span class="art" aria-hidden="true"></span><span class="scrim" aria-hidden="true"></span>' +
    '<span class="xh-tx"><small>' + t[0] + ' Focus area</small><b>' + t[1] + '</b><span class="xh-meta"><span class="xh-pill">' + nt + ' tool' + (nt === 1 ? '' : 's') + '</span>' + (nv ? nv + ' video' + (nv === 1 ? '' : 's') : esc(t[2])) + '</span></span><span class="xh-more"><span>See more</span><span class="xh-go" aria-hidden="true">›</span></span></button></div>' +
    '<div class="xh-nav"><button class="xh-arr" data-a="xswipe" data-p="-1" aria-label="Previous area">‹</button><span class="xh-dots" aria-hidden="true">' + TOPICS.map((x, j) => '<i' + (j === i ? ' class="on"' : '') + '></i>').join('') + '</span><span class="xh-hint" aria-hidden="true">Swipe to explore</span><button class="xh-arr" data-a="xswipe" data-p="1" aria-label="Next area">›</button></div>'; }
// v101: swipeable focus-area card - drag/swipe, arrows, dots, arrow keys
function xSwipe(d, fromDrag){ const n = TOPICS.length, i = ((S.xf || 0) + d + n) % n, c = document.querySelector('.xh-card');
  if (!c || RM()){ S.xf = i; return render(); }
  // swap the card in place: no full re-render, so nothing flickers and photos stay loaded
  const swap = () => { S.xf = i; const t = document.createElement('div'); t.innerHTML = xFeature();
    ['.xchips', '.xhero', '.xh-nav'].forEach(sel => { const o = document.querySelector(sel), nn = t.querySelector(sel); if (o && nn) o.replaceWith(nn); });
    hideEmoji(document.querySelector('.xhero')); const k = document.querySelector('.xh-card'), ch = document.querySelector('.xchips .sel');
    if (ch && ch.scrollIntoView) ch.parentElement.scrollTo({left:ch.offsetLeft - 18, behavior:'smooth'});
    k.style.transition = 'none'; k.style.transform = 'translateX(' + (d > 0 ? 34 : -34) + '%) scale(.94)'; k.style.opacity = '0';
    requestAnimationFrame(() => requestAnimationFrame(() => { k.style.transition = 'transform .42s cubic-bezier(.22,1,.36,1), opacity .3s ease'; k.style.transform = ''; k.style.opacity = '1'; })); };
  c.style.transition = 'transform ' + (fromDrag ? '.24s' : '.3s') + ' cubic-bezier(.55,0,.75,.3), opacity .24s ease'; c.style.transform = 'translateX(' + (d > 0 ? -125 : 125) + '%) rotate(' + (d > 0 ? -12 : 12) + 'deg)'; c.style.opacity = '0';
  const b = document.querySelector('.xh-back'); if (b){ b.style.transition = 'transform .3s ease, opacity .3s ease'; b.style.transform = 'rotate(0deg) scale(1)'; b.style.opacity = '1'; }
  setTimeout(swap, fromDrag ? 200 : 260); }
(() => { let st = null;
  document.addEventListener('pointerdown', e => { const c = e.target.closest && e.target.closest('.xh-card'); if (!c || e.button > 0) return; st = {x:e.clientX, y:e.clientY, c, dx:0, drag:false, id:e.pointerId}; });
  let raf = 0; const paint = () => { raf = 0; if (!st || !st.drag) return; const dx = st.dx; st.c.style.transform = 'translate3d(' + dx + 'px,0,0) rotate(' + dx / 24 + 'deg)'; const b = document.querySelector('.xh-back'); if (b){ const p = Math.min(1, Math.abs(dx) / 160); b.style.transform = 'rotate(' + (4 - 4 * p) + 'deg) scale(' + (.96 + .04 * p) + ')'; b.style.opacity = String(.75 + .25 * p); } };
  document.addEventListener('pointermove', e => { if (!st || e.pointerId !== st.id) return; const dx = e.clientX - st.x, dy = e.clientY - st.y;
    if (!st.drag){ if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) { if (Math.abs(dy) > 12) st = null; return; } st.drag = true; st.c.style.transition = 'none'; const b = document.querySelector('.xh-back'); if (b) b.style.transition = 'none'; try { st.c.setPointerCapture(e.pointerId); } catch (_) {} }
    st.dx = dx; if (!raf) raf = requestAnimationFrame(paint); });
  const end = e => { if (!st) return; const s0 = st; st = null; if (!s0.drag) return; const b = document.querySelector('.xh-back'); if (b && Math.abs(s0.dx) <= 70){ b.style.transition = 'transform .35s ease, opacity .35s ease'; b.style.transform = ''; b.style.opacity = ''; }
    document.addEventListener('click', ev => { ev.stopPropagation(); ev.preventDefault(); }, {capture:true, once:true});   // a drag is not a tap
    if (Math.abs(s0.dx) > 70) xSwipe(s0.dx < 0 ? 1 : -1, true); else { s0.c.style.transition = 'transform .45s cubic-bezier(.22,1.3,.36,1)'; s0.c.style.transform = ''; } };
  document.addEventListener('pointerup', end); document.addEventListener('pointercancel', end);
  document.addEventListener('keydown', e => { if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && document.activeElement && document.activeElement.closest && document.activeElement.closest('.xhero')) { e.preventDefault(); xSwipe(e.key === 'ArrowRight' ? 1 : -1); setTimeout(() => { const k = document.querySelector('.xh-card'); if (k) k.focus(); }, 300); } });
})();
// v105: photo pages - the floating header turns into a frosted bar once the page scrolls
document.addEventListener('scroll', e => { const b = e.target; if (!b.classList || !b.classList.contains('dpage')) return; const q = b.closest('.quiz'); if (q) q.classList.toggle('dscrolled', b.scrollTop > 140); }, true);
function topicTile(t){ const k = TOPIC_ART[t[1]]; return '<button class="ttile' + (TOPIC_PHOTO[k] ? ' ph' : '') + '" data-a="topic" data-p="' + t[1] + '" style="--art:var(--art-' + k + ')' + (TOPIC_PHOTO[k] ? ';--pos:' + TOPIC_PHOTO[k] + ';--fx:none' : '') + '"><span class="art" aria-hidden="true"></span>' + TOPIC_FX[k] + '<span class="scrim" aria-hidden="true"></span><span class="em" aria-hidden="true">' + t[0] + '</span><span class="go" aria-hidden="true">›</span><span class="tx"><b>' + t[1] + '</b><span class="s">' + t[2] + '</span></span></button>'; }
const xTop = () => S.xs[S.xs.length - 1];
function exploreScreen(){ const t = xTop(); if (!t) return V.XPL(); return V[t.v](t.p); }
V.XPL = () => { const P = S.app ? project() : null, slip = P ? S.goals.filter(g => P.pct[g.id] < 95) : [];
  return {id:'XPL-01', note:'Explore (journey-spec §17 order): what-ifs for slipping goals first (after a plan), Focus on one area (topics that lead to the right expert), tools for you, short videos + live sessions, then Calculators: 6 groups as list rows, 28 calculators. Works before a plan.', head:appHead('Explore', 'Tools, calculators and short videos. Try anything, no plan needed.'),
  html:(slip.length ? '<div class="sec"><h3>What-ifs for your goals</h3></div>' + slip.map(g => '<button class="goal" data-a="gowi" data-p="' + g.id + '"><span class="ic" style="background:var(--' + band(P.pct[g.id]) + '-l)" aria-hidden="true">' + g.e + '</span><span style="flex:1"><b>Try a what-if for ' + esc(g.name.toLowerCase()) + '</b><br><span class="small">' + P.pct[g.id] + '% covered now</span></span><span class="chev" aria-hidden="true">›</span></button>').join('') : '') +
   '<div class="sec"><h3>Focus on one area</h3></div>' + xFeature() +
   '<div class="sec"><h3>Tools for you</h3></div><div class="hstrip">' + toolsForYou().map(toolTile).join('') + '</div>' + watchHTML() +
   '<div class="sec"><h3>Calculators</h3></div>' + CATS.map(c => { const n = CALCS.filter(x => x.cat === c.id).length; return '<button class="goal" data-a="cat" data-p="' + c.id + '"><span class="ic" aria-hidden="true">' + c.em + '</span><span style="flex:1"><b>' + esc(c.name) + '</b><br><span class="small">' + esc(c.blurb) + ' · ' + n + ' tools</span></span><span class="chev" aria-hidden="true">›</span></button>'; }).join('') +
   '<p class="disc">Calculators and videos explain general topics. Figures are illustrative, not a guarantee and not advice.</p>'}; };
/* ================= STATEMENT UPLOADS in Explore (Pensions & Retirement · Home & Mortgage · Investments; Pooja, 1 Oct) =================
   One pattern: card on the category page → verified-account gate (xlsx MASTER D8) → mock reader → "We read these values" (confidence, editable)
   → tools pre-filled with "From your statement" → the same values feed Your finances (never asked twice) → "Uploaded · Replace".
   Fields: [key, label, value, confidence %, unit, optional]. Optional fields (e.g. charges) apply ONLY when shown; a cleared field = not shown. */
const spFromYears = y => y >= RI.sp.fullYears ? 'Expect full' : y >= RI.sp.minYears ? 'Partly' : 'Not sure';
const DOCT = {
  retire:{em:'🌅', what:'pension', title:'Pension benefit statement', date:'Jul 2025', old:true, projToday:'No', text:[['Projection basis', 'Future money (not today\'s money)', 86]], reads:['Pension benefit statement', 'Annual pension statement', 'PRSA statement', 'Employer scheme / Occupational pension statement', 'State Pension record (MyWelfare)'], open:'retirement',
    f:[['pot','Current pension value',72000,95,'€'], ['youM','Your monthly contribution',260,93,'€'], ['empM','Employer monthly contribution',260,91,'€'], ['nra','Normal retirement age on the statement',66,96,'age'], ['proj','Projected value at retirement',722000,84,'€',1], ['chg','Annual charges',1.0,76,'%',1]],
    extra:{t:'🏛️ State Pension record (MyWelfare)', f:[['prsi','State Pension record: PRSI years',28,88,'y']]},
    feed(v, c, put){ put('pension', v.pot, c.pot); put('pensionM', v.youM + v.empM, c.youM == null || c.empM == null ? null : Math.min(c.youM, c.empM)); put('pensionOwnM', v.youM, c.youM); if (v.prsi != null) put('spYears', v.prsi, c.prsi); put('sp', spFromYears(v.prsi), c.prsi); if (v.chg != null) put('penChg', v.chg, c.chg); else removeDoc(['penChg']); return 'pension'; },
    pre(v){ applyAssume(); const age = S.about.age, ra = S.app && retireGoal() ? S.retireAge : v.nra, yrs = S.about.age >= 18 ? Math.max(1, ra - age) : undefined, gr = () => v.chg != null ? {g:+((AS.pen + penTypChg() - v.chg / 100) * 100).toFixed(2)} : {};   // FP round 6: growth after the statement's own charges, same rule as the plan
      return {retirement:Object.assign({pot:v.pot, m:v.youM + v.empM, ra, o:Math.round(AS.sp * ({'Expect full':1, Partly:0.6}[spFromYears(v.prsi)] || 0.8) / 500) * 500}, gr()),
        contrib:Object.assign({y:yrs}, gr()), avc:Object.assign({y:yrs}, gr()), lastmoney:v.proj != null ? {pot:v.proj} : {pot:v.pot}, drawdown:v.proj != null ? {pot:v.proj} : {pot:v.pot}}; }},
  home:{em:'🏡', what:'mortgage', title:'Mortgage statement', date:'Aug 2026', old:false, reads:['Mortgage statement', 'Annual mortgage statement', 'Mortgage offer letter', 'Property valuation', 'LPT record'], open:'repayment',
    f:[['bal','Outstanding balance',203700,96,'€'], ['rate','Interest rate',3.85,94,'%'], ['pay','Monthly repayment',1180,93,'€'], ['yrs','Term remaining',21,90,'y'], ['hval','Property value (from the valuation)',420000,82,'€',1]],
    text:[['Rate type','Fixed until Mar 2028',88], ['Lender','Demo Bank A',97]],
    feed(v, c, put){ put('home', 'Own with mortgage', 99); put('mortBal', v.bal, c.bal); put('mortRate', v.rate, c.rate); put('mortPayM', v.pay, c.pay); put('mortYears', v.yrs, c.yrs); if (v.hval != null) put('homeValue', v.hval, c.hval); return 'liabilities and assets'; },
    pre(v){ return {repayment:{loan:v.bal, rate:v.rate, term:v.yrs}, overpay:{bal:v.bal, rate:v.rate, yrs:v.yrs}, ratechange:{loan:v.bal, rate:v.rate, term:v.yrs}, term:{loan:v.bal, rate:v.rate, a:v.yrs}}; }},
  invest:{em:'📈', what:'investment', title:'Investment statement', date:'Jun 2026', old:false, reads:['Investment / brokerage statement', 'Fund statement', 'Share scheme / ESPP / RSU statement', 'Crypto holdings statement'], open:'regularinvest',
    f:[['tot','Total value',6200,93,'€'], ['mon','Monthly amount invested',150,90,'€'], ['sh','Holdings: shares',70,85,'%',1], ['bo','Holdings: bonds',20,85,'%',1], ['ca','Holdings: cash',10,85,'%',1], ['chg','Annual charges',0.6,80,'%',1]],
    feed(v, c, put){ put('invest', v.tot, c.tot); return 'assets'; },
    pre(v){ const s = v.sh == null ? null : v.sh >= 70 ? 3 : v.sh >= 40 ? 2 : 1;
      return {regularinvest:Object.assign({m:v.mon}, v.chg != null ? {f:v.chg} : {f:0, _notag:['f']}), lumpsum:Object.assign({p:v.tot}, v.chg != null ? {f:v.chg} : {f:0, _notag:['f']}), realreturn:{p:v.tot}, fees:Object.assign({p:v.tot}, v.chg != null ? {a:v.chg} : {a:0, _notag:['a']}), /* no charges on the statement = no default charge */ riskreturn:Object.assign({p:v.tot}, s ? {s} : {})}; }}
};
function pstCard(cat){ const T = DOCT[cat], d = S.pdocs[cat];
  return '<div class="card pst"><b style="font-size:15px">📄 Have ' + (/^[aeiou]/.test(T.what) ? 'an ' : 'a ') + T.what + ' statement? Upload it and we\'ll fill in these tools for you.</b><p class="small" style="margin:6px 0 10px">We can read: ' + T.reads.map(esc).join(' · ') + '.</p>' +
    (d ? '<div class="mini" style="align-items:center"><span>✅ Uploaded: <b>' + esc(d.name) + ' · ' + esc(d.date) + '</b></span><span class="row" style="gap:12px"><button class="link" data-a="pstup" data-p="' + cat + '">Replace statement</button><button class="link" data-a="pstrem" data-p="' + cat + '">Remove statement</button></span></div>' :
    '<div class="grid2"><label class="btn sm" style="width:100%;cursor:pointer">Upload a statement<input type="file" class="sr" data-pfile="' + cat + '" accept=".pdf,.jpg,.jpeg,.png,.heic"></label><button class="btn sm ghost" style="width:100%" data-a="pstup" data-p="' + cat + '">Use a sample statement</button></div>') +
    (verified() ? '' : '<p class="small" style="margin:8px 0 0">🔐 First we\'ll secure your account (email and mobile code), so your documents stay private.</p>') + '</div>'; }
const DOC_HIDDEN = {liab:['cardRate','loanRate'], pension:['penChg', 'spYears']};   // statement figures with no field of their own in Your finances
function pstRemove(cat){ const d = S.pdocs[cat]; if (!d) return; const ids = Object.keys(DOCT[cat].pre(d.v));
  removeDoc(Object.keys(S.docOf || {}).filter(k => S.docOf[k] === 'pst:' + cat)); delete S.pdocs[cat];
  ids.forEach(id => { if (S.calcDoc) delete S.calcDoc[id]; if (S.calcSrc) delete S.calcSrc[id]; if (S.calcT) delete S.calcT[id]; }); }
function pstStart(cat, files){ files = files || [DOCT[cat].title + ' · ' + DOCT[cat].date + '.pdf'];
  if (!verified()){ S.after = {k:'pst', cat, files, scr:S.scr}; S.scr = 'P1'; S.xs.push({v:'ACCT'}); lastId = null; render(); return; }
  S.pst = {cat, stage:'scan', files, edit:{}}; S.xs = S.xs.filter(x => x.v !== 'ACCT' && x.v !== 'PST'); S.xs.push({v:'PST'}); lastId = null; render();
  setTimeout(() => { if (S.pst && S.pst.stage === 'scan'){ S.pst.stage = 'confirm'; render(); } }, RM() ? 200 : 1400); }
V.ACCT = () => { const v = V[/^P1[EKS]?$/.test(S.scr) ? S.scr : 'P1'](); v.note = 'Upload gate (xlsx MASTER D8): ' + v.note; return v; };
V.PST = () => { const u = S.pst; if (!u) return V.XPL(); const T = DOCT[u.cat];
  if (u.stage === 'scan') return {id:'PST-scan', note:'Reading your ' + T.what + ' statement (mock document reader).', head:appHead('Reading your statement…', esc(u.files.join(', ')), 'xback'), html:'<div class="scan" aria-hidden="true">📄</div><p class="sub" style="text-align:center;margin-top:14px" role="status">Finding your ' + T.what + ' figures</p>'};
  const row = ([k, l, v, c, unit, opt]) => '<div class="mini" style="align-items:center"><span style="flex:1"><b style="font-size:14px">' + esc(l) + (unit === '%' ? ' (%)' : '') + '</b><br>' + (c < 80 ? '<span class="tag look">⚠️ Check this · ' + c + '% sure</span>' : '<span class="tag doc">✓ ' + c + '% sure</span>') + (opt ? ' <span class="small">If shown · clear it if not</span>' : '') + '</span><input class="in" style="width:110px;min-height:42px" inputmode="decimal" data-pv="' + k + '" value="' + (u.edit[k] != null ? u.edit[k] : v) + '" aria-label="' + esc(l) + '"></div>';
  return {id:'PST-confirm', note:'"We read these values, please confirm" (' + T.what + '): confidence tags, editable values, statement date + old flag. Optional values (charges, projection, holdings, valuation) apply only if shown. Feeds the tools and Your finances.', head:appHead('We read these values', 'Please confirm. Change anything that looks wrong.', 'xback'),
    html:'<div class="card"><b>' + T.em + ' ' + esc(T.title) + '</b><div class="small">' + esc(u.files.join(', ')) + '</div>' + T.f.map(row).join('') + (T.text || []).map(([l, v, c]) => '<div class="mini"><span><b style="font-size:14px">' + esc(l) + '</b><br><span class="tag doc">✓ ' + c + '% sure</span></span><b>' + esc(v) + '</b></div>').join('') +
      '<div class="mini"><span><b style="font-size:14px">Statement date</b><br>' + (T.old ? '<span class="tag est">Statement is over 12 months old</span>' : '') + '</span><b>' + T.date + '</b></div></div>' +
      (T.extra ? '<div class="card"><b>' + T.extra.t + '</b>' + T.extra.f.map(row).join('') + '<div class="mini"><span>Expected State Pension</span><b id="pst-sp">' + spFromYears(+(u.edit.prsi != null ? u.edit.prsi : 28)) + '</b></div><p class="small" style="margin:4px 0 0">' + LAW.sp + ' Check your record on MyWelfare.</p></div>' : '') +
      '<p class="disc">These also go into Your finances, so we won\'t ask for them again.</p>',
    foot:'<button class="btn" data-a="pstok">Looks right, fill in my tools</button><button class="btn ghost" data-a="xback">Cancel</button>'}; };
function pstConfirm(){ const u = S.pst, T = DOCT[u.cat], all = T.f.concat(T.extra ? T.extra.f : []), v = {}, c = {};
  all.forEach(([k, l, d, cf, unit, opt]) => { const e = u.edit[k]; if (e != null && String(e).trim() === ''){ v[k] = opt ? null : d; c[k] = opt ? null : cf; return; }   // cleared optional field = not on the statement
    const x = e != null && !isNaN(+e) ? +e : d; v[k] = x; c[k] = e != null && +e !== d ? null : cf; });
  const put = (k, x, cf) => { delete S.look[k]; setDoc(k, x, cf, cf == null, 'pst:' + u.cat); };   // FP round 6: corrected values stay statement figures
  const where = T.feed(v, c, put); if (T.old && u.cat === 'retire') S.look.pension = 'Statement is over 12 months old';
  if (T.projToday) v.projToday = T.projToday;   // the reader's "projection is in today's money?" flag (workbook C12)
  S.pdocs[u.cat] = {name:T.title, date:T.date, v};
  const pre = T.pre(v); S.calcSrc = S.calcSrc || {};
  S.calcDoc = S.calcDoc || {}; S.calcT = S.calcT || {};
  Object.entries(pre).forEach(([id, vals]) => { const cc = C(id), ins = cc.inputs.concat(cc.wi || []), keep = {}; S.calcSrc[id] = []; S.calcT[id] = {};   // a new statement resets the tool to the statement
    Object.entries(vals).forEach(([k, x]) => { if (k === '_notag' || x == null || !ins.find(y => y.k === k)) return; keep[k] = x; if (!(vals._notag || []).includes(k)) S.calcSrc[id].push(k); }); S.calcDoc[id] = keep; calcVals(cc); });
  S.pst = null; S.xs = [{v:'XCAT', p:u.cat}, {v:'CALC', p:T.open}]; lastId = null; render();
  toast(S.app ? 'Added to your plan too (' + where + ')' : 'Saved. Your plan will use it when you make it'); }
const aExp = k => { const x = EXPERT_FOR[k].toLowerCase(); return (/^[aeiou]/.test(x) ? 'an ' : 'a ') + x; };
const TOPIC_TOOLS = {Mortgages:['repayment','borrow','overpay','deposit'], Pensions:['retirement','contrib','lastmoney'], Protection:['lifecover','incomegap','mortgageprotect'], Investing:['regularinvest','lumpsum','realreturn','fees'], Savings:['goalplanner','emergency','compound'], 'Everyday money':['budget','surplus','debtpay']};

/* ================= MORTGAGES TOPIC PAGE (Pooja, 15 Oct 2026) ================= */
const MP_SIT = [['Buying','🏡'], ['Switching','🔄'], ['Borrowing more','➕']];
const MP_CAL = {borrow:['Borrow','house-for-sale','borrow','🏡','#0A7068'], repay:['Repayment','home-keys','repayment','🧾','#0B2545'], deposit:['Deposit','savings-jar','deposit','🐷','#5E548E'], overpay:['Overpay','money-plant','overpay','⏩','#13315C'], rate:['Rate change','invest-charts','ratechange','📊','#A8432B'], term:['Term','couple-planning','term','⚖️','#0A7068'], rent:['Rent vs buy','family-couch','rentbuy','🔄','#5E548E'], topup:['Top-up','car-key','repayment','🧾','#0B2545']};
const MP_TOPUPNAME = 'Repayment with a top-up';
const MP_DATA = [
 {c:['borrow','deposit','repay','rent','term','rate','overpay'],
  v:[{s:'Deposit to keys', t:'Your first home: deposit to keys', d:'0:53', bg:'#0A7068', ic:'🔑', cl:'deposit', ch:['Deposit','Costs','Schemes'], vid:'v1'},
     {s:'How much can I borrow?', t:'How much can I borrow? A first-time buyer’s guide', d:'2:56', bg:'#0B2545', ic:'🏡', cl:'borrow', ch:['The limit','Deposit','Repayments'], vid:'v9'},
     {s:'Help to Buy 2027', t:'Help to Buy: what changed for 2027', d:'1:20', bg:'#5E548E', ic:'🎁', cl:'deposit', ch:['The change','Who gains','How to claim']},
     {s:'Fixed or variable?', t:'Fixed or variable: which suits you?', d:'1:05', bg:'#13315C', ic:'🔒', cl:'ratechange', ch:['Fixed','Variable','Choosing']}],
  r:[['Articles','Help to Buy and First Home Scheme: 2027','📄'], ['FAQs','Can I get help with my deposit?','❓'], ['Links','Help to Buy on Revenue','🔗']],
  l:[['Thu 7pm','First-time buyers: your questions answered'], ['Tue 1pm','Help to Buy and First Home Scheme in 20 minutes']]},
 {c:['rate','repay','overpay','term','borrow','deposit','rent'],
  v:[{s:'Should I switch?', t:'Should I switch my mortgage?', d:'1:30', bg:'#A8432B', ic:'🔄', cl:'ratechange', ch:['Why switch','Costs','Steps']},
     {s:'Fixed rate ending', t:'Your fixed rate is ending: what now?', d:'1:00', bg:'#0B2545', ic:'📅', cl:'ratechange', ch:['Timing','Your lender','Compare']},
     {s:'Tax credit', t:'Are you owed the mortgage interest tax credit?', d:'0:55', bg:'#0A7068', ic:'🧾', cl:'repayment', ch:['Who qualifies','How much','How to claim']},
     {s:'Overpaying', t:'Is it worth overpaying my mortgage?', d:'1:15', bg:'#13315C', ic:'⏩', cl:'overpay', ch:['How it works','Limits','Or pension?']}],
  r:[['Articles','Are you owed the mortgage interest tax credit?','📄'], ['FAQs','My fixed rate is ending: should I switch?','❓'], ['Links','CCPC mortgage comparison','🔗']],
  l:[['Wed 1pm','Switching in 2026: is now the time?'], ['Mon 7pm','Fixed rate ending? Ask us anything']]},
 {c:['topup','term','overpay','rate','borrow','deposit','rent'],
  v:[{s:'Top-up costs', t:'What a top-up really costs', d:'1:10', bg:'#0B2545', ic:'🔨', cl:'repayment', ch:['How it works','Monthly','Total cost']},
     {s:'Top-up or loan?', t:'Top-up, loan or savings?', d:'1:05', bg:'#A8432B', ic:'⚖️', cl:'term', ch:['Rates','Terms','Choosing']},
     {s:'Helping your child', t:'Helping your child buy a home', d:'1:20', bg:'#5E548E', ic:'🤝', cl:'repayment', ch:['Gifts','Lenders','Your plan']}],
  r:[['Articles','Helping your child buy a home','📄'], ['FAQs','Can I borrow against my home?','❓'], ['Links','CCPC: mortgage top-up','🔗']],
  l:[['Sat 11am','Extensions and top-ups: what to know']]}];
const MPQ = () => { S.mps = S.mps || 0; S.mpv = S.mpv || 0; S.mpd = S.mpd || {}; S.mpseat = S.mpseat || {}; return MP_DATA[S.mps]; };
const mpPhoto = n => 'media/' + n + '.jpg';
function expertFab(type){ return '<button class="btn xfab" id="xfab" data-a="xfab" data-p="' + type + '" aria-haspopup="dialog"><span aria-hidden="true">💬</span><span class="tx">Talk to ' + aExp(type) + '</span></button>'; }
function expertSheet(type){ const nm = EXPERT_FOR[type];
  return '<div class="xsh"><div class="xwho"><span class="av" aria-hidden="true">' + (type === 'mortgage' ? 'MS' : nm[0]) + '</span><div><h2 class="t" style="margin:0;font-size:20px">' + (type === 'mortgage' ? 'MortgageStop broker' : esc(nm)) + '</h2><div class="small">QFA · Regulated by the Central Bank</div></div></div><span class="xtag">First call free</span>' +
   [['📞','Call me back','Usually within 2 hours','call'], ['📹','Book a video call','Pick a time that suits you','video'], ['✉️','Send a message','Reply within one working day','msg']].map(o => '<button class="xo" data-a="xcontact" data-p="' + type + '|' + o[3] + '"><span class="e" aria-hidden="true">' + o[0] + '</span><span><b>' + o[1] + '</b><small>' + o[2] + '</small></span></button>').join('') +
   '<p class="small" style="margin:12px 0 0">🔒 You choose what to share before anyone sees your plan.</p></div>'; }
function mpVideoBlock(){ const d = MPQ(), v = d.v[S.mpv], real = v.vid && VID(v.vid) && VID(v.vid).src ? VID(v.vid) : null, c = C(v.cl);
  const stage = real ? '<div class="mp-st real" style="--c:' + v.bg + '">' + videoReal(real).replace('class="player real"', 'class="mpplayer"') + '</div>'
    : '<div class="mp-st" style="--c:' + v.bg + '"><span class="art" aria-hidden="true">' + v.ic + '</span><div class="tp">Video ' + (S.mpv + 1) + ' of ' + d.v.length + ' · ' + v.d + '</div><h4>' + esc(v.t) + '</h4><span class="soon">Coming soon</span></div>';
  return stage + '<p class="mp-cap" id="mp-cap" aria-live="polite">' + (real ? '' : 'We are filming this one. Check back soon.') + '</p>' +
   '<div class="mp-chap" id="mp-chap" aria-label="Chapters">' + v.ch.map((x, j) => '<span' + (j ? '' : ' class="on"') + '>' + esc(x) + '</span>').join('') + '</div>' +
   '<div class="mp-next" id="mp-next"' + (real ? ' hidden' : '') + '><span>Up next: try it with your numbers</span><button class="btn sm" data-a="calc" data-p="' + v.cl + '">' + esc(c.name) + ' →</button></div>'; }
V.MORT = () => { const d = MPQ(), t = TOPICS.find(x => x[1] === 'Mortgages'), pd = S.pdocs.home, ncal = d.c.length, open = S.mpc && d.c.includes(S.mpc) ? S.mpc : d.c[0];
  const doneN = d.v.filter((_, i) => S.mpd[S.mps + '-' + i]).length;
  return {id:'XPL-TOPIC', note:'Mortgages topic page (Pooja, 15 Oct): your situation, upload, all 7 calculators as expanding cards, story videos, read and ask, live sessions, and a floating expert button.', head:'',
  html:'<div class="mp"><div class="dhero2" style="--art:var(--art-mortgage);--pos:' + TOPIC_PHOTO.mortgage + '"><span class="art" aria-hidden="true"></span><button class="dcirc" data-a="xback" aria-label="Back">‹</button></div>' +
   '<div class="dsheet2"><span class="dgrab" aria-hidden="true"></span><h2 class="t" tabindex="-1" style="margin:0">Mortgages</h2><div class="small" style="margin-top:4px">' + esc(t[2]) + '</div></div>' +
   '<div class="mp-sit" role="group" aria-label="Your situation">' + MP_SIT.map((x, i) => '<button data-a="mpsit" data-p="' + i + '" aria-pressed="' + (i === S.mps) + '">' + x[0] + '</button>').join('') + '</div>' +
   '<nav class="mp-jump" aria-label="On this page">' + [['mp-calc','Calculators'], ['mp-watch','Watch'], ['mp-read','Read'], ['mp-live','Live']].map(j => '<button data-a="mpjump" data-p="' + j[0] + '">' + j[1] + '</button>').join('') + '</nav>' +
   (S.mps === 0 ? eligCard() : '') +

   '<div class="mp-sec" id="mp-calc"><h3>Calculators for you</h3><span>' + ncal + ' of ' + ncal + '</span></div><div class="mp-grid">' + d.c.map((id, i) => { const m = MP_CAL[id], nm = id === 'topup' ? MP_TOPUPNAME : C(m[2]).name;
      return '<button class="mp-gc' + (i === 0 ? ' big' : '') + '" data-a="calc" data-p="' + m[2] + '" aria-label="' + esc(m[0]) + ': ' + esc(nm) + '"><span class="gc-ph" style="background-image:url(\'' + mpPhoto(m[1]) + '\')" aria-hidden="true"></span><span class="gc-e" aria-hidden="true">' + m[3] + '</span><span class="gc-tx"><b>' + esc(m[0]) + '</b><small>' + esc(nm) + '</small></span><span class="gc-go" aria-hidden="true">→</span></button>'; }).join('') + '</div>' +
   '<div class="mp-sec" id="mp-watch"><h3>Watch</h3><span id="mp-wc">' + doneN + ' of ' + d.v.length + ' watched</span></div><div class="mp-bub mp-vrow" role="group" aria-label="Videos">' + d.v.map((v, i) => { const rv = v.vid && VID(v.vid), pst = (rv && rv.poster) || mpPhoto(['home-keys', 'house-for-sale', 'money-plant', 'invest-charts', 'couple-planning'][i % 5]), done = S.mpd[S.mps + '-' + i];
      return '<button class="mp-bu mp-vc' + (i === S.mpv ? ' cur' : '') + (done ? ' done' : '') + '" data-a="mpvid" data-p="' + i + '" aria-label="' + esc(v.t) + (done ? ', watched' : '') + '"' + (i === S.mpv ? ' aria-current="true"' : '') + '><span class="vc-art" style="--c:' + v.bg + (pst ? ';background-image:linear-gradient(180deg,rgba(0,0,0,0) 40%,rgba(0,0,0,.45)),url(' + pst + ')' : '') + '">' + (rv && rv.poster ? '' : '<i class="vc-badge" aria-hidden="true">' + v.ic + '</i>') + '<span class="vc-play" aria-hidden="true">' + (i === S.mpv ? '●' : '▶') + '</span>' + (v.d ? '<span class="vc-d">' + esc(v.d) + '</span>' : '') + '<b class="vc-ok" aria-hidden="true">✓</b></span><span class="vc-t">' + esc(v.s) + '</span>' + (i === S.mpv ? '<span class="vc-now">Now playing</span>' : '') + '</button>'; }).join('') + '</div><div id="mp-player">' + mpVideoBlock() + '</div>' +
   '<div class="mp-sec" id="mp-read"><h3>Read and ask</h3></div><div class="mp-rd rd3" role="group" aria-label="Read and ask">' + d.r.map((x, i) => '<button class="rd-c' + (S.mprd === i ? ' on' : '') + '" data-a="mprd" data-p="' + i + '" aria-expanded="' + (S.mprd === i) + '"><span class="rd-ic rd-ph" style="background-image:url(' + mpPhoto(['home-keys', 'savings-jar', 'invest-charts'][i % 3]) + ')" aria-hidden="true"><i>' + x[2] + '</i></span><span class="rd-body"><small>' + esc(x[0]) + '</small><b>' + esc(x[1]) + '</b><span class="rd-more">' + (S.mprd === i ? 'Hide' : 'Read more') + ' <i aria-hidden="true">' + (S.mprd === i ? '↑' : '→') + '</i></span></span></button>').join('') + '</div>' +
   (S.mprd != null && d.r[S.mprd] ? '<div class="rd-panel" role="region" aria-label="' + esc(d.r[S.mprd][0]) + '"><b>' + esc(d.r[S.mprd][1]) + '</b><p>TODO: content to come from docs/content/mortgage/ (not added yet).</p></div>' : '') +
   '<div class="mp-sec" id="mp-live"><h3>Live sessions</h3><span>Free · ask experts live</span></div>' + d.l.map((x, i) => { const k = S.mps + '-' + i, on = !!S.mpseat[k], [dd, ...tt] = x[0].split(' ');
      return '<div class="card lv3"><span class="lv2-d" aria-hidden="true"><small>' + esc(dd) + '</small><b>' + esc(tt.join(' ')) + '</b></span><span class="lv3-m"><b>' + esc(x[1]) + '</b><small><i class="lv3-dot" aria-hidden="true"></i>Live · free · with a mortgage broker</small></span><button class="mp-seat" data-a="mpseat" data-p="' + k + '" aria-pressed="' + on + '">' + (on ? '✓ Seat saved' : 'Save seat') + '</button></div>'; }).join('') +
   '<p class="disc">Topics explain general ideas. They are not advice.</p></div>' + expertFab('mortgage')}; };
/* after every render of the Mortgages page: the floating button shrinks while scrolling and grows back, hides for the keyboard and full screen video; the real video drives chapters, captions-line and Up next */
let mpCleanup = null;
function mpAfter(){ if (mpCleanup){ mpCleanup(); mpCleanup = null; } const sc = document.querySelector('#screen .scroll'), fab = document.getElementById('xfab'); if (!sc || !fab) return;
  let last = sc.scrollTop, tm = null; const onS = () => { const y = sc.scrollTop; fab.classList.remove('mini'); /* v110: the expert button stays full size and pinned */ last = y; clearTimeout(tm); tm = setTimeout(() => fab.classList.remove('mini'), 900); };
  sc.addEventListener('scroll', onS, {passive:true});
  const hide = () => { const kb = document.activeElement && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) && document.activeElement.type !== 'file', fs = !!document.fullscreenElement || !!document.webkitFullscreenElement; fab.classList.toggle('hid', kb || fs); };
  document.addEventListener('focusin', hide); document.addEventListener('focusout', () => setTimeout(hide, 50)); document.addEventListener('fullscreenchange', hide); document.addEventListener('webkitfullscreenchange', hide);
  const vv = window.visualViewport, onV = () => { if (vv) fab.classList.toggle('hid', vv.height < innerHeight * .75); }; if (vv) vv.addEventListener('resize', onV);
  const el = document.getElementById('vid-el'), d = MPQ(), v = d.v[S.mpv];
  if (el){ const ch = [...document.querySelectorAll('#mp-chap span')], nx = document.getElementById('mp-next'), cap = document.getElementById('mp-cap'), tr = () => { const q = el.textTracks && el.textTracks[0]; if (q){ q.mode = 'hidden'; q.oncuechange = () => { const c = q.activeCues && q.activeCues[0]; cap.textContent = c ? c.text.replace(/<[^>]+>/g, '') : ''; }; } };
    el.addEventListener('loadedmetadata', tr); tr();
    el.addEventListener('timeupdate', () => { const f = el.duration ? el.currentTime / el.duration : 0, ci = Math.min(ch.length - 1, Math.floor(f * ch.length)); ch.forEach((c, j) => c.classList.toggle('on', j === ci)); if (f > .65 && nx) nx.hidden = false; });
    el.addEventListener('ended', () => { S.mpd[S.mps + '-' + S.mpv] = true; if (nx) nx.hidden = false; const wc = document.getElementById('mp-wc'); if (wc) wc.textContent = d.v.filter((_, i) => S.mpd[S.mps + '-' + i]).length + ' of ' + d.v.length + ' watched'; const b = document.querySelector('.mp-bu[data-p="' + S.mpv + '"]'); if (b) b.classList.add('done'); }); }
  mpCleanup = () => { sc.removeEventListener('scroll', onS); document.removeEventListener('focusin', hide); document.removeEventListener('fullscreenchange', hide); document.removeEventListener('webkitfullscreenchange', hide); if (vv) vv.removeEventListener('resize', onV); clearTimeout(tm); };
}
V.XTOPIC = p => { if (p === 'Mortgages') return V.MORT(); const t = TOPICS.find(x => x[1] === p), tools = (TOPIC_TOOLS[p] || []).map(C).filter(Boolean), live = LIVE.filter(x => x[2] === t[3]);
  return {id:'XPL-TOPIC', note:'Topic page (Pooja, 1 Oct): actions first, then videos. (a) Try the calculator (2–4 most relevant), (b) Talk to the matching expert, (c) Upload a statement where it applies, (d) videos and live sessions.', head:'',
  foot:'<button class="btn" data-a="expertfor" data-p="' + t[3] + '">Talk to ' + aExp(t[3]) + '</button>',
  html:'<div class="dhero2" style="--art:var(--art-' + TOPIC_ART[t[1]] + ')' + (TOPIC_PHOTO[TOPIC_ART[t[1]]] ? ';--pos:' + TOPIC_PHOTO[TOPIC_ART[t[1]]] : '') + '"><span class="art" aria-hidden="true"></span><button class="dcirc" data-a="xback" aria-label="Back">‹</button></div>' +
   '<div class="dsheet2"><span class="dgrab" aria-hidden="true"></span><div class="row" style="justify-content:space-between;align-items:flex-start"><div><h2 class="t" tabindex="-1" style="margin:0">' + t[1] + '</h2><div class="small" style="margin-top:4px">' + t[0] + ' Focus area</div></div></div><div class="dstats"><div><small>Tools</small><b>' + tools.length + '</b></div><div><small>Videos</small><b>' + VIDEOS.filter(v => v.kind === t[3]).length + '</b></div><div><small>Expert</small><b>' + ({planner:'Planner'}[t[3]] || EXPERT_FOR[t[3]].split(' ')[0]) + '</b></div></div><p class="sub" style="margin:12px 0 0">' + esc(t[2]) + '. Try a calculator, watch a short video, or talk to ' + aExp(t[3]) + '.</p></div>' +
   '<div class="sec"><h3>Try the calculator</h3></div>' + tools.map(c => '<button class="goal" data-a="calc" data-p="' + c.id + '"><span class="ic" aria-hidden="true">' + c.em + '</span><span style="flex:1"><b>' + esc(c.name) + '</b><br><span class="small">' + esc(c.q) + '</span></span><span class="chev" aria-hidden="true">›</span></button>').join('') +
      (DOCT[t[4]] ? '<button class="link" style="font-size:15px;display:block" data-a="cat" data-p="' + t[4] + '">📄 ' + (S.pdocs[t[4]] ? 'Your ' + DOCT[t[4]].what + ' statement is uploaded · see it' : 'Upload ' + (/^[aeiou]/.test(DOCT[t[4]].what) ? 'an ' : 'a ') + DOCT[t[4]].what + ' statement to fill in these tools') + ' →</button>' : '') +
   (VIDEOS.some(v => v.kind === t[3]) ? '<div class="sec"><h3>Watch</h3></div><div class="hstrip">' + VIDEOS.filter(v => v.kind === t[3]).map(v => vThumb(v)).join('') + '</div>' : '') +
   (live.length ? live.map(x => liveCard(x, 'With a ' + EXPERT_FOR[x[2]].toLowerCase(), 'margin-top:8px')).join('') : '') +
   '<p class="disc">Topics explain general ideas. They are not advice.</p>'}; };
V.XCAT = p => { const c = CATS.find(x => x.id === p); return {id:'XPL-CAT', note:'Tools in one life-need group.' + (DOCT[p] ? ' Statement upload card at the top (gated by a verified account).' : ''), head:appHead(c.em + ' ' + esc(c.name), esc(c.blurb), 'xback'),
  html:(DOCT[p] ? pstCard(p) : '') +CALCS.filter(x => x.cat === p).map(x => '<button class="goal" data-a="calc" data-p="' + x.id + '"><span class="ic" aria-hidden="true">' + x.em + '</span><span style="flex:1"><b>' + esc(x.name) + '</b><br><span class="small">' + esc(x.q) + '</span></span><span class="chev" aria-hidden="true">›</span></button>').join('')}; };
V.CALC = p => { const c = C(p), v = calcVals(c);
  return {id:'CALC-' + p, note:'Calculator (Lifecast): pre-filled from what you told us, live result, what-if sliders. "Add to my plan" adds a goal after a confirm step.', head:appHead(c.em + ' ' + esc(c.name), esc(c.q) + (c.tip ? '<span class="note" style="display:block;margin-top:8px">💡 ' + esc(c.tip) + '</span>' : ''), 'xback'),
  html:'<div class="note" id="exlab" role="note"' + (calcIsExample(c) ? '' : ' hidden') + ' style="margin:0 0 10px;font-weight:800">' + EX_LABEL + '</div><div class="eyebrow" style="margin:2px 0 8px">' + esc(CATS.find(x => x.id === c.cat).name) + '</div>' + (ADJ_TOOLS.includes(c.id) ? '<div class="adjrow"><button class="chip sm' + ((S.adjInfl || {})[c.id] ? ' sel' : '') + '" role="switch" aria-checked="' + !!(S.adjInfl || {})[c.id] + '" data-a="adjinfl" data-p="' + c.id + '">' + ((S.adjInfl || {})[c.id] ? '✓ ' : '') + 'Adjust for inflation</button><span class="small">Show the result in today\'s money</span></div>' : '') +
    (INFL_TOOLS.includes(c.id) && (!ADJ_TOOLS.includes(c.id) || (S.adjInfl || {})[c.id]) && (!inflSet() || S.inflEdit) ? '<div class="card" style="margin-bottom:12px">' + inflChoice('calc') + '</div>' : '') + '<div class="card" style="margin-bottom:12px">' + c.inputs.map(i => fieldR(i, v[i.k], (S.calcSrc || {})[p], c.id)).join('') + '</div>' + calcAsmBlock(c) + '<div id="cout" aria-live="polite">' + calcOut(c) + '</div>' + (INFL_TOOLS.includes(c.id) && inflSet() && !S.inflEdit && (!ADJ_TOOLS.includes(c.id) || (S.adjInfl || {})[c.id]) ? '<p class="small" style="margin:8px 2px 0">Prices rising ' + inflTxt() + ' (your choice) · <button class="link" style="padding:0;font-size:13px" data-a="infledit">Change</button></p>' : '') +
   (c.wi ? '<div class="card" style="margin-top:12px;border:1.5px dashed #B9C9D6;box-shadow:none"><b>What if…</b>' + c.wi.map(i => fieldR(i, v[i.k], (S.calcSrc || {})[p], c.id)).join('') + '</div>' : '') +
   '<div class="grid2" style="margin-top:12px"><button class="btn sm" style="width:100%" data-a="calcadd" data-p="' + p + '">＋ Add to my plan</button><button class="btn sm ghost" style="width:100%" data-a="expertfor" data-p="' + ({home:'mortgage', retire:'pension', protect:'protection', invest:'investment'}[c.cat] || 'planner') + '">Ask an expert</button></div><p class="disc">Illustrative figures, not a guarantee and not advice.</p>'}; };
V.VIDS = () => { const f = S.vf || 'all', list = VIDEOS.filter(v => f === 'all' || v.kind === f);
  return {id:'VID-00', note:'Video library (Lifecast): short explainers filtered by topic, plus live expert sessions. Every video links to a tool and an expert.', head:appHead('Watch', 'Short videos and live sessions with experts.', 'xback'),
  html:'<div class="chips wchips" role="group" aria-label="Filter videos">' + [['all','All']].concat(Object.entries(VKIND)).map(k => '<button class="chip sm' + (f === k[0] ? ' sel' : '') + '" aria-pressed="' + (f === k[0]) + '" data-a="vfilter" data-p="' + k[0] + '">' + k[1] + '</button>').join('') + '</div>' +
   (list.length ? (v => '<button class="vfeat" data-a="video" data-p="' + v.id + '" style="--vart:var(--art-' + (v.art || 'savings') + ')"><span class="vf-tag">Featured · ' + (v.dur || v.mins + ' min') + '</span><span class="vf-play" aria-hidden="true">▶</span><span class="vf-b"><small>' + (VKIND[v.kind] || 'Video') + '</small><b>' + esc(v.t) + '</b><span>' + esc(v.who.split(' · ')[1]) + '</span></span></button>')(list[0]) : '') +
   (list.length > 1 ? '<div class="sec"><h3>More to watch</h3><span class="small">' + (list.length - 1) + ' videos</span></div><div class="vlist">' + list.slice(1).map(v => vThumb(v, true)).join('') + '</div>' : '') +
   '<div class="sec"><h3>Live with experts</h3></div>' + LIVE.map(x => liveCard(x, 'Ask questions in the chat', 'margin-bottom:8px')).join('')}; };
/* §25: the two real videos (MP4, H.264 + AAC) are loaded from media/ by relative path, never embedded. Native controls (play/pause, seek, volume, full screen) are keyboard accessible.
   There are no captions for these files yet: the page says so. If the file can't load or play, a clear message replaces the blank player (with Try again). */
const VID_FAIL = 'This video can\'t play right now. Check your connection, or that the media folder is next to this page, then try again.';
function videoReal(v){ return '<div class="player real" data-vwrap="' + v.id + '"><video id="vid-el" data-vid="' + v.id + '" controls preload="metadata" playsinline poster="' + esc(v.poster) + '" src="' + esc(v.src) + '" aria-label="' + esc(v.t) + '" aria-describedby="vid-cap">' + (v.vtt ? '<track kind="captions" srclang="en" label="English" src="' + esc(v.vtt) + '" default>' : '') + '</video>' +
  '<div class="vfail" id="vid-fail" role="alert" hidden><b>' + VID_FAIL + '</b><button class="btn sm" data-a="vretry" data-p="' + v.id + '" style="margin-top:8px">Try again</button></div></div>'; }
document.addEventListener('error', e => { const el = e.target; if (!el || el.tagName !== 'VIDEO' || !el.dataset.vid) return; const had = document.activeElement === el; el.hidden = true; const f = document.getElementById('vid-fail'); if (f){ f.hidden = false; if (had){ const rb = f.querySelector('button'); if (rb) rb.focus(); } } }, true);
V.VID = id => { const v = VID(id), c = C(v.tool), g = S.goals.find(x => x.spec === v.kind && x.kind !== 'retire') || (v.kind === 'pension' ? retireGoal() : null), P = S.app && g && planReady() ? project() : null, next = VIDEOS.filter(x => x.id !== id).slice(0, 3);
  return {id:'VID-01', note:'Video player (Lifecast): captions on by default, transcript. Under the video: why it was picked, the matching tool (pre-filled) and an expert door.', head:appHead('Watch', '', 'xback'),
  html:(v.src ? videoReal(v) : '<div class="player vp2' + (S.play ? ' on' : '') + '" style="--vart:var(--art-' + ({pension:'pension', mortgage:'mortgage', protection:'protection', investing:'investing', savings:'savings'}[v.kind] || v.art || 'savings') + ')"><button class="play" data-a="vplay" aria-label="' + (S.play ? 'Pause' : 'Play') + '">' + (S.play ? '❚❚' : '▶') + '</button>' + (S.play ? '<div class="cc">' + esc(v.cc) + '</div>' : '') + '<div class="ctl" aria-hidden="true"><span>' + (S.play ? '0:14' : '0:00') + '</span><span class="tr"><i></i></span><span>' + v.mins + ':00</span><span>CC</span><span>1×</span></div></div>') +
   '<div class="vm2"><span class="vm2-k">' + VKIND[v.kind] + '</span><h2 class="t" tabindex="-1">' + esc(v.t) + '</h2><div class="vm2-who"><span class="vm2-av" aria-hidden="true">' + esc(String(v.who).trim()[0]) + '</span><span><b>' + esc(String(v.who).split(' · ')[0]) + '</b><small>' + esc(String(v.who).split(' · ')[1] || '') + '</small></span><span class="vm2-d">⏱ ' + (v.dur || v.mins + ' min') + '</span></div></div>' +
   (P ? '<div class="card" style="margin-top:12px;background:var(--sea-l)"><b style="font-size:14px">Why this is for you</b><div style="font-size:14px;margin-top:4px">Your ' + esc(g.name.toLowerCase()) + ' goal is ' + P.pct[g.id] + '% covered. This video explains the basics.</div></div>' : '') +
   '<button class="vt2" data-a="calc" data-p="' + v.tool + '"><span class="vt2-i" aria-hidden="true">' + c.em + '</span><span class="vt2-m"><small>Try the calculator</small><b>' + esc(c.name) + '</b></span><span class="vt2-go" aria-hidden="true">→</span></button>' +
   '<div class="va2"><button class="va2-b" data-a="expertfor" data-p="' + v.kind + '"><span aria-hidden="true">💬</span> Ask an expert</button><button class="va2-b" data-a="toast" data-p="Saved to watch later"><span aria-hidden="true">🔖</span> Save for later</button></div>' +
   (v.src ? (v.vtt ? '<p class="small" id="vid-cap" style="margin:12px 0 0">Captions are on. Use the CC button on the player to turn them off.</p><details class="card asmg wigrow" style="margin-top:12px"><summary>Transcript</summary><p style="font-size:14px;line-height:1.55;margin:8px 0 0">' + esc(v.transcript) + '</p></details>' : '<p class="small" id="vid-cap" style="margin:12px 0 0"><b>Captions not available yet.</b> A transcript will be added. If you can\'t listen, talk to an expert or try the calculator above.</p>') : '<details class="card asmg wigrow" style="margin-top:12px"><summary>Transcript</summary><p style="font-size:14px;line-height:1.55;margin:8px 0 0">' + esc(v.cc) + ' [Full transcript appears here.]</p></details>') +
   '<div class="sec"><h3>Up next</h3></div><div class="hstrip">' + next.map(x => vThumb(x)).join('') + '</div><p class="disc">Videos explain general topics. They are not personal advice.</p>'}; };

/* ================= HOME (light dashboard, Pooja Q1) ================= */
/* ================= YOUR FINANCIAL FOUNDATIONS (hierarchy of needs; from LifeGoals 2.0, Pooja 1 Oct) =================
   Five levels, bottom to top. Status from the customer's real data (data precedence via S.fin / S.src / finNums / project).
   st: 'ok' teal (solid) · 'mid' gold (in progress) · 'bad' coral (needs attention) · 'na' grey (not started / add data). */
const fndT = () => (applyAssume(), SAVE.buffer);
/* v3.0: the one emergency-fund figure used everywhere (cushion tile, foundations, calculator, goal, report): easy-access cash / essential spending a month.
   Before figures are given it comes from the Q7 answer, labelled as the answer. */
const CUSHION_Q7 = ['In place', 'Thin', 'None: relies on credit', 'Not set up yet'];
function cushionM(){ const has = k => S && S.src && !!S.src[k]; applyAssume(); const T = SAVE.buffer, q = S && S.ans ? S.ans['7'] : null, ans = typeof q === 'number' ? CUSHION_Q7[q] : null;
  if (has('cash') && has('costsM')){ const F = finNums(), e = essM(F); if (e > 0){ const m = Math.floor(F.cash / e * 10) / 10; return {fig:true, m, T, e, cash:F.cash, need:Math.max(0, Math.round(T * e - F.cash)), level:m >= T ? 'In place' : m >= 1 ? 'Thin' : 'None', ans}; } }
  return {fig:false, m:null, T, e:0, cash:0, need:null, level:ans, ans}; }   // B16: months of essential spending, the customer's setting (same as the plan and the calculator)
function foundations(){ const F = finNums(), f = S.fin, has = k => !!S.src[k] && f[k] != null && f[k] !== '', P = S.app ? project() : null, L = [];
  const add = (o) => L.push(Object.assign({n:L.length + 1}, o));
  // 1. Spend less than you earn
  if (!has('income') && f.work !== 'Not working' || !has('costsM')) add({e:'💶', name:'Spend less than you earn', st:'na', s:'Add your income and spending to check this', sec:1});
  else { const P0 = P || project(), r0 = P0.rows[0], sp = Math.round((r0.inflow - r0.needs) / 12), net = Math.max(1, r0.inflow / 12);   /* can be negative */
    add({e:'💶', name:'Spend less than you earn', st:sp < 0 ? 'bad' : sp < 0.05 * net ? 'mid' : 'ok', s:sp < 0 ? 'Spending about ' + eur(-sp) + ' a month more than comes in' : 'About ' + eur(sp) + ' a month spare', sp, net}); }
  // 2. Emergency fund (6 months of essential spending in easy-access cash; falls back to u14)
  const ess = F.costsM + F.mortPayM + (F.debt > 0 ? F.debtPayM : 0);
  if (has('cash') && has('costsM') && ess > 0){ const m = F.cash / ess; add({e:'🪂', name:'Emergency fund', st:m >= fndT() ? 'ok' : m >= 3 ? 'mid' : 'bad', s:m >= fndT() ? (Math.floor(m * 10) / 10).toLocaleString('en-IE') + ' months of essential spending · target of ' + fndT() + ' met' : (Math.floor(m * 10) / 10).toLocaleString('en-IE') + ' of ' + fndT() + ' months of essential spending', m}); }
  else if (typeof S.um.a.u14 === 'number'){ const k = S.um.a.u14; add({e:'🪂', name:'Emergency fund', st:[ 'bad', 'bad', 'mid', 'ok'][k], s:['Less than a month', '1 to 3 months', '3 to 6 months', '6 months or more'][k] + ' of savings (your answer)', m:[0.5, 2, 4.5, 6][k]}); }
  else add({e:'🪂', name:'Emergency fund', st:'na', s:'Add your assets to check this', sec:2});
  { const fe = L[L.length - 1], eg = P && S.goals.find(g => g.k === 'safety'); if (eg && (fe.st === 'bad' || fe.st === 'mid') && P.pct[eg.id] >= 95){ fe.st = 'mid'; fe.s += ' · your plan builds it by ' + (YEAR0 + eg.age - S.about.age); } }   // matches the 100% in Your goals
  // 3. Clear costly debt & protect your family: the weakest item shows
  const items = [];
  if (has('cardBal') || has('loanBal') || has('debt')){
    if (F.cardBal > 1){ const r = payoff(F.cardBal, 0, F.cardPayM, iAPR(F.cardRate)); items.push(r.m <= 12 ? {st:'mid', s:'Credit card ' + eur(F.cardBal) + ' clears in about ' + Math.max(1, Math.ceil(r.m)) + ' months', a:'debtpay'} : {st:'bad', s:'Credit card ' + eur(F.cardBal) + (r.m === Infinity ? ' with no repayment set' : ' takes about ' + Math.ceil(r.m) + ' months to clear'), a:'debtpay'}); if (F.cardPayEst) items[items.length - 1].s += ' (repayment worked out from your figures, because ' + payWhy('cardPayM') + ')'; }
    if (F.loanBal > 1){ const r = payoff(F.loanBal, 0, F.loanPayM, iAPR(F.loanRate)); items.push(r.m <= 24 ? {st:'mid', s:'Loans of ' + eur(F.loanBal) + ' clear in about ' + Math.max(1, Math.ceil(r.m)) + ' months', a:'debtpay'} : {st:'bad', s:'Loans of ' + eur(F.loanBal) + (r.m === Infinity ? ' with no repayment set' : ' take about ' + Math.ceil(r.m / 12) + ' years to clear'), a:'debtpay'}); if (F.loanPayEst) items[items.length - 1].s += ' (repayment worked out from your figures, because ' + payWhy('loanPayM') + ')'; }
    if (F.debt <= 1) items.push({st:'ok', s:'No costly debt'}); }
  const needLife = S.about.partner || S.about.deps > 0, working = f.work && f.work !== 'Not working';
  if (needLife){ if (!has('life')) items.push({st:'na', s:'Add your protection to check life cover', sec:4}); else items.push(f.life === 'Yes' || coverTotal('workCover') > 0 ? {st:'ok', s:(f.life === 'Yes' ? 'Life cover in place' + (coverTotal('life') > 0 ? ' (' + eur(coverTotal('life')) + ' covered)' : '') + (coverTotal('workCover') > 0 ? ', plus ' + eur(coverTotal('workCover')) + ' through work' : '') : 'Cover through work in place (' + eur(coverTotal('workCover')) + ')')} : {st:f.life === 'No' ? 'bad' : 'mid', s:(f.life === 'No' ? 'No life cover, and ' : 'Not sure about life cover, and ') + (S.about.deps > 0 ? 'people rely on you' : 'you plan with a partner'), a:'lifecover'}); }
  if (working){ if (!has('ip')) items.push({st:'na', s:'Add your protection to check income protection', sec:4}); else items.push(f.ip === 'Yes' ? {st:'ok', s:'Income protection in place' + (coverTotal('ip') > 0 ? ' (' + eur(coverTotal('ip')) + ' a month)' : '')} : {st:'mid', s:'No income protection if you couldn\'t work', a:'incomegap'}); }
  const rank = {bad:0, mid:1, na:2, ok:3}, worst = items.sort((a, b) => rank[a.st] - rank[b.st])[0];
  if (!items.length) add({e:'🛡️', name:'Clear costly debt & protect your family', st:'na', s:'Add your loans and protection to check this', sec:3});
  else add(Object.assign({e:'🛡️', name:'Clear costly debt & protect your family'}, worst, {items}));
  // 4. Goals & retirement
  if (!P) add({e:'🎯', name:'Goals & retirement', st:'na', s:'Make your plan to check this', make:1});
  else { const gs = S.goals.filter(g => g.kind !== 'legacy'), on = gs.filter(g => P.pct[g.id] >= 95).length, low = gs.filter(g => P.pct[g.id] < 50).length, penOn = F.pensionM > 0 || (retireGoal() && P.pct[retireGoal().id] >= 95);
    add({e:'🎯', name:'Goals & retirement', st:!gs.length ? 'na' : low > gs.length / 2 ? 'bad' : on === gs.length && penOn ? 'ok' : 'mid', s:gs.length ? on + ' of ' + gs.length + ' goals on track' + (penOn ? ' · pension saving under way' : ' · no pension saving yet') : 'Add goals to check this', on, of:gs.length}); }
  // 5. Grow wealth & legacy: never coral
  const wl = S.goals.filter(g => g.k === 'wealth' || g.kind === 'legacy'), wlOn = P && wl.some(g => P.pct[g.id] >= 95), inv = (has('invest') && F.invest > 0);
  add({e:'🌳', name:'Grow wealth & legacy', st:inv || wlOn ? 'ok' : wl.length ? 'mid' : 'na', s:inv ? 'Investing ' + eur(F.invest) + (wlOn ? ' · ' + (wl.find(g => P.pct[g.id] >= 95).name.toLowerCase()) + ' on track' : '') : wlOn ? wl.find(g => P.pct[g.id] >= 95).name + ' on track' : wl.length ? wl[0].name + ' not on track yet' : 'Not started yet'});
  L.forEach((l, i) => { if (l.st === 'ok' && L.slice(0, i).some(x => x.st === 'bad' || x.st === 'mid')){ l.st = 'held'; l.s0 = l.s; l.s = l.s + ' · strengthen your foundations first'; } });   // Pooja, 1 Oct: no "Solid" above a weaker level
  return L; }
const FND_WHY = () => ['Spending less than you earn is what makes every other goal possible. Your spare money each month is what we count towards goals.',
  'An emergency fund is easy-access money for surprises, like a repair or a gap in pay. A common guide is ' + fndT() + ' months of essential spending.',
  'Costly debt grows faster than most savings, and protection keeps the plan going if illness or death strikes. Many people sort these out before investing.',
  'With the basics in place, your savings can work towards the things you want and a comfortable retirement.',
  'Once the foundations are solid, investing for the long term can grow your wealth, and you can plan what you leave behind.'];
function fndNext(L){ L = L || foundations(); const x = L.find(l => l.st !== 'ok'); if (!x) return null;
  const t = x.n === 1 ? (x.st === 'bad' ? 'Spend less than you earn first' : 'Give yourself more room each month') : x.n === 2 ? 'Build your emergency fund first' : x.n === 3 ? (x.a === 'debtpay' ? 'Clear your costly debt first' : 'Check your protection first') : x.n === 4 ? 'Get your goals on track' : 'Start growing your wealth when you\'re ready';
  const d = x.st === 'na' ? x.s + '.' : x.n === 2 && x.m != null ? 'You\'re ' + (Math.floor(x.m * 10) / 10).toLocaleString('en-IE') + ' of ' + fndT() + ' months there.' : x.s + '.';
  return {x, t, d}; }
const FND_CLS = {ok:'good', mid:'nudge', bad:'alert', na:'na', held:'held'}, FND_LBL = {ok:'Solid', mid:'In progress', bad:'Needs attention', na:'Not started', held:'In place'};
function fndHTML(compact){ const L = foundations(), nx = fndNext(L), okN = L.filter(l => l.st === 'ok' || l.st === 'held').length;   // v28: summary bar + connected level ladder (level 1 at the bottom)
  return '<div class="fsum" aria-hidden="true"><div class="fbar">' + L.map(l => '<i class="fb-' + l.st + '"></i>').join('') + '</div><span><b>' + okN + ' of ' + L.length + '</b> in place</span></div>' +
    '<ol class="fnd2' + (compact ? ' sm' : '') + '" aria-label="Your financial foundations, from the bottom up">' + L.map((l, i) => '<li style="width:' + (100 - i * 9) + '%;--i:' + i + '"><button class="f2 s-' + l.st + '" data-a="sheet" data-p="fnd|' + i + '"><span class="f2n" aria-hidden="true">' + (l.st === 'ok' || l.st === 'held' ? '✓' : l.n) + '</span><span class="f2e" aria-hidden="true">' + l.e + '</span><span class="f2m"><b>' + l.name + '</b><span class="f2s">' + FND_LBL[l.st] + (compact ? '' : ' · ' + esc(l.s)) + '</span></span><span class="chev" aria-hidden="true">›</span></button></li>').join('') + '</ol>' +
    '<p class="fhint" aria-hidden="true">Built from the bottom up · tap a level</p>' +
    (nx && !compact ? '<p class="small" style="margin:8px 0 0;color:var(--ink)"><b>Next best step:</b> ' + esc(nx.t) + '. ' + esc(nx.d) + '</p>' : ''); }
// v83: the pyramid builds itself, bottom level first, when it scrolls into view
function fndWatch(root){ const els = root.querySelectorAll('.fnd2:not(.seen)'); if (!els.length) return;
  if (RM() || !('IntersectionObserver' in window)){ els.forEach(e => e.classList.add('seen')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ e.target.classList.remove('pre'); e.target.classList.add('seen'); io.unobserve(e.target); } }), {threshold:.25});
  els.forEach(e => { e.classList.add('pre'); io.observe(e); }); }
function fndCard(){ return '<div class="card" id="r-fnd"><h3 class="h">Your financial foundations</h3><p class="small" style="margin:0 0 6px">Good planning is built from the bottom up. Tap a level to see why it matters.</p>' + fndHTML(false) + '</div>'; }
function fndSheet(i){ const l = foundations()[+i]; if (!l) return '';
  const act = l.st === 'na' ? (l.make ? ['makeplan', '', 'Make my plan'] : ['fsec', l.sec, 'Add it now']) : l.n === 1 ? ['calc', 'surplus', 'Open the Monthly surplus calculator'] : l.n === 2 ? ['calc', 'emergency', 'Open the Emergency fund calculator'] : l.n === 3 ? (l.a ? ['calc', l.a, l.a === 'debtpay' ? 'Open Debt repayment' : l.a === 'lifecover' ? 'Open the Life cover tool' : 'Open Income protection gap'] : ['expertfor', 'protection', 'Talk to a protection expert']) : l.n === 4 ? ['gowi', '', 'Try a what-if'] : ['expertfor', 'investment', 'Talk to an investment expert'];
  return '<div class="eyebrow">Level ' + l.n + ' of 5 · ' + FND_LBL[l.st] + '</div><h2 class="t">' + l.e + ' ' + l.name + '</h2><p class="sub" style="color:var(--ink)"><b>' + esc(l.s) + '.</b></p>' + (l.items && l.items.length > 1 ? '<ul class="small" style="margin:0 0 10px;padding-left:18px;color:var(--ink)">' + l.items.map(x => '<li>' + esc(x.s) + '</li>').join('') + '</ul>' : '') +
    (l.st === 'held' ? '<p class="sub" style="color:var(--ink)">This level is in place, but a level below it still needs work. Good planning is built from the bottom up, so the lower level comes first.</p>' : '') + '<p class="sub">' + FND_WHY()[l.n - 1] + '</p><button class="btn" data-a="' + act[0] + '"' + (act[1] !== '' ? ' data-p="' + act[1] + '"' : '') + '>' + act[2] + '</button><button class="btn ghost" style="margin-top:10px" data-a="closesheet">Close</button><p class="disc">Guidance, not advice.</p>'; }
function nextStep(){ const P = project(), gs = S.goals.slice().sort((a, b) => P.pct[a.id] - P.pct[b.id] || a.age - b.age), w = gs[0];
  const looks = checkItems().filter(x => x.st === 'look' && !S.ack[x.k]).length;
  if (looks) return {e:'⚠️', t:looks === 1 ? 'One detail needs a look' : looks + ' details need a look', d:'So your plan stays accurate. It takes a minute.', a:'me', p:'money', b:'Check it'};
  const fx = fndNext(); if (fx && fx.x.n <= 4) return {e:fx.x.e, t:fx.t, d:esc(fx.d), a:'sheet', p:'fnd|' + (fx.x.n - 1), b:'See why'};   // foundations: the first level that isn't solid
  if (S.book.done && needsProfile()) return {e:'🧭', t:'Check your profile before your adviser meeting', d:esc(S.book.slot) + '. About 2 minutes.', a:'toprofile', b:'Check my profile'};
  if (w && P.pct[w.id] < 95 && !S.pref) return {e:'🔮', t:'Try a what-if for ' + esc(w.name.toLowerCase()), d:esc(w.name) + ' is ' + P.pct[w.id] + '% covered. See what a small change would do.', a:'gowi', p:w.id, b:'Try it'};
  if (umCount() < 13) return {e:'🧭', t:'Finish your profile', d:'6 quick questions on risk, capacity and how you invest.', a:'toprofile', b:'Start'};
  if (!S.book.done) return {e:'📅', t:'Talk it through with an adviser', d:'Free, no obligation.', a:'book', b:'Book a meeting'};
  return {e:'✅', t:"You're all set", d:'Your meeting: ' + esc(S.book.slot) + '.', a:'tab', p:'exp', b:'See my meeting'}; }
V.HOME = () => { if (!planReady()) return {id:'HOME', note:'Home while a required choice is missing (§14): no numbers until it is made.', head:homeHeadBar(), html:'<div class="hgreet">' + homeHead() + '</div>' + gateHTML('home')};
  const P = project(), gs = S.goals.slice().sort((a, b) => a.age - b.age), avg = gs.length ? Math.round(gs.reduce((t, g) => t + P.pct[g.id], 0) / gs.length) : 0, ok = gs.filter(g => P.pct[g.id] >= 95).length, bd = band(avg), n = nextStep();
  return {id:'HOME', note:'Home (layout v7, 11 Oct 2026): greeting with date, Ask bar, Your Timeline card (total planned, goal stems by age, Profile / Goals / Next goal strip), Up next, readiness, foundations, goal photo cards, shortcuts.', head:homeHeadBar(),
    html:homeHero() + '<div class="h0over">' + homeTimeline(P, gs) + '</div>' + askBar() +
      '<div class="sec"><h3>Up next</h3><button class="link" data-a="seg" data-p="results">See progress</button></div>' +
      '<div class="card upnext"><div class="un-img" aria-hidden="true"></div><div class="un-body"><div class="eyebrow">Your next best step</div><div class="row" style="margin-top:6px;align-items:flex-start"><span style="font-size:26px" aria-hidden="true">' + n.e + '</span><div style="flex:1"><b style="font-size:16px">' + n.t + '</b><div class="small" style="color:var(--ink)">' + n.d + '</div></div></div><button class="btn sm" style="width:100%;margin-top:12px" data-a="' + n.a + '"' + (n.p != null ? ' data-p="' + n.p + '"' : '') + '>' + n.b + '</button></div></div>' +
      '<div class="card gcard"><div class="eyebrow">Overall readiness' + (skippedSecs().length || qualityCount() > 2 ? ' · rough' : '') + '</div>' + gauge(avg) + '<b class="gk">' + ok + ' of ' + gs.length + ' goals on track</b><div class="small">How much of your goals your money can cover, on average.</div></div>' +
      '<div class="card" id="h-fnd"><div class="row" style="justify-content:space-between"><b style="font-size:15px">Your financial foundations</b><button class="link" data-a="seg" data-p="fnd">See all</button></div>' + fndHTML(true) + '</div>' + roughNote() +
      '<div class="sec"><h3>Your goals</h3><button class="link" data-a="seg" data-p="results">See results</button></div><div class="hstrip gcards">' + gs.map(g => { const p = P.pct[g.id], b = band(p); return '<div class="hcard"><div class="hc-img" style="background-image:' + gImg(g) + '"><span class="hc-tag" style="color:var(--' + b + '-t)">' + (p >= 95 ? 'On track' : p >= 60 ? 'Nearly there' : 'Needs attention') + '</span><span class="hc-name"><span aria-hidden="true">' + g.e + '</span> ' + esc(g.name) + '</span><span class="hc-stats"><span><small>Target</small>' + (g.amount ? eurK(g.amount) + (g.kind === 'retire' ? '/yr' : '') : '–') + '</span><span><small>When</small>' + (g.kind === 'retire' ? 'Age ' + g.age : passedG(g) ? 'Passed' : (YEAR0 + g.age - S.about.age)) + '</span><span><small>Covered</small>' + p + '%</span></span></div>' + (passedG(g) ? '<div class="hc-body">' + dateBtn(g) + '</div>' : '') + '</div>'; }).join('') + '</div>' +
      '<div class="sec"><h3>Shortcuts</h3></div><div class="svc2 sc3">' + [['seg','timeline','🗓️','My timeline','See your goals by age'],['gowi','','🔮','Try a what-if','Test a change to your plan'],['upl','smart','📥','Add a document','Fill figures from a statement'],['report','','⬇️','Download my plan','Your plan as a report']].map(([a, p, e, t, d]) => '<button class="sv2" data-a="' + a + '"' + (p ? ' data-p="' + p + '"' : '') + '><span class="sv2-i" aria-hidden="true">' + e + '</span><span class="sv2-t"><b>' + t + '</b><small>' + d + '</small></span><span class="sv2-go" aria-hidden="true">→</span></button>').join('') + '</div>' +
      '<p class="disc">Guidance, not advice. Figures are illustrative and based on your details and our assumptions.</p>'}; };
function gauge(p){ const L = Math.PI * 80, v = Math.max(0, Math.min(100, p));   // half circle, radius 80
  return '<div class="gauge" aria-hidden="true"><svg viewBox="0 0 200 112" width="220" height="123"><defs><linearGradient id="gg" x1="0" x2="1"><stop offset="0" stop-color="#22D3EE"/><stop offset="1" stop-color="#2563EB"/></linearGradient></defs><path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="rgba(15,47,74,.08)" stroke-width="18" stroke-linecap="round"/><path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="url(#gg)" stroke-width="18" stroke-linecap="round" stroke-dasharray="' + (L * v / 100).toFixed(1) + ' ' + L.toFixed(1) + '"/></svg><b>' + p + '<small>%</small></b></div>'; }
function homeHero(){ const Pz = personality(), h = new Date().getHours(), nm = S.acct.name, t = dobToday(), d = S.about.dob, age = d && dobFilled(d) && dobValid(d) ? ageTodayOf(d) : S.about.age, DN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], MN = ['January','February','March','April','May','June','July','August','September','October','November','December'];   // v26: same hero as Home before a plan
  let stage = 'Getting started', lv = 0; if (S.app){ const L = foundations(), k = L.findIndex(l => l.st !== 'ok'); lv = k < 0 ? 5 : Math.max(1, k); stage = k < 0 ? 'Growing wealth' : ['Building foundations', 'Building foundations', 'Protecting your family', 'Securing your goals', 'Growing wealth'][k] || 'Growing wealth'; }
  return '<div class="h0hero hh2">' + HFX + '<span class="h0date"><i aria-hidden="true"></i>' + DN[t.getDay()] + ' · ' + t.getDate() + ' ' + MN[t.getMonth()] + '</span><h2 class="t" tabindex="-1"><span class="hh-hi">' + (h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening') + (nm ? ',' : '') + '</span> ' + (nm ? '<span class="hh-nm">' + esc(nm) + '</span>' : 'welcome back') + ' <span class="wave" aria-hidden="true">👋</span></h2>' +
    '<p class="hh-sub">' + stage + (age ? ' · age ' + age : '') + '</p>' +
    (Pz ? '<button class="h0pill" data-a="me" data-p="terms"><span class="h0badge" aria-hidden="true">' + Pz.e + '</span><span>Your money personality: <b>' + Pz.name + '</b></span><span class="chev" aria-hidden="true">›</span></button>' : '') + '</div>'; }
function homeTimeline(P, gs){ const a0 = S.about.age, tot1 = g => g.kind === 'retire' ? (g.amount || 0) * Math.max(1, AS.end - g.age) : (g.amount || 0), list = gs.filter(g => !passedG(g)).slice(0, 4), tot = gs.reduce((t, g) => t + tot1(g), 0), max = Math.max(1, ...list.map(tot1)), nx = list[0], pr = Math.round(umCount() / 13 * 100);
  const stems = list.map((g, i) => '<div class="tlv-col' + (i === 0 ? ' on' : '') + '">' + (i === 0 ? '<span class="tlv-tag">' + eurK(tot1(g)) + '</span>' : '') + '<span class="tlv-stem" style="height:' + Math.round(30 + Math.sqrt(tot1(g) / max) * 110) + 'px"></span><span class="tlv-em" aria-hidden="true">' + g.e + '</span><span class="tlv-age">' + g.age + '</span></div>').join('');
  return '<div class="card tlv"><div class="tlv-head"><div><h3 class="h">Your Timeline</h3><div class="small">Your goals by age</div></div><button class="link" data-a="seg" data-p="timeline">Open ›</button></div>' +
    '<div class="tlv-body"><div class="tlv-sum"><b class="tlv-big">' + eurK(tot) + '</b><span class="small">planned in total</span></div><div class="tlv-stems" role="img" aria-label="' + esc(list.map(g => g.name + ' at age ' + g.age).join(', ')) + '">' + stems + '</div></div>' +
    '<div class="tlv-stats"><div><span class="k">Profile</span><b>' + pr + '<small>%</small></b><i class="tlv-bar"><i style="width:' + pr + '%"></i></i></div><div><span class="k">Goals</span><b>' + gs.length + '</b><span class="small">planned</span></div><div><span class="k">Next goal</span><b>' + (nx ? (YEAR0 + nx.age - a0) : '–') + '</b><span class="small">' + (nx ? 'at age ' + nx.age : 'none yet') + '</span></div></div></div>'; }
function planProfileBanner(){ const full = umCount() === 13, r = riskRead(full);
  if (!discEnough()) return '<div class="banner" id="r-prof"><span aria-hidden="true">🧭</span><span><b>Risk profile: not enough answers yet</b></span><button class="link" data-a="me" data-p="recheck">Answer in Me</button></div>';
  return '<div class="banner" id="r-prof"><span aria-hidden="true">🧭</span><span><b>Risk profile' + (r.provisional && r.label ? ' (first read)' : '') + ': ' + (r.label || 'Not answered yet') + '</b> <span class="small">· ' + (full ? 'from your profile in Me' : 'Finish in Me to confirm') + '</span></span><button class="link" data-a="toprofile">' + (full ? 'View' : 'Finish in Me') + '</button></div>'; }
function specialist(){ const P = project(), w = S.goals.slice().sort((a, b) => P.pct[a.id] - P.pct[b.id])[0], k = S.book.spec || (S.app && w ? w.spec : 'planner'); return {key:k, type:EXPERT_FOR[k], goal:S.book.spec ? (S.goals.find(g => g.spec === k) || null) : S.app ? w : null, picked:!!S.book.spec}; }
const EXPERT_BLURB = {mortgage:'Buying, switching or paying off a home loan', pension:'Pensions, tax relief and retirement income', protection:'Life cover, income protection, serious illness', investment:'Risk, charges and long-term investing', planner:'Your whole picture: goals, money and plans'}, EXPERT_ICON = {mortgage:'🏡', pension:'🌅', protection:'🛡️', investment:'📈', planner:'🧭'};
function specBoxes(sp){ return '<div class="sec"><h3>Talk to a specialist</h3></div><div role="group" aria-label="Talk to a specialist">' + Object.entries(EXPERT_FOR).map(([k, x]) => '<button class="goal spec' + (sp.key === k ? ' sel' : '') + '" aria-pressed="' + (sp.key === k) + '" data-a="spec" data-p="' + k + '"><span class="ic" aria-hidden="true">' + EXPERT_ICON[k] + '</span><span style="flex:1;min-width:0"><b>' + x + '</b><br><span class="small">' + EXPERT_BLURB[k] + '</span></span><span class="ck2" aria-hidden="true">✓</span><span class="chev" aria-hidden="true">›</span></button>').join('') + '</div>'; }
V.EXP = () => { const b = S.book, st = S.exp, A = ADVISERS[b.adv], sp = specialist();
  const advCard = '<div class="card adv2"><div class="av2-top"><span class="av2-face" aria-hidden="true">' + A.ini + '<i class="av2-on"></i></span><div class="av2-id"><span class="av2-tag">Your match · sample adviser</span><b>' + A.n + '</b><span>' + sp.type + ' · ' + A.q + '</span></div></div>' +
      '<div class="av2-chips"><span>🗣️ ' + A.lang + '</span><span>📍 ' + A.loc + '</span><span>💻 ' + A.mode + '</span></div>' +
      '<p class="av2-why"><span aria-hidden="true">✨</span>' + (sp.picked ? 'You chose a <b>' + sp.type.toLowerCase() + '</b>.' : sp.goal ? 'Matched because <b>' + esc(sp.goal.name.toLowerCase()) + '</b> is where you could gain most.' : 'A financial planner looks at your whole picture.') + '</p></div>';
  const specRow = specBoxes(sp);
  const liveRow = '<div class="sec"><h3>What\'s on · live with experts</h3></div>' + LIVE.map(x => liveCard(x, 'With a ' + EXPERT_FOR[x[2]].toLowerCase(), 'margin-bottom:8px')).join('');
  const planNudge = S.app ? '' : nudge('🗺️', 'Make your plan first so your adviser can see it. You can still book now.', 'Make my plan', 'makeplan');
  if (st === 'c0') return {id:'C0', note:'Optional: Help your adviser know you → Understand Me with 7 answers pre-filled. Skippable.', head:appHead('Help your adviser know you', '', 'exp|home'), html:'<div class="xbanner" aria-hidden="true"></div><div class="card" style="text-align:center"><div style="font-size:46px" aria-hidden="true">🧭</div><b style="font-size:17px">6 quick questions, about 2 min</b><p class="small">You can choose to share this with your adviser, so you won\'t repeat yourself. ' + discCount() + ' of your answers are already filled in.</p></div>' + specRow, foot:'<button class="btn" data-a="c0go">Answer the questions</button><button class="btn ghost" data-a="exp" data-p="c1">Skip for now</button>'};
  if (st === 'c1') return {id:'C1', note:'Your match: specialist type from Step 5 mapping (weakest goal).', head:appHead('Your match', 'A ' + sp.type.toLowerCase() + ' who fits ' + (S.app ? 'your plan' : 'what you\'ve told us') + '.', 'exp|home'), html:planNudge +(needsProfile() ? nudge('🧭', 'Check your profile before your adviser meeting', 'Check now', 'toprofile') : '') + advCard + '<button class="link" data-a="advnext">See another match</button> · <button class="link" data-a="toast" data-p="' + A.n.split(' ')[0] + ' will call you within 1 working day">Request a call back</button>' + specRow, foot:'<button class="btn" data-a="exp" data-p="c2">Choose ' + A.n.split(' ')[0] + '</button>'};
  if (st === 'c2'){ const any = Object.values(b.share).some(Boolean); return {id:'C2', note:'Share your plan: explicit consent per item, all unticked. Referral / conflicts disclosed.', head:appHead('Share your plan', 'Choose what ' + A.n.split(' ')[0] + ' can see before you meet.', 'exp|c1'),
    html:planNudge + '<div class="card">' + [['report','Your plan report','Goals, results and what-ifs'],['fin','Your finances','The figures in your 6 sections'],['docs','Your documents','Statements you uploaded'],['um','Your Understand Me profile','Personality and indicative risk profile']].filter(([k]) => k === 'um' ? discEnough() : k === 'docs' ? Object.values(S.src).includes('doc') : S.app).map(([k, l, d]) => '<label class="check"><input type="checkbox" data-share="' + k + '"' + (b.share[k] ? ' checked' : '') + '><span><b>' + l + '</b><br><span class="small">' + d + '</span></span></label>').join('') + '</div>' +
      '<div class="card"><label class="check"><input type="checkbox" data-agree="1"' + (b.agree ? ' checked' : '') + '><span>I agree to share the items I\'ve ticked with ' + A.n + '. I can withdraw this at any time.</span></label><p class="small" style="margin:6px 0 0">LifeMap may be paid a fee by the adviser\'s firm if you go ahead. Your adviser will tell you how they are paid before you agree to anything. <button class="link" style="padding:0;font-size:12.5px" data-a="sheet" data-p="money">How LifeMap makes money</button></p></div>',
    foot:'<button class="btn" data-a="exp" data-p="c3" id="sharego"' + (any && b.agree ? '' : ' disabled') + '>Pick a time</button>'}; }
  if (st === 'c3') return {id:'C3', note:'Pick a time: video or in person; request another slot.', head:appHead('Pick a time', '45 minutes · free · no obligation', 'exp|c2'),
    html:'<div class="seg" role="group" aria-label="Meeting type">' + ['Video','In person'].map(x => '<button class="' + (b.mode === x ? 'on' : '') + '" aria-pressed="' + (b.mode === x) + '" data-a="bmode" data-p="' + x + '">' + x + '</button>').join('') + '</div>' + slotPicker(b) + '<button class="link" data-a="toast" data-p="We\'ve asked ' + A.n.split(' ')[0] + ' for more times">Request another slot</button>',
    foot:'<button class="btn" data-a="confirmbook"' + (b.slot ? '' : ' disabled') + '>Confirm booking</button>'};
  if (st === 'c4') return {id:'C4', note:'Booked: email + SMS + calendar file; what happens next.', head:appHead("You're booked ✓", '', ''), html:bookedCard() + (needsProfile() ? nudge('🧭', 'Check your profile before your adviser meeting', 'Check now', 'toprofile') : '') + nextSteps(), foot:'<button class="btn" data-a="tab" data-p="plan">Back to my plan</button>'};
  if (b.done) return {id:'EXP-01', note:'Experts tab after booking: meeting details and secure document requests.', head:appHead('Experts', 'Your adviser and meeting.'), html:(needsProfile() ? nudge('🧭', 'Check your profile before your adviser meeting', 'Check now', 'toprofile') : '') + bookedCard() + '<div class="card"><b>Documents your adviser asked for</b>' + ['Latest pension statement','Mortgage statement (last 12 months)'].map(d => '<div class="mini"><span>📄 ' + d + '</span><button class="link" data-a="toast" data-p="Sent securely to ' + A.n.split(' ')[0] + '">Upload</button></div>').join('') + '</div>' + nextSteps()};
  return {id:'EXP-00', note:'Experts tab (layout from the LifeGoal mobile prototype): suggested match, specialist types (pre-selected from an Explore topic), what\'s on (live sessions), booking. Works before a plan; consent-before-sharing kept.', head:appHead('Experts', 'Real advisers, when you want them. Free first call, no obligation.'), html:planNudge + (needsProfile() ? nudge('🧭', 'Check your profile before your adviser meeting', 'Check now', 'toprofile') : '') + advCard + specRow + liveRow, foot:'<button class="btn sun" data-a="book">📅 Book my adviser meeting</button>'};
};
function bookedCard(){ const b = S.book, A = ADVISERS[b.adv], m = String(b.slot || '').match(/^(\w+)\s+(\d+)\s+(\w+)\s*·?\s*(.*)$/);
  return '<div class="card bk-hero"><div class="bk-top"><span class="bk-d" aria-hidden="true">' + (m ? '<small>' + esc(m[1]) + '</small><b>' + esc(m[2]) + '</b><small>' + esc(m[3]) + '</small>' : '📅') + '</span><div><span class="bk-ok"><i aria-hidden="true">✓</i> Confirmed</span><b class="bk-when">' + esc(b.slot) + '</b><span class="bk-who">' + b.mode + ' with ' + A.n + '</span></div></div><p class="bk-note">Confirmation sent by email and SMS.</p><button class="bk-cal" data-a="ics">' + (dlPossible() ? '📄 Save meeting details' : '📆 Add to my calendar') + '</button></div>'; }
function nextSteps(){ const st = [['🔎', 'Your adviser reviews your plan'], ['📞', 'A short verification call', 'Confirm details and add any missing documents securely'], ['🤝', 'You agree your personal plan together'], ['🚀', 'You take action'], ['🔔', 'LifeMap keeps tracking and reminds you about reviews']];
  return '<div class="card bk-next"><h3 class="h">What happens next</h3><ol class="bk-steps">' + st.map((x, i) => '<li><span class="bk-n" aria-hidden="true">' + x[0] + '</span><div><b>' + (i + 1) + '. ' + x[1] + '</b>' + (x[2] ? '<small>' + x[2] + '</small>' : '') + '</div></li>').join('') + '</ol></div>'; }

/* ================= ASK (help only: plain-English explanations, never advice) ================= */
const ASK_GEN = [
  ['advice', 'Is this financial advice?', 'No. LifeMap gives guidance: it explains your situation and shows what could happen. Only an authorised adviser who knows your full situation can give advice.'],
  ['covered', 'What does "% covered" mean?', 'How much of a goal\'s cost your future income and savings should cover when it comes up. 100% means fully covered. 70% leaves about 30% to plan for.'],
  ['today', 'What is "today\'s money"?', 'Prices rise over time. We show amounts as they would feel today, so €10,000 means what €10,000 buys now, not in 20 years.'],
  ['risk', 'What is a risk profile?', 'A short summary of how much ups and downs suit you. It combines the risk you <b>want</b> to take, the risk you <b>can</b> afford and <b>how long</b> you can wait. It\'s a guide: your adviser confirms it with you.'],
  ['capacity', 'What does "capacity" mean?', 'Capacity for loss is how big a fall you could live with without hurting everyday life. Could you still pay your bills if your investments dropped for a while?'],
  ['behaviour', 'What is "investor behaviour"?', 'How you tend to act with money, such as researching, asking an expert or acting fast. It helps your adviser explain things your way.'],
  ['estimate', 'What if I don\'t know a figure?', '"Not sure? See an example" shows how Aoife and Cian filled it in, and where to find yours. It never fills in a figure for you: everyone\'s money is different. Nothing to add? Leave it blank. It counts as €0 and stays on your list as optional.'],
  ['data', 'Is my data safe?', 'Your data is stored in the EU and never sold. Nothing is shared with an adviser unless you tick what to share. You can delete everything in Me › Privacy & preferences.'],
  ['partner', 'Can my partner join?', 'Yes. In Me you can invite your partner to add their own details, or add their name, age and income yourself.'],
  ['free', 'Does it cost anything?', 'LifeMap is free for you. If you work with an adviser, their firm may pay us a fee. Your adviser will tell you how they are paid before you agree to anything.']
];
function askCtx(id){ id = id || '';
  if (id === 'DR') return ['ctx', 'What are my "money terms"?', 'They\'re the words an adviser would use for your answers, such as "Loss aversion" (losses feel bigger than gains). Each comes with a plain-English line. They describe you. They aren\'t advice.'];
  if (id === 'DS') return ['ctx', 'Do I have to give my email?', 'No. Your email just lets us send you a secure link to come back. Tap "Skip for now" to go straight in. We ask again only when you make your plan and add money figures.'];
  if (id === 'HOME-0' || id === 'PLAN-0') return ['ctx', 'What happens when I make my plan?', 'Eight short steps: you and your family, goals, timeline, money profile, a quick account check, your finances, a final check, then your results. Leave any time. Your progress is saved.'];
  if (id === 'B1') return ['ctx', 'Why do you ask about my family?', 'Your age, partner and the people who rely on you shape which goals we suggest and how far your money needs to go. No money figures yet.'];
  if (id === 'B4') return ['ctx', 'What is my money profile?', 'Three things: ' + SECT.appetite[0].toLowerCase() + ' (' + SECT.appetite[1] + '), ' + SECT.capacity[0].toLowerCase() + ' (' + SECT.capacity[1] + ') and ' + SECT.horizon[0].toLowerCase() + ' (' + SECT.horizon[1] + '), plus how you tend to act. Together they give an indicative risk profile your adviser confirms with you.'];
  if (/^CALC|^XPL|^VID/.test(id)) return ['ctx', 'Are these calculators advice?', 'No. They show what could happen with the figures on screen and simple assumptions. They are illustrations, not a guarantee and not a recommendation. An adviser can look at your full situation.'];
  if (id === 'D1') return ['ctx', 'Why do you ask what\'s going on?', 'So we can put the goals that matter to you first, like a home, a family or retirement. Pick as many as you like, or skip. Nothing is saved unless you choose.'];
  if (/^D/.test(id)) return ['ctx', 'Why do you ask these questions?', 'They help us understand how you feel about money, so the goals and results we show fit you. There are no right or wrong answers, and nothing is saved unless you choose.'];
  if (id === 'F1' || id === 'PLAN-ADD') return ['ctx', 'How do I choose goals?', 'Tap any that matter to you. You can add or remove goals later. Retirement is a goal like any other: add it if you want us to check your later years. Without it, we still assume work income stops at your retirement age in About you (66 unless you change it).'];
  if (id === 'F2' || id === 'PLAN') return ['ctx', 'How does the timeline work?', 'Each goal sits at the age you\'d like it to happen. Drag it left for sooner or right for later, or use the − and + buttons. Rough is fine. You can change it any time.'];
  if (id === 'F4') return ['ctx', 'What is my LifeMap?', 'It is your list of goals with when and how much. Next, we add your money so we can check how far it goes.'];
  if (/^P1/.test(id)) return ['ctx', 'Why do I need an account?', 'So your money details are stored safely and only you can see them. We check your email and mobile to keep your account secure.'];
  if (/^P[234]|^PU/.test(id)) return ['ctx', 'Why do you need my figures?', 'Your income, savings, debts and pension let us work out how far your money can go. Rough figures are fine. "Not sure? See an example" shows where to find each one; we never fill in a figure for you. We don\'t connect to your bank.'];
  if (id === 'HOME') return ['ctx', 'What is "overall readiness"?', 'The average of how much each goal is covered. 100% means your income and savings should cover every goal. My Plan shows the detail.'];
  if (/^ME/.test(id)) return ['ctx', 'Why does my profile matter?', 'Your answers set the indicative risk profile shown on My Plan and in your report. Your adviser sees it only if you choose to share it, so you won\'t have to repeat yourself.'];
  if (/^C|^EXP/.test(id)) return ['ctx', 'What happens at the adviser meeting?', 'It\'s free, about 45 minutes, with no obligation. The adviser goes through your plan and answers your questions. Only they can give you advice.'];
  return null; }
const RISK_EXPLAIN = {'Cautious':'You prefer steady values, even if growth is slower.', 'Cautious–balanced':'Mostly steady, with a little room for ups and downs.', 'Balanced':'A mix of steadiness and growth, accepting some ups and downs.', 'Balanced–growth':'More focus on growth, accepting bigger ups and downs.', 'Growth':'Growth first, comfortable with large ups and downs over the long term.'};
function askPlan(){ if (!S.app || !S.goals.length) return [];
  const P = project(), F = findings(P), out = [], w = F.worst, pw = P.pct[w.id], rg = retireGoal(), full = umCount() === 13, r = riskRead(full);
  if (pw < 95) out.push(['pgap', 'Why is ' + esc(w.name.toLowerCase()) + ' ' + pw + '% covered?', 'When ' + esc(w.name.toLowerCase()) + ' comes up' + (passedG(w) ? ' (its date has passed, so we count it from next year: change the date in My plan)' : ' (age ' + w.age + ')') + ', your income and savings are expected to cover about ' + pw + '% of the ' + eur(w.amount) + (w.kind === 'retire' ? ' a year' : '') + ' you set, in today\'s money. The rest is the gap. ' + (goalLine(P, w) ? goalLine(P, w) + '. ' : '') + 'In <b>What if</b> you can see how saving more, adding a lump sum or moving the date changes it.']);
  else out.push(['pok', 'What does "on track" mean for me?', 'All your goals are at least 95% covered on your figures and our assumptions. That\'s not a guarantee: prices, pay and markets change, so check it each year.']);
  if (rg){ const bad = P.rows.find(x => x.a >= rg.age && isShort(x)); out.push(['pret', 'What happens when I retire at ' + rg.age + '?', 'From ' + rg.age + ', your pension and savings pay for the ' + eur(rg.amount) + ' a year you set. The State Pension (about ' + eur(AS.sp) + ' a year) starts at ' + AS.spAge + '. At retirement, ' + (asmV('lumpSum') > 0 ? Math.round(asmV('lumpSum') * 100) + '% of your pension is assumed taken as a lump sum: ' + LAW.ls + '. ' : 'no lump sum is assumed. ') + '' + (bad ? 'Around age <b>' + bad.a + '</b> the money runs short in this plan, which is why retirement shows ' + P.pct[rg.id] + '%.' : 'In this plan your money lasts to age 90.')]); }
  if (discEnough()) out.push(['prisk', 'What does my risk profile mean?', r.label ? 'Your indicative risk profile is <b>' + r.label + '</b>' + (full ? '' : ' (first read · finish your profile in Me to confirm it; until then it is never shown above Balanced)') + '. ' + RISK_EXPLAIN[r.label] + (full && r.limit ? ' It is set by ' + RISK_SETBY[r.limit] + '.' : '') + ' It is not advice: your adviser confirms it with you.' : 'We can\'t show a risk profile yet: the two questions about ups and downs aren\'t answered. You can answer them in Me.']);
  out.push(['pbest', 'What is my main strength?', esc(F.sT) + '' + (F.best ? '. Of all your goals, this one is best covered by your future income, savings and pension.' : '. We only call something a strength when a goal is fully covered and your everyday spending is paid for.')]);
  return out; }
const ASK_GUARD = 'I can\'t tell you what to do with your money: that would be advice. I can explain what your results mean. For a personal recommendation, book a free adviser meeting.';
function askMatch(q){ const t = q.toLowerCase(), plan = askPlan(), all = plan.concat(ASK_GEN), by = k => (all.find(x => x[0] === k) || [])[2];
  if (/\b(should i|shall i|which (fund|product|pension|provider|bank)|recommend|best (fund|investment|pension|mortgage|option)|buy|sell|invest in|worth it|tell me what to do)\b/.test(t)) return ASK_GUARD;
  const rules = [[/advice|advise/, 'advice'], [/%|percent|covered|on track/, plan.length ? (by('pgap') ? 'pgap' : 'pok') : 'covered'], [/today|inflation|prices/, 'today'], [/capacity|afford|loss/, 'capacity'], [/behaviou?r/, 'behaviour'], [/risk|profile/, plan.length ? 'prisk' : 'risk'],
    [/retire|pension/, plan.length ? 'pret' : 'covered'], [/gap|short/, plan.length && by('pgap') ? 'pgap' : 'covered'], [/strength|best/, plan.length ? 'pbest' : 'covered'], [/estimat|example|don.?t know|not sure/, 'estimate'], [/data|safe|privacy|share|delete/, 'data'], [/partner|wife|husband|spouse/, 'partner'], [/cost|free|fee|charge|money do you make/, 'free']];
  for (const [re, k] of rules) if (re.test(t) && by(k)) return by(k);
  return 'I can explain how LifeMap works and what your results mean. Try one of the questions above' + (S.app ? ', or book a free adviser meeting for personal advice' : '') + '.'; }
function askItems(sid){ const c = askCtx(sid); return (c ? [c] : []).concat(askPlan(), ASK_GEN); }
// v71: Ask as a chat - bubbles, suggested questions, typing pause, composer
function askHTML(sid){ const all = askItems(sid), log = S.ask.log || [], asked = new Set(log.filter(m => m.k).map(m => m.k)), left = all.filter(x => !asked.has(x[0])), sug = S.ask.more ? left : left.slice(0, 4);
  const bub = m => m.who === 'me' ? '<div class="cb me"><p>' + esc(m.t) + '</p></div>' : '<div class="cb bot"><span class="cb-av" aria-hidden="true">✦</span><p>' + (m.typing ? '<span class="cb-typing" aria-label="LifeMap is typing"><i></i><i></i><i></i></span>' : m.t) + '</p></div>';
  return '<div class="chat"><div class="chat-h"><span class="chat-av" aria-hidden="true">✦</span><span class="chat-ht"><h2 class="t" tabindex="-1">Ask LifeMap</h2><small><i aria-hidden="true"></i>Explanations only · never advice</small></span></div>' +
    '<div class="chat-log" id="chat-log" aria-live="polite">' + bub({who:'bot', t:'Hi' + (S.acct.name ? ' ' + esc(S.acct.name) : '') + '! 👋 I can explain how LifeMap works and what your results mean. Pick a question or type your own.'}) + log.map(bub).join('') +
    (left.length && !(log.length && log[log.length - 1].typing) ? '<div class="chat-sug">' + (log.length ? '<small>You could also ask</small>' : '') + sug.map(([k, q]) => '<button class="cs" data-a="askq" data-p="' + k + '">' + q + '</button>').join('') + (!S.ask.more && left.length > 4 ? '<button class="cs more" data-a="askmore">More questions</button>' : '') + '</div>' : '') + '</div>' +
    '<div class="chat-in"><input class="in" id="ask-in" autocomplete="off" placeholder="Ask about your plan…" aria-label="Type your question" value=""><button class="chat-send" data-a="askgo" aria-label="Send"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></div>' +
    '<p class="chat-disc">Answers explain your figures and our assumptions. Not financial advice.</p></div>'; }
function askReply(me, k, ans){ S.ask.log = S.ask.log || []; S.ask.log.push({who:'me', t:me, k}); const bot = {who:'bot', typing:true}; S.ask.log.push(bot); S.ask.more = false; focusKey = '#ask-in'; render(); chatEnd();
  setTimeout(() => { bot.typing = false; bot.t = ans; if (S.sheet === 'ask'){ render(); chatEnd(); } }, RM() ? 0 : 650); }
function chatEnd(){ const l = document.getElementById('chat-log'); if (l) l.scrollTop = l.scrollHeight; }

/* ================= SHEETS ================= */
function sheetHTML(sid){ const s = S.sheet; if (!s) return ''; let h = '';
  if (s === 'ask') h = askHTML(sid);
  if (s === 'elig') h = eligHTML();
  const [t, p] = s.split('|');
  if (t === 'fnd') h = fndSheet(p);
  if (t === 'xpert') h = expertSheet(p);
  if (t === 'ex') h = exHTML(p);
  if (t === 'calcadd' && !(S.about.age >= 18)) h = '<h2 class="t">Add your age first</h2><p class="sub">A goal sits on your timeline at an age, so we need yours. It is step 1 of Make my plan, and the figures you tried here stay as they are.</p><button class="btn" data-a="makeplan">Add my age</button><button class="btn ghost" style="margin-top:10px" data-a="closesheet">Not now</button>';
  else if (t === 'calcadd'){ const c = C(p), m = calcMissing(c); h = m.length ? '<h2 class="t">' + esc(missTxt(m[0]) + ' first') + '</h2><p class="sub">This result needs your choices before it can go in your plan.</p><button class="btn" data-a="closesheet">OK</button>' : handoffHTML(p, c.run(calcVals(c)).goal); }
  if (t === 'gate') h = '<h2 class="t">Almost there</h2>' + gateHTML('report').replace(' id="gate-report"', ' id="gate-report"') + '<button class="btn ghost" style="margin-top:10px" data-a="closesheet">Not now</button>';
  if (t === 'invite') h = '<h2 class="t">Enter your invite code</h2><p class="sub">From your adviser or employer.</p><div class="field"><label for="inv">Code</label><input class="in" id="inv" placeholder="e.g. ABC123"></div><button class="btn" data-a="invite">Continue</button>';
  if (t === 'whyask') h = '<h2 class="t">Why we ask</h2><p class="sub">Your answers help us show goals and results that fit you. We don\'t save anything unless you choose to, and nothing is shared with an adviser without your say. This is guidance, not advice.</p><button class="btn" data-a="closesheet">Got it</button>';
  if (t === 'save') h = '<h2 class="t">Save and come back later</h2><p class="sub">We\'ll email you a secure link. No password, and no money details yet.</p><div class="field"><label for="sv-email">Email</label><input class="in" id="sv-email" type="email" autocomplete="email" value="' + esc(S.save.email) + '"></div><label class="check"><input type="checkbox" id="sv-comms"' + (S.save.comms ? ' checked' : '') + '><span>Optional: send me tips and updates</span></label><p id="sverr" class="small" style="color:var(--gap-t)" role="alert"></p><button class="btn" data-a="dosave">Email me a link</button>';
  if (t === 'saveprompt') h = '<h2 class="t">Save your progress?</h2><p class="sub">Get a link by email so you can finish later. Optional.</p><button class="btn" data-a="sheet" data-p="save">Save my progress</button><button class="btn ghost" style="margin-top:10px" data-a="go" data-p="F4">Continue without saving</button>';
  if (t === 'money') h = '<h2 class="t">How LifeMap makes money</h2><p class="sub">LifeMap is free for you. If you work with an adviser, their firm may pay us a fee. Your adviser will tell you how they are paid before you agree to anything. Advisers never pay to see your data, and you decide what they can see.</p><button class="btn" data-a="closesheet">Got it</button>';
  if (t === 'assume') h = '<h2 class="t">What your plan assumes</h2><p class="small" style="margin:0 0 8px">Some values are set by law. The rest are your choice, with a suggestion or usual range to guide you.</p>' + gateHTML('sheet') + '<div class="card" style="box-shadow:none;background:var(--mist)">' + assumeSheet() + '</div>' + (S.app ? '<div style="margin-top:12px"><b style="font-size:14px">Choose your growth assumptions</b>' + assumeToggle() + '</div>' : '') + '<div style="margin-top:12px">' + inflChoice('sheet') + '</div>' + '<p class="small" style="margin:10px 0 0">' + RULES_VERSION + '</p><p class="small" id="b27-sheet" style="margin:6px 0 0">' + esc(BUDGET27) + '</p><button class="btn ghost" style="margin-top:10px" data-a="asmopen">Change your assumptions</button><p class="disc">Figures are in today\'s money unless noted. Investments can fall as well as rise. Illustrative only; not a guarantee.</p><button class="btn" data-a="closesheet">Close</button>';
  if (t === 'explain'){ const F = findings(project()); h = p === 'str' ? '<h2 class="t">Your main strength</h2><p class="sub">' + esc(F.sT) + '' + (F.best ? '. Of all your goals, this one is the best covered by your future income, savings and pension.' : '. We only call something a strength when a goal is fully covered and your everyday spending is paid for.') + '</p>' : p === 'gap' ? '<h2 class="t">Your main gap</h2><p class="sub">' + esc(F.gT) + '. When that goal comes up, your income and savings won\'t fully cover the cost with today\'s plan.' + (F.worst && goalLine(project(), F.worst) ? ' ' + goalLine(project(), F.worst) + '.' : '') + '</p>' : '<h2 class="t">Your biggest decision</h2><p class="sub">' + esc(F.dT) + '. Try it in <b>What if</b> below to see the effect. This is guidance, not advice.</p>'; h += '<button class="btn" data-a="closesheet">Got it</button>'; }
  if (t === 'other') h = '<h2 class="t">Something else</h2><p class="sub">Pick one, or name your own.</p><div class="chips">' + OTHER_LIST.map((o, k) => '<button class="chip" data-a="addother" data-p="' + k + '">' + o[0] + ' ' + o[1] + '</button>').join('') + '</div><div class="field" style="margin-top:14px"><label for="oth">Name it yourself</label><input class="in" id="oth" maxlength="30" placeholder="e.g. Kitchen renovation"></div><button class="btn" data-a="addother" data-p="own">Add my goal</button>';
  if (t === 'history') h = '<h2 class="t">Plan history</h2>' + S.versions.map((v, k) => '<div class="mini"><span><b>Version ' + (k + 1) + '</b> · ' + esc(v.note) + '</span><span class="small">' + v.date + '</span></div>').join('') + '<button class="btn" style="margin-top:12px" data-a="closesheet">Close</button>';
  if (t === 'delete') h = '<h2 class="t">Delete my data?</h2><p class="sub">Your plan, answers, figures and documents will be deleted. This can\'t be undone.</p><button class="btn" style="background:var(--gap-t)" data-a="dodelete">Delete everything</button><button class="btn ghost" style="margin-top:10px" data-a="closesheet">Keep my data</button>';
  if (t === 'profile') h = '<div class="adv"><span class="face" aria-hidden="true">' + esc((S.acct.name || 'A')[0]) + '</span><div><h2 class="t" style="margin:0">' + esc(S.acct.name || 'You') + '</h2><div class="small">' + (S.acct.pk ? 'Signed in with Face ID' : 'Signed in with email code') + '</div></div></div><button class="goal" style="margin-top:14px" data-a="me" data-p="privacy"><span class="ic">🔐</span><b style="flex:1">Privacy & preferences</b></button><button class="goal" data-a="me" data-p="details"><span class="ic">🙋</span><b style="flex:1">My details</b></button><button class="goal" data-a="signout"><span class="ic">🚪</span><b style="flex:1">Sign out</b></button>';
  // The dialog is named by its own heading (never an internal key). Every sheet has an h2; it also takes focus when nothing else should.
  let lab = '';
  if (t === 'ex') lab = ' aria-labelledby="ex-t" aria-describedby="ex-s"';
  else { let done = false; h = h.replace(/<h2\b([^>]*)>/, (m0, at) => { if (done) return m0; done = true; return '<h2' + at.replace(/\s(id|tabindex)="[^"]*"/g, '') + ' id="sheet-t" tabindex="-1">'; }); lab = done ? ' aria-labelledby="sheet-t"' : ' aria-label="Dialog"'; }
  return '<div class="sheet-bg" data-a="closesheet"><div class="sheet' + (s === 'ask' ? ' chatsheet' : '') + '" role="dialog" aria-modal="true"' + lab + ' data-a="noop"><div class="grab"></div><button class="sx" data-a="closesheet" aria-label="Close">✕</button>' + h + '</div></div>';
}

/* ================= REPORT (printable) ================= */
let reportFrom = '';
const setBg = on => ['.stage', '.side'].forEach(q => { const e = document.querySelector(q); if (e) e.inert = on; });   // the page behind the report can't be tabbed to
function closeReport(){ const R = document.getElementById('report'); if (!R.classList.contains('on')) return; R.classList.remove('on'); setBg(false); let b = null; try { b = document.querySelector('#screen [data-a="report"]') || (reportFrom && document.querySelector(reportFrom)); } catch (e) {} if (b) b.focus({preventScroll:true}); else { const h = document.querySelector('#screen h2[tabindex]'); if (h) h.focus({preventScroll:true}); } }
/* The report (journey-spec §28): reportData() gives every number and sentence, LifeMapReport.reportPages() draws the 11+ A4 pages (renderer: tools/report/report-renderer.js, embedded below). */
const REP_ART = {'house-for-sale':'--art-mortgage', 'retired-reading':'--art-pension', 'team-with-charts':'--art-investing', 'money-plant':'--art-savings', 'car-and-calculator':'--art-everyday', 'magnifier-map':'--cover-photo'};
const repPhotoCache = {};
function repPhotoSrc(name){ if (repPhotoCache[name]) return repPhotoCache[name]; const v = REP_ART[name] ? getComputedStyle(document.documentElement).getPropertyValue(REP_ART[name]) : ''; const m = v.match(/url\(\s*["']?([^"')]+)["']?\s*\)/); return (repPhotoCache[name] = m ? m[1] : 'media/' + name + '.jpg'); }
let repLast = null;
function repBuild(){ const d = reportData(); if (!d || d.ready === false) return null; const out = LifeMapReport.reportPages(d, {photoSrc:repPhotoSrc}); return {data:d, css:out.css, pages:out.pages}; }
function repFit(){ const R = document.getElementById('report'); if (!R.classList.contains('on')) return; R.style.setProperty('--lmr-s', Math.min(1, Math.max(0.3, (R.clientWidth - 24) / 794)).toFixed(4)); }
addEventListener('resize', repFit);
function openReport(){ if (!planReady()){ S.sheet = 'gate|report'; render(); return; }
  let rep = null; try { rep = repBuild(); } catch (e) { rep = null; }
  if (!rep){ S.sheet = 'gate|report'; render(); toast('We need a little more to build your report.'); return; }
  repLast = rep;
  let st = document.getElementById('lmr-css'); if (!st){ st = document.createElement('style'); st.id = 'lmr-css'; document.head.appendChild(st); } st.textContent = rep.css;
  const h = '<div class="rep-bar"><b>Your plan</b><button data-r="print" style="background:var(--sun);color:var(--ink)">⬇ Download my plan</button><span id="rep-msg" role="status" aria-live="polite" style="font-size:13px;font-weight:700;flex:1 1 220px"></span><button data-r="close" style="background:#fff;color:var(--ink)">Close</button></div>' +
    '<div class="lmr-wrap" tabindex="0" role="region" aria-label="Your plan report, ' + rep.pages.length + ' pages. Scroll to read.">' + rep.pages.map(x => '<div class="lmr-slot">' + x + '</div>').join('') + '</div>';
  const R = document.getElementById('report'); R.innerHTML = h; reportFrom = selFor(document.activeElement); R.classList.add('on'); R.scrollTop = 0; repFit(); R.querySelector('[data-r="print"]').focus();
  if (!S.versions.some(v => /report/.test(v.note))) S.versions.push({note:'Report downloaded', date:'29 Sep 2026'});
}

/* ================= SAVING FILES (journey-spec §24.3) =================
   Inside the shared page the viewer blocks printing and downloads, so files go through the "downloads" capability:
     claude.use("downloads").save({filename, data}).   Allowed file types: gif png jpg jpeg webp mp4 webm txt json md docx pptx epub csv ttf html svg pdf xlsx zip.
   The plan report: PDF (jsPDF + html2canvas, loaded from cdnjs only when the button is pressed) -> if that fails, the self-contained report as .html
   -> if downloads isn't available (the standalone file opened locally), window.print().
   The adviser meeting: ".ics" isn't allowed, so with downloads we save the details as a .txt; opened locally the normal .ics download still works. */
const CDN_JSPDF = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', CDN_H2C = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
const dlPossible = () => { try { return !!(window.claude && typeof window.claude.use === 'function'); } catch (e) { return false; } };
async function dlGet(){ try { if (dlPossible()){ const d = await window.claude.use('downloads'); if (d && typeof d.save === 'function') return d; } } catch (e) {} return null; }
async function dlSave(filename, blob){ const d = await dlGet(); if (!d) return false;
  try { await d.save({filename, data:blob}); return true; } catch (e) { try { await d.save({filename, data:await blob.arrayBuffer()}); return true; } catch (e2) { return false; } } }
function loadScript(src){ return new Promise((res, rej) => { const old = document.querySelector('script[data-lib="' + src + '"]'); if (old) old.remove(); const el = document.createElement('script'), t = setTimeout(() => { el.remove(); rej(new Error('timeout ' + src)); }, 20000);
  el.src = src; el.async = true; el.dataset.lib = src; el.onload = () => { clearTimeout(t); res(); }; el.onerror = () => { clearTimeout(t); el.remove(); rej(new Error('load ' + src)); }; document.head.appendChild(el); }); }
async function pdfLibs(){ if (!(window.jspdf && window.jspdf.jsPDF)) await loadScript(CDN_JSPDF); if (typeof window.html2canvas !== 'function') await loadScript(CDN_H2C);
  if (!(window.jspdf && window.jspdf.jsPDF) || typeof window.html2canvas !== 'function') throw new Error('PDF library missing'); return {jsPDF:window.jspdf.jsPDF, h2c:window.html2canvas}; }
// Invisible text over the page picture: the PDF looks the same, but words can be searched, copied and read by screen readers.
function pdfTextLayer(pdf, el){ const box = el.getBoundingClientRect(), k = 210 / box.width, w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), rg = document.createRange(); let n;
  while ((n = w.nextNode())){ const t = n.nodeValue; if (!t.trim()) continue; const re = /\S+/g; let m;
    while ((m = re.exec(t))){ rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length); const r = rg.getBoundingClientRect(); if (!r.width || !r.height) continue;
      const txt = m[0].replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[\u2013\u2014]/g, '-').replace(/[^\x20-\x7E\u00A3\u20AC]/g, '');
      if (!txt) continue; pdf.setFontSize(Math.max(r.height * k * 2.83 * 0.7, 3)); pdf.text(txt, (r.left - box.left) * k, (r.bottom - box.top) * k - r.height * k * 0.2, {renderingMode:'invisible'}); } } }
// A4 (210 x 297 mm). One canvas per report page (794 x 1123 px at 2x), placed full-page, so the PDF pages are exactly the report pages.
async function buildPlanPdf(){ const {jsPDF, h2c} = await pdfLibs(), rep = repBuild(); if (!rep) throw new Error('no report');
  const host = document.createElement('div'); host.setAttribute('aria-hidden', 'true'); host.style.cssText = 'position:fixed;left:-12000px;top:0;width:794px;background:#fff;z-index:-1';
  const sty = document.createElement('style'); sty.textContent = rep.css; host.appendChild(sty);
  const wrap = document.createElement('div'); wrap.innerHTML = rep.pages.join(''); host.appendChild(wrap); document.body.appendChild(host);
  try { await (document.fonts && document.fonts.ready); await Promise.all([...host.querySelectorAll('img')].map(im => im.complete ? 1 : new Promise(r => { im.onload = im.onerror = r; })));
    const pdf = new jsPDF({unit:'mm', format:'a4', orientation:'portrait', compress:true}), els = [...wrap.querySelectorAll('.lmr-pg')];
    for (let i = 0; i < els.length; i++){ const cv = await h2c(els[i], {scale:2, width:794, height:1123, backgroundColor:'#ffffff', useCORS:true, logging:false, windowWidth:794});
      if (i) pdf.addPage(); pdf.addImage(cv.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, 210, 297, undefined, 'FAST'); try { pdfTextLayer(pdf, els[i]); } catch (e) {} }
    return {blob:pdf.output('blob'), pages:els.length}; }
  finally { host.remove(); } }
function reportDocHTML(){ const rep = repBuild(); if (!rep) return ''; return LifeMapReport.reportDocument(rep.data, {photoSrc:repPhotoSrc}); }
function repMsg(t, bad){ const e = document.getElementById('rep-msg'); if (e){ e.textContent = t; e.style.color = bad ? '#FFD2CF' : '#C9F2DD'; } toast(t); }
let saving = false;
async function saveReport(btn){ if (saving) return;
  if (!(await dlGet())){ repMsg('Opening the print window. Choose "Save as PDF" as the printer.');
    // A sandboxed viewer can ignore print() without an error. The browser's beforeprint event tells us whether a print window really opened.
    let opened = false; const mark = () => { opened = true; }; addEventListener('beforeprint', mark);
    try { window.print(); } catch (e) { removeEventListener('beforeprint', mark); repMsg('Printing is blocked here. Open this page in your browser to save the PDF.', true); return; }
    setTimeout(() => { removeEventListener('beforeprint', mark); if (!opened) repMsg('Nothing opened. Printing looks blocked here. Open this page in your browser to save the PDF.', true); }, 500); return; }
  saving = true; if (btn) btn.disabled = true; repMsg('Preparing your PDF…');
  try { const r = await buildPlanPdf(), ok = await dlSave('LifeMap-plan.pdf', r.blob); if (!ok) throw new Error('save'); repMsg('Saved LifeMap-plan.pdf (' + r.pages + (r.pages === 1 ? ' page' : ' pages') + ').'); }
  catch (e) { const ok = await dlSave('LifeMap-plan.html', new Blob([reportDocHTML()], {type:'text/html'}));
    repMsg(ok ? 'We couldn\'t make the PDF here, so we saved your plan as LifeMap-plan.html. Open it and choose Print to get a PDF.' : 'We couldn\'t save your plan here. Please try again, or open this page in your browser.', !ok); }
  finally { saving = false; if (btn) btn.disabled = false; } }
async function saveMeeting(){ const b = S.book, A = ADVISERS[b.adv];
  const ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//LifeMap//Prototype//EN\r\nBEGIN:VEVENT\r\nUID:lg-' + Date.now() + '\r\nDTSTAMP:20260929T090000Z\r\nDTSTART:20261001T090000Z\r\nDURATION:PT45M\r\nSUMMARY:LifeMap meeting with ' + A.n + '\r\nDESCRIPTION:' + b.mode + ' · ' + b.slot + '\r\nEND:VEVENT\r\nEND:VCALENDAR';
  if (await dlGet()){ const txt = 'Your LifeMap adviser meeting\r\n\r\nWith: ' + A.n + '\r\nWhen: ' + b.slot + '\r\nHow: ' + b.mode + '\r\nLength: 45 minutes\r\n\r\nAdd it to your calendar by hand. Confirmation was sent by email and SMS.\r\nGuidance, not advice.\r\n';
    const ok = await dlSave('LifeMap-meeting.txt', new Blob([txt], {type:'text/plain'})); toast(ok ? 'Meeting details saved as LifeMap-meeting.txt' : 'We couldn\'t save the file. Your meeting details are on this screen.'); return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], {type:'text/calendar'})); a.download = 'lifemap-meeting.ics'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 20000); toast('Calendar file prepared. Check your downloads.'); }
/* ================= RENDER ================= */
function current(){ if (S.admin) return V.SET();
  if ((S.shell || S.app) && S.tab === 'explore') return exploreScreen();
  if (!S.app && S.shell){ if (S.tab === 'home') return V.HOME0(); if (S.tab === 'plan'){ if (!S.pb) return V.PLAN0(); if (S.scr === 'P3') return V.P3(); if (S.scr === 'PU') return V.PU(); return (V[S.scr] && !/^D/.test(S.scr) ? V[S.scr] : V.B1)(); }
    if (S.tab === 'me') return V.ME(); return V.EXP(); }
  if (S.app){ if (S.tab === 'home') return V.HOME(); if (S.tab === 'plan') return S.planSeg === 'add' ? V.GOALS() : V.PLAN(); if (S.tab === 'me') return S.me === 'fin' ? finScreen() : V.ME(); return S.exp === 'fin' ? finScreen() : V.EXP(); }
  if (/^D[2-7]$/.test(S.scr)) return V.DQ();
  if (S.scr === 'P3') return V.P3(); if (S.scr === 'PU') return V.PU();
  return (V[S.scr] || V.D0)();
}
/* ---------- Admin view: Settings (journey-spec §19.6). Shown in the prototype for LifeMap and partners. NOT for customers. ---------- */
function setFmt(s, v){ return v == null ? 'none' : s.u === 'pct' ? pcs(v) : s.u === 'eur' ? eur(v) : s.u === 'yrs' ? v + (v === 1 ? ' year' : ' years') : s.u === 'choice' ? (((ASM[Object.keys(ASM).find(a => ASM[a].sug && ASM[a].o && SET[a] === s)] || {}).o || []).find(o => String(o[0]) === String(v)) || [0, String(v)])[1] : s.u === 'pct3' ? v.map(pcs).join(' / ') : String(v); }
function setInput(k, s){ const pv = s.pv, id = 'set-' + k;
  if (s.u === 'pct3') return '<div class="row" style="gap:6px;flex-wrap:wrap">' + s.v.map((x, i) => '<input class="in" style="width:84px" id="' + id + '-' + i + '" data-set="' + k + '|' + i + '" inputmode="decimal" aria-label="Partner figure ' + (i + 1) + ' for ' + esc(s.n) + ' (%)" value="' + (pv ? +(pv[i] * 100).toFixed(2) : '') + '" placeholder="' + +(x * 100).toFixed(2) + '">').join('') + '<span class="small">%</span></div>';
  if (s.u === 'choice'){ const a = Object.keys(ASM).find(x => ASM[x].sug && ASM[x].o && SET[x] === s), o = a ? ASM[a].o : []; return '<select class="in" id="' + id + '" data-set="' + k + '" aria-label="Partner figure for ' + esc(s.n) + '"><option value="">LifeMap standard</option>' + o.map(([v, l]) => '<option value="' + v + '"' + (String(pv) === String(v) ? ' selected' : '') + '>' + esc(l) + '</option>').join('') + '</select>'; }
  return '<div class="row" style="gap:6px"><input class="in" style="width:110px" id="' + id + '" data-set="' + k + '" inputmode="decimal" aria-label="Partner figure for ' + esc(s.n) + (s.u === 'pct' ? ' (%)' : '') + '" value="' + (pv != null ? (s.u === 'pct' ? +(pv * 100).toFixed(3) : pv) : '') + '" placeholder="' + (s.v == null ? 'none' : s.u === 'pct' ? +(s.v * 100).toFixed(3) : s.v) + '"><span class="small">' + (s.u === 'pct' ? '%' : s.u === 'eur' ? '€' : s.u === 'yrs' ? 'years' : '') + '</span></div>'; }
/* M6: sane limits for a partner's own figure (same units as the value: 0.03 = 3%). Outside them the figure is refused with a clear message.
   The tax-free lump sum can never be more than the 25% legal limit; growth standards have a ceiling so a provider cannot make a plan look better than it is. */
const SETBOUNDS = {infl:[0, 0.06], wage:[0, 0.06], cash:[0, 0.04], inv:[0, 0.06], invGross:[0, 0.08], pen:[0, 0.07], penRet:[0, 0.06], rentRise:[0, 0.08], houseGrow:[0, 0.06], upkeep:[0, 0.03], ownShare:[0, 1], retireMult:[15, 40], retireSpend:[0.4, 1], lumpSum:[0, 0.25],
  safetyMonths:[1, 12], safetyMonthsTwo:[1, 12], cashYears:[1, 10], investShare:[0, 1], cgtGain:[0, 1], saveShare:[0, 1], noAnswer:[0, 5000], lifeShare:[0.3, 1], lifeYears:[1, 30], mortRate:[0.005, 0.1], loanRate:[0, 0.3], cardRate:[0, 0.35], depRate:[0, 0.06], buyFees:[0, 50000], fundChg:[0, 0.05], waitYears:[0, 20], style:[1, 3]};
const setBoundMsg = k => { const b = SETBOUNDS[k], s = SET[k]; if (!b) return ''; const f = x => s.u === 'pct' ? (+(x * 100).toFixed(2)) + '%' : s.u === 'eur' ? eur(x) : String(x); return 'Allowed: ' + f(b[0]) + ' to ' + f(b[1]) + (k === 'lumpSum' ? ' (25% is the legal limit)' : ''); };
function settingsHTML(){ const grps = []; Object.entries(SET).forEach(([k, s]) => { let g = grps.find(x => x[0] === s.grp); if (!g) grps.push(g = [s.grp, []]); g[1].push(k); });
  return '<div class="note" role="note" style="background:#FFF3CD;border:1.5px solid #E0B84A"><b>🔒 Admin view · not for customers.</b> LifeMap or a partner (credit union, adviser firm, company, agent) controls these standards. A figure changed here changes the suggestion everywhere, in the app and in the workbook\'s Settings sheet. Customers can still change any of them for their own plan. Law values (tax, USC, PRSI, pension relief, State Pension, Central Bank limits) are not here and can\'t be changed. Retirement age and life expectancy have no standard.</div>' +
    '<div class="card"><div class="field" style="margin:0"><label for="set-partner">Partner name (customers then read "Suggested by …" beside any figure you change)</label><input class="in" id="set-partner" data-setname="1" value="' + esc(SETTINGS.partner) + '" autocomplete="off" placeholder="e.g. a credit union"></div>' + (Object.values(SET).some(s => s.pv != null) || SETTINGS.partner ? '<button class="link" data-a="setreset" data-p="all" style="margin-top:8px">Back to the LifeMap standards</button>' : '') + '</div>' +
    grps.map(([g, ks]) => '<details class="card asmg" data-g="set-' + esc(g) + '"' + (S.asmOpen === 'set-' + g ? ' open' : '') + '><summary style="cursor:pointer;font-weight:800;min-height:44px">' + esc(g) + ' (' + ks.length + ')</summary><div style="margin-top:10px">' +
      ks.map(k => { const s = SET[k]; return '<div class="field" style="margin:0 0 16px"><span class="flabel" id="setl-' + k + '">' + esc(s.n) + (s.pv != null ? ' <span class="tag doc">Changed by ' + esc(SPN()) + '</span>' : '') + '</span>' +
        '<span class="small" style="display:block">LifeMap standard: <b>' + esc(setFmt(s, s.v)) + '</b> · ' + esc(s.label || s.by) + ' · as at ' + esc(s.asat) + (s.verify ? ' · <b>verify before release</b>' : '') + '</span>' + (s.guide ? '<span class="small" style="display:block">Guidance: ' + esc(s.guide) + '</span>' : '') + (s.note ? '<span class="small" style="display:block">Note: ' + esc(s.note) + '</span>' : '') +
        (s.src ? '<span class="small" style="display:block;word-break:break-all">Source: ' + esc(s.src) + '</span>' : '') + '<span class="small" style="display:block;margin:4px 0">Partner figure (leave blank for the LifeMap standard):</span>' + setInput(k, s) + (SETBOUNDS[k] ? '<span class="small" style="display:block" id="setb-' + k + '">' + esc(setBoundMsg(k)) + '</span>' : '') + (S.setMsg && S.setMsg.k === k ? '<span class="small" role="alert" style="display:block;color:var(--alert-t)" id="setm-' + k + '">' + esc(S.setMsg.msg) + '</span>' : '') + (s.pv != null ? '<button class="link" data-a="setreset" data-p="' + k + '">Reset</button>' : '') + '</div>'; }).join('') + '</div></details>').join('') +
    '<details class="card asmg" data-g="set-guide"><summary style="cursor:pointer;font-weight:800;min-height:44px">Guidance figures (no standard)</summary><div style="margin-top:10px">' + Object.entries(SETTINGS.g).map(([k, s]) => '<div class="field" style="margin:0 0 12px"><span class="flabel">' + esc(s.n) + '</span><span class="small" style="display:block">' + s.v + ' · ' + esc(s.by) + ' · as at ' + esc(s.asat) + ' · <b>verify before release</b></span></div>').join('') + '<p class="small">Life expectancy is only ever shown as guidance. It is never a default: each customer picks their own plan-until age.</p></div></details>'; }
V.SET = () => ({id:'ADMIN-SET', note:'ADMIN VIEW (journey-spec §19.6, option C): the Settings block, controlled by LifeMap or a partner. Not shown to customers.', head:appHead('Settings', '🔒 Admin view · not for customers', 'adminclose'), html:settingsHTML()});
function finScreen(){ return S.upl ? V.PU() : S.fsec != null ? V.P3() : V.P2(); }
/* ================= Emoji are decoration, never read aloud (journey-spec §17) =================
   In every title, heading, card title, tile, list row, chip, button and link, emoji runs are wrapped in aria-hidden spans,
   so the accessible name is words only. Runs on every render, the report, and any later partial update (MutationObserver). */
const EMO_RUN = /(?:\p{Extended_Pictographic}|\p{Regional_Indicator})(?:\uFE0F|\u20E3|[\u{1F3FB}-\u{1F3FF}]|\u200D(?:\p{Extended_Pictographic}|\p{Regional_Indicator})\uFE0F?|\p{Regional_Indicator})*/gu;
const EMO_NAMED = 'h1,h2,h3,h4,h5,h6,[role=heading],.card > b,.card > div > b,.ck b,.mini > span:first-child,.mini > b,button,a,summary,label,.tag,.pill,.eyebrow,.otag';
function hideEmoji(root){ if (!root) return; const els = root.matches && root.matches(EMO_NAMED) ? [root] : []; root.querySelectorAll && els.push(...root.querySelectorAll(EMO_NAMED));
  els.forEach(el => { if (el.hasAttribute('aria-label') || el.closest('[aria-hidden="true"]')) return;
    const words = (() => { const c = el.cloneNode(true); c.querySelectorAll('[aria-hidden="true"]').forEach(x => x.remove()); return c.textContent.replace(EMO_RUN, '').trim(); })(); if (!words) return;   // never leave a control with no name
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {acceptNode:n => n.parentElement.closest('[aria-hidden="true"]') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT}), nodes = [];
    while (tw.nextNode()) { EMO_RUN.lastIndex = 0; if (EMO_RUN.test(tw.currentNode.nodeValue)) nodes.push(tw.currentNode); }
    nodes.forEach(n => { const f = document.createDocumentFragment(); let last = 0; const v = n.nodeValue; EMO_RUN.lastIndex = 0; let m;
      while ((m = EMO_RUN.exec(v))) { if (m.index > last) f.appendChild(document.createTextNode(v.slice(last, m.index))); const sp = document.createElement('span'); sp.setAttribute('aria-hidden', 'true'); sp.textContent = m[0]; f.appendChild(sp); last = m.index + m[0].length; }
      if (last < v.length) f.appendChild(document.createTextNode(v.slice(last))); n.parentNode.replaceChild(f, n); }); }); }
const emoObs = new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) hideEmoji(n.closest && n.closest(EMO_NAMED) ? n.closest(EMO_NAMED) : n); else if (n.nodeType === 3 && n.parentElement && !n.parentElement.closest('[aria-hidden="true"]')) { const h = n.parentElement.closest(EMO_NAMED); if (h) hideEmoji(h); } })));
let lastId = null, focusKey = null, sheetFrom = null;
// The control that opened a sheet, as a selector, so focus can go back to it when the sheet closes (Esc, Close or any button)
function selFor(el){ if (!el || el === document.body || !el.closest || !el.closest('#screen')) return ''; if (el.id) return '#' + CSS.escape(el.id); if (el.dataset && el.dataset.a){ let q = '[data-a="' + el.dataset.a + '"]'; if (el.dataset.p != null) q += '[data-p="' + el.dataset.p.replace(/"/g, '\\"') + '"]'; return q; } return ''; }
function render(){ wall(); syncAges(); syncLists(); syncSafety();
  if (S.sheet && sheetFrom === null) sheetFrom = selFor(document.activeElement);
  const scr = document.getElementById('screen'), sc0 = scr.querySelector('.scroll,.qbody'), top0 = sc0 ? sc0.scrollTop : 0;
  const s = current(), same = s.id === lastId;
  let html;
  if (s.kind === 'quiz') html = '<div class="quiz">' + s.html + '</div>';
  else html = (phoneLandscape() ? '<div class="app"><div class="scroll" id="main"><header class="sky">' + (s.head || '') + '</header>' + s.html + '</div>'
    : '<div class="app"><header class="sky">' + (s.head || '') + '</header><div class="scroll" id="main">' + s.html + '</div>') + (s.foot ? '<div class="foot">' + s.foot + '</div>' : '') +
    ((S.app || S.shell) && !(S.pb && !S.app && S.tab === 'plan') ? '<nav class="tabs" aria-label="Main"><div class="nav-brand">' + brand2() + '</div>' + [['home','Home'],['explore','Explore'],['plan','My Plan'],['me','Me'],['exp','Experts']].map(([k, l]) => k === 'plan' ? '<button class="center' + (S.tab === k ? ' on' : '') + '" data-a="tab" data-p="plan" aria-current="' + (S.tab === k ? 'page' : 'false') + '"><span class="fab">' + ICON.plan + '</span>' + l + '</button>' : '<button class="' + (S.tab === k ? 'on' : '') + '" data-a="tab" data-p="' + k + '" aria-current="' + (S.tab === k ? 'page' : 'false') + '">' + ICON[k] + l + '<span class="dot"></span></button>').join('') + '</nav>' : '') + '</div>';
  const onboarding = /^D([0-7]|R|S)$/.test(s.id);   // journey-spec §17: Ask appears once the customer enters the app
  if (false) html += '<button class="askfab" data-a="ask" aria-label="Ask: help and plain-English explanations"><span aria-hidden="true">💬</span>Ask</button>';
  html += sheetHTML(s.id);
  scr.innerHTML = html; hideEmoji(scr); goalIcons(scr);
  { const hd = scr.querySelector('.app > header.sky'), mn = scr.querySelector('.app > .scroll'); if (hd && mn && hd.querySelector(':scope > .topbar.hdr, :scope > .pbrow') && hd.parentElement === mn.parentElement){ const rest = [...hd.children].filter(c => !c.classList.contains('topbar') && !c.classList.contains('pbrow')); if (rest.length){ const w = document.createElement('div'); w.className = 'pghead'; rest.forEach(c => w.appendChild(c)); mn.prepend(w); } } }   // v124: page titles scroll with the page; only the logo bar stays pinned
  if (!same){ scr.classList.remove('enter'); void scr.offsetWidth; scr.classList.add('enter'); }   // layout v7: content rises in on a new screen
  if (!same && !RM()) countUp(scr);
  fndWatch(scr);   // v13: big figures count up when a screen opens
  if (!same && scr.querySelector('.ro.live')) orbitSpin(scr.querySelector('.ro.live'));   // v23: the cover wheel turns smoothly, photos stay upright
  const sc = scr.querySelector('.scroll,.qbody'); if (sc && same){ sc.style.scrollBehavior = 'auto'; sc.scrollTop = top0; requestAnimationFrame(() => { sc.style.scrollBehavior = ''; }); }   // keep the reader's place instantly: no jump to the top and glide back
  lastId = s.id;
  bind();
  if (s.id === 'XPL-TOPIC' && scr.querySelector('#xfab')) mpAfter(); else if (mpCleanup){ mpCleanup(); mpCleanup = null; }
  let closing = false; if (!S.sheet && sheetFrom !== null){ closing = true; if (!focusKey && sheetFrom && same) focusKey = sheetFrom; sheetFrom = null; }
  let fk = null; try { fk = focusKey && scr.querySelector(focusKey); } catch (e) {}
  if (fk) fk.focus({preventScroll:!S.sheet});
  else if (S.sheet){ const f = (S.sheet === 'ask' ? null : scr.querySelector('.sheet input:not([type=checkbox]),.sheet .btn')) || scr.querySelector('.sheet h2'); if (f) f.focus(); }
  else if (!same && !(document.activeElement && document.activeElement.matches('#screen input'))){ const h = scr.querySelector('h2[tabindex]'); if (h) h.focus({preventScroll:true}); }
  if (closing && (!document.activeElement || document.activeElement === document.body)){ const h = scr.querySelector('h2[tabindex]'); if (h) h.focus({preventScroll:true}); }   // never leave focus on the page body after a dialog closes
  focusKey = null;
  if (S.planGo && S.app && S.tab === 'plan'){ const t = {results:'r-res', wi:'r-wi', fnd:'r-fnd'}[S.planGo], m = document.getElementById('main'); if (t && document.getElementById(t)) document.getElementById(t).scrollIntoView({block:'start', behavior:'instant'}); else if (m) m.scrollTo({top:0, behavior:'instant'}); }
  S.planGo = null;
  document.getElementById('curid').textContent = s.id + ' · ' + s.note;
  document.querySelectorAll('#jumps button').forEach(b => b.classList.toggle('on', b.dataset.id === s.id));
  syncSoon();
}
function go(id){ S.scr = id; S.sheet = null; render(); }
let toastT = null;
function toast(msg){ const t = document.getElementById('toast'); t.innerHTML = '<div class="t"><span aria-hidden="true">✨</span>' + esc(msg) + '</div>'; clearTimeout(toastT); toastT = setTimeout(() => { t.innerHTML = ''; }, /couldn't|can't|blocked|nothing opened|first\b/i.test(msg) ? 8000 : 2800); }   // problems stay longer so they can be read
function rankHTML(ctx){ const gs = rankList(); if (gs.length < 2) return '';
  return '<div' + (ctx === 'plan' ? '' : ' class="card"') + ' id="rank-' + ctx + '"><h3 class="h" style="margin:0 0 2px' + (ctx === 'plan' ? ';position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)' : '') + '" id="rank-h-' + ctx + '">Which goal first?</h3><p class="small" style="margin:0 0 8px">Savings go to the top goal first. Drag a goal to reorder.</p>' +
    '<ol class="rank" aria-labelledby="rank-h-' + ctx + '" style="list-style:none;margin:0;padding:0">' + gs.map((g, i) => '<li class="mini rk-r" data-gid="' + g.id + '" style="align-items:center"><span class="rk-grip" aria-hidden="true" title="Drag to reorder"><i></i><i></i><i></i><i></i><i></i><i></i></span><span class="rk-n">' + (i + 1) + '</span><span class="rk-e" aria-hidden="true">' + g.e + '</span><span style="flex:1;min-width:0"><b class="rk-t">' + esc(g.name) + '</b><span class="small">' + (g.kind === 'retire' ? 'Paid from your pension' : g.kind === 'legacy' ? 'What is left at the end' : (YEAR0 + g.age - S.about.age) + ' · age ' + g.age) + '</span></span>' +
      '<span class="rk-arr"><button class="chip sm" data-a="grank" data-p="' + g.id + '|up" aria-label="Move ' + esc(g.name) + ' up, now ' + (i + 1) + ' of ' + gs.length + '"' + (i === 0 ? ' aria-disabled="true"' : '') + '>▲</button><button class="chip sm" data-a="grank" data-p="' + g.id + '|down" aria-label="Move ' + esc(g.name) + ' down, now ' + (i + 1) + ' of ' + gs.length + '"' + (i === gs.length - 1 ? ' aria-disabled="true"' : '') + '>▼</button></span></li>').join('') + '</ol>' +
    '<p class="small" role="status" id="rank-msg-' + ctx + '" style="margin:6px 0 0">' + esc(S.rankMsg || '') + '</p>' + (S.rank ? '<button class="link" data-a="grankreset">Back to our suggested order</button>' : '') + '</div>'; }
function version(note){ S.versions.push({note, date:'29 Sep 2026'}); }
function toResults(){ S.scr = 'U1'; render(); setTimeout(() => { S.app = true; S.pb = false; S.shell = true; S.tab = 'plan'; S.planSeg = 'main'; S.planGo = 'results'; if (!S.versions.some(v => /results/.test(v.note))) version('First results'); render(); }, RM() ? 300 : 1400); }
function finBack(){ if (S.from === 'check'){ S.from = null; S.fsec = null; if (S.app) { render(); } else go('P4'); return; } S.fsec = null; if (S.app){ if (S.tab === 'me'){ S.me = 'money'; } } else S.scr = 'P2'; render(); }
function openSec(i){ S.fsec = +i; S.upl = null; if (S.app){ if (S.tab !== 'exp'){ S.tab = 'me'; S.me = 'fin'; } } else S.scr = 'P3'; S.sheet = null; render(); }

/* ================= ACTIONS ================= */
const ACT = {
  go:p => go(p), sheet:p => { S.sheet = p; render(); }, closesheet:() => closeSheet(), noop:() => {}, toast:p => toast(p),
  invite:() => { const v = (document.getElementById('inv') || {}).value; S.entry = 'adviser invite' + (v ? ' ' + v : ''); S.sheet = null; render(); toast('Invite linked'); },
  why:p => { const k = p, i = S.why.indexOf(k); if (i >= 0) { S.why.splice(i, 1); if (k === 'other') S.whyNote = ''; } else S.why.push(k); focusKey = '[data-a="why"][data-p="' + k + '"]'; render(); },
  dstart:() => { S.di = 0; go('D2'); },
  dpick:p => { const q = DISC6[S.di]; S.ans[q.id] = +p; document.querySelectorAll('#screen .opt[data-a="dpick"]').forEach(b => { const on = b.dataset.p === String(p); b.classList.toggle('sel', on); b.setAttribute('aria-pressed', on); });   // v24: mark in place, no re-render (no flicker)
    const i = S.di; setTimeout(() => { if (S.scr === 'D' + (i + 2) && DISC6[S.di] === q) dnext(); }, RM() ? 0 : 450); },   // one tap advances (journey-spec); the choice shows for a moment first
  dnext:() => dnext(), dgoto:p => { S.di = +p; go('D' + (S.di + 2)); }, dprev:() => { if (S.scr === 'DR'){ S.di = DISC6.length - 1; go('D' + (S.di + 2)); return; } if (S.di <= 0) go('D1'); else { S.di--; go('D' + (S.di + 2)); } },
  age:p => { const d = +p.split('|')[1]; S.about.age = clamp((S.about.age == null ? 40 : S.about.age) + d, 18, 80); focusKey = '[data-a="age"][data-p="x|' + d + '"]'; render(); },
  asmset:p => { const i = p.indexOf('|'), k = p.slice(0, i), raw = p.slice(i + 1), d = ASM[k], v = d.o && typeof d.o[0][0] === 'number' ? +raw : raw; S.asm = Object.assign({}, S.asm, {[k]:v}); applyAssume(); focusKey = '[data-a="asmset"][data-p="' + p + '"]'; render(); },
  asmreset:p => { S.asm = Object.assign({}, S.asm); delete S.asm[p]; applyAssume(); render(); toast('Back to the suggested value'); },
  asmall:() => ACT.useall('asm'),
  useall:p => { const n = useAllStd(p === 'p4'); version('Standard used for the choices not made yet'); focusKey = p === 'p4' ? '#p4-rest h3' : null; render(); toast(n ? 'Standard used for ' + n + (n === 1 ? ' choice' : ' choices') : 'Every choice is already made'); },
  asmsug:p => { const s = mkSug(ASM[p]); if (!s) return; if (S.advRate) delete S.advRate[p]; S.asm = Object.assign({}, S.asm, {[p]:s.v}); applyAssume(); focusKey = '[data-k="' + p + '"] .flabel'; render(); },
  asmcap:p => { S.asm = Object.assign({}, S.asm, {[p]:GD.cardCap}); if (S.advRate) delete S.advRate[p]; applyAssume(); version('Credit-card rate: the legal limit for new cards'); focusKey = '[data-k="' + p + '"] .flabel'; render(); },
  asmadv:p => { S.asm = Object.assign({}, S.asm, {[p]:ASM[p].fb()}); S.advRate = Object.assign({}, S.advRate, {[p]:true}); applyAssume(); version('Rate left for my adviser (planning rate used)'); focusKey = '[data-k="' + p + '"] .flabel'; render(); },
  asmstd:p => { S.asm = Object.assign({}, S.asm, {[p]:ASM[p].sug()}); applyAssume(); focusKey = '[data-k="' + p + '"] .flabel'; render(); },   // kept for the calculators' older chips
  asmopen:p => { S.tab = 'me'; S.me = 'asm'; S.asmBack = 'meback'; S.sheet = null; render(); },
  gdate:p => { S.tab = 'plan'; S.planSeg = ''; S.planEdit = false; S.tlHl = +p; S.sheet = null; render(); const r = document.getElementById('row-' + p); if (r){ r.scrollIntoView({block:'center', behavior:'instant'}); const b = r.querySelector('.stepper button'); if (b) b.focus({preventScroll:true}); } },
  gofix:p => { S.tab = 'me'; S.me = 'asm'; S.asmBack = 'meback'; S.sheet = null; if (GATE_GRP[p]) S.asmOpen = GATE_GRP[p]; render(); jumpTo(p); },
  asmback:p => { S.asm = Object.assign({}, S.asm); delete S.asm[p]; if (S.advRate) delete S.advRate[p]; applyAssume(); focusKey = '[data-k="' + p + '"] .flabel'; render(); },
  ckset:p => { const t = xTop(); if (!t || t.v !== 'CALC') return; const [k, x] = p.split('|'), c = C(t.p), v = calcVals(c); v[k] = +x; S.calcT = S.calcT || {}; (S.calcT[c.id] = S.calcT[c.id] || {})[k] = true; focusKey = '[data-a="ckset"][data-p="' + p + '"]'; render(); },
  cred:p => { S.about.cred = Object.assign({}, S.about.cred); S.about.cred[p] = !S.about.cred[p]; focusKey = '[data-a="cred"][data-p="' + p + '"]'; render(); },
  married:p => { const v = p === 'Yes'; S.about.married = S.about.married === v ? null : v; focusKey = '[data-a="married"][data-p="' + p + '"]'; render(); },
  partner:p => { S.about.partner = p === 'Yes'; focusKey = '[data-a="partner"][data-p="' + p + '"]'; render(); },
  deps:p => { S.about.deps = +p; focusKey = '[data-a="deps"][data-p="' + p + '"]'; render(); },
  backd:() => go('B1'),
  dssave:() => { const e = (document.getElementById('ds-email').value || '').trim(); if (!/.+@.+\..+/.test(e)){ document.getElementById('dserr').textContent = 'Please enter a valid email, or tap Skip for now.'; return; }
    S.save = {email:e, comms:document.getElementById('ds-comms').checked, done:true, asked:true}; S.acct.email = e; afterDS('Saved ✓ Check your inbox for your link'); },
  dsskip:() => { S.save.asked = true; afterDS('Welcome! Make your plan whenever you\'re ready'); },
  sendotp:async () => { try { await AUTH.sendOtp(S.acct.email.trim()); go('P1E'); } catch (e) { toast("We couldn't send the code. Try again."); } },
  resend:async () => { try { await AUTH.sendOtp(S.acct.email.trim()); toast('New code sent'); } catch (e) { toast("We couldn't send the code. Try again."); } },
  signout:async () => { clearTimeout(syncT); await AUTH.signOut(); S = fresh(); lastSent = ''; lastId = null; render(); },
  drplan:() => { S.wantPlan = false; go('DS'); },   // after the quiz people land on Home (Make my plan lives there)
  gpick:p => { if (p === 'mfree' && noMort() && !S.goals.some(g => g.k === 'mfree')){ toast('Be mortgage-free is for homeowners with a mortgage. Your finances say: ' + S.fin.home); return; } if (p === 'other'){ S.sheet = 'other'; render(); return; }
    const i = S.goals.findIndex(g => g.k === p); if (i >= 0) S.goals.splice(i, 1); else S.goals.push(mkGoal(p)); if (S.wi.g != null && !gById(S.wi.g)) S.wi = {g:null, m:0, l:0}; focusKey = '[data-a="gpick"][data-p="' + p + '"]'; if (S.app) afterPlanEdit(); render(); },
  addother:p => { let c; if (p === 'own'){ const v = ((document.getElementById('oth') || {}).value || '').trim(); if (!v) { toast('Type a name for your goal'); return; } c = ['⭐', v.slice(0, 30), 10000, 4]; } else c = OTHER_LIST[+p];
    S.goals.push(mkGoal('other', c)); S.sheet = null; if (S.app) afterPlanEdit(); render(); toast(c[1] + ' added'); },
  f2next:() => go('F4'),
  dosave:() => { const e = document.getElementById('sv-email').value.trim(); if (!/.+@.+\..+/.test(e)){ document.getElementById('sverr').textContent = 'Please enter a valid email.'; return; }
    S.save = {email:e, comms:document.getElementById('sv-comms').checked, done:true, asked:true}; if (!S.acct.email) S.acct.email = e; S.sheet = null; render(); toast('Saved ✓ Check your inbox for your link'); },
  gyr:p => { const [id, d] = p.split('|'), g = gById(id); moveGoal(g, g.age + +d); focusKey = '[data-a="gyr"][data-p="' + p + '"]'; render(); },
  gmore:p => { S.tlOpen[p] = !S.tlOpen[p]; focusKey = '[data-a="gmore"][data-p="' + p + '"]'; render(); },
  gset:p => { const [id, k, v] = p.split('|'); gById(id)[k] = v; focusKey = '[data-a="gset"][data-p="' + p + '"]'; render(); },
  adminclose:() => { S.admin = false; render(); },
  setreset:p => { if (p === 'all'){ SETTINGS.partner = ''; Object.values(SET).forEach(s => { delete s.pv; }); } else delete SET[p].pv; applyAssume(); render(); },
  grank:p => { const [id, dir] = p.split('|'), list = rankList().map(g => g.id), i = list.indexOf(+id), j = dir === 'up' ? i - 1 : i + 1; if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]]; S.rank = list; const g = gById(id); S.rankMsg = g.name + ' is now ' + (j + 1) + ' of ' + list.length; version('Goal priority changed'); focusKey = '[data-a="grank"][data-p="' + p + '"]'; render(); },
  grankreset:() => { S.rank = null; S.rankMsg = 'Back to the suggested order'; version('Goal priority reset'); render(); },
  addsafe:() => { S.safetyWanted = true; S.safetyOff = false; if (S.app){ autoSafety(); afterPlanEdit(); } render(); toast(S.app ? 'Emergency fund added to your goals' : 'We\'ll add an Emergency fund to your goals'); },
  gdel:p => { const dg = S.goals.find(g => g.id === +p); if (dg && dg.k === 'safety'){ S.safetyOff = true; S.safetyWanted = false; } S.goals = S.goals.filter(g => g.id !== +p); if (S.wi.g === +p) S.wi = {g:null, m:0, l:0}; if (S.app) afterPlanEdit(); render(); toast('Goal removed'); },
  f4ok:() => { if (!S.versions.length) version('LifeMap confirmed'); if (S.acct.email === '' && S.save.email) S.acct.email = S.save.email; go('B4'); },
  pbprofile:p => pbAfterProfile(p),
  makeplan:() => { S.tab = 'plan'; S.pb = true; S.sheet = null; if (!/^(B1|F1|F2|F4|B4|P1|P1E|P1S|P1K|P2|P3|PU|P4)$/.test(S.scr)) S.scr = 'B1'; lastId = null; render(); },
  pbexit:() => { S.pb = false; lastId = null; render(); toast('Saved. Carry on any time from My Plan'); },
  assume:p => { S.assume = p; S.asm = Object.assign({}, S.asm); ['wage', 'cash', 'inv', 'pen', 'penRet'].forEach(k => { S.asm[k] = AS_SETS[p][k]; }); applyAssume(); version('Growth assumptions: ' + AS_NAME[p]); focusKey = '[data-a="assume"][data-p="' + p + '"]'; if (document.getElementById('wi-out')) { render(); } else render(); toast(AS_NAME[p] + ' assumptions: results updated'); },
  xback:() => { const t = S.xs.pop(); if (t && t.v === 'ACCT' && S.after){ S.scr = S.after.scr; S.after = null; } if (t && t.v === 'PST') S.pst = null; S.play = false; lastId = null; render(); },
  cat:p => { S.xs.push({v:'XCAT', p}); lastId = null; render(); },
  calc:p => { p = REDIRECT[p] || p; S.sheet = null; if (S.tab !== 'explore'){ S.tab = 'explore'; S.xs = []; } S.xs.push({v:'CALC', p}); lastId = null; render(); },
  videos:() => { if (S.tab !== 'explore'){ S.tab = 'explore'; S.xs = []; } S.xs.push({v:'VIDS'}); lastId = null; render(); },
  video:p => { S.play = false; if (S.tab !== 'explore'){ S.tab = 'explore'; S.xs = []; } S.xs.push({v:'VID', p}); lastId = null; render(); },
  vretry:() => { const el = document.getElementById('vid-el'), f = document.getElementById('vid-fail'); if (!el) return; el.hidden = false; if (f) f.hidden = true; el.load(); },
  vplay:() => { S.play = !S.play; focusKey = '[data-a="vplay"]'; render(); }, vfilter:p => { S.vf = p; focusKey = '[data-a="vfilter"][data-p="' + p + '"]'; render(); },
  remind:() => toast('We\'ll remind you before it starts'), xfeat:p => { S.xf = +p; focusKey = '[data-a="xfeat"][data-p="' + p + '"]'; render(); }, xswipe:p => xSwipe(+p), topic:p => { S.xs.push({v:'XTOPIC', p}); lastId = null; render(); },
  mpsit:p => { S.mps = +p; S.mpv = 0; S.mpc = null; focusKey = '[data-a="mpsit"][data-p="' + p + '"]'; render(); },
  mprd:p => { S.mprd = S.mprd === +p ? null : +p; focusKey = '[data-a="mprd"][data-p="' + p + '"]'; render(); }, mpcal:p => { S.mpc = p; focusKey = '[data-a="mpcal"][data-p="' + p + '"]'; render(); },
  mpvid:p => { S.mpv = +p; focusKey = '[data-a="mpvid"][data-p="' + p + '"]'; render(); },
  mpjump:p => { const e = document.getElementById(p); if (e) e.scrollIntoView({behavior:RM() ? 'auto' : 'smooth', block:'start'}); },
  mpseat:k => { S.mpseat[k] = !S.mpseat[k]; focusKey = '[data-a="mpseat"][data-p="' + k + '"]'; render(); toast(S.mpseat[k] ? 'Seat saved. We\'ll remind you before it starts' : 'Seat released'); },
  xfab:p => { S.sheet = 'xpert|' + p; render(); }, elig:() => { S.elig = {i:0, a:[]}; S.sheet = 'elig'; render(); }, eligpick:p => { const e = S.elig; e.a[e.i] = +p; e.i++; render(); }, eligback:() => { if (S.elig.i > 0) S.elig.i--; render(); },
  xcontact:p => { const [t, m] = p.split('|'); S.sheet = null; if (m === 'video') S.book.mode = 'Video'; ACT.expertfor(t); toast(m === 'call' ? 'Pick an expert and a time and we\'ll call you back' : m === 'msg' ? 'Pick an expert to send your message to' : 'Pick a time for your video call'); },
  expertfor:p => { S.tab = 'exp'; S.exp = 'home'; S.xs = []; S.play = false; if (EXPERT_FOR[p]) S.book.spec = p; S.sheet = null; lastId = null; render(); },
  spec:p => { S.book.spec = S.book.spec === p ? null : p; focusKey = '[data-a="spec"][data-p="' + p + '"]'; render(); },
  savem:p => { const P = project(), cur = S.saveM != null ? S.saveM : P.save.saveM, max = Math.max(0, P.save.surplusM); let v = Math.max(0, Math.round((cur + +p) / 25) * 25); S.saveNote = ''; S.saveUp = v >= P.save.autoM - 0.5;
    if (v > max){ v = max; S.saveNote = 'That\'s all of your spare money each month, so we can\'t count more than this. '; }
    S.saveM = v; focusKey = '[data-a="savem"][data-p="' + p + '"]'; render(); },
  savereset:() => { S.saveM = null; S.saveNote = ''; focusKey = '[data-a="savem"][data-p="25"]'; render(); },
  pstup:p => pstStart(DOCT[p] ? p : 'retire'), pstok:() => pstConfirm(), pstrem:p => { pstRemove(p); toast('Statement removed. Your own figures are used again'); render(); },
  docrep:p => { S.fmode[FSEC[+p].id] = 'upload'; render(); },
  docrem:p => { const sec = FSEC[+p]; removeDoc(sec.f.concat(DOC_HIDDEN[sec.id] || [])); Object.keys(DOCT).forEach(c => { if (S.pdocs[c] && !Object.values(S.docOf || {}).includes('pst:' + c)) pstRemove(c); }); toast('Statement removed. Your own figures are used again'); render(); },
  calcadd:p => { const m = calcMissing(C(p)); if (m.length){ toast(missTxt(m[0]) + ' first'); return; } S.sheet = 'calcadd|' + p; render(); },
  ckstd:p => { const t = xTop(); if (!t || t.v !== 'CALC') return; const c = C(t.p), std = calcStd(c.id, p), v = calcVals(c); if (!std) return; v[p] = std.v; calcSync(c.id, p, v[p]); S.calcT = S.calcT || {}; (S.calcT[c.id] = S.calcT[c.id] || {})[p] = true; focusKey = '#co-' + p; render(); },
  confirmcalcadd:p => { const r = C(p).run(calcVals(C(p))), g = r.goal; if (!g || g.kind === 'blocked') return; const msg = applyHandoff(g); S.sheet = null; if (S.app) afterPlanEdit(); render(); toast(msg); },
  vemail:() => verify('ev', 'P1K'),
  passkey:p => { S.acct.pk = p === '1'; prefillAbout(); if (p === '1') toast('Face ID added'); if (S.after && S.after.k === 'pst'){ const a = S.after; S.after = null; S.scr = a.scr; pstStart(a.cat, a.files); return; } if (S.rt){ Object.assign(S, S.rt); S.rt = null; lastId = null; render(); return; } go('P2'); },
  upl:p => startUpload(p, ['Sample document.pdf']), uplx:() => { S.upl = null; if (!S.app) S.scr = S.fsec != null ? 'P3' : 'P2'; render(); },
  uplfail:() => { const sec = S.upl.sec; S.missingDocs = (S.missingDocs || []).concat(S.upl.files); S.upl = null; const i = FSEC.findIndex(s => s.id === sec); S.fmode[sec] = 'type'; if (i >= 0) openSec(i); else { if (!S.app) S.scr = 'P2'; render(); } },
  uplok:() => confirmUpload(),
  fsec:p => openSec(p), fmode:p => { S.fmode[FSEC[S.fsec].id] = p; render(); },
  fback:() => finBack(), fsave:() => { const sec = FSEC[S.fsec]; S.saved = S.saved || {}; S.saved[sec.id] = true; if (sec.id === 'about'){ S.fin.name && (S.acct.name = S.fin.name); } toast(sec.t + ' saved'); if (S.app) afterPlanEdit(true); finBack(); },
  fchoice:p => { const [k, v] = p.split('|'); if (k === 'mortYN'){ if (!setMortYN(v)) toast('Your statement says how you own your home. Remove the statement to change it.'); } else { setManual(k, v, 'typed'); if (k === 'home' && /^Own/.test(v)){ delete S.fin.mortYN; delete S.src.mortYN; } } focusKey = '[data-a="fchoice"][data-p="' + p + '"]'; render(); },
  fex:p => { S.sheet = 'ex|' + p; render(); },
  iadd:p => { S.lt = S.lt || {}; S.lt[p] = true; const it = newItem(p); LI(p).push(it); focusKey = '#' + itemId(p, it, LDEF[p].f[0]); render(); },
  idel:p => { const [lk, id] = p.split('|'); S.lt = S.lt || {}; S.lt[lk] = true; S.lists[lk] = LI(lk).filter(it => it.id !== +id); syncLists(); focusKey = '[data-a="iadd"][data-p="' + lk + '"]'; render(); toast('Removed'); },
  iupl:p => { const [lk, id] = p.split('|'); startUpload(LDEF[lk].sec, [ITEMDOC[lk].title + '.pdf'], {lk, id:+id}); },
  irem:p => { const [lk, id] = p.split('|'), it = itemById(lk, id); if (!it) return; itemRemoveDoc(it); syncLists(); toast('Statement removed. Your own figures are used again'); render(); },   // §15: shows an example; never fills the field
  fix:p => { if (!S.app) S.from = 'check'; openSec(p); }, ack:p => { S.ack[p] = true; render(); },
  acksec:p => { FSEC.find(x => x.id === p).f.filter(fieldVisible).forEach(k => { if (!FF[k].opt) S.ack[k] = true; }); focusKey = null; render(); },
  toresults:() => { if (req3Missing().length) return; S.checked = true; toResults(); },
  skipres:() => { if (req3Missing().length) return; S.checked = false; toResults(); },
  addmiss:() => { const f = missingFlags(); if (f.length === 1) return ACT.fix(FSEC.indexOf(f[0].s)); S.tab = 'me'; S.me = 'money'; S.fsec = null; S.sheet = null; render(); },
  infl:p => { if (p === 'other'){ S.inflOther = true; S.inflEdit = true; focusKey = '[data-nb^="infl|"]'; render(); return; } else { S.infl = +p; S.inflOther = false; S.inflEdit = false; focusKey = '[data-a="infl"][data-p="' + p + '"]'; } version('Inflation: ' + pc(S.infl)); render(); },
  adjinfl:p => { S.adjInfl = S.adjInfl || {}; S.adjInfl[p] = !S.adjInfl[p]; focusKey = '[data-a="adjinfl"]'; render(); },
  infledit:() => { S.inflEdit = true; focusKey = '[data-a="infl"]'; render(); },
  meback:() => { S.me = 'home'; S.fsec = null; S.upl = null; if (S.tab === 'exp') S.exp = 'home'; render(); },
  tab:p => { if (p === 'explore' || S.tab === 'explore') { S.xs = []; S.play = false; } S.tab = p; S.sheet = null; if (S.app || !S.pb) { S.fsec = null; S.upl = null; } if (p === 'me') S.me = 'home'; if (p === 'exp' && !['c1','c2','c3'].includes(S.exp)) S.exp = 'home'; if (p === 'plan'){ S.planSeg = 'main'; S.planGo = 'timeline'; } lastId = null; render(); },
  seg:p => { S.tab = 'plan'; S.planSeg = 'main'; S.planGo = p; S.sheet = null; lastId = null; render(); },
  planedit:() => { S.planEdit = !S.planEdit; S.tlHl = null; render(); }, tlclose:() => { S.tlHl = null; render(); },
  addgoal:() => { S.planSeg = 'add'; render(); },
  me:p => { S.tab = 'me'; S.me = p; S.sheet = null; render(); }, exp:p => { S.tab = 'exp'; S.exp = p; render(); },
  umsec:p => { S.um.sec = +p; S.me = 'ums'; render(); },
  umpick:p => { const [key, k] = p.split('|'); if (key[0] === 'd'){ S.ans[key.slice(1)] = +k; delete S.meEdit[key]; focusKey = '[data-a="umedit"][data-p="' + key + '"]'; } else { S.um.a[key] = +k; focusKey = '[data-a="umpick"][data-p="' + p + '"]'; } render(); },
  umchip:p => { const i = S.um.chips.indexOf(p); if (i >= 0) S.um.chips.splice(i, 1); else S.um.chips.push(p); focusKey = '[data-a="umchip"][data-p="' + p + '"]'; render(); },
  umsave:() => { const s = UM.find(x => x.n === S.um.sec); if (s.qs.some(q => q.u === 'u9') && typeof S.um.a.u9 !== 'number') S.um.a.u9 = suggestU9(); S.um.done[s.n] = true; S.meEdit = {}; if (UM.every(x => S.um.done[x.n])) S.um.rechecked = true; S.me = 'um';
    toast(umCount() === 13 ? 'Saved. Your plan\'s risk profile is now ' + riskLabelText(riskRead(true)) : s.t + ' saved'); render(); },
  cyr:p => { S.csel = +p; refreshGlance('.cwrap'); },
  csave:() => { S.csave = !S.csave; refreshGlance('[data-a="csave"]'); },
  view:p => { S.view = p; focusKey = '[data-a="view"][data-p="' + p + '"]'; const e = document.getElementById('r-glance'); if (e){ e.innerHTML = glanceHTML(project(S.wi)); bindLite(); const b = e.querySelector(focusKey); if (b) b.focus(); focusKey = null; } else render(); },
  chap:p => { S.chapOpen = S.chapOpen === +p ? null : +p; const e = document.getElementById('r-glance'); if (e){ e.innerHTML = glanceHTML(project(S.wi)); const b = e.querySelector('[data-a="chap"][data-p="' + p + '"]'); if (b) b.focus({preventScroll:true}); } else render(); },
  understood:() => { S.understood = true; version('Results understood'); focusKey = '#r-found .chip'; render(); },
  advq:p => { const i = S.advQs.indexOf(p); if (i >= 0) S.advQs.splice(i, 1); else S.advQs.push(p); focusKey = '[data-a="advq"][data-p="' + CSS.escape(p) + '"]'; render(); },
  wig:p => { S.wi.g = +p; focusKey = '[data-a="wig"][data-p="' + p + '"]'; render(); },
  wim:p => { if (S.wi.g == null) S.wi.g = defaultWiGoal(); S.wi.m = clamp(S.wi.m + +p, -5000, 10000); const r = document.querySelector('[data-wi="m"]'); if (r) r.value = S.wi.m; liveUpdate(); },
  wisave:() => { S.pref = Object.assign({}, S.wi); version('Preferred plan: ' + (S.wi.m ? (S.wi.m > 0 ? '+' : '') + eur(S.wi.m) + '/month ' : '') + (S.wi.l ? '+' + eur(S.wi.l) + ' once' : '') + (gById(S.wi.g) ? ' → ' + gById(S.wi.g).name : '')); toast('Saved as your preferred plan (version ' + S.versions.length + ')'); },
  wireset:() => { S.wi = {g:S.wi.g, m:0, l:0}; render(); toast('Back to your plan'); },
  report:() => openReport(),
  book:() => { S.tab = 'exp'; S.exp = umCount() < 13 ? 'c0' : 'c1'; S.book.from = 'plan'; lastId = null; render(); },
  book2:() => { S.um.ret = null; S.tab = 'exp'; S.exp = 'c1'; render(); },
  c0go:() => { S.um.ret = 'c1'; S.tab = 'me'; S.me = 'um'; render(); },
  advnext:() => { S.book.adv = (S.book.adv + 1) % ADVISERS.length; render(); },
  bmode:p => { S.book.mode = p; focusKey = '[data-a="bmode"][data-p="' + p + '"]'; render(); },
  bday:p => { S.book.day = p; focusKey = '[data-a="bday"][data-p="' + p + '"]'; render(); },
  slot:p => { S.book.slot = p; focusKey = '[data-a="slot"][data-p="' + p + '"]'; render(); },
  confirmbook:() => { S.book.done = true; S.exp = 'c4'; version('Adviser meeting booked'); render(); toast('Booked. Confirmation sent by email and SMS'); },
  ics:() => { saveMeeting(); },
  adjust:() => { S.planSeg = 'main'; S.planGo = 'timeline'; S.tab = 'plan'; lastId = null; render(); },
  ask:() => { S.sheet = 'ask'; S.ask = {open:null, q:'', a:null, log:[], more:false}; render(); },
  askmore:() => { S.ask.more = true; render(); chatEnd(); },
  askq:p => { const it = askItems(lastId).find(x => x[0] === p); if (it) askReply(it[1].replace(/<[^>]+>/g, ''), p, it[2]); },
  askgo:() => { const v = ((document.getElementById('ask-in') || {}).value || '').trim(); if (!v) { toast('Type a question first'); return; } S.ask.q = v.slice(0, 140); askReply(S.ask.q, null, askMatch(S.ask.q)); },
  pmode:p => { S.partner.mode = p; focusKey = '[data-a="pmode"][data-p="' + p + '"]'; render(); },
  pinvite:() => { const e = ((document.getElementById('p-email') || {}).value || '').trim(); if (!/.+@.+\..+/.test(e)) { document.getElementById('perr').textContent = 'Please enter a valid email.'; return; } S.partner.email = e; S.partner.sent = true; focusKey = '[data-a="presend"]'; render(); toast('Invite sent to ' + e); },
  presend:() => toast('Invite sent again to ' + S.partner.email),
  pcancel:() => { S.partner.sent = false; focusKey = '#p-email'; render(); toast('Invite cancelled'); },
  umedit:p => { S.meEdit[p] = true; focusKey = '[data-a="umpick"][data-p^="' + p + '|"]'; render(); },
  recheckok:() => { S.um.rechecked = true; S.meEdit = {}; S.me = 'home'; render(); toast('Thanks. Your first answers are confirmed'); },
  toprofile:() => { S.um.ret = S.tab === 'exp' ? (S.book.done ? 'exp' : 'c1') : S.tab === 'me' ? S.um.ret : 'plan'; S.tab = 'me'; S.me = umCount() === 13 ? (S.um.rechecked ? 'umr' : 'recheck') : 'um'; S.sheet = null; lastId = null; render(); },
  umback:p => { S.um.ret = null; S.tab = p; if (p === 'exp') S.exp = 'home'; else { S.planSeg = 'main'; S.planGo = 'results'; } lastId = null; render(); },
  gowi:p => { S.tab = 'plan'; S.planSeg = 'main'; S.planGo = 'wi'; if (p) S.wi.g = +p; lastId = null; render(); },
  dodelete:() => { const n = S; S = fresh(); render(); toast('All your data was deleted'); }
};
function afterDS(msg){ const wp = S.wantPlan; S.wantPlan = false;
  if (!signed()){ S.rt = wp ? {shell:true, tab:'plan', pb:true, scr:'B1'} : {shell:true, tab:'home'}; go('P1'); return; }   // the answers stay in S; sign in, then carry on
  enterApp(wp ? '' : msg); if (wp) ACT.makeplan(); }
function enterApp(msg){ S.shell = true; S.tab = 'home'; S.sheet = null; lastId = null; render(); if (msg) toast(msg); }
function dnext(){ if (S.di >= DISC6.length - 1){ go('DR'); return; } S.di++; go('D' + (S.di + 2)); }
async function verify(flag, next){ const code = [...document.querySelectorAll('[data-code]')].map(i => i.value).join(''), err = document.getElementById('codeerr');
  if (code.length < 6){ err.textContent = 'Enter all 6 digits.'; return; }
  try { await AUTH.verifyOtp(S.acct.email, code, S.acct.name.trim()); } catch (e) { err.textContent = e.message === 'locked' ? 'Too many tries. Tap Send a new code.' : "That code doesn't match. Try again."; return; }
  S.acct.ev = true; S.acct.sv = true;   // ponytail: no SMS provider yet, so the mobile is collected but not verified; no SMS code step exists
  AUTH.consents({terms:S.acct.c1, marketing:S.acct.c2}); toast('Email verified');
  let plan = null; try { plan = await AUTH.getPlan(); } catch (e) {}
  if (plan && plan.goals){ restore(plan); return; }   // a saved plan wins over what this browser has so far
  go(next); }
/* ---- auth wall + sync (api/ plan route stores S opaque) ---- */
const TEST_AUTH = (() => { try { return location.hostname === 'localhost' && localStorage['lm-test-auth'] === '1'; } catch (e) { return false; } })();   // test-only bypass (tools/visual-diff.mjs)
const signed = () => !!AUTH.user || TEST_AUTH;
// Not persisted (transient UI or derived): scr tab planSeg planGo planEdit me exp sheet toast ask play upl pst after xs pb fsec from chapOpen tlOpen tlHl inflEdit meEdit rankMsg asmOpen setMsg csel admin wantPlan rt.
// acct keeps only name, email, mobile, c1, c2, pk (ev/sv come from the session). Everything else in S (answers, goals, finances, choices, versions) is saved.
const TRANSIENT = 'scr tab planSeg planGo planEdit me exp sheet toast ask play upl pst after xs pb fsec from chapOpen tlOpen tlHl inflEdit meEdit rankMsg asmOpen setMsg csel admin wantPlan rt'.split(' ');
function persistable(){ const o = {}; for (const k in S) if (!TRANSIENT.includes(k)) o[k] = S[k]; const {name, email, mobile, c1, c2, pk} = S.acct; o.acct = {name, email, mobile, c1, c2, pk}; return o; }
function restore(plan){ const rt = S.rt; const a = Object.assign(fresh().acct, plan.acct, {ev:true, sv:true}); S = Object.assign(fresh(), plan, {acct:a, shell:true, tab:'home', pb:false, sheet:null}); if (rt) Object.assign(S, rt);   // a returning user lands where the wall caught them
  try { applyAssume(); } catch (e) {} lastSent = JSON.stringify(persistable()); lastId = null; render(); }
let syncT = null, lastSent = '';
function syncSoon(now){ if (!AUTH.user) return; clearTimeout(syncT);
  syncT = setTimeout(async () => { if (!AUTH.user) return; const j = JSON.stringify(persistable()); if (j !== lastSent && await AUTH.putPlan(JSON.parse(j))) lastSent = j; }, now ? 0 : 1500); }
addEventListener('visibilitychange', () => { if (document.hidden) syncSoon(true); });
// Wall: only Welcome, What brought you here, Discover, the reveal and the save screen are public. Anything else goes to the account screen P1 and comes back after sign-in (S.rt).
function wall(){ if (signed()) return;
  const pub = !S.app && !S.shell && !S.admin && /^D([0-7]|R|S)$/.test(S.scr);
  if (pub){ S.rt = null; return; }
  if (!S.app && !S.shell && /^P1[EKS]?$/.test(S.scr)) return;   // the sign-in steps themselves
  if (!S.rt) S.rt = {scr:S.scr, tab:S.tab, shell:S.shell, app:S.app, pb:S.pb, planSeg:S.planSeg, me:S.me, exp:S.exp};
  S.app = S.shell = S.pb = S.admin = false; S.sheet = null; S.scr = 'P1'; }
function defaultWiGoal(){ const P = project(); const w = S.goals.slice().sort((a, b) => P.pct[a.id] - P.pct[b.id] || a.age - b.age)[0]; return w ? w.id : null; }
function afterPlanEdit(quiet){ if (!quiet) version('Goals changed'); }
function moveGoal(g, age){ if (g.kind === 'legacy') return; const a0 = S.about.age; age = g.kind === 'retire' ? clamp(age, a0 + 1, retMax()) : clamp(age, a0 + 1, AS.end); g.age = age; if (g.kind === 'retire') setRetireAge(age); }
function startUpload(sec, files, item){ const fail = files.some(f => /fail/i.test(f)); S.upl = {sec, stage:'scan', files, edit:{}, item:item || null}; S.sheet = null;
  if (!S.app) S.scr = 'PU'; else { if (S.tab === 'plan' || S.tab === 'home') S.tab = 'me'; if (S.tab === 'me') S.me = 'fin'; else S.exp = 'fin'; }
  render(); setTimeout(() => { if (!S.upl) return; S.upl.stage = fail ? 'fail' : 'confirm'; render(); }, RM() ? 200 : 1500); }
function confirmItemUpload(){ const u = S.upl, lk = u.item.lk, T = ITEMDOC[lk], it = itemById(lk, u.item.id);
  if (it){ T.f.forEach(([fld, v, c]) => { const fixed = u.edit[fld] != null && +u.edit[fld] !== v, nv = fixed ? +u.edit[fld] : v; itemDoc(it, fld, nv, c, fixed, 'upl:item' + it.id); }); (T.txt || []).forEach(([fld, v]) => { if (!hasVal(it.f[fld])){ it.f[fld] = v; it.src[fld] = 'doc'; } }); if (T.old && LDEF[lk].tot) S.look[LDEF[lk].tot.value] = T.old; syncLists(); }
  S.upl = null; toast('Added from your document'); if (!S.app) S.scr = 'P3'; render(); }
function confirmUpload(){ if (S.upl.item) return confirmItemUpload(); const u = S.upl, secs = u.sec === 'smart' ? ['income','assets','liab','pension'] : [u.sec];
  secs.forEach(sid => { const U = UPL[sid]; Object.entries(U.v).forEach(([k, [v, c]]) => { const fixed = u.edit[k] != null && +u.edit[k] !== v, nv = fixed ? +u.edit[k] : v;
    delete S.look[k]; setDoc(k, nv, c, fixed, 'upl:' + sid); });   // FP round 6: the document wins over a typed figure; a correction here is still the document
    Object.entries(U.hid || {}).forEach(([k, [v, c]]) => setDoc(k, v, c, false, 'upl:' + sid));
    if (U.old) Object.entries(U.old).forEach(([k, why]) => { S.look[k] = why; }); });
  S.upl = null; toast('Added from your documents'); if (S.app) { S.fsec = null; if (S.tab === 'me') S.me = 'money'; render(); } else { S.fsec = null; go('P2'); } }

/* ================= BIND ================= */
function bindLite(){ const w = document.querySelector('.cwrap'); if (w && !w._k){ w._k = 1; w.addEventListener('keydown', e => { const P = project(S.wi), n = P.rows.length, cur = S.csel == null ? chartDefaultSel(P.rows) : S.csel; let v = null;
  if (e.key === 'ArrowRight' || e.key === 'ArrowUp') v = cur + 1; else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') v = cur - 1; else if (e.key === 'Home') v = 0; else if (e.key === 'End') v = n - 1; if (v == null) return; e.preventDefault(); S.csel = clamp(v, 0, n - 1); refreshGlance('.cwrap'); }); } }
function refreshGlance(fsel){ const e = document.getElementById('r-glance'); if (!e) { render(); return; } e.innerHTML = glanceHTML(project(S.wi)); bindLite(); const b = fsel && e.querySelector(fsel); if (b) b.focus({preventScroll:true}); }
function bind(){
  const ph = document.getElementById('screen'); bindLite();
  ph.querySelectorAll('details.asmg').forEach(d => d.addEventListener('toggle', () => { if (d.open) S.asmOpen = d.dataset.g; else if (S.asmOpen === d.dataset.g) S.asmOpen = null; })); bindNB(ph);   // keep the open group across re-renders
  ph.querySelectorAll('input[data-in="age"]').forEach(r => r.addEventListener('input', () => { S.about.age = +r.value; ageNext(); r.setAttribute('aria-valuetext', 'Age ' + S.about.age); const o = document.getElementById('age-v') || ph.querySelector('.stepper output'); if (o) { if ('value' in o && o.tagName === 'INPUT') o.value = S.about.age; else o.textContent = S.about.age; } }));
  ph.querySelectorAll('[data-gname]').forEach(i => i.addEventListener('input', () => { gById(i.dataset.gname).name = i.value.slice(0, 30) || 'My goal'; }));
  ph.querySelectorAll('[data-gamt]').forEach(i => i.addEventListener('change', () => { const g = gById(i.dataset.gamt); g.amount = Math.max(0, parseInt(i.value.replace(/\D/g, '')) || 0); g.auto = false; render(); }));
  ph.querySelectorAll('[data-gsaved]').forEach(i => i.addEventListener('change', () => { gById(i.dataset.gsaved).saved = Math.max(0, parseInt(i.value.replace(/\D/g, '')) || 0); render(); }));
  ph.querySelectorAll('[data-acct]').forEach(i => i.addEventListener(i.type === 'checkbox' ? 'change' : 'input', () => { S.acct[i.dataset.acct] = i.type === 'checkbox' ? i.checked : i.value; const a = S.acct, b = document.getElementById('acctgo');
    if (b) b.disabled = !(a.name.trim() && /.+@.+\..+/.test(a.email) && a.mobile.replace(/\D/g, '').length >= 9 && a.c1); }));
  ph.querySelectorAll('[data-code]').forEach((i, n, all) => { i.addEventListener('input', () => { i.value = i.value.replace(/\D/g, '').slice(-1); if (i.value && all[n + 1]) all[n + 1].focus(); });
    i.addEventListener('keydown', e => { if (e.key === 'Backspace' && !i.value && all[n - 1]) all[n - 1].focus(); if (e.key === 'Enter') ph.querySelector('.foot .btn').click(); });
    i.addEventListener('paste', e => { const t = (e.clipboardData.getData('text') || '').replace(/\D/g, ''); if (t.length === 6){ e.preventDefault(); all.forEach((x, k) => x.value = t[k]); all[5].focus(); } }); });
  if (ph.querySelector('[data-code]')) ph.querySelector('[data-code]').focus();
  ph.querySelectorAll('[data-it]').forEach(i => i.addEventListener('input', () => { const [lk, id, fld] = i.dataset.it.split('|'), it = itemById(lk, id), d = FFI[lk + '.' + fld]; if (!it) return; let nv;
    if (d.type === 'text') nv = i.value.trim() ? i.value : null; else if (d.type === 'pct'){ const n = parseFloat(i.value.replace(/[^\d.]/g, '')); nv = isNaN(n) ? null : Math.min(n, 100); } else { const n = parseInt(i.value.replace(/[^\d]/g, '')); nv = isNaN(n) ? null : d.type === 'num' ? clamp(n, 0, 120) : n; }
    itemSet(it, fld, nv); syncLists(); const id0 = itemId(lk, it, fld), tg = document.getElementById(id0 + '-t'), nt = document.getElementById(id0 + '-n'); if (tg) tg.innerHTML = itemTag(it, fld); if (nt) nt.innerHTML = itemNote(lk, it, fld); }));
  ph.querySelectorAll('[data-setname]').forEach(i => i.addEventListener('change', () => { SETTINGS.partner = i.value.trim(); render(); }));
  ph.querySelectorAll('[data-set]').forEach(i => i.addEventListener('change', () => { const [k, ix] = i.dataset.set.split('|'), s = SET[k], raw = i.value.trim();
    if (s.u === 'choice') s.pv = raw === '' ? null : (typeof s.v === 'number' ? +raw : raw);
    else if (s.u === 'pct3'){ const a = (s.pv || s.v).slice(), n = parseFloat(raw); a[+ix] = raw === '' || isNaN(n) ? s.v[+ix] : Math.max(0, n) / 100; s.pv = a.every((x, j) => Math.abs(x - s.v[j]) < 1e-9) ? null : a; }
    else { const n = parseFloat(raw.replace(/,/g, '')), val = s.u === 'pct' ? n / 100 : n, b = SETBOUNDS[k];
      if (raw !== '' && !isNaN(n) && b && (val < b[0] - 1e-9 || val > b[1] + 1e-9)){ S.setMsg = {k, msg:'That figure is outside the allowed range, so it was not used. ' + setBoundMsg(k) + '.'}; S.asmOpen = 'set-' + s.grp; render(); return; }
      s.pv = raw === '' || isNaN(n) ? null : Math.max(0, val); }
    if (S.setMsg && S.setMsg.k === k) S.setMsg = null; if (s.pv == null) delete s.pv; applyAssume(); S.asmOpen = 'set-' + s.grp; render(); }));
  ph.querySelectorAll('[data-gmonths]').forEach(i => i.addEventListener('change', () => { const n = parseInt(i.value.replace(/\D/g, '')); if (isNaN(n)){ if (asmMine('safetyMonths')){ S.asm = Object.assign({}, S.asm); delete S.asm.safetyMonths; applyAssume(); syncSafety(); } } else setSafetyMonths(n); render(); }));
  ph.querySelectorAll('[data-fin]').forEach(i => i.addEventListener('input', () => { const k = i.dataset.fin, d = FF[k];
    let nv; if (d.type === 'text') nv = i.value; else if (d.type === 'pct'){ const n = parseFloat(i.value.replace(/[^\d.]/g, '')); nv = isNaN(n) ? null : clamp(n, 0, 30); } else { const n = parseInt(i.value.replace(/[^\d]/g, '')); nv = isNaN(n) ? null : d.type === 'num' ? clamp(n, 0, 120) : n; }
    const used = setManual(k, nv, 'typed');   // FP round 6: a statement figure is not overwritten; the entry is kept and shown
    if (used && k === 'age' && S.fin.age >= 18) { S.about.age = S.fin.age; }
    if (used && k === 'retireAge' && S.fin.retireAge >= retMin() && S.fin.retireAge <= retMax()) setRetireAge(S.fin.retireAge);
    const tg = document.getElementById('tag-' + k); if (tg) tg.innerHTML = tagFor(k); const dn = document.getElementById('dn-' + k); if (dn) dn.innerHTML = docNote(k); }));
  ph.querySelectorAll('input[type=file][data-file]').forEach(i => i.addEventListener('change', () => { const fs = [...i.files].map(f => f.name); if (fs.length) startUpload(i.dataset.file, fs); }));
  ph.querySelectorAll('[data-uv]').forEach(i => i.addEventListener('input', () => { S.upl.edit[i.dataset.uv] = parseInt(i.value.replace(/\D/g, '')) || 0; }));
  ph.querySelectorAll('[data-share]').forEach(i => i.addEventListener('change', () => { S.book.share[i.dataset.share] = i.checked; shareBtn(); }));
  ph.querySelectorAll('[data-agree]').forEach(i => i.addEventListener('change', () => { S.book.agree = i.checked; shareBtn(); }));
  ph.querySelectorAll('input[data-wi]').forEach(r => r.addEventListener('input', () => { if (S.wi.g == null) S.wi.g = defaultWiGoal(); S.wi[r.dataset.wi] = +r.value; r.setAttribute('aria-valuetext', eur(+r.value)); liveUpdate(); }));
  if (ph.querySelector('#wi-out')) { if (S.wi.g == null) S.wi.g = defaultWiGoal(); liveUpdate(); const c = ph.querySelector('[data-a="wig"][data-p="' + S.wi.g + '"]'); if (c) { c.classList.add('sel'); c.setAttribute('aria-pressed', 'true'); } }
  ph.querySelectorAll('input[data-ck]').forEach(inp => inp.addEventListener('input', () => { const t = xTop(); if (!t || t.v !== 'CALC') return; const c = C(t.p), v = calcVals(c), k = inp.dataset.ck, i = c.inputs.concat(c.wi || []).find(x => x.k === k); v[k] = +inp.value; calcSync(c.id, k, v[k]); S.calcT = S.calcT || {}; (S.calcT[c.id] = S.calcT[c.id] || {})[k] = true; inp.setAttribute('aria-valuetext', fmtIn(i, v[k]));
    const o = document.getElementById('co-' + k); if (o) { o.value = nbFmt(v[k]); o.style.width = nbW(o.value); } const out = document.getElementById('cout'); if (out) out.innerHTML = calcOut(c); }));
  ph.querySelectorAll('input[type=file][data-pfile]').forEach(i => i.addEventListener('change', () => { const fs = [...i.files].map(f => f.name); if (fs.length) pstStart(i.dataset.pfile, fs); }));
  ph.querySelectorAll('[data-pv]').forEach(i => i.addEventListener('input', () => { if (!S.pst) return; S.pst.edit[i.dataset.pv] = i.value; if (i.dataset.pv === 'prsi'){ const e = document.getElementById('pst-sp'); if (e) e.textContent = spFromYears(+i.value || 0); } }));
  ph.querySelectorAll('[data-whynote]').forEach(i => i.addEventListener('input', () => { S.whyNote = i.value.slice(0, 60); }));
  ph.querySelectorAll('input[data-dob]').forEach(i => i.addEventListener('input', () => { const [who, part] = i.dataset.dob.split('|'), key = who === 'you' ? 'dob' : 'pdob', clean = i.value.replace(/\D/g, '').slice(0, part === 'y' ? 4 : 2); if (clean !== i.value) i.value = clean;
    S.about[key] = Object.assign({}, S.about[key]); S.about[key][part] = clean; syncAges(); const c = dobCheck(S.about[key], who), id = who === 'you' ? 'dob' : 'pdob', m = document.getElementById(id + '-msg'); if (m){ m.textContent = c.text; m.style.color = c.text && !c.ok ? 'var(--gap-t)' : 'var(--acc-d)'; } ageNext();
    if (part !== 'y' && clean.length === 2){ const nx = document.getElementById(id + '-' + (part === 'd' ? 'm' : 'y')); if (nx) nx.focus(); } }));
  ph.querySelectorAll('[data-partner]').forEach(i => i.addEventListener('input', () => { S.partner[i.dataset.partner] = i.value.slice(0, 60); }));
  const ai = ph.querySelector('#ask-in'); if (ai) ai.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); ACT.askgo(); } });
  if (ph.querySelector('#tl')) { layoutTL(); bindTL(); }
}
function shareBtn(){ const b = document.getElementById('sharego'); if (b) b.disabled = !(S.book.agree && Object.values(S.book.share).some(Boolean)); }

/* ================= TIMELINE: layout in lanes + drag ================= */
const LANE_H0 = 50, laneH = () => phoneLandscape() ? 36 : LANE_H0;   // landscape phones: single-line chips, tighter lanes so the board fits the short screen
function tlX(age, W){ const a0 = S.about.age; return (age - a0) / (90 - a0) * W; }
function layoutTL(){
  const tr = document.getElementById('tl'); if (!tr) return; const W = tr.clientWidth, a0 = S.about.age;
  const chips = [...tr.querySelectorAll('.tl-chip')].map(el => { const g = gById(el.dataset.g); return {el, g, w:el.offsetWidth, x:tlX(g.age, W)}; }).sort((a, b) => a.x - b.x || a.g.id - b.g.id);
  const lanes = [], LANE_H = laneH();
  // Landscape phones: cap the lanes so the whole board fits the visible area; crowded chips slide right within a lane (a dashed link keeps the exact age)
  let maxL = Infinity; if (phoneLandscape()){ const m = document.getElementById('main'), ft = document.querySelector('.foot'); const vis = (m ? m.clientHeight : innerHeight) - (ft ? ft.offsetHeight : 0) - 16 - 14; maxL = Math.max(2, Math.floor((vis - 22 - 46) / LANE_H)); }
  chips.forEach(c => { const cx = clamp(c.x, c.w / 2, W - c.w / 2); c.left = cx - c.w / 2; let l = 0; while (lanes[l] != null && c.left < lanes[l] + 6) l++;
    if (l >= maxL){ l = lanes.indexOf(Math.min(...lanes)); c.left = Math.min(lanes[l] + 6, W - c.w); }
    lanes[l] = Math.max(lanes[l] == null ? -1e9 : lanes[l], c.left + c.w); c.lane = l; });
  const L = Math.max(1, lanes.length), axisY = 10 + L * LANE_H + 12;
  tr.querySelectorAll('.tl-stem,.tl-axis,.tl-tick,.tl-tm,.tl-now,.tl-link,.tl-pin').forEach(e => e.remove());
  let deco = '<div class="tl-axis" style="top:' + axisY + 'px"></div><div class="tl-now" style="left:0;top:' + (axisY + 2) + 'px" aria-hidden="true"></div>';
  for (let a = Math.ceil(a0 / 5) * 5; a <= 90; a += 5){ const x = tlX(a, W); deco += '<div class="tl-tm" style="left:' + x + 'px;top:' + (axisY + 6) + 'px"></div>' + (a % 10 === 0 && x > 34 && x < W - 18 ? '<div class="tl-tick" style="left:' + x + 'px;top:' + (axisY + 16) + 'px">age ' + a + '</div>' : ''); }
  deco += '<div class="tl-tick" style="left:14px;top:' + (axisY + 16) + 'px">Now</div>';
  chips.forEach(c => { const top = 10 + (L - 1 - c.lane) * LANE_H; c.el.style.left = c.left + 'px'; c.el.style.top = top + 'px'; const h = c.el.offsetHeight, sx = clamp(c.x, c.left + 10, c.left + c.w - 10);
    deco += '<div class="tl-stem" style="left:' + sx + 'px;top:' + (top + h) + 'px;height:' + Math.max(0, axisY - top - h - (sx !== c.x ? 6 : 0)) + 'px"></div>' + (sx !== c.x ? '<div class="tl-link" style="left:' + Math.min(sx, c.x) + 'px;width:' + Math.abs(sx - c.x) + 'px;top:' + (axisY - 6) + 'px"></div><div class="tl-pin" style="left:' + c.x + 'px;top:' + (axisY + 2) + 'px"></div>' : ''); });
  tr.insertAdjacentHTML('afterbegin', deco);
  tr.style.height = (axisY + 46) + 'px';
}
function bindTL(){
  const tr = document.getElementById('tl');
  tr.querySelectorAll('.tl-chip').forEach(ch => {
    ch.addEventListener('pointerdown', e => {
      if (e.button > 0) return; e.preventDefault(); const g = gById(ch.dataset.g), sx = e.clientX, sAge = g.age; let moved = false, tip = null;
      try { ch.setPointerCapture(e.pointerId); } catch (x) {}
      ch.classList.add('drag'); tr.classList.add('live');
      const mv = ev => { if (!moved && Math.abs(ev.clientX - sx) < 5) return; moved = true; const r = tr.getBoundingClientRect(), a0 = S.about.age;
        const age = Math.round(sAge + (ev.clientX - sx) / r.width * (90 - a0)); const before = g.age; moveGoal(g, age);
        if (g.age !== before || !tip){ ch.innerHTML = chipInner(g); ch.setAttribute('aria-valuenow', g.age); layoutTL();
          if (!tip){ tip = document.createElement('div'); tip.className = 'tl-tip tip2'; tr.appendChild(tip); tip.guide = document.createElement('div'); tip.guide.className = 'tl-guide'; tr.appendChild(tip.guide); }
          const yr = YEAR0 + g.age - a0, gx = clamp(tlX(g.age, tr.clientWidth), 0, tr.clientWidth); tip.innerHTML = '<b>' + yr + '</b><span>Age ' + g.age + ' · ' + esc(g.name) + '</span>'; tip.style.left = clamp(parseFloat(ch.style.left) + ch.offsetWidth / 2, 70, tr.clientWidth - 70) + 'px'; tip.style.top = (parseFloat(ch.style.top) - 8) + 'px';
          tip.guide.style.left = gx + 'px'; tip.guide.style.top = (parseFloat(ch.style.top) + ch.offsetHeight) + 'px'; tip.guide.setAttribute('data-y', yr); if (navigator.vibrate && g.age !== before) try { navigator.vibrate(4); } catch (_) {}
          const w = document.getElementById('when-' + g.id); if (w) w.textContent = whenTxt(g, true); } };
      const up = () => { ch.removeEventListener('pointermove', mv); ch.removeEventListener('pointerup', up); ch.removeEventListener('pointercancel', up); ch.removeEventListener('lostpointercapture', up); ch.classList.remove('drag'); tr.classList.remove('live'); if (tip){ tip.guide && tip.guide.remove(); tip.remove(); }
        if (!moved){ S.tlHl = g.id; render(); const row = document.getElementById('row-' + g.id); if (row) row.scrollIntoView({block:'nearest', behavior:RM() ? 'auto' : 'smooth'}); return; }
        if (S.app) version(g.name + ' moved to age ' + g.age); focusKey = '.tl-chip[data-g="' + g.id + '"]'; render(); toast(g.name + ' · age ' + g.age); };
      ch.addEventListener('pointermove', mv); ch.addEventListener('pointerup', up); ch.addEventListener('pointercancel', up); ch.addEventListener('lostpointercapture', up);
    });
    ch.addEventListener('keydown', e => { const g = gById(ch.dataset.g), st = e.shiftKey ? 5 : 1; let a = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') a = g.age + st; else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') a = g.age - st; else if (e.key === 'Home') a = 0; else if (e.key === 'End') a = 99;
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); S.tlHl = g.id; render(); document.getElementById('row-' + g.id).scrollIntoView({block:'nearest'}); return; }
      if (a == null) return; e.preventDefault(); moveGoal(g, a); focusKey = '.tl-chip[data-g="' + g.id + '"]'; render(); });
  });
}

/* ================= EVENTS ================= */
document.addEventListener('click', e => {
  const r = e.target.closest('#report [data-r]'); if (r){ if (r.dataset.r === 'print') saveReport(r); else closeReport(); return; }
  const el = e.target.closest('#screen [data-a]'); if (!el || el.disabled) return;
  let a = el.dataset.a, p = el.dataset.p; if (a.includes('|')) [a, p] = a.split('|');
  if (a === 'noop') { e.stopPropagation(); return; }
  if (a === 'closesheet' && el.classList.contains('sheet-bg') && e.target !== el) return;
  if (el.getAttribute('aria-disabled') === 'true' && a !== 'gpick') return;
  if (ACT[a]) ACT[a](p);
});
function closeSheet(){ const s = S.sheet; S.sheet = null; if (s && s.startsWith('ex|')) focusKey = '[data-a="fex"][data-p="' + s.slice(3) + '"]'; render(); }   // §15: focus goes back to the link
document.addEventListener('keydown', e => { if (e.key === 'Escape'){ if (document.getElementById('report').classList.contains('on')) { closeReport(); return; } if (S.sheet) closeSheet(); }
  if (e.key === 'Tab'){ const R = document.getElementById('report'); if (R.classList.contains('on')){ const f = [...R.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(x => !x.disabled && x.offsetParent !== null); if (f.length){ const a = document.activeElement; if (!R.contains(a)){ e.preventDefault(); f[0].focus(); } else if (e.shiftKey && a === f[0]){ e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && a === f[f.length - 1]){ e.preventDefault(); f[0].focus(); } } return; } }
  if (e.key === 'Tab' && S && S.sheet){ const sh = document.querySelector('#screen .sheet'); if (!sh) return; const f = [...sh.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(x => !x.disabled && x.offsetParent !== null); if (!f.length) return;
    const first = f[0], last = f[f.length - 1]; if (!sh.contains(document.activeElement)){ e.preventDefault(); first.focus(); } else if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); } } });   // dialogs keep focus inside

/* ================= SAMPLE CUSTOMER + SIDE PANEL ================= */
function loadSample(){
  S = fresh();
  Object.assign(S.ans, {'2':0, '4':1, '6':2, '7':1, '8':2, '9':2, '12':1}); S.why = ['track', 'change'];
  S.about = {age:38, partner:true, deps:2}; S.retireAge = 63; { const y0 = +asmV('startYear'); S.about.dob = {d:'21', m:'8', y:String(y0 - 38)}; S.about._dobAge = 38; S.about.pdob = {d:'3', m:'3', y:String(y0 - SAMPLE_FIN.pAge[0])}; }
  ['edu','travel','mfree','safety','retire'].forEach(k => S.goals.push(mkGoal(k)));
  const G = k => S.goals.find(g => g.k === k); G('edu').age = 48; G('edu').amount = 50000; G('travel').age = 41; G('travel').amount = 12000; G('mfree').age = 55; G('safety').age = 40; G('safety').amount = 15000; G('safety').auto = false; G('safety').saved = 5000; retireGoal().amount = 46000;
  S.acct = {name:'Aoife', email:'aoife@example.ie', mobile:'087 123 4567', c1:true, c2:false, ev:true, sv:true, pk:true};
  const put = (k, v, src, c) => { S.fin[k] = v; S.src[k] = src; if (c) S.conf[k] = c; };
  Object.entries(SAMPLE_FIN).forEach(([k, [v, src, c]]) => put(k, v, src, c)); S.look.pension = 'Statement is over 12 months old';
  Object.entries(SAMPLE_POL).forEach(([t, arr]) => arr.forEach(o => { const it = newItem(t); Object.entries(o).forEach(([f, v]) => { it.f[f] = v; it.src[f] = 'typed'; }); LI(t).push(it); }));
  S.partner = {mode:'manual', email:'', sent:false, name:'Cian'};
  S.retireSet = true; S.pRet = 66; S.pRetSet = true; S.infl = SV('infl'); S.asm = Object.assign({}, S.asm); Object.assign(S.asm, {planEnd:95, cardRate:SAMPLE_RATES.cardRate, loanRate:SAMPLE_RATES.loanRate, pSpWeek:239.44, mortRate:0.0375, buyFees:3000, depEarn:0.01, survivor:RI.sp.survivor}); applyAssume();
  S.toolPick = {lumpsum:{f:0, wait:WAIT_YEARS}, regularinvest:{f:1}, fees:{a:0.5, b:1.5}, riskreturn:{s:2}, incomegap:{ib:RI.sp.illness}};   // Aoife's tool choices (§14: the sample has every choice made)   // Aoife chose the standards, plans to 95, and typed her card / loan APRs and Cian's State Pension
  S.checked = true; S.app = true; S.shell = true; S.pb = false; S.tab = 'plan'; S.planSeg = 'main'; S.versions = [{note:'LifeMap confirmed', date:'29 Sep 2026'}, {note:'First results', date:'29 Sep 2026'}];
}
function J(fn){ return () => { fn(); lastId = null; render(); }; }
const withS = f => () => { if (!S.app) loadSample(); f(); };
const pre = f => () => { loadSample(); S.app = false; S.shell = true; S.pb = true; S.tab = 'plan'; S.versions = []; f(); };
const discOnly = () => { S = fresh(); Object.assign(S.ans, {'2':0, '4':1, '7':1, '8':2, '9':2, '12':1}); S.why = ['track']; };
const JUMPS = [
  ['Onboarding', [['D0','Welcome', () => { S = fresh(); }], ['D1','What brought you here?', () => { S = fresh(); S.scr = 'D1'; }], ['D2','Question 1 of 6', () => { S = fresh(); S.scr = 'D2'; S.di = 0; }], ['D5','Question 4 (road)', () => { S = fresh(); S.scr = 'D5'; S.di = 3; }], ['D6','Question 5 (scenario)', () => { S = fresh(); S.scr = 'D6'; S.di = 4; }], ['DR','Money personality + terms', () => { discOnly(); S.scr = 'DR'; }], ['DS','Save your results', () => { discOnly(); S.scr = 'DS'; }]]],
  ['App before a plan', [['HOME-0','Home (no plan yet)', () => { discOnly(); S.shell = true; S.tab = 'home'; }], ['XPL-01','Explore', () => { discOnly(); S.shell = true; S.tab = 'explore'; }], ['CALC-retirement','A calculator', () => { discOnly(); S.shell = true; S.tab = 'explore'; S.xs = [{v:'CALC', p:'retirement'}]; }], ['VID-01','A video', () => { discOnly(); S.shell = true; S.tab = 'explore'; S.xs = [{v:'VID', p:'v2'}]; }], ['PLAN-0','My Plan (empty state)', () => { discOnly(); S.shell = true; S.tab = 'plan'; }]]],
  ['Admin (not for customers)', [['ADMIN-SET','Settings: standards, wording, sources, partner label', () => { loadSample(); S.admin = true; }]]],
  ['Plan builder', [['B1','1 · About you & family', pre(() => { S.scr = 'B1'; })], ['F1','2 · Your goals', pre(() => { S.scr = 'F1'; })], ['F2','3 · Your timeline (drag)', pre(() => { S.scr = 'F2'; })], ['F4','3 · Confirm my LifeMap', pre(() => { S.scr = 'F4'; })], ['B4','4 · Your money profile', pre(() => { delete S.ans['6']; S.scr = 'B4'; })], ['P1','5 · Secure your account', pre(() => { S.acct.c1 = false; S.acct.ev = S.acct.sv = false; S.scr = 'P1'; })], ['P1E','5 · Email code', pre(() => { S.acct.ev = S.acct.sv = false; S.scr = 'P1E'; })], ['P2','6 · Your finances hub', pre(() => { S.scr = 'P2'; })], ['P3-2','6 · Income (type it)', pre(() => { S.scr = 'P3'; S.fsec = 1; })], ['P3-6','6 · Pension (upload)', pre(() => { S.scr = 'P3'; S.fsec = 5; S.fmode.pension = 'upload'; })], ['P4','7 · Check your details', pre(() => { S.checked = false; S.scr = 'P4'; })]]],
  ['Results & app', [['HOME','Home dashboard', () => { loadSample(); S.tab = 'home'; }], ['ASK','Ask (help sheet)', () => { loadSample(); S.tab = 'home'; S.sheet = 'ask'; S.ask = {open:null, q:'', a:null, more:false, log:[]}; const it = askPlan().find(x => x[0] === 'pgap') || askPlan()[0]; if (it) S.ask.log.push({who:'me', t:it[1].replace(/<[^>]+>/g, ''), k:it[0]}, {who:'bot', t:it[2]}); }], ['PLAN','My Plan (timeline + results)', () => { loadSample(); }], ['ME-01','Me', () => { loadSample(); S.tab = 'me'; }], ['ME-UM','Your money profile', () => { loadSample(); S.tab = 'me'; S.me = 'um'; }], ['ME-CHK','Your first answers (re-check)', () => { loadSample(); S.tab = 'me'; S.me = 'recheck'; }], ['ME-TERMS','Your money terms', () => { loadSample(); S.tab = 'me'; S.me = 'terms'; }], ['ME-UM2','Money profile · capacity', () => { loadSample(); S.tab = 'me'; S.me = 'ums'; S.um.sec = 2; }], ['ME-R','Profile result', () => { loadSample(); Object.assign(S.um.a, {u4:1, u9:3, u10:1, u11:1, u12:2, u14:2}); S.um.done = {1:true, 2:true, 3:true}; S.tab = 'me'; S.me = 'umr'; }], ['ME-MONEY','My money', () => { loadSample(); S.tab = 'me'; S.me = 'money'; }]]],
  ['Connect', [['C0','Help your adviser know you', () => { loadSample(); S.tab = 'exp'; S.exp = 'c0'; }], ['C1','Your match', () => { loadSample(); S.tab = 'exp'; S.exp = 'c1'; }], ['C2','Share your plan', () => { loadSample(); S.tab = 'exp'; S.exp = 'c2'; }], ['C3','Pick a time', () => { loadSample(); S.tab = 'exp'; S.exp = 'c3'; }], ['C4',"You're booked", () => { loadSample(); S.tab = 'exp'; S.exp = 'c4'; S.book.done = true; S.book.slot = SLOTS[1]; }]]]
];
function side(){
  document.getElementById('jumps').innerHTML = JUMPS.map((g, gi) => '<div class="grp">' + g[0] + '</div>' + g[1].map((j, k) => '<button data-jump="' + gi + '.' + k + '" data-id="' + j[0] + '"><span class="jid">' + j[0] + '</span>' + esc(j[1]) + '</button>').join('')).join('');
  document.querySelector('.side').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return;
    document.getElementById('report').classList.remove('on');
    if (b.id === 'startnew') { S = fresh(); lastId = null; render(); return; }
    if (b.id === 'startsample') { loadSample(); lastId = null; render(); return; }
    if (b.dataset.jump) { const [gi, k] = b.dataset.jump.split('.').map(Number); JUMPS[gi][1][k][2](); lastId = null; render(); } });
}
const phoneLandscape = () => innerHeight <= 500 && innerWidth > innerHeight;
// v58: desktop view (side-panel toggle or ?view=desktop); phones always get the phone layout
let deskPref = (() => { try { const q = new URLSearchParams(location.search).get('view'); if (q) return q === 'desktop'; return localStorage.getItem('lm-view') === 'desktop'; } catch (e) { return false; } })();
const isDesk = () => deskPref && innerWidth > 800;
function setDesk(on){ deskPref = on; try { localStorage.setItem('lm-view', on ? 'desktop' : 'phone'); } catch (e) {}
  document.body.classList.toggle('desk', isDesk()); const a = document.getElementById('vphone'), b = document.getElementById('vdesk'); if (a){ a.setAttribute('aria-pressed', String(!on)); b.setAttribute('aria-pressed', String(on)); }
  fit(); if (typeof S !== 'undefined' && S){ lastId = null; render(); } }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('#vphone,#vdesk'); if (b) setDesk(b.id === 'vdesk'); });
addEventListener('resize', () => document.body.classList.toggle('desk', isDesk()));
function fit(){ const w = document.getElementById('wrap'), small = innerWidth <= 800 || phoneLandscape() || isDesk(); if (small){ w.style.transform = 'none'; w.style.width = '100%'; w.style.height = '100%'; document.getElementById('phone').style.width = '100%'; document.getElementById('phone').style.height = '100%'; return; }
  w.style.width = ''; w.style.height = ''; document.getElementById('phone').style.width = ''; document.getElementById('phone').style.height = '';
  const s = Math.min(1, (innerHeight - 30) / 844, (innerWidth - 330) / 420); w.style.transform = 'scale(' + Math.max(.4, s) + ')'; }
let wasLand = phoneLandscape();
function roadOnScreen(){ const g = document.getElementById('r-glancec'), m = document.getElementById('main'); if (!g || !m || S.view !== 'journey') return false; const a = g.getBoundingClientRect(), b = m.getBoundingClientRect(); return a.bottom > b.top && a.top < b.bottom; }
function showRoad(){ const sv = document.querySelector('#r-glance svg[role=img]'); if (sv) sv.scrollIntoView({block:'start', behavior:'instant'}); }
function tlOnScreen(){ const t = document.querySelector('.tl-board'), m = document.getElementById('main'); if (!t || !m) return false; const a = t.getBoundingClientRect(), b = m.getBoundingClientRect(); return a.bottom > b.top && a.top < b.bottom; }
function showTL(){ const t = document.querySelector('.tl-board'); if (t) t.scrollIntoView({block:'start', behavior:'instant'}); }
addEventListener('resize', () => { fit(); const l = phoneLandscape(); if (wasLand !== null && l !== wasLand && S && (S.app || S.shell)){ const vis = S.app && roadOnScreen(), tlv = tlOnScreen(); render(); if (document.getElementById('tl')) layoutTL(); if (vis && l) showRoad(); else if (tlv) showTL(); } else if (document.getElementById('tl')) layoutTL(); wasLand = l; });
S = fresh(); try { applyAssume(); } catch (e) {} side(); document.body.classList.toggle('desk', isDesk()); if (deskPref){ document.getElementById('vphone').setAttribute('aria-pressed','false'); document.getElementById('vdesk').setAttribute('aria-pressed','true'); } fit(); AUTH.session().then(async () => { if (AUTH.user){ const u = AUTH.user; try { const plan = await AUTH.getPlan(); if (plan && plan.goals){ restore(plan); return; } } catch (e) {} S.acct.name = u.name || ''; S.acct.email = u.email; S.acct.ev = S.acct.sv = true; } render(); });
new MutationObserver(() => setBg(document.getElementById('report').classList.contains('on'))).observe(document.getElementById('report'), {attributes:true, attributeFilter:['class']});   // the page behind the report is inert while it is open, however it was opened or closed
['screen', 'report'].forEach(id => emoObs.observe(document.getElementById(id), {childList:true, subtree:true, characterData:false}));

/* a11y: sideways-scrolling strips can be reached and scrolled with the keyboard */
(function(){const fix=()=>document.querySelectorAll('.hstrip:not([tabindex])').forEach(e=>{e.tabIndex=0;e.setAttribute('role','group');if(!e.getAttribute('aria-label'))e.setAttribute('aria-label','Scrollable list. Use the arrow keys to see more.')});new MutationObserver(fix).observe(document.body,{childList:true,subtree:true});fix()})();
