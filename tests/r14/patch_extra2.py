r=open('p_res.py').read()
add='''
    r += 1; sec('HOME, EXPLORE AND EXPERTS (base plan)')
    row('Home_N', 'Goals in the plan', '=SUMPRODUCT((GR_Key<>"")*1)')
    row('Home_Avg', 'Overall readiness (average % covered, rounded)', '=IF(Home_N>0,ROUND(SUM(GR_PctN)/Home_N,0),0)')
    row('Home_OnTrack', 'Goals on track (95% or more): "n of m goals on track" on Home and in the strip', '=SUMPRODUCT((GR_Key<>"")*(GR_PctN>=95))')
    row('Home_Band', 'Overall band', '=IF(Home_Avg>=PR_Good,"good",IF(Home_Avg>=PR_Nudge,"nudge","alert"))')
    row('Tools_All', 'Tools for you (ids, before the cut to 6)', '=IF(SUMPRODUCT((GR_Spec="mortgage")*1)>0,"borrow,deposit,","")&IF(SUMPRODUCT((GR_Spec="pension")*1)>0,"retirement,contrib,","")&"goalplanner,emergency,surplus,lifecover,compound"')
    row('Tools_List', 'Tools for you shown on Explore (first 6)', '=IF(LEN(Tools_All)-LEN(SUBSTITUTE(Tools_All,",",""))>=6,LEFT(Tools_All,FIND("|",SUBSTITUTE(Tools_All,",","|",6))-1),Tools_All)')
    row('Expert_Idx', 'Weakest goal (lowest %, first in the list on a tie)', '=IF(Home_N>0,MATCH(MIN(GR_PctB),GR_PctB,0),0)')
    row('Expert_Key', 'Specialist it points to', '=IF(Expert_Idx=0,"planner",INDEX(GR_Spec,Expert_Idx))')
    row('Expert_Type', 'Specialist type shown', '=IF(Expert_Key="mortgage","Mortgage expert",IF(Expert_Key="pension","Pension & retirement expert",IF(Expert_Key="protection","Protection expert",IF(Expert_Key="investment","Investment expert","Financial planner"))))')
    row('Save_SaveM_Base', 'What you save a month before any what-if', f'=ROUND(IF({c0("pos")}=1,IF({c0("work")}=1,MIN(MAX(0,{c0("base")}),{c0("net")}),{c0("net")}),0)/12,0)')
    row('Nudge_X', 'Try-this saving (a floor to 25) if it is well above what you save', '=INT(AS_SaveShare*Save_SurplusM/25)*25')
    row('Nudge_Show', 'The "you may be able to save more" nudge shows (1/0)', '=IF(AND(Nudge_X>=Save_SaveM_Base+50,Nudge_X>=IF(Has_saveM=1,In_saveM,Save_SaveM_Base)+50),1,0)')
    row('Wi_Total', 'What-if: you would save a month', '=MAX(0,Save_SaveM_Base+WI_M)')
    row('Wi_Over', 'What-if: more than your spare money (1/0)', '=IF(AND(WI_M<>0,Wi_Total>MAX(0,Save_SurplusM)+0.5),1,0)')
    r += 1; sec('THE ROAD AND THE CHART (what-if included, as on screen)')
    row('Chart_ShortYears', 'Years with a shortfall on the chart', f'=SUM({cc("chartShort")})')
    row('Chart_DipYears', 'Years using savings but not short', f'=SUM({cc("chartDip")})')
    row('Chart_FirstShortIdx', 'First short year (row)', f'=IFERROR(MATCH(1,{cc("chartShort")},0),0)')
    row('Chart_FirstShortAge', 'First shortfall at age', f'=IF(Chart_FirstShortIdx>0,F_Age+Chart_FirstShortIdx-1,"")')
    row('Chart_FirstShortAmt', 'First shortfall, about', f'=IF(Chart_FirstShortIdx>0,INDEX({cc("partsShort")},Chart_FirstShortIdx),"")')
    row('Chart_TotalShort', 'Total shortfall across the plan', f'=SUMPRODUCT({cc("chartShort")}*{cc("partsShort")})')
    row('Chart_LivingShortYears', 'Years everyday costs run short', f'=SUM({cc("livShort")})')
    row('Chart_FirstLivingAge', 'First year everyday costs run short, age', f'=IFERROR(F_Age+MATCH(1,{cc("livShort")},0)-1,"")')
    row('Road_FirstShortAge', 'The road turns coral from age', f'=IFERROR(F_Age+MATCH(1,{cc("isShort")},0)-1,"")')
    row('Road_ShortYears', 'Short years on the road', f'=SUM({cc("isShort")})')
    ws.cell(r, 2, 'Chapters (decades)').font = B
    for j, h in enumerate(['Chapter', 'Decade', 'From age', 'To age', 'Years', 'Short years', 'Dipping years', 'Average short a year', 'Weather']): ws.cell(r, 2 + j, h).font = B
    r += 1; ch0 = r
    for k in range(1, 11):
        rr = ch0 + k - 1
        n = f'COUNTIFS({cc("chapNo")},{k},{cc("active")},1)'
        vals = {2: k, 3: f'=IF({n}=0,"",INDEX({cc("dec")},MATCH({k},{cc("chapNo")},0)))', 4: f'=IF({n}=0,"",F_Age+MATCH({k},{cc("chapNo")},0)-1)', 5: f'=IF({n}=0,"",D{rr}+{n}-1)', 6: f'={n}',
                7: f'=COUNTIFS({cc("chapNo")},{k},{cc("isShort")},1)', 8: f'=COUNTIFS({cc("chapNo")},{k},{cc("dipC")},1)',
                9: f'=IF(G{rr}>0,SUMIFS({cc("shortTotal")},{cc("chapNo")},{k},{cc("isShort")},1)/G{rr},0)',
                10: f'=IF(F{rr}=0,"",IF(G{rr}>0,"storm",IF(H{rr}>F{rr}/3,"showers",IF(H{rr}>0,"partly","sun"))))'}
        for c, v in vals.items(): ws.cell(rr, c, v)
    bk.name('Chap_Dec', f"'Plan results'!$C${ch0}:$C${ch0 + 9}"); bk.name('Chap_From', f"'Plan results'!$D${ch0}:$D${ch0 + 9}"); bk.name('Chap_To', f"'Plan results'!$E${ch0}:$E${ch0 + 9}")
    bk.name('Chap_Short', f"'Plan results'!$G${ch0}:$G${ch0 + 9}"); bk.name('Chap_Dip', f"'Plan results'!$H${ch0}:$H${ch0 + 9}"); bk.name('Chap_Avg', f"'Plan results'!$I${ch0}:$I${ch0 + 9}"); bk.name('Chap_Weather', f"'Plan results'!$J${ch0}:$J${ch0 + 9}")
    r = ch0 + 11
'''
i=r.rindex("    return ws\n")
r=r[:i]+add+r[i:]
open('p_res.py','w').write(r)
# oracle + harness
o=open('oracle_lib.js').read()
o=o.replace("  out.amounts = S.goals.map(g => g.amount);","""  out.amounts = S.goals.map(g => g.amount);
  { const Pb = P0, gs = S.goals.slice(), n = gs.length, avg = n ? Math.round(gs.reduce((t, g) => t + Pb.pct[g.id], 0) / n) : 0, wk = n ? gs.slice().sort((a, b) => Pb.pct[a.id] - Pb.pct[b.id])[0] : null;
    out.home = {n, avg, ok:gs.filter(g => Pb.pct[g.id] >= 95).length, band:band(avg), tools:toolsForYou().join(','), expert:S.goals.length ? EXPERT_FOR[wk.spec] : EXPERT_FOR.planner, when:S.goals.map(g => yearsTxt(g))};
    const cur = S.saveM != null ? S.saveM : Pb.save.saveM, x = Math.floor(SAVE.share * Pb.save.surplusM / 25) * 25; out.nudge = {x, show:(x >= Pb.save.saveM + 50 && x >= cur + 50) ? 1 : 0};
    const wl = wiLive(); out.wi = {tot:wl.tot, over:wl.over ? 1 : 0, base:wl.base, sp:wl.sp};
    const rows = P.rows, sh = rows.filter(chartShort), liv = sh.filter(r => r.shortLiving > 0.5);
    out.chart = {shortYears:sh.length, dip:rows.filter(r => !chartShort(r) && rowParts(r).fromSavings > 0.5).length, firstAge:sh.length ? sh[0].a : '', firstAmt:sh.length ? rowParts(sh[0]).short : '', total:sh.reduce((t, r) => t + rowParts(r).short, 0), livYears:liv.length, livFirst:liv.length ? liv[0].a : '', roadFirst:(rows.find(isShort) || {a:''}).a, roadShort:rows.filter(isShort).length,
      parts:rows.map(r => { const p = rowParts(r); return [p.fromIncome, p.fromSavings, p.short]; })};
    out.chapters = chapters(P).map(c => { const s2 = c.rows.filter(isShort), dip = c.rows.filter(r => r.used > 1 && !isShort(r)); return {dec:c.dec, from:c.from, to:c.to, n:c.rows.length, short:s2.length, dip:dip.length, avg:s2.length ? s2.reduce((s, r) => s + r.short, 0) / s2.length : 0, wx:s2.length ? 'storm' : dip.length > c.rows.length / 3 ? 'showers' : dip.length ? 'partly' : 'sun'}; }); }""")
