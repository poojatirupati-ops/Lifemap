import sys, json
sys.path.insert(0, '/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/r14')
from lib import *
import p_inputs, p_pay, p_goals, p_cash, p_results, p_res, p_how, p_prof, p_reg
from p_pay import NR

SRC = '/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/r15/base2.xlsx'
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/r14/out.xlsx'

def fix_lists(bk):
    wb = bk.wb; ws = wb['Your lists']
    for n, ref in [('Cards_Owed_Rng', 'D6:D13'), ('Cards_Pay_Rng', 'E6:E13'), ('Loans_Owed_Rng', 'D21:D28'), ('Loans_Pay_Rng', 'E21:E28'), ('Pens_Value_Rng', 'D37:D44'), ('Pens_Monthly_Rng', 'E37:E44'), ('Pens_Own_Rng', 'F37:F44')]:
        bk.name(n, "'Your lists'!" + '$' + ref.replace(':', ':$').replace('D', 'D$').replace('E', 'E$').replace('F', 'F$') if False else "'Your lists'!" + re.sub(r'([A-Z]+)(\d+)', r'$\1$\2', ref))
    # loans weighted APR (same rule as the cards)
    ws['B34'] = 'Loans APR (weighted by amount owed; blank if none given)  [Loans_Rate_Avg]'
    ws['D34'] = '=IF(COUNT(F21:F28)=0,"",SUMPRODUCT(F21:F28,(D21:D28>0)*D21:D28+(1-(D21:D28>0)))/SUMPRODUCT((F21:F28<>"")*((D21:D28>0)*D21:D28+(1-(D21:D28>0)))))'
    ws['D34'].fill = GRN; ws['D34'].number_format = '0.0%'; bk.name('Loans_Rate_Avg', "'Your lists'!$D$34")
    # own share: a blank share uses the share the customer chose (or the standard), as the prototype's syncLists does
    for r in range(37, 45): ws[f'G{r}'] = f'=IF(E{r}="","",IF(E{r}>0,IF(F{r}<>"",MIN(F{r},E{r}),E{r}*AS_OwnShare),0))'
    ws['B48'] = 'Your own share a month (a blank share uses the share you chose in Plan inputs, else the Settings standard: AS_OwnShare)  [Pens_Own_Total]'
    ws['B49'] = 'Your own share counts as given (1/0): every pension that is paid into has your share typed, or you chose a share in Plan inputs and at least one is typed  [Pens_OwnGiven]'
    ws['D49'] = '=IF(AND(SUMPRODUCT((E37:E44>0)*ISNUMBER(F37:F44))>0,OR(SUMPRODUCT(--(E37:E44>0))=SUMPRODUCT((E37:E44>0)*ISNUMBER(F37:F44)),Has_a_ownShare=1)),1,0)'
    ws['D49'].fill = GRN; bk.name('Pens_OwnGiven', "'Your lists'!$D$49")
    # mortgages on other properties
    r0 = 84
    ws.cell(r0, 2, 'Mortgages on other properties (counted as other loans in the plan)').font = B
    for j, h in enumerate(['Mortgage', 'Lender (optional)', 'Left on it (€)', 'Repaid a month (€)', 'Years left', 'Rate (optional, e.g. 0.041 = 4.1%)', 'Rate used', 'Repayment used (€ a month)']):
        c = ws.cell(r0 + 1, 2 + j, h); c.fill = HEAD; c.font = WH; c.alignment = Alignment(wrap_text=True)
    for i in range(4):
        r = r0 + 2 + i; ws.cell(r, 2, f'Mortgage {i + 1}')
        for cc in (3, 4, 5, 6, 7): c = ws.cell(r, cc); c.fill = YEL; c.font = BLUE
        ws.cell(r, 8, f'=IF(N(G{r})>0,G{r},AS_MortRate)').fill = GREY
        ws.cell(r, 9, f'=IF(N(D{r})>0,IF(N(E{r})>0,E{r},IF(H{r}/12<>0,D{r}*(H{r}/12)/(1-(1+H{r}/12)^-MAX(1,ROUND(IF(N(F{r})>0,F{r},PR_FbMortYears)*12,0))),D{r}/MAX(1,ROUND(IF(N(F{r})>0,F{r},PR_FbMortYears)*12,0)))),0)').fill = GREY
        for cc in (4, 5, 9): ws.cell(r, cc).number_format = '#,##0'
    a, z = r0 + 2, r0 + 5
    bk.name('Mort2_Owed_Rng', f"'Your lists'!$D${a}:$D${z}"); bk.name('Mort2_Rate_Rng', f"'Your lists'!$G${a}:$G${z}")
    rr = z + 1
    ws.cell(rr, 2, 'Left on other-property mortgages  [Mort2_Bal]'); ws.cell(rr, 4, f'=SUMIF(D{a}:D{z},">0")').fill = GRN; bk.name('Mort2_Bal', f"'Your lists'!$D${rr}")
    ws.cell(rr + 1, 2, 'Repaid a month  [Mort2_Pay]'); ws.cell(rr + 1, 4, f'=SUM(I{a}:I{z})').fill = GRN; bk.name('Mort2_Pay', f"'Your lists'!$D${rr + 1}")
    ws.cell(rr + 2, 2, 'Rate, weighted by amount left  [Mort2_Rate]'); ws.cell(rr + 2, 4, f'=IF(D{rr}>0,SUMPRODUCT((D{a}:D{z}>0)*D{a}:D{z}*H{a}:H{z})/D{rr},0)').fill = GRN; ws.cell(rr + 2, 4).number_format = '0.00%'; bk.name('Mort2_Rate', f"'Your lists'!$D${rr + 2}")
    ws.cell(rr + 3, 2, 'Other-property mortgage with no years and no repayment (1 = the plan asks for them)  [Mort2_NeedsTerm]'); ws.cell(rr + 3, 4, f'=IF(SUMPRODUCT((N(+D{a}:D{z})>0)*(N(+E{a}:E{z})<=0)*(N(+F{a}:F{z})<=0))>0,1,0)').fill = GRN
    bk.name('Mort2_NeedsTerm', f"'Your lists'!$D${rr + 3}")
    ws.cell(rr + 4, 2, 'Other-property mortgage with no rate (1 = the plan asks for a mortgage rate)  [Mort2_NeedsRate]'); ws.cell(rr + 4, 4, f'=IF(SUMPRODUCT((N(+D{a}:D{z})>0)*(N(+G{a}:G{z})<=0))>0,1,0)').fill = GRN
    bk.name('Mort2_NeedsRate', f"'Your lists'!$D${rr + 4}")
    bk.mort2_first = a

