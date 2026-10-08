"""Round E (recheck fixes) applied to the calculator sheets of base.xlsx -> base2.xlsx.
E1 C23 optional repayment, E12 zero-paste guards, E6/E7 typed numbers in notes built from names, E4 gate wording and order."""
import sys, re, openpyxl, runpy
sys.path.insert(0, '/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/r15')
import wb_gates
SRC = '/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/r14/base.xlsx'
OUT = '/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/r15/base2.xlsx'
wb = openpyxl.load_workbook(SRC)
log = []

def cell_of(ws, name):
    d = ws.defined_names.get(name)
    return d.attr_text.split('!')[1].replace('$', '') if d is not None else None

# ---- E1: C23 optional repayment, same pattern as C02 / C04
ws = wb['C23 Mortgage protection']
ws['G17'] = '=IF(ISBLANK(C17),F17,C17)'
c = cell_of(ws, 'Need_2'); f = ws[c].value
segs, tail = wb_gates.parse_chain(f)
segs = [(a, b) for a, b in segs if 'Actual_Repayment' not in a]
ws[c].value = wb_gates.build(segs, '""')
log.append('E1 C23 G17 and Need_2')

# ---- E12 / E6: a typed 0 (paste) below the allowed minimum gives "Choose your ... to see this", not an error value
GUARD = [('C01 Borrowing', 'Term_Years'), ('C02 Mortgage repayment', 'Term_Years'), ('C03 Deposit', 'Monthly_Saving'), ('C04 Mortgage overpayment', 'Years_Left'), ('C05 Interest rate impact', 'Years_Left'),
         ('C06 Term comparison', 'Term_A'), ('C06 Term comparison', 'Term_B'), ('C07 Rent vs buy', 'RentBuy_Term'), ('C08 Goal planner', 'Years'), ('C11 Emergency fund', 'Essential_Spending'),
         ('C15 Will my money last', 'Retirement_Savings'), ('C20 Risk and return', 'Style'), ('C20 Risk and return', 'Years'), ('C23 Mortgage protection', 'Years_Left'), ('C28 Loan repayment', 'Years')]
for sh, nm in GUARD:
    ws = wb[sh]; g = cell_of(ws, nm); e = cell_of(ws, nm + '_Entry')
    dvs = [dv for dv in ws.data_validations.dataValidation if e in str(dv.sqref).split()]
    mn = None
    if dvs and dvs[0].type in ('whole', 'decimal') and dvs[0].formula1 not in (None, ''):
        try: mn = float(dvs[0].formula1)
        except ValueError: mn = None
    if nm == 'Style':
        orig = ws[g].value; ws[g].value = f'=IF(AND(ISNUMBER({e}),OR(N({e})<1,N({e})>3)),"",{orig[1:]})'; log.append(('guard', sh, nm, '1..3')); continue
    if mn is None or mn <= 0: log.append(('guard skipped (min %s)' % mn, sh, nm)); continue
    orig = ws[g].value
    if not (isinstance(orig, str) and orig.startswith('=')): log.append(('guard: not a formula', sh, nm)); continue
    ws[g].value = f'=IF(AND(ISNUMBER({e}),N({e})<{mn:g}),"",{orig[1:]})'
    log.append(('guard', sh, nm, mn))

# ---- E7: typed law figures in notes -> built from the named cells
def split_chunks(s, n=240):
    return [s[i:i + n] for i in range(0, len(s), n)] or ['']
def lit(s): return '&'.join('"' + p.replace('"', '""') + '"' for p in split_chunks(s))
REPL = [(r'3\.9%', 'TEXT(Set_inflNow,"0.0%")'), (r'€299\.30', '"€"&TEXT(State_Pension_Week,"0.00")'), (r'€259\.50', '"€"&TEXT(Survivor_Pension_Week,"0.00")'),
        (r'€254(?![\d,.])', '"€"&TEXT(Illness_Benefit_Week,"0")'), (r'€115,000', '"€"&TEXT(Relief_Earnings_Cap,"#,##0")'),
        (r'€200,000 tax-free, next €300,000 at 20%', '"€"&TEXT(Lump_Sum_Tax_Free,"#,##0")&" tax-free, next €"&TEXT(Lump_Sum_Cap-Lump_Sum_Tax_Free,"#,##0")&" at "&TEXT(Lump_Sum_Rate,"0%")')]
