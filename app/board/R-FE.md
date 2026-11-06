---
status: ready (after the prototype port; app/ only)
---
# R-FE: frontend review findings (review of 5702bd7..0431501, score 3/5)

Fix all, then re-review to 5/5:
1. useBook reuses the server's open pending booking (API now returns it); no new pending per c2->c3 trip.
2. CalBooking polling stops after ~2 minutes and shows "We're confirming your booking, we'll email you".
3. c3 takes the newest pending booking and its adviserId, not advisers[index]; Cal embed remounts (key) when calLink or pending id changes.
4. done true->false for any reason (cancelled, ended, no_show) clears share picks and agree.
5. updateTenant: on error invalidate TENANT_KEY and re-apply from the server instead of restoring the snapshot.
6. /me/adviser: beforeLoad (or render guard) for the adviser role.
7. AdviserForm: strip origin, query/hash and trailing slashes from a pasted link.
8. Tenant figures: no Screen remount via rerender(); planning consumers subscribe to a figures version.
9. Journey page stores reset in clearLocal; clamp situation/video indexes; no StoryPlayer without a video.
10. Sign-in wall offline: on a network error (not 401) let a user with a local plan through; else redirect.
11. Credit card message uses repaidIn(months); debtpay extra (x): add the input row if the prototype has it, else delete the dead extraLine/monthsBefore code.
12. ExpertsPage selects only what headOf needs; preload embed.js on c2.

From the ponytail review (app side):
13. lib/redirectSearch.ts: replace with `validateSearch: z.object({ redirect: z.string().optional().catch(undefined) })` in the 4 routes; delete the file.
14. Use <Sec title=…> for the 7 raw `<div className="sec"><h3>` copies (ExpertsPage x2, HomeStart x2, WatchPicks, PlanGoalEdit, routes/_auth/build/timeline.tsx).
15. report/chart.tsx axisLabel: import the one in components/results/chart/cashflow.ts.
16. retire.calc.ts todayOf and invest.calc.ts:35/:183: use inTodaysMoney from domain/calc/words.ts.
17. domain/calc/inputs.data.ts: object rows ({ key, label, example, min, max, step, unit }) instead of 8-field positional tuples.
18. Drop `export` from addEmergencyFund (domain/plan/normalize.ts) if nothing else imports it.
Kept on purpose (user decisions): per-feature Nest modules + Nest CLI; the Billing SQS queue.