def settings_dv(wb):
    """E3: data validation on every typed cell of Settings, with the ranges the app's own sliders and number boxes enforce"""
    import re as _re
    from p_inputs import RJ, add_dv, YN
    ws = wb['Settings']
    SP = {'infl': ('decimal', 0, 0.10), 'safetyMonthsTwo': ('whole', 1, 12), 'waitYears': ('whole', 1, 20), 'style': ('whole', 1, 3), 'depRate': 'depEarn', 'fundChg': 'penChg', 'riskMu': 'riskMu1', 'riskVol': 'riskVol1',
          'budget': 'budgetNeeds', 'g_lifeMen65': ('whole', 60, 110), 'g_lifeWomen65': ('whole', 60, 110), 'ddTiming': ('list', ['start', 'end'])}
    n = 0
    for r in range(8, 58):
        m = _re.search(r'\[Set_(\w+)\]', str(ws.cell(r, 2).value or ''))
        if not m: continue
        k = m.group(1); sp = SP.get(k, k)
        if isinstance(sp, str):
            a = RJ['asm'].get(sp)
            if a is None: continue
            if a['t'] == 'choice': sp = ('list', a['opts'])
            else:
                sc = 100.0 if a['t'] == 'pct' else 1.0
                sp = ('whole' if a['t'] in ('yrs', 'age', 'num') and a.get('step', 1) % 1 == 0 else 'decimal', round(a['min'] / sc, 10), round(a['max'] / sc, 10))
        cols = 'CDE' if str(ws.cell(r, 11).value or '').endswith('pct3') else ('CD' if 'Market' in str(ws.cell(r, 11).value or '') else 'C')
        if ws.cell(r, 6).value is not None: cols += 'F'
        for col in cols:
            c = ws[f'{col}{r}']
            if isinstance(c.value, str) and c.value.startswith('='): continue
            add_dv(ws, sp, f'{col}{r}', str(ws.cell(r, 2).value).split('[')[0].strip()); n += 1
    print('Settings validation on', n, 'cells')

