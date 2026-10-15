# Changelog

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