rx = re.compile('|'.join('(' + p + ')' for p, _ in REPL))
n = 0
for ws in wb.worksheets:
    if not re.match(r'C\d\d ', ws.title) and ws.title not in ('Assumptions',): continue
    for row in ws.iter_rows():
        for c in row:
            v = c.value
            if not isinstance(v, str) or v.startswith('='): continue
            if ws.title == 'Assumptions' and c.coordinate not in ('B7',): continue
            if not rx.search(v): continue
            parts = []; pos = 0
            for m in rx.finditer(v):
                if m.start() > pos: parts.append(lit(v[pos:m.start()]))
                k = [i for i, g in enumerate(m.groups()) if g][0]
                parts.append(REPL[k][1]); pos = m.end()
            if pos < len(v): parts.append(lit(v[pos:]))
            c.value = '=' + '&'.join(parts); n += 1
log.append(('typed numbers in notes -> formulas', n))
ws = wb['README']
ws['B77'] = '="Inflation ""Ireland now"" "&TEXT(Set_inflNow,"0.0%")&" (CSO HICP flash Sep 2026)"'

# ---- §27: LifeMap standards start from the standard (no gate); pension access age; free retirement age
import copy
from openpyxl.worksheet.datavalidation import DataValidation
STDF = {  # workbook name -> formula for the standard (column F), per calculator id
 ('rentbuy', 'House_Growth'): '=Set_houseGrow', ('rentbuy', 'Rent_Growth'): '=Set_rentRise', ('rentbuy', 'Upkeep_Rate'): '=Set_upkeep',
 ('goalplanner', 'Growth_Rate'): '=AS_Cash', ('compound', 'Growth_Rate'): '=Set_invGross', ('lumpsum', 'Growth_Rate'): '=Set_invGross', ('lumpsum', 'Wait_Years'): '=Set_waitYears',
 ('emergency', 'Months_Wanted'): '=AS_Months', ('retirement', 'Growth_Rate'): '=AS_Pen', ('retirement', 'Wage'): '=AS_Wage', ('retirement', 'Retire_Multiple'): '=Set_retireMult', ('retirement', 'Lump_Sum_Pct'): '=AS_LumpPct',
 ('contrib', 'Growth_Rate'): '=AS_Pen', ('avc', 'Growth_Rate'): '=AS_Pen', ('lastmoney', 'Growth_Rate'): '=AS_PenRet', ('lastmoney', 'Withdrawal_Timing'): '=IF(Set_ddTiming="end","End of year","Start of year")',
 ('drawdown', 'Withdrawal_Timing'): '=IF(Set_ddTiming="end","End of year","Start of year")', ('drawdown', 'DD_Cautious'): '=Set_riskMu_1', ('drawdown', 'DD_Balanced'): '=Set_riskMu_2', ('drawdown', 'DD_Growth'): '=Set_riskMu_3',
 ('realreturn', 'Nominal_Return'): '=Set_invGross', ('regularinvest', 'Growth_Rate'): '=Set_invGross', ('fees', 'Growth_Rate'): '=Set_invGross', ('riskreturn', 'Style'): '=Set_style',
 ('riskreturn', 'Mu_Cautious'): '=Set_riskMu_1', ('riskreturn', 'Mu_Balanced'): '=Set_riskMu_2', ('riskreturn', 'Mu_Growth'): '=Set_riskMu_3', ('riskreturn', 'Vol_Cautious'): '=Set_riskVol_1', ('riskreturn', 'Vol_Balanced'): '=Set_riskVol_2', ('riskreturn', 'Vol_Growth'): '=Set_riskVol_3',
 ('lifecover', 'Years_Support'): '=Set_lifeYears', ('lifecover', 'Life_Replace'): '=Set_lifeShare', ('budget', 'Budget_Needs'): '=Set_budget_1', ('budget', 'Budget_Wants'): '=Set_budget_2', ('budget', 'Budget_Save'): '=Set_budget_3'}
