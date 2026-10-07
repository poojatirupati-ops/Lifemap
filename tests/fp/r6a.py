p='/home/user/lifegoals-prototype/LifeGoals-Customer-Journey-Prototype.html'; s=open(p).read()
def R(a,b,cnt=1):
    global s
    n=s.count(a)
    assert n==cnt, (n, a[:90])
    s=s.replace(a,b)
# ---- state
R("fin:{}, src:{}, conf:{}, look:{}, ack:{},", "fin:{}, src:{}, conf:{}, look:{}, ack:{}, man:{}, fix:{}, docOf:{}, calcT:{}, calcDoc:{},")
# ---- engine: finNums
R("""    mortBal:mortOn ? n('mortBal') : 0, mortPayM:mortOn ? Math.max(n('mortPayM'), annPay(n('mortBal'), AS.mortRate, n('mortYears') || 25) / 12) : 0, mortPayLow:mortOn && n('mortPayM') * 12 < annPay(n('mortBal'), AS.mortRate, n('mortYears') || 25) - 12, mortYears:mortOn ? n('mortYears') : 0, debt:n('debt'), debtPayM:n('debtPayM'),
    pension:n('pension'), pensionM:f.work !== 'Not working' && n('income') > 0 ? n('pensionM') : 0, sp:f.sp === 'Expect full' ? 1 : f.sp === 'Partly' ? 0.6 : 0.8};
}""",
"""    mortBal:mortOn ? n('mortBal') : 0, mortRate:mR, mortPayM:mortOn ? (mStated || mPmt(n('mortBal'), mR, n('mortYears') || 25)) : 0, mortPayEst:mortOn && !mStated, mortPayLow:mortOn && mStated > 0 && n('mortBal') > 0 && mStated < mPmt(n('mortBal'), mR, n('mortYears') || 25) - 1, mortYears:mortOn ? n('mortYears') : 0,
    debt:n('debt'), debtPayM:n('debt') > 0 && n('debtPayM') > n('debt') * AS.debtRate / 12 ? n('debtPayM') : mPmt(n('debt'), AS.debtRate, 5), debtPayEst:!(n('debt') > 0 && n('debtPayM') > n('debt') * AS.debtRate / 12),
    pension:n('pension'), pensionM:f.work !== 'Not working' && n('income') > 0 ? n('pensionM') : 0, penG:penGrowth(), sp:f.sp === 'Expect full' ? 1 : f.sp === 'Partly' ? 0.6 : 0.8};
}
// FP round 6: stated figures are used as stated. The mortgage repayment is the one on the statement (or typed); the standard
// formula is only an estimate when no repayment is given. Monthly amortisation, at the statement's rate when we have it.
function mPmt(bal, r, yrs){ const i = r / 12, n = Math.max(1, Math.round(yrs * 12)); return bal > 0 ? (i ? bal * i / (1 - Math.pow(1 + i, -n)) : bal / n) : 0; }
function amortYear(bal, r, payM){ let paid = 0; for (let m = 0; m < 12 && bal > 0.5; m++){ const it = bal * r / 12, p = Math.min(payM, bal + it); paid += p; bal = bal + it - p; } return {bal:Math.max(0, bal), paid}; }
// Pension growth after charges: the assumption set's rate assumes typical charges of about 1% a year; a statement's own charges replace that.
const PEN_TYP_CHG = 0.01;
function penGrowth(){ const c = S.fin && S.fin.penChg != null && S.fin.penChg !== '' && !isNaN(+S.fin.penChg) ? +S.fin.penChg / 100 : null; return c == null ? AS.pen : AS.pen + PEN_TYP_CHG - c; }
// Pension pot after y years: grows yearly, contributions rise with pay. The plan (project) and the Retirement tool both use this rule.
function pensionAt(y, pot, monthly, g, w){ for (let t = 0; t < y; t++) pot = pot * (1 + g) + monthly * 12 * Math.pow(1 + w, t); return pot; }""")
R("""  const mortOn = f.home === 'Own with mortgage';
  return {age:S.about.age,""", """  const mortOn = f.home === 'Own with mortgage', mR = n('mortRate') > 0 ? n('mortRate') / 100 : AS.mortRate, mStated = mortOn ? n('mortPayM') : 0;
  return {age:S.about.age,""")
# mortgage path + engine loop
R("const mPath = []; { let m = f.mortBal; for (let t = 0; t <= N; t++){ mPath.push(Math.max(0, m)); if (m > 1){ const pay = Math.min(f.mortPayM * 12, m * (1 + AS.mortRate)); m = m * (1 + AS.mortRate) - pay; } } }",
  "const mPath = []; { let m = f.mortBal; for (let t = 0; t <= N; t++){ mPath.push(Math.max(0, m)); if (m > 1) m = amortYear(m, f.mortRate, f.mortPayM).bal; } }")
R("  const dPay = Math.max(f.debtPayM * 12, annPay(f.debt, AS.debtRate, 5));\n", "")
R("      pen = pen * (1 + AS.pen) + contrib;", "      pen = pen * (1 + f.penG) + contrib;   // same rule as pensionAt() (Retirement tool)")
R("    if (mBal > 1 && !mfreeDone){ const pay = Math.min(f.mortPayM * 12, mBal * (1 + AS.mortRate)); fixed += pay; mBal = mBal * (1 + AS.mortRate) - pay; }\n    if (dBal > 1){ const pay = Math.min(dPay, dBal * (1 + AS.debtRate)); fixed += pay; dBal = dBal * (1 + AS.debtRate) - pay; }",
  "    if (mBal > 1 && !mfreeDone){ const y = amortYear(mBal, f.mortRate, f.mortPayM); fixed += y.paid; mBal = y.bal; }   // FP round 6: monthly, at the stated repayment\n    if (dBal > 1){ const y = amortYear(dBal, AS.debtRate, f.debtPayM); fixed += y.paid; dBal = y.bal; }")
# ---- sample data consistency
R("liab:{v:{home:['Own with mortgage',99], mortBal:[212000,96], mortPayM:[1180,93], mortYears:[21,90], debt:[2800,85], debtPayM:[140,78]}, docs:",
  "liab:{v:{home:['Own with mortgage',99], mortBal:[203700,96], mortPayM:[1180,93], mortYears:[21,90], debt:[2800,85], debtPayM:[140,78]}, hid:{mortRate:[3.85,94]}, docs:")
R("assets:{v:{cash:[14500,97], invest:[6200,88]}", "assets:{v:{cash:[9000,97], invest:[6200,88]}")
R("f:[['bal','Outstanding balance',212000,96,'€'], ['rate','Interest rate',3.85,94,'%'], ['pay','Monthly repayment',1180,93,'€'], ['yrs','Term remaining',21,90,'y']",
  "f:[['bal','Outstanding balance',203700,96,'€'], ['rate','Interest rate',3.85,94,'%'], ['pay','Monthly repayment',1180,93,'€'], ['yrs','Term remaining',21,90,'y']")
R("f:[['tot','Total value',18400,93,'€']", "f:[['tot','Total value',6200,93,'€']")
R("['proj','Projected value at retirement',310000,84,'€',1]", "['proj','Projected value at retirement',694000,84,'€',1]")
R("put('mortBal', 212000, 'doc', 96);", "put('mortBal', 203700, 'doc', 96); put('mortRate', 3.85, 'doc', 94);")
open(p,'w').write(s); print('ok')