def readme_edits(wb):
    from copy import copy
    ws = wb['README']
    def sty(dst, src):
        dst.font = copy(src.font); dst.alignment = copy(src.alignment); dst.fill = copy(src.fill); dst.border = copy(src.border); dst.number_format = src.number_format
    ws['B2'] = ('Version 2.6 · 8 Oct 2026 · built from LifeMap-Customer-Journey prototype (CALCS and Settings). Since 2.4: the main plan in Make my plan (eight sheets starting "Plan ..." and the Calculation register), '
                'audit fixes to the calculators (see "Audit fixes applied"), an example column on every calculator input block, law figures on the Plan sheets read from Assumptions, up to 20 saved-for goals, '
                'data validation on the Plan sheets and Settings, and the same "Choose your ... to see this" words and order as the app on every calculator. The four UI sheets (UI Guide, UI Calculators, UI Screens, UI Make my plan) are added by tools/build_ui_sheets.py.')
    ws['B2'] = ws['B2'].value.replace('Version 2.6', 'Version 2.7').replace(' The four UI sheets', ' Since 2.6 (journey spec section 27): only retirement age, plan-until age, inflation and a working partner\'s retirement age block the plan (the gate card says "we need N things"); every LifeMap standard is used automatically and is labelled "Set by LifeMap"; a market rate you do not give uses the suggested or planning rate ("Assumed: add yours"); any retirement age from your age + 1 is allowed, with the pension from the access age (60, or 50 for some occupational schemes) and the years before it paid from savings; a goal dated before today reads "Date has passed". The four UI sheets', 1)
    ws['B6'] = ("• Every number is one of three types (journey spec §14, §18, §27). Type 1, set by Government (tax, USC, PRSI, relief %, lump-sum bands, DIRT, exit tax, Central Bank limits, full State Pension and benefit rates): on the Assumptions sheet, not an input. "
                "Type 2, a market rate or a figure you enter yourself (mortgage rate, card APR, fund charges, the State Pension you will get …): a yellow input with a suggested figure and its source, or \"Usually between X and Y (source)\" where an official range exists; on a calculator it stays blank until you add it, in the plan a blank one uses the suggested published rate (mortgage and loans) or the planning rate (cards 20%) and is labelled \"Assumed: add yours\". "
                "Type 3, a LifeMap standard (growth rates, pay rises, emergency months, drawdown timing, retirement multiple, pension access age …): the calculator and the plan start from the standard (\"Set by LifeMap\"); type your own and it is \"Your choice\". Only four things are never filled in for you: retirement age, plan-until age, inflation, and a working partner's retirement age.")
    ws['B7'] = "• Your own figures stay blank: a calculator result that needs one (a market rate, the State Pension, Illness Benefit, your age, the retirement age) shows \"Choose your … to see this\" or \"Add your … to see this\". A LifeMap standard never blocks a result. Set \"Fill example values?\" (above) to Yes to fill every blank input with its grey \"Example only\" figure (the standard, or the sample customer's figure)."
    ws['B9'] = "• Market rates (mortgage, loans, cards, deposits, buying fees, fund charges) are never pre-filled on a calculator. Beside each is a suggested rate with its source, from the Settings sheet: by default Central Bank of Ireland averages with their month (journey spec §18, §19). In the plan, a rate you do not give uses that suggestion (mortgage and loans) or the planning rate (cards 20%) and says \"Assumed: add yours\". A partner can put its own rates and name there (\"Suggested by …\"). Law values cannot be changed."
    ws['B23'] = '• Light-blue sheet tab and light-blue fill = a Plan sheet or a working figure of the main plan (not a calculator). Teal sheet tab = a UI layer sheet added by tools/build_ui_sheets.py.'; sty(ws['B23'], ws['B22'])
    ws['B25'] = "• C01–C28 in the order of the prototype's CALCS array; the same numbers are used in the UI/UX spec. The Plan sheets have no numbers; they are named \"Plan ...\" and sit after C28."
    ws['B27'] = 'Plan sheets (the main plan in Make my plan)'
    ws.unmerge_cells('B28:E28')
    ws['B28'] = '• The main plan (project() in the prototype) is built here in full: Plan inputs, Plan pay & tax, Plan debt months, Plan cashflow, Plan goals, Plan results, Plan profile, Plan how it works, and the Calculation register. The list with links is at the bottom of this sheet. Open "Plan how it works" first.'
    ws.merge_cells('B28:E28'); ws['B28'].alignment = Alignment(wrap_text=True, vertical='top'); ws.row_dimensions[28].height = 48
    r = ws.max_row + 2
    c = ws.cell(r, 2, 'Plan sheets and the Calculation register'); sty(c, ws['B30']); r += 1
    items = [('Plan inputs', 'Everything you type for the plan: about you, goals, finances, assumptions, what-if.'),
             ('Plan pay & tax', 'Law figures (read from Assumptions), the figures the plan uses, and each year\'s pay, pension and tax.'),
             ('Plan debt months', 'Mortgage, cards and loans month by month.'),
             ('Plan cashflow', 'One row per year: money in, spending, goals, saving, savings left.'),
             ('Plan goals', 'Goals in funding order, each goal\'s % covered, band and goal line.'),
             ('Plan results', 'What the Results, Home and Plan screens show: saving, gate, findings, foundations, retirement at a glance, road and chart numbers.'),
             ('Plan profile', 'Money personality, risk profile and money terms from the Discover and Understand Me answers.'),
             ('Plan how it works', 'One paragraph per sheet, and which prototype value each Plan input is.'),
             ('Calculation register', 'Every place the prototype calculates, scores or shows a number, where it is in the workbook, and whether it was matched in a test.')]
    for nm, d in items:
        c = ws.cell(r, 3, f'=HYPERLINK("#\'{nm}\'!A1","{nm}")'); sty(c, ws['C60']); ws.cell(r, 4, d); r += 1
    ws.cell(r, 2, 'Some figures are typed on purpose (the app finds them by trying values; a spreadsheet cannot): see "Plan how it works", which also gives the specification and test vectors. Findings, foundations and the home figures are for the base plan, so they match the app when the what-if is zero.').font = GREYF
    r += 2
    c = ws.cell(r, 2, 'Other sheets'); sty(c, ws['B30']); r += 1
    for nm, d in [('Settings', 'Every standard LifeMap offers, with its wording and source, in one block (the Plan sheets read it too).'), ('Your lists', 'Cards, loans, pensions and mortgages on other properties, one row each (they win over a typed total).')]:
        c = ws.cell(r, 3, f'=HYPERLINK("#\'{nm}\'!A1","{nm}")'); sty(c, ws['C60']); ws.cell(r, 4, d); r += 1
    for nm, d in [('UI Guide', 'The UI layer (teal tabs), sheet 1: how to read the other three.'), ('UI Calculators', 'Every calculator screen as the app shows it: labels, ranges, chips and results.'), ('UI Screens', 'The app screens, in the app\'s words.'), ('UI Make my plan', 'The Make my plan screens, step by step.')]:
        c = ws.cell(r, 3, f'=HYPERLINK("#\'{nm}\'!A1","{nm}")'); sty(c, ws['C60']); ws.cell(r, 4, d + ' Appended by tools/build_ui_sheets.py.'); r += 1
    # the plan-engine item is done, so it leaves the "Not applied" table: the "Copy" item moves up into its row
    for col in 'BCD': ws[f'{col}132'].value = ws[f'{col}133'].value; ws[f'{col}133'].value = None
    ws.unmerge_cells('D133:E133')
    a = wb['Assumptions']
    a['B4'] = 'The Plan sheets (Plan pay & tax, "RULES the plan uses") read these same values: change a figure here and the plan changes with it. Values the Plan sheets need that are not on this sheet are typed there and labelled.'
    a['B4'].font = GREYF
    st = wb['Settings']
    st['B3'] = 'The Plan sheets read these standards too (Plan pay & tax, "Assumptions used"): a blank assumption on Plan inputs means "use the standard from here".'
    st['B3'].font = GREYF