for (cid, nm), fml in STDF.items():
    e = wb_gates.MAP[cid]; ws = wb[e['sheet']]
    g = cell_of(ws, nm); row = re.search(r'\d+', g).group(0)
    ws['F' + row].value = fml
    gv = ws[g].value
    ws[g].value = re.sub(r'IF\(Fill_Example="Yes",F%s,""\)' % row, 'F' + row, gv)
    ec = ws['E' + row].value
    if isinstance(ec, str):
        ec = ec.replace('Type 3 · your choice (no standard) ·', 'Type 3 ·').replace('Type 3 · your choice ·', 'Type 3 · LifeMap standard ·').replace('Generally the standard is', 'LifeMap uses').replace('Choose what you want to use.', 'Change it if you want to use your own.')
        ws['E' + row].value = ec
    ws['F' + row].font = copy.copy(ws['F' + row].font)
log.append(('standards start from the standard', len(STDF)))
# C12: the access-age input (row 35), the early message, and a free retirement age (21 to 104)
ws = wb['C12 Retirement projection']
for col in 'BCDEFG':
    src = ws[f'{col}31']; dst = ws[f'{col}35']
    dst.fill = copy.copy(src.fill); dst.font = copy.copy(src.font); dst.border = copy.copy(src.border); dst.alignment = copy.copy(src.alignment); dst.number_format = src.number_format
ws['B35'] = 'Pension access age (the earliest age you can draw your pension)'
ws['D35'] = 'age'
ws['E35'] = 'Type 3 · LifeMap standard · LifeMap uses 60 (most pensions can be drawn from 60; some occupational schemes allow 50). Change it only if your scheme allows 50. Allowed: 50 or 60'
ws['F35'] = '=AS_AccessAge'; ws['G35'] = '=IF(ISBLANK(C35),F35,C35)'
ws['C35'].value = None
from openpyxl.workbook.defined_name import DefinedName
for n, ref in [('Access_Age', "'C12 Retirement projection'!$G$35"), ('Access_Age_Entry', "'C12 Retirement projection'!$C$35")]:
    ws.defined_names[n] = DefinedName(n, attr_text=ref)
dv = DataValidation(type='list', formula1='"50,60"', allow_blank=True, showErrorMessage=True, errorTitle='Pension access age', error='Choose 50 or 60'); ws.add_data_validation(dv); dv.add('C35')
ws['C53'].value = '=IF(Need_1<>"","",IF(Retirement_Age+Retire_Later<Access_Age,"Most pensions can\'t be taken before 60 (PRSA and personal pensions; some occupational schemes allow it from 50). Until then you would live on savings and other income.",""))'
for dv in ws.data_validations.dataValidation:
    if 'C22' in str(dv.sqref): dv.formula1 = '21'; dv.formula2 = '104'; dv.error = 'Please enter 21 to 104 · steps of 1.'
ws['E22'].value = str(ws['E22'].value).replace('Allowed: 50 to 75', 'Allowed: 21 to 104').replace('50 to 75', '21 to 104')
log.append(('C12 access age row and free retirement age', ws['E22'].value[-60:]))
# Settings: the new standard (Pension access age)
st = wb['Settings']
for col in 'BCDEFGHIJK': 
    st[f'{col}59']._style = copy.copy(st[f'{col}41']._style)
st['B59'] = 'Pension access age: the earliest age you can draw your pension  [Set_accessAge]'
st['C59'] = 60
st['G59'] = 'most pensions can be drawn from 60; some occupational schemes allow 50'
st['H59'] = 'Revenue Commissioners: pension benefits can usually be taken from age 60 (PRSAs and personal pensions); some occupational schemes allow retirement from 50 (see the law register). Verify before release.'
st['I59'] = '2026'; st['J59'] = 'We assume 60. Choose 50 only if your occupational scheme says it allows it. Before this age your plan pays for life from savings and other income.'; st['K59'] = 'Retirement · choice'
for n, ref in [('Set_accessAge', 'Settings!$C$59'), ('Set_accessAge_Label', 'Settings!$G$59')]:
    wb.defined_names[n] = DefinedName(n, attr_text=ref)
