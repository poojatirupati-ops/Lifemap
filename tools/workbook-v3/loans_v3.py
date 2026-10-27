"""Adds the four Loans calculators (C31 Loan comparison, C32 Loan affordability, C33 Credit card repayment, C34 Debt payoff plan)
to the v3.0 workbook, in the same layout as C28, plus one hidden sheet 'Loan months' with the month-by-month tables.
Everything else in the workbook is left as it is, except: C27 and C28 now say Category: Loans, the hidden README list and the
Explore category counts follow the app (Loans 6 tools, Everyday Money 3), and the READ ME / Test notes lines about the calculators.
Usage: loans_v3.py in.xlsx out.xlsx"""
import sys, copy, openpyxl
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.workbook.defined_name import DefinedName
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.worksheet.hyperlink import Hyperlink
from openpyxl.utils import get_column_letter as L
src, out = sys.argv[1:3]
wb = openpyxl.load_workbook(src)
T = wb['C28 Loan repayment']
TAB = T.sheet_properties.tabColor
ST = {k: T[k] for k in ['B1', 'E1', 'B2', 'B3', 'B5', 'C5', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'B10', 'C10', 'B11', 'C11', 'D11', 'E11', 'C13', 'C14', 'B17', 'B22', 'B23', 'C23', 'B26', 'C26', 'B29']}
def sty(dst, key, fmt=None):
    s = ST[key]; dst.font = copy.copy(s.font); dst.fill = copy.copy(s.fill); dst.border = copy.copy(s.border); dst.alignment = copy.copy(s.alignment); dst.number_format = fmt or s.number_format
EUR, PCT, NUM, TXT = '\\€#,##0', '0.00%', '#,##0', 'General'
E2F = T['E2'].value
def make(title, cid, question, blurb, inputs, results, how, needs, sheetname):
    ws = wb.create_sheet(sheetname); ws.sheet_properties.tabColor = TAB
    for col, w in zip('ABCDEFG', [2, 50, 26, 24, 78, 14, 16]): ws.column_dimensions[col].width = w
    ws['A1'] = '≡'; ws['A1'].font = copy.copy(T['A1'].font); ws['A1'].hyperlink = Hyperlink(ref='A1', location="'READ ME'!A1", display='≡')
    ws['B1'] = title; sty(ws['B1'], 'B1'); ws['E1'] = 'Category: Loans · prototype id: ' + cid; sty(ws['E1'], 'E1'); ws.row_dimensions[1].height = 19.5
    ws['B2'] = 'Question it answers: ' + question; sty(ws['B2'], 'B2'); ws['E2'] = E2F; sty(ws['E2'], 'E1')
    ws['B3'] = blurb; sty(ws['B3'], 'B3')
    for c, v in zip('BCDEF', ['INPUTS', 'Your figure', 'Unit', 'Allowed', 'Example only (grey; used only when "Fill example values" is Yes)']): ws[c + '5'] = v; sty(ws[c + '5'], 'B5' if c == 'B' else 'C5')
    names = {}
    r = 6
    for (name, label, unit, allowed, ex, fmt, lo, hi, opt) in inputs:
        ws['B%d' % r] = label; sty(ws['B%d' % r], 'B6'); ws['C%d' % r] = None; sty(ws['C%d' % r], 'C6', fmt); ws['D%d' % r] = unit; sty(ws['D%d' % r], 'D6')
        ws['E%d' % r] = allowed; sty(ws['E%d' % r], 'E6')
        if opt: ws['G%d' % r] = '=IF(ISBLANK(C%d),0,C%d)' % (r, r)
        else:
            ws['F%d' % r] = ex; sty(ws['F%d' % r], 'F6', fmt); ws['G%d' % r] = '=IF(ISBLANK(C%d),IF(Fill_Example="Yes",F%d,""),C%d)' % (r, r, r)
        sty(ws['G%d' % r], 'G6', fmt)
        dv = DataValidation(type='decimal', operator='between', formula1=str(lo), formula2=str(hi), allow_blank=True, showErrorMessage=True, showInputMessage=True, errorTitle='Outside the allowed range', error='Please enter ' + allowed.split('Allowed: ')[-1] + '.', promptTitle=label, prompt=allowed)
        ws.add_data_validation(dv); dv.add('C%d' % r)
        names[name] = '$G$%d' % r; names[name + '_Entry'] = '$C$%d' % r
        r += 1
    r += 1
    for c, v in zip('BCDE', ['RESULTS', 'Result', 'Shown as', 'Formula']): ws[c + str(r)] = v; sty(ws[c + str(r)], 'B10')
    r += 1
    for (name, label, formula, fmt, shown, ftext, key) in results:
        ws['B%d' % r] = label; sty(ws['B%d' % r], 'B11'); ws['C%d' % r] = '=IF(Need_1<>"",Need_1,' + formula + ')'; sty(ws['C%d' % r], 'C11' if key else 'C13', fmt)
        ws['D%d' % r] = shown; sty(ws['D%d' % r], 'D6'); ws['E%d' % r] = 'ƒx  =' + ftext; sty(ws['E%d' % r], 'E11')
        names[name] = '$C$%d' % r; r += 1
    r += 1
    ws['B%d' % r] = 'HOW IT WORKS'; sty(ws['B%d' % r], 'B10')
    for t in how:
        r += 1; ws['B%d' % r] = t; sty(ws['B%d' % r], 'B17'); ws.merge_cells('B%d:E%d' % (r, r)); ws.row_dimensions[r].height = 30 if len(t) > 150 else 15
    r += 2
    ws['B%d' % r] = 'ADD TO MY PLAN (what this calculator sends to the plan)'; sty(ws['B%d' % r], 'B22')
    r += 1; ws['B%d' % r] = 'Goal'; sty(ws['B%d' % r], 'B23'); ws['C%d' % r] = '="No goal"'; sty(ws['C%d' % r], 'C23'); ws['E%d' % r] = 'ƒx  ="No goal"'; sty(ws['E%d' % r], 'E11'); names['Plan_Goal_Kind'] = '$C$%d' % r
    r += 2
    ws['B%d' % r] = 'CHOICES STILL NEEDED (helper rows: blank = all inputs a result needs are filled)'; sty(ws['B%d' % r], 'B22')
    for k, (label, formula) in enumerate(needs, 1):
        r += 1; ws['B%d' % r] = label; sty(ws['B%d' % r], 'B26'); ws['C%d' % r] = formula; sty(ws['C%d' % r], 'C26'); names['Need_%d' % k] = '$C$%d' % r
    for n, ref in names.items(): ws.defined_names[n] = DefinedName(n, attr_text="'%s'!%s" % (sheetname, ref))
    return ws, names
