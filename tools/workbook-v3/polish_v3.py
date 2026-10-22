"""Final tidy of the v2.9 build into the v3.0 deliverable: sheet order, hidden engine sheets,
Contents links, Test notes (live checks). Usage: polish_v3.py in.xlsx out.xlsx"""
import sys, openpyxl
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.worksheet.hyperlink import Hyperlink
src, out = sys.argv[1:3]
wb = openpyxl.load_workbook(src)
HID = ['Plan pay & tax', 'Plan holdings', 'Plan debt months']
rm = wb['READ ME']
rm['A1'] = 'LifeMap calculators v3.0 (engine v3.0, Irish rules 2026)'
rm['A2'] = ('Matches the LifeMap prototype (engine v3.0) for plans run on the 2026 rules. The 2027 Budget rules are not in this workbook. '
            'The CGT exemption, the 31% CGT rate and its start date, and PRSI on ARF withdrawals are verified (red on the Tax sheet). Other items marked "Requires Verification" on the Tax sheet are still to be confirmed.')
# order: everything visible first (as is), engine sheets and hidden support sheets last
order = [s for s in wb.sheetnames if s not in HID and wb[s].sheet_state == 'visible'] + HID + \
        [s for s in wb.sheetnames if wb[s].sheet_state != 'visible']
# Test notes after Plan profile
tn = wb.create_sheet('Test notes')
order.insert(order.index('Plan profile') + 1, 'Test notes')
wb._sheets = [wb[s] for s in order]
for s in HID: wb[s].sheet_state = 'hidden'
H = Font(bold=True, size=14); B = Font(bold=True); G = PatternFill('solid', fgColor='E2F0D9')
tn.column_dimensions['A'].width = 4; tn.column_dimensions['B'].width = 62; tn.column_dimensions['C'].width = 16; tn.column_dimensions['D'].width = 70
tn['B1'] = 'Test notes'; tn['B1'].font = H
tn['B2'] = 'Live checks (they recalculate with the workbook) and the results of the comparison runs against the prototype.'
tn['B4'] = 'LIVE CHECKS'; tn['B4'].font = B; tn['C4'] = 'Result'; tn['C4'].font = B
checks = [
 ('Plan cashflow starts at your age today', "='Plan cashflow'!D8=F_Age"),
 ('No error values on Plan cashflow', "=SUMPRODUCT(--ISERROR('Plan cashflow'!A8:ZZ97))=0"),
 ('No error values on Plan results', "=SUMPRODUCT(--ISERROR('Plan results'!B3:Q270))=0"),
 ('No error values on Plan goals', "=SUMPRODUCT(--ISERROR('Plan goals'!B6:AM131))=0"),
 ('No error values on Plan holdings (hidden sheet)', "=SUMPRODUCT(--ISERROR('Plan holdings'!B6:ZZ122))=0"),
 ('Taxes applied each year are never negative', "=MIN('Plan cashflow'!E8:E97)>=0"),
 ('Plan starts in the year the Tax sheet rules apply (2026)', "=In_a_startYear=Rules_Year"),
]
for i, (t, f) in enumerate(checks):
    r = 5 + i
    tn.cell(r, 2, t); tn.cell(r, 3, f'=IF(IFERROR({f[1:]},FALSE),"OK","CHECK")')
