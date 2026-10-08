s=open('oracle_lib.js').read()
s=s.replace("  const w = sc.wi || {};","  S.um = S.um || {}; S.um.a = S.um.a || {}; S.um.chips = [];\n  const pr = sc.prof || {}; Object.entries(pr.ans || {}).forEach(([k, v]) => { S.ans[k] = v; }); Object.entries(pr.um || {}).forEach(([k, v]) => { S.um.a[k] = v; }); S.um.chips = (pr.chips || []).slice();\n  const w = sc.wi || {};")
s=s.replace("  out.amounts = S.goals.map(g => g.amount);","""  out.amounts = S.goals.map(g => g.amount);
  { const full = umCount() === 13, r = riskRead(full), per = personality(), mt = myTerms(), sec = k => (mt.find(x => x.k === k) || {tags:[]}).tags.join('|');
    const d = new DOMParser().parseFromString(planProfileBanner(), 'text/html'), bt = d.querySelector('#r-prof > span:nth-of-type(2)');
    out.prof = {disc:discCount(), um:umCount(), full:full ? 1 : 0, personality:per ? per.name : '', label:r.label || '', level:r.level == null ? '' : r.level, want:r.want == null ? '' : r.want, can:r.can == null ? '' : r.can, time:r.time == null ? '' : r.time, limit:r.limit || '', misKey:r.misKey || '', comfort:r.comfort || '', cushion:r.cushion || '', provisional:r.provisional ? 1 : 0, banner:bt ? bt.textContent.replace(/\\s+/g, ' ').trim() : '',
      terms:{mindset:sec('mindset'), behaviour:sec('behaviour'), appetite:sec('appetite'), capacity:sec('capacity')}, suggestU9:suggestU9()}; }""")
open('oracle_lib.js','w').write(s)
m=open('make_scen.js').read()
m=m.replace("  return sc;\n}\nconst EDGE","""  // Discover and Understand Me answers (option index from 0), some left blank
  const pa = {}, pu = {}; const opt = n => Math.floor(rnd() * n);
  [['2', 4], ['4', 4], ['6', 5], ['7', 4], ['8', 4], ['9', 4], ['12', 4]].forEach(([id, n]) => { if (rnd() < .8) pa[id] = opt(n); });
  ['u4', 'u9', 'u10', 'u11', 'u12', 'u14'].forEach(u => { if (rnd() < .7) pu[u] = opt(4); });
  const chips = rnd() < .5 ? [] : pick([['None'], ['Savings account'], ['Savings account', 'None'], ['Shares or funds'], ['Shares or funds', 'Savings account'], ['Property']]);
  sc.prof = {ans:pa, um:pu, chips};
  return sc;
}
const EDGE""")
open('make_scen.js','w').write(m)
h=open('harness.py').read()
h=h.replace("    wi = sc.get('wi', {})","""    pr = sc.get('prof', {})
    for k, v in pr.get('ans', {}).items(): S('PA_' + k + '_Typed', v + 1) if False else x.setname('PA_' + k + '_Typed', v + 1)
    for k, v in pr.get('um', {}).items(): x.setname('PA_' + k + '_Typed', v + 1)
    ch = pr.get('chips', [])
    if ch:
        x.setname('PA_chipsN_Typed', len(ch)); x.setname('PA_chipShares_Typed', 'Yes' if 'Shares or funds' in ch else 'No'); x.setname('PA_chipsSafe_Typed', 'Yes' if all(c in ('None', 'Savings account') for c in ch) else 'No')
    wi = sc.get('wi', {})""")
idx=h.rindex("    if not sc.get('fill') and x.val('Missing_Count')")
h=h[:idx]+"""    P = out.get('prof')
    if P and not sc.get('fill'):
        chk = [('Prof_DiscCount', P['disc']), ('Prof_UmCount', P['um']), ('Prof_Full', P['full']), ('Prof_Personality', P['personality']), ('Prof_Label', P['label']), ('Prof_Level', P['level']), ('Prof_Limit', P['limit']), ('Prof_MisKey', P['misKey']),
               ('Prof_Comfort', P['comfort']), ('Prof_Cushion', P['cushion']), ('Prof_Provisional', P['provisional']), ('Prof_Banner', P['banner']), ('Prof_TermsMindset', P['terms']['mindset']), ('Prof_TermsBehaviour', P['terms']['behaviour']),
               ('Prof_TermsAppetite', P['terms']['appetite']), ('Prof_TermsCapacity', P['terms']['capacity']), ('Prof_Want', P['want']), ('Prof_Can', P['can']), ('Prof_Time', P['time'])]
        for nm, exp in chk:
            nm2 = {'Prof_Want': 'Prof_T', 'Prof_Can': 'Prof_C', 'Prof_Time': 'Prof_H'}.get(nm, nm)
            v = x.val(nm2); v = '' if v is None else v
            if isinstance(exp, str) and isinstance(v, str) or isinstance(exp, (int, float)) and isinstance(v, (int, float)):
                if v != exp: bad.append(('prof', nm, exp, v))
            elif not (exp == '' and v == ''): bad.append(('prof', nm, exp, v))
"""+h[idx:]
open('harness.py','w').write(h)
