from lib import *
import re

HTML = '/home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'
LINES = open(HTML, encoding='utf-8').read().split('\n')

PV = 'plan-vs-xlsx harness: matched'
CV = 'calc-vs-xlsx harness: matched'
GAP = 'Not testable: '
OK = 'Matched in test'
NT = 'Not testable'

def line_of(loc):
    for i, t in enumerate(LINES):
        if loc in t: return i + 1
    return None

# (screen, label as shown, prototype locator (text searched in the HTML), formula in words, workbook place, status)
CALC_ROWS = []
def cal(n, cid, name, loc, words):
    CALC_ROWS.append(('Explore > Tools > ' + name, 'Result lines of ' + name + ' (all the green boxes)', loc, words, f'{cid} sheet, green result cells (each has its formula written beside it)', OK + ' (tools/calc-vs-xlsx: results and gate wording)'))

R = [
 # ---- Home
 ('Home', 'Overall readiness ring (%) and "average"', 'V.HOME = () =>', 'Average of every goal % covered, rounded to a whole number; ring colour from the band (95+ teal, 70+ gold, else coral).', 'Plan results: Home_Avg, Home_Band', OK),
 ('Home', '"N of M goals on track"', 'V.HOME = () =>', 'Count of goals with % covered at or above 95; M = number of goals.', 'Plan results: Home_OnTrack, Home_N', OK),
 ('Home / Results', 'Goals strip "N of M goals on track"', 'function tlStrip', 'Same count of goals at or above 95%.', 'Plan results: Home_OnTrack, Home_N', OK),
 ('Home', 'Readiness "rough" flag and the "Rough picture" note', 'function roughNote', 'Rough when a section of Your finances is skipped or more than 2 required figures are missing; the note only shows when no detail is already flagged.', 'Plan results: Home_Rough, Rough_Show, Fin_Skipped, Fin_Quality', OK + ' (a figure counts as given when it is typed; reading it from a document is not recorded, which does not change the count)'),
 ('Home', 'Goals at a glance: % pill and "in N yrs"', 'V.HOME = () =>', 'Each goal % covered (rounded down); years = goal age minus your age.', 'Plan goals: GR{i}_Pct, GR{i}_Band, GR{i}_When', OK),
 ('Home', 'Your next best step', 'function nextStep', 'Picks the lowest-% goal (earliest if tied) and builds the text from its figures; otherwise the next foundation.', 'Plan results: Next_N, Next_T, Next_D, Next_B (use Fnd_NextN, Fnd_NextT, Fnd_NextD, Look_Count, Prof_NeedsProfile and the session facts on Plan inputs)', OK + ' (base plan, what-if off)'),
 ('Home / Plan', 'Your financial foundations (5 levels) and "Next best step"', 'function foundations', 'Five levels, each ok / mid / bad from cash buffer, debt, protection, goals on track, investing; "held" levels shown as "strengthen your foundations first".', 'Plan results: Fnd1..5_Fin, Fnd1..5_S, Fnd_NextN/T/D', OK + ' (base plan, what-if off)'),
 ('Home / Plan', 'Level 1 emergency fund months', 'function foundations', 'Cash and savings divided by essential monthly spending (living costs + mortgage + debt repayments), compared with the months you chose.', 'Plan results: Fnd1_St, Fnd1_S', OK),
 ('Home / Plan', 'Level 3 months to clear cards and loans, cover checks', 'function foundations', 'Months to clear = month-by-month interest and repayment; life cover and income protection checked against your answers.', 'Plan results: L3_* rows, Fnd3_St, Fnd3_S', OK),
 ('Home', 'Tools to try', 'function toolsForYou', 'Tool list picked from the types of your goals (the first 6 of the list), in a fixed order.', 'Plan results: Tools_List', OK),
 ('Home', 'Update-your-details nudge', 'function nudge', 'Shown on the booking / profile conditions.', '-', 'Not testable: text only, no number. Not built.'),
 # ---- Plan / gate
 ('Home, Results, Report, PDF button', '"To see your results we need N things" card and its rows (Retirement age, Plan until age, Inflation, Partner\'s retirement age)', 'function gateHTML', 'Only four choices block results: retirement age, plan-until age, inflation, and the partner\'s retirement age when the partner has income. The card lists those still to choose, in that order, each with a button that jumps to its box.', 'Plan results: Gate_Count, Gate_Card, Gate_Names, Gate_Keys, Gate_Text, Gate_Ready', OK),
 ('Step 7', 'Choose N things (All N chosen when none is left); N of N chosen', 'function p4Asm', 'The required choices and how many are made. Everything else is set by LifeMap (Set by LifeMap) or assumed (Assumed: add yours) and listed under What we have set for you.', 'Plan results: Req_Count, Req_Got, Req_Heading', OK),
 ('Step 7, Your assumptions', 'Retirement age: "any age from X to Y" and the two calm notes; the partner\'s note', 'function retireField', 'Youngest = your age + 1, oldest = plan-until age - 1; a calm note below 50 and below 60 (or the access age); never a block.', 'Plan results: Retire_Min, Retire_Max, Retire_Help, Retire_RangeText, Retire_Note, PRet_Note', OK),
 ('Check your details', 'Assumed: add yours · we use 25 years / your age / Employed / the Central Bank average rate', 'function checkItems', 'A missing detail the plan fills with a stated default says which one, in the same words.', 'Plan results: Use_mortYears, Use_mort2, Use_pAge, Use_work, Use_mortRate, Use_loanRate, Use_cardRate', OK),
 ('Results gate', 'An age outside 18 to 80 (yours) or 18 to 85 (partner)', 'function gateHTML', 'The workbook asks for the age (it never reads it as 0): the gate card lists "Your age" or "Partner\'s age".', 'Plan results: Gate_Keys, Gate_Names', OK),
 ('My plan', 'Required choices got / needed', 'const reqKeys', 'Inflation, retirement age, plan-until age (+ partner retirement age when the partner has an income).', 'Plan results: Req_Count, Req_Got', OK),
 ('Me / Plan', 'Missing details count ("N items need a look")', 'function checkItems', 'Count of fields marked missing or needing a look.', 'Plan results: Missing_Count', OK + ' (when not filled by example)'),
 ('Plan', 'Assumption values (inflation, wage growth, cash and investment rates, pension growth, plan end, buffer months)', 'function applyAssume', 'The customer\'s own choice when given, else the standard; wage growth, cash and investment rates after fees.', 'Plan pay & tax: AS_Infl, AS_Wage, AS_Cash, AS_Inv, AS_Pen, AS_PenRet, AS_End, AS_Year0, AS_Months', OK),
 ('Plan', 'Finance facts (essential spending, mortgage / card / loan repayments, pension contributions, debt)', 'function finNums', 'Totals from the lists, with the repayment given or worked out; essential spending = living costs + mortgage + debt repayments.', 'Plan pay & tax: F_EssM, F_MortPayM, F_CardPayM, F_LoanPayM, F_PenG, F_PenM, F_Debt (and the other F_*)', OK),
 # ---- Saving
 ('Results > Saving', 'Spare money a month ("surplus")', 'function saveAuto', 'Net income each month minus living costs, one-offs and debt repayments, in today\'s money.', 'Plan results: Save_SurplusM', OK),
 ('Results > Saving', 'How much you save a month (Q6 rule or your choice)', 'function saveAuto', 'The Discover Q6 answer sets a share of spare money (saveM); your own choice replaces it; capped at spare money.', 'Plan results: Save_SaveM, Save_AutoM, Save_SaveM_Base', OK),
 ('Results > What-if', '"You would save N a month" and "more than your spare money" warning', 'function wiLive', 'Base saving plus the what-if extra (not below 0); over when above spare money by more than 50 cent.', 'Plan results: Wi_Total, Wi_Over', OK),
 ('Results > What-if', 'Goal % and goal lines with the what-if on', 'function project', 'The whole plan is run again with the extra monthly saving, the one-off and the "save less" setting.', 'Plan pay & tax: WI_M, WI_L, WI_Retire (from Plan inputs); Plan cashflow / Plan goals year tables', OK),
 ('Results > What-if', '"What changes" sentence listing goals that moved', 'function wiText', 'Lists each goal whose % changed, from old % to new %.', 'Plan results: Wi_Text; Plan goals: GR{i}_WiTxt, GR{i}_PctBefore (typed % with the what-if off)', 'Matched in test when the before % is typed (the workbook has one run, so the before figure is typed, or the same when there is no what-if)'),
 ('Results > What-if', 'Smallest extra a month that takes a goal to 100% / 95%', 'function extraTo100', 'Searches 13 trial values of extra saving for the smallest that reaches the target.', 'Plan goals: typed helper column L; Plan results: Find_ExtraFor', 'Matched in test when the app\'s own figure is typed in. The workbook cannot search by itself.'),
 # ---- project() engine
 ('My plan > Results, Road, Timeline', 'Every year row: income, needs, from savings, shortfall, savings left, pension pot', 'function project', 'One row per year to the plan-until age: pay after tax and pension, living costs, repayments, goals due, spare money and pots, growth.', 'Plan cashflow: year table (inflow, needs, goalPaid, short, used, saved, spent, liquid, pen)', OK),
 ('My plan', 'Pay, tax, USC, PRSI each year (joint assessment, credits)', 'function hhTax', 'Income tax bands and credits, USC bands, PRSI rate blend by year; State Pension and drawdown included after retirement.', 'Plan pay & tax: year table (gross, tax, usc, prsi), PR_* constants', OK),
 ('My plan', 'Retirement pot, lump sum, ARF drawdown, State Pension', 'function project', 'Pension pot grown with contributions and relief; Standard Fund Threshold; lump sum 25% up to the limit; drawdown at the chosen % or the minimum; State Pension share by years paid.', 'Plan pay & tax: year table (pot, lump sum, drawdown, State Pension); Plan results: Ret_Year, Ret_PotNominal, Ret_IncomeMonth, Ret_LumpNet', OK),
 ('My plan', 'Debt balances month by month', 'function amortYear', 'Interest added each month, then the repayment (never more than owed) until the balance is 50 cent or less.', 'Plan debt months', OK),
 ('My plan', 'Each goal: cost at its date, pot, % covered, band', 'function project', 'Cost inflated to the goal year (mortgage-free goal costs the mortgage balance then); pot = saved + share of spare saving + one-off; % = covered amount / cost, rounded down.', 'Plan goals: GR{i}_Pct, GR{i}_Band, Slot{K}_* ; GR_* ranges', OK),
 ('Results', 'Funding order of goals', 'function project', 'Your ranking if you ranked; otherwise Emergency fund first, then must-have before nice-to-have, then soonest.', 'Plan goals: Part 1 (sort key)', OK + ' (through goal %)'),
 ('Results', 'Goal line: "You are saving N a month ..." (Option B)', 'function goalLine', 'Average a month you put in, what it covers, what is short and what could close it.', 'Plan goals: GR{i}_Line (inputs GR{i}_Extra, GR{i}_Months)', OK + ' (with the app\'s search result typed in)'),
 ('Results', 'Average put in a month, months to reach', 'function project', 'Total put into the goal pot divided by the months it is funded.', 'Plan goals: GR{i}_Months', OK),
 ('Results', 'Main strength, main gap, biggest decision', 'function findings', 'Strength = best fully covered goal (never while working-year spending exceeds income); gap = lowest-% goal; decision = the one change that closes the biggest gap, with its monthly figure.', 'Plan results: Find_Strength, Find_Gap, Find_Decision, Find_BestIdx, Find_WorstIdx', OK + ' (what-if off; extraFor typed)'),
 ('Explore > C12 Retirement projection (pre-filled from your plan)', 'Years to retirement, pension pot at retirement, income a month, lump sum after tax', 'function calcPre', 'Pot = the plan pension pot at the start of the retirement year; income a month = money in after tax in the first retired year in today prices; lump sum after tax as in C12.', 'Plan results: Ret_Year, Ret_PotNominal, Ret_IncomeMonth, Ret_LumpNet', 'Matched in test for years, pot and income (plan-vs-xlsx); the lump sum is checked through C12 only'),
 ('Results', 'Goals to slip / "these goals fall short"', 'function findings', 'List of goals below 95%.', 'Plan results: Slip_Count, Slip_Names', OK),
 ('Results / Road', 'Years you fall short; first short age; amount short; total short', 'function chartSummary', 'Count of years with a shortfall; age and amount of the first; sum of all.', 'Plan results: Chart_ShortYears, Chart_FirstShortAge, Chart_FirstShortAmt, Chart_TotalShort, Chart_DipYears', OK),
 ('Road / Timeline', 'Road colours (teal / gold / coral) and first coral age', 'function journeyNote', 'Year coral when income and savings do not cover needs; first such age quoted.', 'Plan results: Road_FirstShortAge, Road_ShortYears, Chart_LivingShortYears, Chart_FirstLivingAge', OK),
 ('Timeline / Chart', 'Chart bars: from income / from savings / shortfall', 'function rowParts', 'From income = lesser of money in and spending; from savings = used + goals paid from pots; shortfall = living shortfall + goal gap.', 'Plan cashflow: partsInc, partsSav, partsShort', OK),
 ('Timeline', 'Decade chapters: years, short years, dip years, average, weather', 'function chapters', 'Years grouped by decade (90s joined to the 80s); counts and average of rows in each.', 'Plan results: Chap_Dec .. Chap_Weather', OK),
 ('Timeline', 'Chart: selected-year detail and the per-year label', 'function chaptersHTML', 'Each year reads Comfortable, Using savings or Gap to plan for: short €x from the row figures; the goals due that year are named from the goal list.', 'Plan cashflow: yrLabel and the row figures; names: Plan goals GR{i}_Name', OK + ' (labels and figures); the list of names of goals due in a year is display-only (not a calculation)'),
 ('Plan > Timeline', 'Chapter story under each decade', 'function chaptersHTML', 'Short by about the average shortfall a year in n of these years; else living on pensions and savings; else some years dip into savings; else income comfortably covers life.', 'Plan results: Chap_Story', OK),
 ('Results', 'Goal status ring, "in N years" text', 'function yearsTxt', 'Years = goal age minus your age; at the end of your plan for a legacy goal; at the retirement age for retire.', 'Plan goals: GR{i}_When', OK),
 ('Plan, Timeline, goal tiles, Confirm my LifeMap, Report section 4', 'Calendar year beside every goal (age 41 · 2030, Age 63 · 2052, (2037))', 'function whenTxt', 'First plan year + (goal age - your age).', 'Plan goals: GR{i}_Year, GR{i}_AgeYear', OK),
 ('Report / PDF', 'Section 1 Summary (strength / gap / decision)', 'function openReport', 'Same findings as Results.', 'Plan results: Find_*', OK),
 ('Report / PDF', 'Section 3 year-by-year table (income, needs, from savings, shortfall, savings left)', 'function openReport', 'The project() rows, shown to the euro.', 'Plan cashflow: inflow, needs, used, short, liquid', OK),
 ('Report / PDF', 'Section 4 per-goal paragraph (% covered, line, extra a month)', 'function openReport', 'Goal %, goal line and the extra a month that closes the gap (extraFor).', 'Plan goals: GR{i}_Pct, GR{i}_Line, GR{i}_Extra', 'Matched in test for % and line; the per-goal extraFor search is typed (see Plan how it works).'),
 ('Report / PDF', 'Foundations list and next step', 'function openReport', 'Same as the Foundations card.', 'Plan results: Fnd*', OK),
 ('Report / PDF', 'Section 5 what-if text', 'function wiText', 'See What-if.', 'Plan results: Wi_Text; Plan pay & tax: WI_M, WI_L', 'Matched in test when the before % is typed'),
 ('Report / PDF', 'Section 6 money snapshot (every Your finances figure, tag, "N items missing")', 'function fmtField', 'Displays the figures you gave and the count of items missing; the tag (document / typed) is display-only.', 'Plan results: Missing_Count', OK + ' for the count; the tags are display-only (not a calculation)'),
 ('Me > My money, Your finances hub (step 6)', 'Section progress (5 of 6 done; Done / Needs a look / Started / Not started per section)', 'function secStatus', 'A section is done when every required figure shown is given or you saved it; needs a look if a figure is flagged; started if anything beyond the pre-filled age is typed.', 'Plan results: Fin1_St, Fin2_St, Fin3_St, Fin4_St, Fin5_St, Fin6_St, Fin_Done, Fin_MinOK', OK),
 ('Me > My money > Check details', 'N details look good and N need a look', 'function checkItems', 'Every shown figure that is given and not flagged looks good; flagged or required-and-missing ones need a look.', 'Plan results: Good_Count, Missing_Count, Look_Count', OK),
 ('Report / PDF', 'Section 7 personality, money terms, indicative risk profile', 'function riskRead', 'See Understand Me rows below.', 'Plan profile: Prof_*', OK),
 ('Report / PDF', 'Section 9 "What your plan assumes" list', 'function assumeRows', 'Each assumption with its value and who chose it.', 'Plan pay & tax: AS_*', 'Values matched in test; the wording of the list is not built.'),
 # ---- Understand Me / Discover
 ('Discover / Me', 'Questions answered (of 6 and of 13)', 'const discCount', 'Count of numeric answers among the 6 Discover questions and the 13 profile questions.', 'Plan profile: Prof_DiscCount, Prof_UmCount, Prof_Full', OK),
 ('Discover / Me', 'Money personality (Planner, Builder, Explorer, Cautious)', 'function personality', 'Weighted score for each type from the answers (needs at least 4 of the 6 weighted answers); highest wins; ties broken in a fixed order.', 'Plan profile: Prof_SA..SC, Prof_Top, Prof_TypeKey, Prof_Personality', OK),
 ('Me', 'Suggested answer to the "fall" question (u9)', 'function suggestU9', 'Suggestion from the other answers until the customer chooses.', 'Plan profile: Prof_SuggestU9', OK),
 ('Me', 'Risk profile: attitude (want), capacity (can), time horizon, knowledge and experience', 'function riskRead', 'Each part scored from its answers; the profile is the lowest of want, can afford, time and experience; "limit" names the one that sets it.', 'Plan profile: Prof_T, Prof_C, Prof_H, Prof_KE, Prof_Level, Prof_Label, Prof_Limit', OK),
 ('Me > Understand Me', 'Per-section counts (2 of 3 answered, 3 of 5) and the line 6 of 7 left · your first 6 answers are filled in', 'function umLeftTxt', 'Answers given in each of the 3 sections; new questions still to answer of 7.', 'Plan profile: Prof_UmSec1, Prof_UmSec2, Prof_UmSec3, Prof_UmLeft, Prof_UmLeftTxt', OK),
 ('Me', 'Mismatch message (want higher than can afford, etc.)', 'MIS_ADV', 'Key chosen from comparing want, can and time.', 'Plan profile: Prof_MisKey', OK),
 ('Me', 'Comfort, cushion and provisional marker', 'function riskRead', 'Wording picked from the parts; provisional until all 13 are answered.', 'Plan profile: Prof_Comfort, Prof_Cushion, Prof_Provisional', OK),
 ('Me / Plan', 'Money terms (mindset, behaviour, appetite, capacity)', 'function myTerms', 'A term for each group from the answers given.', 'Plan profile: Prof_TermsMindset .. Prof_TermsCapacity', OK),
 ('Plan', 'Profile banner on the plan', 'function planProfileBanner', 'Text from the risk read (provisional or full).', 'Plan profile: Prof_Banner', OK),
 ('Me > Understand Me', 'Section "N of M answered", ring %', 'function umCount', 'Answered divided by 13, rounded.', 'Plan profile: Prof_UmCount (ring % = Prof_UmCount / 13)', OK),
 # ---- Experts
 ('Experts', 'Suggested specialist type (weakest goal)', 'function specialist', 'Weakest goal (lowest %) picks its specialist; otherwise the planner.', 'Plan results: Expert_Idx, Expert_Key, Expert_Type', OK),
 ('Experts', 'Adviser shown (rotation) and adviser text', 'const ADVISERS', 'The adviser list is fixed; the customer steps through it.', '-', 'Not a calculation (fixed list). No workbook content.'),
 ('Experts', 'Adviser meeting date / time options', 'async function saveMeeting', 'Dates are fixed text.', '-', 'Not a calculation.'),
 ('Ask / Experts', 'Suggested questions that quote plan figures', 'function askPlan', 'Text built from goal % and ages.', '-', 'Display-only text built from figures already in the workbook (goal %, goal line, retirement age): not a calculation, not built.'),
 ('Report', 'Header: Created 29 Sep 2026 · version 2', 'function openReport', 'A date typed in the app and the number of saved versions.', '-', 'Constant / session count: not a calculation.'),
 ('Results', 'Typed-search goal lines (extraTo100, extraFor)', 'function extraTo100', 'Bisection and a fixed ladder; see the specification and test vectors on Plan how it works.', 'Plan goals: GR{i}_Extra, GR{i}_ExtraUsed; Plan results: Find_ExtraFor, Find_ExtraUsed', 'Matched in test when the app figure is typed in; the sample customer figures are built in for the demo'),
 ('Explore', 'Tools for you', 'function toolsForYou', 'See Home.', 'Plan results: Tools_List', OK),
 ('Explore', 'Videos for you: order', 'function videosForYou', 'Videos sorted so the one about the weakest goal comes first, then those about your goals.', 'Plan results: Expert_Key', 'Display-only: a sort of a fixed list of videos, not a calculation. The weakest goal it is based on is matched (Expert_Idx).'),
 ('Explore home', 'What-ifs for your goals: Try a what-if for travel, 28% covered now', 'function xWorst', 'One tile for each goal under 95%, with its % covered.', 'Plan results: Slip_Count, Slip_Names; Plan goals: GR{i}_Pct', OK),
 ('Video page', 'Why this is for you: your goal is N% covered', 'V.VID = id =>', 'The first goal whose specialist type matches the video (pension videos use the retirement goal) and its % covered.', 'Plan results: Vid_mortgage_Pct, Vid_pension_Pct, Vid_protection_Pct, Vid_investment_Pct, Vid_planner_Pct', OK + ' (base plan)'),
 ('Explore > categories', '7 tools, 3 tools per category', 'const CATS', 'Count of the 28 tools in each category.', 'Plan results: Cat_N1, Cat_N2, Cat_N3, Cat_N4, Cat_N5, Cat_N6 (counted from the README list)', OK),
 ('Tools', 'Calculators pre-filled from your plan ("Worked out from your figures")', 'function calcPre', 'Each tool starts from your own figures (mortgage, deposit target, pension, etc.).', 'Plan inputs feed Plan sheets; the C01-C28 sheets take their own inputs', 'Not built: the C sheets are not linked to the Plan inputs by design (each calculator is independent). Known gap.'),
 ('Tools', 'Document reader: figures, confidence %', 'function startUpload', 'Reads figures from a document (demo).', 'Document reader spec sheet', 'Not testable (a specification, not a calculation).'),
]