open('oracle_lib.js','w').write(o)
h=open('harness.py').read()
idx=h.rindex("    P = out.get('prof')")
h=h[:idx]+"""    H = out.get('home')
    if H and not out.get('wiOn'):
        for nm, k in [('Home_N', 'n'), ('Home_Avg', 'avg'), ('Home_OnTrack', 'ok'), ('Home_Band', 'band'), ('Tools_List', 'tools'), ('Expert_Type', 'expert')]:
            v = x.val(nm)
            if v != H[k]: bad.append(('home', nm, H[k], v))
        nu = out['nudge']
        if x.val('Nudge_Show') != nu['show'] or (nu['show'] and x.val('Nudge_X') != nu['x']): bad.append(('nudge', nu, x.val('Nudge_Show'), x.val('Nudge_X')))
    if H:
        for i, w in enumerate(H['when']):
            v = x.val(f'GR{i + 1}_When')
            if v != w: bad.append(('when', i, w, v))
        wi = out['wi']
        if abs(x.val('Wi_Total') - wi['tot']) > 0.01 or x.val('Wi_Over') != wi['over']: bad.append(('wilive', wi, x.val('Wi_Total'), x.val('Wi_Over')))
        C = out['chart']
        for nm, k in [('Chart_ShortYears', 'shortYears'), ('Chart_DipYears', 'dip'), ('Chart_LivingShortYears', 'livYears'), ('Road_ShortYears', 'roadShort')]:
            if x.val(nm) != C[k]: bad.append(('chart', nm, C[k], x.val(nm)))
        for nm, k in [('Chart_FirstShortAge', 'firstAge'), ('Chart_FirstLivingAge', 'livFirst'), ('Road_FirstShortAge', 'roadFirst')]:
            v = x.val(nm); v = '' if v is None else v
            if v != C[k]: bad.append(('chart', nm, C[k], v))
        for nm, k in [('Chart_FirstShortAmt', 'firstAmt'), ('Chart_TotalShort', 'total')]:
            v = x.val(nm)
            if (C[k] == '' and v != '') or (C[k] != '' and abs((v if isinstance(v, (int, float)) else 1e9) - C[k]) > 1): bad.append(('chart', nm, C[k], v))
        # year parts
        m = x.meta['C']
        for t in range(N + 1):
            for j, key in enumerate(['partsInc', 'partsSav', 'partsShort']):
                v = x.getcell(m['sheet'], f"{m['cols'][key]}{m['r0'] + t}")
                if abs(v - C['parts'][t][j]) > 1: bad.append(('parts', t, key, C['parts'][t][j], v)); break
        chs = out['chapters']
        for k, c in enumerate(chs):
            sheet = x.locate('Chap_Dec')[0]; col = lambda nm: x.locate(nm)[1].split(':')[0]
            r0 = int(x.locate('Chap_Dec')[1].replace('$', '').split(':')[0][1:])
            vals = [x.getcell(sheet, f'{L}{r0 + k}') for L in 'CDEFGHIJ']
            exp = [c['dec'], c['from'], c['to'], c['n'], c['short'], c['dip'], c['avg'], c['wx']]
            for a, b in zip(vals, exp):
                ok = (abs(a - b) < 1 if isinstance(b, (int, float)) and isinstance(a, (int, float)) else a == b)
                if not ok: bad.append(('chapter', k, exp, vals)); break
"""+h[idx:]
open('harness.py','w').write(h)
