/* ================= "Not sure? See an example" (journey-spec §15, Pooja 6 Oct 2026) =================
   Every customer's money is different, so we never fill in a figure for them. Each Your finances field links to a short example card
   built from the sample customers' own figures (SAMPLE_FIN, the same data loadSample() uses). The card never fills the field. */
const SAMPLE_FIN = {name:['Aoife', 'pre'], age:[38, 'pre'], retireAge:[63, 'pre'], pAge:[37, 'typed'],
  work:['Employed', 'doc', 99], income:[58000, 'doc', 98], pIncome:[22000, 'typed'], otherM:[0, 'typed'], costsM:[3600, 'typed'], oneOffY:[1800, 'doc', 81],
  home:['Own with mortgage', 'doc', 99], homeValue:[420000, 'typed'], cash:[9000, 'doc', 97], invest:[6200, 'doc', 88],
  mortBal:[203700, 'doc', 96], mortRate:[3.85, 'doc', 94], mortPayM:[1180, 'doc', 93], mortYears:[21, 'doc', 90], cardBal:[400, 'doc', 86], cardPayM:[40, 'doc', 80], loanBal:[3500, 'doc', 88], loanPayM:[100, 'doc', 84],
  life:['Yes', 'doc', 95], ip:['No', 'typed'], ci:['Not sure', 'typed'], workCover:['Yes', 'doc', 90], health:['Yes', 'typed'],
  pension:[72000, 'doc', 95], pensionM:[520, 'doc', 91], sp:['Expect full', 'typed']};