def main():
    wb = openpyxl.load_workbook(SRC); bk = Book(wb)
    fix_lists(bk)
    wsI, g0i = p_inputs.build_inputs(bk)
    wsP, r = p_pay.build_pay(bk, wsI)
    TP = p_pay.pay_table(wsP, r + 1)
    wsG, gg0, s0, rg = p_goals.build_goals_static(bk)
    HDR = 6
    wsD, TD = p_cash.build_debt(bk, HDR)
    wsC, TC = p_cash.build_cash(bk, HDR)
    TP.write(); TD.write(); TC.write()
    bk.name('Plan_mPath', f"'Plan debt months'!${TD.col('path')}${TD.r0}:${TD.col('path')}${TD.r0 + NR - 1}")
    wsG2, q0, h0, nr = p_results.build_goal_results(bk, wsG, rg, gg0, s0)
    wsR = p_res.build_results(bk, wsI, h0, q0)
    p_prof.build_profile(bk)
    p_how.build_how(bk)
    _, regmiss, regn, regbad = p_reg.build_register(bk); print('register rows', regn, 'locator misses', regmiss, 'name problems', regbad)
    # order: Plan sheets after C28
    order = ['Plan inputs', 'Plan pay & tax', 'Plan cashflow', 'Plan goals', 'Plan results', 'Plan profile', 'Plan debt months', 'Plan how it works', 'Calculation register']
    rest = [n for n in wb.sheetnames if n not in order]
    k = rest.index('C28 Loan repayment') + 1
    final = rest[:k] + order + rest[k:]
    wb._sheets = [wb[n] for n in final]
    readme_edits(wb)
    settings_dv(wb)
    meta = {al: {'sheet': yt.ws.title, 'r0': yt.r0, 'cols': {c['key']: CL(yt.idx[c['key']]) for c in yt.cols}} for al, yt in YT.reg.items()}
    json.dump(meta, open(OUT.replace('.xlsx', '.meta.json'), 'w'))
    for _row in wb['Settings'].iter_rows():   # same wording as the app (the Q8 wording check bans the word "forecast")
        for _c in _row:
            if isinstance(_c.value, str) and 'planning standard, not a forecast' in _c.value: _c.value = _c.value.replace('planning standard, not a forecast', 'planning standard, not a prediction')
    wb.save(OUT); print('saved', OUT)

main()