rr = 5 + len(checks)
tn.cell(rr, 2, 'All live checks').font = B
tn.cell(rr, 3, f'=IF(COUNTIF(C5:C{rr-1},"OK")={len(checks)},"ALL OK","CHECK")').font = B
r = rr + 2
tn.cell(r, 2, 'COMPARISON RUNS AGAINST THE PROTOTYPE (recorded, not live)').font = B
notes = [
 ('Plan sheets, 215 customers (random, edge cases, 41 hand-built, sample customer), 2026 rules', 'All figures match within 1 euro; per-pot balances, exit tax, CGT and DIRT checked on 42 customers at tight tolerance.'),
 ('Calculators C01 to C30, 161 cases and 119 gate cases', 'No differences from the prototype.'),
 ('Tax constants', 'No differences between the workbook, Tax sheet and the prototype rules table.'),
 ('Independent tax review', '7 of 8 tax cases matched to the euro; the 8th (Employee tax credit on pension income) follows Revenue guidance.'),
 ('How to re-run', 'tools/plan-vs-xlsx/README.md and tools/calc-vs-xlsx (see tools/workbook-v3/README.md).'),
 ('Verified by the proposition owner (Oct 2026)', 'The €1,270 CGT exemption, the 31% CGT rate from 7 Oct 2026, and PRSI on ARF withdrawals. All other figures on the Tax sheet keep their status.'),
 ('Not in the plan', 'Local Property Tax, stamp duty paid on a home purchase (see C03), business reliefs, tax on a life-policy lump sum, gift and inheritance tax (see C30).'),
]
for a, b in notes:
    r += 1; tn.cell(r, 2, a); tn.cell(r, 4, b)
for row in tn.iter_rows(min_row=1, max_row=r):
    for c in row: c.alignment = Alignment(wrap_text=True, vertical='top')
# Contents on READ ME: replace flow block rows 6-20
flow = [
 ('READ ME', 'This sheet: the example switch, the flow, the known differences, the assumptions list.'),
 ('Sample walkthrough', 'A story with live numbers to explain the workbook: an ETF, selling property, gifting, inheriting.'),
 ('Tax', 'Which tax applies when you hold, sell, buy, give or receive, and every 2026 rate and band.'),
 ('Plan inputs', 'The yellow input block for the plan. With "Fill example values" on, blanks show the example customer.'),
 ('Plan goals', 'Your goals in funding order: cost, what is put aside and how much is covered.'),
 ('Plan cashflow', 'THE cash flow: one row per year, money in after tax, living costs, debts, goals, the taxes applied each year.'),
 ('Plan results', 'What the Results screens in the app show, worked out by formulas.'),
 ('Plan profile', 'Money personality and risk profile, scored as the app scores them.'),
 ('Test notes', 'Live checks and the comparison runs against the prototype.'),
 ('C01 Borrowing', 'C01 to C30: the 30 calculators (orange tabs). C29 Investment tax and C30 Sale, gift and inheritance tax hold the 8-year rule and CGT.'),
 ('Plan pay & tax', 'HIDDEN engine sheet: pay, pension, State Pension, income tax, USC and PRSI each year. Right-click a tab and Unhide to inspect.'),
 ('Plan holdings', 'HIDDEN engine sheet: cash, savings accounts, investments lot by lot (8-year clock), other assets, funding order, exit tax, CGT, DIRT.'),
 ('Plan debt months', 'HIDDEN engine sheet: each loan, card and the mortgage month by month inside each plan year.'),
 ('Settings', 'HIDDEN: Settings, Assumptions, Your lists, Tax engine, Report spec and the original README; formulas depend on them.'),
]
for m in list(rm.merged_cells.ranges):
    if m.min_row>=5 and m.max_row<=20: rm.unmerge_cells(str(m))
for r in range(5, 21):
    for c in range(1, 5): rm.cell(r, c).value = None
rm['A5'] = 'CONTENTS (click a name to go there)'
for i, (s, d) in enumerate(flow):
    r = 6 + i
    rm.cell(r, 1, s); rm.cell(r, 2, d)
    tgt = s if s in wb.sheetnames else 'READ ME'
    rm.cell(r, 1).hyperlink = Hyperlink(ref=rm.cell(r, 1).coordinate, location=f"'{tgt}'!A1", display=s)
    rm.cell(r, 1).font = Font(color='0563C1', underline='single')
# ≡ link back to contents in A1 of each visible sheet whose A1 is empty
for ws in wb:
    if ws.title in ('READ ME',) or ws.sheet_state != 'visible': continue
    if ws['A1'].value is None:
        ws['A1'] = '≡'
        ws['A1'].hyperlink = Hyperlink(ref='A1', location="'READ ME'!A1", display='≡')
        ws['A1'].font = Font(bold=True, color='0563C1')

