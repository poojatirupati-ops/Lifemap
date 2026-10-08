import re
# 1. goal specs lookup (Plan goals table), part 4 extra columns
g=open('p_goals.py').read()
g=g.replace("    hdr(r, ['Key', 'Title', 'Default amount', 'Default years', 'Kind']); r += 1; k0 = r\n    for k, t, amt, yrs, kind in GOALKEYS:\n        for j, v in enumerate([k, t, amt, yrs, kind]): ws.cell(r, 2 + j, v)\n        r += 1",
"""    hdr(r, ['Key', 'Title', 'Default amount', 'Default years', 'Kind', 'Expert it points to']); r += 1; k0 = r
    SPEC = {'home': 'mortgage', 'retire': 'pension', 'family': 'protection', 'edu': 'planner', 'travel': 'planner', 'business': 'planner', 'mfree': 'mortgage', 'safety': 'planner', 'wealth': 'investment', 'helpfam': 'planner', 'legacy': 'planner', 'wedding': 'planner', 'car': 'planner', 'health': 'protection', 'other': 'planner'}
    for k, t, amt, yrs, kind in GOALKEYS:
        for j, v in enumerate([k, t, amt, yrs, kind, SPEC[k]]): ws.cell(r, 2 + j, v)
        r += 1""")
g=g.replace("('Goal_Kinds', 'F')]:","('Goal_Kinds', 'F'), ('Goal_Specs', 'G')]:")
open('p_goals.py','w').write(g)
rs=open('p_results.py').read()
rs=rs.replace("'Age (ties)', 'Best-strength score', 'Worst-gap score', 'Type (key)']","'Age (ties)', 'Best-strength score', 'Worst-gap score', 'Type (key)', 'Pct as a number', 'Expert it points to', 'Pct, 9999 if no goal', 'When (as on screen)']")
rs=rs.replace("                18: f'=IF(G{rr}=\"\",0,G{rr})',","""                18: f'=IF(G{rr}=\"\",0,G{rr})',
                19: f'=IF($Q{rr}="","",IFERROR(INDEX(Goal_Specs,MATCH($Q{rr},Goal_Keys,0)),""))', 20: f'=IF($Q{rr}="",9999,G{rr})',
                21: f'=IF($Q{rr}="","",IF({kind}="legacy","at the end of your plan"&IF(Has_a_planEnd=1," ("&AS_End&")",""),IF({kind}="retire",IF(Has_retireAge=1,"at "&INDEX(GL_AgeT,{i}),"at an age you haven\\'t chosen yet"),"in "&(INDEX(GL_AgeRaw,{i})-F_Age)&IF(INDEX(GL_AgeRaw,{i})-F_Age=1," year"," years"))))',""")
rs=rs.replace("('GR_PctN', 'R'),","('GR_PctN', 'R'), ('GR_Spec', 'S'), ('GR_PctB', 'T'), ('GR_When', 'U'),")
open('p_results.py','w').write(rs)
# 2. cashflow columns: chart parts, chapters
c=open('p_cash.py').read()
c=c.replace("    A('overW',","""    A('partsInc', 'Chart: from income', '=MIN({inflow},{living}+{fixed})')
    A('partsSav', 'Chart: from savings', '={used}+MAX(0,{goalCost}-{goalGap})')
    A('partsShort', 'Chart: shortfall', '={short}+{goalGap}')
    A('chartShort', 'Chart: a short year (1/0)', '=IF(AND({active}=1,{partsShort}>0.5),1,0)', width=7)
    A('chartDip', 'Chart: a year using savings, not short (1/0)', '=IF(AND({active}=1,{chartShort}=0,{partsSav}>0.5),1,0)', width=7)
    A('livShort', 'Everyday costs short (1/0)', '=IF(AND({active}=1,{short}>0.5),1,0)', width=7)
    A('dipC', 'Chapter: dipping into savings and not short (1/0)', '=IF(AND({active}=1,{used}>1,{isShort}=0),1,0)', width=7)
    A('dec', 'Chapter decade', '=IF(AND(INT({a}/10)*10=90,{t}>0),80,INT({a}/10)*10)', width=7)
    A('chapNo', 'Chapter number', '=IF({t}=0,1,IF({dec}<>{dec@-1},{chapNo@-1}+1,{chapNo@-1}))', init=0, width=7)
    A('overW',""")
open('p_cash.py','w').write(c)
