# workbook-v3: the 2026 workbook with the app's engine v3.0 on the Plan sheets

These scripts build `deliverables/LifeGoals-Calculators-v2.9-2026-tax.xlsx` from `deliverables/LifeGoals-Calculators.xlsx` (the v2.8 workbook) and check it against the prototype.
The paths inside the scripts point at the scratch folder the work was done in; change `SC`, the `BASE` / output paths and the `letters.json` path first.

1. `e_main.py` (with `e_common.py`, `e_inputs.py`, `e_holdings.py`): adds the new Plan inputs (assets, home, policies, investment type, emergency-fund flags), the automatic Emergency fund goal, the **Plan holdings** sheet (cash, savings accounts, investments lot by lot with the 8-year clock, other assets, alternative investments, funding order, exit tax and capital gains tax with losses and the yearly exemption, DIRT), the two availability chains on Plan goals, the new Plan cashflow columns, policy income, PRSI on ARF withdrawals from 66 to 70, the money-profile cushion, the foundations and the "My money" counts. Output: `base_v3.xlsx` and `letters.json` (the column letters on Plan holdings and Plan cashflow).
2. `build2_head.py`, `build2_tail.py`, `build2_links2.py`: the workbook's front sheets, READ ME, tab order, calculator links to Plan inputs, the reference file. `build2.py` = head + tail.
3. `uno_step2.py`: inserts the "TAXES APPLIED THIS YEAR" column on Plan cashflow (LibreOffice) and writes `final.xlsx`.

Checking (needs the prototype, Playwright and LibreOffice, see `tools/plan-vs-xlsx/README.md`):

```
TAX2026=1 tools/plan-vs-xlsx/plan-vs-xlsx.sh ...      # the app held to the 2026 rules in every year, plans starting in 2026
python3 taxcmp.py workbook.xlsx scenarios.json app.json   # per pot: balances, amounts received, exit tax, CGT, DIRT (taxdump.js writes app.json)
```
`dbg.js` / `dbg.py` print the app's and the workbook's yearly figures for one scenario side by side.
