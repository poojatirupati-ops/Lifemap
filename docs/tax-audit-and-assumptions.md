# LifeMap: tax coverage audit, Voyant comparison, assumptions

**Update 21 Oct 2026 (Budget 2027):** the engine now has a 2027 rules option (section 6) and capital gains tax on sold assets. Gap 1 below is partly closed: CGT is taken off sales of other assets, crypto, gold and art using a share-of-value assumption. Gaps 2 to 8 remain.

Audit date 21 Oct 2026. Based on the engine in `main` (commit 56857ce, Engine v3.0). Nothing in the app was changed for this audit.

## 1. Short answer

- Income tax, USC, PRSI, pension relief, the pension lump sum, the Standard Fund Threshold, State Pension tax, DIRT, exit tax (with the 8-year deemed disposal) and stamp duty are all modelled, from one rules register (`RULES_IE_2026`).
- Tax on savings and investments is **not** taken off year by year as a separate line. It is built into the growth rate (cash: after DIRT; investments: after charges and exit tax, smoothed over 8 years).
- **Not modelled yet:** capital gains tax (CGT) on shares, crypto, other property and other assets; gift/inheritance tax (CAT); rental expenses and mortgage-interest relief; the tax-free part of a purchased annuity; Local Property Tax; benefit-in-kind; health and medical tax reliefs. Details in section 3.

## 2. What is covered, and how

