import re,json
H='/home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'
D='/home/user/lifegoals-prototype/docs/pre-release-verify.md'
P={
'invGross':("LifeMap planning standard, not a forecast. Reference points: Pensions Authority pension-calculator growth assumption; Central Bank of Ireland guidance that returns are not guaranteed","Confirm 5% before fees and tax is a prudent long-run mixed-fund assumption; record who confirmed and when."),
'pen':("LifeMap planning standard, not a forecast. Reference point: Pensions Authority pension-calculator assumptions","Confirm 4.5% a year after charges for a pension in the growth phase; state the gross figure it implies (about 5.5% before 1% charges) and that pension growth is tax-free inside the fund."),
'penRet':("LifeMap planning standard, not a forecast. Reference point: Pensions Authority pension-calculator assumptions","Confirm 3.15% a year after charges once retired (a lower-risk fund)."),
'rentRise':("LifeMap long-run planning figure. Reference points: Residential Tenancies Board Rent Index; CSO Consumer Price Index (rent)","Check against the latest RTB Rent Index and CSO rent inflation; keep the wording that it is a long-run planning figure."),
'houseGrow':("LifeMap long-run planning figure. Reference point: CSO Residential Property Price Index","Check against the CSO Residential Property Price Index over a long period; keep the wording that prices can fall."),
'upkeep':("LifeMap planning standard (no official figure exists)","Confirm 1% of home value a year for repairs, insurance and maintenance, or replace it with a named industry guide."),
'ownShare':("Pensions Authority and My Future Fund (auto-enrolment) contribution split, 2026","Confirm that a common employee/employer split is about half each; 100% for the self-employed."),
'retireMult':("Widely used 4% sustainable-withdrawal rule of thumb (W. Bengen, Journal of Financial Planning, 1994)","Confirm 25 times the yearly income needed is acceptable as a planning target for Irish customers; record the reviewer."),
'retireSpend':("LifeMap planning standard. Reference points: Pensions Authority and Society of Actuaries in Ireland retirement-income guidance","Confirm that 80% of today's spending is a reasonable starting point once work costs and the mortgage stop."),
'lumpSum':("Revenue Commissioners: tax-free retirement lump sum, up to 25% of the fund (law limit)","Confirm the standard is the legal maximum (25%, with the €200,000 tax-free and next €300,000 at 20% bands held in the rules register)."),
'safetyMonths':("LifeMap planning standard. Reference points: MABS and CCPC (ccpc.ie) guidance on keeping 3 to 6 months of essential spending as an emergency fund","Open the MABS and CCPC pages, confirm 6 months for a single income or the self-employed, and record the date."),
'safetyMonthsTwo':("LifeMap planning standard. Reference points: MABS and CCPC guidance","Confirm 3 months where there are two secure incomes."),
'cashYears':("LifeMap planning standard (common planning practice: money needed within about 5 years is not invested)","Confirm 5 years; record the reviewer."),
'investShare':("LifeMap planning standard (a balanced cash and invested mix)","Confirm 40% of spare savings invested is reasonable for a default and that it never recommends a product."),
'saveShare':("LifeMap planning standard","Confirm that saving at most half of spare money is a prudent limit."),
'noAnswer':("LifeMap planning standard","Confirm €300 a month as the modest amount used when a customer has not said what they could save."),
'lifeShare':("LifeMap planning standard. Reference point: Irish life-insurer needs calculators","Confirm that 60% of income is a reasonable starting need; the customer can change it."),
'lifeYears':("LifeMap planning standard. Reference point: Irish life-insurer needs calculators","Confirm 15 years of support (often until the youngest child is about 23)."),
'riskMu':("LifeMap illustrations, not forecasts","Confirm 2% / 4% / 6% a year are fit as illustrations; an adviser uses the fund's own risk rating (SRI 1 to 7)."),
'riskVol':("LifeMap illustrations, not forecasts","Confirm 5% / 10% / 16% volatility as illustrations only."),
'budget':("The 50/30/20 budgeting rule (E. Warren and A. Warren Tyagi, All Your Worth, 2005)","Confirm the rule is shown as a rule of thumb the customer can change."),
'bands':("Department of Finance Budget history (tax bands and credits, 2015 to 2026)","Confirm 'bands rise with prices' as the standard and that 'stay as today' is offered as the cautious choice."),
'spGrow':("Department of Social Protection weekly State Pension rate history","Confirm 'rises with prices' as the standard."),
'drawRule':("Revenue Commissioners: ARF and vested PRSA minimum annual distribution (4% from 61, 5% from 71; 6% over €2m)","Confirm the standard spreads the money over the plan, at least the legal minimum."),
'ddTiming':("LifeMap tool setting","Confirm withdrawals at the start of the year is the prudent choice for the drawdown tools."),
'waitYears':("LifeMap tool setting (an illustration of the cost of waiting)","Confirm 5 years as the illustration."),
'style':("LifeMap tool setting (Balanced; an adviser checks attitude to risk)","Confirm Balanced as the starting style for the risk and return tool."),
'buyFees':("No published figure","Nothing is suggested; confirm that stays so unless an official source is found."),
}
h=open(H).read()
for k,(src,chk) in P.items():
    m=re.search(r"(\n  "+k+r":\{n:'[^\n]*?)src:'[^']*'",h)
    if m: h=h[:m.start()]+m.group(1)+"src:'"+src.replace("'","\\'")+"'"+h[m.end():]
