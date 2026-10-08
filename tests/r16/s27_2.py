from ed import Ed
e = Ed()
# a field's source, with the three "assumed" figures that count as given once the customer has chosen their own
e.rep("function qualityCount(){ let n = 0; FSEC.forEach(s => s.f.forEach(k => { if (fieldVisible(k) && !FF[k].opt && !S.src[k]) n++; })); return n; }",
"""// §27: the source of a figure. A mortgage, card or loan rate chosen in Your assumptions counts as given; the other-property mortgage has no S.src (its term is read from the list)
const srcOf = k => k === 'mort2' ? (mort2NeedsTerm() ? undefined : 'typed') : S.src[k] || (['mortRate', 'cardRate', 'loanRate'].includes(k) && asmMine(k) ? 'typed' : undefined);
function qualityCount(){ let n = 0; FSEC.forEach(s => s.f.forEach(k => { if (fieldVisible(k) && !FF[k].opt && !srcOf(k)) n++; })); return n; }""")
e.rep("return fs.length && fs.every(k => !S.src[k] && !S.look[k]); }); }\nfunction roughNote","return fs.length && fs.every(k => !srcOf(k) && !S.look[k]); }); }\nfunction roughNote")
e.rep("const got = req.filter(k => S.src[k]).length;","const got = req.filter(k => srcOf(k)).length;")
e.rep("(fs.some(k => S.src[k] && S.src[k] !== 'pre') ? 'part' : 'none')","(fs.some(k => srcOf(k) && srcOf(k) !== 'pre') ? 'part' : 'none')")
e.rep("function secSummary(sec){ const fs = sec.f.filter(fieldVisible).filter(k => S.src[k]);","function secSummary(sec){ const fs = sec.f.filter(fieldVisible).filter(k => srcOf(k) && FF[k].type !== 'num' || (srcOf(k) && S.fin[k] != null));")
e.rep("const st = look ? 'look' : !src ? (FF[k].opt ? null : 'miss') : src === 'doc' ? 'ok' : 'typed';","const st = look ? 'look' : !src ? (FF[k].opt ? null : 'miss') : src === 'doc' ? 'ok' : 'typed';")
e.rep("const src = S.src[k], look = S.look[k];","const src = srcOf(k), look = S.look[k];")
e.rep("const skipped = FSEC.filter(sec => { const fs = sec.f.filter(fieldVisible); return fs.length && fs.every(k => !S.src[k] && !S.look[k]); });","const skipped = skippedSecs();")
# fields: the three assumed rates and the other-property mortgage term are counted in the details-missing banner (§27.6)
e.rep("  mortRate:{l:'Interest rate, APR % (optional)', type:'pct', opt:1, show:mort, hint:'Optional. Your statement shows it. If you leave it blank, you choose a rate in Your assumptions'},",
"""  mortRate:{l:'Interest rate, APR %', type:'pct', show:mort, hint:'Your statement shows it. If you leave it blank we use the Central Bank average and say so: "Assumed: add yours"'},""")
e.rep("  cardPayM:{l:'Credit cards: monthly repayment', type:'eur', list:1},","  cardPayM:{l:'Credit cards: monthly repayment', type:'eur', list:1},\n  cardRate:{l:'Credit cards: interest rate (APR %)', type:'pct', list:1, show:() => finN('cardBal') > 0},")
e.rep("  loanPayM:{l:'Other loans: monthly repayment', type:'eur', list:1},","  loanPayM:{l:'Other loans: monthly repayment', type:'eur', list:1},\n  loanRate:{l:'Other loans: interest rate (APR %)', type:'pct', list:1, show:() => finN('loanBal') + finN('debt') > 0},\n  mort2:{l:'Other-property mortgage: years left or repayment', type:'num', list:1, show:() => !!(S.lists && S.lists.mort2 || []).some(it => hasVal(it.f.owed) && +it.f.owed > 0)},")
e.rep("f:['mortYN','mortBal','mortPayM','mortYears','mortRate','cardBal','cardPayM','loanBal','loanPayM']}","f:['mortYN','mortBal','mortPayM','mortYears','mortRate','cardBal','cardPayM','cardRate','loanBal','loanPayM','loanRate','mort2']}")
e.save()