dv2 = DataValidation(type='list', formula1='"50,60"', allow_blank=True, showErrorMessage=True, errorTitle='Pension access age', error='Choose 50 or 60'); st.add_data_validation(dv2); dv2.add('C59')

# ---- recheck 2 (round F)
def qlit(t):
    return '"' + t.replace('"', '""') + '"'
def concat(parts):
    """parts: list of ('t', text) or ('f', expr); text longer than 240 characters is split (Excel limits a text literal to 255)"""
    out = []
    for k, v in parts:
        if k == 't':
            for i in range(0, len(v), 240): out.append(qlit(v[i:i + 240]))
        else: out.append(v)
    return '=' + '&'.join(out)
def subst(text, subs):
    """turn a typed note into a formula: each (literal, expr) pair replaces that literal by the named-cell expression"""
    parts = [('t', text)]
    for lit, expr in subs:
        nxt = []
        for k, v in parts:
            if k == 't' and lit in v:
                a, b = v.split(lit, 1); nxt += [('t', a), ('f', expr), ('t', b)]
            else: nxt.append((k, v))
        parts = nxt
    return concat([p for p in parts if not (p[0] == 't' and p[1] == '')])
# Assumptions: three new named figures (the rules year, the next one, the earliest age some occupational schemes allow, the biggest euro input)
asu = wb['Assumptions']
for rr, lab, val, nm in [(125, 'Rules year: the tax year the figures on this sheet apply to  [Rules_Year]', 2026, 'Rules_Year'), (126, 'Next rules year (the plan starts here from October)  [Rules_Year_Next]', 2027, 'Rules_Year_Next'),
                         (127, 'Earliest age some occupational pension schemes allow benefits  [Scheme_Earliest_Age]', 50, 'Scheme_Earliest_Age'), (128, 'Biggest euro amount a calculator input accepts (validation limit)  [Max_Money_Input]', 200000, 'Max_Money_Input')]:
    for col in 'BCDEFGH': asu[f'{col}{rr}']._style = copy.copy(asu[f'{col}105']._style)
    asu[f'B{rr}'] = lab; asu[f'C{rr}'] = val; asu[f'D{rr}'] = 'Plan sheets' if nm.startswith('Rules') else ('Plan results, C12' if nm.startswith('Scheme') else 'C12, C25, C26')
    wb.defined_names[nm] = DefinedName(nm, attr_text=f'Assumptions!$C${rr}')
asu['C128'].number_format = '#,##0'
# N2: an unchosen deposit-earn rate uses the suggested published rate (spec 27.6), exactly like the app
c7 = wb['C07 Rent vs buy']
c7['G16'] = '=IF(ISBLANK(C16),IF(ISNUMBER(F16),F16,0),C16)'
c7['E16'] = str(c7['E16'].value).replace('Leave blank to leave it out (0%).', 'Leave blank and we use the suggested rate (Assumed: add yours).')
log.append(('N2 C07 G16', c7['G16'].value))
# E12 rest: C20 Style = 0 (or text) gives the message, never an error value
c20 = wb['C20 Risk and return']
for nm in ('Need_5', 'Need_6'):
    cell = cell_of(c20, nm)
    c20[cell] = '=IF(NOT(ISNUMBER(Used_Style)),"Choose 1, 2 or 3",IF(OR(Used_Style<1,Used_Style>3,Used_Style<>INT(Used_Style)),"Choose 1, 2 or 3",""))'
log.append(('C20 Need_5, Need_6 guard', 1))
# the guidance line says "some occupational schemes from 50" everywhere, like the app
nrep = 0
for w in wb:
    for rowc in w.iter_rows():
        for c in rowc:
            if isinstance(c.value, str) and '(some schemes from 50); State Pension' in c.value: c.value = c.value.replace('(some schemes from 50); State Pension', '(some occupational schemes from 50); State Pension'); nrep += 1