def rng(lo, hi, step, unit): return 'Allowed: ' + lo + ' to ' + hi + ' · steps of ' + step
own = 'Type 3 · your figure · Your own figure. '
off = 'Type 3 · optional · '
# ---------- C31 Loan comparison
inp = [('Loan_Amount', 'Loan amount', '€', own + rng('€500', '€100,000', '€500', ''), 15000, EUR, 500, 100000, False),
       ('APR_A', 'Offer A: interest (APR)', '%', 'Type 2 · your figure · The APR in offer A (the yearly cost of the loan including its charges). ' + rng('0%', '25%', '0.25%', ''), 0.09, PCT, 0, 0.25, False),
       ('Years_A', 'Offer A: years', 'years', own + rng('1', '10', '1', ''), 5, NUM, 1, 10, False),
       ('APR_B', 'Offer B: interest (APR)', '%', 'Type 2 · your figure · The APR in offer B. ' + rng('0%', '25%', '0.25%', ''), 0.075, PCT, 0, 0.25, False),
       ('Years_B', 'Offer B: years', 'years', own + rng('1', '10', '1', ''), 7, NUM, 1, 10, False)]
N1 = '=IF(Loan_Amount="","Choose your loan amount to see this",IF(APR_A="","Choose offer A\'s rate to see this",IF(Years_A="","Choose offer A\'s years to see this",IF(APR_B="","Choose offer B\'s rate to see this",IF(Years_B="","Choose offer B\'s years to see this","")))))'
res = [('Monthly_Rate_A', 'Monthly interest rate, offer A', '(1+APR_A)^(1/12)-1', '0.0000%', '', '(1+APR_A)^(1/12)-1', False),
       ('Monthly_Rate_B', 'Monthly interest rate, offer B', '(1+APR_B)^(1/12)-1', '0.0000%', '', '(1+APR_B)^(1/12)-1', False),
       ('Repayment_A', 'Offer A: monthly repayment', 'PMT(Monthly_Rate_A,Years_A*12,-Loan_Amount)', EUR, '€', 'PMT(Monthly_Rate_A,Years_A*12,-Loan_Amount)', True),
       ('Total_A', 'Offer A: total repaid', 'Repayment_A*Years_A*12', EUR, '€', 'Repayment_A*Years_A*12', False),
       ('Interest_A', 'Offer A: total interest', 'Total_A-Loan_Amount', EUR, '€', 'Total_A-Loan_Amount', True),
       ('Repayment_B', 'Offer B: monthly repayment', 'PMT(Monthly_Rate_B,Years_B*12,-Loan_Amount)', EUR, '€', 'PMT(Monthly_Rate_B,Years_B*12,-Loan_Amount)', True),
       ('Total_B', 'Offer B: total repaid', 'Repayment_B*Years_B*12', EUR, '€', 'Repayment_B*Years_B*12', False),
       ('Interest_B', 'Offer B: total interest', 'Total_B-Loan_Amount', EUR, '€', 'Total_B-Loan_Amount', True),
       ('Interest_Difference', 'Difference in interest (A minus B)', 'Interest_A-Interest_B', EUR, '€', 'Interest_A-Interest_B', True),
       ('Monthly_Difference', 'Difference in monthly repayment (A minus B)', 'Repayment_A-Repayment_B', EUR, '€', 'Repayment_A-Repayment_B', False),
       ('Cheaper_Overall', 'Cheaper overall', 'IF(ABS(Interest_Difference)<1,"About the same","Offer "&IF(Interest_Difference>0,"B","A"))', TXT, '', 'IF(ABS(Interest_Difference)<1,"About the same","Offer "&IF(Interest_Difference>0,"B","A"))', True)]
