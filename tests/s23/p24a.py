import sys,subprocess,re
f=sys.argv[1]; s=open(f).read()
def rp(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:90]); s=s.replace(a,b)
# 1 FSEC liab + FF
rp("f:['mortBal','mortPayM','mortYears','cardBal','cardPayM','loanBal','loanPayM']}","f:['mortYN','mortBal','mortPayM','mortYears','mortRate','cardBal','cardPayM','loanBal','loanPayM']}")
rp("  mortBal:{l:'Mortgage left', type:'eur', show:mort},","  mortYN:{l:'Do you have a mortgage?', type:'choice', o:['Yes','No'], opt:1, virtual:1},\n  mortBal:{l:'Mortgage left', type:'eur', show:mort},")
rp("  mortYears:{l:'Years left', type:'num', min:1, max:40, show:mort},","  mortYears:{l:'Years left', type:'num', min:1, max:40, show:mort},\n  mortRate:{l:'Interest rate, APR % (optional)', type:'pct', opt:1, show:mort, hint:'Optional. Your statement shows it. If you leave it blank, you choose a rate in Your assumptions'},")
# derived value + sync
rp("const own = () => /^Own/.test(S.fin.home || ''), mort = () => S.fin.home === 'Own with mortgage';","const own = () => /^Own/.test(S.fin.home || ''), mort = () => S.fin.home === 'Own with mortgage';\n/* §24.1: \"Do you have a mortgage?\" is the mortgage block's first question and stays in step with Your home. Yes = Own with mortgage; No = Own outright.\n   If they rent or live with family, Yes means a mortgage on another property (added below), and Your home is left as they said it. */\nconst mortYNval = () => S.fin.home === 'Own with mortgage' ? 'Yes' : S.fin.home === 'Own outright' ? 'No' : (S.fin.mortYN || null);\nfunction setMortYN(v){ const h = S.fin.home; let ok = true;\n  if (v === 'Yes'){ if (!h || h === 'Own outright'){ ok = setManual('home', 'Own with mortgage', 'typed'); if (ok){ delete S.fin.mortYN; delete S.src.mortYN; } }\n    else if (h !== 'Own with mortgage'){ S.fin.mortYN = 'Yes'; S.src.mortYN = 'typed'; if (!LI('mort2').length){ S.lt = S.lt || {}; S.lt.mort2 = true; LI('mort2').push(newItem('mort2')); } } }\n  else { if (h === 'Own with mortgage') ok = setManual('home', 'Own outright', 'typed'); else { S.fin.mortYN = 'No'; S.src.mortYN = 'typed'; } if (ok && /^Own/.test(S.fin.home || '')){ delete S.fin.mortYN; delete S.src.mortYN; } }\n  return ok; }")
# tag
rp("function tagFor(k){ const s = S.src[k];","function tagFor(k){ const s = k === 'mortYN' ? (/^Own/.test(S.fin.home || '') ? S.src.home : S.src.mortYN) : S.src[k];")
# fieldHTML
rp("function fieldHTML(k){ const d = FF[k], v = S.fin[k];","function fieldHTML(k){ const d = FF[k], v = k === 'mortYN' ? mortYNval() : S.fin[k];")
rp("  else inp = '<div class=\"inw\">' + (d.type === 'eur' ? '<span class=\"cur\" aria-hidden=\"true\">€</span>' : '') + '<input class=\"in' + (d.type === 'eur' ? ' eur' : '') + '\" id=\"' + id + '\" inputmode=\"numeric\" data-fin=\"' + k + '\" value=\"' + (v == null ? '' : Math.round(+v)) + '\"' + (d.hint ? ' aria-describedby=\"h-' + k + '\"' : '') + '></div>';",
 "  else inp = '<div class=\"inw\">' + (d.type === 'eur' ? '<span class=\"cur\" aria-hidden=\"true\">€</span>' : '') + '<input class=\"in' + (d.type === 'eur' ? ' eur' : '') + '\" id=\"' + id + '\" inputmode=\"' + (d.type === 'pct' ? 'decimal' : 'numeric') + '\" data-fin=\"' + k + '\" value=\"' + (v == null ? '' : d.type === 'pct' ? v : Math.round(+v)) + '\"' + (d.hint ? ' aria-describedby=\"h-' + k + '\"' : '') + '>' + (d.type === 'pct' ? '<span class=\"cur\" aria-hidden=\"true\">%</span>' : '') + '</div>';")