const SAMPLE_OWN_SHARE = 0.5;   // Aoife's choice in Your assumptions (her statement shows the same €260 of €520)
const sf = k => SAMPLE_FIN[k] ? SAMPLE_FIN[k][0] : null, se = k => eur(sf(k));
const YNN_O = [['Yes', 'you have it'], ['No', 'you don\'t'], ['Not sure', 'check your documents, then come back']];
// t: the example sentence (ends with what they enter or pick); w: where to find yours; o: options explained (choice fields)
const EXAMPLES = {
  age:{t:() => 'Aoife is ' + sf('age') + '. She enters ' + sf('age') + '.', w:'your date of birth, on your passport or driving licence.'},
  retireAge:{t:() => 'Aoife wants to retire at ' + sf('retireAge') + ', before her State Pension starts at ' + RI.sp.age + '. She enters ' + sf('retireAge') + '.', w:'the normal retirement age on your annual pension benefit statement.'},
  pAge:{t:() => 'Aoife\'s partner Cian is ' + sf('pAge') + '. She enters ' + sf('pAge') + '.', w:'your partner\'s date of birth.'},
  work:{o:[['Employed', 'you get a payslip'], ['Self-employed', 'you file a Form 11'], ['Not working', 'no earnings right now']], t:() => 'Aoife has a payslip, so she picks ' + sf('work') + '.', w:'your payslip, or your Form 11 if self-employed.'},
  income:{t:() => 'Aoife earns ' + se('income') + ' a year before tax. She enters ' + se('income') + '.', w:'gross pay on your payslip, or your Employment Detail Summary in Revenue myAccount.'},
  pIncome:{t:() => 'Cian earns ' + se('pIncome') + ' a year before tax. Aoife enters ' + se('pIncome') + '.', w:'your partner\'s payslip or Employment Detail Summary (Revenue myAccount).'},
  otherM:{t:() => 'Aoife and Cian have no other income, such as rent or maintenance. They enter ' + se('otherM') + '.', w:'your bank statements, or Revenue myAccount for rental income.'},
  costsM:{t:() => 'Aoife and Cian spend ' + se('costsM') + ' a month on bills, food and extras, not counting the mortgage or loans. They enter ' + se('costsM') + '.', w:'your banking app\'s spending summary, or 3 months of current-account statements.'},
  oneOffY:{t:() => 'Aoife and Cian\'s yearly one-off costs, such as car tax, insurance and holidays, come to ' + se('oneOffY') + '. They enter ' + se('oneOffY') + '.', w:'last year\'s bank statements.'},
  home:{o:[['Own outright', 'no mortgage left'], ['Own with mortgage', 'still paying it off'], ['Rent', 'you pay a landlord'], ['Live with family', 'no rent or mortgage']], t:() => 'Aoife and Cian are paying off a mortgage, so they pick ' + sf('home') + '.', w:'your mortgage statement or tenancy agreement.'},
  homeValue:{t:() => 'Aoife and Cian think their home is worth about ' + se('homeValue') + '. They enter ' + se('homeValue') + '.', w:'sale prices of similar homes on the Property Price Register, or your LPT valuation.'},
  cash:{t:() => 'Aoife and Cian have ' + se('cash') + ' in savings, including the credit union. They enter ' + se('cash') + '.', w:'your banking and credit union apps, or An Post State Savings.'},
  invest:{t:() => 'Aoife\'s investment statement shows ' + se('invest') + '. She enters ' + se('invest') + '.', w:'your investment, share-scheme or broker statement or app.'},
  propValue:{t:() => 'Aoife and Cian don\'t own another property. They enter €0.', w:'for a property you own, the Property Price Register or your LPT return.'},
  rentM:{t:() => 'Aoife and Cian don\'t rent out a property, so no rent comes in. They enter €0.', w:'your tenancy agreement or RTB registration.'},
  mortBal:{t:() => 'Aoife and Cian owe ' + se('mortBal') + ' on their mortgage. They enter ' + se('mortBal') + '.', w:'your annual mortgage statement or your lender\'s app.'},
  mortPayM:{t:() => 'Aoife and Cian repay ' + se('mortPayM') + ' a month. They enter ' + se('mortPayM') + '.', w:'your mortgage statement, or the direct debit on your bank statement.'},
  mortYears:{t:() => 'Aoife and Cian\'s mortgage has ' + sf('mortYears') + ' years left. They enter ' + sf('mortYears') + '.', w:'the remaining term on your annual mortgage statement.'},
  cardBal:{t:() => 'Aoife and Cian owe ' + se('cardBal') + ' on their credit card. They enter ' + se('cardBal') + '.', w:'your latest credit-card statement or banking app.'},
  cardPayM:{t:() => 'They pay ' + se('cardPayM') + ' a month off the card. They enter ' + se('cardPayM') + '.', w:'your card statement or banking app: what you actually pay.'},
  loanBal:{t:() => 'Aoife and Cian owe ' + se('loanBal') + ' on a car loan. They enter ' + se('loanBal') + '.', w:'your loan statement, credit union app or Central Credit Register report.'},
  loanPayM:{t:() => 'They repay ' + se('loanPayM') + ' a month on the car loan. They enter ' + se('loanPayM') + '.', w:'your loan agreement, or the payment on your bank statement.'},
  life:{o:YNN_O, t:() => 'Aoife has life cover, so she picks ' + sf('life') + '.', w:'your policy schedule, or HR for cover through work.'},
  ip:{o:YNN_O, t:() => 'Aoife has no income protection, so she picks ' + sf('ip') + '.', w:'your policy documents or your employer\'s benefits booklet.'},
  ci:{o:YNN_O, t:() => 'Aoife isn\'t sure about serious illness cover, so she picks ' + sf('ci') + '.', w:'your policy documents, or ask your insurer.'},
  workCover:{o:YNN_O, t:() => 'Aoife\'s job includes cover, such as death-in-service, so she picks ' + sf('workCover') + '.', w:'your employer\'s benefits booklet or HR.'},
  health:{o:YNN_O, t:() => 'Aoife and Cian have health insurance, so Aoife picks ' + sf('health') + '.', w:'your health insurer\'s renewal letter or app.'},
  pension:{t:() => 'Aoife\'s pension statement shows ' + se('pension') + '. She enters ' + se('pension') + '.', w:'your annual pension benefit statement or the provider\'s app. Add all pots together.'},
  pensionM:{t:() => se('pensionM') + ' goes into Aoife\'s pension each month, including her employer\'s share. She enters ' + se('pensionM') + '.', w:'your payslip (your share) and annual benefit statement (your employer\'s).'},
  pensionOwnM:{t:() => 'Of the ' + se('pensionM') + ', Aoife pays ' + eur(sf('pensionM') * SAMPLE_OWN_SHARE) + ' herself. She enters ' + eur(sf('pensionM') * SAMPLE_OWN_SHARE) + '.', w:'the pension deduction on your payslip.'},
  ae:{o:[['Yes', 'My Future Fund comes off your pay'], ['No', 'you\'re not enrolled'], ['Not sure', 'check your payslip']], t:() => 'Aoife already pays into a workplace pension, so she picks No.', w:'your payslip, which shows a My Future Fund deduction if you\'re enrolled.'},
  sp:{o:[['Expect full', 'about ' + RI.sp.fullYears + ' years of PRSI by ' + RI.sp.age], ['Partly', 'fewer years'], ['Not sure', 'check first']], t:() => 'Aoife expects the full rate, so she picks ' + sf('sp') + '.', w:'your PRSI record and State Pension statement on MyWelfare.ie.'},
  pSp:{o:[['Own full', 'their own full rate'], ['Own partial', 'a reduced rate'], ['Qualified adult increase', 'an addition to yours'], ['None', ''], ['Not sure', '']], t:() => 'Cian isn\'t sure of his rate yet, so Aoife picks Not sure.', w:'your partner\'s MyWelfare.ie record.'}
};
const exChoice = k => FF[k].type === 'choice' || FF[k].type === 'ynn';
function exHTML(k){ const d = FF[k], x = EXAMPLES[k]; if (!d || !x) return '';
  return '<h2 class="t" id="ex-t">Example: ' + esc(d.l) + '</h2>' + (x.o ? '<ul class="small" style="margin:0 0 8px;padding-left:18px">' + x.o.map(([o, m]) => '<li><b>' + esc(o) + '</b>' + (m ? ': ' + esc(m) : '') + '</li>').join('') + '</ul>' : '') +
    '<p class="sub" style="margin:0 0 8px" id="ex-s">' + esc(x.t()) + '</p><p class="small" style="margin:0 0 8px"><span aria-hidden="true">📍</span> <b>Where to find yours:</b> ' + esc(x.w) + '</p>' +
    (exChoice(k) ? '' : '<p class="small" style="margin:0 0 8px"><b>Nothing to add? Enter 0.</b></p>') + '<p class="small" style="margin:0 0 12px;color:var(--muted)">Example only. Not a typical or recommended amount.</p><button class="btn" data-a="closesheet">Got it</button>'; }
// Figures the engine works out from the customer's own figures (calculations, not guesses about the person)
function workedNote(k){ const F = finNums();
  if (k === 'mortPayM' && F.mortBal > 0 && F.mortPayEst && F.mortYearsKnown) return 'Worked out from your figures: about ' + eur(F.mortPayM) + ' a month, from your balance, rate and years left. Type yours to replace it.';
  if ((k === 'cardPayM' && F.cardBal > 0 && F.cardPayEst) || (k === 'loanPayM' && F.loanBal > 0 && F.loanPayEst)){ const card = k === 'cardPayM', stated = finN(k);
    return 'Worked out from your figures: ' + eur(card ? F.cardPayM : F.loanPayM) + ' a month clears it in 5 years, because ' + (stated > 0 ? 'the repayment given doesn\'t cover the interest' : 'no repayment was given') + '. Type yours to replace it.'; }
  return ''; }
const workedList = () => ['mortPayM', 'cardPayM', 'loanPayM'].map(k => [k, workedNote(k)]).filter(x => x[1]);