how = ['• Both offers are for the same amount. Monthly rate = (1 + APR)^(1/12) − 1 (the APR is an effective yearly rate that already includes the loan\'s charges, so there is no separate fee input). Repayment = PMT(monthly rate, months, −amount).',
       '• Total repaid = repayment × months; total interest = total repaid − amount. The cheaper offer is the one with less total interest (within €1 it is "About the same").',
       '• A lower monthly repayment can come from a longer term that costs more overall: compare the total interest, not only the monthly figure.']
make('C31 · Loan comparison', 'loancompare', 'Two offers: which one costs less?', 'Compares two loan offers for the same amount by APR and term: monthly repayment, total interest and total repaid.', inp, res, how, [('Needs: loan amount, both rates and both terms', N1)], 'C31 Loan comparison')
# ---------- C32 Loan affordability
inp = [('Take_Home', 'Take-home pay a month', '€', own + rng('€500', '€15,000', '€50', ''), 3000, EUR, 500, 15000, False),
       ('Essential_Spending', 'Essential spending a month', '€', own + 'Include rent or mortgage. ' + rng('€0', '€10,000', '€50', ''), 1800, EUR, 0, 10000, False),
       ('Existing_Repayments', 'Loan and card repayments a month', '€', own + rng('€0', '€5,000', '€10', ''), 200, EUR, 0, 5000, False),
       ('APR', 'Interest (APR)', '%', 'Type 2 · your figure · The APR you expect for the loan. ' + rng('0%', '25%', '0.25%', ''), 0.09, PCT, 0, 0.25, False),
       ('Years', 'Years', 'years', own + rng('1', '10', '1', ''), 5, NUM, 1, 10, False),
       ('Share_Used', 'Share of spare money you would use', '%', own + 'The rest is kept as a buffer. ' + rng('10%', '100%', '5%', ''), 0.7, '0%', 0.1, 1, False)]
N1 = '=IF(Take_Home="","Choose your take-home pay to see this",IF(Essential_Spending="","Choose your essential spending to see this",IF(Existing_Repayments="","Choose your repayments to see this",IF(APR="","Choose your loan rate to see this",IF(Years="","Choose your years to see this",IF(Share_Used="","Choose the share of spare money to see this",""))))))'
res = [('Monthly_Rate', 'Monthly interest rate from the APR', '(1+APR)^(1/12)-1', '0.0000%', '', '(1+APR)^(1/12)-1', False),
       ('Spare_Raw', 'Take-home pay − essentials − repayments', 'Take_Home-Essential_Spending-Existing_Repayments', EUR, '€', 'Take_Home-Essential_Spending-Existing_Repayments', False),
       ('Spare_Money', 'Spare money a month', 'MAX(0,Spare_Raw)', EUR, '€', 'MAX(0,Spare_Raw)', True),
       ('Repayment_Used', 'Repayment you could use', 'Spare_Money*Share_Used', EUR, '€', 'Spare_Money*Share_Used', True),
       ('Loan_Amount', 'Loan you could afford', 'PV(Monthly_Rate,Years*12,-Repayment_Used)', EUR, '€', 'PV(Monthly_Rate,Years*12,-Repayment_Used)', True),
       ('Total_Interest', 'Total interest on this loan', 'Repayment_Used*Years*12-Loan_Amount', EUR, '€', 'Repayment_Used*Years*12-Loan_Amount', False),
       ('Repayment_If_Rate_Up', 'Repayment if the rate were 3 points higher', 'PMT((1+APR+0.03)^(1/12)-1,Years*12,-Loan_Amount)', EUR, '€', 'PMT((1+APR+0.03)^(1/12)-1,Years*12,-Loan_Amount)', True),
       ('Affordable_Now', 'Affordable now?', 'IF(Spare_Raw<=0,"Not affordable now","Yes")', TXT, '', 'IF(Spare_Raw<=0,"Not affordable now","Yes")', False)]
how = ['• Spare money = take-home pay − essential spending − existing loan and card repayments (never below 0). You choose what share of it to use; the rest is a buffer for surprises.',
       '• The loan is the amount that a level repayment of that size clears over the term: PV(monthly rate, months, −repayment). The stress line repeats the repayment for that loan with the APR 3 percentage points higher.',
       '• Guidance on affordability only, not a lender\'s decision (lenders also look at credit history and employment).']
