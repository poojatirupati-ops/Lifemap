import json
r=json.load(open('reg.json'))
G={'it':('Income tax','Revenue (revenue.ie) or the Department of Finance','Tax specialist'),
'usc':('USC','Revenue (revenue.ie)','Tax specialist'),'prsi':('PRSI','gov.ie (Department of Social Protection) or revenue.ie','Tax specialist'),
'pen':('Pensions tax','the Revenue pensions manual (revenue.ie) or the Pensions Authority','Pensions expert'),
'ae':('Auto-enrolment','gov.ie (auto-enrolment pages)','Pensions expert'),
'sp':('State Pension and benefits','gov.ie or welfare.ie (Department of Social Protection)','Pensions expert'),
'sav':('Savings and investment tax','Revenue (revenue.ie)','Tax specialist'),
'home':('Home and mortgage','the Central Bank of Ireland, Revenue or the Housing Agency','Mortgage expert'),
'infl':('Inflation','the CSO (cso.ie) HICP release','Financial planner'),'guide':('Guidance','the Central Bank of Ireland or Revenue','Financial planner')}
SEC=('noonecasey','raisin','irishtaxhub','zurich','payslipiq','inou','cantorfitzgerald','wtwco','pwc.ie','etf.ie','charteredaccountants')
def fmt(v):
    if v is None: return 'none (no suggestion shown)'
    if isinstance(v,float): return '%g'%v
    s=json.dumps(v,ensure_ascii=False); return s if len(s)<90 else s[:87]+'...'
esc=lambda x:str(x).replace('|','\\|')
rows=[]
for x in r['rules']:
    if not x['verify']: continue
    g=x['k'].split('.')[0]; name,prim,who=G.get(g,('Other','the official page','Financial planner'))
    sec=any(s in x['src'] for s in SEC)
    chk='Open '+prim+', confirm the value and its effective date'+('; the recorded source is secondary, so replace it with the official page' if sec else '')+'. Record the date checked.'
    if x['k'] in ('it.homeCarer','it.homeCarerLimit'): chk='Confirm the rate, the income limit and the taper on revenue.ie (the register says "verify"). Record the date checked.'
    if x['k']=='infl.ie': chk='Re-read the CSO HICP release before launch; it moves every month. Update value, label and date together.'
    rows.append((name,x['k'],fmt(x['v']),x['eff'],x['src'],chk,who))
srows=[]
for x in r['settings']:
    if not x['verify']: continue
    srows.append((x['n'],'Set_'+x['k'],fmt(x['v']),x['asat'] or '',x['src'],'Check the figure still matches the source and as-at date; where the source is the internal audit note, confirm the planning assumption with the Proposition & Product Manager. Customers always see the source next to it and can type their own.','Financial planner (standard), Proposition & Product Manager (sign-off)'))
nf=len([x for x in r['rules'] if not x['verify']])
md=['# Pre-release verification list','',
'Every item below is flagged "verify before release" in the prototype: the Irish rules register (`RULES_IE_2026`) and the Settings block. Prepared for journey-spec §23, 6 Oct 2026.','',
'**What this is.** The values are the best figures we had on 2 Oct 2026 (register) and the standards in the Settings block. The flag means "someone opens the primary page and records the date before launch". It does not mean the value is thought to be wrong.','',
'**Budget 2027 (announced 6 Oct 2026).** Nothing from Budget 2027 is used in any calculation, and no unconfirmed Budget 2027 figure is named in the product. Customers see "Budget 2027 changes (announced 6 Oct 2026) aren\'t included yet. We\'ll update LifeMap once they\'re final." in "What your plan assumes" and in the results footnote. The reported figures are only in `docs/budget-2027-and-ranges.md`, all marked "not confirmed". When the official documents are final: update the register in one place (`RULES_IE_2026`) and the matching workbook Assumptions cells, re-check this list, and remove the note.','',
'**Who checks.** "Suggested checker" is a suggestion by topic, not an assignment. Pooja or the Proposition & Product Manager assigns the owners.','',
'**Columns.** Item = the register key (or the Settings name in the workbook, `Set_{key}`). Value = what the prototype uses now. As at = the effective date or period the register records. Source = the page the register records. What to check = the action.','',
'**Counts.** %d register items and %d Settings standards, %d in total. Register items not flagged: %d (section C).'%(len(rows),len(srows),len(rows)+len(srows),nf),'',
'## A. Rules register (RULES_IE_2026)','','| Area | Item | Value | As at | Source (as recorded) | What to check | Suggested checker |','|---|---|---|---|---|---|---|']
md+=['| '+' | '.join(esc(c) for c in t)+' |' for t in rows]
md+=['','## B. Settings standards (Settings block, workbook sheet "Settings")','','| Standard | Workbook name | Value | As at | Source (as recorded) | What to check | Suggested checker |','|---|---|---|---|---|---|---|']
md+=['| '+' | '.join(esc(c) for c in t)+' |' for t in srows]
md+=['','## C. Not flagged','']
for x in r['rules']:
    if not x['verify']: md.append('- `%s` = %s (%s)'%(x['k'],fmt(x['v']),x['src']))
md.append('')
open('/home/user/lifegoals-prototype/docs/pre-release-verify.md','w').write('\n'.join(md))
print(len(rows),len(srows),nf)