CALCS = [
 ('C01 Borrowing', 'borrow', 'Maximum loan by income multiple and by loan-to-value; price = loan + deposit; deposit rules.'),
 ('C02 Mortgage repayment', 'repayment', 'Monthly repayment = balance x i / (1 - (1+i)^-n), i = yearly rate / 12; total interest.'),
 ('C03 Deposit', 'deposit', 'Months to reach the deposit from savings, monthly saving and growth.'),
 ('C04 Mortgage overpayment', 'overpay', 'Months saved and interest saved when you pay extra each month.'),
 ('C05 Interest rate impact', 'ratechange', 'Repayment at the new rate against the current rate.'),
 ('C06 Term comparison', 'term', 'Repayment and total interest for each term.'),
 ('C07 Rent vs buy', 'rentbuy', 'Cost of renting against buying over the years (costs, equity, upkeep).'),
 ('C08 Goal planner', 'goalplanner', 'Monthly saving needed to reach a goal given growth.'),
 ('C09 Compound growth', 'compound', 'Value of regular saving at the growth rate.'),
 ('C10 Lump sum growth', 'lumpsum', 'One-off amount grown for the years, nominal and real.'),
 ('C11 Emergency fund', 'emergency', 'Months covered; target = months x essential spending.'),
 ('C12 Retirement projection', 'retirement', 'Pot at retirement, lump sum, income a month against the target.'),
 ('C13 Contribution impact', 'contrib', 'Pot with and without a contribution increase.'),
 ('C14 AVC impact', 'avc', 'Extra pot and tax relief from AVCs.'),
 ('C15 Will my money last', 'lastmoney', 'Years the pot lasts with the drawdown.'),
 ('C16 Drawdown scenarios', 'drawdown', 'Pot life at three growth rates.'),
 ('C17 Inflation adjusted return', 'realreturn', 'Real return and the value in today\'s money.'),
 ('C18 Regular investing', 'regularinvest', 'Value of monthly investing after charges.'),
 ('C19 Fees impact', 'fees', 'Cost of fees over time.'),
 ('C20 Risk and return', 'riskreturn', 'Range of outcomes from risk-style return and spread.'),
 ('C21 Life cover', 'lifecover', 'Cover needed = debts + income years + extras - assets.'),
 ('C22 Income protection gap', 'incomegap', 'Months you could cope; gap to cover.'),
 ('C23 Mortgage protection', 'mortgageprotect', 'Cover to clear the mortgage over the term.'),
 ('C24 Net worth', 'networth', 'Assets minus debts.'),
 ('C25 Monthly surplus', 'surplus', 'Income minus spending each month.'),
 ('C26 Budget 50 30 20', 'budget', 'Needs, wants and savings against the 50 / 30 / 20 split (spending shares of take-home pay).'),
 ('C27 Debt repayment', 'debtpay', 'Months and interest to clear the debt (avalanche or snowball).'),
 ('C28 Loan repayment', 'loan', 'Repayment, total cost and interest of a loan.'),
]