# input handler parse pct
rp("let nv; if (d.type === 'text') nv = i.value; else { const n = parseInt(i.value.replace(/[^\\d]/g, '')); nv = isNaN(n) ? null : d.type === 'num' ? clamp(n, 0, 120) : n; }","let nv; if (d.type === 'text') nv = i.value; else if (d.type === 'pct'){ const n = parseFloat(i.value.replace(/[^\\d.]/g, '')); nv = isNaN(n) ? null : clamp(n, 0, 30); } else { const n = parseInt(i.value.replace(/[^\\d]/g, '')); nv = isNaN(n) ? null : d.type === 'num' ? clamp(n, 0, 120) : n; }")
# fchoice
rp("  fchoice:p => { const [k, v] = p.split('|'); setManual(k, v, 'typed');","  fchoice:p => { const [k, v] = p.split('|'); if (k === 'mortYN'){ if (!setMortYN(v)) toast('Your statement says how you own your home. Remove the statement to change it.'); } else { setManual(k, v, 'typed'); if (k === 'home' && /^Own/.test(v)){ delete S.fin.mortYN; delete S.src.mortYN; } }")
# LDEF mort2 etc
rp("  pens:{sec:'pension', em:'🌅', t:'Your pensions',","  mort2:{sec:'liab', em:'🏠', t:'Mortgages on other properties', one:'mortgage on another property', add:'＋ Add a mortgage on another property', f:['owed','pay','years','rate'], tot:{owed:'mort2Bal', pay:'mort2PayM', rate:'mort2Rate'}, up:'Upload this mortgage\\'s statement (optional)'},\n  pens:{sec:'pension', em:'🌅', t:'Your pensions',")
rp("  'loans.owed':{l:'Owed on this loan', type:'eur'},","  'mort2.owed':{l:'Mortgage left on this property', type:'eur'}, 'mort2.pay':{l:'Monthly repayment on this mortgage', type:'eur'}, 'mort2.years':{l:'Years left', type:'num', opt:1}, 'mort2.rate':{l:'Interest rate, APR % (optional)', type:'pct', opt:1},\n  'loans.owed':{l:'Owed on this loan', type:'eur'},")
rp("  pens:{title:'Pension statement · Jul 2025',","  mort2:{title:'Mortgage statement (other property) · Aug 2026', f:[['owed',185000,92], ['pay',950,90], ['years',18,88], ['rate',4.1,90]]},\n  pens:{title:'Pension statement · Jul 2025',")
rp("  ['cards','loans','pens'].forEach(lk => { const D = LDEF[lk],","  ['cards','loans','mort2','pens'].forEach(lk => { const D = LDEF[lk],")
rp("function ensureItem(lk){ S.lt = S.lt || {};","function ensureItem(lk){ if (lk === 'mort2') return; S.lt = S.lt || {};")
rp("function listBlock(lk){ migrateLegacy(lk); ensureItem(lk); const D = LDEF[lk], L = LI(lk),","function listBlock(lk){ migrateLegacy(lk); ensureItem(lk); const D = LDEF[lk], L = LI(lk);\n  if (lk === 'mort2' && !L.length) return '<button class=\"btn ghost sm\" style=\"width:100%;margin:0 0 12px\" data-a=\"iadd\" data-p=\"mort2\">' + esc(D.add) + '</button>';\n  const")
open(f,'w').write(s)
s=open(f).read()
# debtNums
rp("function debtNums(n){ const cR = n('cardRate') > 0 ? n('cardRate') / 100 : AS.cardRate, lR = n('loanRate') > 0 ? n('loanRate') / 100 : AS.loanRate, c = n('cardBal'), l = n('loanBal') + n('debt'), lp = n('loanPayM') + n('debtPayM'), cp = n('cardPayM');",
"""/* §24.1: a mortgage on another property is debt in the plan: it is folded into "other loans" (balance, repayment and a balance-weighted rate: the item's own rate, else the mortgage rate the customer chose). It is never the main-home mortgage, so the mortgage-free goal ignores it. */
function mort2Nums(){ let bal = 0, pay = 0, rb = 0, n = 0; (S.lists && S.lists.mort2 || []).forEach(it => { const b = hasVal(it.f.owed) ? +it.f.owed : 0; if (!(b > 0)) return; const r = hasVal(it.f.rate) && +it.f.rate > 0 ? +it.f.rate / 100 : AS.mortRate; bal += b; rb += b * r; n++;
    pay += hasVal(it.f.pay) && +it.f.pay > 0 ? +it.f.pay : mPmt(b, r, hasVal(it.f.years) && +it.f.years > 0 ? +it.f.years : 25); }); return {bal, pay, rate:bal > 0 ? rb / bal : 0, n}; }
const mort2NeedsRate = () => (S.lists && S.lists.mort2 || []).some(it => hasVal(it.f.owed) && +it.f.owed > 0 && !(hasVal(it.f.rate) && +it.f.rate > 0));
function debtNums(n){ const M2 = mort2Nums(), lR0 = n('loanRate') > 0 ? n('loanRate') / 100 : AS.loanRate, lB0 = n('loanBal') + n('debt'), cR = n('cardRate') > 0 ? n('cardRate') / 100 : AS.cardRate, lR = M2.bal > 0 ? (lB0 > 0 ? (lB0 * lR0 + M2.bal * M2.rate) / (lB0 + M2.bal) : M2.rate) : lR0, c = n('cardBal'), l = lB0 + M2.bal, lp = n('loanPayM') + n('debtPayM') + M2.pay, cp = n('cardPayM');""")
rp("need:() => S.fin.home === 'Own with mortgage' && finN('mortBal') > 0 && !(finN('mortRate') > 0), get help(){ return SG('mortRate'); }},","need:() => (S.fin.home === 'Own with mortgage' && finN('mortBal') > 0 && !(finN('mortRate') > 0)) || mort2NeedsRate(), get help(){ return SG('mortRate'); }},")
# V.P3 composition
rp("lead = sec.id === 'prot' ? '<p style=\"margin:0 0 10px\"><b>Do you have any of the following?</b></p>","lead = sec.id === 'liab' ? '<b style=\"font-size:16px\">🏠 Mortgage</b><p class=\"small\" style=\"margin:2px 0 10px\">The mortgage on the home you live in comes first.' + (S.fin.home && !own() && S.fin.mortYN === 'Yes' ? ' You said \"' + esc(S.fin.home) + '\", so this one is on another property. Add its details below.' : '') + '</p>' : sec.id === 'prot' ? '<p style=\"margin:0 0 10px\"><b>Do you have any of the following?</b></p>")
rp("(fl.length ? '</div>' : '') + (sec.id === 'liab' ? listBlock('cards') + listBlock('loans') : '') +","(sec.id === 'liab' && mort() ? '<button class=\"link\" data-a=\"upl\" data-p=\"liab\">📄 Upload your mortgage statement (optional)</button>' : '') + (fl.length ? '</div>' : '') + (sec.id === 'liab' ? '<div style=\"height:12px\"></div>' + listBlock('mort2') + listBlock('cards') + listBlock('loans') : '') +")
# EXAMPLES
rp("Object.assign(EXAMPLES, {\n  'cards.owed':","""const SAMPLE_MORT2 = {owed:185000, pay:950, years:18, rate:4.1};   // an imagined buy-to-let mortgage, for the example cards only (the sample customers don't have one)
Object.assign(EXAMPLES, {
  mortYN:{o:[['Yes', 'you owe money on the home you live in'], ['No', 'you own it outright, rent, or live with family']], t:() => 'Aoife and Cian are still paying off their home, so Aoife picks Yes.', w:'your mortgage statement, or your lender\\'s app.'},
  mortRate:{t:() => 'Their mortgage statement shows ' + +(sf('mortRate') || 3.85) + '% APR. They enter ' + +(sf('mortRate') || 3.85) + '.', w:'the interest rate (APR) on your annual mortgage statement.'},
  'mort2.owed':{t:() => 'Imagine Aoife and Cian also rented out a flat with a mortgage of ' + eur(SAMPLE_MORT2.owed) + '. They would enter ' + eur(SAMPLE_MORT2.owed) + '.', w:'your annual mortgage statement or your lender\\'s app for that property.'},
  'mort2.pay':{t:() => 'They would repay ' + eur(SAMPLE_MORT2.pay) + ' a month on the flat. They would enter ' + eur(SAMPLE_MORT2.pay) + '.', w:'that mortgage statement, or the direct debit on your bank statement.'},
  'mort2.years':{t:() => 'The flat\\'s mortgage would have ' + SAMPLE_MORT2.years + ' years left. They would enter ' + SAMPLE_MORT2.years + '.', w:'the remaining term on that mortgage statement.'},
  'mort2.rate':{t:() => 'The flat\\'s mortgage statement would show ' + SAMPLE_MORT2.rate + '% APR. They would enter ' + SAMPLE_MORT2.rate + '.', w:'the interest rate (APR) on that mortgage statement.'},
  'cards.owed':""")
rp("const DOC_HIDDEN = {liab:['mortRate','cardRate','loanRate'],","const DOC_HIDDEN = {liab:['cardRate','loanRate'],")
open(f,'w').write(s)
m=re.findall(r'<script>(.*?)</script>',s,re.S)[-1]
open('/tmp/_chk.js','w').write(m)
print(subprocess.run(['node','--check','/tmp/_chk.js'],capture_output=True,text=True).stderr[:600] or 'syntax ok')