# owner-checked items: red text plus a comment asking for a second verification
from openpyxl.comments import Comment
RED = Font(bold=True, color='C00000')
def flag(ws, cell, text):
    c = wb[ws][cell]; c.font = RED
    c.comment = Comment(text, 'LifeMap team', width=320, height=110)
CGT_X = 'VERIFIED by the proposition owner (Oct 2026): CGT annual exemption of €1,270 per person. Kept red so it can be found; check again if the rule changes.'
CGT_D = 'VERIFIED by the proposition owner (Oct 2026): 31% CGT rate from 7 October 2026 (33% before). Kept red so it can be found; check again if the rule changes.'
ARF = 'VERIFIED by the proposition owner (Oct 2026): PRSI on ARF / PRSA withdrawals (before 66, and 66 to 70 without a contributory State Pension). Kept red so it can be found; check again if the rule changes.'
for ref, t in [('READ ME!B44', CGT_X), ('READ ME!B78', CGT_D), ('READ ME!A80', ARF), ('READ ME!B80', ARF),
               ('Tax!H31', CGT_X), ('Tax!F137', CGT_X), ('Tax!C92', ARF), ('Tax!F92', ARF), ('Tax!C93', ARF), ('Sample walkthrough!B12', CGT_D)]:
    w, c = ref.split('!'); flag(w, c, t)
for row in wb['Tax'].iter_rows():
    for c in row:
        if isinstance(c.value, str) and ('7 Oct' in c.value) and any(k in c.value for k in ('31%','Capital gains','standard rate')) and 'Group' not in c.value and 'gifts' not in c.value and c.coordinate not in ('H31',) and c.row > 15:
            flag('Tax', c.coordinate, CGT_D)

# the three verified items: status text and wording
tx = wb['Tax']
for c in ('E92', 'E93', 'E133', 'E134', 'E135', 'E137', 'J31', 'J32', 'J34', 'J47'): tx[c] = 'Verified'
for c in ('F92', 'H92', 'F93', 'H93', 'C92'):
    v = tx[c].value
    if isinstance(v, str): tx[c] = v.replace('UNRESOLVED: ', '').replace(' (UNRESOLVED)', '')
tx['F92'] = 'PRSI on ARF / PRSA withdrawals: deducted (Class S) before 66, and from 66 to 70 unless you receive the contributory State Pension. Verified by the proposition owner.'
tx['H92'] = tx['F92'].value
tx['F137'] = 'annual exemption per person each tax year (losses come off first, not transferable between spouses, unused amount lost). Verified by the proposition owner.'
tx['F133'] = 'standard rate on disposals from 7 Oct 2026 (Revenue eBrief 142/26; verified)'
rm['B26'] = 'The CGT exemption, the 31% CGT rate and its start date, and PRSI on ARF withdrawals are verified by the proposition owner (red). Other figures marked "Requires Verification" on the Tax sheet have not yet been checked against Revenue or Social Protection.'
rm['B80'] = 'The plan charges 4.24% PRSI on ARF / PRSA withdrawals before 66, and from 66 to 70 if you do not get the contributory State Pension. Verified by the proposition owner.'
wb['Assumptions']['B135'] = 'PRSI ON ARF / PRSA WITHDRAWALS  ·  verified (type 1, not an input)'
wb['Sample walkthrough']['B24'] = 'Figures marked "Requires Verification" have not yet been checked against Revenue or the Department of Social Protection, except the CGT exemption, the 31% CGT rate and PRSI on ARF withdrawals, which are verified.'
pi = wb['Plan inputs']
pi['B133'] = ('Buy a home goal amount: put the deposit plus stamp duty (1% of the price up to €1m) and buying fees. '
              'The Borrowing, Deposit and Rent vs buy calculators add these for you.')
pi['B133'].alignment = Alignment(wrap_text=True, vertical='top')
tn.cell(r + 1, 2, 'Red cells with a comment')
tn.cell(r + 1, 4, 'The three verified tax figures are kept red with a comment so they can be found (READ ME, Tax, Sample walkthrough).')
wb.active = 0
wb.save(out)