make('C32 · Loan affordability', 'loanafford', 'How much could I comfortably borrow?', 'Works back from your spare money to the loan you could comfortably repay, and shows the repayment if rates rose by 3 points.', inp, res, how, [('Needs: take-home pay, essentials, repayments, rate, years, share', N1)], 'C32 Loan affordability')
# ---------- C33 Credit card repayment
inp = [('Card_Balance', 'Card balance', '€', own + rng('€100', '€30,000', '€100', ''), 3000, EUR, 100, 30000, False),
       ('APR', 'Interest (APR)', '%', 'Type 2 · your figure · Your card\'s APR: your statement shows it. ' + rng('0%', '35%', '0.5%', ''), 0.21, PCT, 0, 0.35, False),
       ('Your_Payment', 'Your monthly payment', '€', own + rng('€10', '€3,000', '€10', ''), 150, EUR, 10, 3000, False),
       ('Min_Percent', 'Card minimum: % of balance (0 = not entered)', '%', off + 'Your card\'s minimum rule is on your statement or in your card terms, for example "3% of the balance or €6.35, whichever is greater". Issuers differ, so there is no default. ' + rng('0%', '10%', '0.5%', ''), None, PCT, 0, 0.1, True),
       ('Min_Floor', 'Card minimum: lowest amount (€)', '€', off + 'The "or €X, whichever is greater" part of the rule. ' + rng('€0', '€100', '€0.50', ''), None, '\\€#,##0.00', 0, 100, True),
       ('Clear_Within', 'I want it cleared within (months)', 'months', own + rng('6', '120', '1', ''), 36, NUM, 6, 120, False)]
N1 = '=IF(Card_Balance="","Choose your card balance to see this",IF(APR="","Choose your credit-card rate to see this",IF(Your_Payment="","Choose your monthly payment to see this",IF(Clear_Within="","Choose how soon you want it cleared to see this",""))))'
LM = "'Loan months'!"
res = [('Monthly_Rate', 'Monthly interest rate from the APR', '(1+APR)^(1/12)-1', '0.0000%', '', '(1+APR)^(1/12)-1', False),
       ('Interest_This_Month', 'Interest charged this month', 'Card_Balance*Monthly_Rate', EUR, '€', 'Card_Balance*Monthly_Rate', True),
       ('Months_Your_Payment', 'Your payment: months to clear', 'IF(OR(Your_Payment<=Card_Balance*Monthly_Rate,Your_Payment<=0),"Never",ROUNDUP(ROUND(NPER(Monthly_Rate,-Your_Payment,Card_Balance),6),0))', '0', 'months', 'IF(Your_Payment<=Card_Balance*Monthly_Rate,"Never",ROUNDUP(ROUND(NPER(Monthly_Rate,-Your_Payment,Card_Balance),6),0))', True),
       ('Final_Payment', 'Last (part) payment', 'IF(Months_Your_Payment="Never","—",-FV(Monthly_Rate,Months_Your_Payment-1,-Your_Payment,Card_Balance)*(1+Monthly_Rate))', EUR, '€', 'IF(Months_Your_Payment="Never","—",-FV(Monthly_Rate,Months_Your_Payment-1,-Your_Payment,Card_Balance)*(1+Monthly_Rate))', False),
       ('Interest_Your_Payment', 'Your payment: total interest', 'IF(Months_Your_Payment="Never","—",Your_Payment*(Months_Your_Payment-1)+Final_Payment-Card_Balance)', EUR, '€', 'IF(Months_Your_Payment="Never","—",Your_Payment*(Months_Your_Payment-1)+Final_Payment-Card_Balance)', True),
       ('Months_Minimum', 'Minimum only: months to clear', 'IF(Min_Percent=0,"—",IF(' + LM + '$E$1209>0.005,"Never",COUNTIF(' + LM + '$B$9:$B$1208,">0.005")))', '0', 'months', 'month-by-month table on the hidden sheet Loan months', True),
       ('Interest_Minimum', 'Minimum only: total interest', 'IF(OR(Min_Percent=0,Months_Minimum="Never"),"—",SUM(' + LM + '$C$9:$C$1208))', EUR, '€', 'sum of the interest column of that table', True),
       ('Interest_Saved', 'Interest saved by your payment', 'IF(OR(Min_Percent=0,Months_Minimum="Never",Months_Your_Payment="Never"),"—",Interest_Minimum-Interest_Your_Payment)', EUR, '€', 'Interest_Minimum-Interest_Your_Payment', True),
       ('Months_Target', 'Months you want it cleared within', 'Clear_Within', '0', 'months', 'Clear_Within', False),
       ('Payment_Target', 'Payment to clear it within that time', 'PMT(Monthly_Rate,Clear_Within,-Card_Balance)', EUR, '€', 'PMT(Monthly_Rate,Clear_Within,-Card_Balance)', True)]
