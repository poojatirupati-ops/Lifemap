from ed import Ed
e = Ed()
# --- calculators: an item that is a LifeMap standard starts from the standard and never gates (§27.5); the customer's own inputs behave as before
e.rep("const calcA = (id, k) =>","// §27.5: a calculator input that is a LifeMap standard (not the customer's own figure, not a required choice)\nconst calcStdItem = s => !!s && !s.ret && ((s.a && asmKind(s.a) === 'std') || (!s.a && s.ty === 3 && !!s.sug));\nconst stdTag = (cid, k) => cid && calcStdItem(calcA(cid, k)) && !((S.calcT || {})[cid] || {})[k] ? ' <span class=\"tag pre\">' + T_SET + '</span>' : '';\nconst calcA = (id, k) =>")
e.rep("x = pre[i.k] != null ? pre[i.k] : pre[i.k] === null ? null : s ? (s.a ? aCalc(s.a, asmGet(s.a)) : tp != null ? tp : null) : i.v;","x = pre[i.k] != null ? pre[i.k] : pre[i.k] === null ? null : s ? (s.a ? aCalc(s.a, calcStdItem(s) ? asmV(s.a) : asmGet(s.a)) : tp != null ? tp : calcStdItem(s) ? s.sug() : null) : i.v;")
e.rep("(CALC_X[c.id] || []).forEach(k => { if (!asmMine(k) && !ASM[k].opt) out.push(ASM[k].n); }); return out.filter","(CALC_X[c.id] || []).forEach(k => { if (!asmMine(k) && !ASM[k].opt && !asmStd(k)) out.push(ASM[k].n); }); return out.filter")
e.rep("  if (s.ty === 3) return 'Generally the standard is ' + locFmt(s, s.sug()) + ' (' + s.by + '). Choose what you want to use.';","  if (s.ty === 3) return 'LifeMap uses ' + locFmt(s, s.sug()) + ' (' + s.by + '). Change it if you want to use your own.';")
# the assumptions block of a tool
a = e.t.index("function calcAsmBlock(c){")
b = e.t.index("const missTxt = m =>")
e.t = e.t[:a] + """function calcAsmBlock(c){ const ks = CALC_X[c.id]; if (!ks) return ''; const left = ks.filter(k => !asmMine(k) && !ASM[k].opt && !asmStd(k)), g = 'c-' + c.id;
  return '<details class="card asmg" data-g="' + g + '"' + (left.length || S.asmOpen === g ? ' open' : '') + ' style="margin-bottom:12px"><summary style="cursor:pointer;font-weight:800;min-height:44px">Assumptions this tool uses' + (left.length ? ' · ' + left.length + ' to choose' : '') + '</summary><div style="margin-top:10px">' +
    ks.map(k => asmInput(k, true)).join('') + '<p class="small" style="margin:6px 0 0">Figures tagged ' + T_SET + ' are used from the start. These are your plan-wide choices: changing one here changes it everywhere.</p></div></details>'; }
""" + e.t[b:]
# the labels
e.rep("(woC(cid, i.k) ? ' <span class=\"tag pre\">Worked out from your figures</span>' : '') + '</label>'","(woC(cid, i.k) ? ' <span class=\"tag pre\">Worked out from your figures</span>' : '') + stdTag(cid, i.k) + '</label>'")
e.rep("(v == null ? ' <span class=\"tag look\">' + (calcA(cid, i.k) ? 'Not chosen yet' : 'Not added yet') + '</span>' : '') + '</span><div class=\"chips\" role=\"group\" aria-labelledby=\"cl-' + i.k + '\">'","(v == null ? ' <span class=\"tag look\">' + (calcA(cid, i.k) ? 'Not chosen yet' : 'Not added yet') + '</span>' : '') + stdTag(cid, i.k) + '</span><div class=\"chips\" role=\"group\" aria-labelledby=\"cl-' + i.k + '\">'")
e.save()
