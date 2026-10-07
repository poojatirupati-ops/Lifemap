// ---------- 6 Goals: Emergency fund months and ranking (journey-spec §19.7, §19.8) ----------
{ const B19 = require('./s19b.json'), MO = B19.months, RK = B19.rank;
  push(H1('6. Goals: Emergency fund months and goal order'));
  push(P('Journey-spec §19.7 and §19.8. These two changes touch the plan builder, the Emergency fund calculator (C11) and the results order; the results engine and the cashflow projection are unchanged.'));
  push(H2('6.1 Emergency fund months: one value everywhere'));
  push(P('The number of months of essential spending to keep is **one plan-wide setting** (Your assumptions, "' + M.ASM.safetyMonths.l + '"; Settings standard 6 months, 3 with two secure incomes). It is asked in three places and they always show the same value, so step 7 never asks again or shows a different number:', { size: 18 }));
  push(table([2400, W - 2400], ['Where', 'What the customer sees (verbatim) and what happens'], [
    ['Emergency fund goal (timeline, edit a goal)', 'Box "' + MO.goalRow.label + '", placeholder "' + MO.goalRow.placeholder + '" (the standard); note "' + MO.goalRow.note + '" Typing 4 sets the plan-wide value to ' + MO.goalSet.asm + '; clearing the box removes the choice.'],
    ['Emergency fund calculator (C11)', 'Blank at first: the box is empty with the tag "' + MO.calcBlank.tag + '" and the gate reads "' + MO.calcBlank.gate.replace(/\n/g, ' · ') + '". Typing ' + MO.calcSet.box + ' sets the plan-wide value (' + MO.calcSet.asm + '); the result then reads "' + MO.calcSet.line + '". Opened after the goal was set to ' + MO.goalSet.asm + ', it shows ' + MO.calcAfterGoal + '.'],
    ['Plan builder step 7 (Your assumptions) and Your assumptions', 'Before any choice: tag "' + MO.p4Before.field.tag + '", empty box, chip "' + MO.p4Before.field.chip + '". After typing 3 in the calculator: tag "' + MO.p4AfterCalc.field.tag + '", box ' + MO.p4AfterCalc.field.box + ', no chip. After 4 in the goal: tag "' + MO.p4AfterGoal.field.tag + '", box ' + MO.p4AfterGoal.field.box + ', chip "' + MO.p4AfterGoal.field.chip + '" (the chip appears because the value differs from the standard).']], { size: 15 }));
  push(imgGrid([{ file: 'M-goal-months.png', caption: 'Emergency fund goal: months box' }, { file: 'M-step7.png', caption: 'Step 7 shows the same value' }], 2, 420));
  push(P('The bounds are 1 to 12 months (a typed value is rounded to a whole number and kept within them). The workbook sheet "C11 Emergency fund" takes the same months as its own input; the standard comes from Set_safetyMonths and Set_safetyMonthsTwo on the sheet Settings.', { size: 16 }));
  push(H2('6.2 Goal order: "Which goal first?"'));
  const R0 = RK.f4, R1 = RK.afterDown;
  push(P('The customer ranks their goals; **funding and the results order follow the ranking**. It replaces the fixed safety-first, must-have order, except that **the Emergency fund stays first unless the customer moves it**. The ranking card is on the Confirm my LifeMap screen (step 2 of the plan builder, id rank-f4) and in My Plan (the same list, heading visually hidden, id rank-plan).', { size: 18 }));
  push(table([2400, W - 2400], ['Part', 'Copy and behaviour (verbatim)'], [
    ['Heading (h3)', R0.heading],
    ['Help', R0.help.replace(/ \(Not changed yet\.\)$/, '') + ' After a move the sentence "(Not changed yet.)" disappears.'],
    ['A row', '"{n}. {emoji} {goal}" with the line "{when}" (e.g. "' + R0.items[1].text.replace(/^2\. /, '') + '"); the retirement goal reads "' + R0.items[4].text.replace(/^5\. 🌅 Retire comfortably/, '') + '"; a legacy goal "What is left at the end of your plan".'],
    ['Buttons', '▲ and ▼ chips (.chip.sm) per row; aria-label "' + R0.items[1].btns[0][1] + '" / "' + R0.items[1].btns[1][1] + '"; the first row\'s ▲ and the last row\'s ▼ are aria-disabled.'],
    ['Message (role="status")', 'After a move: "' + R1.msg + '" (e.g. moving the Emergency fund down one place). Plan version note "Goal priority changed".'],
    ['Reset link', '"' + R1.reset + '" (shown once the order has been changed); the message becomes "' + RK.afterReset.msg + '" and the version note "Goal priority reset".'],
    ['Default order', RK.order0.join(' › ') + ' (Emergency fund first, then Must have before Nice to have, then the soonest). Retirement is paid from the pension, so its place does not change how savings are shared.'],
    ['Effect on results', 'The goals list in the results follows the ranking: default ' + RK.resultsDefault.join(', ') + '; after the customer moves Travel to the top: ' + RK.resultsRanked.join(', ') + '. Until the customer ranks, results stay in date order.']], { size: 15 }));
  push(imgGrid([{ file: 'K-rank-default.png', caption: 'Default: Emergency fund first' }, { file: 'K-rank-moved.png', caption: 'After moving goals' }], 2, 620));
}