how = ['• Monthly rate = (1 + APR)^(1/12) − 1 (an effective yearly rate, as for cards). Your payment: months = NPER(rate, −payment, balance) rounded up; total interest = full payments + last part payment − balance.',
       '• Minimum only: each month the interest is added, then the larger of the card\'s lowest amount and its % of the balance is paid (never more than is owed). The table is on the hidden sheet Loan months (up to 1,200 months; beyond that: Never).',
       '• Your card\'s minimum rule is entered by you (no default): issuers differ. Assumes no new spending, fees or promotional rates. If your payment is at or below the first month\'s interest the balance never falls.']
make('C33 · Credit card repayment', 'creditcard', 'What does the minimum payment really cost?', 'Shows what paying only your card\'s minimum costs, against your own payment, and the payment that clears the card within a time you choose.', inp, res, how, [('Needs: card balance, rate, payment and months', N1)], 'C33 Credit card repayment')
# ---------- C34 Debt payoff plan
names3 = ['Credit card', 'Loan', 'Other debt']
inp = []
ex = [(4500, 0.21, 135), (2000, 0.08, 90), (9000, 0.09, 220)]
for k in (1, 2, 3):
    inp += [('Balance_%d' % k, '%s: balance' % names3[k - 1], '€', own + rng('€0', '€100,000', '€100', ''), ex[k - 1][0], EUR, 0, 100000, False),
            ('APR_%d' % k, '%s: interest (APR)' % names3[k - 1], '%', 'Type 2 · your figure · The APR on this debt. ' + rng('0%', '35%', '0.5%', ''), ex[k - 1][1], PCT, 0, 0.35, False),
            ('Payment_%d' % k, '%s: minimum or repayment a month' % names3[k - 1], '€', own + rng('€0', '€3,000', '€5', ''), ex[k - 1][2], EUR, 0, 3000, False)]
inp.append(('Extra_Payment', 'Extra each month', '€', off + 'Optional: leave blank for none. ' + rng('€0', '€2,000', '€10', ''), 100, EUR, 0, 2000, False))
N1 = '=IF(COUNT(Balance_1,APR_1,Payment_1,Balance_2,APR_2,Payment_2,Balance_3,APR_3,Payment_3,Extra_Payment)<10,"Fill in your debts to see this","")'
P = "'C34 Debt payoff plan'!"
def eng(col): return LM + '$%s$' % col
S1 = lambda col: "'Loan months'!$%s$1208" % col
# strategy blocks on Loan months start at column H (8), 22 columns each: A avalanche, S snowball, N none
def base(sidx): return 8 + 24 * sidx   # block: 0 month, 1-18 the three debts (opening, interest, minimum paid, after minimum, extra paid, closing), 19 left after minimums, 20 any debt owed, 21 interest this month, 22 'never' flag (row 7)
def cell(sidx, off, row, absc=False): return '%s%d' % (L(base(sidx) + off), row)
res = [('Total_Owed', 'Total owed today', 'SUM(Balance_1,Balance_2,Balance_3)', EUR, '€', 'SUM(Balance_1,Balance_2,Balance_3)', True)]
labels = [('Highest_Rate', 'Highest rate first', 0), ('Smallest_Balance', 'Smallest balance first', 1), ('Minimums', 'Minimums only', 2)]
for key, lab, si in labels:
    mc = L(base(si) + 21)  # last column holds the 'any debt still owed after the payments' flag? (see engine)
    res.append(('Months_' + key, lab + ': months to clear', 'IF(' + LM + '$%s$7>0,"Never",' % L(base(si) + 22) + 'COUNTIF(' + LM + '$%s$9:$%s$1208,TRUE))' % (L(base(si) + 20), L(base(si) + 20)), '0', 'months', 'month-by-month table on the hidden sheet Loan months', True))
    res.append(('Interest_' + key, lab + ': total interest', 'IF(Months_%s="Never","—",SUM(' % key + LM + '$%s$9:$%s$1208))' % (L(base(si) + 21), L(base(si) + 21)), EUR, '€', 'sum of the interest columns of that table', True))
res.append(('Interest_Saved_vs_Smallest', 'Highest rate first saves vs smallest balance first', 'IF(OR(Months_Highest_Rate="Never",Months_Smallest_Balance="Never"),"—",Interest_Smallest_Balance-Interest_Highest_Rate)', EUR, '€', 'Interest_Smallest_Balance-Interest_Highest_Rate', False))
res.append(('Interest_Saved_vs_Minimums', 'Highest rate first saves vs minimums only', 'IF(OR(Months_Highest_Rate="Never",Months_Minimums="Never"),"—",Interest_Minimums-Interest_Highest_Rate)', EUR, '€', 'Interest_Minimums-Interest_Highest_Rate', False))
how = ['• Every debt is paid its minimum each month, then the extra amount and the repayments freed up by a cleared debt go to the target debt: the highest APR first, or the smallest balance first. The third column of results pays the minimums only (no extra, nothing rolled).',
       '• Each month: interest = opening balance × monthly rate, then payments. Month-by-month tables for the three ways are on the hidden sheet Loan months (up to 1,200 months; beyond that: Never). Assumes no new borrowing.',
       '• The order a debt is paid in can change the interest, not the total you owe; the highest-rate-first way always costs the least interest for the same total monthly amount.']