| Item | Treatment in the prototype | Fair / right? |
|---|---|---|
| Salary | Income tax 20% / 40% with bands and credits (personal, PAYE, married, single parent, rent, home carer, age), USC bands, PRSI Class A or S on the legislated rate path (4.2% → 4.35% Oct 2026 → 4.5% → 4.7%), PRSI credit, no PRSI from 66. Joint assessment for married couples, also in retirement. | Yes. 2026 figures from the register. |
| Self-employed | Class S PRSI (min €650 above €5,000), USC surcharge 3% above €100,000. | Yes. |
| Pension contributions | Relief at marginal rate within age limits (15% to 40%) and the €115,000 earnings cap, income tax only (not USC/PRSI). Auto-enrolment: you 1.5%, employer 1.5%, State 0.5% (2026 to 2028 rates, held flat after). | Yes. |
| Pension fund growth | Tax-free inside the fund. Growth after charges: 4.5% while working, 3.15% once retired. | Yes. |
| Pension lump sum | Up to 25%; first €200,000 tax-free (lifetime), €200,001 to €500,000 at 20%, above that at the marginal rate. | Yes. |
| Standard Fund Threshold | €2.2m (2026) rising to €2.8m (2029), then with prices; excess taxed 40%. | Simplified: one flat 40% charge. |
| Pension drawdown (ARF/PRSA) | Taxed as income (income tax + USC; PRSI before 66). Legal minimum 4% from 61, 5% from 71, 6% if over €2m. | **Verify** the PRSI-before-66 rule on ARF draws with Revenue. |
| State Pension | Taxable, USC-exempt, pro-rata from 10 to 40 years of PRSI, grows with prices (or pay, or flat, customer's choice). | Yes. |
| Savings (cash, deposits) | DIRT 33% built into the cash growth rate (1% a year after DIRT). Suggested deposit rate shown before DIRT. | Yes. |
| Investments (funds, ETFs) | 5% gross, less 1% charges, less exit tax 38% every 8 years (deemed disposal), smoothed into one net yearly rate (about 2.6% with 38% exit tax, 2.7% with 35%). | Good approximation for funds. Wrong for direct shares (see 3). |
| Life policies (lump sum) | Added to cash at the chosen age. Exit tax is only noted ("before tax"). | Gap: not deducted. |
| Policy or annuity income | Added to other income and taxed with salary (income tax + USC; PRSI over €5,000 before 66). | Conservative for purchased annuities (see 3). |
| Rental income | Whole rent taxed at the marginal rate with USC and PRSI. | Gap: no expenses or interest relief. |
| Home | Main home not taxed (CGT-exempt). Downsizing frees (value − smaller home) less 10% costs and mortgage left. | Fair. |
| Stamp duty and buying costs | 1% to €1m, 2% to €1.5m, 6% above; legal and survey fees set separately. | Yes. |
| Fees and charges | Fund/pension charge 1% a year in growth rates; fees calculator; mortgage and loan interest per statement or planning rate. | Adviser or platform fees are not modelled. |
| Inflation | 2% a year (ECB target), customer-chosen; Ireland now 3.9% (CSO) shown as context. Tax bands and State Pension follow prices unless the customer picks "stay as today". | Yes. |

## 3. Gaps and what I would change (in priority order)

1. **CGT on non-fund assets.** Shares held directly, crypto, gold/art, and other property are treated like funds or like plain growth, and selling values are "before tax". Irish rule: CGT 33% on gains over the annual exemption (long-standing €1,270; not re-verified in this check), no deemed disposal. Proposal: add an asset-type tag (fund / direct shares / crypto / other) and a "cost" field; deduct 33% of the gain above the exemption when the money is used for a goal.
2. **Life-policy and fund encashment.** When a policy lump sum or fund is sold, exit tax on the gain should come off. Today it is only in the growth rate for funds, and not at all for policy lump sums. Proposal: deduct 38% of the gain on a policy lump sum (customer enters amount paid in).
3. **Rental.** Add "costs and mortgage interest" so tax is on profit, not rent. Current treatment overstates tax.
4. **Purchased annuity.** Only the interest part of a purchased (non-pension) annuity is taxable; a pension annuity is fully taxable. Today both are fully taxed. Proposal: add a "from my pension / bought separately" choice.
5. **Gift and inheritance tax (CAT).** Not modelled. At minimum a note and an optional "expected inheritance / gift given" line with the Group A threshold. The Group A threshold is €420,000 from 7 Oct 2026 (Budget 2027, per press coverage; check Revenue before release).
6. **SFT excess.** The 40% charge is a simplification; the real charge also interacts with income tax on drawdown. Low priority for typical customers.
7. **Smaller items:** Local Property Tax, health insurance and medical-expense relief, benefit-in-kind, USC reduced rate for medical-card holders under 70 (already listed as a known limit), the first-year timing of PRSI changes.
8. **Display:** show a yearly "tax paid" line (income tax, USC, PRSI) in the plan detail so customers see tax in euros, not only inside growth rates.

## 4. Voyant comparison

How far this is reliable: I could not open Voyant's support site (blocked from this session) and I have no access to the product. This is from search results only, so treat it as a lead, not a full audit.

What I found:
- Voyant Adviser is an adviser tool, not customer-facing. For Ireland the tax rules are hard-coded (Income tax, USC, PRSI), with DIRT assumed on the default cash account, main residences treated as tax-exempt, and CAT noted as unavoidable.
- It can realise capital gains each year ("annual capital gains liquidation"): it works out each asset's gain at year end, applies tax and adds the net proceeds to cash. If the setting is off, gains stay unrealised and tax is deferred.
- It has account types with their own tax treatment, scenario testing, advanced life-insurance modelling, and (US only) Roth conversions and Social Security claiming.

Compared with LifeMap:
- **We match or are ahead on:** Irish income tax, USC, PRSI (with the rate path), pension relief limits, the lump-sum bands, ARF minimums, State Pension pro-rating, joint assessment in retirement, emergency fund and a funding order for goals, plain-English assumptions with a source per figure, and a customer-facing flow. Voyant is not built for customers.
- **Voyant likely does better:** per-asset tax treatment, year-by-year capital gains and cost basis, CAT, and adviser-level scenario work. These are gaps 1, 2 and 5 above.
- **Where we should not copy Voyant:** hard-coding one tax view for every asset. A customer should choose the asset type, and the app should say clearly when tax is not deducted.

## 5. All assumptions in the prototype

**Law (fixed for everyone, in `RULES_IE_2026`, 2026):**
- Income tax: 20% to €44,000 (single; €48,000 single parent; €53,000 married, plus up to €35,000 for the second income), 40% above. Credits: personal €2,000 (married €4,000), PAYE €2,000 (capped at 20% of pay), rent credit €1,000 (€2,000 joint, to 2028), single parent €1,900, home carer €1,950, age credit €245 from 65. Age exemption €18,000 (€36,000 married) from 65.
- USC: 0.5% to €12,012, 2% to €28,700, 3% to €70,044, 8% above; nothing under €13,000; 70+ with income to €60,000 pay 0.5% / 2%; self-employed surcharge 3% above €100,000.
- PRSI: Class A on the legislated path (4.2% from Oct 2025, 4.35% from Oct 2026, 4.5% from Oct 2027, 4.7% from Oct 2028); free under €352 a week; credit up to €12 a week to €424; Class S minimum €650 above €5,000; none from 66.
- Pension: relief 15% to 40% by age, cap €115,000 earnings; lump sum 25% (€200,000 tax-free, 20% to €500,000); SFT €2.2m rising to €2.8m, 40% on excess; ARF minimum 4% / 5% / 6%; access age 60 (50 for some schemes).
- State Pension: €299.30 a week from 66; 10 to 40 years of PRSI; Qualified Adult rates; over-80 increase.
- Savings and investment tax: DIRT 33%; exit tax 38% with an 8-year deemed disposal.
- Home: Central Bank limits (4× income first-time buyer, 3.5× others, 90% loan to value); stamp duty 1% / 2% / 6%.

**Standards (set by LifeMap or a partner; the customer can change them):**
- Prices rise 2% a year. Pay rises 3% a year. Tax bands and State Pension follow prices.
- Cash earns 1% a year after DIRT. Investments grow 5% before charges, less 1% charges, less exit tax (about 2.6% net at 38%, 2.7% at 35%). Pensions grow 4.5% while working and 3.15% once retired, both after charges.
- Rent vs buy: rent rises 3%, house prices 2%, upkeep 1% of value a year.
- Emergency fund: 6 months of essential spending (3 with two secure incomes). Money needed within 5 years is kept as cash. 40% of spare savings is invested, the rest in cash. At most 50% of spare money is saved; €300 a month if the customer doesn't answer. Spare money not saved is assumed spent.
- Retirement: lump sum 25%; pension taken as spread to the plan end age, at least the legal minimum; spending in retirement 80% of today's spending if no goal is set; target pot 25× yearly income needed; plan until age 90 (customer chooses 50 to 100); State Pension from 66.
- Protection guidance: life cover 60% of income for 15 years.
- Debts: mortgage 3.75% (suggested 3.48%), personal loans 8% (suggested 6.72% APR), cards 20% (cap 23%); card and loan APRs are effective yearly rates, mortgages nominal ÷ 12.
- Funding order for a goal or shortfall: income, the goal's own pot, cash above the emergency fund, savings accounts, investments, other assets, alternative investments; pension only from the access age and only for retirement.
- Timing: calculators monthly at month end; pension contributions at year end; money saved for goals at the start of the year.

**Known limits (stated to customers):** living costs stay flat in real terms; a partner's own pension isn't modelled; drawdown is assumed from an ARF or vested PRSA; the reduced USC for medical-card holders under 70 isn't applied; auto-enrolment rates after 2028 stay at 2026 rates; selling values are before CGT and exit tax.

**Verify before release:** the PRSI-on-ARF rule, the €1,270 CGT exemption, any CAT threshold, and whether DIRT or exit tax change in Finance Bill 2026 (the exit tax cut to 38% is in the register; further reform to deemed disposal is under discussion).

Sources used: engine rules register in `LifeGoals-Customer-Journey-Prototype.html`; Voyant support pages as found by search (not opened); Budget 2026 coverage from Forvis Mazars, A&L Goodbody and Irish Tax Hub.

## 6. Budget 2027 (announced 6 Oct 2026): plan start year 2027

The plan start year (Your assumptions, "Start the plan in") is 2026 or 2027. LifeMap suggests 2027 from October 2026. A 2027 plan uses these figures from 1 January 2027. Each is flagged verify: open the Department of Finance "Budget 2027 Tax Policy Changes" and Revenue before release, because the Finance (No. 2) Bill 2026 may change details. I could only read press and adviser summaries of the Budget, not the primary pages.

| Item | 2026 | 2027 |
|---|---|---|
| 40% starts above (single) | €44,000 | €46,500 |
| One-parent band | €48,000 | €50,500 |
| Married, one income | €53,000 | €55,500 |
| Married, two incomes (second income up to) | €35,000 extra (€88,000) | €37,500 extra (€93,000) |
| Personal credit | €2,000 (married €4,000) | €2,125 (married €4,250) |
| Employee (PAYE) and earned income credits | €2,000 | €2,125 |
| Home Carer credit | €1,950 | €2,050 |
| Rent Tax Credit | €1,000 (€2,000 joint) | €1,150 (€2,300 joint), 2027 and 2028 |
| USC 2% band ends at | €28,700 | €30,300 (rates unchanged) |
| State Pension (full rate, a week) | €299.30 | €309.30 (€319.30 at 80+) |
| Exit tax (funds, ETFs, life policies) | 38% | 35%, 8-year deemed disposal stays |

Already in force from 7 Oct 2026 (used in both 2026 and 2027 plans): CGT 31% (was 33%); Help to Buy up to €35,000 (was €30,000); CAT Group A threshold €420,000.

Not changed in the announced Budget, so 2026 figures stay: DIRT 33%, USC rates and the 3% band, PRSI (rate path already legislated: 4.5% from Oct 2027), pension relief and lump-sum limits, Standard Fund Threshold, stamp duty, age credit, single-parent credit (€1,900), auto-enrolment rates. Qualified Adult and other Social Welfare rates will be updated once published.

Announced, not modelled yet: the New Investment Account from July 2027 (up to €12,000 a year, no tax on the first €50,000, 1% levy above; no CGT, exit tax or deemed disposal inside it). Details to be confirmed in the Finance Bill.

Open conflicts in the press coverage to settle against the official document: the top of the 3% USC band (€70,044 vs €70,444; the engine keeps €70,044) and the self-employed USC surcharge threshold (€100,000, unchanged).