log.append(('RETIRE_HELP wording', nrep))
# E7 rest: typed 90%, 4.35%, 4.2375%, 200,000 and the loan-to-income limits become formulas on the named cells
def setf(sh, cell, subs, text=None):
    w = wb[sh]; t = text if text is not None else w[cell].value
    w[cell].value = subst(t, subs)
LTV = ('90%', 'TEXT(LTV_Max,"0%")')
setf('C01 Borrowing', 'B3', [('4× or 3.5×', 'LTI_FTB&"× or "&LTI_SSB&"×"'), LTV])
setf('C01 Borrowing', 'B33', [('× 4 (first-time buyer)', '"× "&LTI_FTB&" (first-time buyer)"'), ('× 3.5 (everyone else)', '"× "&LTI_SSB&" (everyone else)"'), LTV])
setf('C02 Mortgage repayment', 'B54', [('loan ÷ 9 at 90% LTV', '"loan × "&TEXT(Min_Deposit_Pct,"0%")&" ÷ "&TEXT(LTV_Max,"0%")&" at "&TEXT(LTV_Max,"0%")&" LTV"')])
setf('C03 Deposit', 'B24', [('starts at 10%', '"starts at "&TEXT(Min_Deposit_Pct,"0%")'), LTV])
setf('C03 Deposit', 'E7', [('minimum is 10% (90% LTV)', '"minimum is "&TEXT(Min_Deposit_Pct,"0%")&" ("&TEXT(LTV_Max,"0%")&" LTV)"')])
setf('C12 Retirement projection', 'B63', [('(25% at most)', '"("&TEXT(Lump_Sum_Max_Pct,"0%")&" at most)"'), ('first €200,000', '"first "&TEXT(Lump_Sum_Tax_Free,"€#,##0")'), ('next €300,000 at 20%', '"next "&TEXT(Lump_Sum_Cap-Lump_Sum_Tax_Free,"€#,##0")&" at "&TEXT(Lump_Sum_Rate,"0%")'), ('above €500,000', '"above "&TEXT(Lump_Sum_Cap,"€#,##0")')])
for sh, cell, step in [('C12 Retirement projection', 'E34', '€500'), ('C25 Monthly surplus', 'E6', '€50'), ('C26 Budget 50 30 20', 'E6', '€50')]:
    w = wb[sh]; t = w[cell].value
    lo = '€500' if sh != 'C12 Retirement projection' else '€0'
    w[cell].value = subst(t, [('€200,000', 'TEXT(Max_Money_Input,"€#,##0")')])
    for dv in w.data_validations.dataValidation:
        if cell.replace('E', 'C') in str(dv.sqref).split() and str(dv.formula2) == '200000': dv.formula2 = 'Max_Money_Input'
te = wb['Tax engine']
for cell in ('H34', 'J34', 'N34'):
    pre = te[cell].value.replace('4.35%', '').rstrip()
    te[cell].value = '=' + qlit(pre + ' ') + '&TEXT(PRSI_Rate,"0.00%")'
te['E10'].value = subst(te['E10'].value, [('= 4.35%.', '"= "&TEXT(PRSI_Rate,"0.00%")&"."'), ('= 4.2375%', '"= "&TEXT(PRSI_Rate_2026_Blend,"0.0000%")'), ('3 at 4.35%', '"3 at "&TEXT(PRSI_Rate,"0.00%")')])
log.append(('typed constants -> names', 'C01 B3,B33; C02 B54; C03 B24,E7; C12 B63,E34; C25/C26 E6; Tax engine H34,J34,N34,E10'))

st3 = wb['Settings']
st3['B3'] = str(st3['B3'].value) + ' This sheet holds the same 38 standards as the app\'s Settings block (36 with a figure; the credit-card rate and buying fees have no published figure, so they are blank by design), plus two life-expectancy guidance figures, the "Ireland now" inflation reading and the card APR cap: 42 rows. The app\'s Your assumptions screen has 47 items in all.'
# ---- E4: gate wording and order
rep = wb_gates.run(wb)
log.append(('gates', [r for r in rep if r[1] != 'ok']))
wb.save(OUT)
for l in log: print(l)