ws34, n34 = make('C34 · Debt payoff plan', 'debtplan', 'Which debt should I pay off first?', 'Up to three debts: compares paying the highest-rate debt first, the smallest balance first and the minimums only.', inp, res, how, [('Needs: all three debts and the extra amount', N1)], 'C34 Debt payoff plan')
# order text row (highest rate first), added under the results using helper cells in the far columns
# ---------- hidden engine sheet
E = wb.create_sheet('Loan months'); E.sheet_state = 'hidden'
C33 = "'C33 Credit card repayment'!"; C34 = "'C34 Debt payoff plan'!"
E['A1'] = 'Loan months: month-by-month tables for C33 (card minimum) and C34 (debt payoff plan). Hidden engine sheet; do not edit.'
E['A1'].font = Font(bold=True)
# card parameters
E['A2'] = 'Card balance'; E['B2'] = '=N(' + C33 + '$G$6)'; E['A3'] = 'Monthly rate'; E['B3'] = '=N(' + C33 + '$C$%d)' % 0  # placeholder replaced below
def addr(ws, name): return ws.defined_names[name].attr_text.split('!')[1]
# find C33 names
w33 = wb['C33 Credit card repayment']
E['B3'] = '=N(' + C33 + addr(w33, 'Monthly_Rate') + ')'
E['A4'] = 'Minimum %'; E['B4'] = '=N(' + C33 + addr(w33, 'Min_Percent') + ')'
E['A5'] = 'Lowest amount'; E['B5'] = '=N(' + C33 + addr(w33, 'Min_Floor') + ')'
E['A7'] = 'Card, minimum only'
for c, h in zip('ABCDE', ['Month', 'Opening balance', 'Interest', 'Minimum payment', 'Closing balance']): E[c + '8'] = h
for k in range(1200):
    r = 9 + k; E['A%d' % r] = k + 1
    E['B%d' % r] = '=$B$2' if k == 0 else '=E%d' % (r - 1)
    E['C%d' % r] = '=IF(B%d>0.005,B%d*$B$3,0)' % (r, r)
    E['D%d' % r] = '=IF(B%d>0.005,MIN(B%d+C%d,MAX($B$5,$B$4*B%d)),0)' % (r, r, r, r)
    E['E%d' % r] = '=IF(B%d>0.005,B%d+C%d-D%d,B%d)' % (r, r, r, r, r)
E['E1209'] = '=E1208'   # closing balance after month 1,200 (used for "Never")
# debt plan parameters (rows 2-6, columns H onwards): per debt balance, monthly rate, APR, payment
w34 = wb['C34 Debt payoff plan']
E['G2'] = 'Debt'; E['G3'] = 'Balance'; E['G4'] = 'Monthly rate'; E['G5'] = 'APR'; E['G6'] = 'Payment / minimum'
for d in (1, 2, 3):
    col = L(7 + d)
    E[col + '2'] = names3[d - 1]
    E[col + '3'] = '=N(' + C34 + addr(w34, 'Balance_%d' % d) + ')'
    E[col + '4'] = '=(1+N(' + C34 + addr(w34, 'APR_%d' % d) + '))^(1/12)-1'
    E[col + '5'] = '=N(' + C34 + addr(w34, 'APR_%d' % d) + ')'
    E[col + '6'] = '=N(' + C34 + addr(w34, 'Payment_%d' % d) + ')'
