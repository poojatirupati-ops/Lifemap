# Changelog

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