open(H,'w').write(h)
d=open(D).read()
core=['upkeep','ownShare','retireMult','retireSpend','lumpSum','safetyMonths','safetyMonthsTwo','cashYears','investShare','saveShare','noAnswer','lifeShare','lifeYears','riskMu','riskVol','budget','bands','spGrow','drawRule','ddTiming','waitYears','style','buyFees']
dump=json.load(open('/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/r12/settings_dump.json'))['s']
rows=''
for k in core:
    v=dump[k]; val=v['v']; val='none' if val is None else str(val)
    rows+=f"| {v['n']} | Set_{k} | {val} | {v['asat']} | {P[k][0]} | {P[k][1]} | Financial planner (rationale), Proposition & Product Manager (assigns and signs off) |\n"
sec="""## B2. LifeMap planning standards (not flagged "verify", but each needs a named reviewer)

These 23 standards are the planning choices behind the "Use the standard (X)" chips (§14 type 3). They are LifeMap's own choices, not law and not a published statistic, so there is no single page to open. Before launch each is labelled "LifeMap planning standard, reviewed [date] by [name]". The sources named are the reference points a reviewer can compare with; where none exists the row says so. Customers always see the plain wording next to the figure and can type their own.

| Standard | Workbook name | Value | As at | Source (named) | What to check | Suggested checker |
|---|---|---|---|---|---|---|
"""+rows+"\n"
d=d.replace("## C. Not flagged",sec+"## C. Not flagged",1)
# section B: replace internal file citations
for k in ['invGross','pen','penRet','rentRise','houseGrow']:
    d=re.sub(r"(\| Set_"+k+r" \| [^|]*\| [^|]*\| )deliverables/irish-rules-and-rates-audit\.md §3 B\d+",lambda m:m.group(1)+P[k][0],d)
d=re.sub(r"(\| Set_inv \| )0\.035( \| 2026 \| )deliverables/irish-rules-and-rates-audit\.md §3 B3",r"\g<1>0.026 (derived)\2Derived in the app from Set_invGross, the fund charges (Set_fundChg), the 38% exit tax and the 8-year rule: ((1 + g - c)^8 less 38% of the gain)^(1/8) - 1, to 0.1%",d)
d=d.replace("**Counts.** 81 register items and 14 Settings standards, 95 in total.","**Counts.** 81 register items and 14 Settings standards, 95 in total, plus the 23 LifeMap planning standards in section B2 (118 items to name a checker for).")
open(D,'w').write(d)
print(d.count('deliverables/'))