E['K2'] = 'Extra'; E['K3'] = '=N(' + C34 + addr(w34, 'Extra_Payment') + ')'
E['L2'] = 'Pool (minimums of debts owed at the start + extra)'; E['L3'] = '=SUMPRODUCT((H3:J3>0.005)*H6:J6)+K3'
# 3 strategies
for si, (key, lab, _) in enumerate(labels):
    b0 = base(si)
    E.cell(7, b0, lab)
    hdr = ['Month']
    for d in (1, 2, 3): hdr += ['Debt %d opening' % d, 'Debt %d interest' % d, 'Debt %d minimum paid' % d, 'Debt %d after minimum' % d, 'Debt %d extra paid' % d, 'Debt %d closing' % d]
    hdr += ['Any debt owed at the start of the month', 'Interest this month', 'Left after minimums']
    # columns: b0 month, b0+1.. 18 debt columns, b0+19 flag? we use fixed offsets below
    # offsets: 0 month; per debt d (0-based j): open=1+6j, int=2+6j, min=3+6j, aft=4+6j, ext=5+6j, close=6+6j; then 19 left, 18 flag, 20 interest sum
    for j in range(3):
        for o, name in enumerate(['opening', 'interest', 'minimum paid', 'after minimum', 'extra paid', 'closing']): E.cell(8, b0 + 1 + 6 * j + o, 'Debt %d %s' % (j + 1, name))
    E.cell(8, b0, 'Month'); E.cell(8, b0 + 19, 'Left after minimums'); E.cell(8, b0 + 20, 'Any debt owed (TRUE/FALSE)'); E.cell(8, b0 + 21, 'Interest this month'); E.cell(8, b0 + 22, 'Still owed after month 1,200 (1 = Never)')
    for k in range(1200):
        r = 9 + k; E.cell(r, b0, k + 1)
        for j in range(3):
            o = 1 + 6 * j; dc = L(8 + j)   # debt parameter column on this sheet: H, I, J
            op, it, mn, af, ex_, cl = [cell(si, o + t, r) for t in range(6)]
            E[op] = '=%s$3' % dc if k == 0 else '=%s' % cell(si, o + 5, r - 1)
            E[it] = '=IF(%s>0.005,%s*%s$4,0)' % (op, op, dc)
            E[mn] = '=IF(%s>0.005,MIN(%s+%s,%s$6),0)' % (op, op, it, dc)
            E[af] = '=%s+%s-%s' % (op, it, mn)
        # leftover after minimums (none: 0)
        mins = '+'.join(cell(si, 3 + 6 * j, r) for j in range(3)); left = cell(si, 19, r)
        E[left] = '=0' if si == 2 else '=$L$3-(%s)' % mins
        act = ['(%s>0.005)*%s' % (cell(si, 4 + 6 * j, r), cell(si, 4 + 6 * j, r)) for j in range(3)]   # active after-min balances
        for j in range(3):
            o = 1 + 6 * j; af, ex_, cl = cell(si, o + 3, r), cell(si, o + 4, r), cell(si, o + 5, r)
            if si == 2: E[ex_] = '=0'
            else:
                before = []
                for e in range(3):
                    if e == j: continue
                    ae = act[e]; ge = L(8 + e); gj = L(8 + j)
                    if si == 0:   # highest APR first; ties keep debt order
                        cond = '(%s$5>%s$5)' % (ge, gj) if e > j else '(%s$5>=%s$5)' % (ge, gj)
                        cond = '(%s$5>%s$5)' % (ge, gj) if e > j else '(%s$5>=%s$5)' % (ge, gj)
                    else:         # smallest balance first; ties keep debt order
                        be, bj = cell(si, 4 + 6 * e, r), cell(si, 4 + 6 * j, r)
                        cond = '(%s<%s)' % (be, bj) if e > j else '(%s<=%s)' % (be, bj)
                    before.append('%s*%s' % (ae, cond))
                sb = '+'.join(before) if before else '0'
                E[ex_] = '=IF(%s>0.005,MAX(0,MIN(%s,%s-(%s))),0)' % (af, af, left, sb)
            E[cl] = '=%s-%s' % (af, ex_)
        E.cell(r, b0 + 20, '=OR(%s)' % ','.join('%s>0.005' % cell(si, 1 + 6 * j, r) for j in range(3)))
        E.cell(r, b0 + 21, '=' + '+'.join(cell(si, 2 + 6 * j, r) for j in range(3)))
    # after month 1,200 (row 1208): all-debts closing flag lives in row 7 of column b0+19
    E.cell(7, b0 + 22, '=IF(OR(%s>0.005,%s>0.005,%s>0.005),1,0)' % (cell(si, 6, 1208), cell(si, 12, 1208), cell(si, 18, 1208)))
wb.move_sheet('Loan months', offset=0)
# order: new calculators after C30, engine at the very end
order = [s for s in wb.sheetnames if s not in ('C31 Loan comparison', 'C32 Loan affordability', 'C33 Credit card repayment', 'C34 Debt payoff plan', 'Loan months')]
i30 = order.index('C30 Sale gift inheritance')
order = order[:i30 + 1] + ['C31 Loan comparison', 'C32 Loan affordability', 'C33 Credit card repayment', 'C34 Debt payoff plan'] + order[i30 + 1:] + ['Loan months']
wb._sheets = [wb[s] for s in order]
# order text under C34 results: highest APR first, stable on ties
ws = wb['C34 Debt payoff plan']
rr = ws.max_row + 2
ws['B%d' % rr] = 'Order to pay (highest rate first)'; sty(ws['B%d' % rr], 'B11')
def rank(d):   # rank of debt d among debts with a balance, by APR descending, ties by debt order; "" if no balance
    others = []
    for e in (1, 2, 3):
        if e == d: continue
        cond = 'APR_%d>APR_%d' % (e, d) if e > d else 'APR_%d>=APR_%d' % (e, d)
        others.append('(Balance_%d>0.005)*(%s)' % (e, cond))
    return 'IF(Balance_%d>0.005,1+%s,"")' % (d, '+'.join(others))