def build_register(bk):
    wb = bk.wb
    if 'Calculation register' in wb.sheetnames: del wb['Calculation register']
    ws = wb.create_sheet('Calculation register'); ws.sheet_properties.tabColor = '5B9BD5'
    ws['B1'] = 'Calculation register: every place the prototype calculates, scores or shows a number'; ws['B1'].font = Font(bold=True, size=14)
    ws['B2'] = ('One row for each. "Status": Matched in test = the tools/plan-vs-xlsx or tools/calc-vs-xlsx harness feeds the same inputs to the prototype and to a recalculated copy of this workbook and compares the results '
                '(within one euro, or exact text). Not testable / Known gap = not in the workbook, with the reason. Line numbers refer to LifeGoals-Customer-Journey-Prototype.html.')
    ws['B2'].alignment = Alignment(wrap_text=True, vertical='top'); ws.merge_cells('B2:H2'); ws.row_dimensions[2].height = 48
    heads = ['No.', 'Screen', 'Label as shown', 'Prototype function / line', 'Formula in words', 'Workbook sheet and cell / name', 'Status']
    for j, h in enumerate(heads):
        c = ws.cell(4, 2 + j, h); c.fill = HEAD; c.font = WH
    for col, w in zip('ABCDEFGH', [2, 6, 26, 44, 30, 62, 52, 36]): ws.column_dimensions[col].width = w
    rows = []
    for s, lab, loc, words, wbp, st in R: rows.append((s, lab, loc, words, wbp, st))
    for sheet, cid, words in [(a, b, c) for a, b, c in CALCS]:
        nm = [x for x in ['x']]
        rows.append(('Explore > Tools > ' + sheet[4:], 'Result lines of ' + sheet[4:], "{id:'" + cid + "'", words, sheet + ': green result cells, each with its formula written beside it', OK + ' (tools/calc-vs-xlsx: results and gate wording)'))
    # existing global names check for the Plan workbook place column (first token before ':' is the sheet)
    r = 5; miss = []
    for i, (s, lab, loc, words, wbp, st) in enumerate(rows):
        ln = line_of(loc)
        if ln is None: miss.append(loc)
        fn = (loc if not loc.startswith('{id') else 'CALCS entry ' + loc[5:-1]) + (f' (line {ln})' if ln else ' (not found)')
        vals = [i + 1, s, lab, fn, words, wbp, st]
        for j, v in enumerate(vals):
            c = ws.cell(r, 2 + j, v); c.alignment = Alignment(wrap_text=True, vertical='top')
        c = ws.cell(r, 8)
        c.fill = GRN if st.startswith(OK) else (ORG if st.startswith(('Not', 'Partly', 'Figures', 'Values', 'Matched in test when')) else GRN)
        if st.startswith('Matched in test when') or st.startswith('Figures') or st.startswith('Values') or st.startswith('Partly'): c.fill = PLN
        r += 1
    ws.freeze_panes = 'C5'
    last = r - 1
    ws.auto_filter.ref = f'B4:H{last}'
    r += 1
    ws.cell(r, 2, 'Summary').font = B
    ws.cell(r + 1, 3, 'Rows in the register'); ws.cell(r + 1, 4, f'=COUNTA(C5:C{last})')
    ws.cell(r + 2, 3, 'Matched in test'); ws.cell(r + 2, 4, f'=COUNTIF(H5:H{last},"Matched in test*")-COUNTIF(H5:H{last},"Matched in test when*")')
    ws.cell(r + 3, 3, 'Matched with a note (typed search figure, partial)'); ws.cell(r + 3, 4, f'=COUNTIF(H5:H{last},"Matched in test when*")+COUNTIF(H5:H{last},"Figures*")+COUNTIF(H5:H{last},"Values*")+COUNTIF(H5:H{last},"Partly*")')
    ws.cell(r + 4, 3, 'Not built / not testable (known gaps)'); ws.cell(r + 4, 4, f'=D{r + 1}-D{r + 2}-D{r + 3}')
    # check every name quoted exists and sits on the sheet quoted
    bad = []
    for s_, lab, loc, words, wbp, st in rows:
        for seg in wbp.split(';'):
            if ':' not in seg: continue
            sh, rest = seg.split(':', 1)
            for nm in re.findall(r'\b([A-Z][A-Za-z0-9]*_[A-Za-z0-9_]+)', rest):
                if '{' in nm: continue
                if nm not in wb.defined_names: bad.append((nm, 'missing')); continue
                dest = wb.defined_names[nm].attr_text.split('!')[0].strip("'")
                if dest != sh.strip(): bad.append((nm, sh, dest))
    return ws, miss, len(rows), bad
