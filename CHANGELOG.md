# Changelog

## Branch `claude/focus-calculators-match` (not deployed) · Loans group and focus area; Focus pages show every calculator
- **New Loans group** (Calculators) and **Loans focus area** (Explore), in this order: Loan repayment, Loan comparison, Loan affordability, Credit card repayment, Debt repayment, Debt payoff plan. Loan repayment and Debt repayment moved here from Everyday Money (unchanged). Everyday Money now holds Budget, Monthly surplus and Net worth.
- **Loan comparison**: two offers by APR and term for the same amount; monthly repayment, total interest and total repaid for each, the difference, and a note when the lower monthly repayment comes from a longer term that costs more overall. APR is the all-in yearly cost, so no separate fee input.
- **Loan affordability**: spare money = take-home pay - essential spending - existing loan and card repayments; the customer chooses what share of it to use (default 70%, the rest is a buffer); the loan that repayment clears over the chosen term, total interest, and the repayment if the rate were 3 points higher. Guidance, not a lender's decision.
- **Credit card repayment**: built around the card's own minimum rule, which the customer enters from their statement or card terms (a % of the balance and a lowest amount; no default, because Irish issuers differ). Until it is entered the tool shows the customer's own payment only and says what to enter. With it: the minimum-only path against the customer's payment, interest saved, interest charged this month, and the payments that clear the card in 12 months and 3 years; warns when the payment does not cover the monthly interest.
- **Debt repayment** (loans, overdrafts, any fixed-payment debt) now shows what paying a little extra does: debt-free time without the extra, time saved and interest saved. It points to Credit card repayment for cards.
- **Debt payoff plan**: up to three debts (balance, APR, monthly repayment) plus an extra amount; highest-rate-first against smallest-balance-first against minimums only (cleared debts' repayments roll onto the next debt), with debt-free time and total interest for each.
- Pre-filled from "Your finances" like the other tools (card and loan balances, payments and rates, take-home pay and essentials). APR inputs follow the card and loan interest-rate assumptions.
- **Focus on one area** pages now list every calculator of their group (Pensions +AVC, +drawdown; Investing +risk and return; Everyday money +net worth). The Loans page shows no videos or live sessions yet (none are tagged `topic:'Loans'`); its picture is the Everyday one until `--art-loans` is replaced.
- Checked: 160 random cases of the four new calculators against an independent Python version (0 differences); 40 single-debt plans against the closed-form NPER and total interest (0 differences); existing test suites give the same results as `main` (asm 4 of 35, choices 2 of 80, precedence 1 of 57 fail on `main` too). The workbook does not have the four new calculators yet.

## 21 Oct 2026 · Budget 2027 rules as a plan start-year option, capital gains tax on sold assets
- **Start the plan in 2027** now uses the Budget 2027 rules (announced 6 Oct 2026) from 1 January 2027: 40% band €46,500 (one-parent €50,500, married €55,500 + up to €37,500), personal / employee / earned income credits €2,125, Home Carer €2,050, Rent Tax Credit €1,150 (€2,300 joint), USC 2% band to €30,300, State Pension €309.30 a week, exit tax 35%. A plan that starts in 2026 keeps the 2026 rules. Everything is in one place (`RULES_2027`), checked on 21 Oct 2026 against the Department of Finance Tax Policy Changes Summary and the Budget in Brief, and shown in "What your plan assumes" and the report.
- From 7 Oct 2026, in both years: CGT 31%, Help to Buy up to €35,000, CAT Group A threshold €420,000 (info).
- Not in the Budget tax measures so left as 2026: DIRT, USC rates and the 3% band (only the 2% band ceiling moves), PRSI path, pension limits, stamp duty, age credit. Illness Benefit and survivor's pension +€10 with the State Pension. The exact Qualified Adult rate is not in the guides and stays at 2026. The Investment Account is only a legislative framework so far: not modelled.
- Capital gains tax is now taken off sales of other assets, crypto, gold and art in the funding order, on a share of their value treated as a gain (new assumption, standard 40%; yearly exemption not counted).
- Rules are set from the start year on load, so the calculators and the plan use the same year.
- Tests: `tests/asm.js` updated for the 2027 values. The calculator-vs-workbook test (`tools/calc-vs-xlsx`) now fails 14 of 161 and shows 16 constant differences, all because the workbook still holds 2026 rules; the workbook is updated next.
- Added `docs/tax-audit-and-assumptions.md`: tax coverage audit, Voyant comparison and the full assumptions list.

## 20 Oct 2026 · Engine v3.0: emergency fund first, funding order, home option, policies, money explanation
- Emergency fund first: target = 3 months of essential spending with two secure incomes, otherwise 6 (the
  customer's setting). If cash is below the target, an Emergency fund goal is added, ranked first. It is optional:
  the customer can remove it and it is not added again; it is not added when cash already covers the target,
  unless the customer asked for it with 'Add an Emergency fund goal' on the money personality screen.
  No new quiz question: the existing Q7 is used.
- The emergency fund is built from cash, then savings accounts only (investments are never moved into it), and is
  ring-fenced: never used for goals, only for a shortfall in essential living costs.
- Funding order for goals and shortfalls: income, the goal's own pot, cash above the emergency fund, savings
  accounts, investments, other assets, alternative investments. Pension only from the access age, for retirement.
  Anything missing is shown as 'Still to find'. Starting balances grow at their own rates (cash and savings at the
  cash rate, investments and alternatives at the investment rate, other assets with prices); new savings keep the
  cash / invested mix. Selling values are before tax (CGT / exit tax not yet deducted).
- Home: 'Would you ever use your home to fund your plan?' No, never (default) / Yes, I'd downsize (age and value of
  the smaller home; frees (home value - smaller home) grown with prices, less 10% costs and any mortgage left) /
  Only as a last resort (not counted; a line under any gap shows what downsizing at 70 would free).
- Policies: a savings or endowment policy pays a lump sum at an age (added to cash); a policy or annuity pays a
  regular income from an age (taxed with other income). Income protection stays under Protection.
- One emergency-fund figure (cash / essential spending) used for the cushion tile, foundations, risk profile and
  messages. Money personality: Safety net section, cushion levels In place / Thin / None: relies on credit /
  Not set up yet, personal 'You might notice' with an 'Add an Emergency fund goal' button, all term meanings
  filled in.
- Results: monthly saving line (left / saved / everyday spending) and where each goal's money comes from.
- Also includes: C10 waiting money earns the cash rate, C13 contributions rise with pay, rent-vs-buy deposit and
  fixed-withdrawal pre-fill.

## 15 Oct 2026 · Explore → Mortgages page rebuilt

Rebuilt to match the approved design in `docs/design/mortgage-page-reference.html` (reference only, nothing pasted). Only `LifeGoals-Customer-Journey-Prototype.html` changed; calculator maths and the engine are untouched.

- **Your situation**: Buying / Switching / Borrowing more buttons. Each one reorders the calculators and changes the videos, reading and live sessions.
- **Jump links**: Upload · Calculators · Watch · Read · Live.
- **Upload card**: "Upload your mortgage statement or payslip. Every calculator below fills in for you." Uses the existing statement upload flow (upload or sample).
- **Calculators as expanding cards**: all 7 are shown (Borrow, Deposit, Repayment, Rent vs buy, Term, Rate change, Overpay; "Top-up" for Borrowing more). The tapped card opens tall and in colour with its photo; the others shrink to black-and-white strips. "Open calculator" opens the existing calculator. 1280px: cards sit side by side; phones: stacked. There is no "View all" step.
- **Watch**: round story bubbles with ticks and "x of y watched". The real first-home video (existing `VIDEOS` list, `media/`) plays with captions and chapter chips and shows "Up next: try it with your numbers" near the end. Videos with no file show "Coming soon".
- **Read and ask**: Articles / FAQs / Links cards with TODO placeholders until `docs/content/mortgage/` exists.
- **Live sessions**: with "Save seat".
- **Floating "Talk to a mortgage expert" button**: built as a reusable `expertFab(type)` + `expertSheet(type)`. It sits above the tab bar, shrinks to a round icon while scrolling, grows back when scrolling stops, and hides when the keyboard is open or a video is full screen. The bottom sheet offers Call me back / Book a video call / Send a message and leads into the existing Experts booking flow.
- Respects `prefers-reduced-motion`.
- Added `docs/design/` with the reference files.

Known gaps: only the first-home video has a real file; "Call me back" and "Send a message" land in the existing Experts flow (which only has video and in-person booking today).