ws['C%d' % rr] = '=IF(Need_1<>"",Need_1,' + 'IFERROR(INDEX(\'Loan months\'!$H$2:$J$2,MATCH(1,INDEX(' + '' + '0*0+0,0),0)),"")' + ')'
# simpler: build with three position lookups using helper cells in column G (hidden by width): ranks in G rows
ws['G%d' % (rr + 1)] = '=' + rank(1); ws['G%d' % (rr + 2)] = '=' + rank(2); ws['G%d' % (rr + 3)] = '=' + rank(3)
for k in (1, 2, 3): ws['F%d' % (rr + k)] = 'rank of ' + names3[k - 1]; ws['F%d' % (rr + k)].font = Font(color='808080', size=9)
pos = lambda p: 'IFERROR(INDEX(\'Loan months\'!$H$2:$J$2,MATCH(%d,$G$%d:$G$%d,0)),"")' % (p, rr + 1, rr + 3)
ws['C%d' % rr] = '=IF(Need_1<>"",Need_1,' + pos(1) + '&IF(' + pos(2) + '<>""," → "&' + pos(2) + ',"")&IF(' + pos(3) + '<>""," → "&' + pos(3) + ',""))'
sty(ws['C%d' % rr], 'C13', TXT); ws['E%d' % rr] = 'ƒx  debts with a balance, highest APR first (ties keep the debt order)'; sty(ws['E%d' % rr], 'E11')
ws.defined_names['Order_To_Pay'] = DefinedName('Order_To_Pay', attr_text="'C34 Debt payoff plan'!$C$%d" % rr)
# ---------- parity edits elsewhere (labels only)
for s in ('C27 Debt repayment', 'C28 Loan repayment'):
    wb[s]['E1'] = wb[s]['E1'].value.replace('Everyday Money', 'Loans')
rd = wb['README']; rd['E58'] = 'Loans'; rd['E59'] = 'Loans'
newrows = [('C31', 'C31 Loan comparison', 'Loan comparison', 'Two offers: which one costs less?'), ('C32', 'C32 Loan affordability', 'Loan affordability', 'How much could I comfortably borrow?'),
           ('C33', 'C33 Credit card repayment', 'Credit card repayment', 'What does the minimum payment really cost?'), ('C34', 'C34 Debt payoff plan', 'Debt payoff plan', 'Which debt should I pay off first?')]
r0 = rd.max_row + 2
rd['B%d' % r0] = 'Calculators added with the Loans group (same table as above)'; rd['B%d' % r0].font = Font(bold=True)
for k, (no, sh, nm, q) in enumerate(newrows, 1):
    r = r0 + k; rd['B%d' % r] = no; rd['C%d' % r] = '=HYPERLINK("#\'%s\'!A1","%s")' % (sh, nm); rd['D%d' % r] = q; rd['E%d' % r] = 'Loans'
pr = wb['Plan results']
pr['B245'] = 'Tools in the category Loans ("N tools" on Explore)'; pr['C245'] = '=COUNTIF(README!$E$32:$E$59,"Loans")+COUNTIF(README!$E$%d:$E$%d,"Loans")' % (r0 + 1, r0 + 4)
for k in ('B244', 'B243'): pass
pr['B245'].font = copy.copy(pr['B244'].font); pr['C245'].font = copy.copy(pr['C244'].font); pr['C245'].number_format = pr['C244'].number_format
# contents line and test notes line
rm = wb['READ ME']
rm['B15'] = 'C01 to C34: the 34 calculators (orange tabs). C29 Investment tax and C30 Sale, gift and inheritance tax hold the 8-year rule and CGT. C27, C28 and C31 to C34 are the Loans group (loan repayment, loan comparison, loan affordability, credit card repayment, debt repayment, debt payoff plan); C31 to C34 use the hidden sheet Loan months.'
tn = wb['Test notes']; rn = tn.max_row + 1
tn.cell(rn, 2, 'Loans calculators C31 to C34 (added later)'); tn.cell(rn, 4, 'Compared with the prototype with tools/calc-vs-xlsx (ONLY=loancompare,loanafford,creditcard,debtplan): 25 cases and 14 gate rounds, 0 differences. The prototype side is also checked by tests/loans.js (351 checks against independent calculations). The month-by-month tables are on the hidden sheet Loan months; LibreOffice may need two recalculation passes for them, Excel does not.')
for c in (2, 4): tn.cell(rn, c).alignment = Alignment(wrap_text=True, vertical='top')
wb.save(out)
print('saved', out)
